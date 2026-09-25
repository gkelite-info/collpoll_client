import { achieversSupabase } from "@/lib/achieversSupabaseClient";
import toast from "react-hot-toast";

export type AchieversApplication = {
  id: string;
  applicationId: number;
  name: string;
  course: string;
  submitted: string;
  rawDate: string;
  payment: "Success" | "Pending" | "Failed";
  admission: "Pending" | "Verification" | "Selected" | "Regret";
  email: string;
  mobile: string;
  score: string;
  raw: any;
};

// --- Grade Percentage Parser (for Class X / SSC 10th marks) ---
export function parseGradeToPercentage(gradeStr: string | null | undefined): number {
  if (!gradeStr) return 0;
  const str = String(gradeStr).trim().toLowerCase();

  const match = str.match(/[\d\.]+/);
  if (!match) return 0;

  const num = parseFloat(match[0]);
  if (isNaN(num)) return 0;

  if (str.includes("cgpa")) {
    return num <= 10 ? num * 9.5 : num;
  }

  if (num <= 10 && num > 0) {
    return num * 9.5;
  }

  return num;
}

// --- Format Course With Code (e.g. "Biology, Physics, Chemistry (BiPC)") ---
export function formatCourseWithCode(courseName?: string): string {
  if (!courseName) return "N/A";
  const str = courseName.trim();
  if (/\([A-Za-z]+\)/.test(str)) return str;

  const lower = str.toLowerCase().replace(/,/g, " ");

  if (lower.includes("bipc") || (lower.includes("biolog") && lower.includes("chem"))) {
    return "Biology, Physics, Chemistry (BiPC)";
  }
  if (lower.includes("mpc") || (lower.includes("math") && lower.includes("phys") && lower.includes("chem"))) {
    return "Mathematics, Physics, Chemistry (MPC)";
  }
  if (lower.includes("cec") || (lower.includes("commer") && lower.includes("civic"))) {
    return "Commerce, Economics, Civics (CEC)";
  }
  if (lower.includes("mec") || (lower.includes("math") && lower.includes("econom") && lower.includes("commer"))) {
    return "Mathematics, Economics, Commerce (MEC)";
  }
  if (lower.includes("hec")) {
    return "History, Economics, Civics (HEC)";
  }
  return str;
}

