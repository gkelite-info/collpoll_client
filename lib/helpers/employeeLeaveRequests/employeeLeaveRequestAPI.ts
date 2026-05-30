import { supabase } from "@/lib/supabaseClient";

export type EmployeeLeaveRequestRole =
  | "CollegeAdmin"
  | "Admin"
  | "Faculty"
  | "Finance"
  | "FinanceManager"
  | "PlacementOfficer"
  | "CollegeHr"
  | "WellbeingExecutive"
  | "WellbeingManager";

export type EmployeeLeaveRequestPayload = {
  userId: number;
  collegeId: number;
  role: EmployeeLeaveRequestRole | string;
  leaveType: string;
  leaveFromDate: string;
  leaveToDate: string;
  description: string;
};

export type FetchEmployeeLeaveRequestsParams = {
  userId?: number;
  employeeId?: number;
  collegeId?: number;
  role?: EmployeeLeaveRequestRole | string;
  status?: "approved" | "pending" | "rejected";
};

export type FetchPaginatedEmployeeLeaveRequestsParams =
  FetchEmployeeLeaveRequestsParams & {
    page?: number;
    pageSize?: number;
    search?: string;
    date?: string;
  };

export type EmployeeLeaveRequestCounts = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
};

type MaybeArray<T> = T | T[] | null;

type EmployeeIdentifierSummary = {
  employeeId: string;
  employeeType: string;
};

type UserSummary = {
  fullName: string | null;
  profileUrl?: string | null;
};

export type EmployeeLeaveRequestRecord = {
  employeeLeaveRequestId: number;
  userId: number;
  employeeId: number;
  collegeId: number;
  role: string;
  leaveType: string;
  leaveFromDate: string;
  leaveToDate: string;
  description: string;
  status: "approved" | "pending" | "rejected";
  isActive: boolean;
  approvedBy: number | null;
  is_deleted: boolean | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee?: EmployeeIdentifierSummary | null;
  user?: UserSummary | null;
};

type EmployeeLeaveRequestJoin = Omit<
  EmployeeLeaveRequestRecord,
  "employee" | "user"
> & {
  employee?: MaybeArray<EmployeeIdentifierSummary>;
  user?: MaybeArray<UserSummary>;
};

type EmployeeLeaveQuery = {
  eq: (column: string, value: unknown) => EmployeeLeaveQuery;
  is: (column: string, value: unknown) => EmployeeLeaveQuery;
  lte: (column: string, value: unknown) => EmployeeLeaveQuery;
  gte: (column: string, value: unknown) => EmployeeLeaveQuery;
  ilike: (column: string, value: string) => EmployeeLeaveQuery;
  in: (column: string, values: unknown[]) => EmployeeLeaveQuery;
  order: (
    column: string,
    options?: { ascending?: boolean },
  ) => EmployeeLeaveQuery;
  range: (from: number, to: number) => EmployeeLeaveQuery;
} & PromiseLike<{
  data: unknown;
  error: unknown;
  count?: number | null;
}>;

type EmployeeLeaveQueryTable = {
  select: (
    columns: string,
    options?: { count?: "exact"; head?: boolean },
  ) => EmployeeLeaveQuery;
};

const employeeLeaveRequestTable = () =>
  (
    supabase as unknown as {
      from: (table: "employee_leave_requests") => EmployeeLeaveQueryTable;
    }
  ).from("employee_leave_requests");

const normalizeLeaveTypeForDb = (leaveType: string) => {
  const normalized = leaveType.trim().toLowerCase();
  const knownTypes: Record<string, string> = {
    casual: "casual",
    sick: "sick",
    personal: "personal",
    emergency: "emergency",
    travel: "travel",
    medical: "medical",
    others: "others",
  };

  return knownTypes[normalized] ?? normalized;
};

const firstRelation = <T>(value?: MaybeArray<T>) => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const employeeLeaveRequestSelect = `
  employeeLeaveRequestId,
  userId,
  employeeId,
  collegeId,
  role,
  leaveType,
  leaveFromDate,
  leaveToDate,
  description,
  status,
  isActive,
  approvedBy,
  is_deleted,
  createdAt,
  updatedAt,
  deletedAt,
  employee:employeeId (
    employeeId,
    employeeType
  ),
  user:userId (
    fullName
  )
`;

const mapEmployeeLeaveRows = (rows: EmployeeLeaveRequestJoin[]) =>
  rows.map((row) => ({
    ...row,
    employee: firstRelation(row.employee),
    user: firstRelation(row.user),
  }));

