import { supabase } from "@/lib/supabaseClient";


export async function getAdminClubTitleAPI(clubId: number) {
    const { data, error } = await supabase
        .from("clubs")
        .select("title")
        .eq("clubId", clubId)
        .single();

    if (error) throw new Error("Failed to fetch club title");
    return data.title;
}

export async function getAdminClubMembersAPI(
    clubId: number,
    status: string,
    page: number = 1,
    limit: number = 10,
    searchQuery: string = "",
    filters: { eduId?: number; branchId?: number; yearId?: number }
) {
    const offset = (page - 1) * limit;

    // 1. Fetch club officials (President, VP, Responsible Faculty, Mentors)
    const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select(`
            createdAt,
            president:students!clubs_presidentStudentId_fkey(
                studentId, isActive,
                users!inner(userId, fullName, role, user_profile(profileUrl), employee_ids!left(employeeId)),
                student_pins(pinNumber),
                college_education(collegeEducationId, collegeEducationType),
                college_branch(collegeBranchId, collegeBranchCode),
                student_academic_history(isCurrent, collegeAcademicYearId, college_academic_year(collegeAcademicYear))
            ),
            vicePresident:students!clubs_vicePresidentStudentId_fkey(
                studentId, isActive,
                users!inner(userId, fullName, role, user_profile(profileUrl), employee_ids!left(employeeId)),
                student_pins(pinNumber),
                college_education(collegeEducationId, collegeEducationType),
                college_branch(collegeBranchId, collegeBranchCode),
                student_academic_history(isCurrent, collegeAcademicYearId, college_academic_year(collegeAcademicYear))
            ),
            faculty:faculty!clubs_responsibleFacultyId_fkey(
                facultyId, isActive,
                users!inner(userId, fullName, role, user_profile(profileUrl), employee_ids!left(employeeId)),
                college_education(collegeEducationId, collegeEducationType),
                college_branch(collegeBranchId, collegeBranchCode),
                faculty_sections!left(
                    college_education(collegeEducationId, collegeEducationType),
                    college_branch(collegeBranchId, collegeBranchCode),
                    collegeAcademicYearId,
                    college_academic_year!left(collegeAcademicYear)
                )
            ),
            mentors:club_mentors(
                createdAt,
                faculty(
                    facultyId, isActive,
                    users!inner(userId, fullName, role, user_profile(profileUrl), employee_ids!left(employeeId)),
                    college_education(collegeEducationId, collegeEducationType),
                    college_branch(collegeBranchId, collegeBranchCode),
                    faculty_sections!left(
                        college_education(collegeEducationId, collegeEducationType),
                        college_branch(collegeBranchId, collegeBranchCode),
                        collegeAcademicYearId,
                        college_academic_year!left(collegeAcademicYear)
                    )
                )
            )
        `)
        .eq("clubId", clubId)
        .maybeSingle();

    if (clubError) console.error("Error fetching club officials", clubError);

    let allMembers: any[] = [];

    const parseOfficial = (record: any, roleGroup: "student" | "faculty", clubRole: string, joinedAt?: string) => {
        if (!record || !record.users) return null;
        
        // Status filter
        const isActive = record.isActive;
        if (status === "active" && !isActive) return null;
        if (status === "inactive" && isActive) return null;

        // Search filter
        if (searchQuery && !record.users.fullName.toLowerCase().includes(searchQuery.toLowerCase())) return null;

        let eduIds: number[] = [];
        let branchIds: number[] = [];
        let yearIds: number[] = [];
        
        let eduTypes: string[] = [];
        let branchCodes: string[] = [];
        let years: string[] = [];

        if (roleGroup === "faculty") {
            if (record.college_education?.collegeEducationType) {
                eduIds.push(record.college_education.collegeEducationId);
                eduTypes.push(record.college_education.collegeEducationType);
            }
            if (record.college_branch?.collegeBranchCode) {
                branchIds.push(record.college_branch.collegeBranchId);
                branchCodes.push(record.college_branch.collegeBranchCode);
            }
            
            if (Array.isArray(record.faculty_sections)) {
                record.faculty_sections.forEach((fs: any) => {
                    if (fs.college_education?.collegeEducationType) {
                        eduIds.push(fs.college_education.collegeEducationId);
                        eduTypes.push(fs.college_education.collegeEducationType);
                    }
                    if (fs.college_branch?.collegeBranchCode) {
                        branchIds.push(fs.college_branch.collegeBranchId);
                        branchCodes.push(fs.college_branch.collegeBranchCode);
                    }
                    if (fs.college_academic_year?.collegeAcademicYear) {
                        yearIds.push(fs.collegeAcademicYearId);
                        years.push(fs.college_academic_year.collegeAcademicYear);
                    }
                });
            }
        } else {
            const edus = Array.isArray(record.college_education) ? record.college_education : [record.college_education];
            edus.forEach((e: any) => { if(e?.collegeEducationType) { eduIds.push(e.collegeEducationId); eduTypes.push(e.collegeEducationType); } });

            const branches = Array.isArray(record.college_branch) ? record.college_branch : [record.college_branch];
            branches.forEach((b: any) => { if(b?.collegeBranchCode) { branchIds.push(b.collegeBranchId); branchCodes.push(b.collegeBranchCode); } });

            const academicHistory = record.student_academic_history || [];
            const currentHistory = academicHistory.find((h: any) => h?.isCurrent) || academicHistory[0];
            if (currentHistory?.college_academic_year?.collegeAcademicYear) {
                yearIds.push(currentHistory.collegeAcademicYearId);
                years.push(currentHistory.college_academic_year.collegeAcademicYear);
            }
        }

        // Apply filters
        if (filters.eduId && !eduIds.includes(filters.eduId)) return null;
        if (filters.branchId && !branchIds.includes(filters.branchId)) return null;
        if (filters.yearId && !yearIds.includes(filters.yearId)) return null;

        const eduTypeStr = [...new Set(eduTypes)].filter(Boolean).join(", ") || "-";
        const branchStr = [...new Set(branchCodes)].filter(Boolean).join(", ") || "-";
        const yearStr = [...new Set(years)].filter(Boolean).join(", ") || "-";

        const profileData = record.users.user_profile;
        const avatarUrl = Array.isArray(profileData) ? profileData[0]?.profileUrl : profileData?.profileUrl;
        
        let pinNumber = "N/A";
        if (roleGroup === "faculty") {
            const empData = Array.isArray(record.users.employee_ids) ? record.users.employee_ids[0] : record.users.employee_ids;
            if (empData?.employeeId) pinNumber = empData.employeeId;
        } else {
            const pinData = Array.isArray(record.student_pins) ? record.student_pins[0] : record.student_pins;
            if (pinData?.pinNumber) pinNumber = pinData.pinNumber;
        }

        let formattedDate = "-";
        if (joinedAt) {
            const d = new Date(joinedAt);
            formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }

        return {
            id: `official-${roleGroup}-${record.users.userId}-${Math.random()}`,
            userId: record.users.userId,
            studentId: roleGroup === "student" ? record.studentId : undefined,
            facultyId: roleGroup === "faculty" ? record.facultyId : undefined,
            pinNumber,
            name: record.users.fullName || "Unknown",
            avatar: avatarUrl || null,
            edu: eduTypeStr,
            branch: branchStr,
            year: yearStr,
            date: formattedDate,
            role: clubRole,
            baseRole: record.users.role,
            isOfficial: true,
            is_deleted: false
        };
    };

    if (clubData) {
        if (clubData.president) {
            const p = parseOfficial(clubData.president, "student", "President", clubData.createdAt);
            if (p) allMembers.push(p);
        }
        if (clubData.vicePresident) {
            const vp = parseOfficial(clubData.vicePresident, "student", "Vice President", clubData.createdAt);
            if (vp) allMembers.push(vp);
        }
        if (clubData.faculty) {
            const f = parseOfficial(clubData.faculty, "faculty", "Responsible Faculty", clubData.createdAt);
            if (f) allMembers.push(f);
        }
        if (clubData.mentors && Array.isArray(clubData.mentors)) {
            clubData.mentors.forEach((mentorObj: any) => {
                if (mentorObj.faculty) {
                    const m = parseOfficial(mentorObj.faculty, "faculty", "Mentor", mentorObj.createdAt);
                    if (m) allMembers.push(m);
                }
            });
        }
    }

    // Deduplicate officials
    const uniqueOfficialsMap = new Map();
    allMembers.forEach(m => {
        if (!uniqueOfficialsMap.has(m.userId)) {
            uniqueOfficialsMap.set(m.userId, m);
        }
    });
    const finalOfficials = Array.from(uniqueOfficialsMap.values());

    // Calculate unfiltered officials count
    let unfilteredOfficialsMap = new Map();
    const countOfficial = (record: any) => {
        if (!record || !record.users) return;
        const isActive = record.isActive;
        if (status === "active" && !isActive) return;
        if (status === "inactive" && isActive) return;
        unfilteredOfficialsMap.set(record.users.userId, true);
    };

    if (clubData) {
        countOfficial(clubData.president);
        countOfficial(clubData.vicePresident);
        countOfficial(clubData.faculty);
        if (clubData.mentors && Array.isArray(clubData.mentors)) {
            clubData.mentors.forEach((mentorObj: any) => countOfficial(mentorObj.faculty));
        }
    }
    const unfilteredOfficialsCount = unfilteredOfficialsMap.size;


    // 2. Fetch Regular Members
    let membersQuery = supabase
        .from("club_members")
        .select(`
            clubMemberId,
            studentId,
            joinedAt,
            removedAt,
            is_deleted,
            students!inner(
                collegeEducationId,
                collegeBranchId,
                isActive,
                users!inner(userId, fullName, role, user_profile(profileUrl)),
                student_pins(pinNumber),
                college_education(collegeEducationType),
                college_branch(collegeBranchCode),
                student_academic_history(
                    isCurrent,
                    collegeAcademicYearId,
                    college_academic_year(collegeAcademicYear)
                )
            )
        `)
        .eq("clubId", Number(clubId))
        .eq("is_deleted", false);

    if (status === "active") {
        membersQuery = membersQuery.eq("students.isActive", true);
    } else if (status === "inactive") {
        membersQuery = membersQuery.eq("students.isActive", false);
    }

    if (filters.eduId) membersQuery = membersQuery.eq("students.collegeEducationId", filters.eduId);
    if (filters.branchId) membersQuery = membersQuery.eq("students.collegeBranchId", filters.branchId);
    if (filters.yearId) membersQuery = membersQuery.eq("students.student_academic_history.collegeAcademicYearId", filters.yearId);

    if (searchQuery) {
        membersQuery = membersQuery.ilike("students.users.fullName", `%${searchQuery}%`);
    }

    membersQuery = membersQuery.order("joinedAt", { ascending: false });

    const { data: membersData, error: membersError } = await membersQuery;
    
    if (membersError) throw new Error("Failed to load club members");

    const formattedMembers = (membersData || []).map((member: any) => {
        const userNode = member.students?.users;
        const profileData = userNode?.user_profile;
        const avatarUrl = Array.isArray(profileData) ? profileData[0]?.profileUrl : profileData?.profileUrl;

        const pinData = Array.isArray(member.students?.student_pins)
            ? member.students?.student_pins[0]
            : member.students?.student_pins;
        const pinNumber = pinData?.pinNumber || "N/A";

        const edu = member.students?.college_education?.collegeEducationType || "-";
        const branch = member.students?.college_branch?.collegeBranchCode || "-";

        const academicHistory = member.students?.student_academic_history || [];
        const currentHistory = academicHistory.find((h: any) => h?.isCurrent) || academicHistory[0] || null;
        const year = currentHistory?.college_academic_year?.collegeAcademicYear || "-";

        let formattedDate = "-";

        if (member.joinedAt) {
            const d = new Date(member.joinedAt);
            formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }

        return {
            id: member.clubMemberId.toString(),
            studentId: member.studentId,
            userId: userNode?.userId,
            pinNumber: pinNumber,
            name: userNode?.fullName || "Unknown",
            avatar: avatarUrl || null,
            edu: edu,
            branch: branch,
            year: year,
            date: formattedDate,
            role: "Member",
            baseRole: userNode?.role || "Student",
            isOfficial: false,
            is_deleted: member.is_deleted
        };
    });

    // Calculate unfiltered total count
    let overallCountQuery = supabase
        .from("club_members")
        .select("clubMemberId, students!inner(isActive)", { count: "exact", head: true })
        .eq("clubId", clubId)
        .eq("is_deleted", false);

    if (status === "active") {
        overallCountQuery = overallCountQuery.eq("students.isActive", true);
    } else if (status === "inactive") {
        overallCountQuery = overallCountQuery.eq("students.isActive", false);
    }
    
    const { count: regularCount } = await overallCountQuery;
    const constantTotalCount = (regularCount || 0) + unfilteredOfficialsCount;

    // Combine and Paginate
    const allCombined = [...finalOfficials, ...formattedMembers];
    const totalCount = allCombined.length; // Filtered count for pagination
    const paginated = allCombined.slice(offset, offset + limit);

    return { members: paginated, totalCount: totalCount, overallCount: constantTotalCount };
}

// export async function removeAdminClubMembersAPI(
//     studentsData: { studentId: number; clubId: number }[],
//     adminId: number
// ) {
//     if (!studentsData || studentsData.length === 0) return;

//     const timestamp = new Date().toISOString();
//     const clubId = studentsData[0].clubId;
//     const studentIds = studentsData.map(data => data.studentId);

//     const { error: memberUpdateError } = await supabase
//         .from("club_members")
//         .update({
//             is_deleted: true,
//             removedByAdminId: adminId,
//             removedAt: timestamp,
//             deletedAt: timestamp
//         })
//         .eq("clubId", clubId)
//         .in("studentId", studentIds);

//     if (memberUpdateError) throw new Error("Failed to remove members");

//     const { error: requestUpdateError } = await supabase
//         .from("club_join_requests")
//         .update({
//             status: "rejected",
//             updatedAt: timestamp
//         })
//         .eq("clubId", clubId)
//         .in("studentId", studentIds);

//     if (requestUpdateError) console.error("Failed to sync request status to rejected.");
// }


export async function removeAdminClubMembersAPI(
    studentsData: { studentId: number; clubId: number }[],
    adminId: number
) {
    if (!studentsData || studentsData.length === 0) return;

    const timestamp = new Date().toISOString();
    const clubId = studentsData[0].clubId;
    const studentIds = studentsData.map(data => data.studentId);

    const [memberUpdate, requestUpdate] = await Promise.all([
        supabase
            .from("club_members")
            .update({
                is_deleted: true,
                removedByAdminId: adminId,
                removedAt: timestamp,
                deletedAt: timestamp
            })
            .eq("clubId", clubId)
            .in("studentId", studentIds),
            
        supabase
            .from("club_join_requests")
            .update({
                status: "rejected",
                updatedAt: timestamp
            })
            .eq("clubId", clubId)
            .in("studentId", studentIds)
    ]);

    if (memberUpdate.error) throw new Error("Failed to remove members");
    
    if (requestUpdate.error) {
        console.error("Failed to sync request status to rejected.", requestUpdate.error);
    }
}