// --- Format User Record to AchieversApplication ---
export function formatUserToApplication(user: any, tx?: any, eduList?: any[]): AchieversApplication {
  const dateObj = new Date(user.createdAt || Date.now());
  const now = new Date();
  const isToday = dateObj.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = dateObj.toDateString() === yesterday.toDateString();

  let dateStr = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dateObj);
  if (isToday) dateStr = "Today";
  else if (isYesterday) dateStr = "Yesterday";

  const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  let paymentStatus: AchieversApplication["payment"] = "Pending";
  if (tx) {
    const s = (tx.status || "").toLowerCase();
    if (s === "success") paymentStatus = "Success";
    else if (s === "failed") paymentStatus = "Failed";
    else paymentStatus = "Pending";
  }

  const rawStatus = (user.admissionStatus || "").toLowerCase();
  let admissionStatus: AchieversApplication["admission"] = "Pending";
  if (rawStatus) {
    if (rawStatus.includes("selected")) admissionStatus = "Selected";
    else if (rawStatus.includes("verification")) admissionStatus = "Verification";
    else if (rawStatus.includes("regret") || rawStatus.includes("rejected")) admissionStatus = "Regret";
  }

  let numericAppId = user.applicationId || 1;
  const match = (user.applicationNumber || "").match(/\d+$/);
  if (!user.applicationId && match) {
    numericAppId = parseInt(match[0], 10);
  }

  const imageRef = user.profileImage || user.profileImageRef;
  const profileImageUrl = imageRef
    ? achieversSupabase.storage.from("application-documents").getPublicUrl(imageRef).data.publicUrl
    : null;

  const rawEdu = eduList || user.education_qualifications || [];
  const mappedEdu = rawEdu.map((edu: any) => {
    const certUrl = edu.certificateRef
      ? achieversSupabase.storage.from("application-documents").getPublicUrl(edu.certificateRef).data.publicUrl
      : edu.certificateUrl || null;

    return {
      educationId: edu.educationId,
      level: edu.qualificationLevel || edu.level || "Class X",
      schoolOrCollege: edu.schoolName || edu.schoolOrCollege,
      boardOrUniversity: edu.board || edu.boardOrUniversity,
      passingYear: edu.passingYear,
      gradeOrPercentage: edu.gradeOrPercentage
        ? String(edu.gradeOrPercentage).includes("%")
          ? String(edu.gradeOrPercentage)
          : `${edu.gradeOrPercentage}%`
        : "N/A",
      certificateUrl: certUrl,
      certificateRef: edu.certificateRef,
    };
  });

  return {
    id: user.applicationNumber || `AJC-2026-${String(numericAppId).padStart(4, "0")}`,
    applicationId: numericAppId,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Applicant",
    course: formatCourseWithCode(user.course || user.applicationFor || "Inter"),
    submitted: `${dateStr}, ${timeStr}`,
    rawDate: user.createdAt || new Date().toISOString(),
    payment: paymentStatus,
    admission: admissionStatus,
    email: user.emailId || user.email || "",
    mobile: user.contactNo || user.mobileNumber || "",
    score: mappedEdu[0]?.gradeOrPercentage || "90%",
    raw: {
      ...user,
      fatherName: user.fathersName || user.fatherName,
      fathersName: user.fathersName || user.fatherName,
      motherName: user.mothersName || user.motherName,
      mothersName: user.mothersName || user.motherName,
      address: user.postalAddress || user.address,
      postalAddress: user.postalAddress || user.address,
      pinCode: user.pinCode,
      pincode: user.pinCode,
      city: user.city,
      state: user.state,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      nationality: user.nationality || "Indian",
      category: user.category,
      contactNo: user.contactNo || user.mobileNumber,
      mobileNumber: user.contactNo || user.mobileNumber,
      emailId: user.emailId || user.email,
      email: user.emailId || user.email,
      applicationId: numericAppId,
      profileImageUrl: profileImageUrl,
      education_qualifications: mappedEdu,
      transaction: tx || null,
      lead_payments: tx ? [
        {
          paymentStatus: tx.status,
          createdAt: tx.createdAt,
          amount: tx.amount,
          transactionId: tx.gatewayTransactionId || tx.transactionId,
          paymentMethod: "Online / Gateway",
        },
      ] : [],
    },
  };
}

// Fallback formatter for backward compatibility with legacy lead_applications schema
export function formatApplicationRecord(app: any): AchieversApplication {
  if (app.mobileNumber && !app.contactNo) {
    return formatUserToApplication(app);
  }

  const dateObj = new Date(app.createdAt || Date.now());
  const now = new Date();
  const isToday = dateObj.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = dateObj.toDateString() === yesterday.toDateString();

  let dateStr = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dateObj);
  if (isToday) dateStr = "Today";
  else if (isYesterday) dateStr = "Yesterday";

  const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  let paymentStatus: AchieversApplication["payment"] = "Pending";
  const payments = app.lead_payments || [];
  if (payments.length > 0) {
    const sorted = [...payments].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const status = sorted[0].paymentStatus?.toLowerCase();
    if (status === "success") paymentStatus = "Success";
    else if (status === "failed") paymentStatus = "Failed";
  }

  let admissionStatus: AchieversApplication["admission"] = "Pending";
  if (app.admissionStatus) {
    const adm = app.admissionStatus.toLowerCase();
    if (adm === "selected") admissionStatus = "Selected";
    else if (adm === "verification") admissionStatus = "Verification";
    else if (adm === "regret" || adm === "rejected") admissionStatus = "Regret";
  }

  const appNumber = app.applicationNumber || `AJC-2026-${String(app.applicationId || 1).padStart(4, "0")}`;

  return {
    id: appNumber,
    applicationId: app.applicationId || 1,
    name: `${app.firstName || ""} ${app.lastName || ""}`.trim() || "Applicant",
    course: app.course || "Inter",
    submitted: `${dateStr}, ${timeStr}`,
    rawDate: app.createdAt || new Date().toISOString(),
    payment: paymentStatus,
    admission: admissionStatus,
    email: app.emailId || app.email || "",
    mobile: app.contactNo || app.mobileNumber || "",
    score: "90%",
    raw: app,
  };
}

