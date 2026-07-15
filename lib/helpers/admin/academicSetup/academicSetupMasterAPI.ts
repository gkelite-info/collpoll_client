import { upsertCollegeBranches } from "../collegeBranchAPI";
import { saveCollegeAcademicYear } from "../collegeAcademicYearAPI";
import { saveCollegeSections } from "../collegeSectionsAPI";
import { deriveSemesters } from "../deriveSemesters";
import { saveCollegeSemesters } from "../collegeSemesterAPI";
import { supabase } from "@/lib/supabaseClient";
import { isSchoolEducation } from "./schoolHelper";

export async function saveAcademicSetupMaster(
    input: {
        educationId?: number;
        educationType: string;

        branch: {
            type: string;
            code: string;
            academicYear: string;
            sections: string[];
            batch?: string;
        };
        editDataId?: string;
    },
    context: {
        adminId: number;
        collegeId: number;
    }
) {
    try {
        const { data: education, error: eduError } = await supabase
        .from("college_education")
        .select("collegeEducationId")
        .eq("collegeId", context.collegeId)
        .eq("collegeEducationType", input.educationType)
        .eq("isActive", true)
        .is("deletedAt", null)
        .single();

    if (eduError || !education) {
        throw new Error("Education not found for this college");
    }

    const collegeEducationId = education.collegeEducationId;

    const isSchool = isSchoolEducation(input.educationType);

    let editBranchId = null;
    let editYearId = null;
    
    if (input.editDataId) {
        if (input.editDataId.startsWith("edu-")) {
            const parts = input.editDataId.split("-");
            if (parts.length >= 4 && parts[2] === "yr") {
                editYearId = parseInt(parts[3], 10);
            }
        } else {
            const parts = input.editDataId.split("-");
            editBranchId = parseInt(parts[0], 10);
            if (parts.length > 1) {
                editYearId = parseInt(parts[1], 10);
            }
        }
    }

    let collegeBranchId = null;

    if (!isSchool) {
        if (editBranchId) {
            const { error: updateErr } = await supabase.from("college_branch").update({
                collegeBranchType: input.branch.type,
                collegeBranchCode: input.branch.code,
                updatedAt: new Date().toISOString()
            }).eq("collegeBranchId", editBranchId);
            
            if (updateErr) throw new Error("Failed to update college branch");
            collegeBranchId = editBranchId;
        } else {
            const branchResult = await upsertCollegeBranches([
                {
                    type: input.branch.type,
                    code: input.branch.code,
                },
            ],
                {
                    collegeEducationId,
                    collegeId: context.collegeId,
                    adminId: context.adminId,
                }
            );

            if (!branchResult?.length) {
                throw new Error("Failed to save college branch");
            }
            
            collegeBranchId = branchResult[0].collegeBranchId;
        }
    }

    let collegeAcademicYearId = null;

    if (editYearId) {
        const { error: updateYrErr } = await supabase.from("college_academic_year").update({
            collegeAcademicYear: input.branch.academicYear.trim(),
            updatedAt: new Date().toISOString()
        }).eq("collegeAcademicYearId", editYearId);

        if (updateYrErr) throw new Error("Failed to update academic year");
        collegeAcademicYearId = editYearId;
    } else {
        const yearResult = await saveCollegeAcademicYear({
            collegeAcademicYear: input.branch.academicYear.trim(),
            collegeEducationId,
            collegeBranchId,
            collegeId: context.collegeId,
        },
            context.adminId
        );

        if (!yearResult.success || !yearResult.collegeAcademicYearId) {
            throw new Error("Failed to save academic year");
        }

        collegeAcademicYearId = yearResult.collegeAcademicYearId;
    }

    if (
        !isSchool &&
        input.branch.academicYear?.trim() &&
        input.educationType.toLowerCase() !== "inter"
    ) {
        const semesters = deriveSemesters(
            input.educationType,
            input.branch.academicYear
        );

        if (semesters.length) {
            await saveCollegeSemesters(
                {
                    collegeSemesters: semesters,
                    collegeEducationId,
                    collegeAcademicYearId,
                    collegeId: context.collegeId,
                },
                context.adminId
            );
        }
    }

    if (input.branch.sections?.length) {

        await saveCollegeSections({
            collegeSections: input.branch.sections,
            collegeEducationId,
            collegeBranchId,
            collegeAcademicYearId,
            collegeId: context.collegeId,
        },
            context.adminId
        );
    }

    const batchName = input.branch.batch ? input.branch.batch.trim() : "";

    let query = supabase
        .from("college_batches")
        .select("collegeBatchId, collegeBatchName")
        .eq("collegeId", context.collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .is("deletedAt", null);
        
    if (collegeBranchId === null) {
        query = query.is("collegeBranchId", null);
    } else {
        query = query.eq("collegeBranchId", collegeBranchId);
    }
    
    const { data: existingBatchResult } = await query.maybeSingle();
    const existingBatchData = existingBatchResult;

    if (batchName) {
        // User wants a batch assigned
        if (existingBatchData) {
            // Update only if the actual batch name string changed
            if (existingBatchData.collegeBatchName !== batchName) {
                const { error: updateError } = await supabase
                    .from("college_batches")
                    .update({
                        collegeBatchName: batchName,
                        updatedAt: new Date().toISOString()
                    })
                    .eq("collegeBatchId", existingBatchData.collegeBatchId);

                if (updateError) {
                    throw new Error("Failed to update batch details");
                }
            }
        } else {
            // Insert new batch link
            const { error: insertError } = await supabase
                .from("college_batches")
                .insert({
                    collegeBatchName: batchName,
                    collegeId: context.collegeId,
                    collegeEducationId,
                    collegeBranchId,
                    collegeAcademicYearId,
                    createdBy: context.adminId,
                    isActive: true,
                    is_deleted: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

            if (insertError) {
                throw new Error("Failed to save batch details");
            }
        }
    } else {
        // MARK: [NEW] User selected "No Batch"
        // Safely hard-delete the row. This removes the batch assignment for this year completely
        // without updating the name to "", and without leaving soft-deleted junk behind.
        if (existingBatchData) {
            const { error: deleteError } = await supabase
                .from("college_batches")
                .delete()
                .eq("collegeBatchId", existingBatchData.collegeBatchId);

            if (deleteError) {
                throw new Error("Failed to remove batch assignment");
            }
        }
        }

        return { success: true };
    } catch (err: any) {
        const errMsg = err?.message || "";
        const errCode = err?.code || "";

        if (
            errCode === "23505" || 
            errCode === "23503" || 
            errMsg.includes("foreign key constraint") || 
            errMsg.includes("unique constraint") ||
            errMsg.includes("already exists")
        ) {
            throw new Error("This academic setup is already registered or conflicts with an existing one.");
        }
        throw err;
    }
}

export async function deleteAcademicSetup(
    deleteDataId: string,
    isSchool: boolean,
    collegeId: number
) {
    let targetBranchId: number | null = null;
    let targetYearId: number | null = null;
    let targetEduId: number | null = null;

    if (isSchool) {
        const parts = deleteDataId.split("-");
        targetEduId = parseInt(parts[1], 10);
        if (parts.length > 3) {
            targetYearId = parseInt(parts[3], 10);
        }
    } else {
        const parts = deleteDataId.split("-");
        targetBranchId = parseInt(parts[0], 10);
        if (parts.length > 1) {
            targetYearId = parseInt(parts[1], 10);
        }
    }

    if (targetYearId) {
        // Dependency checks for Year
        const [studentCheck, facultyCheck] = await Promise.all([
            supabase.from("student_academic_history")
                .select("studentAcademicHistoryId")
                .eq("collegeAcademicYearId", targetYearId)
                .is("deletedAt", null)
                .limit(1),
            supabase.from("faculty_sections")
                .select("facultySectionId")
                .eq("collegeAcademicYearId", targetYearId)
                .is("deletedAt", null)
                .eq("isActive", true)
                .limit(1)
        ]);

        if (
            (studentCheck.data && studentCheck.data.length > 0) ||
            (facultyCheck.data && facultyCheck.data.length > 0)
        ) {
            return { success: false, reason: "DEPENDENCIES_EXIST" };
        }

        // Soft delete the year and its children
        const now = new Date().toISOString();
        
        const updateTasks = await Promise.all([
            supabase.from("college_academic_year")
                .update({ deletedAt: now, isActive: false })
                .eq("collegeAcademicYearId", targetYearId),
            
            supabase.from("college_sections")
                .update({ deletedAt: now, isActive: false })
                .eq("collegeAcademicYearId", targetYearId),
                
            supabase.from("college_semester")
                .update({ deletedAt: now, isActive: false })
                .eq("collegeAcademicYearId", targetYearId),
                
            supabase.from("college_batches")
                .update({ is_deleted: true, deletedAt: now, isActive: false, updatedAt: now })
                .eq("collegeAcademicYearId", targetYearId)
        ]);
        
        for (const res of updateTasks) {
            if (res.error) console.error("Error during soft delete:", res.error);
        }
        
        return { success: true };
    } else {
        // Deleting just an empty branch/education base
        if (isSchool && targetEduId) {
            // Schools don't have branches to delete here.
            return { success: true };
        } else if (!isSchool && targetBranchId) {
            // Check branch dependencies
            const [studentBranchCheck, facultyBranchCheck] = await Promise.all([
                supabase.from("students")
                    .select("studentId")
                    .eq("collegeBranchId", targetBranchId)
                    .is("deletedAt", null)
                    .limit(1),
                supabase.from("faculty")
                    .select("facultyId")
                    .eq("collegeBranchId", targetBranchId)
                    .is("deletedAt", null)
                    .limit(1)
            ]);
            
            if (
                (studentBranchCheck.data && studentBranchCheck.data.length > 0) ||
                (facultyBranchCheck.data && facultyBranchCheck.data.length > 0)
            ) {
                return { success: false, reason: "DEPENDENCIES_EXIST" };
            }

            const now = new Date().toISOString();
            await supabase.from("college_branch")
                .update({ deletedAt: now, isActive: false })
                .eq("collegeBranchId", targetBranchId);
                
            return { success: true };
        }
    }
    
    return { success: false, reason: "INVALID_ID" };
}