async function attachProfileUrls(rows: EmployeeLeaveRequestRecord[]) {
  const userIds = Array.from(new Set(rows.map((row) => row.userId)));

  if (!userIds.length) return rows;

  const { data, error } = await supabase
    .from("user_profile")
    .select("userId, profileUrl")
    .in("userId", userIds)
    .eq("is_deleted", false);

  if (error) throw error;

  const profileByUserId = new Map(
    (data ?? []).map((profile) => [
      profile.userId as number,
      profile.profileUrl as string | null,
    ]),
  );

  return rows.map((row) => ({
    ...row,
    user: row.user
      ? {
          ...row.user,
          profileUrl: profileByUserId.get(row.userId) ?? null,
        }
      : row.user,
  }));
}

const applyEmployeeLeaveFilters = (
  query: EmployeeLeaveQuery,
  {
    userId,
    employeeId,
    collegeId,
    role,
    status,
    date,
  }: FetchPaginatedEmployeeLeaveRequestsParams,
) => {
  let filteredQuery: EmployeeLeaveQuery = query
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null);

  if (userId) filteredQuery = filteredQuery.eq("userId", userId);
  if (employeeId) filteredQuery = filteredQuery.eq("employeeId", employeeId);
  if (collegeId) filteredQuery = filteredQuery.eq("collegeId", collegeId);
  if (role) filteredQuery = filteredQuery.eq("role", role);
  if (status) filteredQuery = filteredQuery.eq("status", status);
  if (date) {
    filteredQuery = filteredQuery
      .lte("leaveFromDate", date)
      .gte("leaveToDate", date);
  }
  return filteredQuery;
};

const sanitizeSearch = (search: string) => search.trim().replace(/[%(),]/g, "");

const toIsoDate = (value: string) => {
  const trimmedValue = value.trim();
  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmedValue;

  const displayMatch = trimmedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!displayMatch) return null;

  const [, day, month, year] = displayMatch;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const extractDateSearchValues = (search: string) => {
  const dateParts = search
    .split(/\s+-\s+|to/i)
    .map((part) => toIsoDate(part))
    .filter((date): date is string => Boolean(date));

  if (dateParts.length) return dateParts;

  return Array.from(
    search.matchAll(/\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{4}/g),
  )
    .map(([date]) => toIsoDate(date))
    .filter((date): date is string => Boolean(date));
};

const formatSearchDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB");

const shouldUseDateTextSearch = (search: string) =>
  /^[\d\s/-]+$/.test(search.trim()) && /\d/.test(search);

const searchableRoles: EmployeeLeaveRequestRole[] = [
  "CollegeAdmin",
  "Admin",
  "Faculty",
  "Finance",
  "FinanceManager",
  "PlacementOfficer",
  "CollegeHr",
  "WellbeingExecutive",
  "WellbeingManager",
];

const roleSearchLabels: Record<EmployeeLeaveRequestRole, string[]> = {
  CollegeAdmin: ["collegeadmin", "college admin"],
  Admin: ["admin"],
  Faculty: ["faculty"],
  Finance: ["finance", "finance executive"],
  FinanceManager: ["financemanager", "finance manager"],
  PlacementOfficer: ["placementofficer", "placement officer", "placement"],
  CollegeHr: ["collegehr", "college hr", "hr"],
  WellbeingExecutive: ["wellbeingexecutive", "wellbeing executive"],
  WellbeingManager: ["wellbeingmanager", "wellbeing manager"],
};

const searchableStatuses: EmployeeLeaveRequestRecord["status"][] = [
  "approved",
  "pending",
  "rejected",
];

const searchableLeaveTypes = [
  "casual",
  "sick",
  "personal",
  "emergency",
  "travel",
  "medical",
  "others",
];

const findMatchingEnumValues = <T extends string>(
  search: string,
  values: readonly T[],
  labels?: Record<T, string[]>,
) => {
  const normalizedSearch = search.toLowerCase().replace(/\s+/g, "");

  return values.filter((value) => {
    const normalizedValue = value.toLowerCase().replace(/\s+/g, "");
    const normalizedLabels = (labels?.[value] ?? []).map((label) =>
      label.toLowerCase().replace(/\s+/g, ""),
    );

    return [normalizedValue, ...normalizedLabels].some(
      (candidate) =>
        candidate.includes(normalizedSearch) ||
        normalizedSearch.includes(candidate),
    );
  });
};

