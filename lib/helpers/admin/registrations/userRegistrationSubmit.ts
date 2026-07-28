import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import {
  createStudent,
  createStudentFeeObligation,
} from "@/lib/helpers/admin/registrations/student/studentRegistration";
import { createStudentAcademicHistory } from "@/lib/helpers/admin/registrations/student/academicHistoryRegistration";
import {
  createFinanceManager,
  upsertFinanceManagerEducationTypes,
} from "@/lib/helpers/admin/registrations/finance/financeManagerRegistration";
import {
  createAccountant,
  upsertAccountantEducationTypes,
} from "@/lib/helpers/admin/registrations/finance/accountantRegistration";
import {
  upsertAdminEducationTypes,
  upsertAdminEntry,
  upsertCollegeHR,
  upsertUser,
} from "@/lib/helpers/upsertUser";
import { createWellbeing } from "@/lib/helpers/admin/registrations/wellbeing/wellbeingRegistration";
import { registerUserToHikvision } from "@/lib/helpers/biometric/registerUser";
import { upsertParentEntry } from "@/lib/helpers/parent/createParent";
import { upsertIdentifier } from "@/lib/helpers/identifiers/upsertIdentifier";
import { persistUser } from "@/lib/helpers/admin/registrations/persistUser";
import { upsertPlacementEmployee } from "@/lib/helpers/admin/registrations/placement/placementregistration";
import {
  createFacultyProfile,
  batchInsertFacultySections,
  clearExistingFacultySections,
} from "@/lib/helpers/admin/upsertFaculty";
import { flattenAssignmentsToPayloads } from "@/lib/helpers/admin/registrations/faculty/facultyAssignmentHelpers";
import { TeachingAssignment } from "@/app/(screens)/admin/(dashboard)/components/modal/faculty/facultyAssignmentTypes";
import {
  resolveStudentIdFromPin,
  assertParentStudentAvailable,
  assertIdentifierAvailable,
} from "./validationHelpers";

export interface UserRegistrationPayload {
  basicData: any;
  user?: any;
  isAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
  isParent: boolean;
  isFinance: boolean;
  isFinanceManager: boolean;
  isAccountant: boolean;
  isHR: boolean;
  isPlacement: boolean;
  isWellbeing: boolean;
  isWellbeingHostel: boolean;
  isWellbeingCollege: boolean;
  showFinanceFields: boolean;

  selectedEducationId: number | null;
  selectedFinanceEducationTypes: string[];
  selectedWellbeingEducationTypes: string[];
  selectedEntryType: string[];
  selectedSemester: string[];
  selectedSections: string[];
  selectedSessionId: number | null;
  assignments: TeachingAssignment[];

  studentSelectedEducation?: any;
  studentSelectedBranch?: any;
  studentSelectedYear?: any;
  studentAvailableSemesters: any[];
  studentAvailableSections: any[];
  isSelectedSchool: boolean;

  dbData: {
    educations: any[];
  };
  adminUserId?: string | number | null;

  setLoading: (loading: boolean) => void;
  setIsSuccess: (success: boolean) => void;
  resetForm: () => void;
  onClose: () => void;
}