// --- KPI Counts: Website Visitors, Admissions Opened, Forms Submitted ---
export async function getAchieversKpiCounts() {
  try {
    // 1. Visitors who opened the website
    const visitorsQuery = achieversSupabase
      .from("application_analytics_logs")
      .select("visitorId")
      .in("eventType", ["SITE_VISIT", "page_view"]);

    // 2. Members who opened the admission application form
    const opensQuery = achieversSupabase
      .from("application_analytics_logs")
      .select("visitorId")
      .in("eventType", ["FORM_OPEN", "admission_open"]);

    // 3. Forms submitted for Achievers: Query lead_applications table
    const submissionsQuery = achieversSupabase
      .from("lead_applications")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false);

    const [
      { data: visitorsData, error: vErr },
      { data: opensData, error: oErr },
      { count: submissions, error: sErr },
    ] = await Promise.all([visitorsQuery, opensQuery, submissionsQuery]);

    if (vErr) console.error("Achievers KPI visitors error:", vErr);
    if (oErr) console.error("Achievers KPI opens error:", oErr);
    if (sErr) console.error("Achievers KPI submissions error:", sErr);

    const distinctVisitors = new Set(visitorsData?.map((v) => v.visitorId)).size;
    const distinctOpens = new Set(opensData?.map((o) => o.visitorId)).size;

    return {
      visitors: distinctVisitors || 0,
      opens: distinctOpens || 0,
      submissions: submissions ?? 0,
      visitorIds: new Set(visitorsData?.map((v) => v.visitorId)),
      openIds: new Set(opensData?.map((o) => o.visitorId)),
    };
  } catch (err) {
    console.error("Failed to fetch Achievers KPI data:", err);
    return { visitors: 0, opens: 0, submissions: 0, visitorIds: new Set(), openIds: new Set() };
  }
}

// --- Recent Applications: Joining lead_applications, application_transactions, and user_education ---
export async function getAchieversRecentApplications(limit = 5): Promise<AchieversApplication[]> {
  try {
    // AJC applications are authoritative in users; payment is joined separately.
    const { data: usersData, error: usersError } = await achieversSupabase
      .from("users")
      .select("*")
      .eq("is_deleted", false)
      .order("createdAt", { ascending: false })
      .limit(limit);

    if (usersError) {
      console.error("Failed to fetch Achievers recent applications:", usersError);
      return [];
    }
    const appRecords = usersData || [];

    if (appRecords.length === 0) return [];

    const appNumbers = appRecords.map((u) => u.applicationNumber).filter(Boolean);

    // Fetch user IDs from users table to link user_education
    const { data: userMapping } = await achieversSupabase
      .from("users")
      .select("userId, applicationNumber")
      .in("applicationNumber", appNumbers);

    const userNumberToId = new Map<string, string>();
    (userMapping || []).forEach((u) => {
      if (u.applicationNumber && u.userId) {
        userNumberToId.set(u.applicationNumber, u.userId);
      }
    });

    const userIds = Array.from(userNumberToId.values());

    // 2. Fetch transactions for these application numbers
    const txMap = new Map<string, any>();
    if (appNumbers.length > 0) {
      const { data: txData, error: txErr } = await achieversSupabase
        .from("application_transactions")
        .select("*")
        .in("applicationNumber", appNumbers)
        .order("createdAt", { ascending: false });

      if (txErr) {
        console.error("Failed to fetch Achievers transactions:", txErr);
      } else if (txData) {
        txData.forEach((tx) => {
          const existing = txMap.get(tx.applicationNumber);
          if (!existing || tx.status?.toLowerCase() === "success") {
            txMap.set(tx.applicationNumber, tx);
          }
        });
      }
    }

    // 3. Fetch education qualifications
    const eduMap = new Map<string, any[]>();
    if (userIds.length > 0) {
      const { data: eduData, error: eduErr } = await achieversSupabase
        .from("user_education")
        .select("*")
        .in("userId", userIds)
        .eq("is_deleted", false);

      if (eduErr) {
        console.error("Failed to fetch Achievers user_education:", eduErr);
      } else if (eduData) {
        eduData.forEach((edu) => {
          if (!eduMap.has(edu.userId)) eduMap.set(edu.userId, []);
          eduMap.get(edu.userId)!.push(edu);
        });
      }
    }

    // 4. Map records joined with transactions and education
    return appRecords.map((record) => {
      const tx = txMap.get(record.applicationNumber);
      const uid = record.userId || userNumberToId.get(record.applicationNumber);
      const eduList = uid ? eduMap.get(uid) || [] : [];
      return formatUserToApplication(record, tx, eduList);
    });
  } catch (err) {
    console.error("Failed to fetch Achievers recent applications:", err);
    return [];
  }
}

