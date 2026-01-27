import { supabase } from "@/lib/supabaseClient";

export async function fetchFacultyContext(userId: number) {
    const { data: faculty, error } = await supabase
        .from("faculty")
        .select(`
            facultyId,
            collegeId,
            role,
            departments,
            subjects,
            sections,
            degrees,
            years
        `)
        .eq("userId", userId)
        .is("deletedAt", null)
        .single();

    if (error) throw error;

    const { data: college, error: collegeErr } = await supabase
        .from("colleges")
        .select("collegePublicId")
        .eq("collegeId", faculty.collegeId)
        .single();

    if (collegeErr) throw collegeErr;

    return {
        facultyId: faculty.facultyId,
        collegeId: faculty.collegeId,
        collegePublicId: college.collegePublicId,
        role: faculty.role,
        departments: faculty.departments,
        subjects: faculty.subjects,
        sections: faculty.sections,
        degrees: faculty.degrees,
        years: faculty.years,
    };
}
