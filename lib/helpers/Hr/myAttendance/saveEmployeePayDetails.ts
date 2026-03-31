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
  const mapJobType = (uiValue: string) => uiValue.toUpperCase();

  const mapCompType = (uiValue: string) => {
    if (uiValue === "Direct Payment") return "DIRECT_PAYMENT";
    return uiValue.toUpperCase();
  };

  const mapPayNature = (uiValue: string) => uiValue.toUpperCase();

  const mapAddonType = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("bonus")) return "BONUS";
    if (lower.includes("joining") || lower.includes("compensation"))
      return "JOINING";
    if (lower.includes("maintenance")) return "MAINTENANCE";
    return "OTHERS";
  };

  const parseIntSafe = (val: string) =>
    parseInt(val.toString().replace(/,/g, "") || "0", 10);

  try {
    const now = new Date().toISOString();

    const { data: existingProfile, error: checkErr } = await supabase
      .from("employee_pay_profiles")
      .select("employeePayProfileId")
      .eq("userId", userId)
      .eq("collegeId", collegeId)
      .maybeSingle();

    if (checkErr) throw checkErr;

    let profileId: number;

    if (existingProfile) {
      profileId = existingProfile.employeePayProfileId;

      const { error: updProfileErr } = await supabase
        .from("employee_pay_profiles")
        .update({
          jobType: mapJobType(formData.jobType),
          monthlySalary: parseIntSafe(formData.monthlySalary),
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

      // Update Leave Allocations
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

      // Replace Compensation Type (Delete old to avoid unique constraint errors, then insert new)
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

      // Clear old Add-ons to make way for the updated list
      await supabase
        .from("employee_pay_addons")
        .delete()
        .eq("employeePayProfileId", profileId);
    }
    // ==========================================
    // INSERT PATH (FRESH RECORD)
    // ==========================================
    else {
      // Insert Profile
      const { data: newProfile, error: insProfileErr } = await supabase
        .from("employee_pay_profiles")
        .insert({
          userId: userId,
          collegeId: collegeId,
          createdBy: collegeHrId,
          jobType: mapJobType(formData.jobType),
          monthlySalary: parseIntSafe(formData.monthlySalary),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .select("employeePayProfileId")
        .single();
      if (insProfileErr) throw insProfileErr;
      profileId = newProfile.employeePayProfileId;

      // Insert Structure
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

      // Insert Leave Allocations (No createdAt in your schema for this table)
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

      // Insert Compensation Type
      const { error: compErr } = await supabase
        .from("employee_compensation_types")
        .insert({
          employeePayProfileId: profileId,
          compensationType: mapCompType(formData.compType),
        });
      if (compErr) throw compErr;
    }

    // ==========================================
    // SHARED: INSERT NEW/UPDATED ADD-ONS
    // ==========================================
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