// --- Chart Monthly Trends using users table ---
export async function getAchieversApplicationsByYear(year: number): Promise<number[]> {
  try {
    const start = `${year}-01-01T00:00:00.000Z`;
    const end = `${year}-12-31T23:59:59.999Z`;

    const { data, error } = await achieversSupabase
      .from("users")
      .select("createdAt")
      .eq("is_deleted", false)
      .gte("createdAt", start)
      .lte("createdAt", end);

    if (error) {
      console.error("Failed to fetch Achievers chart data:", error);
      return new Array(12).fill(0);
    }

    const counts = new Array(12).fill(0);
    (data || []).forEach((item: any) => {
      if (item.createdAt) {
        const date = new Date(item.createdAt);
        const month = date.getMonth();
        if (month >= 0 && month < 12) {
          counts[month] += 1;
        }
      }
    });

    return counts;
  } catch (err) {
    console.error("Failed to fetch Achievers chart data:", err);
    return new Array(12).fill(0);
  }
}

export async function getAchieversAllApplications(filters?: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentFilter?: string;
  admissionFilter?: string;
  minGrade?: number;
  maxGrade?: number;
}): Promise<AchieversApplication[]> {
  try {
    // AJC applications are authoritative in users; payment is joined separately.
    const cleanSearch = (filters?.search || "").trim();
    let usersQuery = achieversSupabase
      .from("users")
      .select("*")
      .eq("is_deleted", false);
        
    if (cleanSearch) {
        const words = cleanSearch.split(/\s+/).filter(Boolean);
        const isEmailSearch = cleanSearch.includes("@");
        const usersConds: string[] = [];
        words.forEach((w) => {
          const s = `%${w}%`;
          usersConds.push(`firstName.ilike.${s}`);
          usersConds.push(`lastName.ilike.${s}`);
          usersConds.push(`applicationNumber.ilike.${s}`);
          usersConds.push(`mobileNumber.ilike.${s}`);
          if (isEmailSearch) {
            usersConds.push(`email.ilike.${s}`);
          }
        });
        if (usersConds.length > 0) {
          usersQuery = usersQuery.or(usersConds.join(","));
        }
    }
    if (filters?.dateFrom) usersQuery = usersQuery.gte("createdAt", new Date(filters.dateFrom).toISOString());
    if (filters?.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      usersQuery = usersQuery.lte("createdAt", to.toISOString());
    }
    if (filters?.admissionFilter && filters.admissionFilter !== "All") {
      usersQuery = filters.admissionFilter === "Pending"
        ? usersQuery.or('admissionStatus.is.null,admissionStatus.eq.,admissionStatus.ilike.%pending%')
        : usersQuery.ilike("admissionStatus", `%${filters.admissionFilter}%`);
    }
    usersQuery = usersQuery.order("createdAt", { ascending: false });

    const { data: usersData, error: usersError } = await usersQuery;
    if (usersError) {
      console.error("Failed to fetch Achievers all applications:", usersError);
      return [];
    }
    const appRecords = usersData || [];

    if (appRecords.length === 0) return [];

    const appNumbers = appRecords.map((u) => u.applicationNumber).filter(Boolean);

    // Fetch user IDs from users table to link user_education
    const { data: userMapping } = await achieversSupabase
      .from("users")
      .select("userId, applicationNumber")
      .in("applicationNumber", appNumbers);

    const userNumberToId = new Map<string, string>();
    (userMapping || []).forEach((u) => {
      if (u.applicationNumber && u.userId) {
        userNumberToId.set(u.applicationNumber, u.userId);
      }
    });

    const userIds = Array.from(userNumberToId.values());

    // Fetch transactions
    const txMap = new Map<string, any>();
    if (appNumbers.length > 0) {
      const { data: txData, error: txErr } = await achieversSupabase
        .from("application_transactions")
        .select("*")
        .in("applicationNumber", appNumbers)
        .order("createdAt", { ascending: false });

      if (!txErr && txData) {
        txData.forEach((tx) => {
          const existing = txMap.get(tx.applicationNumber);
          if (!existing || tx.status?.toLowerCase() === "success") {
            txMap.set(tx.applicationNumber, tx);
          }
        });
      }
    }

    // Fetch education
    const eduMap = new Map<string, any[]>();
    if (userIds.length > 0) {
      const { data: eduData, error: eduErr } = await achieversSupabase
        .from("user_education")
        .select("*")
        .in("userId", userIds)
        .eq("is_deleted", false);

      if (!eduErr && eduData) {
        eduData.forEach((edu) => {
          if (!eduMap.has(edu.userId)) eduMap.set(edu.userId, []);
          eduMap.get(edu.userId)!.push(edu);
        });
      }
    }

    let finalApps = appRecords.map((record) => {
      const tx = txMap.get(record.applicationNumber);
      const uid = record.userId || userNumberToId.get(record.applicationNumber);
      const eduList = uid ? eduMap.get(uid) || [] : [];
      return formatUserToApplication(record, tx, eduList);
    });

    // Apply remaining filters in-memory
    if (filters?.paymentFilter && filters.paymentFilter !== "All") {
      finalApps = finalApps.filter((a) => a.payment === filters.paymentFilter);
    }
    
    if (filters?.minGrade !== undefined || filters?.maxGrade !== undefined) {
      finalApps = finalApps.filter((a) => {
        const s = parseFloat((a.score || "").replace(/[^0-9.]/g, "")) || 0;
        const min = filters.minGrade ?? 0;
        const max = filters.maxGrade ?? 100;
        return s >= min && s <= max;
      });
    }

    return finalApps;
  } catch (err) {
    console.error("Failed to fetch Achievers all applications:", err);
    return [];
  }
}

