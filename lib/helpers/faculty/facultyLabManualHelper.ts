import { supabase } from "@/lib/supabaseClient";

export type LabManualRow = {
    labManualId: number;
    labTitle: string;
    description: string | null;
    pdfUrl: string;
    facultyId: number;
    adminId: number | null;
    collegeSubjectId: number;
    collegeAcademicYearId: number;
    collegeSectionsId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchLabManualsForStudent(collegeSectionsId: number) {
    const { data, error } = await supabase
        .from("faculty_lab_manuals")
        .select(`
      *,
      college_subjects (subjectName, subjectCode)
    `)
        .eq("collegeSectionsId", collegeSectionsId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchLabManualsForStudent error:", error);
        return [];
    }
    return data ?? [];
}


export async function fetchLabManualsForStaff(params: {
    facultyId?: number;
    adminId?: number;
}) {
    let query = supabase
        .from("faculty_lab_manuals")
        .select(`*, college_subjects(subjectName), college_sections(collegeSections)`)
        .is("deletedAt", null);

    if (params.adminId) {
        query = query.eq("adminId", params.adminId);
    } else if (params.facultyId) {
        query = query.eq("facultyId", params.facultyId);
    }

    const { data: facultyLabManual, error: faculty_lab_manualsError } = await query.order("createdAt", { ascending: false });

    if (faculty_lab_manualsError) {
        console.error("fetchLabManualsForStaff error:", faculty_lab_manualsError);
        throw faculty_lab_manualsError;
    }

    if (!facultyLabManual) return [];

    const BUCKET = "faculty_lab_manuals";

    const withSizes = await Promise.all(
        facultyLabManual.map(async (lab) => {
            let fileSize = 0;

            try {
                const parts = lab.pdfUrl.split("/");
                const fileName = parts.pop();
                const folderPath = parts.join("/");

                const { data: files, error } = await supabase.storage
                    .from(BUCKET)
                    .list(folderPath);

                if (!error && files) {
                    const match = files.find((f) => f.name === fileName);
                    fileSize = match?.metadata?.size ?? 0;
                }
            } catch (e) {
                console.error("fileSize fetch failed:", e);
            }

            return { ...lab, fileSize };
        })
    );

    return withSizes;
}

export async function saveLabManual(
    payload: {
        labManualId?: number;
        labTitle: string;
        description?: string;
        pdfUrl: string;
        collegeSubjectId: number;
        collegeAcademicYearId: number;
        collegeSectionsId: number;
        facultyId: number;
    },
    actingUser: { id: number; role: 'admin' | 'faculty' }
) {
    const now = new Date().toISOString();

    const manualData: any = {
        labTitle: payload.labTitle.trim(),
        description: payload.description?.trim(),
        pdfUrl: payload.pdfUrl,
        collegeSubjectId: payload.collegeSubjectId,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeSectionsId: payload.collegeSectionsId,
        facultyId: payload.facultyId,
        updatedAt: now,
    };

    if (actingUser.role === 'admin') {
        manualData.adminId = actingUser.id;
    }

    if (payload.labManualId) {
        const { data, error } = await supabase
            .from("faculty_lab_manuals")
            .update(manualData)
            .eq("labManualId", payload.labManualId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } else {
        manualData.createdAt = now;
        const { data, error } = await supabase
            .from("faculty_lab_manuals")
            .insert([manualData])
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    }
}


export async function deleteLabManual(labManualId: number) {
    const { error } = await supabase
        .from("faculty_lab_manuals")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("labManualId", labManualId);

    if (error) {
        console.error("deleteLabManual error:", error);
        return { success: false, error };
    }
    return { success: true };
}


export async function getLabManualPublicUrl(path: string) {
    const { data, error } = await supabase.storage
        .from("faculty_lab_manuals")
        .createSignedUrl(path, 3600);

    if (error) {
        console.error("Error generating signed URL:", error);
        return null;
    }
    return data.signedUrl;
}


export async function uploadLabManualFile(file: File, folderName: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folderName}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('faculty_lab_manuals')
        .upload(filePath, file);

    if (error) throw error;
    return data.path;
}