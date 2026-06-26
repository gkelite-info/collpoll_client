import { supabase } from "@/lib/supabaseClient";

export type CollegeVisitorCategory = "parent" | "guest" | "other";
export type CollegeVisitorStatus = "entered" | "exited";

export type CollegeVisitorLogRow = {
  collegeVisitorId: number;
  collegeId: number;
  visitorName: string;
  visitorMobile: string;
  visitorCategory: CollegeVisitorCategory;
  purposeOfVisit: string;
  noOfVisitors: number;
  entryDate: string;
  entryTime: string;
  exitTime: string | null;
  visitorStatus: CollegeVisitorStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};

export type FetchCollegeVisitorLogsParams = {
  collegeId: number;
  createdBy?: number;
  entryDate?: string;
  visitorStatus?: CollegeVisitorStatus | "all";
  search?: string;
};

export type FetchCollegeVisitorLogsPageParams = FetchCollegeVisitorLogsParams & {
  page: number;
  limit: number;
};

export type CreateCollegeVisitorLogPayload = {
  collegeId: number;
  visitorName: string;
  visitorMobile: string;
  visitorCategory: CollegeVisitorCategory;
  purposeOfVisit: string;
  noOfVisitors: number;
  entryDate: string;
  entryTime: string;
  exitTime?: string | null;
  visitorStatus?: CollegeVisitorStatus;
  createdBy: number;
};

export type UpdateCollegeVisitorLogPayload = Omit<
  CreateCollegeVisitorLogPayload,
  "collegeId" | "createdBy"
> & {
  collegeVisitorId: number;
  collegeId: number;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

const COLLEGE_VISITOR_LOG_COLUMNS =
  "collegeVisitorId, collegeId, visitorName, visitorMobile, visitorCategory, purposeOfVisit, noOfVisitors, entryDate, entryTime, exitTime, visitorStatus, createdBy, createdAt, updatedAt";

function createCollegeVisitorLogError(context: string, error: SupabaseErrorLike) {
  const code = error.code ? ` [${error.code}]` : "";
  const message = error.message || "Unknown Supabase error";
  const normalizedError = new Error(`${context}${code}: ${message}`);
  console.error(normalizedError.message, {
    details: error.details ?? null,
    hint: error.hint ?? null,
  });
  return normalizedError;
}

function normalizeVisitorPayload<T extends CreateCollegeVisitorLogPayload | UpdateCollegeVisitorLogPayload>(
  payload: T,
) {
  return {
    visitorName: payload.visitorName.trim(),
    visitorMobile: payload.visitorMobile.trim(),
    visitorCategory: payload.visitorCategory,
    purposeOfVisit: payload.purposeOfVisit.trim(),
    noOfVisitors: payload.noOfVisitors,
    entryDate: payload.entryDate,
    entryTime: payload.entryTime,
    exitTime: payload.exitTime || null,
    visitorStatus: payload.visitorStatus ?? "entered",
  };
}

export async function fetchCollegeVisitorLogs({
  collegeId,
  createdBy,
  entryDate,
  visitorStatus = "all",
  search = "",
}: FetchCollegeVisitorLogsParams) {
  let query = supabase
    .from("college_visitor_logs")
    .select(COLLEGE_VISITOR_LOG_COLUMNS)
    .eq("collegeId", collegeId);

  if (entryDate) {
    query = query.eq("entryDate", entryDate);
  }

  if (createdBy) {
    query = query.eq("createdBy", createdBy);
  }

  if (visitorStatus !== "all") {
    query = query.eq("visitorStatus", visitorStatus);
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    query = query.or(
      `visitorName.ilike.%${trimmedSearch}%,visitorMobile.ilike.%${trimmedSearch}%,purposeOfVisit.ilike.%${trimmedSearch}%`,
    );
  }

  const { data, error } = await query
    .order("entryDate", { ascending: false })
    .order("entryTime", { ascending: false });

  if (error) {
    throw createCollegeVisitorLogError("fetchCollegeVisitorLogs", error);
  }

  return (data ?? []) as CollegeVisitorLogRow[];
}

export async function fetchCollegeVisitorLogsPage({
  page,
  limit,
  ...params
}: FetchCollegeVisitorLogsPageParams) {
  const from = Math.max(page - 1, 0) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("college_visitor_logs")
    .select(COLLEGE_VISITOR_LOG_COLUMNS, { count: "exact" })
    .eq("collegeId", params.collegeId);

  if (params.entryDate) {
    query = query.eq("entryDate", params.entryDate);
  }

  if (params.createdBy) {
    query = query.eq("createdBy", params.createdBy);
  }

  if (params.visitorStatus && params.visitorStatus !== "all") {
    query = query.eq("visitorStatus", params.visitorStatus);
  }

  const trimmedSearch = params.search?.trim() ?? "";
  if (trimmedSearch) {
    query = query.or(
      `visitorName.ilike.%${trimmedSearch}%,visitorMobile.ilike.%${trimmedSearch}%,purposeOfVisit.ilike.%${trimmedSearch}%`,
    );
  }

  const { data, error, count } = await query
    .order("entryDate", { ascending: false })
    .order("entryTime", { ascending: false })
    .range(from, to);

  if (error) {
    throw createCollegeVisitorLogError("fetchCollegeVisitorLogsPage", error);
  }

  return {
    data: (data ?? []) as CollegeVisitorLogRow[],
    count: count ?? 0,
  };
}

export async function createCollegeVisitorLog(payload: CreateCollegeVisitorLogPayload) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("college_visitor_logs")
    .insert({
      collegeId: payload.collegeId,
      ...normalizeVisitorPayload(payload),
      createdBy: payload.createdBy,
      createdAt: now,
      updatedAt: now,
    })
    .select(COLLEGE_VISITOR_LOG_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This visitor already has an active entry for the selected date.");
    }
    throw createCollegeVisitorLogError("createCollegeVisitorLog", error);
  }

  return data as CollegeVisitorLogRow;
}

