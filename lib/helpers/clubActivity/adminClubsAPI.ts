import { supabase } from "@/lib/supabaseClient";

export type SearchableUser = {
    id: string;
    roleId: string;
    name: string;
    avatar: string;
    education: string;
    role: string;
};

export type ClubPayload = {
    title: string;
    imageUrl: string | null;
    presidentStudentId: number;
    vicePresidentStudentId: number;
    responsibleFacultyId: number;
    collegeId: number;
    createdBy: number;
    mentorFacultyIds: number[];
};

export async function getSearchableUsers(
    collegeId: number,
    roleGroup: "student" | "faculty",
    searchQuery: string = "",
    page: number = 1,
    limit: number = 20
): Promise<{ users: SearchableUser[]; hasMore: boolean }> {
    try {
        const offset = (page - 1) * limit;

        const selectQuery = `
                userId,
                fullName,
                role,
                user_profile!left(profileUrl),
                ${roleGroup === "student"
                ? `students!inner(
                    studentId, 
                    college_education!left(collegeEducationType),
                    college_branch!left(collegeBranchCode),
                    student_academic_history!left(
                        isCurrent,
                        college_academic_year!left(collegeAcademicYear)
                    )
                 )`
                : `faculty!inner(
              facultyId, 
              college_education!left(collegeEducationType),
              college_branch!left(collegeBranchCode)
            )`
            }
        `;

        let query = supabase
            .from("users")
            .select(selectQuery)
            .eq("collegeId", collegeId)
            .eq("isActive", true)
            .eq("is_deleted", false);

        if (roleGroup === "student") {
            query = query.eq("role", "Student");
        } else if (roleGroup === "faculty") {
            query = query.eq("role", "Faculty");
        }

        if (searchQuery) {
            query = query.ilike("fullName", `%${searchQuery}%`);
        }

        query = query.order("fullName", { ascending: true }).range(offset, offset + limit - 1);
        const { data, error } = await query;

        if (error) {
            console.error("Error fetching searchable users:", error);
            return { users: [], hasMore: false };
        }

        const users: SearchableUser[] = data.map((user: any) => {
            let educationStr = "";
            let specificRoleId = "";

            const studentRecord = user.students ?? null;
            const facultyRecord = user.faculty ?? null;

            if (roleGroup === "student" && studentRecord) {
                specificRoleId = studentRecord?.studentId?.toString() ?? "";

                const eduType = studentRecord?.college_education?.collegeEducationType ?? "";
                const branch = studentRecord?.college_branch?.collegeBranchCode ?? "";
                const academicHistory = studentRecord?.student_academic_history ?? [];
                const currentHistory = academicHistory.find((h: any) => h?.isCurrent) ?? academicHistory[0] ?? null;
                const year = currentHistory?.college_academic_year?.collegeAcademicYear ?? "";
                const eduBranch = [eduType, branch].filter(Boolean).join(" ");

                educationStr = eduBranch && year
                    ? `${eduBranch} - ${year}`
                    : eduBranch || "Not Assigned";

            } else if (roleGroup === "faculty" && facultyRecord) {
                specificRoleId = facultyRecord?.facultyId?.toString() ?? "";

                const eduType = facultyRecord?.college_education?.collegeEducationType ?? "";
                const branch = facultyRecord?.college_branch?.collegeBranchCode ?? "";

                educationStr = [eduType, branch].filter(Boolean).join(" ") || "Not Assigned";
            }

            return {
                id: user.userId.toString(),
                roleId: specificRoleId,
                name: user.fullName,
                avatar: user.user_profile?.[0]?.profileUrl,
                education: educationStr || "Not Assigned",
                role: user.role
            };
        });

        return { users, hasMore: data.length === limit };

    } catch (error) {
        console.error("Unexpected error in getSearchableUsers:", error);
        return { users: [], hasMore: false };
    }
}

// async function uploadClubLogo(file: File, collegeId: number): Promise<string> {
//     const fileExt = file.name.split('.').pop();
//     const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
//     const filePath = `clubs/${collegeId}/${fileName}`;

//     const { data, error: uploadError } = await supabase.storage
//         .from("club_profile")
//         .upload(filePath, file);

//     if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

//     const { data: urlData } = supabase.storage.from("club_profile").getPublicUrl(filePath);
//     return urlData.publicUrl;
// }

