import { supabase } from "@/lib/supabaseClient";

// Fetch faculties currently assigned to this student's section
export async function fetchStudentFaculties(studentId: number) {
  try {
    const { data: history } = await supabase
      .from("student_academic_history")
      .select("collegeSectionsId")
      .eq("studentId", studentId)
      .eq("isCurrent", true)
      .single();

    if (!history?.collegeSectionsId) return [];

    const { data: assignments, error } = await supabase
      .from("faculty_sections")
      .select(
        `
        facultyId,
        collegeSubjectId,
        faculty (
          fullName,
          users:userId (
            user_profile ( profileUrl )
          )
        ),
        college_subjects ( subjectName )
      `,
      )
      .eq("collegeSectionsId", history.collegeSectionsId)
      .eq("isActive", true);

    if (error || !assignments) return [];

    const uniqueFaculties = new Map();
    assignments.forEach((a: any) => {
      const fac = Array.isArray(a.faculty) ? a.faculty[0] : a.faculty;
      const sub = Array.isArray(a.college_subjects)
        ? a.college_subjects[0]
        : a.college_subjects;

      let profileUrl = null;
      if (fac?.users?.user_profile) {
        const p = Array.isArray(fac.users.user_profile)
          ? fac.users.user_profile[0]
          : fac.users.user_profile;
        profileUrl = p?.profileUrl;
      }

      // Use a compound key because a faculty might teach multiple subjects
      const key = `${a.facultyId}-${a.collegeSubjectId}`;
      if (!uniqueFaculties.has(key)) {
        uniqueFaculties.set(key, {
          id: a.facultyId,
          subjectId: a.collegeSubjectId,
          name: fac?.fullName || "Unknown Faculty",
          subject: sub?.subjectName || "Unknown Subject",
          avatar:
            profileUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(fac?.fullName || "F")}&background=random&color=fff`,
        });
      }
    });

    return Array.from(uniqueFaculties.values());
  } catch (error) {
    console.error("Error fetching faculties:", error);
    return [];
  }
}

// Submit Leave Request
export async function submitLeaveRequest(studentId: number, payload: any) {
  const { startDate, endDate, leaveType, faculty, description } = payload;
  const now = new Date().toISOString();

  // Safely embed type and faculty context inside description for schema compatibility
  const finalDescription = `[Type: ${leaveType}] [Faculty: ${faculty.name} - ${faculty.subject}]\n${description}`;

  const { data, error } = await supabase
    .from("student_leaves")
    .insert({
      studentId,
      startDate,
      endDate,
      description: finalDescription,
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fetch all leave records
export async function fetchStudentLeaves(studentId: number) {
  const { data, error } = await supabase
    .from("student_leaves")
    .select("*")
    .eq("studentId", studentId)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  if (error) throw error;

  return (data || []).map((l: any) => {
    let type = "General";
    let facName = "Unknown";
    let desc = l.description || "";

    // Extract embedded data
    const typeMatch = desc.match(/\[Type:\s*(.*?)\]/);
    if (typeMatch) {
      type = typeMatch[1];
      desc = desc.replace(/\[Type:\s*.*?\]\s*/, "");
    }
    const facMatch = desc.match(/\[Faculty:\s*(.*?)\]/);
    if (facMatch) {
      facName = facMatch[1];
      desc = desc.replace(/\[Faculty:\s*.*?\]\s*/, "");
    }

    // Calculate days between dates
    const sDate = new Date(l.startDate);
    const eDate = new Date(l.endDate);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      id: l.studentLeaveId,
      fromDate: sDate.toLocaleDateString("en-GB"),
      toDate: eDate.toLocaleDateString("en-GB"),
      days: String(days).padStart(2, "0"),
      leaveType: type,
      facultyName: facName,
      description: desc.trim(),
      status: l.status ? l.status.toLowerCase() : "pending",
    };
  });
}
