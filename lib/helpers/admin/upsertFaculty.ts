import { supabase } from "@/lib/supabaseClient";

type DepartmentItem = {
  uuid: string;
  name: string;
  code?: string;
};

type SubjectItem = {
  uuid: string;
  name: string;
  code?: string;
};

type SectionItem = {
  uuid: string;
  name: string;
  code?: string;
};

export const upsertFaculty = async (payload: {
  userId: number;
  fullName: string;
  emailId: string;

  mobileNo: string; 
  degree: string;
  gender: "Male" | "Female" | "Other";

  departments: DepartmentItem[];
  subjects: SubjectItem[];
  sections: SectionItem[];
}) => {
  const {
    userId,
    fullName,
    emailId,
    mobileNo,
    degree,
    gender,
    departments,
    subjects,
    sections,
  } = payload;

  const now = new Date().toISOString();

 
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("userId, collegePublicId")
    .eq("userId", userId)
    .single();

  if (userError || !user) {
    throw new Error("User not found");
  }

  const createdBy = user.userId;
  const collegeId = user.collegePublicId; 

  if (!collegeId) {
    throw new Error("User is not mapped to any college");
  }

  
  const mobileRegex = /^\+\d{10,15}$/;

  if (!mobileRegex.test(mobileNo)) {
    throw new Error(
      "Invalid mobile number format. Expected +<countryCode><number>"
    );
  }

  
  const { data: existingFaculty, error: fetchError } = await supabase
    .from("faculty")
    .select("departments, subjects, sections")
    .eq("userId", userId)
    .maybeSingle();

  if (fetchError) throw fetchError;

 
  const mergedDepartments = existingFaculty?.departments
    ? [...existingFaculty.departments, ...departments]
    : departments;

  const mergedSubjects = existingFaculty?.subjects
    ? [...existingFaculty.subjects, ...subjects]
    : subjects;

  const mergedSections = existingFaculty?.sections
    ? [...existingFaculty.sections, ...sections]
    : sections;

  const { data, error } = await supabase
    .from("faculty")
    .upsert(
      {
        userId,
        fullName,
        emailId,
        collegeId,                 
        mobileNo,                 
        role: "Faculty",           
        degree,
        departments: mergedDepartments,
        subjects: mergedSubjects,
        sections: mergedSections,
        gender,
        createdBy,
        updatedAt: now,
        createdAt: now,
      },
      {
        onConflict: "userId", 
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
};