async function uploadClubLogo(file: File, collegeId: number, clubId?: number): Promise<string> {
    let fileExt = file.type.split('/')[1] || 'webp';
    if (fileExt === 'svg+xml') fileExt = 'svg'; 
    
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const folder = clubId ? clubId.toString() : 'new';
    const filePath = `clubs/${collegeId}/${folder}/${fileName}`;

    let attempt = 0;
    const maxAttempts = 2;
    let lastError: any = null;

    while (attempt < maxAttempts) {
        try {
            const { data, error: uploadError } = await supabase.storage
                .from("club_profile")
                .upload(filePath, file, {
                    contentType: file.type,
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from("club_profile").getPublicUrl(filePath);
            return urlData.publicUrl;
            
        } catch (error) {
            lastError = error;
            attempt++;
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    throw new Error("Failed to upload image. Please try again.");
}

async function deleteImageByUrl(url: string) {
    try {
        const path = url.split('/public/club_profile/')[1];
        if (path) {
            await supabase.storage.from("club_profile").remove([path]);
        }
    } catch (e) {
        console.error("Cleanup failed", e);
    }
}

export async function createClub(
    payload: Omit<ClubPayload, 'imageUrl'>,
    imageFile?: File | null
) {
    const now = new Date().toISOString();
    let uploadedUrl: string | null = null;

    try {
        if (imageFile) {
            uploadedUrl = await uploadClubLogo(imageFile, payload.collegeId);
        }

        const { data: club, error: clubError } = await supabase
            .from("clubs")
            .insert({
                title: payload.title,
                imageUrl: uploadedUrl,
                presidentStudentId: payload.presidentStudentId,
                vicePresidentStudentId: payload.vicePresidentStudentId,
                responsibleFacultyId: payload.responsibleFacultyId,
                collegeId: payload.collegeId,
                createdBy: payload.createdBy,
                createdAt: now,
                updatedAt: now,
                is_deleted: false
            })
            .select("clubId")
            .single();

        if (clubError) throw clubError;

        if (payload.mentorFacultyIds.length > 0) {
            const mentorsToInsert = payload.mentorFacultyIds.map(facultyId => ({
                clubId: club.clubId,
                facultyId: facultyId,
                createdAt: now,
                updatedAt: now,
            }));
            const { error: mentorError } = await supabase.from("club_mentors").insert(mentorsToInsert);
            if (mentorError) throw mentorError;
        }
        return club;

    } catch (error) {
        if (uploadedUrl) await deleteImageByUrl(uploadedUrl);
        throw error;
    }
}

export async function updateClub(
    clubId: number,
    payload: Omit<ClubPayload, 'imageUrl' | 'createdBy'>,
    imageFile?: File | null,
    retainedImageUrl?: string | null,
    originalImageUrl?: string | null
) {
    const now = new Date().toISOString();
    let finalImageUrl = retainedImageUrl || null;

    try {
        if (imageFile) {
            finalImageUrl = await uploadClubLogo(imageFile, payload.collegeId, clubId);
        }

        const { error: clubError } = await supabase
            .from("clubs")
            .update({
                title: payload.title,
                imageUrl: finalImageUrl,
                presidentStudentId: payload.presidentStudentId,
                vicePresidentStudentId: payload.vicePresidentStudentId,
                responsibleFacultyId: payload.responsibleFacultyId,
                updatedAt: now,
            })
            .eq("clubId", clubId);

        if (clubError) throw clubError;

        const { error: deleteError } = await supabase
            .from("club_mentors")
            .delete()
            .eq("clubId", clubId);

        if (deleteError) throw deleteError;

        if (payload.mentorFacultyIds.length > 0) {
            const mentorsToInsert = payload.mentorFacultyIds.map(facultyId => ({
                clubId: clubId,
                facultyId: facultyId,
                createdAt: now,
                updatedAt: now,
                is_deleted: false
            }));

            const { error: mentorError } = await supabase.from("club_mentors").insert(mentorsToInsert);
            if (mentorError) throw mentorError;
        }

        if (originalImageUrl && (imageFile || retainedImageUrl === null)) {
            await deleteImageByUrl(originalImageUrl);
        }

        return true;
    } catch (error) {
        if (imageFile && finalImageUrl && finalImageUrl !== originalImageUrl) {
            await deleteImageByUrl(finalImageUrl);
        }
        throw error;
    }
}

export async function deleteClubAPI(clubId: number) {
    const now = new Date().toISOString();
    const { error } = await supabase
        .from("clubs")
        .update({
            is_deleted: true,
            deletedAt: now,
            updatedAt: now
        })
        .eq("clubId", clubId);

    if (error) throw error;
    return true;
}


export async function getAllClubsAPI(collegeId: number, page: number = 1, limit: number = 15) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase
        .from("clubs")
        .select(`
            clubId,
            title,
            imageUrl,
            createdBy,
            president:students!clubs_presidentStudentId_fkey(isActive),
            vicePresident:students!clubs_vicePresidentStudentId_fkey(isActive),
            faculty:faculty!clubs_responsibleFacultyId_fkey(isActive),
            mentors:club_mentors(faculty(isActive)),
            members:club_members(is_deleted, students(isActive))
        `, { count: 'exact' })
        .eq("collegeId", collegeId)
        .eq("is_deleted", false)
        .order("createdAt", { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error fetching clubs:", error);
        throw error;
    }

    const formattedData = data.map((club: any) => {
        let activeCount = 0;
        let inactiveCount = 0;

        const checkStatus = (entity: any) => {
            if (!entity) return;
            if (entity.isActive) activeCount++;
            else inactiveCount++;
        };

        checkStatus(club.president);
        checkStatus(club.vicePresident);
        checkStatus(club.faculty);
        if (club.mentors) {
            club.mentors.forEach((m: any) => checkStatus(m.faculty));
        }

        if (club.members) {
            club.members.forEach((member: any) => {
                if (member.is_deleted === false) {
                    checkStatus(member.students);
                }
            });
        }

        return {
            id: club.clubId.toString(),
            name: club.title,
            logo: club.imageUrl,
            createdBy: club.createdBy,
            active: activeCount,
            inactive: inactiveCount
        };
    });

    return {
        data: formattedData,
        total: count || 0
    };
}

export async function getClubByIdAPI(clubId: string): Promise<any> {
    const { data, error } = await supabase
        .from("clubs")
        .select(`
            clubId,
            title,
            imageUrl,
            president:students!clubs_presidentStudentId_fkey(
                studentId,
                users!inner(userId, fullName, role, user_profile(profileUrl)),
                college_education(collegeEducationType),
                college_branch(collegeBranchCode)
            ),
            vicePresident:students!clubs_vicePresidentStudentId_fkey(
                studentId,
                users!inner(userId, fullName, role, user_profile(profileUrl)),
                college_education(collegeEducationType),
                college_branch(collegeBranchCode)
            ),
            faculty:faculty!clubs_responsibleFacultyId_fkey(
                facultyId,
                users!inner(userId, fullName, role, user_profile(profileUrl)),
                college_education(collegeEducationType),
                college_branch(collegeBranchCode)
            ),
            mentors:club_mentors(
                faculty(
                    facultyId,
                    users!inner(userId, fullName, role, user_profile(profileUrl)),
                    college_education(collegeEducationType),
                    college_branch(collegeBranchCode)
                )
            )
        `)
        .eq("clubId", parseInt(clubId, 10))
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const formatUser = (record: any, roleGroup: "student" | "faculty") => {
        if (!record || !record.users) return null;

        const eduType = record.college_education?.collegeEducationType ?? "";
        const branch = record.college_branch?.collegeBranchCode ?? "";
        const educationStr = [eduType, branch].filter(Boolean).join(" ") || "Not Assigned";

        return {
            id: record.users.userId.toString(),
            roleId: roleGroup === "student" ? record.studentId.toString() : record.facultyId.toString(),
            name: record.users.fullName,
            avatar: record.users.user_profile?.[0]?.profileUrl || null,
            education: educationStr,
            role: record.users.role
        };
    };

    return {
        title: data.title,
        logoUrl: data.imageUrl,
        president: formatUser(data.president, "student"),
        vicePresident: formatUser(data.vicePresident, "student"),
        faculty: formatUser(data.faculty, "faculty"),
        mentors: data.mentors
            .map((m: any) => formatUser(m.faculty, "faculty"))
            .filter(Boolean)
    };
}