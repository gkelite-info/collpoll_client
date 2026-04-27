import { supabase } from "@/lib/supabaseClient";

// ... (fetchStudentFaculties remains completely unchanged) ...
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

// 🟢 UPDATED: Strict error handling and explicit upload options
export async function submitLeaveRequest(studentId: number, payload: any) {
  const { startDate, endDate, leaveType, faculty, description, files } =
    payload;
  const now = new Date().toISOString();

  let attachmentPaths: string[] = [];

  // Upload files to Supabase Storage if present
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      // Generates a short, clean path to save varchar space
      const fileName = `${studentId}/${Date.now()}_${i}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("leave-request-attachments")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true, // 🟢 Bypasses strict pre-flight SELECT existence checks
        });

      // 🟢 STRICT ERROR CATCHING: Now you will see why it fails if it does
      if (error) {
        console.error("Supabase Storage Upload Error:", error);
        throw new Error(`File upload failed: ${error.message}`);
      }

      if (data) {
        attachmentPaths.push(data.path);
      }
    }
  }

  // Convert array of paths to comma-separated string
  const attachmentString =
    attachmentPaths.length > 0 ? attachmentPaths.join(",") : null;

  const { data: leaveData, error: leaveError } = await supabase
    .from("student_leaves")
    .insert({
      studentId,
      leaveType,
      startDate,
      endDate,
      description: description.trim(),
      attachment: attachmentString, // 🟢 Saved to DB column
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (leaveError) throw leaveError;

  const { error: bridgeError } = await supabase
    .from("student_leave_faculties")
    .insert({
      studentLeaveId: leaveData.studentLeaveId,
      facultyId: faculty.id,
      createdAt: now,
      updatedAt: now,
    });

  if (bridgeError) throw bridgeError;

  return leaveData;
}

export async function fetchStudentLeaveCounts(studentId: number) {
  const { data, error } = await supabase
    .from("student_leaves")
    .select(`status`)
    .eq("studentId", studentId)
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

// 🟢 UPDATED: Mapping attachments to Public URLs
export async function fetchStudentLeaves(
  studentId: number,
  page: number,
  limit: number,
  statusFilter: string,
  searchQuery: string,
) {
  let query = supabase
    .from("student_leaves")
    .select(
      `
      *,
      student_leave_faculties (
        faculty ( fullName )
      )
    `,
      { count: "exact" },
    )
    .eq("studentId", studentId)
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
    const typeLabel =
      l.leaveType === "attendanceregularization"
        ? "Attendance Regularization"
        : "Leave";

    let desc = l.description || "";

    let facName = "Unknown";
    if (l.student_leave_faculties && l.student_leave_faculties.length > 0) {
      const bridge = l.student_leave_faculties[0];
      const facData = Array.isArray(bridge.faculty)
        ? bridge.faculty[0]
        : bridge.faculty;
      facName = facData?.fullName || "Unknown Faculty";
    }

    const sDate = new Date(l.startDate);
    const eDate = new Date(l.endDate);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // 🟢 Generate public URLs for attachments
    const attachmentPaths = l.attachment ? l.attachment.split(",") : [];
    const attachments = attachmentPaths.map((path: string) => {
      const { data: urlData } = supabase.storage
        .from("leave-request-attachments")
        .getPublicUrl(path.trim());
      return urlData.publicUrl;
    });

    return {
      id: l.studentLeaveId,
      fromDate: sDate.toLocaleDateString("en-GB"),
      toDate: eDate.toLocaleDateString("en-GB"),
      days: String(days).padStart(2, "0"),
      leaveType: typeLabel,
      facultyName: facName,
      description: desc.trim(),
      attachments, // 🟢 Passed to UI
      status: l.status ? l.status.toLowerCase() : "pending",
    };
  });

  return { data: mappedData, totalCount: count || 0 };
}
