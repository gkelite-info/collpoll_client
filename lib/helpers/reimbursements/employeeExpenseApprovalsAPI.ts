import { supabase } from "@/lib/supabaseClient";
import type { EmployeeExpenseReport, EmployeeExpenseAttachment } from "./employeeExpenseReportsAPI";

export type ReimbursementApprovalStatus = "approved" | "rejected" | "pending";

export type EmployeeExpenseApproval = {
  employeeExpenseApprovalId: number;
  employeeExpenseReportId: number;
  status: ReimbursementApprovalStatus;
  approvedBy: number;
  approvedUserRole: string;
  approvedOn: string;
  collegeId: number;
};

export type HRReimbursementRequest = Omit<EmployeeExpenseReport, "attachments"> & {
  attachments: EmployeeExpenseAttachment[];
  collegeId: number;
  employeeName: string;
  employeeEmail: string;
  employeeAvatar: string;
  employeeMobile?: string;
  employeeRole?: string;
  employeeGender?: string;
  paymentApproval?: EmployeeExpenseApproval | null;
  employeeHistory?: {
    employeeExpenseReportId: number;
    expenseTitle: string;
    amountSpent: number;
    createdAt: string;
    status: string;
  }[];
};

type ReimbursementReportRow = Omit<EmployeeExpenseReport, "attachments"> & {
  employeeId: number;
  collegeId: number;
  attachments: EmployeeExpenseAttachment[];
};

type ReimbursementUserRow = {
  fullName?: string | null;
  email?: string | null;
  mobile?: string | null;
  role?: string | null;
  gender?: string | null;
  user_profile?:
    | {
        profileUrl?: string | null;
        is_deleted?: boolean | null;
        deletedAt?: string | null;
      }
    | {
        profileUrl?: string | null;
        is_deleted?: boolean | null;
        deletedAt?: string | null;
      }[]
    | null;
};

function getProfileUrl(user: ReimbursementUserRow | null | undefined) {
  const profiles = Array.isArray(user?.user_profile)
    ? user?.user_profile
    : user?.user_profile
      ? [user.user_profile]
      : [];

  return (
    profiles.find((profile) => profile?.profileUrl && !profile.is_deleted && !profile.deletedAt)
      ?.profileUrl ?? null
  );
}

function getEmployeeAvatar(user: ReimbursementUserRow | null | undefined) {
  const fullName = user?.fullName || "Employee";
  return getProfileUrl(user) || "https://ui-avatars.com/api/?name=" + encodeURIComponent(fullName);
}

export async function fetchReimbursementsForApproval(collegeId: number): Promise<HRReimbursementRequest[]> {
  if (!collegeId) return [];

  const { data: reports, error } = await supabase
    .from("employee_expense_reports")
    .select(`
      *,
      attachments:employee_expense_attachments(*)
    `)
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching reimbursements for approval:", error);
    throw error;
  }

  const reportRows = (reports ?? []) as ReimbursementReportRow[];
  if (reportRows.length === 0) return [];

  const employeeIds = [...new Set(reportRows.map((r) => r.employeeId))];

  const { data: employeeData, error: empError } = await supabase
    .from("employee_ids")
    .select(`
      employeeIdPk,
      users (
        fullName,
        email,
        mobile,
        role,
        gender,
        user_profile (
          profileUrl,
          is_deleted,
          deletedAt
        )
      )
    `)
    .in("employeeIdPk", employeeIds);

  if (empError) console.error("Error fetching users:", empError);

  const userMap = new Map<number, ReimbursementUserRow | null>();
  if (employeeData) {
    employeeData.forEach(emp => {
       const u = Array.isArray(emp.users) ? emp.users[0] : emp.users;
       userMap.set(emp.employeeIdPk, u);
    });
  }

  const reportIds = reportRows.map((row) => row.employeeExpenseReportId);
  const { data: approvalData, error: approvalError } = await supabase
    .from("employee_expense_approvals")
    .select("employeeExpenseApprovalId, employeeExpenseReportId, status, approvedBy, approvedUserRole, approvedOn, collegeId")
    .in("employeeExpenseReportId", reportIds)
    .eq("collegeId", collegeId)
    .is("deletedAt", null);

  if (approvalError) console.error("Error fetching payment approvals:", approvalError);
  const approvalMap = new Map(
    ((approvalData ?? []) as EmployeeExpenseApproval[]).map((approval) => [
      approval.employeeExpenseReportId,
      approval,
    ]),
  );

  return reportRows.map((row) => {
    const user = userMap.get(row.employeeId);
    const paymentApproval = approvalMap.get(row.employeeExpenseReportId) ?? null;
    return {
      ...row,
      status:
        paymentApproval?.status === "approved"
          ? "paid"
          : paymentApproval?.status === "rejected"
            ? "payment_rejected"
            : row.status || "pending",
      employeeName: user?.fullName || "Unknown Employee",
      employeeEmail: user?.email || "No Email",
      employeeAvatar: getEmployeeAvatar(user),
      employeeMobile: user?.mobile,
      employeeRole: user?.role,
      employeeGender: user?.gender,
      paymentApproval,
    } as HRReimbursementRequest;
  });
}