// --- Top Applications (Inter College Merit Ranking) ---
export async function getAchieversTopApplications(
  courseFilter: string = "All",
  minGradePercent: number | null = 85
): Promise<AchieversApplication[]> {
  try {
    const all = await getAchieversAllApplications();
    let apps = all;

    if (courseFilter !== "All") {
      apps = apps.filter((app) => {
        const course = (app.course || "").toLowerCase();
        return course.includes(courseFilter.toLowerCase());
      });
    }

    const parseScore = (scoreStr: string): number => {
      if (!scoreStr) return 0;
      const match = String(scoreStr).match(/[\d\.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    // Sort by merit score descending
    apps.sort((a, b) => parseScore(b.score) - parseScore(a.score));

    // Filter by minGradePercent
    if (minGradePercent !== null && !isNaN(minGradePercent) && minGradePercent > 0) {
      apps = apps.filter((app) => parseScore(app.score) >= minGradePercent);
    }

    return apps;
  } catch (err) {
    console.error("Failed to fetch Achievers top applications:", err);
    return [];
  }
}

// --- Realtime Subscriptions ---
export function subscribeAchieversAnalytics(
  onVisit: (visitorId: string) => void,
  onOpen: (visitorId: string) => void
) {
  return achieversSupabase
    .channel("achievers-analytics-channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "application_analytics_logs" },
      (payload) => {
        const row = payload.new;
        if (!row) return;
        const ev = (row.eventType || "").toLowerCase();
        if (ev === "site_visit" || ev === "page_view") onVisit(row.visitorId);
        if (ev === "form_open" || ev === "admission_open") onOpen(row.visitorId);
      }
    )
    .subscribe();
}

export function subscribeAchieversSubmissions(onSubmit: (newApp: any) => void) {
  const uniqueId = Math.random().toString(36).substring(7);
  return achieversSupabase
    .channel(`achievers-submissions-${uniqueId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "users" },
      (payload) => {
        const row = payload.new;
        if (!row || row.is_deleted) return;
        onSubmit(row);
      }
    )
    .subscribe();
}

export function subscribeAchieversPayments(onPayment: (payment: any) => void) {
  const uniqueId = Math.random().toString(36).substring(7);
  return achieversSupabase
    .channel(`achievers-payments-${uniqueId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "application_transactions" },
      (payload) => {
        if (payload.new) {
          onPayment(payload.new);
        }
      }
    )
    .subscribe();
}

export function unsubscribeAchieversChannel(channel: any) {
  if (channel) {
    achieversSupabase.removeChannel(channel);
  }
}
