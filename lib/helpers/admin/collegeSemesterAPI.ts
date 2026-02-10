import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { supabase } from "@/lib/supabaseClient";

export type CollegeSemesterRow = {
    collegeSemesterId: number;
    collegeSemester: number;
    collegeEducationId: number;
    collegeAcademicYearId: number;
    collegeId: number;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function upsertCollegeSemesters(
    semesters: { semester: number; id?: number }[],
    context: { collegeEducationId: number; collegeAcademicYearId: number; collegeId: number; adminId: number }
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("college_semester")
        .upsert(
            semesters.map((s) => ({
                collegeSemester: s.semester,
                collegeEducationId: context.collegeEducationId,
                collegeAcademicYearId: context.collegeAcademicYearId,
                collegeId: context.collegeId,
                createdBy: context.adminId,
                createdAt: now,
                updatedAt: now,
            })),
            { onConflict: "collegeEducationId, collegeAcademicYearId, collegeSemester, collegeId" }
        )
        .select("collegeSemesterId");

    if (error) {
        console.error("upsertCollegeSemesters error:", error);
        throw error;
    }

    return data;
}

export async function fetchCollegeSemesters(
    collegeId: number,
    collegeEducationId: number,
    collegeAcademicYearId: number
) {
    const { data, error } = await supabase
        .from("college_semester")
        .select(`
      collegeSemesterId,
      collegeSemester,
      collegeEducationId,
      collegeAcademicYearId,
      collegeId,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("collegeSemester", { ascending: true });

    if (error) throw error;

    return data as CollegeSemesterRow[];
}

export async function saveCollegeSemesters(
    payload: {
        collegeSemesters: number[];
        collegeEducationId: number;
        collegeAcademicYearId: number;
        collegeId: number;
    },
    adminId: number
) {
    const now = new Date().toISOString();

    await supabase
        .from("college_semester")
        .delete()
        .eq("collegeId", payload.collegeId)
        .eq("collegeEducationId", payload.collegeEducationId)
        .eq("collegeAcademicYearId", payload.collegeAcademicYearId);

    const rows = payload.collegeSemesters.map((semester) => ({
        collegeSemester: semester,
        collegeEducationId: payload.collegeEducationId,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeId: payload.collegeId,
        createdBy: adminId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    }));

    const { error } = await supabase
        .from("college_semester")
        .insert(rows);

    if (error) throw error;

    return { success: true };
}

export async function updateCollegeSemester(
    collegeSemesterId: number,
    semester: number
) {
    const { error } = await supabase
        .from("college_semester")
        .update({
            collegeSemester: semester,
            updatedAt: new Date().toISOString(),
        })
        .eq("collegeSemesterId", collegeSemesterId)
        .is("deletedAt", null);

    if (error) {
        console.error("updateCollegeSemester error:", error);
        throw error;
    }

    return { success: true };
}

export async function deactivateCollegeSemester(
    collegeSemesterId: number
) {
    const { error } = await supabase
        .from("college_semester")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("collegeSemesterId", collegeSemesterId);

    if (error) {
        console.error("deactivateCollegeSemester error:", error);
        throw error;
    }

    return { success: true };
}

export async function fetchCollegeSemestersForLoggedInAdmin(
    userId: number,
    collegeEducationId: number,
    collegeAcademicYearId: number
) {
    const { collegeId } = await fetchAdminContext(userId);

    return fetchCollegeSemesters(collegeId, collegeEducationId, collegeAcademicYearId);
}

export async function fetchSemesterOptionsForAdmin(
    userId: number,
    collegeEducationId: number,
    collegeAcademicYearId: number
) {
    const semesters = await fetchCollegeSemestersForLoggedInAdmin(
        userId,
        collegeEducationId,
        collegeAcademicYearId
    );

    return semesters.map((s) => ({
        collegeSemesterId: s.collegeSemesterId,
        name: `Semester ${s.collegeSemester}`,
        value: s.collegeSemester,
    }));
}