async function fetchSearchMatches(search: string, collegeId?: number) {
  const sanitizedSearch = sanitizeSearch(search);

  if (!sanitizedSearch) {
    return {
      sanitizedSearch,
      userIds: [] as number[],
      employeeIds: [] as number[],
    };
  }

  let usersQuery = supabase
    .from("users")
    .select("userId")
    .ilike("fullName", `%${sanitizedSearch}%`)
    .eq("is_deleted", false);

  let employeesQuery = supabase
    .from("employee_ids")
    .select("employeeIdPk")
    .ilike("employeeId", `%${sanitizedSearch}%`)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (collegeId) {
    usersQuery = usersQuery.eq("collegeId", collegeId);
    employeesQuery = employeesQuery.eq("collegeId", collegeId);
  }

  const [usersResult, employeesResult] = await Promise.all([
    usersQuery,
    employeesQuery,
  ]);

  if (usersResult.error) throw usersResult.error;
  if (employeesResult.error) throw employeesResult.error;

  return {
    sanitizedSearch,
    userIds: (usersResult.data ?? []).map((user) => user.userId as number),
    employeeIds: (employeesResult.data ?? []).map(
      (employee) => employee.employeeIdPk as number,
    ),
  };
}

async function fetchDateTextMatchingLeaveRequestIds({
  search,
  userId,
  employeeId,
  collegeId,
  role,
  status,
  date,
}: FetchPaginatedEmployeeLeaveRequestsParams) {
  if (!search?.trim() || !shouldUseDateTextSearch(search)) return [];

  const sanitizedSearch = search.trim().toLowerCase();
  const query = applyEmployeeLeaveFilters(
    employeeLeaveRequestTable().select(
      "employeeLeaveRequestId, leaveFromDate, leaveToDate",
    ),
    {
      userId,
      employeeId,
      collegeId,
      role,
      status,
      date,
    },
  );

  const { data, error } = await query;
  if (error) throw error;

  return (
    (data as
      | {
          employeeLeaveRequestId?: number;
          leaveFromDate?: string;
          leaveToDate?: string;
        }[]
      | null) ?? []
  )
    .filter((row) => {
      if (!row.leaveFromDate || !row.leaveToDate) return false;
      const fromDate = formatSearchDate(row.leaveFromDate);
      const toDate = formatSearchDate(row.leaveToDate);
      const range = `${fromDate} - ${toDate}`.toLowerCase();
      return range.includes(sanitizedSearch);
    })
    .map((row) => row.employeeLeaveRequestId)
    .filter((id): id is number => typeof id === "number");
}

async function fetchMatchingLeaveRequestIds({
  search,
  userId,
  employeeId,
  collegeId,
  role,
  status,
  date,
}: FetchPaginatedEmployeeLeaveRequestsParams) {
  if (!search?.trim()) return null;
  const { sanitizedSearch, userIds, employeeIds } = await fetchSearchMatches(
    search,
    collegeId,
  );

  const createIdQuery = () =>
    applyEmployeeLeaveFilters(
      employeeLeaveRequestTable().select("employeeLeaveRequestId"),
      {
        userId,
        employeeId,
        collegeId,
        role,
        status,
        date,
      },
    );

  const queries: EmployeeLeaveQuery[] = [
    createIdQuery().ilike("description", `%${sanitizedSearch}%`),
  ];
  const matchingDates = extractDateSearchValues(sanitizedSearch);
  const matchingRoles = findMatchingEnumValues(
    sanitizedSearch,
    searchableRoles,
    roleSearchLabels,
  );
  const matchingStatuses = findMatchingEnumValues(
    sanitizedSearch,
    searchableStatuses,
  );
  const matchingLeaveTypes = findMatchingEnumValues(
    sanitizedSearch,
    searchableLeaveTypes,
  );
  const dateTextRequestIds = await fetchDateTextMatchingLeaveRequestIds({
    search,
    userId,
    employeeId,
    collegeId,
    role,
    status,
    date,
  });

  matchingRoles.forEach((matchedRole) => {
    queries.push(createIdQuery().eq("role", matchedRole));
  });

  matchingStatuses.forEach((matchedStatus) => {
    queries.push(createIdQuery().eq("status", matchedStatus));
  });

  matchingLeaveTypes.forEach((matchedLeaveType) => {
    queries.push(createIdQuery().eq("leaveType", matchedLeaveType));
  });

  if (matchingDates.length >= 2) {
    queries.push(
      createIdQuery()
        .eq("leaveFromDate", matchingDates[0])
        .eq("leaveToDate", matchingDates[1]),
    );
  } else if (matchingDates.length === 1) {
    queries.push(createIdQuery().eq("leaveFromDate", matchingDates[0]));
    queries.push(createIdQuery().eq("leaveToDate", matchingDates[0]));
    queries.push(
      createIdQuery()
        .lte("leaveFromDate", matchingDates[0])
        .gte("leaveToDate", matchingDates[0]),
    );
  }

  if (userIds.length) {
    queries.push(createIdQuery().in("userId", userIds));
  }

  if (employeeIds.length) {
    queries.push(createIdQuery().in("employeeId", employeeIds));
  }

  const results = await Promise.all(queries);
  const requestIds = new Set<number>();

  dateTextRequestIds.forEach((id) => requestIds.add(id));

  results.forEach((result) => {
    if (result.error) throw result.error;
    ((result.data as { employeeLeaveRequestId?: number }[] | null) ?? [])
      .map((row) => row.employeeLeaveRequestId)
      .filter((id): id is number => typeof id === "number")
      .forEach((id) => requestIds.add(id));
  });

  return Array.from(requestIds);
}