export async function updateCollegeVisitorLog(payload: UpdateCollegeVisitorLogPayload) {
  const { data, error } = await supabase
    .from("college_visitor_logs")
    .update({
      ...normalizeVisitorPayload(payload),
      updatedAt: new Date().toISOString(),
    })
    .eq("collegeVisitorId", payload.collegeVisitorId)
    .eq("collegeId", payload.collegeId)
    .select(COLLEGE_VISITOR_LOG_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This visitor already has an active entry for the selected date.");
    }
    throw createCollegeVisitorLogError("updateCollegeVisitorLog", error);
  }

  return data as CollegeVisitorLogRow;
}

export async function markCollegeVisitorExit({
  collegeVisitorId,
  collegeId,
  exitTime,
}: {
  collegeVisitorId: number;
  collegeId: number;
  exitTime: string;
}) {
  const { data, error } = await supabase
    .from("college_visitor_logs")
    .update({
      exitTime,
      visitorStatus: "exited",
      updatedAt: new Date().toISOString(),
    })
    .eq("collegeVisitorId", collegeVisitorId)
    .eq("collegeId", collegeId)
    .select(COLLEGE_VISITOR_LOG_COLUMNS)
    .single();

  if (error) {
    throw createCollegeVisitorLogError("markCollegeVisitorExit", error);
  }

  return data as CollegeVisitorLogRow;
}

export async function deleteCollegeVisitorLog({
  collegeVisitorId,
  collegeId,
}: {
  collegeVisitorId: number;
  collegeId: number;
}) {
  const { error } = await supabase
    .from("college_visitor_logs")
    .delete()
    .eq("collegeVisitorId", collegeVisitorId)
    .eq("collegeId", collegeId);

  if (error) {
    throw createCollegeVisitorLogError("deleteCollegeVisitorLog", error);
  }

  return { success: true };
}
