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

type MaybeArray<T> = T | T[] | null;

type EmployeeIdentifierSummary = {
  employeeId: string;
  employeeType: string;
};

type UserSummary = {
  fullName: string | null;
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
  let query = supabase
    .from("employee_leave_requests")
    .select(
      `
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
      `,
    )
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  if (userId) query = query.eq("userId", userId);
  if (employeeId) query = query.eq("employeeId", employeeId);
  if (collegeId) query = query.eq("collegeId", collegeId);
  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) throw error;

  const rows = (data ?? []) as unknown as EmployeeLeaveRequestJoin[];

  return rows.map((row) => ({
    ...row,
    employee: firstRelation(row.employee),
    user: firstRelation(row.user),
  }));
}
