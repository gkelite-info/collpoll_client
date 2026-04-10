import { supabase } from "@/lib/supabaseClient";

// ==========================================
// INTERFACES
// ==========================================
export interface ReminderFilters {
  searchTerm?: string;
  educationType?: string;
  branch?: string;
  year?: string;
  sem?: string;
  duePeriod?: string;
}

export interface SendReminderPayload {
  collegeId: number;
  studentIds: number[];
  variant: "student" | "faculty";
  notifyStudents: boolean;
  notifyParents: boolean;
  viaInApp: boolean;
  viaEmail: boolean;
}

export interface ScheduleReminderPayload extends SendReminderPayload {
  runAt: string;
}

export async function fetchReminderJobsHistory(collegeId: number) {
  try {
    const { data, error } = await supabase
      .from("fee_reminder_jobs")
      .select(
        `
        feeRemainderJobId,
        variant,
        notifyStudents,
        notifyParents,
        viaInApp,
        viaEmail,
        viaSms,
        runAt,
        status,
        createdAt,
        fee_reminder_job_students (count)
      `,
      )
      .eq("collegeId", collegeId)
      .order("runAt", { ascending: false });

    if (error) throw error;

    return data.map((job: any) => ({
      jobId: job.feeRemainderJobId,
      variant: job.variant,
      targets:
        [
          job.notifyStudents ? "Students" : null,
          job.notifyParents ? "Parents" : null,
        ]
          .filter(Boolean)
          .join(" & ") || (job.variant === "faculty" ? "Faculty" : "N/A"),
      channels: [
        job.viaInApp ? "In-App" : null,
        job.viaEmail ? "Email" : null,
        job.viaSms ? "SMS" : null,
      ]
        .filter(Boolean)
        .join(", "),
      studentCount: job.fee_reminder_job_students?.[0]?.count || 0,
      runAt: job.runAt,
      status: job.status,
      createdAt: job.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching reminder history:", error);
    return [];
  }
}

// ==========================================
// NOTIFICATION & QUEUE PROCESSORS
// ==========================================

export async function processFeeReminders(payload: SendReminderPayload) {
  try {
    let usersData: { userId: number; email: string; fullName: string }[] = [];

    if (payload.variant === "student") {
      if (payload.notifyStudents) {
        const { data: studentUsers } = await supabase
          .from("students")
          .select("userId, users!inner(email, fullName)")
          .in("studentId", payload.studentIds);

        studentUsers?.forEach((s: any) => {
          usersData.push({
            userId: s.userId,
            email: s.users.email,
            fullName: s.users.fullName,
          });
        });
      }

      if (payload.notifyParents) {
        const { data: parentUsers } = await supabase
          .from("parents")
          .select("userId, users!inner(email, fullName)")
          .in("studentId", payload.studentIds);

        parentUsers?.forEach((p: any) => {
          usersData.push({
            userId: p.userId,
            email: p.users.email,
            fullName: p.users.fullName,
          });
        });
      }
    } else if (payload.variant === "faculty") {
      const { data: history } = await supabase
        .from("student_academic_history")
        .select("collegeSectionsId")
        .in("studentId", payload.studentIds)
        .eq("isCurrent", true);

      const sectionIds =
        history?.map((h) => h.collegeSectionsId).filter(Boolean) || [];

      if (sectionIds.length > 0) {
        const { data: facultySecs } = await supabase
          .from("faculty_sections")
          .select("faculty!inner(userId, users!inner(email, fullName))")
          .in("collegeSectionsId", sectionIds)
          .eq("isActive", true);

        facultySecs?.forEach((fs: any) => {
          usersData.push({
            userId: fs.faculty.userId,
            email: fs.faculty.users.email,
            fullName: fs.faculty.users.fullName,
          });
        });
      }
    }

    const uniqueUsers = Array.from(
      new Map(usersData.map((item) => [item.userId, item])).values(),
    );
    if (uniqueUsers.length === 0) return { success: true, count: 0 };

    const now = new Date().toISOString();
    const title = "Fee Payment Reminder";
    const emailHtmlBody =
      payload.variant === "student"
        ? `<h3>Dear Parent/Student,</h3><p>This is a gentle reminder regarding the payment of the current semester fees. Please clear your dues at the earliest.</p><br/><p>— College Finance Office</p>`
        : `<h3>Dear Faculty Advisor,</h3><p>This is to inform you that a fee payment reminder has been sent to students under your mentorship who currently have pending dues.</p><br/><p>— Accounts & Finance Office</p>`;

    const inAppMessage =
      payload.variant === "student"
        ? "Your fee payment for the current semester is pending. Please clear your dues at the earliest."
        : "Fee reminders have been sent out to students under your mentorship with pending dues.";

    if (payload.viaInApp) {
      const notificationsToInsert = uniqueUsers.map((user) => ({
        userId: user.userId,
        title: title,
        message: inAppMessage,
        type: "FeeReminder", // MAKE SURE THIS ENUM EXISTS IN YOUR DB!
        isRead: false,
        createdAt: now,
        updatedAt: now,
      }));
      await supabase.from("notifications").insert(notificationsToInsert);
    }

    if (payload.viaEmail) {
      const emailsToInsert = uniqueUsers.map((user) => ({
        userId: user.userId,
        email: user.email,
        subject: title,
        body: emailHtmlBody,
        status: "pending",
        isRead: false,
        senderName: "College Finance Office",
        createdAt: now,
        updatedAt: now,
      }));
      await supabase.from("email_queue").insert(emailsToInsert);

      const emailsToFire = uniqueUsers.map((u) => u.email);
      if (emailsToFire.length > 0) {
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/finance/send-reminders`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: emailsToFire,
                subject: title,
                html: emailHtmlBody,
              }),
            },
          );
        } catch (e) {
          console.error("Immediate email API dispatch failed:", e);
        }
      }
    }

    return { success: true, count: uniqueUsers.length };
  } catch (error) {
    console.error("Error processing fee reminders:", error);
    return { success: false, error };
  }
}

export async function executeDirectFeeReminder(payload: SendReminderPayload) {
  try {
    const processResult = await processFeeReminders(payload);
    if (!processResult.success) return processResult;

    const now = new Date().toISOString();

    const { data: jobData, error: jobError } = await supabase
      .from("fee_reminder_jobs")
      .insert({
        collegeId: payload.collegeId,
        variant: payload.variant,
        notifyStudents: payload.notifyStudents,
        notifyParents: payload.notifyParents,
        viaInApp: payload.viaInApp,
        viaEmail: payload.viaEmail,
        viaSms: false,
        runAt: now,
        status: "completed",
        createdAt: now,
        updatedAt: now,
      })
      .select("feeRemainderJobId")
      .single();

    if (jobError) {
      console.error("Error logging direct job:", jobError);
      return { success: false, error: jobError };
    }

    const studentRows = payload.studentIds.map((id) => ({
      feeRemainderJobId: jobData.feeRemainderJobId,
      studentId: id,
      status: "sent",
      sentAt: now,
      createdAt: now,
      updatedAt: now,
    }));

    const { error: studentsError } = await supabase
      .from("fee_reminder_job_students")
      .insert(studentRows);

    if (studentsError) {
      console.error("Error logging direct job students:", studentsError);
      return { success: false, error: studentsError };
    }

    return { success: true, count: processResult.count };
  } catch (error: any) {
    console.error("Direct Send Error:", error);
    return {
      success: false,
      error: { message: error.message || "Unknown error" },
    };
  }
}

export async function scheduleFeeReminders(payload: ScheduleReminderPayload) {
  try {
    const { runAt, studentIds, ...jobConfig } = payload;
    const now = new Date().toISOString();

    const { data: jobData, error: jobError } = await supabase
      .from("fee_reminder_jobs")
      .insert({
        collegeId: jobConfig.collegeId,
        variant: jobConfig.variant,
        notifyStudents: jobConfig.notifyStudents,
        notifyParents: jobConfig.notifyParents,
        viaInApp: jobConfig.viaInApp,
        viaEmail: jobConfig.viaEmail,
        viaSms: false,
        runAt: runAt,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      })
      .select("feeRemainderJobId")
      .single();

    if (jobError) throw jobError;

    const studentRows = studentIds.map((id) => ({
      feeRemainderJobId: jobData.feeRemainderJobId,
      studentId: id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    }));

    const { error: studentsError } = await supabase
      .from("fee_reminder_job_students")
      .insert(studentRows);

    if (studentsError) throw studentsError;

    return { success: true };
  } catch (error) {
    console.error("Error scheduling fee reminder:", error);
    return { success: false, error };
  }
}

/**
 * 5. Fetch Faculty for Selected Students (Including Profile Pictures)
 */
export async function fetchFacultyForStudents(studentIds: number[]) {
  if (!studentIds || studentIds.length === 0) return [];
  try {
    // 1. Get the active sections for these students
    const { data: history } = await supabase
      .from("student_academic_history")
      .select("collegeSectionsId")
      .in("studentId", studentIds)
      .eq("isCurrent", true);

    const sectionIds =
      history?.map((h) => h.collegeSectionsId).filter(Boolean) || [];
    if (sectionIds.length === 0) return [];

    // 2. Find the faculty assigned to those sections AND fetch their profileUrl
    const { data: facultyData, error } = await supabase
      .from("faculty_sections")
      .select(
        `
        faculty!inner(
          facultyId, 
          users!inner(
            fullName,
            user_profile(profileUrl)
          )
        )
      `,
      )
      .in("collegeSectionsId", sectionIds)
      .eq("isActive", true);

    if (error) {
      console.error("Error fetching faculty data:", error);
      return [];
    }

    // 3. Deduplicate faculty and map the avatar
    const uniqueFaculty = new Map();
    facultyData?.forEach((f: any) => {
      const fac = f.faculty;
      if (!uniqueFaculty.has(fac.facultyId)) {
        // Supabase often returns joined tables as arrays, so we extract the first item if it exists
        const profileRecord = Array.isArray(fac.users.user_profile)
          ? fac.users.user_profile[0]
          : fac.users.user_profile;

        uniqueFaculty.set(fac.facultyId, {
          facultyId: fac.facultyId,
          name: fac.users.fullName,
          // Use the fetched profile URL, or fallback to the default image if null/missing
          avatar: profileRecord?.profileUrl || "/faculty.png",
        });
      }
    });

    return Array.from(uniqueFaculty.values());
  } catch (error) {
    console.error("Error fetching faculty for students:", error);
    return [];
  }
}

// ==========================================
// INTERFACES
// ==========================================
export interface ReminderFilters {
  searchTerm?: string;
  educationType?: string;
  branch?: string;
  year?: string;
  sem?: string;
  duePeriod?: string;
}

export interface SendReminderPayload {
  collegeId: number;
  studentIds: number[];
  variant: "student" | "faculty";
  notifyStudents: boolean;
  notifyParents: boolean;
  viaInApp: boolean;
  viaEmail: boolean;
}

export interface ScheduleReminderPayload extends SendReminderPayload {
  runAt: string;
}

// ==========================================
// UTILITIES
// ==========================================
function determineYearFromSem(sem: string | number): string {
  const semNum = Number(sem);
  if (isNaN(semNum)) return "N/A";
  const yearNum = Math.ceil(semNum / 2);

  if (yearNum === 1) return "1st";
  if (yearNum === 2) return "2nd";
  if (yearNum === 3) return "3rd";
  return `${yearNum}th`;
}

// ==========================================
// DASHBOARD FETCHERS
// ==========================================

export async function fetchReminderFilterOptions(collegeId: number) {
  try {
    const [eduData, branchData, semData] = await Promise.all([
      supabase
        .from("college_education")
        .select("collegeEducationType")
        .eq("collegeId", collegeId)
        .eq("isActive", true),
      supabase
        .from("college_branch")
        .select("collegeBranchCode")
        .eq("collegeId", collegeId)
        .eq("isActive", true),
      supabase
        .from("college_semester")
        .select("collegeSemester")
        .eq("collegeId", collegeId)
        .eq("isActive", true),
    ]);

    const educationTypes = [
      "All",
      ...Array.from(
        new Set(eduData.data?.map((e) => e.collegeEducationType) || []),
      ),
    ];
    const branches = [
      "All",
      ...Array.from(
        new Set(branchData.data?.map((b) => b.collegeBranchCode) || []),
      ),
    ];
    const rawSems = Array.from(
      new Set(semData.data?.map((s) => s.collegeSemester) || []),
    ).sort((a, b) => a - b);
    const sems = ["All", ...rawSems.map(String)];

    return { educationTypes, branches, sems };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return { educationTypes: ["All"], branches: ["All"], sems: ["All"] };
  }
}

export async function fetchPaymentReminderStats(collegeId: number) {
  try {
    const { data: structures } = await supabase
      .from("college_fee_structure")
      .select("collegeSessionId, collegeBranchId, collegeEducationId, dueDate")
      .eq("collegeId", collegeId)
      .eq("isActive", true);

    const dueDatesMap = new Map();
    structures?.forEach((st) => {
      const key = `${st.collegeSessionId}-${st.collegeBranchId}-${st.collegeEducationId}`;
      dueDatesMap.set(key, new Date(st.dueDate));
    });

    const { data: obligations, error: obsError } = await supabase
      .from("student_fee_obligation")
      .select(
        `
        studentFeeObligationId,
        totalAmount,
        collegeSessionId,
        collegeBranchId,
        collegeEducationId,
        student_fee_ledger (amount),
        students!inner (collegeId)
      `,
      )
      .eq("isActive", true)
      .eq("students.collegeId", collegeId);

    if (obsError) throw obsError;

    let totalStudentsWithDues = 0;
    let overdueMoreThan30Days = 0;
    const today = new Date();

    obligations?.forEach((ob) => {
      const totalPaid =
        ob.student_fee_ledger?.reduce(
          (sum: number, l: any) => sum + Number(l.amount),
          0,
        ) || 0;
      const amountDue = Number(ob.totalAmount) - totalPaid;

      if (amountDue > 0) {
        totalStudentsWithDues++;
        const key = `${ob.collegeSessionId}-${ob.collegeBranchId}-${ob.collegeEducationId}`;
        const dueDate = dueDatesMap.get(key);

        if (dueDate && today > dueDate) {
          const diffTime = Math.abs(today.getTime() - dueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 30) overdueMoreThan30Days++;
        }
      }
    });

    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    ).toISOString();

    const { count: remindersSent } = await supabase
      .from("fee_reminder_job_students")
      .select("jobStudentId, fee_reminder_jobs!inner(collegeId)", {
        count: "exact",
        head: true,
      })
      .eq("status", "sent")
      .gte("sentAt", startOfMonth)
      .eq("fee_reminder_jobs.collegeId", collegeId);

    const { count: scheduledReminders } = await supabase
      .from("fee_reminder_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .eq("collegeId", collegeId);

    return {
      totalDues: totalStudentsWithDues,
      remindersSent: remindersSent || 0,
      scheduled: scheduledReminders || 0,
      overdue30: overdueMoreThan30Days,
    };
  } catch (err) {
    console.error("Stats Fetch Error:", err);
    return { totalDues: 0, remindersSent: 0, scheduled: 0, overdue30: 0 };
  }
}

export async function fetchStudentsWithDues(
  collegeId: number,
  filters: ReminderFilters,
) {
  try {
    const { data: structures } = await supabase
      .from("college_fee_structure")
      .select("collegeSessionId, collegeBranchId, collegeEducationId, dueDate")
      .eq("collegeId", collegeId)
      .eq("isActive", true);

    const dueDatesMap = new Map();
    structures?.forEach((st) => {
      const key = `${st.collegeSessionId}-${st.collegeBranchId}-${st.collegeEducationId}`;
      dueDatesMap.set(key, new Date(st.dueDate));
    });

    let query = supabase
      .from("students")
      .select(
        `
        studentId,
        users!inner(fullName),
        academic_details(rollNumber),
        student_academic_history!inner(
          isCurrent,
          college_semester(collegeSemester)
        ),
        college_education!inner(collegeEducationType),
        college_branch!inner(collegeBranchCode),
        student_fee_obligation!inner(
          totalAmount,
          collegeSessionId,
          collegeBranchId,
          collegeEducationId,
          student_fee_ledger(amount)
        )
      `,
      )
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .eq("student_academic_history.isCurrent", true)
      .eq("student_fee_obligation.isActive", true);

    if (filters.educationType && filters.educationType !== "All") {
      query = query.eq(
        "college_education.collegeEducationType",
        filters.educationType,
      );
    }
    if (filters.branch && filters.branch !== "All") {
      query = query.eq("college_branch.collegeBranchCode", filters.branch);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Students Query Error:", error);
      return { data: [], availableYears: ["All"] };
    }

    const today = new Date();

    const processedData = data
      ?.map((student: any) => {
        let totalObligation = 0;
        let totalPaid = 0;
        let oldestDueDate = today;

        const rollNumber = Array.isArray(student.academic_details)
          ? student.academic_details[0]?.rollNumber
          : student.academic_details?.rollNumber || "N/A";

        const historyRecord = Array.isArray(student.student_academic_history)
          ? student.student_academic_history[0]
          : student.student_academic_history;

        const semNum =
          historyRecord?.college_semester?.collegeSemester || "N/A";

        student.student_fee_obligation.forEach((ob: any) => {
          totalObligation += Number(ob.totalAmount);
          const paid =
            ob.student_fee_ledger?.reduce(
              (acc: number, curr: any) => acc + Number(curr.amount),
              0,
            ) || 0;
          totalPaid += paid;

          const key = `${ob.collegeSessionId}-${ob.collegeBranchId}-${ob.collegeEducationId}`;
          const dueDate = dueDatesMap.get(key);

          if (dueDate && dueDate < oldestDueDate) {
            oldestDueDate = dueDate;
          }
        });

        const amountDue = totalObligation - totalPaid;
        let daysOverdue = 0;
        if (today > oldestDueDate && amountDue > 0) {
          const diffTime = Math.abs(today.getTime() - oldestDueDate.getTime());
          daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          studentId: student.studentId,
          name: student.users?.fullName || "Unknown",
          regNo: rollNumber,
          branch: student.college_branch?.collegeBranchCode || "N/A",
          educationType: student.college_education?.collegeEducationType,
          year: determineYearFromSem(semNum),
          semester: semNum,
          feeDue: amountDue,
          formattedFeeDue: `₹${amountDue.toLocaleString("en-IN")}`,
          daysOverdue,
          status: "Not Sent", // Default, will overwrite below
          dueDate: oldestDueDate,
        };
      })
      .filter((student) => student.feeDue > 0);

    // ===============================================
    // FETCH DYNAMIC STATUSES FOR THESE STUDENTS
    // ===============================================
    const studentIds = processedData.map((s) => s.studentId);
    if (studentIds.length > 0) {
      const { data: reminderJobs } = await supabase
        .from("fee_reminder_job_students")
        .select("studentId, status")
        .in("studentId", studentIds)
        .order("jobStudentId", { ascending: false }); // Gets the most recent status

      const reminderStatuses: Record<number, string> = {};
      reminderJobs?.forEach((job) => {
        if (!reminderStatuses[job.studentId]) {
          if (job.status === "sent") reminderStatuses[job.studentId] = "Sent";
          else if (job.status === "pending")
            reminderStatuses[job.studentId] = "Scheduled";
          else if (job.status === "failed")
            reminderStatuses[job.studentId] = "Failed";
        }
      });

      processedData.forEach((s) => {
        s.status = reminderStatuses[s.studentId] || "Not Sent";
      });
    }

    // ===============================================
    // DYNAMICALLY CALCULATE AVAILABLE YEARS
    // ===============================================
    const uniqueYears = Array.from(
      new Set(processedData.map((s) => s.year)),
    ).sort();
    const availableYears = ["All", ...uniqueYears];

    // Finally apply front-end filters
    const filteredData = processedData.filter((student) => {
      let matchesSearch = true;
      let matchesYear = true;
      let matchesSem = true;
      let matchesDuePeriod = true;

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        matchesSearch =
          student.name.toLowerCase().includes(term) ||
          String(student.regNo).toLowerCase().includes(term);
      }

      if (filters.year && filters.year !== "All")
        matchesYear = student.year === filters.year;
      if (filters.sem && filters.sem !== "All")
        matchesSem = String(student.semester) === String(filters.sem);

      if (filters.duePeriod && filters.duePeriod !== "All") {
        const dueDays = student.daysOverdue;
        if (filters.duePeriod === "Today") matchesDuePeriod = dueDays === 0;
        else if (filters.duePeriod === "This Week")
          matchesDuePeriod = dueDays <= 7;
        else if (filters.duePeriod === "This Month")
          matchesDuePeriod = dueDays <= 30;
      }

      return matchesSearch && matchesYear && matchesSem && matchesDuePeriod;
    });

    return { data: filteredData, availableYears };
  } catch (err) {
    console.error("Unexpected error in fetchStudentsWithDues:", err);
    return { data: [], availableYears: ["All"] };
  }
}

// ... Keep your existing processFeeReminders, executeDirectFeeReminder, scheduleFeeReminders, fetchReminderJobsHistory, fetchFacultyForStudents below this!
