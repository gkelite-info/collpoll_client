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
  dateOfJoining?: string | null;
  professionalExperienceYears?: number | null;
  identifierValue?: string | null;
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
          .eq("collegeId", collegeId)
          .is("deletedAt", null),
        supabase
          .from("college_branch")
          .select("*")
          .eq("collegeId", collegeId)
          .is("deletedAt", null),
        supabase
          .from("college_academic_year")
          .select("*")
          .eq("collegeId", collegeId)
          .is("deletedAt", null),
        supabase
          .from("college_sections")
          .select("*")
          .eq("collegeId", collegeId)
          .is("deletedAt", null),
        supabase
          .from("college_subjects")
          .select("*")
          .eq("collegeId", collegeId)
          .is("deletedAt", null),
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

export const createFacultyProfile = async (
  userId: number,
  basicData: UserBasicData,
  educationId: number | null,
  branchId: number | null,
  timestamp: string,
  isEditMode: boolean,
): Promise<number> => {
  const fullMobile = `${basicData.mobileCode}${basicData.mobileNumber}`;

  const facultyPayload: any = {
    userId: userId,
    fullName: basicData.fullName,
    email: basicData.email,
    mobile: fullMobile,
    gender: basicData.gender,
    collegeId: basicData.collegeIntId,
    role: "Faculty",
    collegeEducationId: educationId,
    collegeBranchId: branchId,
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

  if (basicData.identifierValue?.trim()) {
    const employeeIdPayload = {
      userId: userId,
      collegeId: basicData.collegeIntId,
      employeeId: basicData.identifierValue.trim(),
      employeeType: "Faculty",
      isActive: true,
      updatedAt: timestamp,
      ...(isEditMode ? {} : { createdAt: timestamp }),
    };

    const { error: idError } = await supabase
      .from("employee_ids")
      .upsert(employeeIdPayload, { onConflict: "userId" });

    if (idError)
      throw new Error(`Employee ID Saving Error: ${idError.message}`);
  }

  return faculty.facultyId;
};

export const clearExistingFacultySections = async (facultyId: number): Promise<void> => {
  const { error } = await supabase
    .from("faculty_sections")
    .delete()
    .eq("facultyId", facultyId);
  if (error) {
    throw new Error(`Failed to clear old faculty sections: ${error.message}`);
  }
};

export const batchInsertFacultySections = async (
  payloads: any[]
): Promise<void> => {
  if (payloads.length === 0) return;

  const { error: sectionError } = await supabase
    .from("faculty_sections")
    .insert(payloads);

  if (sectionError)
    throw new Error(`Faculty Sections Error: ${sectionError.message}`);
};

/** @deprecated Use createFacultyProfile + batchInsertFacultySections directly */
export const persistFaculty = async (
  userId: number,
  basicData: UserBasicData,
  selections: {
    educationId: number;
    branchId: number | null;
    yearId: number;
    subjectId: number;
    sectionIds: number[];
  },
  timestamp: string,
  isEditMode: boolean,
) => {
  const facultyId = await createFacultyProfile(
    userId,
    basicData,
    selections.educationId,
    selections.branchId,
    timestamp,
    isEditMode
  );

  const sectionPayloads = selections.sectionIds.map((sectionId) => ({
    facultyId: facultyId,
    collegeSectionsId: sectionId,
    collegeSubjectId: selections.subjectId,
    collegeAcademicYearId: selections.yearId,
    createdBy: basicData.adminId,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  await batchInsertFacultySections(sectionPayloads);
};
