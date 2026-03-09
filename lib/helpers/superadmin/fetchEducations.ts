import { getEducations } from "./educationalTypeAPI";

export type EducationDropdown = {
    educationId: number;
    educationName: string;
};

export async function getEducationDropdown() {
    try {
        const educations = await getEducations();

        return {
            success: true as const,
            data: educations.map((e) => ({
                educationId: e.educationId,
                educationName: e.educationName,
            })),
        };
    } catch (err: any) {
        return {
            success: false as const,
            error: err.message || "Failed to fetch educations",
        };
    }
}