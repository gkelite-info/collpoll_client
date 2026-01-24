import { saveCollegeEducation } from "../academicEducationAPI";
import { upsertCollegeBranches } from "../collegeBranchAPI";
import { saveCollegeAcademicYear } from "../collegeAcademicYearAPI";
import { saveCollegeSections, SectionItem } from "../collegeSectionsAPI";
import { generateUUID } from "@/lib/helpers/generateUUID";

export async function saveAcademicSetupMaster(
    input: {
        educationId?: number;
        educationType: string;

        branch: {
            type: string;
            code: string;
            academicYear: string;
            sections: SectionItem[];
        };
    },
    context: {
        adminId: number;
        collegeId: number;
    }
) {
    const eduResult = await saveCollegeEducation(
        {
            id: input.educationId,
            collegeEducationType: input.educationType,
            collegeId: context.collegeId,
        },
        context.adminId
    );

    if (!eduResult.success || !eduResult.collegeEducationId) {
        throw new Error("Failed to save college education");
    }

    const collegeEducationId = eduResult.collegeEducationId;

    const branchResult = await upsertCollegeBranches(
        [
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

    const yearResult = await saveCollegeAcademicYear(
        {
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

    if (input.branch.sections?.length) {

        await saveCollegeSections(
            {
                collegeSections: input.branch.sections,
                collegeEducationId,
                collegeBranchId,
                collegeAcademicYearId,
                collegeId: context.collegeId,
            },
            context.adminId
        );
    }

    return { success: true };
}
