import { supabase } from "@/lib/supabaseClient";
import { saveStaffBank } from "../../staffOnBoarding/staffBankDetailsAPI";
import { saveStaffAadhaar } from "../../staffOnBoarding/staffAadharDetailsAPI";
import { saveStaffPan } from "../../staffOnBoarding/staffPanDetailsAPI";

export interface StaffOnboardingRecord {
  userId: number;
  name: string;
  mobile: string;
  id: string;
  role: string;
  email: string;
  educationType: string;
  joiningDate: string;
  experience: string;
  gender: string;
  status: "Onboard" | "Onboarding" | "Onboarded";
}

export const fetchStaffForOnboarding = async (
  collegeId: number,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: StaffOnboardingRecord[]; totalCount: number }> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const {
      data: users,
      error,
      count,
    } = await supabase
      .from("users")
      .select(
        `
        userId, fullName, mobile, role, email, collegeCode, dateOfJoining, professionalExperienceYears, gender,
        staff_aadhaar_details(userId),
        staff_bank_details(userId),
        staff_pan_details(userId)
        
      `,
        { count: "exact" },
      )
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .not("role", "in", '("Student","Parent")')
      .order("fullName", { ascending: true })
      .range(from, to);

    if (error) throw error;
    if (!users) return { data: [], totalCount: 0 };

    const formattedData = users.map((u: any) => {
      const hasAadhaar = Array.isArray(u.staff_aadhaar_details)
        ? u.staff_aadhaar_details.length > 0
        : !!u.staff_aadhaar_details;
      const hasBank = Array.isArray(u.staff_bank_details)
        ? u.staff_bank_details.length > 0
        : !!u.staff_bank_details;
      const hasPan = Array.isArray(u.staff_pan_details)
        ? u.staff_pan_details.length > 0
        : !!u.staff_pan_details;

      const isOnboarded = hasAadhaar && hasBank && hasPan;

      let status: "Onboard" | "Onboarding" | "Onboarded" = "Onboard";
      if (isOnboarded) status = "Onboarded";
      else if (hasAadhaar || hasBank || hasPan) status = "Onboarding"; // Partially filled

      return {
        userId: u.userId,
        name: u.fullName || "N/A",
        gender: u.gender,
        mobile: u.mobile || "N/A",
        id: `ID-${u.userId.toString().padStart(6, "0")}`,
        role: u.role || "Staff",
        email: u.email || "N/A",
        educationType: u.collegeEducationType || "N/A",
        joiningDate: u.dateOfJoining
          ? new Date(u.dateOfJoining).toLocaleDateString("en-GB")
          : "N/A",
        experience: u.professionalExperienceYears
          ? `${u.professionalExperienceYears} Years`
          : "N/A",
        status,
      };
    });

    return { data: formattedData, totalCount: count || 0 };
  } catch (error) {
    console.error("Error fetching paginated staff for onboarding:", error);
    return { data: [], totalCount: 0 };
  }
};

export const saveEmployeeOnboardingDetails = async (
  userId: number,
  formData: any,
) => {
  try {
    if (formData.gender) {
      await supabase
        .from("users")
        .update({ gender: formData.gender })
        .eq("userId", userId);
    }

    const bankRes = await saveStaffBank({
      staffBankId: formData.staffBankId,
      userId,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      accountHolderName: formData.accountHolderName,
      branch: formData.branch,
    });
    if (!bankRes.success) throw new Error("Failed to save Bank Details.");

    const aadhaarRes = await saveStaffAadhaar({
      staffAadhaarId: formData.staffAadhaarId,
      userId,
      aadhaarNumber: formData.aadhaarNumber,
      enrollmentNumber: formData.enrollmentNumber,
      dateOfBirth: formData.aadhaarDob,
      address: formData.address,
      nameOnAadhaar: formData.nameOnAadhaar,
    });
    if (!aadhaarRes.success) throw new Error("Failed to save Aadhaar Details.");

    const panRes = await saveStaffPan({
      staffPanId: formData.staffPanId,
      userId,
      panNumber: formData.panNumber,
      nameOnPan: formData.nameOnPan,
      fatherName: formData.fatherName,
      dateOfBirth: formData.panDob,
    });
    if (!panRes.success) throw new Error("Failed to save PAN Details.");

    return { success: true };
  } catch (error: any) {
    console.error("Save Onboarding Error:", error);
    return {
      success: false,
      error: error.message || "Failed to save onboarding details.",
    };
  }
};
