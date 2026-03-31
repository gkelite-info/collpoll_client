import { supabase } from "@/lib/supabaseClient";

export interface EmployeePaySummary {
  totalCTC: number;
  regularSalary: number;
  variablePay: number;
  bonus: number;
  otherAddons: number;
  total: number;
  revisionDate: string;
}

export const fetchEmployeePaySummary = async (
  userId: number,
  collegeId: number,
): Promise<EmployeePaySummary | null> => {
  try {
    const { data, error } = await supabase
      .from("employee_pay_profiles")
      .select(
        `
        updatedAt,
        employee_salary_structure ( totalCtc, fixedPay, variablePay ),
        employee_pay_addons ( addonType, amount )
      `,
      )
      .eq("userId", userId)
      .eq("collegeId", collegeId)
      .maybeSingle();

    if (error || !data) return null;

    // Supabase nested joins can return arrays or objects. We normalize them:
    const structure = Array.isArray(data.employee_salary_structure)
      ? data.employee_salary_structure[0]
      : data.employee_salary_structure;

    const addons = Array.isArray(data.employee_pay_addons)
      ? data.employee_pay_addons
      : data.employee_pay_addons
        ? [data.employee_pay_addons]
        : [];

    let bonus = 0;
    let otherAddons = 0;

    addons.forEach((a: any) => {
      if (a.addonType === "BONUS") bonus += a.amount;
      else otherAddons += a.amount;
    });

    const fixed = structure?.fixedPay || 0;
    const variable = structure?.variablePay || 0;
    const ctc = structure?.totalCtc || 0;

    return {
      totalCTC: ctc,
      regularSalary: fixed,
      variablePay: variable,
      bonus: bonus,
      otherAddons: otherAddons,
      total: ctc + bonus + otherAddons,
      revisionDate: new Date(data.updatedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  } catch (err) {
    console.error("Error fetching pay summary:", err);
    return null;
  }
};