export async function fetchReimbursementById(reportId: number): Promise<HRReimbursementRequest | null> {
  if (!reportId) return null;

  const { data, error } = await supabase
    .from("employee_expense_reports")
    .select(`
      *,
      attachments:employee_expense_attachments(*)
    `)
    .eq("employeeExpenseReportId", reportId)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) {
    console.error("Error fetching reimbursement by ID:", error);
    throw error;
  }

  if (!data) return null;

  const { data: employeeData, error: empError } = await supabase
    .from("employee_ids")
    .select(`
      employeeIdPk,
      users (
        fullName,
        email,
        mobile,
        role,
        gender,
        user_profile (
          profileUrl,
          is_deleted,
          deletedAt
        )
      )
    `)
    .eq("employeeIdPk", data.employeeId)
    .maybeSingle();

  if (empError) console.error("Error fetching user details:", empError);

  const user = employeeData ? (Array.isArray(employeeData.users) ? employeeData.users[0] : employeeData.users) : null;

  const { data: history } = await supabase
    .from("employee_expense_reports")
    .select("employeeExpenseReportId, expenseTitle, amountSpent, createdAt, status")
    .eq("employeeId", data.employeeId)
    .neq("employeeExpenseReportId", reportId)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  const { data: paymentApproval, error: approvalError } = await supabase
    .from("employee_expense_approvals")
    .select("employeeExpenseApprovalId, employeeExpenseReportId, status, approvedBy, approvedUserRole, approvedOn, collegeId")
    .eq("employeeExpenseReportId", reportId)
    .eq("collegeId", data.collegeId)
    .is("deletedAt", null)
    .maybeSingle();

  if (approvalError) console.error("Error fetching payment approval:", approvalError);

  return {
    ...data,
    status:
      paymentApproval?.status === "approved"
        ? "paid"
        : paymentApproval?.status === "rejected"
          ? "payment_rejected"
          : data.status || "pending",
    employeeName: user?.fullName || "Unknown Employee",
    employeeEmail: user?.email || "No Email",
    employeeAvatar: getEmployeeAvatar(user),
    employeeMobile: user?.mobile,
    employeeRole: user?.role,
    employeeGender: user?.gender,
    employeeHistory: history || [],
    paymentApproval: (paymentApproval as EmployeeExpenseApproval | null) ?? null,
  } as HRReimbursementRequest;
}

