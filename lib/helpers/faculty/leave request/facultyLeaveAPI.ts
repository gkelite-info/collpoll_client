import { supabase } from "@/lib/supabaseClient";
import {
  createEmployeeLeaveRequest,
  fetchEmployeeLeaveRequestCounts,
  fetchPaginatedEmployeeLeaveRequests,
<<<<<<< Updated upstream
  fetchPaginatedTaggedEmployeeLeaveRequests,
  fetchTaggedEmployeeLeaveRequestCounts,
=======
>>>>>>> Stashed changes
} from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestAPI";

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
          student_pins ( pinNumber ),
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      const currentHistory = historyArr.find(
        (h: { isCurrent?: boolean } | null | undefined) =>
          h?.isCurrent === true,
      );
      const semNumber = currentHistory?.college_semester?.collegeSemester;

      const semString = semNumber
        ? `${semNumber}${getOrdinalSuffix(semNumber)} Semester`
        : "N/A";

      const pinNumber = Array.isArray(student?.student_pins)
        ? student?.student_pins[0]?.pinNumber
        : student?.student_pins?.pinNumber;

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
        rollNo: pinNumber || "N/A",
        photo: profile?.profileUrl || null,
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
  try {
    const scope = await getFacultyEmployeeLeaveScope(facultyId);
    const counts = await fetchEmployeeLeaveRequestCounts({
      userId: scope.userId,
      collegeId: scope.collegeId,
      role: "Faculty",
    });

    return {
      all: counts.total,
      approved: counts.approved,
      pending: counts.pending,
      rejected: counts.rejected,
    };
  } catch (error) {
    console.error("Error fetching faculty employee leave counts:", error);
    return { all: 0, approved: 0, pending: 0, rejected: 0 };
  }
<<<<<<< Updated upstream
}

export async function fetchFacultyTaggedLeaveCounts(facultyId: number) {
  try {
    const scope = await getFacultyEmployeeLeaveScope(facultyId);
    const counts = await fetchTaggedEmployeeLeaveRequestCounts({
      taggedUserId: scope.userId,
      collegeId: scope.collegeId,
    });

    return {
      all: counts.total,
      approved: counts.approved,
      pending: counts.pending,
      rejected: counts.rejected,
    };
  } catch (error) {
    console.error("Error fetching faculty tagged leave counts:", error);
    return { all: 0, approved: 0, pending: 0, rejected: 0 };
  }
=======
>>>>>>> Stashed changes
}

export async function fetchFacultyLeaves(
  facultyId: number,
  page: number,
  limit: number,
  statusFilter: string,
  searchQuery: string,
) {
  try {
    const scope = await getFacultyEmployeeLeaveScope(facultyId);
    const { data, totalCount } = await fetchPaginatedEmployeeLeaveRequests({
      userId: scope.userId,
      collegeId: scope.collegeId,
      role: "Faculty",
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter as "approved" | "pending" | "rejected"),
      page,
      pageSize: limit,
      search: searchQuery,
    });

    const mappedData = data.map((leave) => {
      const days = calculateLeaveDays(leave.leaveFromDate, leave.leaveToDate);

      return {
        id: leave.employeeLeaveRequestId,
        employeeLeaveRequestId: leave.employeeLeaveRequestId,
        employeeId: leave.employee?.employeeId ?? String(leave.employeeId),
        name: leave.user?.fullName ?? "Faculty",
        role: titleCase(leave.role),
        photo: leave.user?.profileUrl ?? "",
        requestedDate: formatLeaveDate(leave.createdAt.slice(0, 10)),
        fromDate: formatLeaveDate(leave.leaveFromDate),
        toDate: formatLeaveDate(leave.leaveToDate),
        days: String(days).padStart(2, "0"),
        leaveType: titleCase(leave.leaveType || "Personal"),
        description: leave.description?.trim() || "",
        status: leave.status ? leave.status.toLowerCase() : "pending",
      };
    });

    return { data: mappedData, totalCount };
  } catch (error) {
    console.error("Error fetching faculty employee leaves:", error);
    return { data: [], totalCount: 0 };
  }
}

<<<<<<< Updated upstream
export async function fetchFacultyTaggedLeaves(
  facultyId: number,
  page: number,
  limit: number,
  statusFilter: string,
  searchQuery: string,
) {
  try {
    const scope = await getFacultyEmployeeLeaveScope(facultyId);
    const { data, totalCount } = await fetchPaginatedTaggedEmployeeLeaveRequests({
      taggedUserId: scope.userId,
      collegeId: scope.collegeId,
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter as "approved" | "pending" | "rejected"),
      page,
      pageSize: limit,
      search: searchQuery,
    });

    const mappedData = data.map((leave) => {
      const days = calculateLeaveDays(leave.leaveFromDate, leave.leaveToDate);

      return {
        id: leave.employeeLeaveRequestId,
        employeeLeaveRequestId: leave.employeeLeaveRequestId,
        employeeId: leave.employee?.employeeId ?? String(leave.employeeId),
        name: leave.user?.fullName ?? "Employee",
        role: titleCase(leave.role),
        photo: leave.user?.profileUrl ?? "",
        requestedDate: formatLeaveDate(leave.createdAt.slice(0, 10)),
        fromDate: formatLeaveDate(leave.leaveFromDate),
        toDate: formatLeaveDate(leave.leaveToDate),
        days: String(days).padStart(2, "0"),
        leaveType: titleCase(leave.leaveType || "Personal"),
        description: leave.description?.trim() || "",
        status: leave.status ? leave.status.toLowerCase() : "pending",
      };
    });

    return { data: mappedData, totalCount };
  } catch (error) {
    console.error("Error fetching faculty tagged employee leaves:", error);
    return { data: [], totalCount: 0 };
  }
}

=======
>>>>>>> Stashed changes
type FacultyLeaveRequestPayload = {
  startDate: string;
  endDate: string;
  leaveType: string;
  description: string;
<<<<<<< Updated upstream
  tags?: import("@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestTagsAPI").EmployeeLeaveTagSelection[];
=======
>>>>>>> Stashed changes
};

export async function submitFacultyLeaveRequest(
  facultyId: number,
  payload: FacultyLeaveRequestPayload,
) {
  const { startDate, endDate, leaveType, description } = payload;
  const scope = await getFacultyEmployeeLeaveScope(facultyId);

  return createEmployeeLeaveRequest({
    userId: scope.userId,
    collegeId: scope.collegeId,
    role: "Faculty",
    leaveType,
    leaveFromDate: startDate,
    leaveToDate: endDate,
    description,
<<<<<<< Updated upstream
    tags: payload.tags,
=======
>>>>>>> Stashed changes
  });
}

async function getFacultyEmployeeLeaveScope(facultyId: number) {
  const { data, error } = await supabase
    .from("faculty")
    .select("userId, collegeId")
    .eq("facultyId", facultyId)
    .eq("isActive", true)
    .maybeSingle();

  if (error) throw error;
  if (!data?.userId || !data?.collegeId) {
    throw new Error("Faculty context not found.");
  }

  return {
    userId: data.userId as number,
    collegeId: data.collegeId as number,
  };
}

const formatLeaveDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB");

const calculateLeaveDays = (fromDate: string, toDate: string) => {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  const diff = Math.max(0, to.getTime() - from.getTime());
  return Math.floor(diff / 86_400_000) + 1;
};

const titleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
