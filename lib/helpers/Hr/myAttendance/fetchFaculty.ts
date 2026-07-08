import { supabase } from "@/lib/supabaseClient";

export interface FacultyProfileData {
  id: string;
  facultyId: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  joiningDate: string;
  department: string;
  role: string;
  experience: string;
  image: string;
}

export const fetchFacultyProfile = async (
  userId: string | number,
): Promise<FacultyProfileData | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        userId,
        fullName,
        email,
        mobile,
        role,
        dateOfJoining,
        professionalExperienceYears,
        collegeBranchCode,
        department,
        employee_ids (employeeId),
        user_profile (profilePic)
      `
      )
      .eq("userId", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!data) {
      console.warn(`No staff member found with userId: ${userId}.`);
      return null;
    }

    const employeeIds = Array.isArray(data.employee_ids) ? data.employee_ids[0] : data.employee_ids;
    const userProfile = Array.isArray(data.user_profile) ? data.user_profile[0] : data.user_profile;

    return {
      id: data.userId.toString(),
      facultyId: "-",
      employeeId: employeeIds?.employeeId || "-",
      name: data.fullName || "Unknown Name",
      email: data.email || "N/A",
      mobile: data.mobile || "N/A",
      joiningDate: data.dateOfJoining
        ? new Date(data.dateOfJoining).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
      department: data.collegeBranchCode || data.department || "Computer Science",
      role: data.role || "-",
      experience: data.professionalExperienceYears
        ? `${data.professionalExperienceYears} years`
        : "-",
      image: userProfile?.profilePic || "/assets/images/defaultUser.png",
    };
  } catch (err) {
    console.error("Unexpected error fetching user data:", err);
    return null;
  }
};
