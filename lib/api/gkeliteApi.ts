import { gkeliteSupabase } from "@/lib/gkeliteSupabaseClient";
import toast from "react-hot-toast";

// --- KPI Data Fetching ---
export async function getKpiCounts(collegeFilter: string | null = null) {
  try {
    let submissionsQuery = gkeliteSupabase.from('lead_applications').select('*', { count: 'exact', head: true });
    let visitorsQuery = gkeliteSupabase.from('application_analytics_logs').select('visitorId').eq('eventType', 'SITE_VISIT');
    let opensQuery = gkeliteSupabase.from('application_analytics_logs').select('visitorId').eq('eventType', 'FORM_OPEN');
    
    if (collegeFilter) {
      submissionsQuery = submissionsQuery.ilike('college', collegeFilter);
      visitorsQuery = visitorsQuery.ilike('college', collegeFilter);
      opensQuery = opensQuery.ilike('college', collegeFilter);
    }

    const [
      { data: visitorsData, error: vErr }, 
      { data: opensData, error: oErr }, 
      { count: submissions, error: sErr }
    ] = await Promise.all([
      visitorsQuery,
      opensQuery,
      submissionsQuery
    ]);
    
    if (vErr) toast.error("Failed to fetch visitors data", { id: "kpi-error-visitors" });
    if (oErr) toast.error("Failed to fetch opens data", { id: "kpi-error-opens" });
    if (sErr) toast.error("Failed to fetch submissions data", { id: "kpi-error-submissions" });
    
    const distinctVisitors = new Set(visitorsData?.map(v => v.visitorId)).size;
    const distinctOpens = new Set(opensData?.map(o => o.visitorId)).size;

    return {
      visitors: distinctVisitors || 0,
      opens: distinctOpens || 0,
      submissions: submissions || 0,
      visitorIds: new Set(visitorsData?.map(v => v.visitorId)),
      openIds: new Set(opensData?.map(o => o.visitorId)),
    };
  } catch (err) {
    toast.error("Failed to fetch KPI data", { id: "kpi-error" });
    return { visitors: 0, opens: 0, submissions: 0, visitorIds: new Set(), openIds: new Set() };
  }
}

// --- Recent Applications ---
export async function getRecentApplications(limit = 5, collegeFilter: string | null = null) {
  try {
    let query = gkeliteSupabase
      .from('lead_applications')
      .select('*, lead_payments(paymentStatus, createdAt)')
      .order('createdAt', { ascending: false })
      .limit(limit);
      
    if (collegeFilter) {
      query = query.ilike('college', collegeFilter);
    }

    const { data, error } = await query;
      
    if (error) {
      toast.error("Failed to fetch recent applications", { id: "recent-apps-error" });
      return [];
    }
    return data || [];
  } catch (err) {
    toast.error("Failed to fetch recent applications", { id: "recent-apps-error" });
    return [];
  }
}

// --- Chart Data ---
export async function getApplicationsByYear(year: number, collegeFilter: string | null = null) {
  try {
    const start = `${year}-01-01T00:00:00.000Z`;
    const end = `${year}-12-31T23:59:59.999Z`;

    let query = gkeliteSupabase
      .from('lead_applications')
      .select('createdAt')
      .gte('createdAt', start)
      .lte('createdAt', end);
      
    if (collegeFilter) {
      query = query.ilike('college', collegeFilter);
    }

    const { data, error } = await query;
      
    if (error) {
      toast.error("Failed to fetch chart data", { id: "chart-data-error" });
      return [];
    }
    return data || [];
  } catch (err) {
    toast.error("Failed to fetch chart data", { id: "chart-data-error" });
    return [];
  }
}

