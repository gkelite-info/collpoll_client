import { supabase } from "@/lib/supabaseClient";

export interface FacultyProfileData {
  id: string;
  facultyId: string;
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
  facultyId: string,
): Promise<FacultyProfileData | null> => {
  try {
    const { data, error } = await supabase
      .from("faculty")
      .select(
        `
        facultyId,
        userId,
        fullName,
        email,
        mobile,
        role,
        users (
          dateOfJoining,
          professionalExperienceYears
        )
      `,
      )
      .eq("facultyId", facultyId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching faculty profile:", error);
      return null;
    }

    if (!data) {
      console.warn(`No faculty member found with facultyId: ${facultyId}.`);
      return null;
    }

    const userData = Array.isArray(data.users) ? data.users[0] : data.users;

    return {
      id: data.userId.toString(),
      facultyId: data.facultyId.toString(),
      name: data.fullName || "Unknown Name",
      email: data.email || "N/A",
      mobile: data.mobile || "N/A",
      joiningDate: userData?.dateOfJoining
        ? new Date(userData.dateOfJoining).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      department: "Computer Science",
      role: data.role || "Faculty",
      experience: userData?.professionalExperienceYears
        ? `${userData.professionalExperienceYears} years`
        : "N/A",
      image: "/rahul.png",
    };
  } catch (err) {
    console.error("Unexpected error fetching faculty data:", err);
    return null;
  }
};
