import { supabase } from "@/lib/supabaseClient";
import { getStudentId } from "@/lib/helpers/studentAPI";
import { fetchStudentContext } from "./student/studentContextAPI";
import { fetchFacultyContext } from "./faculty/facultyContextAPI";
import { fetchAdminContext } from "./admin/adminContextAPI";
import { fetchFinanceManagerContext } from "./financeManager/financeManagerContextAPI";
import { getEmployeeEmpId, getStudentRollNo } from "@/lib/helpers/identifiers/upsertIdentifier";
import { getUserProfilePhoto } from "@/lib/helpers/profile/profileInfo";
import { QueryClient } from "@tanstack/react-query";

type FacultySectionContext = {
  college_sections?: {
    collegeSections?: string | null;
  } | null;
};
type StudentPinContext =
  | { pinNumber?: string | null }
  | { pinNumber?: string | null }[];
type WellbeingCollegeDetailContext = {
  college_education?: { collegeEducationType?: string | null } | null;
  college_branch?: { collegeBranchCode?: string | null } | null;
  college_academic_year?: { collegeAcademicYear?: string | null } | null;
  college_sections?: { collegeSections?: string | null } | null;
};
type WellbeingContextRow = {
  wellBeingId: number;
  registrationType?: string | null;
};
type WellbeingAssignedCategoryContext = {
  wellBeingId: number;
  categoryId: number;
  wellbeing_categories?:
    | { categoryName?: string | null }
    | { categoryName?: string | null }[]
    | null;
};
type CollegeEducationRelation =
  | { collegeEducationType?: string | null }
  | { collegeEducationType?: string | null }[]
  | null
  | undefined;

const uniqueJoinedValues = (values: Array<string | null | undefined>) =>
  Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).join(", ") || null;

const getCollegeEducationType = (relation: CollegeEducationRelation) =>
  Array.isArray(relation)
    ? relation[0]?.collegeEducationType ?? null
    : relation?.collegeEducationType ?? null;