// --- All Applications (Inner Page) ---
export async function getAllApplications(statusFilter: string = "All", collegeFilter: string | null = null, sortOrder: "asc" | "desc" = "desc") {
  try {
    let query = gkeliteSupabase
      .from('lead_applications')
      .select('*, lead_payments(paymentStatus, createdAt)')
      .order('createdAt', { ascending: sortOrder === "asc" });
      
    if (collegeFilter) {
      query = query.ilike('college', collegeFilter);
    }

    const { data, error } = await query;
      
    if (error) {
      toast.error("Failed to fetch applications", { id: "all-apps-error" });
      return [];
    }

    let applications = data || [];

    const processedApps = applications.map((app: any) => {
      let paymentStatus = "Pending";
      const payments = app.lead_payments || [];
      if (payments.length > 0) {
        payments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const status = payments[0].paymentStatus?.toLowerCase();
        if (status === "success") paymentStatus = "Success";
        else if (status === "failed") paymentStatus = "Failed";
      }
      return { ...app, computedStatus: paymentStatus };
    });

    if (statusFilter !== "All") {
      return processedApps.filter((app: any) => app.computedStatus === statusFilter);
    }

    return processedApps;
  } catch (err) {
    toast.error("Failed to fetch applications", { id: "all-apps-error" });
    return [];
  }
}

// --- Top Applications & Grading ---
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

  return Math.min(num, 100);
}

