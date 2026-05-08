import { upsertCollegeBranches } from "../collegeBranchAPI";
import { saveCollegeAcademicYear } from "../collegeAcademicYearAPI";
import { saveCollegeSections } from "../collegeSectionsAPI";
import { deriveSemesters } from "../deriveSemesters";
import { saveCollegeSemesters } from "../collegeSemesterAPI";
import { supabase } from "@/lib/supabaseClient";

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
    },
    context: {
        adminId: number;
        collegeId: number;
    }
) {

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

    const collegeBranchId = branchResult[0].collegeBranchId;

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

    const collegeAcademicYearId = yearResult.collegeAcademicYearId;

    if (
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

    if (input.branch.batch?.trim()) {
        const batchName = input.branch.batch.trim();

        const { data: existingBatch } = await supabase
            .from("college_batches")
            .select("collegeBatchId")
            .eq("collegeId", context.collegeId)
            .eq("collegeEducationId", collegeEducationId)
            .eq("collegeBranchId", collegeBranchId)
            .eq("collegeAcademicYearId", collegeAcademicYearId)
            .eq("collegeBatchName", batchName)
            .is("deletedAt", null)
            .maybeSingle();

        if (existingBatch) {
            const { error: updateError } = await supabase
                .from("college_batches")
                .update({ updatedAt: new Date().toISOString() })
                .eq("collegeBatchId", existingBatch.collegeBatchId);

            if (updateError) {
                console.error("Batch update error:", updateError);
                throw new Error("Failed to update batch details");
            }
        } else {
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
                console.error("Batch insert error:", insertError);
                throw new Error("Failed to save batch details");
            }
        }
    }

    return { success: true };
}
