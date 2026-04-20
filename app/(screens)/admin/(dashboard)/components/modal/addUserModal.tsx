"use client";
import {
  fetchModalInitialData,
  persistFaculty,
} from "@/lib/helpers/admin/upsertFaculty";
import { persistUser } from "@/lib/helpers/admin/registrations/persistUser";
import { upsertParentEntry } from "@/lib/helpers/parent/createParent";
import { supabase } from "@/lib/supabaseClient";
import { CaretDown, Eye, EyeSlash, Lock, X } from "@phosphor-icons/react";
import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CustomMultiSelect } from "./userModalComponents";
import {
  createStudent,
  createStudentFeeObligation,
} from "@/lib/helpers/admin/registrations/student/studentRegistration";
import { createStudentAcademicHistory } from "@/lib/helpers/admin/registrations/student/academicHistoryRegistration";
import { createFinanceManager } from "@/lib/helpers/admin/registrations/finance/financeManagerRegistration";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import {
  upsertAdminEntry,
  upsertCollegeHR,
  upsertUser,
} from "@/lib/helpers/upsertUser";
import { fetchSessionOptions } from "@/lib/helpers/collegeSessionAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { createCollegeHR } from "@/lib/helpers/admin/registrations/collegeHr/hrRegistration";
import { upsertIdentifier } from "@/lib/helpers/identifiers/upsertIdentifier";
import { upsertPlacementEmployee } from "@/lib/helpers/admin/registrations/placement/placementregistration";
// ✅ NEW: Placement Officer helper
// import { upsertPlacementOfficer } from "@/lib/helpers/admin/registrations/placement/placementRegistration";

type SubjectBlock = {
  id: number;
  yearId: number | null;
  subjectId: number | null;
  sectionIds: number[];
};

const toPascalCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};

const validatePassword = (password: string) => {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    return "Password must contain one uppercase, one lowercase, one number and one special character.";
  }
  return null;
};

const IDENTIFIER_REGEX = /^(?=.*\d)[A-Za-z0-9]+(-[A-Za-z0-9]+)?$/;

const validateIdentifier = (value: string) => {
  if (!value?.trim()) {
    return "is required.";
  }
  if (value.length < 6 || value.length > 15 || !IDENTIFIER_REGEX.test(value)) {
    return "Must be 6–15 characters and include at least one number. Only letters, numbers and one hyphen (-) allowed.";
  }

  return null;
};

const AddUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}> = ({ isOpen, onClose, user }) => {
  const [dbData, setDbData] = useState<{
    educations: any[];

    branches: any[];
    years: any[];
    sections: any[];
    subjects: any[];
    semesters: any[];
  }>({
    educations: [],
    branches: [],
    years: [],
    sections: [],
    subjects: [],
    semesters: [],
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  };
  const [basicData, setBasicData] = useState<any>(initialBasicData);

  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(
    null,
  );
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);

  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string[]>([]);
  const [selectedEntryType, setSelectedEntryType] = useState<string[]>([]);
  const [selectedSessionType, setSelectedSessionType] = useState<string[]>([]);
  const [sessionOptions, setSessionOptions] = useState<
    { id: number; label: string; value: number }[]
  >([]);

  const [isSuccess, setIsSuccess] = useState(false);
  const { collegeEducationId, collegeEducationType } = useAdmin();

  const ENTRY_TYPES = ["Regular", "Lateral", "Transfer"];
  const INTER_ENTRY = ["Regular", "Transfer"];

  const [subjectBlocks, setSubjectBlocks] = useState<SubjectBlock[]>([
    { id: 1, yearId: null, subjectId: null, sectionIds: [] }
  ]);

  const addSubjectBlock = () =>
    setSubjectBlocks(prev => [...prev, { id: Date.now(), yearId: null, subjectId: null, sectionIds: [] }]);

  const removeSubjectBlock = (id: number) =>
    setSubjectBlocks(prev => prev.filter(b => b.id !== id));

  const resetForm = () => {
    setBasicData((prev: any) => ({
      ...initialBasicData,
      identifierValue: "",
      collegeId: prev.collegeId,
      collegeIntId: prev.collegeIntId,
      adminId: prev.adminId,
    }));
    setSelectedEducationId(null);
    setSelectedBranchId(null);
    setSelectedYearId(null);
    setSelectedSubjectId(null);
    setSelectedSectionIds([]);
    setSubjectBlocks([{ id: 1, yearId: null, subjectId: null, sectionIds: [] }]);
    setSelectedDegrees([]);
    setSelectedDepts([]);
    setSelectedYears([]);
    setSelectedSections([]);
    setSelectedSubjects([]);
    setSelectedSemester([]);
    setSelectedEntryType([]);

    setShowPassword(false);
    setIsSuccess(false);
  };

  const handleSingleSelect = (
    value: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setList((prev) => (prev[0] === value ? [] : [value]));
  };

  useEffect(() => {
    if (isOpen) {
      const init = async () => {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (!authUser) return;

          const { data: userData } = await supabase
            .from("users")
            .select("userId")
            .eq("auth_id", authUser.id)
            .single();
          if (!userData) return;

          const adminContext = await fetchAdminContext(userData.userId);

          setBasicData((prev: any) => ({
            ...prev,
            collegeId: adminContext.collegePublicId,
            collegeIntId: adminContext.collegeId,
            collegeCode: adminContext.collegeCode,
            adminId: adminContext.adminId,
          }));

          const sessions = await fetchSessionOptions(adminContext.collegeId);
          setSessionOptions(sessions);

          const data = await fetchModalInitialData(adminContext.collegeId);

          const { data: semesterData } = await supabase
            .from("college_semester")
            .select("*")
            .eq("collegeId", adminContext.collegeId)
            .eq("isActive", true);

          setDbData({ ...data, semesters: semesterData || [] });
        } catch (error) {
          console.error("Error initializing modal data:", error);
          toast.error("Failed to load college data");
        }
      };

      init();

      if (user) {
        setBasicData((p: any) => ({
          ...p,
          fullName: user.fullName || "",
          email: user.email || "",
          mobileNumber: user.mobile ? user.mobile.slice(-10) : "",
          role: user.role || "Faculty",
          gender: user.gender || "",
          studentId: user.studentId ? String(user.studentId) : "",
        }));
      } else {
        resetForm();
      }
    }
  }, [isOpen, user]);

  const selectedEducation = useMemo(
    () =>
      dbData.educations.find(
        (e) => e.collegeEducationType === collegeEducationType,
      ),
    [dbData.educations, collegeEducationType],
  );

  const filteredBranches = useMemo(
    () =>
      selectedEducation
        ? dbData.branches.filter(
          (b) =>
            b.collegeEducationId === selectedEducation.collegeEducationId,
        )
        : [],
    [dbData.branches, selectedEducation],
  );

  const filteredYears = useMemo(
    () => dbData.years.filter((y) => y.collegeBranchId == selectedBranchId),
    [dbData.years, selectedBranchId],
  );

  const filteredSubjects = useMemo(
    () =>
      dbData.subjects.filter((s) => s.collegeAcademicYearId == selectedYearId),
    [dbData.subjects, selectedYearId],
  );

  const filteredSections = useMemo(
    () =>
      dbData.sections.filter((s) => s.collegeAcademicYearId == selectedYearId),
    [dbData.sections, selectedYearId],
  );

  const studentSelectedEducation = useMemo(
    () =>
      dbData.educations.find(
        (e) => e.collegeEducationId === collegeEducationId,
      ),
    [dbData.educations, collegeEducationId],
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

  const studentAvailableYears = useMemo(
    () =>
      studentSelectedBranch
        ? dbData.years.filter(
          (y) => y.collegeBranchId === studentSelectedBranch.collegeBranchId,
        )
        : [],
    [studentSelectedBranch, dbData.years],
  );

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

  const studentAvailableSections = useMemo(
    () =>
      studentSelectedYear
        ? dbData.sections.filter(
          (s) =>
            s.collegeAcademicYearId ===
            studentSelectedYear.collegeAcademicYearId,
        )
        : [],
    [studentSelectedYear, dbData.sections],
  );

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
      const sanitized = value.replace(/[^A-Za-z0-9-]/g, "").toUpperCase();
      const hyphenCount = (sanitized.match(/-/g) || []).length;
      if (hyphenCount > 1) return;
      formattedValue = sanitized;
    }

    setBasicData((p: any) => ({ ...p, [name]: formattedValue }));
  };

  const toggleSectionId = (idStr: string) => {
    const id = parseInt(idStr);
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const degreeOptions = useMemo(
    () => dbData.educations.map((e: any) => e.collegeEducationType),
    [dbData.educations],
  );
  const branchOptions = useMemo(
    () => studentAvailableBranches.map((b) => b.collegeBranchCode),
    [studentAvailableBranches],
  );
  const yearOptions = useMemo(
    () => studentAvailableYears.map((y) => y.collegeAcademicYear),
    [studentAvailableYears],
  );
  const semesterOptions = useMemo(
    () => studentAvailableSemesters.map((s) => s.collegeSemester.toString()),
    [studentAvailableSemesters],
  );
  const sectionOptions = useMemo(
    () => studentAvailableSections.map((s) => s.collegeSections),
    [studentAvailableSections],
  );

  const selectedSessionId = useMemo(
    () =>
      sessionOptions.find((s) => s.label === selectedSessionType[0])?.id ??
      null,
    [selectedSessionType, sessionOptions],
  );

  const isAdmin = basicData.role === "Admin";
  const isFaculty = basicData.role === "Faculty";
  const isStudent = basicData.role === "Student";
  const isParent = basicData.role === "Parent";
  const isFinance = basicData.role === "Finance";
  const isHR = basicData.role === "CollegeHr";
  // ✅ NEW: Placement Officer role flag
  const isPlacement = basicData.role === "PlacementOfficer";

  // const handleSave = async () => {
  //   if (!basicData.fullName) return toast.error("Full Name is required.");
  //   if (!basicData.email) return toast.error("Email is required.");
  //   if (!basicData.mobileCode) {
  //     return toast.error("Country code is required.");
  //   }
  //   if (!/^\+[0-9]+$/.test(basicData.mobileCode)) {
  //     return toast.error("Invalid country code format.");
  //   }
  //   if (!basicData.mobileNumber) {
  //     return toast.error("Mobile number is required.");
  //   }
  //   if (!/^[0-9]{10}$/.test(basicData.mobileNumber)) {
  //     return toast.error("Mobile number must be exactly 10 digits.");
  //   }
  //   if (basicData.mobileCode === "+91") {
  //     if (!["6", "7", "8", "9"].includes(basicData.mobileNumber.charAt(0))) {
  //       return toast.error(
  //         "Indian mobile number must start with 6, 7, 8, or 9.",
  //       );
  //     }
  //   }

  //   if (!basicData.role) return toast.error("Role is required.");

  //   if (showRollNoField || showEmployeeIdField) {
  //     const error = validateIdentifier(basicData.identifierValue);
  //     if (error) {
  //       const label = showRollNoField ? "Roll no" : "Employee Id";
  //       return toast.error(`${label} ${error}`);
  //     }
  //   }

  //   if (!basicData.gender) return toast.error("Please select a gender.");

  //   if (
  //     isFaculty &&
  //     (!collegeEducationId ||
  //       !selectedBranchId ||
  //       !selectedYearId ||
  //       !selectedSubjectId ||
  //       selectedSectionIds.length === 0)
  //   )
  //     return toast.error("Complete all academic fields for Faculty.");

  //   if (isStudent) {
  //     if (
  //       !collegeEducationId ||
  //       !selectedDepts.length ||
  //       !selectedYears.length ||
  //       (!["Inter"].includes(collegeEducationType!) &&
  //         !selectedSemester.length) ||
  //       !selectedEntryType.length ||
  //       !selectedSections.length
  //     ) {
  //       return toast.error("Complete all academic fields for Student.");
  //     }
  //   }

  //   if (isParent && !basicData.studentId)
  //     return toast.error("Student ID required.");

  //   if (isFinance && !collegeEducationId)
  //     return toast.error("Select Education Type for Finance.");

  //   if (!user) {
  //     if (!basicData.password) {
  //       return toast.error("Password is required.");
  //     }
  //     const passwordError = validatePassword(basicData.password);
  //     if (passwordError) {
  //       return toast.error(passwordError);
  //     }
  //     if (!basicData.confirmPassword) {
  //       return toast.error("Confirm Password is required.");
  //     }
  //     if (basicData.password !== basicData.confirmPassword) {
  //       return toast.error("Password and Confirm Password do not match.");
  //     }
  //   }

  //   const normalizedDateOfJoining = basicData.dateOfJoining
  //     ? new Date(basicData.dateOfJoining).toISOString().split("T")[0]
  //     : null;

  //   const normalizedExperience =
  //     basicData.professionalExperienceYears !== undefined &&
  //     basicData.professionalExperienceYears !== null
  //       ? Number(basicData.professionalExperienceYears)
  //       : null;

  //   setLoading(true);
  //   let createdUserId: number | null = null;

  //   try {
  //     const timestamp = new Date().toISOString();

  //     let targetUserId: number | null = null;

  //     if (isAdmin && !user) {
  //       const { data: authData, error: authError } = await supabase.auth.signUp(
  //         {
  //           email: basicData.email,
  //           password: basicData.password,
  //         },
  //       );

  //       if (authError || !authData.user) {
  //         throw new Error(authError?.message || "Auth user creation failed");
  //       }

  //       const authId = authData.user.id;

  //       const userRes = await upsertUser({
  //         auth_id: authId,
  //         fullName: basicData.fullName,
  //         email: basicData.email,
  //         mobile: `${basicData.mobileCode}${basicData.mobileNumber}`,
  //         role: "Admin",
  //         collegeId: basicData.collegeIntId,
  //         collegePublicId: basicData.collegeId,
  //         gender: basicData.gender,
  //         dateOfJoining: normalizedDateOfJoining,
  //         professionalExperienceYears: normalizedExperience,
  //       });

  //       if (!userRes.success || !userRes.data) {
  //         throw new Error(userRes.error || "User creation failed");
  //       }

  //       targetUserId = userRes.data.userId;

  //       const adminRes = await upsertAdminEntry({
  //         userId: targetUserId!,
  //         fullName: basicData.fullName,
  //         email: basicData.email,
  //         collegeEducationId: collegeEducationId,
  //         mobile: `${basicData.mobileCode}${basicData.mobileNumber}`,
  //         gender: basicData.gender,
  //         collegeId: basicData.collegeId,
  //         collegePublicId: basicData.collegeId,
  //         collegeCode: basicData.collegeCode,
  //       });

  //       if (!adminRes.success) {
  //         throw new Error(adminRes.error || "Admin creation failed");
  //       }
  //     } else {
  //       targetUserId = await persistUser(
  //         !user,
  //         {
  //           ...basicData,
  //           collegePublicId: basicData.collegeId,
  //           dateOfJoining: normalizedDateOfJoining,
  //           professionalExperienceYears: normalizedExperience,
  //         },
  //         user ? user.userId : null,
  //         timestamp,
  //       );
  //     }

  //     if (!user) createdUserId = targetUserId;

  //     if (!targetUserId) throw new Error("User creation failed");

  //     if (isFinance && !user) {
  //       await createFinanceManager({
  //         userId: targetUserId,
  //         collegeId: basicData.collegeIntId,
  //         collegeEducationId: collegeEducationId!,
  //         createdBy: basicData.adminId,
  //         isActive: true,
  //         createdAt: timestamp,
  //         updatedAt: timestamp,
  //       });
  //     }

  //     if (isHR && targetUserId) {
  //       await upsertCollegeHR({
  //         userId: targetUserId,
  //         collegeId: basicData.collegeIntId,
  //         createdBy: basicData.adminId,
  //         isActive: true,
  //       });
  //     }

  //     if (isFaculty) {
  //       await persistFaculty(
  //         targetUserId,
  //         { ...basicData, collegePublicId: basicData.collegeId },
  //         {
  //           educationId: collegeEducationId!,
  //           branchId: selectedBranchId!,
  //           yearId: selectedYearId!,
  //           subjectId: selectedSubjectId!,
  //           sectionIds: selectedSectionIds,
  //         },
  //         timestamp,
  //         !!user,
  //       );
  //     }

  //     if (!targetUserId) throw new Error("User creation failed");

  //     let studentId: number | null = null;

  //     if (isStudent) {
  //       const eduId = studentSelectedEducation?.collegeEducationId;
  //       const branchId = studentSelectedBranch?.collegeBranchId;
  //       const yearId = studentSelectedYear?.collegeAcademicYearId;
  //       const semesterId = studentAvailableSemesters.find(
  //         (s) => s.collegeSemester.toString() === selectedSemester[0],
  //       )?.collegeSemesterId;

  //       const sectionId = studentAvailableSections.find(
  //         (s) => s.collegeSections === selectedSections[0],
  //       )?.collegeSectionsId;

  //       if (
  //         !eduId ||
  //         !branchId ||
  //         !yearId ||
  //         (!["Inter"].includes(collegeEducationType!) && !semesterId) ||
  //         !sectionId
  //       ) {
  //         throw new Error("Invalid academic selection data");
  //       }

  //       studentId = await createStudent(
  //         {
  //           userId: targetUserId,
  //           collegeEducationId: eduId,
  //           collegeBranchId: branchId,
  //           collegeId: basicData.collegeIntId,
  //           collegeSessionId: selectedSessionId,
  //           createdBy: basicData.adminId,
  //           entryType: selectedEntryType[0] as any,
  //           status: "Active",
  //         },
  //         timestamp,
  //       );

  //       await createStudentAcademicHistory({
  //         studentId: studentId,
  //         collegeAcademicYearId: yearId,
  //         collegeSemesterId: semesterId,
  //         collegeSectionsId: sectionId,
  //         promotedBy: basicData.adminId,
  //         createdAt: timestamp,
  //         updatedAt: timestamp,
  //         isCurrent: true,
  //       });
  //     }

  //     if (isParent && targetUserId) {
  //       await upsertParentEntry({
  //         userId: targetUserId,
  //         studentId: parseInt(basicData.studentId),
  //         collegeId: basicData.collegeIntId,
  //         createdBy: basicData.adminId,
  //       });
  //     }

  //     if (basicData.identifierValue) {
  //       await upsertIdentifier({
  //         userId: targetUserId,
  //         studentId: isStudent ? studentId! : undefined,
  //         collegeId: basicData.collegeIntId,
  //         role: basicData.role,
  //         identifierValue: basicData.identifierValue,
  //       });
  //     }

  //     toast.success("User Created Successfully");
  //     setIsSuccess(true);
  //     setTimeout(() => {
  //       resetForm();
  //       onClose();
  //       setLoading(false);
  //       setIsSuccess(false);
  //     }, 2000);
  //     setSessionOptions([]);
  //   } catch (e: any) {
  //     console.error(e);

  //     let message = "Something went wrong. Please try again.";

  //     if (e?.message) {
  //       const errMsg = e.message.toLowerCase();

  //       if (errMsg.includes("email")) {
  //         message = "This email is already registered.";
  //       } else if (errMsg.includes("mobile")) {
  //         message = "This mobile number is already in use.";
  //       } else if (errMsg.includes("duplicate")) {
  //         message = "User already exists with provided details.";
  //       }
  //     }

  //     toast.error(message);

  //     if (createdUserId && !user) {
  //       await supabase.from("users").delete().eq("userId", createdUserId);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSave = async () => {
    if (!basicData.fullName) return toast.error("Full Name is required.");
    if (!basicData.email) return toast.error("Email is required.");
    if (!basicData.mobileCode) {
      return toast.error("Country code is required.");
    }
    if (!/^\+[0-9]+$/.test(basicData.mobileCode)) {
      return toast.error("Invalid country code format.");
    }
    if (!basicData.mobileNumber) {
      return toast.error("Mobile number is required.");
    }
    if (!/^[0-9]{10}$/.test(basicData.mobileNumber)) {
      return toast.error("Mobile number must be exactly 10 digits.");
    }
    if (basicData.mobileCode === "+91") {
      if (!["6", "7", "8", "9"].includes(basicData.mobileNumber.charAt(0))) {
        return toast.error(
          "Indian mobile number must start with 6, 7, 8, or 9.",
        );
      }
    }

    if (!basicData.role) return toast.error("Role is required.");

    if (showRollNoField || showEmployeeIdField) {
      const error = validateIdentifier(basicData.identifierValue);
      if (error) {
        const label = showRollNoField ? "Roll no" : "Employee Id";
        return toast.error(`${label} ${error}`);
      }
    }

    if (!basicData.gender) return toast.error("Please select a gender.");

    if (isFaculty) {
      if (!collegeEducationId || !selectedBranchId)
        return toast.error("Complete all academic fields for Faculty.");
      const incomplete = subjectBlocks.some(
        (b) => !b.yearId || !b.subjectId || b.sectionIds.length === 0
      );
      if (incomplete)
        return toast.error("Complete Year, Subject and Sections for all subject blocks.");
    }

    if (isStudent) {
      if (
        !collegeEducationId ||
        !selectedDepts.length ||
        !selectedYears.length ||
        (!["Inter"].includes(collegeEducationType!) &&
          !selectedSemester.length) ||
        !selectedEntryType.length ||
        !selectedSections.length
      ) {
        return toast.error("Complete all academic fields for Student.");
      }
    }

    if (isParent && !basicData.studentId)
      return toast.error("Student ID required.");

    if (isFinance && !collegeEducationId)
      return toast.error("Select Education Type for Finance.");

    // ✅ NEW: Placement Officer validation
    if (isPlacement && !collegeEducationId)
      return toast.error("Select Education Type for Placement Officer.");

    if (!user) {
      if (!basicData.password) {
        return toast.error("Password is required.");
      }
      const passwordError = validatePassword(basicData.password);
      if (passwordError) {
        return toast.error(passwordError);
      }
      if (!basicData.confirmPassword) {
        return toast.error("Confirm Password is required.");
      }
      if (basicData.password !== basicData.confirmPassword) {
        return toast.error("Password and Confirm Password do not match.");
      }
    }

    const normalizedDateOfJoining = basicData.dateOfJoining
      ? new Date(basicData.dateOfJoining).toISOString().split("T")[0]
      : null;

    const normalizedExperience =
      basicData.professionalExperienceYears !== undefined &&
        basicData.professionalExperienceYears !== null
        ? Number(basicData.professionalExperienceYears)
        : null;

    setLoading(true);
    let createdUserId: number | null = null;

    try {
      const timestamp = new Date().toISOString();

      let targetUserId: number | null = null;

      if (isAdmin && !user) {
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: basicData.email,
            password: basicData.password,
            options: {
              emailRedirectTo: `https://${basicData.collegeCode.toLowerCase()}.tektoncampus.com/`,
            },
          },
        );

        if (authError || !authData.user) {
          throw new Error(authError?.message || "Auth user creation failed");
        }

        const authId = authData.user.id;

        const userRes = await upsertUser({
          auth_id: authId,
          fullName: basicData.fullName,
          email: basicData.email,
          mobile: `${basicData.mobileCode}${basicData.mobileNumber}`,
          role: "Admin",
          collegeId: basicData.collegeIntId,
          collegePublicId: basicData.collegeId,
          gender: basicData.gender,
          dateOfJoining: normalizedDateOfJoining,
          professionalExperienceYears: normalizedExperience,
        });

        if (!userRes.success || !userRes.data) {
          throw new Error(userRes.error || "User creation failed");
        }

        targetUserId = userRes.data.userId;

        const adminRes = await upsertAdminEntry({
          userId: targetUserId!,
          fullName: basicData.fullName,
          email: basicData.email,
          collegeEducationId: collegeEducationId,
          mobile: `${basicData.mobileCode}${basicData.mobileNumber}`,
          gender: basicData.gender,
          collegeId: basicData.collegeId,
          collegePublicId: basicData.collegeId,
          collegeCode: basicData.collegeCode,
        });

        if (!adminRes.success) {
          throw new Error(adminRes.error || "Admin creation failed");
        }
      } else {
        targetUserId = await persistUser(
          !user,
          {
            ...basicData,
            collegePublicId: basicData.collegeId,
            dateOfJoining: normalizedDateOfJoining,
            professionalExperienceYears: normalizedExperience,
          },
          user ? user.userId : null,
          timestamp,
        );
      }

      if (!user) createdUserId = targetUserId;

      if (!targetUserId) throw new Error("User creation failed");

      if (isFinance && !user) {
        await createFinanceManager({
          userId: targetUserId,
          collegeId: basicData.collegeIntId,
          collegeEducationId: collegeEducationId!,
          createdBy: basicData.adminId,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }

      if (isHR && targetUserId) {
        await upsertCollegeHR({
          userId: targetUserId,
          collegeId: basicData.collegeIntId,
          createdBy: basicData.adminId,
          isActive: true,
        });
      }

      if (isPlacement && targetUserId) {
        await upsertPlacementEmployee({
          userId: targetUserId,
          collegeId: basicData.collegeIntId,
          createdBy: basicData.adminId,
        });
      }

      if (isFaculty) {
        for (const block of subjectBlocks) {
          await persistFaculty(
            targetUserId,
            { ...basicData, collegePublicId: basicData.collegeId },
            {
              educationId: collegeEducationId!,
              branchId: selectedBranchId!,
              yearId: block.yearId!,
              subjectId: block.subjectId!,
              sectionIds: block.sectionIds,
            },
            timestamp,
            !!user,
          );
        }
      }

      if (!targetUserId) throw new Error("User creation failed");

      let studentId: number | null = null;

      if (isStudent) {
        const eduId = studentSelectedEducation?.collegeEducationId;
        const branchId = studentSelectedBranch?.collegeBranchId;
        const yearId = studentSelectedYear?.collegeAcademicYearId;
        const semesterId = studentAvailableSemesters.find(
          (s) => s.collegeSemester.toString() === selectedSemester[0],
        )?.collegeSemesterId;

        const sectionId = studentAvailableSections.find(
          (s) => s.collegeSections === selectedSections[0],
        )?.collegeSectionsId;

        if (
          !eduId ||
          !branchId ||
          !yearId ||
          (!["Inter"].includes(collegeEducationType!) && !semesterId) ||
          !sectionId ||
          !selectedSessionId // 🟢 Make sure session is selected
        ) {
          throw new Error("Invalid academic selection data");
        }

        studentId = await createStudent(
          {
            userId: targetUserId,
            collegeEducationId: eduId,
            collegeBranchId: branchId,
            collegeId: basicData.collegeIntId,
            collegeSessionId: selectedSessionId,
            createdBy: basicData.adminId,
            entryType: selectedEntryType[0] as any,
            status: "Active",
          },
          timestamp,
        );

        await createStudentAcademicHistory({
          studentId: studentId,
          collegeAcademicYearId: yearId,
          collegeSemesterId: semesterId,
          collegeSectionsId: sectionId,
          promotedBy: basicData.adminId,
          createdAt: timestamp,
          updatedAt: timestamp,
          isCurrent: true,
        });

        await createStudentFeeObligation(
          {
            studentId: studentId,
            collegeSessionId: selectedSessionId,
            collegeAcademicYearId: yearId,
            collegeEducationId: eduId,
            collegeBranchId: branchId,
            createdBy: basicData.adminId,
          },
          timestamp,
        );
      }

      if (isParent && targetUserId) {
        await upsertParentEntry({
          userId: targetUserId,
          studentId: parseInt(basicData.studentId),
          collegeId: basicData.collegeIntId,
          createdBy: basicData.adminId,
        });
      }

      if (basicData.identifierValue) {
        await upsertIdentifier({
          userId: targetUserId,
          studentId: isStudent ? studentId! : undefined,
          collegeId: basicData.collegeIntId,
          role: basicData.role,
          identifierValue: basicData.identifierValue,
        });
      }

      toast.success("User Created Successfully");
      setIsSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
        setLoading(false);
        setIsSuccess(false);
      }, 2000);
      setSessionOptions([]);
    } catch (e: any) {
      console.error(e);

      let message = "Something went wrong. Please try again.";

      if (e?.message) {
        const errMsg = e.message.toLowerCase();

        if (errMsg.includes("email")) {
          message = "This email is already registered.";
        } else if (errMsg.includes("mobile")) {
          message = "This mobile number is already in use.";
        } else if (errMsg.includes("duplicate")) {
          message = "User already exists with provided details.";
        }
      }

      toast.error(message);

      if (createdUserId && !user) {
        await supabase.from("users").delete().eq("userId", createdUserId);
      }
    } finally {
      setLoading(false);
    }
  };
  const showEmploymentFields = !isStudent && !isParent && basicData.role !== "";

  const showRollNoField = isStudent;
  const showEmployeeIdField = !isStudent && !isParent && basicData.role !== "";

  if (!isOpen) return null;

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
        <div className="bg-white text-black w-full max-w-137.5 max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-clip animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-medium text-[#282828]">Add User</h2>
            <X
              size={20}
              weight="bold"
              className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
              onClick={onClose}
            />
          </div>

          <div className="p-5 overflow-y-auto custom-scrollbar flex flex-col gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={basicData.fullName}
                onChange={handleBasicChange}
                placeholder="Enter Fullname"
                className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Email ID <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={basicData.email}
                onChange={handleBasicChange}
                placeholder="Enter email address"
                className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  College ID <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={basicData.collegeIntId}
                    readOnly
                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-3 py-1 text-sm outline-none cursor-not-allowed"
                  />
                  <Lock
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Mobile <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="mobileCode"
                    maxLength={5}
                    value={basicData.mobileCode}
                    onChange={handleBasicChange}
                    className="w-[60px] border border-gray-200 rounded-md px-2 py-1 text-sm text-center outline-none focus:ring-1 focus:ring-[#48C78E]"
                  />
                  <input
                    type="tel"
                    name="mobileNumber"
                    placeholder="98765432XX"
                    value={basicData.mobileNumber}
                    onChange={handleBasicChange}
                    className="flex-1 border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Role <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={basicData.role}
                    onChange={handleBasicChange}
                    size={1}
                    className="w-full border cursor-pointer border-gray-200 rounded-md px-3 py-1 text-sm appearance-none outline-none bg-white focus:ring-1 focus:ring-[#48C78E] text-gray-600"
                  >
                    <option value="" disabled>
                      Select role
                    </option>
                    <option value="Admin">Admin</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Student">Student</option>
                    <option value="Parent">Parent</option>
                    <option value="Finance">Finance</option>
                    {/* <option value="CollegeHr">College HR</option> */}
                    <option value="CollegeHr">College HR</option>
                    {/* ✅ NEW: Placement Officer option */}
                    <option value="PlacementOfficer">Placement Officer</option>
                  </select>
                  <CaretDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* ✅ UPDATED: Added isPlacement to show locked Education Type */}
              {(isFaculty || isFinance || isAdmin || isPlacement) && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Education Type <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={collegeEducationType!}
                      className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-3 py-1 text-sm outline-none cursor-not-allowed"
                      placeholder="Auto-filled from Admin context"
                    />
                    <Lock
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
              )}

              {isStudent && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2D3748]">
                      Education Type <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={collegeEducationType!}
                        className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-3 py-1 text-sm outline-none cursor-not-allowed"
                        placeholder="Auto-filled from Admin context"
                      />
                      <Lock
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                </>
              )}

              {isParent && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Student ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="studentId"
                    value={basicData.studentId}
                    onChange={handleBasicChange}
                    placeholder="Enter Student ID"
                    className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                  />
                </div>
              )}
            </div>

            {/* {isFaculty && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2D3748]">
                      {collegeEducationType === "Inter"
                        ? "Group Type"
                        : "Branch Type"}{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedBranchId || ""}
                        disabled={!selectedEducation}
                        onChange={(e) => {
                          setSelectedBranchId(Number(e.target.value));
                          setSelectedYearId(null);
                        }}
                        className="w-full border appearance-none border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] cursor-pointer disabled:bg-gray-50"
                      >
                        <option value="" disabled>
                          {collegeEducationType === "Inter"
                            ? "Select Group Type"
                            : "Select Branch Type"}
                        </option>
                        {filteredBranches.map((b: any) => (
                          <option
                            key={b.collegeBranchId}
                            value={b.collegeBranchId}
                          >
                            {b.collegeBranchCode}
                          </option>
                        ))}
                      </select>
                      <CaretDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2D3748]">
                      Year <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedYearId || ""}
                        disabled={!selectedBranchId}
                        onChange={(e) => {
                          setSelectedYearId(Number(e.target.value));
                          setSelectedSubjectId(null);
                        }}
                        className="w-full border appearance-none border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] cursor-pointer disabled:bg-gray-50"
                      >
                        <option value="" disabled>
                          Select Year
                        </option>
                        {filteredYears.map((y: any) => (
                          <option
                            key={y.collegeAcademicYearId}
                            value={y.collegeAcademicYearId}
                          >
                            {y.collegeAcademicYear}
                          </option>
                        ))}
                      </select>
                      <CaretDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2D3748]">
                      Subject <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSubjectId || ""}
                        disabled={!selectedYearId}
                        onChange={(e) =>
                          setSelectedSubjectId(Number(e.target.value))
                        }
                        className="w-full border border-gray-200 appearance-none rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] cursor-pointer disabled:bg-gray-50"
                      >
                        <option value="" disabled>
                          Select Subject
                        </option>
                        {filteredSubjects.map((s: any) => (
                          <option
                            key={s.collegeSubjectId}
                            value={s.collegeSubjectId}
                          >
                            {s.subjectName}
                          </option>
                        ))}
                      </select>
                      <CaretDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <CustomMultiSelect
                    label="Sections"
                    placeholder="Select Sections"
                    options={filteredSections.map(
                      (s: any) => s.collegeSections,
                    )}
                    selectedValues={filteredSections
                      .filter((s: any) =>
                        selectedSectionIds.includes(s.collegeSectionsId),
                      )
                      .map((s: any) => s.collegeSections)}
                    disabled={!selectedYearId}
                    onChange={(v) => {
                      const s = filteredSections.find(
                        (i: any) => i.collegeSections === v,
                      );
                      if (s) toggleSectionId(String(s.collegeSectionsId));
                    }}
                    onRemove={(v) => {
                      const s = filteredSections.find(
                        (i: any) => i.collegeSections === v,
                      );
                      if (s) toggleSectionId(String(s.collegeSectionsId));
                    }}
                    paddingY="py-1"
                    gap="gap-1"
                  />
                </div>
              </>
            )} */}

            {isFaculty && (
              <>
                {/* Branch stays outside — shared across all subject blocks */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    {collegeEducationType === "Inter" ? "Group Type" : "Branch Type"}{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBranchId || ""}
                      disabled={!selectedEducation}
                      onChange={(e) => {
                        setSelectedBranchId(Number(e.target.value));
                        setSubjectBlocks([{ id: Date.now(), yearId: null, subjectId: null, sectionIds: [] }]);
                      }}
                      className="w-full border appearance-none border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] cursor-pointer disabled:bg-gray-50"
                    >
                      <option value="" disabled>
                        {collegeEducationType === "Inter" ? "Select Group Type" : "Select Branch Type"}
                      </option>
                      {filteredBranches.map((b: any) => (
                        <option key={b.collegeBranchId} value={b.collegeBranchId}>
                          {b.collegeBranchCode}
                        </option>
                      ))}
                    </select>
                    <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Dynamic subject blocks */}
                {subjectBlocks.map((block, index) => {
                  const blockFilteredYears = dbData.years.filter((y) => y.collegeBranchId == selectedBranchId);
                  const blockFilteredSubjects = dbData.subjects.filter((s) => s.collegeAcademicYearId == block.yearId);
                  const blockFilteredSections = dbData.sections.filter((s) => s.collegeAcademicYearId == block.yearId);

                  return (
                    <div key={block.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                          Subject {index + 1}
                        </span>
                        {subjectBlocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubjectBlock(block.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#2D3748]">
                            Year <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={block.yearId || ""}
                              disabled={!selectedBranchId}
                              onChange={(e) => {
                                const yearId = Number(e.target.value);
                                setSubjectBlocks((prev) =>
                                  prev.map((b) =>
                                    b.id === block.id ? { ...b, yearId, subjectId: null, sectionIds: [] } : b
                                  )
                                );
                              }}
                              className="w-full border appearance-none border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] cursor-pointer disabled:bg-gray-50"
                            >
                              <option value="" disabled>Select Year</option>
                              {blockFilteredYears.map((y: any) => (
                                <option key={y.collegeAcademicYearId} value={y.collegeAcademicYearId}>
                                  {y.collegeAcademicYear}
                                </option>
                              ))}
                            </select>
                            <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#2D3748]">
                            Subject <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={block.subjectId || ""}
                              disabled={!block.yearId}
                              onChange={(e) => {
                                const subjectId = Number(e.target.value);
                                setSubjectBlocks((prev) =>
                                  prev.map((b) =>
                                    b.id === block.id ? { ...b, subjectId } : b
                                  )
                                );
                              }}
                              className="w-full border border-gray-200 appearance-none rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] cursor-pointer disabled:bg-gray-50"
                            >
                              <option value="" disabled>Select Subject</option>
                              {blockFilteredSubjects.map((s: any) => (
                                <option key={s.collegeSubjectId} value={s.collegeSubjectId}>
                                  {s.subjectName}
                                </option>
                              ))}
                            </select>
                            <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <CustomMultiSelect
                        label="Sections"
                        placeholder="Select Sections"
                        options={blockFilteredSections.map((s: any) => s.collegeSections)}
                        selectedValues={blockFilteredSections
                          .filter((s: any) => block.sectionIds.includes(s.collegeSectionsId))
                          .map((s: any) => s.collegeSections)}
                        disabled={!block.yearId}
                        onChange={(v) => {
                          const found = blockFilteredSections.find((s: any) => s.collegeSections === v);
                          if (!found) return;
                          const sid = found.collegeSectionsId;
                          setSubjectBlocks((prev) =>
                            prev.map((b) =>
                              b.id === block.id
                                ? { ...b, sectionIds: b.sectionIds.includes(sid) ? b.sectionIds.filter((i) => i !== sid) : [...b.sectionIds, sid] }
                                : b
                            )
                          );
                        }}
                        onRemove={(v) => {
                          const found = blockFilteredSections.find((s: any) => s.collegeSections === v);
                          if (!found) return;
                          const sid = found.collegeSectionsId;
                          setSubjectBlocks((prev) =>
                            prev.map((b) =>
                              b.id === block.id ? { ...b, sectionIds: b.sectionIds.filter((i) => i !== sid) } : b
                            )
                          );
                        }}
                        paddingY="py-1"
                        gap="gap-1"
                      />
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addSubjectBlock}
                  className="flex items-center gap-1.5 text-xs text-gray-400 border border-dashed border-gray-300 rounded-md px-3 py-1.5 hover:border-[#48C78E] hover:text-[#48C78E] hover:bg-green-50 transition-all w-fit cursor-pointer"
                >
                  <span className="text-base leading-none">+</span> Add Subject
                </button>
              </>
            )}

            {isStudent && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <CustomMultiSelect
                    label={
                      collegeEducationType === "Inter"
                        ? "Group Type"
                        : "Branch Type"
                    }
                    placeholder={
                      collegeEducationType === "Inter"
                        ? "Select Group"
                        : "Select Branch"
                    }
                    options={branchOptions}
                    selectedValues={selectedDepts}
                    disabled={!collegeEducationId}
                    onChange={(v) => {
                      handleSingleSelect(v, setSelectedDepts);
                      setSelectedYears([]);
                      setSelectedSemester([]);
                      setSelectedSections([]);
                    }}
                    onRemove={() => setSelectedDepts([])}
                  />
                  <CustomMultiSelect
                    label="Year"
                    placeholder="Select Year"
                    options={yearOptions}
                    selectedValues={selectedYears}
                    disabled={selectedDepts.length === 0}
                    onChange={(v) => {
                      handleSingleSelect(v, setSelectedYears);
                      setSelectedSemester([]);
                      setSelectedSections([]);
                    }}
                    onRemove={() => setSelectedYears([])}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  {!["Inter"].includes(collegeEducationType!) && (
                    <CustomMultiSelect
                      label="Semester"
                      placeholder="Select Semester"
                      options={semesterOptions}
                      selectedValues={selectedSemester}
                      disabled={selectedYears.length === 0}
                      onChange={(v) =>
                        handleSingleSelect(v, setSelectedSemester)
                      }
                      onRemove={() => setSelectedSemester([])}
                    />
                  )}
                  <CustomMultiSelect
                    label="Section"
                    placeholder="Select Section"
                    options={sectionOptions}
                    selectedValues={selectedSections}
                    disabled={selectedYears.length === 0}
                    onChange={(v) => handleSingleSelect(v, setSelectedSections)}
                    onRemove={() => setSelectedSections([])}
                  />
                  <CustomMultiSelect
                    label="Entry Type"
                    placeholder="Select Entry Type"
                    options={
                      !["Inter", "Polytechnic", "Diploma"].includes(
                        collegeEducationType!,
                      )
                        ? ENTRY_TYPES
                        : INTER_ENTRY
                    }
                    selectedValues={selectedEntryType}
                    disabled={
                      !["Inter"].includes(collegeEducationType!) &&
                      selectedSemester.length === 0
                    }
                    onChange={(v) =>
                      handleSingleSelect(v, setSelectedEntryType)
                    }
                    onRemove={() => setSelectedEntryType([])}
                  />
                  <CustomMultiSelect
                    label="Academic Session"
                    placeholder="Select Session Period"
                    options={sessionOptions.map((s) => s.label)}
                    selectedValues={selectedSessionType}
                    disabled={selectedEntryType.length === 0}
                    onChange={(v) =>
                      handleSingleSelect(v, setSelectedSessionType)
                    }
                    onRemove={() => setSelectedSessionType([])}
                  />
                </div>
              </>
            )}

            {showEmploymentFields && (
              <div className="grid grid-cols-2 gap-5 bg-pink-00">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Date of Joining <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={basicData.dateOfJoining || ""}
                    onChange={handleBasicChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Experience (Years) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="professionalExperienceYears"
                    min={0}
                    max={60}
                    step="0.1"
                    placeholder="e.g. 3.5"
                    value={basicData.professionalExperienceYears || ""}
                    onChange={handleBasicChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-5">
              {(showRollNoField || showEmployeeIdField) && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    {showRollNoField ? "Roll No" : "Employee Id"}{" "}
                    <span className="text-red-600">*</span>
                  </label>

                  <input
                    type="text"
                    name="identifierValue"
                    value={basicData.identifierValue}
                    onChange={handleBasicChange}
                    placeholder={
                      showRollNoField ? "Enter Roll No" : "Enter Employee Id"
                    }
                    maxLength={15}
                    className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Gender <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-6 mt-1">
                  {["Male", "Female"].map((g) => (
                    <label
                      key={g}
                      className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${basicData.gender === g ? "border-[#48C78E]" : "border-gray-300"}`}
                      >
                        {basicData.gender === g && (
                          <div className="w-2 h-2 rounded-full bg-[#48C78E]" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={basicData.gender === g}
                        onChange={(e) =>
                          setBasicData((p: any) => ({
                            ...p,
                            gender: e.target.value as any,
                          }))
                        }
                        className="hidden"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {!user && (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={basicData.password}
                      onChange={handleBasicChange}
                      placeholder="Enter password"
                      className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] pr-8"
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye size={16} />
                      ) : (
                        <EyeSlash size={16} />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={basicData.confirmPassword}
                      onChange={handleBasicChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSave();
                        }
                      }}
                      placeholder="Confirm password"
                      className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <Eye size={16} />
                      ) : (
                        <EyeSlash size={16} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-5 border-t border-gray-50 flex gap-4 flex-shrink-0 bg-white">
            <button
              onClick={handleSave}
              disabled={loading || isSuccess}
              className={`flex-1 cursor-pointer focus:outline-none text-white text-sm font-medium py-1 rounded-md transition-all shadow-sm ${isSuccess
                ? "bg-green-600 cursor-default"
                : "bg-[#43C17A] hover:bg-[#3ea876]"
                }`}
            >
              {isSuccess ? "Saved" : loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border focus:outline-none cursor-pointer border-gray-300 text-[#282828] text-sm font-medium py-1 rounded-md hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUserModal;