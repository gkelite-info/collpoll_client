import { supabase } from "@/lib/supabaseClient";

interface SavePayDetailsParams {
  userId: number;
  collegeId: number;
  collegeHrId: number;
  formData: any;
  addons: any[];
}

export const saveEmployeePayDetails = async ({
  userId,
  collegeId,
  collegeHrId,
  formData,
  addons,
}: SavePayDetailsParams) => {
  const mapJobType = (uiValue: string) => uiValue?.toUpperCase() || "PERMANENT";

  const mapCompType = (uiValue: string) => {
    if (!uiValue) return "DIRECT_PAYMENT";
    if (uiValue === "Direct Payment") return "DIRECT_PAYMENT";
    return uiValue.toUpperCase();
  };

  const mapPayNature = (uiValue: string) => uiValue?.toUpperCase() || "FIXED";

  const mapAddonType = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("bonus")) return "BONUS";
    if (lower.includes("joining") || lower.includes("compensation"))
      return "JOINING";
    if (lower.includes("maintenance")) return "MAINTENANCE";
    return "OTHERS";
  };

  const parseIntSafe = (val: string | undefined | null) =>
    parseInt((val || "").toString().replace(/,/g, "") || "0", 10);

  try {
    const now = new Date().toISOString();
    let profileId: number;

    const { data: existingProfile, error: checkErr } = await supabase
      .from("employee_pay_profiles")
      .select("employeePayProfileId")
      .eq("userId", userId)
      .eq("collegeId", collegeId)
      .maybeSingle();

    if (checkErr) throw checkErr;

    if (existingProfile) {
      profileId = existingProfile.employeePayProfileId;

      const { error: updProfileErr } = await supabase
        .from("employee_pay_profiles")
        .update({
          jobType: mapJobType(formData.jobType),
          monthlySalary: parseIntSafe(
            formData.basicSalary || formData.monthlySalary,
          ),
          updatedAt: now,
        })
        .eq("employeePayProfileId", profileId);
      if (updProfileErr) throw updProfileErr;

      const { error: updStructErr } = await supabase
        .from("employee_salary_structure")
        .update({
          totalCtc: parseIntSafe(formData.totalCTC),
          fixedPay: parseIntSafe(formData.fixedPay),
          variablePay: parseIntSafe(formData.variablePay),
          updatedAt: now,
        })
        .eq("employeePayProfileId", profileId);
      if (updStructErr) throw updStructErr;

      const { error: updLeaveErr } = await supabase
        .from("employee_leave_allocations")
        .update({
          totalLeaves: parseIntSafe(formData.totalLeaves),
          sickLeave: parseIntSafe(formData.sickLeave),
          casualLeave: parseIntSafe(formData.casualLeave),
          paidLeave: parseIntSafe(formData.paidLeave),
        })
        .eq("employeePayProfileId", profileId);
      if (updLeaveErr) throw updLeaveErr;
    } else {
      const { data: newProfile, error: insProfileErr } = await supabase
        .from("employee_pay_profiles")
        .insert({
          userId: userId,
          collegeId: collegeId,
          createdBy: collegeHrId,
          jobType: mapJobType(formData.jobType),
          monthlySalary: parseIntSafe(
            formData.basicSalary || formData.monthlySalary,
          ),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .select("employeePayProfileId")
        .single();
      if (insProfileErr) throw insProfileErr;
      profileId = newProfile.employeePayProfileId;

      const { error: structErr } = await supabase
        .from("employee_salary_structure")
        .insert({
          employeePayProfileId: profileId,
          totalCtc: parseIntSafe(formData.totalCTC),
          fixedPay: parseIntSafe(formData.fixedPay),
          variablePay: parseIntSafe(formData.variablePay),
          createdAt: now,
          updatedAt: now,
        });
      if (structErr) throw structErr;

      const { error: leaveErr } = await supabase
        .from("employee_leave_allocations")
        .insert({
          employeePayProfileId: profileId,
          totalLeaves: parseIntSafe(formData.totalLeaves),
          sickLeave: parseIntSafe(formData.sickLeave),
          casualLeave: parseIntSafe(formData.casualLeave),
          paidLeave: parseIntSafe(formData.paidLeave),
        });
      if (leaveErr) throw leaveErr;
    }

    if (formData.compType) {
      await supabase
        .from("employee_compensation_types")
        .delete()
        .eq("employeePayProfileId", profileId);
      const { error: compErr } = await supabase
        .from("employee_compensation_types")
        .insert({
          employeePayProfileId: profileId,
          compensationType: mapCompType(formData.compType),
        });
      if (compErr) throw compErr;
    }

    await supabase
      .from("employee_pay_addons")
      .delete()
      .eq("employeePayProfileId", profileId);

    const validAddons = addons.filter((a) => a.typeName && a.amount);
    if (validAddons.length > 0) {
      const addonsToInsert = validAddons.map((a) => ({
        employeePayProfileId: profileId,
        addonType: mapAddonType(a.typeName),
        title: a.typeName,
        amount: parseIntSafe(a.amount),
        payNature: mapPayNature(a.payoutType),
        createdAt: now,
        updatedAt: now,
      }));

      const { error: addonErr } = await supabase
        .from("employee_pay_addons")
        .insert(addonsToInsert);
      if (addonErr) throw addonErr;
    }

    const activeAllowances = formData.activeAllowances || [];
    if (activeAllowances.length > 0) {
      const { data: existingTypes } = await supabase
        .from("salary_component_types")
        .select("salaryComponentTypeId, title")
        .eq("collegeId", collegeId);

      const mappedAllowances = [];

      for (const allowance of activeAllowances) {
        let typeId = existingTypes?.find(
          (t) => t.title.toLowerCase() === allowance.name.toLowerCase(),
        )?.salaryComponentTypeId;

        if (!typeId) {
          const { data: newType, error: typeErr } = await supabase
            .from("salary_component_types")
            .insert({
              title: allowance.name,
              collegeId,
              createdBy: collegeHrId,
              createdAt: now,
              updatedAt: now,
            })
            .select("salaryComponentTypeId")
            .single();

          if (typeErr) throw typeErr;
          typeId = newType.salaryComponentTypeId;
        }

        mappedAllowances.push({
          employeePayProfileId: profileId,
          salaryComponentTypeId: typeId,
          amount: parseIntSafe(allowance.amount),
          createdBy: collegeHrId,
          createdAt: now,
          updatedAt: now,
        });
      }

      await supabase
        .from("employee_salary_component_values")
        .delete()
        .eq("employeePayProfileId", profileId);

      const { error: allowanceErr } = await supabase
        .from("employee_salary_component_values")
        .insert(mappedAllowances);

      if (allowanceErr) throw allowanceErr;
    }

    const selectedCompliances = formData.compliances || [];
    if (selectedCompliances.length > 0) {
      const { data: existingCompTypes } = await supabase
        .from("payroll_compliance_types")
        .select("payrollComplianceTypeId, title")
        .eq("collegeId", collegeId);

      const mappedCompliances = [];

      for (const comp of selectedCompliances) {
        let compTypeId = existingCompTypes?.find(
          (t) => t.title.toLowerCase() === comp.name.toLowerCase(),
        )?.payrollComplianceTypeId;

        if (!compTypeId) {
          const { data: newCompType, error: compTypeErr } = await supabase
            .from("payroll_compliance_types")
            .insert({
              title: comp.name,
              collegeId,
              createdBy: collegeHrId,
              createdAt: now,
              updatedAt: now,
            })
            .select("payrollComplianceTypeId")
            .single();

          if (compTypeErr) throw compTypeErr;
          compTypeId = newCompType.payrollComplianceTypeId;
        }

        mappedCompliances.push({
          employeePayProfileId: profileId,
          payrollComplianceTypeId: compTypeId,
          amount: parseIntSafe(comp.amount),
          createdBy: collegeHrId,
          createdAt: now,
          updatedAt: now,
        });
      }

      await supabase
        .from("employee_payroll_compliance_values")
        .delete()
        .eq("employeePayProfileId", profileId);

      const { error: complianceErr } = await supabase
        .from("employee_payroll_compliance_values")
        .insert(mappedCompliances);

      if (complianceErr) throw complianceErr;
    }

    return { success: true };
  } catch (error: any) {
    console.error(
      "Database Insert/Update Error Details:",
      JSON.stringify(error, null, 2),
    );
    return {
      success: false,
      error:
        error.message || error.details || "An unknown database error occurred.",
    };
  }
};
