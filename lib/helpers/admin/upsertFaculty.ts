import { supabase } from "@/lib/supabaseClient";

export type UserBasicData = {
  fullName: string;
  email: string;
  mobileCode: string;
  mobileNumber: string;
  role: string;
  gender: string;
  collegeIntId: number;
  collegePublicId: string;
  collegeCode: string;
  password?: string;
  adminId: number;
};

export async function fetchAdminContext(userId: number) {
  const { data: admin, error } = await supabase
    .from("admins")
    .select("adminId, collegePublicId")
    .eq("userId", userId)
    .is("deletedAt", null)
    .single();

  if (error) throw error;

  const { data: college, error: collegeErr } = await supabase
    .from("colleges")
    .select("collegeId")
    .eq("collegePublicId", admin.collegePublicId)
    .single();

  if (collegeErr) throw collegeErr;

  return {
    adminId: admin.adminId,
    collegeId: college.collegeId,
    collegePublicId: admin.collegePublicId,
  };
}

export const fetchModalInitialData = async (collegeId: number) => {
  try {
    const [educations, branches, years, sections, subjects] = await Promise.all(
      [
        supabase
          .from("college_education")
          .select("*")
          .eq("collegeId", collegeId),
        supabase.from("college_branch").select("*").eq("collegeId", collegeId),
        supabase
          .from("college_academic_year")
          .select("*")
          .eq("collegeId", collegeId),
        supabase
          .from("college_sections")
          .select("*")
          .eq("collegeId", collegeId),
        supabase
          .from("college_subjects")
          .select("*")
          .eq("collegeId", collegeId),
      ],
    );

    return {
      educations: educations.data || [],
      branches: branches.data || [],
      years: years.data || [],
      sections: sections.data || [],
      subjects: subjects.data || [],
    };
  } catch (error) {
    console.error("Critical error in fetchModalInitialData:", error);
    return {
      educations: [],
      branches: [],
      years: [],
      sections: [],
      subjects: [],
    };
  }
};

export const persistFaculty = async (
  userId: number,
  basicData: UserBasicData,
  selections: {
    educationId: number;
    branchId: number;
    yearId: number;
    subjectId: number;
    sectionIds: number[];
  },
  timestamp: string,
  isEditMode: boolean,
) => {
  const fullMobile = `${basicData.mobileCode}${basicData.mobileNumber}`;

  const facultyPayload: any = {
    userId: userId,
    fullName: basicData.fullName,
    email: basicData.email,
    mobile: fullMobile,
    gender: basicData.gender,
    collegeId: basicData.collegeIntId,
    role: "Faculty",
    collegeEducationId: selections.educationId,
    collegeBranchId: selections.branchId,
    createdBy: basicData.adminId,
    isActive: true,
    updatedAt: timestamp,
  };

  if (!isEditMode) facultyPayload.createdAt = timestamp;
  else delete facultyPayload.createdBy;

  const { data: faculty, error: facultyError } = await supabase
    .from("faculty")
    .upsert(facultyPayload, { onConflict: "userId" })
    .select("facultyId")
    .single();

  if (facultyError)
    throw new Error(`Faculty Profile Error: ${facultyError.message}`);

  if (selections.sectionIds.length > 0) {
    const sectionPayloads = selections.sectionIds.map((sectionId) => ({
      facultyId: faculty.facultyId,
      collegeSectionsId: sectionId,
      collegeSubjectId: selections.subjectId,
      collegeAcademicYearId: selections.yearId,
      createdBy: basicData.adminId,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    const { error: sectionError } = await supabase
      .from("faculty_sections")
      .insert(sectionPayloads);

    if (sectionError)
      throw new Error(`Faculty Sections Error: ${sectionError.message}`);
  }
};