async function fetchEmployeeIdPk(userId: number, collegeId: number) {
  const { data, error } = await supabase
    .from("employee_ids")
    .select("employeeIdPk")
    .eq("userId", userId)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) throw error;

  if (!data?.employeeIdPk) {
    throw new Error("Employee ID is not available for this user.");
  }

  return data.employeeIdPk as number;
}

export async function createEmployeeLeaveRequest(
  payload: EmployeeLeaveRequestPayload,
) {
  const employeeId = await fetchEmployeeIdPk(payload.userId, payload.collegeId);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("employee_leave_requests")
    .insert({
      userId: payload.userId,
      employeeId,
      collegeId: payload.collegeId,
      role: payload.role,
      leaveType: normalizeLeaveTypeForDb(payload.leaveType),
      leaveFromDate: payload.leaveFromDate,
      leaveToDate: payload.leaveToDate,
      description: payload.description,
      status: "pending",
      isActive: true,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .select("employeeLeaveRequestId")
    .single();

  if (error) throw error;

  return data;
}

export async function fetchEmployeeLeaveRequests({
  userId,
  employeeId,
  collegeId,
  role,
  status,
}: FetchEmployeeLeaveRequestsParams = {}) {
  const query = applyEmployeeLeaveFilters(
    employeeLeaveRequestTable().select(employeeLeaveRequestSelect),
    {
      userId,
      employeeId,
      collegeId,
      role,
      status,
    },
  ).order("createdAt", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;

  const rows = (data ?? []) as unknown as EmployeeLeaveRequestJoin[];

  return attachProfileUrls(mapEmployeeLeaveRows(rows));
}

export async function fetchPaginatedEmployeeLeaveRequests({
  page = 1,
  pageSize = 10,
  userId,
  employeeId,
  collegeId,
  role,
  status,
  search,
  date,
}: FetchPaginatedEmployeeLeaveRequestsParams = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const matchingRequestIds = await fetchMatchingLeaveRequestIds({
    userId,
    employeeId,
    collegeId,
    role,
    status,
    search,
    date,
  });

  if (matchingRequestIds?.length === 0) {
    return {
      data: [],
      totalCount: 0,
    };
  }

  let filteredQuery = applyEmployeeLeaveFilters(
    employeeLeaveRequestTable().select(employeeLeaveRequestSelect, {
      count: "exact",
    }),
    {
      userId,
      employeeId,
      collegeId,
      role,
      status,
      search,
      date,
    },
  );

  if (matchingRequestIds) {
    filteredQuery = filteredQuery.in(
      "employeeLeaveRequestId",
      matchingRequestIds,
    );
  }

  const query = filteredQuery
    .order("createdAt", { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  const rows = (data ?? []) as unknown as EmployeeLeaveRequestJoin[];

  return {
    data: await attachProfileUrls(mapEmployeeLeaveRows(rows)),
    totalCount: count ?? 0,
  };
}

export async function fetchEmployeeLeaveRequestCounts({
  userId,
  employeeId,
  collegeId,
  role,
  date,
}: Omit<
  FetchPaginatedEmployeeLeaveRequestsParams,
  "status" | "page" | "pageSize" | "search"
> = {}): Promise<EmployeeLeaveRequestCounts> {
  const fetchCount = async (status?: "approved" | "pending" | "rejected") => {
    const query = applyEmployeeLeaveFilters(
      employeeLeaveRequestTable().select("employeeLeaveRequestId", {
        count: "exact",
        head: true,
      }),
      {
        userId,
        employeeId,
        collegeId,
        role,
        status,
        date,
      },
    );

    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  };

  const [total, approved, pending, rejected] = await Promise.all([
    fetchCount(),
    fetchCount("approved"),
    fetchCount("pending"),
    fetchCount("rejected"),
  ]);

  return { total, approved, pending, rejected };
}

export async function updateEmployeeLeaveRequestStatus({
  employeeLeaveRequestId,
  status,
  approvedBy,
}: {
  employeeLeaveRequestId: number;
  status: "approved" | "rejected";
  approvedBy?: number | null;
}) {
  const { data, error } = await supabase
    .from("employee_leave_requests")
    .update({
      status,
      approvedBy: approvedBy ?? null,
      updatedAt: new Date().toISOString(),
    })
    .eq("employeeLeaveRequestId", employeeLeaveRequestId)
    .select("employeeLeaveRequestId")
    .single();

  if (error) throw error;

  return data;
}
