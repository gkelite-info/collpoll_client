// import { supabase } from "@/lib/supabaseClient";

// export interface StaffOnboardingRecord {
//   userId: number;
//   name: string;
//   mobile: string;
//   id: string;
//   role: string;
//   email: string;
//   branch: string;
//   joiningDate: string;
//   experience: string;
//   gender: string;
//   status: "Onboard" | "Onboarded";
// }

// export const fetchStaffForOnboarding = async (
//   collegeId: number,
// ): Promise<StaffOnboardingRecord[]> => {
//   try {
//     // Fetch all active non-student/non-parent users for this college
//     const { data: users, error: usersErr } = await supabase
//       .from("users")
//       .select(
//         "userId, fullName, mobile, role, email, collegeCode, dateOfJoining, professionalExperienceYears, gender",
//       )
//       .eq("collegeId", collegeId)
//       .eq("isActive", true)
//       .not("role", "in", '("Student","Parent")')
//       .order("fullName", { ascending: true });

//     if (usersErr) throw usersErr;
//     if (!users || users.length === 0) return [];

//     const userIds = users.map((u) => u.userId);

//     // Fetch existence in the 3 required tables concurrently for performance
//     const [aadhaarRes, bankRes, panRes] = await Promise.all([
//       supabase
//         .from("staff_aadhaar_details")
//         .select("userId")
//         .in("userId", userIds),
//       supabase
//         .from("staff_bank_details")
//         .select("userId")
//         .in("userId", userIds),
//       supabase.from("staff_pan_details").select("userId").in("userId", userIds),
//     ]);

//     const aadhaarSet = new Set(aadhaarRes.data?.map((r) => r.userId) || []);
//     const bankSet = new Set(bankRes.data?.map((r) => r.userId) || []);
//     const panSet = new Set(panRes.data?.map((r) => r.userId) || []);

//     return users.map((u) => {
//       const isOnboarded =
//         aadhaarSet.has(u.userId) &&
//         bankSet.has(u.userId) &&
//         panSet.has(u.userId);

//       return {
//         userId: u.userId,
//         name: u.fullName || "N/A",
//         gender: u.gender,
//         mobile: u.mobile || "N/A",
//         id: `ID - ${u.userId}`,
//         role: u.role || "Staff",
//         email: u.email || "N/A",
//         branch: u.collegeCode || "N/A",
//         joiningDate: u.dateOfJoining
//           ? new Date(u.dateOfJoining).toLocaleDateString("en-GB")
//           : "N/A",
//         experience: u.professionalExperienceYears
//           ? `${u.professionalExperienceYears} Years`
//           : "N/A",
//         status: isOnboarded ? "Onboarded" : "Onboard",
//       };
//     });
//   } catch (error) {
//     console.error("Error fetching staff for onboarding:", error);
//     return [];
//   }
// };

// // 2. SAVE ONBOARDING DETAILS (TRANSACTIONAL-STYLE BATCH)
// export const saveEmployeeOnboardingDetails = async (
//   userId: number,
//   formData: any,
// ) => {
//   const now = new Date().toISOString();

//   try {
//     // Insert Bank Details
//     const { error: bankErr } = await supabase
//       .from("staff_bank_details")
//       .insert({
//         userId,
//         bankName: formData.bankName,
//         accountNumber: formData.accountNumber,
//         ifscCode: formData.ifscCode,
//         accountHolderName: formData.accountHolderName,
//         branch: formData.branch || null,
//         isPrimary: true,
//         isActive: true,
//         createdAt: now,
//         updatedAt: now,
//       });
//     if (bankErr) throw new Error(`Bank Details Error: ${bankErr.message}`);

//     // Insert Aadhaar Details
//     const { error: aadhaarErr } = await supabase
//       .from("staff_aadhaar_details")
//       .insert({
//         userId,
//         aadhaarNumber: formData.aadhaarNumber,
//         enrollmentNumber: formData.enrollmentNumber || null,
//         dateOfBirth: formData.aadhaarDob,
//         address: formData.address || null,
//         nameOnAadhaar: formData.nameOnAadhaar,
//         createdAt: now,
//         updatedAt: now,
//       });
//     if (aadhaarErr)
//       throw new Error(`Aadhaar Details Error: ${aadhaarErr.message}`);

//     // Insert PAN Details
//     const { error: panErr } = await supabase.from("staff_pan_details").insert({
//       userId,
//       panNumber: formData.panNumber.toUpperCase(),
//       nameOnPan: formData.nameOnPan,
//       fatherName: formData.fatherName,
//       dateOfBirth: formData.panDob,
//       createdAt: now,
//       updatedAt: now,
//     });
//     if (panErr) throw new Error(`PAN Details Error: ${panErr.message}`);

//     return { success: true };
//   } catch (error: any) {
//     console.error("Save Onboarding Error:", error);
//     return {
//       success: false,
//       error: error.message || "Failed to save onboarding details.",
//     };
//   }
// };

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
  branch: string;
  joiningDate: string;
  experience: string;
  gender: string;
  status: "Onboard" | "Onboarding" | "Onboarded";
}

// 1. PAGINATED FETCH (Highly Efficient Single Query)
export const fetchStaffForOnboarding = async (
  collegeId: number,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: StaffOnboardingRecord[]; totalCount: number }> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // We use a relational join to fetch existence in child tables without extra queries
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
      // Check if data exists in the joined tables
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
        branch: u.collegeCode || "N/A",
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

// 2. REFACTORED SAVE HELPER (Uses your modular functions)
export const saveEmployeeOnboardingDetails = async (
  userId: number,
  formData: any,
) => {
  try {
    // 1. Update User Gender
    if (formData.gender) {
      await supabase
        .from("users")
        .update({ gender: formData.gender })
        .eq("userId", userId);
    }

    // 2. Save Bank
    const bankRes = await saveStaffBank({
      staffBankId: formData.staffBankId, // Triggers update if exists
      userId,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      accountHolderName: formData.accountHolderName,
      branch: formData.branch,
    });
    if (!bankRes.success) throw new Error("Failed to save Bank Details.");

    // 3. Save Aadhaar
    const aadhaarRes = await saveStaffAadhaar({
      staffAadhaarId: formData.staffAadhaarId, // Triggers update if exists
      userId,
      aadhaarNumber: formData.aadhaarNumber,
      enrollmentNumber: formData.enrollmentNumber,
      dateOfBirth: formData.aadhaarDob,
      address: formData.address,
      nameOnAadhaar: formData.nameOnAadhaar,
    });
    if (!aadhaarRes.success) throw new Error("Failed to save Aadhaar Details.");

    // 4. Save PAN
    const panRes = await saveStaffPan({
      staffPanId: formData.staffPanId, // Triggers update if exists
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
