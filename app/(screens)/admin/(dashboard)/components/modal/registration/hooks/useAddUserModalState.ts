import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { fetchSessionOptions } from "@/lib/helpers/collegeSessionAPI";
import { fetchAdminEducationTypes } from "@/lib/helpers/admin/adminEducationTypesAPI";
import { fetchModalInitialData } from "@/lib/helpers/admin/upsertFaculty";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { TeachingAssignment } from "@/app/(screens)/admin/(dashboard)/components/modal/faculty/facultyAssignmentTypes";
import { createEmptyAssignment } from "@/lib/helpers/admin/registrations/faculty/facultyAssignmentHelpers";
import toast from "react-hot-toast";

const initialBasicData = {
  fullName: "",
  email: "",
  mobileCode: "+91",
  mobileNumber: "",
  role: "",
  gender: "",
  password: "",
  confirmPassword: "",
  studentId: "",
  collegeId: null,
  collegeCode: "",
  collegeIntId: 0,
  adminId: 0,
  dateOfJoining: "",
  professionalExperienceYears: undefined as number | undefined,
  identifierValue: "",
  batch: "",
  wellbeingRegistrationType: "",
  hostelBlock: "",
  buildingNumber: "",
  hostelType: "",
};

const toPascalCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};

export const useAddUserModalState = (isOpen: boolean, user: any, collegeEducationType: string | null) => {
  const { collegeId: contextCollegeId, collegeCode: contextCollegeCode, adminId: contextAdminId, collegePublicId } = useAdmin();
  
  const [processingFields, setProcessingFields] = useState<Record<string, boolean>>({});
  const handleWithLoader = (fieldId: string, action: () => void) => {
    setProcessingFields((prev) => ({ ...prev, [fieldId]: true }));
    setTimeout(() => {
      action();
      setProcessingFields((prev) => ({ ...prev, [fieldId]: false }));
    }, 400);
  };

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [basicData, setBasicData] = useState<any>(initialBasicData);
  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);

  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string[]>([]);
  const [selectedEntryType, setSelectedEntryType] = useState<string[]>([]);
  const [selectedSessionType, setSelectedSessionType] = useState<string[]>([]);
  const [selectedFinanceEducationTypes, setSelectedFinanceEducationTypes] = useState<string[]>([]);
  const [selectedWellbeingEducationTypes, setSelectedWellbeingEducationTypes] = useState<string[]>([]);

  const { data: sessionOptions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: queryKeys.admin.sessionOptions(contextCollegeId!),
    queryFn: () => fetchSessionOptions(contextCollegeId!),
    enabled: isOpen && !!contextCollegeId,
  });

  const { data: adminEducationOptions = [], isLoading: isLoadingEducations } = useQuery({
    queryKey: queryKeys.admin.adminEducations(contextAdminId!),
    queryFn: () => fetchAdminEducationTypes(contextAdminId!),
    enabled: isOpen && !!contextAdminId,
  });

  const { data: dbDataRaw, isLoading: isLoadingDbData } = useQuery({
    queryKey: queryKeys.admin.modalInitialData(contextCollegeId!),
    queryFn: async () => {
      const data = await fetchModalInitialData(contextCollegeId!);
      const { data: semesterData } = await supabase
        .from("college_semester")
        .select("*")
        .eq("collegeId", contextCollegeId)
        .eq("isActive", true);
      return { ...data, semesters: semesterData || [] };
    },
    enabled: isOpen && !!contextCollegeId,
  });

  const dbData = dbDataRaw || {
    educations: [],
    branches: [],
    years: [],
    sections: [],
    subjects: [],
    semesters: [],
  };

  const isFetchingData = isLoadingSessions || isLoadingEducations || isLoadingDbData;

  const [assignments, setAssignments] = useState<TeachingAssignment[]>([
    createEmptyAssignment(),
  ]);

  const resetForm = () => {
    setBasicData((prev: any) => ({
      ...initialBasicData,
      identifierValue: "",
      collegeId: prev.collegeId,
      collegeIntId: prev.collegeIntId,
      collegeCode: prev.collegeCode,
      adminId: prev.adminId,
    }));
    setSelectedEducationId(null);
    setSelectedBranchId(null);
    setSelectedYearId(null);
    setSelectedSubjectId(null);
    setSelectedSectionIds([]);
    setAssignments([createEmptyAssignment()]);
    setSelectedDepts([]);
    setSelectedYears([]);
    setSelectedSections([]);
    setSelectedSemester([]);
    setSelectedEntryType([]);
    setSelectedFinanceEducationTypes([]);
    setSelectedWellbeingEducationTypes([]);
    setIsSuccess(false);
  };

  const handleSingleSelect = (
    value: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setList((prev) => (prev[0] === value ? [] : [value]));
  };

  const toggleMultiSelectValue = (
    value: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setList((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  useEffect(() => {
    if (isOpen) {
      if (!user) {
        setBasicData((prev: any) => ({
          ...initialBasicData,
          collegeId: collegePublicId,
          collegeIntId: contextCollegeId,
          collegeCode: contextCollegeCode,
          adminId: contextAdminId,
        }));
      } else {
        setBasicData((p: any) => ({
          ...p,
          fullName: user.fullName || "",
          email: user.email || "",
          mobileNumber: user.mobile ? user.mobile.slice(-10) : "",
          role: user.role || "Faculty",
          gender: user.gender || "",
          studentId: user.studentId ? String(user.studentId) : "",
          collegeId: collegePublicId,
          collegeIntId: contextCollegeId,
          collegeCode: contextCollegeCode,
          adminId: contextAdminId,
        }));
      }
    } else {
      if (!user) {
        resetForm();
      }
    }
  }, [isOpen, user, contextCollegeId, contextCollegeCode, contextAdminId, collegePublicId]);


  const selectedEducation = useMemo(
    () =>
      dbData.educations.find(
        (e) => e.collegeEducationId === selectedEducationId,
      ),
    [dbData.educations, selectedEducationId],
  );

  const isSelectedSchool = isSchoolEducation(selectedEducation?.collegeEducationType || collegeEducationType);

  const studentSelectedEducation = useMemo(
    () =>
      dbData.educations.find(
        (e) => e.collegeEducationId === selectedEducationId,
      ),
    [dbData.educations, selectedEducationId],
  );

  const studentAvailableBranches = useMemo(
    () =>
      studentSelectedEducation
        ? dbData.branches.filter(
          (b) =>
            b.collegeEducationId ===
            studentSelectedEducation.collegeEducationId,
        )
        : [],
    [studentSelectedEducation, dbData.branches],
  );

  const studentSelectedBranch = useMemo(
    () =>
      studentAvailableBranches.find(
        (b) => b.collegeBranchCode === selectedDepts[0],
      ),
    [studentAvailableBranches, selectedDepts],
  );

  const studentAvailableYears = useMemo(() => {
    if (!isSelectedSchool && !studentSelectedBranch) return [];

    const years = dbData.years.filter(
      (y) => isSelectedSchool
        ? y.collegeEducationId === studentSelectedEducation?.collegeEducationId
        : y.collegeBranchId === studentSelectedBranch?.collegeBranchId,
    );

    return years.sort((a, b) => {
      const numA = parseInt(a.collegeAcademicYear) || 0;
      const numB = parseInt(b.collegeAcademicYear) || 0;
      return numA - numB;
    });
  }, [studentSelectedBranch, studentSelectedEducation, isSelectedSchool, dbData.years]);

  const studentSelectedYear = useMemo(
    () =>
      studentAvailableYears.find(
        (y) => y.collegeAcademicYear === selectedYears[0],
      ),
    [studentAvailableYears, selectedYears],
  );

  const studentAvailableSemesters = useMemo(
    () =>
      studentSelectedYear
        ? dbData.semesters.filter(
          (s) =>
            s.collegeAcademicYearId ===
            studentSelectedYear.collegeAcademicYearId,
        )
        : [],
    [studentSelectedYear, dbData.semesters],
  );

  const studentAvailableSections = useMemo(() => {
    if (!studentSelectedYear) return [];
    const rawSections = dbData.sections.filter(
      (s) =>
        s.collegeAcademicYearId ===
        studentSelectedYear.collegeAcademicYearId &&
        (isSelectedSchool ? s.collegeEducationId === studentSelectedEducation?.collegeEducationId : s.collegeBranchId === studentSelectedBranch?.collegeBranchId)
    );
    return Array.from(
      new Map(rawSections.map((s) => [s.collegeSections, s])).values()
    );
  }, [studentSelectedYear, dbData.sections]);

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "fullName") {
      const onlyAlphabets = value.replace(/[^A-Za-z\s]/g, "");
      formattedValue = toPascalCase(onlyAlphabets);
    } else if (name === "email") {
      formattedValue = value.toLowerCase();
    } else if (name === "mobileCode") {
      if (!/^\+?[0-9]*$/.test(value)) return;
      formattedValue = value;
    } else if (name === "mobileNumber") {
      formattedValue = value.replace(/\D/g, "");
      if (basicData.mobileCode === "+91") {
        if (
          formattedValue.length === 1 &&
          !["6", "7", "8", "9"].includes(formattedValue)
        ) {
          return;
        }
      }
      if (formattedValue.length > 10) return;
    } else if (name === "identifierValue") {
      const sanitized = value.replace(/[^A-Za-z0-9-/]/g, "").toUpperCase();
      if (sanitized.length > 15) return;
      if (sanitized.startsWith("-") || sanitized.startsWith("/")) return;
      const specialCharCount = (sanitized.match(/[-/]/g) || []).length;
      if (
        specialCharCount > 2 ||
        sanitized.includes("--") ||
        sanitized.includes("//") ||
        sanitized.includes("-/") ||
        sanitized.includes("/-")
      ) return;
      formattedValue = sanitized;
    } else if (name === "studentId") {
      formattedValue = value.replace(/[^A-Za-z0-9-]/g, "").toUpperCase();
    } else if (name === "batch") {
      const alphanumeric = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      if (alphanumeric.length > 5) return;
      formattedValue = alphanumeric;
    } else if (name === "hostelBlock") {
      formattedValue = value.replace(/[^A-Za-z0-9\s/-]/g, "").toUpperCase();
    } else if (name === "buildingNumber") {
      formattedValue = value.replace(/[^A-Za-z0-9\s/-]/g, "").toUpperCase();
    } else if (name === "role") {
      setSelectedDepts([]);
      setSelectedYears([]);
      setSelectedSections([]);
      setSelectedSemester([]);
      setSelectedEntryType([]);
      setSelectedFinanceEducationTypes([]);
      setBasicData((p: any) => ({
        ...p,
        wellbeingRegistrationType: "",
        hostelBlock: "",
        buildingNumber: "",
        hostelType: "",
      }));
      formattedValue = value;
    }

    setBasicData((p: any) => ({ ...p, [name]: formattedValue }));
  };

  const selectedSessionId = useMemo(
    () =>
      sessionOptions.find((s) => s.label === selectedSessionType[0])?.id ??
      null,
    [selectedSessionType, sessionOptions],
  );

  return {
    dbData,
    basicData,
    setBasicData,
    processingFields,
    handleWithLoader,
    loading,
    setLoading,
    isFetchingData,
    isSuccess,
    setIsSuccess,
    selectedEducationId,
    setSelectedEducationId,
    selectedBranchId,
    setSelectedBranchId,
    selectedYearId,
    setSelectedYearId,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedSectionIds,
    setSelectedSectionIds,
    selectedDepts,
    setSelectedDepts,
    selectedYears,
    setSelectedYears,
    selectedSections,
    setSelectedSections,
    selectedSemester,
    setSelectedSemester,
    selectedEntryType,
    setSelectedEntryType,
    selectedSessionType,
    setSelectedSessionType,
    selectedFinanceEducationTypes,
    setSelectedFinanceEducationTypes,
    selectedWellbeingEducationTypes,
    setSelectedWellbeingEducationTypes,
    sessionOptions,
    adminEducationOptions,
    assignments,
    setAssignments,
    handleBasicChange,
    handleSingleSelect,
    toggleMultiSelectValue,
    resetForm,
    studentSelectedEducation,
    studentAvailableBranches,
    studentSelectedBranch,
    studentAvailableYears,
    studentSelectedYear,
    studentAvailableSemesters,
    studentAvailableSections,
    selectedSessionId,
    isSelectedSchool
  };
};
