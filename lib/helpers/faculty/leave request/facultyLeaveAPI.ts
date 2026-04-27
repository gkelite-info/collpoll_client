import { supabase } from "@/lib/supabaseClient";

function getOrdinalSuffix(i: number) {
  const j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) return "st";
  if (j == 2 && k != 12) return "nd";
  if (j == 3 && k != 13) return "rd";
  return "th";
}

export async function fetchStudentLeaveCounts(facultyId: number) {
  const { data, error } = await supabase
    .from("student_leaves")
    .select(`status, student_leave_faculties!inner ( facultyId )`)
    .eq("student_leave_faculties.facultyId", facultyId)
    .is("deletedAt", null);

  if (error) return { all: 0, approved: 0, pending: 0, rejected: 0 };

  const counts = { all: data.length, approved: 0, pending: 0, rejected: 0 };
  data.forEach((d) => {
    const s = d.status?.toLowerCase();
    if (s === "approved") counts.approved++;
    if (s === "pending") counts.pending++;
    if (s === "rejected") counts.rejected++;
  });
  return counts;
}

export async function fetchStudentLeavesForFaculty(
  facultyId: number,
  page: number,
  limit: number,
  statusFilter: string,
  searchQuery: string,
) {
  try {
    let query = supabase
      .from("student_leaves")
      .select(
        `
        *,
        student_leave_faculties!inner ( facultyId ),
        students (
          studentId,
          collegeBranchId,
          college_branch ( collegeBranchCode ),
         student_academic_history (
            isCurrent,
            college_semester ( collegeSemester )
          ),
          users:userId (
            fullName,
            user_profile ( profileUrl )
          )
        )
      `,
        { count: "exact" },
      )
      .eq("student_leave_faculties.facultyId", facultyId)
      .is("deletedAt", null);

    if (statusFilter !== "all") {
      query = query.eq(
        "status",
        statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1),
      );
    }

    if (searchQuery.trim() !== "") {
      query = query.ilike("description", `%${searchQuery.trim()}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order("createdAt", { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const mappedData = (data || []).map((l: any) => {
      const student = Array.isArray(l.students) ? l.students[0] : l.students;
      const branch = Array.isArray(student?.college_branch)
        ? student?.college_branch[0]
        : student?.college_branch;
      const userObj = Array.isArray(student?.users)
        ? student?.users[0]
        : student?.users;
      const profile = Array.isArray(userObj?.user_profile)
        ? userObj?.user_profile[0]
        : userObj?.user_profile;

      const historyArr = Array.isArray(student?.student_academic_history)
        ? student.student_academic_history
        : [student?.student_academic_history];

      const currentHistory = historyArr.find((h: any) => h?.isCurrent === true);
      const semNumber = currentHistory?.college_semester?.collegeSemester;

      const semString = semNumber
        ? `${semNumber}${getOrdinalSuffix(semNumber)} Semester`
        : "N/A";

      const typeLabel =
        l.leaveType === "attendanceregularization"
          ? "Attendance Regularization"
          : "Leave";

      const sDate = new Date(l.startDate);
      const eDate = new Date(l.endDate);
      const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const attachmentPaths = l.attachment ? l.attachment.split(",") : [];
      const attachments = attachmentPaths.map((path: string) => {
        const { data: urlData } = supabase.storage
          .from("leave-request-attachments")
          .getPublicUrl(path.trim());
        return urlData.publicUrl;
      });

      return {
        id: l.studentLeaveId,
        rollNo: String(student?.studentId || "N/A"),
        photo:
          profile?.profileUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userObj?.fullName || "S",
          )}&background=random&color=fff`,
        name: userObj?.fullName || "Unknown Student",
        branch: branch?.collegeBranchCode || "N/A",
        semester: semString,
        fromDate: sDate.toLocaleDateString("en-GB"),
        toDate: eDate.toLocaleDateString("en-GB"),
        days: String(days).padStart(2, "0"),
        leaveType: typeLabel,
        description: l.description?.trim() || "",
        attachments,
        status: l.status ? l.status.toLowerCase() : "pending",
      };
    });

    return { data: mappedData, totalCount: count || 0 };
  } catch (error) {
    console.error("Error fetching student leaves:", error);
    return { data: [], totalCount: 0 };
  }
}

export async function updateStudentLeaveStatus(
  leaveId: number,
  status: "Approved" | "Rejected",
) {
  const { error } = await supabase
    .from("student_leaves")
    .update({ status, updatedAt: new Date().toISOString() })
    .eq("studentLeaveId", leaveId);

  if (error) throw error;
  return { success: true };
}

export async function fetchFacultyLeaveCounts(facultyId: number) {
  const { data, error } = await supabase
    .from("faculty_leaves")
    .select(`status`)
    .eq("facultyId", facultyId)
    .is("deletedAt", null);

  if (error) return { all: 0, approved: 0, pending: 0, rejected: 0 };

  const counts = { all: data.length, approved: 0, pending: 0, rejected: 0 };
  data.forEach((d) => {
    const s = d.status?.toLowerCase();
    if (s === "approved") counts.approved++;
    if (s === "pending") counts.pending++;
    if (s === "rejected") counts.rejected++;
  });
  return counts;
}

export async function fetchFacultyLeaves(
  facultyId: number,
  page: number,
  limit: number,
  statusFilter: string,
  searchQuery: string,
) {
  let query = supabase
    .from("faculty_leaves")
    .select("*", { count: "exact" })
    .eq("facultyId", facultyId)
    .is("deletedAt", null);

  if (statusFilter !== "all") {
    query = query.eq(
      "status",
      statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1),
    );
  }

  if (searchQuery.trim() !== "") {
    query = query.ilike("description", `%${searchQuery.trim()}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.order("createdAt", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.warn(
      "faculty_leaves table might not exist yet, returning empty.",
      error,
    );
    return { data: [], totalCount: 0 };
  }

  const mappedData = (data || []).map((l: any) => {
    const sDate = new Date(l.startDate);
    const eDate = new Date(l.endDate);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      id: l.facultyLeaveId,
      fromDate: sDate.toLocaleDateString("en-GB"),
      toDate: eDate.toLocaleDateString("en-GB"),
      days: String(days).padStart(2, "0"),
      leaveType: l.leaveType || "Personal",
      description: l.description?.trim() || "",
      status: l.status ? l.status.toLowerCase() : "pending",
    };
  });

  return { data: mappedData, totalCount: count || 0 };
}

export async function submitFacultyLeaveRequest(
  facultyId: number,
  payload: any,
) {
  const { startDate, endDate, leaveType, description } = payload;
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("faculty_leaves")
    .insert({
      facultyId,
      startDate,
      endDate,
      leaveType,
      description,
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