export async function markReimbursementAsPaid({
  reportId,
  userId,
  collegeId,
  approvedUserRole,
  approvedOn,
}: {
  reportId: number;
  userId: number;
  collegeId: number;
  approvedUserRole: string;
  approvedOn: string;
}) {
  const now = new Date().toISOString();
  const { data: approval, error: approvalError } = await supabase
    .from("employee_expense_approvals")
    .upsert(
      {
        employeeExpenseReportId: reportId,
        status: "approved",
        approvedBy: userId,
        approvedUserRole,
        approvedOn,
        collegeId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      { onConflict: "employeeExpenseReportId" },
    )
    .select("employeeExpenseApprovalId, employeeExpenseReportId, status, approvedBy, approvedUserRole, approvedOn, collegeId")
    .single();

  if (approvalError) throw approvalError;

  return approval as EmployeeExpenseApproval;
}

export async function rejectReimbursementPayment({
  reportId,
  userId,
  collegeId,
  approvedUserRole,
}: {
  reportId: number;
  userId: number;
  collegeId: number;
  approvedUserRole: string;
}) {
  const now = new Date().toISOString();
  const { data: approval, error } = await supabase
    .from("employee_expense_approvals")
    .upsert(
      {
        employeeExpenseReportId: reportId,
        status: "rejected",
        approvedBy: userId,
        approvedUserRole,
        approvedOn: now.split("T")[0],
        collegeId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      { onConflict: "employeeExpenseReportId" },
    )
    .select("employeeExpenseApprovalId, employeeExpenseReportId, status, approvedBy, approvedUserRole, approvedOn, collegeId")
    .single();

  if (error) throw error;
  return approval as EmployeeExpenseApproval;
}

export async function updateReimbursementPaymentStatus({
  reportId,
  userId,
  collegeId,
  approvedUserRole,
  status,
}: {
  reportId: number;
  userId: number;
  collegeId: number;
  approvedUserRole: string;
  status: ReimbursementApprovalStatus;
}) {
  const now = new Date().toISOString();
  const { data: approval, error } = await supabase
    .from("employee_expense_approvals")
    .upsert(
      {
        employeeExpenseReportId: reportId,
        status,
        approvedBy: userId,
        approvedUserRole,
        approvedOn: now.split("T")[0],
        collegeId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      { onConflict: "employeeExpenseReportId" },
    )
    .select("employeeExpenseApprovalId, employeeExpenseReportId, status, approvedBy, approvedUserRole, approvedOn, collegeId")
    .single();

  if (error) throw error;
  return approval as EmployeeExpenseApproval;
}

export async function approveReimbursement({
  reportId,
  userId,
  collegeId,
}: {
  reportId: number;
  userId: number;
  collegeId: number;
}) {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const { error: updateError } = await supabase
    .from("employee_expense_reports")
    .update({
      status: "approved",
      approvedBy: userId,
      approvedAt: today,
      rejectedBy: null,
      rejectedAt: null,
      updatedAt: now,
    })
    .eq("employeeExpenseReportId", reportId)
    .eq("collegeId", collegeId);

  if (updateError) throw updateError;
  return true;
}

export async function rejectReimbursement({
  reportId,
  userId,
  collegeId,
}: {
  reportId: number;
  userId: number;
  collegeId: number;
}) {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const { error: updateError } = await supabase
    .from("employee_expense_reports")
    .update({
      status: "rejected",
      approvedBy: null,
      approvedAt: null,
      rejectedBy: userId,
      rejectedAt: today,
      updatedAt: now,
    })
    .eq("employeeExpenseReportId", reportId)
    .eq("collegeId", collegeId);

  if (updateError) throw updateError;
  return true;
}

export async function updateReimbursementStatus({
  reportId,
  userId,
  collegeId,
  status,
}: {
  reportId: number;
  userId: number;
  collegeId: number;
  status: ReimbursementApprovalStatus;
}) {
  const now = new Date().toISOString();
  const today = now.split("T")[0];
  const updatePayload =
    status === "approved"
      ? {
          status,
          approvedBy: userId,
          approvedAt: today,
          rejectedBy: null,
          rejectedAt: null,
          updatedAt: now,
        }
      : status === "rejected"
        ? {
            status,
            approvedBy: null,
            approvedAt: null,
            rejectedBy: userId,
            rejectedAt: today,
            updatedAt: now,
          }
        : {
            status,
            approvedBy: null,
            approvedAt: null,
            rejectedBy: null,
            rejectedAt: null,
            updatedAt: now,
          };

  const { error: updateError } = await supabase
    .from("employee_expense_reports")
    .update(updatePayload)
    .eq("employeeExpenseReportId", reportId)
    .eq("collegeId", collegeId);

  if (updateError) throw updateError;
  return true;
}