export async function fetchUserFullProfile(queryClient: QueryClient) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select(
      "userId, fullName, mobile, email, gender, role, collegePublicId, collegeId, dateOfJoining, professionalExperienceYears, colleges(collegeCode)"
    )
    .eq("auth_id", user.id)
    .maybeSingle();

  if (error || !userData) {
    throw new Error("User data not found in DB");
  }

  const uid = userData.userId;
  const cid = Number(userData.collegeId);
  const role = userData.role;

  // Base state
  let result: any = {
    userId: uid,
    fullName: userData.fullName,
    mobile: userData.mobile,
    email: userData.email,
    gender: userData.gender,
    role: role,
    collegePublicId: userData.collegePublicId,
    collegeId: userData.collegeId,
    collegeCode: (userData as any).colleges?.collegeCode ?? null,
    dateOfJoining: userData.dateOfJoining ?? null,
    professionalExperienceYears: userData.professionalExperienceYears ?? null,
    profilePhoto: null,
    
    // Initialize all optional keys to null/[] to avoid missing keys
    studentId: null,
    adminId: null,
    financeManagerId: null,
    accountantId: null,
    facultyId: null,
    collegeAdminId: null,
    parentId: null,
    collegeHrId: null,
    placementEmployeeId: null,
    wellBeingId: null,
    wellBeingIds: [],
    wellBeingRegistrationTypes: [],
    wellBeingCategoryId: null,
    wellBeingCategoryIds: [],
    wellBeingCategoryName: null,
    wellBeingCategoryNames: [],
    collegeEducationId: null,
    collegeEducationType: null,
    collegeBranchCode: null,
    collegeAcademicYear: null,
    collegeSection: null,
    identifierId: null,
  };

  try {
    const photoData = await getUserProfilePhoto(uid);
    result.profilePhoto = photoData?.profileUrl ?? null;
  } catch {}

  const loadWellbeingContext = async (
    roleType: "wellbeingExecutive" | "wellbeingManager",
  ) => {
    const [{ data }, empId, userRes] = await Promise.all([
      supabase
        .from("well_beings")
        .select(`wellBeingId, registrationType`)
        .eq("userId", uid)
        .eq("collegeId", cid)
        .eq("roleType", roleType)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .order("wellBeingId", { ascending: true }),
      getEmployeeEmpId(uid, cid),
      supabase.from("users").select("gender").eq("userId", uid).maybeSingle(),
    ]);

    const rows = (data ?? []) as WellbeingContextRow[];
    const wellBeingIdsForRole = rows.map((row) => row.wellBeingId);
    result.wellBeingId = rows[0]?.wellBeingId ?? null;
    result.wellBeingIds = wellBeingIdsForRole;
    result.wellBeingRegistrationTypes = rows
        .map((row) => row.registrationType)
        .filter((type): type is string => Boolean(type));

    const { data: assignedCategoryRows } = wellBeingIdsForRole.length
      ? await supabase
        .from("wellbeing_assigned_categories")
        .select(`wellBeingId, categoryId`)
        .in("wellBeingId", wellBeingIdsForRole)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .order("assignedCategoryId", { ascending: true })
      : { data: [] };
    const assignedCategories = (assignedCategoryRows ?? []) as WellbeingAssignedCategoryContext[];
    const assignedCategoryIds = Array.from(
      new Set(
        assignedCategories
          .map((category) => category.categoryId)
          .filter((categoryId): categoryId is number => Boolean(categoryId)),
      ),
    );
    const firstCategory = assignedCategories[0];
    const { data: categoryRows } = assignedCategoryIds.length
      ? await supabase
        .from("wellbeing_categories")
        .select("categoryId, categoryName")
        .in("categoryId", assignedCategoryIds)
      : { data: [] };
    const categoryNameById = new Map(
      ((categoryRows ?? []) as { categoryId: number; categoryName?: string | null }[]).map(
        (category) => [category.categoryId, category.categoryName ?? null],
      ),
    );
    result.wellBeingCategoryId = firstCategory?.categoryId ?? null;
    result.wellBeingCategoryIds = assignedCategoryIds;
    result.wellBeingCategoryName = firstCategory?.categoryId ? categoryNameById.get(firstCategory.categoryId) ?? null : null;
    result.wellBeingCategoryNames = assignedCategoryIds
        .map((categoryId) => categoryNameById.get(categoryId))
        .filter((categoryName): categoryName is string => Boolean(categoryName));
    result.gender = userRes.data?.gender ?? result.gender;
    result.identifierId = empId ?? (rows[0]?.wellBeingId ? String(rows[0].wellBeingId) : null);

    const collegeWellBeingIds = rows
      .filter((row) => row.registrationType !== "hostel")
      .map((row) => row.wellBeingId);

    if (!collegeWellBeingIds.length) {
      result.collegeEducationType = null;
      result.collegeBranchCode = null;
      result.collegeAcademicYear = null;
      result.collegeSection = null;
      return;
    }

    const { data: collegeDetails } = await supabase
      .from("wellbeing_college_details")
      .select(`
        college_education:collegeEducationId ( collegeEducationType ),
        college_branch:collegeBranchId ( collegeBranchCode ),
        college_academic_year:collegeAcademicYearId ( collegeAcademicYear ),
        college_sections:collegeSectionsId ( collegeSections )
      `)
      .in("wellBeingId", collegeWellBeingIds);

    const details = (collegeDetails ?? []) as WellbeingCollegeDetailContext[];
    result.collegeEducationType = uniqueJoinedValues(details.map((detail) => detail.college_education?.collegeEducationType));
    result.collegeBranchCode = uniqueJoinedValues(details.map((detail) => detail.college_branch?.collegeBranchCode));
    result.collegeAcademicYear = uniqueJoinedValues(details.map((detail) => detail.college_academic_year?.collegeAcademicYear));
    result.collegeSection = uniqueJoinedValues(details.map((detail) => detail.college_sections?.collegeSections));
  };

  // Run role loader logic
  const normalizedRole = role.replace(/[\s_-]/g, "").toLowerCase();
  if (role === "Student") {
      const [sid, studentCtx] = await Promise.all([
        getStudentId(),
        fetchStudentContext(uid),
      ]);
      result.studentId = sid;
      result.collegeEducationType = studentCtx?.collegeEducationType ?? null;
      result.collegeBranchCode = studentCtx?.collegeBranchCode ?? null;
      result.collegeAcademicYear = studentCtx?.collegeAcademicYear ?? null;
      result.collegeSection = studentCtx?.collegeSections ?? null;
      if (sid) {
        result.identifierId = await getStudentRollNo(sid, cid);
      }
  } else if (role === "Admin") {
      const [adminData, adminCtx, empId] = await Promise.all([
        supabase.from("admins").select("adminId").eq("userId", uid).is("deletedAt", null).maybeSingle(),
        fetchAdminContext(uid),
        getEmployeeEmpId(uid, cid),
      ]);
      result.adminId = adminData.data?.adminId ?? null;
      result.collegeEducationId = adminCtx?.collegeEducationId ?? null;
      result.collegeEducationType = adminCtx?.collegeEducationType ?? null;
      result.identifierId = empId ?? null;
  } else if (normalizedRole === "finance" || normalizedRole === "financemanager") {
      const [financeData, financeCtx, empId] = await Promise.all([
        supabase.from("finance_manager").select("financeManagerId").eq("userId", uid).eq("is_deleted", false).maybeSingle(),
        fetchFinanceManagerContext(uid).catch(() => null),
        getEmployeeEmpId(uid, cid),
      ]);
      result.financeManagerId = financeData.data?.financeManagerId ?? null;
      result.identifierId = empId ?? null;

      if (!financeData.data?.financeManagerId) {
        result.collegeEducationType = financeCtx?.collegeEducationType ?? null;
      } else {
        const { data: educationTypes } = await supabase
          .from("finance_manager_education_types")
          .select(`collegeEducationId, college_education:collegeEducationId (collegeEducationType)`)
          .eq("financeManagerId", financeData.data.financeManagerId)
          .eq("isActive", true)
          .eq("is_deleted", false)
          .is("deletedAt", null);
        
        const educationTypeFromMapping = uniqueJoinedValues((educationTypes ?? []).map((edu) => getCollegeEducationType(edu.college_education as any)));
        result.collegeEducationType = educationTypeFromMapping || financeCtx?.collegeEducationType || null;

      }

      if (!result.collegeEducationType) {
        const { data: collegeEducationTypes } = await supabase
          .from("college_education")
          .select("collegeEducationType")
          .eq("collegeId", cid)
          .eq("isActive", true)
          .is("deletedAt", null)
          .order("collegeEducationType", { ascending: true });

        result.collegeEducationType = uniqueJoinedValues(
          (collegeEducationTypes ?? []).map(
            (education) => education.collegeEducationType,
          ),
        );
      }
  } else if (role === "Accountant") {
      const [{ data }, empId] = await Promise.all([
        supabase.from("accountants").select(`accountantId, collegeEducationId, college_education:collegeEducationId (collegeEducationType)`).eq("userId", uid).eq("collegeId", cid).eq("isActive", true).eq("is_deleted", false).is("deletedAt", null).maybeSingle(),
        getEmployeeEmpId(uid, cid),
      ]);
      result.accountantId = data?.accountantId ?? null;
      result.identifierId = empId ?? (data?.accountantId ? String(data.accountantId) : null);
      if (data?.accountantId) {
        const { data: educationTypes } = await supabase
          .from("accountant_education_types")
          .select(`collegeEducationId, college_education:collegeEducationId (collegeEducationType)`)
          .eq("accountantId", data.accountantId)
          .eq("isActive", true)
          .eq("is_deleted", false)
          .is("deletedAt", null);
        const educationTypeFromMapping = uniqueJoinedValues((educationTypes ?? []).map((edu) => getCollegeEducationType(edu.college_education)));
        result.collegeEducationType = educationTypeFromMapping || getCollegeEducationType(data.college_education);
      }
  } else if (role === "Faculty") {
      const [facultyCtx, empId] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: ["facultyContext", uid],
          queryFn: () => fetchFacultyContext(uid),
          staleTime: 5 * 60 * 1000,
        }),
        getEmployeeEmpId(uid, cid),
      ]);
      result.facultyId = facultyCtx?.facultyId ?? null;
      result.collegeEducationType = facultyCtx?.faculty_edu_type ?? null;
      result.collegeBranchCode = facultyCtx?.college_branch ?? null;
      result.collegeAcademicYear = facultyCtx?.collegeAcademicYear ?? null;
      const sections = facultyCtx?.sections?.map((sec: FacultySectionContext) => sec.college_sections?.collegeSections).filter(Boolean).join(", ") ?? null;
      result.collegeSection = sections;
      result.identifierId = empId ?? null;
  } else if (role === "CollegeAdmin") {
      const [{ data }, empId] = await Promise.all([
        supabase.from("college_admin").select("collegeAdminId").eq("userId", uid).eq("is_deleted", false).maybeSingle(),
        getEmployeeEmpId(uid, cid),
      ]);
      result.collegeAdminId = data?.collegeAdminId ?? null;
      result.identifierId = empId ?? null;
  } else if (role === "Parent") {
      const { data: parentData } = await supabase.from("parents").select("parentId, studentId").eq("userId", uid).eq("is_deleted", false).maybeSingle();
      result.parentId = parentData?.parentId ?? null;
      if (parentData?.studentId) {
        const [userRes, studentRes] = await Promise.all([
          supabase.from("users").select("gender").eq("userId", uid).maybeSingle(),
          supabase.from("students").select("student_pins(pinNumber)").eq("studentId", parentData.studentId).maybeSingle(),
        ]);
        if (userRes.data?.gender && studentRes.data?.student_pins) {
          const genderInitial = userRes.data.gender === "Male" ? "F" : "M";
          const pins = studentRes.data.student_pins as StudentPinContext;
          const pinNumber = Array.isArray(pins) ? pins[0]?.pinNumber : pins?.pinNumber;
          result.identifierId = `${pinNumber}/${genderInitial}`;
        }
      }
  } else if (role === "CollegeHr") {
      const [{ data }, empId, { data: educationTypes }] = await Promise.all([
        supabase.from("college_hr").select("collegeHrId").eq("userId", uid).eq("is_deleted", false).maybeSingle(),
        getEmployeeEmpId(uid, cid),
        supabase
          .from("college_education")
          .select("collegeEducationType")
          .eq("collegeId", cid)
          .eq("isActive", true),
      ]);
      result.collegeHrId = data?.collegeHrId ?? null;
      result.identifierId = empId ?? null;
      result.collegeEducationType = uniqueJoinedValues(
        (educationTypes ?? []).map((education) => education.collegeEducationType),
      );
  } else if (role === "PlacementOfficer") {
      const [{ data }, empId] = await Promise.all([
        supabase.from("placement_employee").select("placementEmployeeId, createdBy").eq("userId", uid).eq("is_deleted", false).maybeSingle(),
        getEmployeeEmpId(uid, cid),
      ]);
      result.placementEmployeeId = data?.placementEmployeeId ?? null;
      result.identifierId = empId ?? null;
      if (data?.createdBy) {
        const { data: adminEducationTypes } = await supabase
          .from("admin_education_types")
          .select(`collegeEducationId, college_education:collegeEducationId (collegeEducationType)`)
          .eq("adminId", data.createdBy)
          .eq("isActive", true)
          .eq("is_deleted", false)
          .is("deletedAt", null);
        const educationTypeFromMapping = uniqueJoinedValues((adminEducationTypes ?? []).map((edu) => getCollegeEducationType(edu.college_education)));
        if (educationTypeFromMapping) {
          result.collegeEducationType = educationTypeFromMapping;
        } else {
          const { data: admin } = await supabase.from("admins").select(`college_education:collegeEducationId (collegeEducationType)`).eq("adminId", data.createdBy).maybeSingle();
          result.collegeEducationType = getCollegeEducationType(admin?.college_education);
        }
      }
  } else if (role === "WellbeingExecutive") {
      await loadWellbeingContext("wellbeingExecutive");
  } else if (role === "WellbeingManager") {
      await loadWellbeingContext("wellbeingManager");
  }

  return result;
}