export async function getTopApplications(levelTab: string, courseFilter: string = "All", collegeFilter: string | null = null, rankLimit: number | null = null, minGradePercent: number | null = null) {
  try {
    let query = gkeliteSupabase
      .from('lead_applications')
      .select('*, education_qualifications(*), entrance_exams(*), lead_payments(paymentStatus, createdAt)')
      .order('createdAt', { ascending: true }); // Base tie-breaker: older applies first
      
    if (collegeFilter) {
      query = query.ilike('college', collegeFilter);
    }

    const { data, error } = await query;
      
    if (error) {
      toast.error("Failed to fetch top applications", { id: "top-apps-error" });
      return [];
    }

    let apps = data || [];

    // Filter by Level (applicationFor or course fuzzy matching)
    apps = apps.filter(app => {
      const target = (app.applicationFor || app.course || "").toLowerCase();
      const lTab = levelTab.toLowerCase();
      if (lTab === "inter") return target.includes("inter") || target.includes("11") || target.includes("12");
      if (lTab === "degree") return target.includes("degree") || target.includes("bachelor") || target.includes("ug");
      if (lTab === "pg") return target.includes("pg") || target.includes("master") || target.includes("mba") || target.includes("mca");
      return true;
    });

    // Filter by Course Sub-tab
    if (courseFilter !== "All") {
      apps = apps.filter(app => {
        const course = (app.course || "").toLowerCase();
        return course.includes(courseFilter.toLowerCase());
      });
    }

    // Process Grades & Exams
    const processed = apps.map((app: any) => {
      let finalScore = 0;
      let finalRank = 9999999; // Default bad rank

      if (levelTab === "PG" && app.entrance_exams && app.entrance_exams.length > 0) {
        // PG uses entrance exam rank as primary
        finalRank = app.entrance_exams[0].rank || 9999999;
      } else {
        // Fallback to education qualifications
        const quals = app.education_qualifications || [];
        
        let targetLevelRegex = /.*/; // match all
        if (levelTab === "Inter") targetLevelRegex = /10th|x|ssc/i;
        if (levelTab === "Degree") targetLevelRegex = /12th|xii|inter/i;
        if (levelTab === "PG") targetLevelRegex = /degree|ug|bachelor/i;

        const relevantQuals = quals.filter((q: any) => targetLevelRegex.test(q.level || ""));
        
        // If they don't have the exact level, just take their highest grade across anything as fallback
        const qualPool = relevantQuals.length > 0 ? relevantQuals : quals;

        qualPool.forEach((q: any) => {
          const score = parseGradeToPercentage(q.gradeOrPercentage);
          if (score > finalScore) finalScore = score;
        });
      }

      let paymentStatus = "Pending";
      const payments = app.lead_payments || [];
      if (payments.length > 0) {
        payments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const status = payments[0].paymentStatus?.toLowerCase();
        if (status === "success") paymentStatus = "Success";
        else if (status === "failed") paymentStatus = "Failed";
      }

      return {
        ...app,
        computedScore: finalScore,
        computedRank: finalRank,
        computedStatus: paymentStatus
      };
    });

    // Sort the processed apps
    processed.sort((a, b) => {
      // 1. If PG and has entrance exam rank, prioritize lowest rank
      if (levelTab === "PG") {
        if (a.computedRank !== b.computedRank) {
          return a.computedRank - b.computedRank; // Ascending rank
        }
      }
      
      // 2. Otherwise sort by highest percentage
      if (b.computedScore !== a.computedScore) {
        return b.computedScore - a.computedScore; // Descending percentage
      }

      // 3. Tie-breaker: application date (already sorted by DB, but we explicitly enforce it)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    let finalProcessed = processed;
    if (levelTab === "PG" && rankLimit !== null) {
      finalProcessed = finalProcessed.filter(app => app.computedRank <= rankLimit);
    } else if (levelTab !== "PG" && minGradePercent !== null) {
      finalProcessed = finalProcessed.filter(app => app.computedScore >= minGradePercent);
    }

    // Return all processed and filtered apps
    return finalProcessed;
  } catch (err) {
    toast.error("Failed to process top applications", { id: "top-apps-error" });
    return [];
  }
}

// --- Realtime Subscriptions ---
export function subscribeToAnalytics(collegeFilter: string | null, onVisit: (visitorId: string) => void, onOpen: (visitorId: string) => void) {
  return gkeliteSupabase
    .channel('analytics-channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'application_analytics_logs' }, (payload) => {
      if (collegeFilter && payload.new.college && payload.new.college.toLowerCase() !== collegeFilter.toLowerCase()) {
         return;
      }
      if (payload.new.eventType === 'SITE_VISIT') onVisit(payload.new.visitorId);
      if (payload.new.eventType === 'FORM_OPEN') onOpen(payload.new.visitorId);
    })
    .subscribe();
}

export function subscribeToSubmissions(onSubmit: (payload: any) => void) {
  const uniqueId = Math.random().toString(36).substring(7);
  return gkeliteSupabase
    .channel(`submissions-channel-${uniqueId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lead_applications' }, (payload) => {
      onSubmit(payload.new);
    })
    .subscribe();
}

export function subscribeToPayments(onPayment: (payload: any) => void) {
  const uniqueId = Math.random().toString(36).substring(7);
  return gkeliteSupabase
    .channel(`payments-channel-${uniqueId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_payments' }, (payload) => {
      onPayment(payload.new);
    })
    .subscribe();
}

export function unsubscribeChannel(channel: any) {
  if (channel) {
    gkeliteSupabase.removeChannel(channel);
  }
}

// --- Single Application Details ---
export async function getApplicationById(applicationId: number) {
  try {
    const { data, error } = await gkeliteSupabase
      .from('lead_applications')
      .select('*, education_qualifications(*), entrance_exams(*), lead_payments(paymentStatus, createdAt, amount, transactionId, paymentMethod)')
      .eq('applicationId', applicationId)
      .single();

    if (error) {
      console.error("Error fetching application details:", error);
      toast.error("Failed to fetch application details", { id: "app-detail-error" });
      return null;
    }

    if (data) {
      let paymentStatus = "Pending";
      const payments = data.lead_payments || [];
      if (payments.length > 0) {
        payments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const status = payments[0].paymentStatus?.toLowerCase();
        if (status === "success") paymentStatus = "Success";
        else if (status === "failed") paymentStatus = "Failed";
      }
      return { ...data, computedStatus: paymentStatus };
    }

    return null;
  } catch (err) {
    console.error("Error fetching application details:", err);
    toast.error("Failed to fetch application details", { id: "app-detail-error" });
    return null;
  }
}