export const submitUserRegistration = async (
  payload: UserRegistrationPayload
) => {
  const {
    basicData,
    user,
    isAdmin,
    isFaculty,
    isStudent,
    isParent,
    isFinanceManager,
    isAccountant,
    isHR,
    isPlacement,
    isWellbeing,
    isWellbeingHostel,
    isWellbeingCollege,
    showFinanceFields,
    selectedEducationId,
    selectedFinanceEducationTypes,
    selectedWellbeingEducationTypes,
    selectedEntryType,
    selectedSemester,
    selectedSections,
    selectedSessionId,
    assignments,
    studentSelectedEducation,
    studentSelectedBranch,
    studentSelectedYear,
    studentAvailableSemesters,
    studentAvailableSections,
    isSelectedSchool,
    dbData,
    adminUserId,
    setLoading,
    setIsSuccess,
    resetForm,
    onClose,
  } = payload;

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
  let createdStudentId: number | null = null;
  let createdAccountantId: number | null = null;

  try {
    const timestamp = new Date().toISOString();
    const parentStudentId = isParent
      ? await resolveStudentIdFromPin(basicData.studentId, basicData.collegeIntId)
      : null;

    if (parentStudentId && !user) {
      await assertParentStudentAvailable(parentStudentId, basicData.collegeIntId);
    }

    if (basicData.identifierValue && !user) {
      await assertIdentifierAvailable(
        basicData.role,
        basicData.identifierValue,
        basicData.collegeIntId,
        null
      );
    }

    let targetUserId: number | null = null;

    if (isAdmin && !user) {
      const cCode = basicData.collegeCode || "";
      const redirectUrl =
        cCode.toUpperCase() === "GKELITE" || !cCode
          ? "https://tektoncampus.com/login"
          : `https://${cCode.toLowerCase()}.tektoncampus.com/login`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: basicData.email,
        password: basicData.password!,
        options: {
          data: { full_name: basicData.fullName, role: basicData.role },
          emailRedirectTo: redirectUrl,
        },
      });

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
        collegeEducationId: null,
        mobile: `${basicData.mobileCode}${basicData.mobileNumber}`,
        gender: basicData.gender,
        collegeId: basicData.collegeId,
        collegePublicId: basicData.collegeId,
        collegeCode: basicData.collegeCode,
      });

      if (!adminRes.success) {
        throw new Error(adminRes.error || "Admin creation failed");
      }

      if (!adminRes.data?.adminId || !selectedEducationId) {
        throw new Error("Admin education type creation failed");
      }

      const adminEducationRes = await upsertAdminEducationTypes({
        adminId: adminRes.data.adminId,
        collegeEducationIds: [selectedEducationId],
      });

      if (!adminEducationRes.success) {
        throw new Error(
          adminEducationRes.error || "Admin education type creation failed"
        );
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
        timestamp
      );
    }

    if (!user) createdUserId = targetUserId;

    if (!targetUserId) throw new Error("User creation failed");

    if (showFinanceFields && !user) {
      const financeEducationIds = dbData.educations
        .filter((education) =>
          selectedFinanceEducationTypes.includes(education.collegeEducationType)
        )
        .map((education) => education.collegeEducationId);

      if (!isAccountant && !financeEducationIds.length) {
        throw new Error("Select Education Type for Finance.");
      }

      if (isAccountant) {
        const accountantId = await createAccountant({
          userId: targetUserId,
          collegeId: basicData.collegeIntId,
          collegeEducationId:
            financeEducationIds.length > 0 ? financeEducationIds[0] : null,
          createdBy: Number(adminUserId!),
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        createdAccountantId = accountantId;

        if (financeEducationIds.length > 0) {
          await upsertAccountantEducationTypes({
            accountantId,
            collegeEducationIds: financeEducationIds,
          });
        }
      } else {
        const financeManagerId = await createFinanceManager({
          userId: targetUserId,
          collegeId: basicData.collegeIntId,
          collegeEducationId: financeEducationIds[0],
          createdBy: basicData.adminId,
          type: isFinanceManager ? "manager" : "executive",
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        await upsertFinanceManagerEducationTypes({
          financeManagerId,
          collegeEducationIds: financeEducationIds,
        });
      }
    }

    if (isHR && targetUserId) {
      const hrRes = await upsertCollegeHR({
        userId: targetUserId,
        collegeId: basicData.collegeIntId,
        createdBy: basicData.adminId,
        isActive: true,
      });
      if (!hrRes.success) {
        throw new Error(hrRes.error?.message || "College HR creation failed");
      }
    }

    if (isPlacement && targetUserId) {
      const placementRes = await upsertPlacementEmployee({
        userId: targetUserId,
        collegeId: basicData.collegeIntId,
        createdBy: basicData.adminId,
      });
      if (!placementRes.success) {
        throw new Error(
          placementRes.error?.message || "Placement officer creation failed"
        );
      }
    }

    if (isWellbeing && !user) {
      const wellbeingCollegeDetails = isWellbeingCollege
        ? dbData.educations
            .filter((education) =>
              selectedWellbeingEducationTypes.includes(
                education.collegeEducationType
              )
            )
            .map((education) => ({
              collegeEducationId: education.collegeEducationId,
              collegeBranchId: null,
              collegeAcademicYearId: null,
              collegeSectionsId: null,
            }))
        : [];

      if (isWellbeingCollege && !wellbeingCollegeDetails.length) {
        throw new Error("Invalid wellbeing college selection data");
      }

      await createWellbeing({
        userId: targetUserId,
        collegeId: basicData.collegeIntId,
        roleType: "wellbeingManager",
        gender: basicData.gender,
        employeeId: basicData.identifierValue,
        dateOfJoining: normalizedDateOfJoining,
        createdBy: basicData.adminId,
        createdAt: timestamp,
        updatedAt: timestamp,
        collegeDetails: wellbeingCollegeDetails,
        hostelDetails: isWellbeingHostel
          ? {
              block: basicData.hostelBlock,
              buildingNumber: basicData.buildingNumber,
              hostelType: basicData.hostelType,
            }
          : undefined,
      });
    }

    if (isFaculty) {
      const firstAssignment = assignments[0];
      const facultyId = await createFacultyProfile(
        targetUserId,
        { ...basicData, collegePublicId: basicData.collegeId },
        null, // Faculty educationId is now stored in faculty_sections
        null, // Faculty branchId is now stored in faculty_sections
        timestamp,
        !!user
      );
      if (user) {
        await clearExistingFacultySections(facultyId);
      }
      const payloads = flattenAssignmentsToPayloads(
        assignments,
        facultyId,
        basicData.adminId,
        timestamp
      );
      await batchInsertFacultySections(payloads);
    }

    if (!targetUserId) throw new Error("User creation failed");

    let studentId: number | null = null;

    if (isStudent) {
      const eduId = studentSelectedEducation?.collegeEducationId;
      const branchId = isSelectedSchool
        ? null
        : studentSelectedBranch?.collegeBranchId;
      const yearId = studentSelectedYear?.collegeAcademicYearId;
      const semesterId =
        studentAvailableSemesters.find(
          (s) => s.collegeSemester.toString() === selectedSemester[0]
        )?.collegeSemesterId || null;

      const sectionId = studentAvailableSections.find(
        (s) => s.collegeSections === selectedSections[0]
      )?.collegeSectionsId;

      if (
        !eduId ||
        (!branchId && !isSelectedSchool) ||
        !yearId ||
        (!["Inter"].includes(studentSelectedEducation?.collegeEducationType || "") &&
          !semesterId &&
          !isSelectedSchool) ||
        !sectionId
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
          batch: basicData.batch || null,
        },
        timestamp
      );
      createdStudentId = studentId;

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

      if (selectedSessionId) {
        await createStudentFeeObligation(
          {
            studentId: studentId,
            collegeSessionId: selectedSessionId,
            collegeAcademicYearId: yearId,
            collegeEducationId: eduId,
            collegeBranchId: branchId,
            createdBy: basicData.adminId,
          },
          timestamp
        );
      }

      try {
        let eduTypeToPass = null;
        if (basicData.role === "Student" && studentSelectedEducation) {
          eduTypeToPass = studentSelectedEducation.collegeEducationType;
        }
        await registerUserToHikvision(
          targetUserId,
          basicData.fullName,
          basicData.collegeIntId,
          basicData.role,
          eduTypeToPass
        );
      } catch (hivErr) {
        console.warn("Hikvision registration failed (non-blocking):", hivErr);
      }
    }

    if (isParent && targetUserId) {
      const parentRes = await upsertParentEntry({
        userId: targetUserId,
        studentId: parentStudentId!,
        collegeId: basicData.collegeIntId,
        createdBy: basicData.adminId,
      });
      if (!parentRes.success) {
        throw new Error(parentRes.error || "Parent creation failed");
      }
    }

    if (basicData.identifierValue && !isWellbeing) {
      await upsertIdentifier({
        userId: targetUserId,
        studentId: isStudent ? studentId! : undefined,
        collegeId: basicData.collegeIntId,
        role: basicData.role,
        identifierValue: basicData.identifierValue,
      });
    }

    toast.success("User Created Successfully");
    resetForm();
    // Do not call onClose() so the user can quickly register another person

  } catch (e: any) {
    console.error("Add user failed:", {
      message: e?.message,
      details: e?.details ?? e?.cause?.details,
      hint: e?.hint ?? e?.cause?.hint,
      code: e?.code ?? e?.cause?.code,
    });

    let message = "Something went wrong. Please try again.";

    if (e?.message) {
      const errMsg = e.message.toLowerCase();

      if (errMsg.includes("email")) {
        message = "This email is already registered.";
      } else if (errMsg.includes("mobile")) {
        message = "This mobile number is already in use.";
      } else if (errMsg.includes("student not found for pin number")) {
        message = e.message;
      } else if (errMsg.includes("parent already registered for this student")) {
        message = e.message;
      } else if (
        errMsg.includes("student with roll no") ||
        errMsg.includes("employee with employee id")
      ) {
        message = e.message;
      } else if (errMsg.includes("duplicate")) {
        message = "User already exists with provided details.";
      }
    }

    toast.error(message);

    if (createdStudentId && !user) {
      await supabase
        .from("student_fee_obligation")
        .delete()
        .eq("studentId", createdStudentId);
      await supabase
        .from("student_academic_history")
        .delete()
        .eq("studentId", createdStudentId);
      await supabase
        .from("student_pins")
        .delete()
        .eq("studentId", createdStudentId);
      await supabase.from("students").delete().eq("studentId", createdStudentId);
    }

    if (createdAccountantId && !user) {
      await supabase
        .from("accountant_education_types")
        .delete()
        .eq("accountantId", createdAccountantId);
      await supabase
        .from("accountants")
        .delete()
        .eq("accountantId", createdAccountantId);
    }

    if (createdUserId && !user) {
      await supabase.from("users").delete().eq("userId", createdUserId);
    }
  } finally {
    setLoading(false);
  }
};
