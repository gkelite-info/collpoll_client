import { supabase } from "@/lib/supabaseClient";

export type SearchableUser = {
    id: string;
    roleId: string;
    name: string;
    avatar: string;
    education: string;
    role: string;
    isDisabled?: boolean;
    disabledReason?: string;
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
    limit: number = 20,
    currentClubId: number | null = null
): Promise<{ users: SearchableUser[]; hasMore: boolean }> {
    try {
        const offset = (page - 1) * limit;

        const selectQuery = `
                userId,
                fullName,
                role,
                user_profile!left(profileUrl),
                employee_ids!left(employeeId, employeeType),
                ${roleGroup === "student"
                ? `students!inner(
                    studentId, 
                    college_education!left(collegeEducationType),
                    college_branch!left(collegeBranchCode),
                    student_academic_history!left(
                        isCurrent,
                        college_academic_year!left(collegeAcademicYear)
                    ),
                    president_clubs:clubs!clubs_presidentStudentId_fkey(clubId, is_deleted),
                    vp_clubs:clubs!clubs_vicePresidentStudentId_fkey(clubId, is_deleted),
                    club_members(clubId, is_deleted, removedAt, clubs(is_deleted)),
                    club_join_requests(clubId, status, is_deleted, clubs(is_deleted))
                 )`
                : `faculty!inner(
                        facultyId, 
                        college_education!left(collegeEducationType),
                        college_branch!left(collegeBranchCode),
                        faculty_sections!left(
                            college_education!left(collegeEducationType),
                            college_branch!left(collegeBranchCode)
                        ),
                        responsible_clubs:clubs!clubs_responsibleFacultyId_fkey(clubId, is_deleted),
                        club_mentors(clubId, is_deleted, clubs(is_deleted))
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
            let isDisabled = false;
            let disabledReason = "";

            const studentRecordArray = Array.isArray(user.students) ? user.students : (user.students ? [user.students] : []);
            const facultyRecordArray = Array.isArray(user.faculty) ? user.faculty : (user.faculty ? [user.faculty] : []);

            const employeeId = Array.isArray(user.employee_ids) && user.employee_ids.length > 0 
                ? user.employee_ids[0].employeeId 
                : (user.employee_ids?.employeeId ?? "");

            if (roleGroup === "student" && studentRecordArray.length > 0) {
                const firstRecord = studentRecordArray[0];
                specificRoleId = firstRecord.studentId?.toString() ?? "";

                const eduTypes = studentRecordArray.flatMap((r: any) => 
                    Array.isArray(r.college_education) 
                        ? r.college_education.map((e: any) => e.collegeEducationType) 
                        : [r.college_education?.collegeEducationType]
                ).filter(Boolean);
                
                const branches = studentRecordArray.flatMap((r: any) => 
                    Array.isArray(r.college_branch) 
                        ? r.college_branch.map((b: any) => b.collegeBranchCode) 
                        : [r.college_branch?.collegeBranchCode]
                ).filter(Boolean);

                const eduType = [...new Set(eduTypes)].join(", ");
                const branch = [...new Set(branches)].join(", ");

                const academicHistory = firstRecord.student_academic_history ?? [];
                const currentHistory = academicHistory.find((h: any) => h?.isCurrent) ?? academicHistory[0] ?? null;
                const year = currentHistory?.college_academic_year?.collegeAcademicYear ?? "";

                let baseStr = "";
                const pinNumber = firstRecord.pinNumber || ""; // if pinNumber is fetched, fallback empty
                if (pinNumber) {
                    baseStr += `PIN :- ${pinNumber}, `;
                }

                const eduText = eduType || "-";
                const branchText = branch || "-";
                educationStr = `${baseStr}Education Type :- ${eduText}, Branch/Group :- ${branchText}`;
                if (year) educationStr += `, Year :- ${year}`;

                const pClubs = studentRecordArray.flatMap((r: any) => r.president_clubs || []);
                const vpClubs = studentRecordArray.flatMap((r: any) => r.vp_clubs || []);
                const members = studentRecordArray.flatMap((r: any) => r.club_members || []);
                const requests = studentRecordArray.flatMap((r: any) => r.club_join_requests || []);

                const activePresident = pClubs.some((c: any) => !c.is_deleted && c.clubId !== currentClubId);
                const activeVP = vpClubs.some((c: any) => !c.is_deleted && c.clubId !== currentClubId);
                const activeMember = members.some((m: any) => !m.is_deleted && !m.removedAt && m.clubs && !m.clubs.is_deleted && m.clubId !== currentClubId);
                const pendingRequest = requests.some((r: any) => !r.is_deleted && r.status === 'pending' && r.clubs && !r.clubs.is_deleted && r.clubId !== currentClubId);

                if (activePresident || activeVP || activeMember) {
                    isDisabled = true;
                    disabledReason = "Already in a club";
                } else if (pendingRequest) {
                    isDisabled = true;
                    disabledReason = "Pending request";
                }

            } else if (roleGroup === "faculty" && facultyRecordArray.length > 0) {
                const firstRecord = facultyRecordArray[0];
                specificRoleId = firstRecord.facultyId?.toString() ?? "";

                // Note: As per guidelines in lib/helpers/faculty/multiSubjectFacultyHelper.ts and 
                // lib/helpers/admin/academicSetup/schoolHelper.ts, a faculty might have multiple educations/branches 
                // assigned via the faculty_sections table instead of the main faculty table.
                // We first check the faculty table, and if it's there we collect it. Then we also collect from faculty_sections.
                const eduTypes = facultyRecordArray.flatMap((r: any) => {
                    const edus = [];
                    if (r.college_education?.collegeEducationType) edus.push(r.college_education.collegeEducationType);
                    if (Array.isArray(r.faculty_sections)) {
                        r.faculty_sections.forEach((fs: any) => {
                            if (fs.college_education?.collegeEducationType) edus.push(fs.college_education.collegeEducationType);
                        });
                    }
                    return edus;
                }).filter(Boolean);
                
                const branches = facultyRecordArray.flatMap((r: any) => {
                    const brs = [];
                    if (r.college_branch?.collegeBranchCode) brs.push(r.college_branch.collegeBranchCode);
                    if (Array.isArray(r.faculty_sections)) {
                        r.faculty_sections.forEach((fs: any) => {
                            if (fs.college_branch?.collegeBranchCode) brs.push(fs.college_branch.collegeBranchCode);
                        });
                    }
                    return brs;
                }).filter(Boolean);

                const eduType = [...new Set(eduTypes)].join(", ");
                const branch = [...new Set(branches)].join(", ");

                let baseStr = "";
                if (employeeId) {
                    baseStr += `Employee ID :- ${employeeId}, `;
                }

                const eduText = eduType || "-";
                const branchText = branch || "-";
                educationStr = `${baseStr}Education Type :- ${eduText}, Branch/Group :- ${branchText}`;

                const fClubs = facultyRecordArray.flatMap((r: any) => r.responsible_clubs || []);
                const mentors = facultyRecordArray.flatMap((r: any) => r.club_mentors || []);

                const activeResponsible = fClubs.some((c: any) => !c.is_deleted && c.clubId !== currentClubId);
                const activeMentor = mentors.some((m: any) => !m.is_deleted && m.clubs && !m.clubs.is_deleted && m.clubId !== currentClubId);

                if (activeResponsible || activeMentor) {
                    isDisabled = true;
                    disabledReason = "Assigned to a club";
                }
            }

            return {
                id: user.userId.toString(),
                roleId: specificRoleId,
                name: user.fullName,
                avatar: user.user_profile?.[0]?.profileUrl,
                education: educationStr || "Not Assigned",
                role: user.role,
                isDisabled,
                disabledReason
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
                users!inner(
                    userId, 
                    fullName, 
                    role, 
                    user_profile(profileUrl),
                    employee_ids!left(employeeId, employeeType)
                ),
                college_education(collegeEducationType),
                college_branch(collegeBranchCode)
            ),
            vicePresident:students!clubs_vicePresidentStudentId_fkey(
                studentId,
                users!inner(
                    userId, 
                    fullName, 
                    role, 
                    user_profile(profileUrl),
                    employee_ids!left(employeeId, employeeType)
                ),
                college_education(collegeEducationType),
                college_branch(collegeBranchCode)
            ),
            faculty:faculty!clubs_responsibleFacultyId_fkey(
                facultyId,
                users!inner(
                    userId, 
                    fullName, 
                    role, 
                    user_profile(profileUrl),
                    employee_ids!left(employeeId, employeeType)
                ),
                college_education(collegeEducationType),
                college_branch(collegeBranchCode),
                faculty_sections!left(
                    college_education(collegeEducationType),
                    college_branch(collegeBranchCode)
                )
            ),
            mentors:club_mentors(
                faculty(
                    facultyId,
                    users!inner(
                        userId, 
                        fullName, 
                        role, 
                        user_profile(profileUrl),
                        employee_ids!left(employeeId, employeeType)
                    ),
                    college_education(collegeEducationType),
                    college_branch(collegeBranchCode),
                    faculty_sections!left(
                        college_education(collegeEducationType),
                        college_branch(collegeBranchCode)
                    )
                )
            )
        `)
        .eq("clubId", parseInt(clubId, 10))
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const formatUser = (record: any, roleGroup: "student" | "faculty") => {
        if (!record || !record.users) return null;

        const getValues = (item: any, key: string) => Array.isArray(item) ? item.map((i: any) => i[key]).filter(Boolean).join(", ") : (item?.[key] ?? "");

        const employeeId = Array.isArray(record.users.employee_ids) && record.users.employee_ids.length > 0 
            ? record.users.employee_ids[0].employeeId 
            : (record.users.employee_ids?.employeeId ?? "");

        let eduTypes = [];
        let branches = [];

        if (roleGroup === "faculty") {
            // Reference: lib/helpers/faculty/multiSubjectFacultyHelper.ts & lib/helpers/admin/academicSetup/schoolHelper.ts
            // Faculty can have multiple educations/branches assigned via faculty_sections.
            if (record.college_education?.collegeEducationType) eduTypes.push(record.college_education.collegeEducationType);
            if (Array.isArray(record.faculty_sections)) {
                record.faculty_sections.forEach((fs: any) => {
                    if (fs.college_education?.collegeEducationType) eduTypes.push(fs.college_education.collegeEducationType);
                });
            }

            if (record.college_branch?.collegeBranchCode) branches.push(record.college_branch.collegeBranchCode);
            if (Array.isArray(record.faculty_sections)) {
                record.faculty_sections.forEach((fs: any) => {
                    if (fs.college_branch?.collegeBranchCode) branches.push(fs.college_branch.collegeBranchCode);
                });
            }
        } else {
            eduTypes = Array.isArray(record.college_education) 
                ? record.college_education.map((i: any) => i.collegeEducationType).filter(Boolean)
                : (record.college_education?.collegeEducationType ? [record.college_education.collegeEducationType] : []);
                
            branches = Array.isArray(record.college_branch) 
                ? record.college_branch.map((i: any) => i.collegeBranchCode).filter(Boolean)
                : (record.college_branch?.collegeBranchCode ? [record.college_branch.collegeBranchCode] : []);
        }

        const eduType = [...new Set(eduTypes)].join(", ");
        const branch = [...new Set(branches)].join(", ");
        
        let baseStr = "";
        const pinNumber = record.pinNumber || "";

        if (roleGroup === "faculty" && employeeId) {
            baseStr += `Employee ID :- ${employeeId}, `;
        } else if (roleGroup === "student" && pinNumber) {
            baseStr += `PIN :- ${pinNumber}, `;
        }

        const eduText = eduType || "-";
        const branchText = branch || "-";
        const educationStr = `${baseStr}Education Type :- ${eduText}, Branch/Group :- ${branchText}`;

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