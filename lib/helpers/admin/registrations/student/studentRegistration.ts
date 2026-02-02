import { supabase } from "@/lib/supabaseClient";

export type StudentStatus =
    | "Active"
    | "Promoted"
    | "Detained"
    | "Repeater"
    | "Graduated";

export type StudentEntryType =
    | "Regular"
    | "Lateral"
    | "Transfer";

export async function createStudent(
    payload: {
        userId: number;
        collegeEducationId: number;
        collegeBranchId: number;
        createdBy: number;
        entryType: "Regular" | "Lateral" | "Transfer";
        status?: "Active" | "Inactive";
        collegeId: number;
    },
    timestamp: string
): Promise<number> {
    const { data, error } = await supabase
        .from("students")
        .insert({
            ...payload,
            createdAt: timestamp,
            updatedAt: timestamp,
        })
        .select("studentId")
        .single();

    if (error || !data) {
        throw new Error("Failed to create student");
    }

    return data.studentId;
}
