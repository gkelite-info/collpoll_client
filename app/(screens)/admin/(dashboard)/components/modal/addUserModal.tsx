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
import { createStudent } from "@/lib/helpers/admin/registrations/student/studentRegistration";
import { createStudentAcademicHistory } from "@/lib/helpers/admin/registrations/student/academicHistoryRegistration";
import { createFinanceManager } from "@/lib/helpers/admin/registrations/finance/financeManagerRegistration";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { upsertAdminEntry, upsertUser } from "@/lib/helpers/upsertUser";

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

  const initialBasicData = {
    fullName: "",
    email: "",
    mobileCode: "+91",
    mobileNumber: "",
    role: "",
    gender: "Male" as const,
    password: "",
    confirmPassword: "",
    studentId: "",
    collegeId: "",
    collegeCode: "",
    collegeIntId: 0,
    adminId: 0,
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
  const [isSuccess, setIsSuccess] = useState(false);

  const ENTRY_TYPES = ["Regular", "Lateral", "Transfer"];

  const resetForm = () => {
    setBasicData((prev: any) => ({
      ...initialBasicData,
      collegeId: prev.collegeId,
      collegeIntId: prev.collegeIntId,
      adminId: prev.adminId,
    }));
    setSelectedEducationId(null);
    setSelectedBranchId(null);
    setSelectedYearId(null);
    setSelectedSubjectId(null);
    setSelectedSectionIds([]);

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
          gender: user.gender || "Male",
          studentId: user.studentId ? String(user.studentId) : "",
        }));
      } else {
        resetForm();
      }
    }
  }, [isOpen, user]);

  // const filteredBranches = useMemo(
  //   () =>
  //     dbData.branches.filter(
  //       (b) => b.collegeEducationId === selectedEducationId,
  //     ),
  //   [dbData.branches, selectedEducationId],
  // );

  // const filteredYears = useMemo(
  //   () => dbData.years.filter((y) => y.collegeBranchId === selectedBranchId),
  //   [dbData.years, selectedBranchId],
  // );

  // const filteredSubjects = useMemo(
  //   () =>
  //     dbData.subjects.filter((s) => s.collegeAcademicYearId === selectedYearId),
  //   [dbData.subjects, selectedYearId],
  // );

  // const filteredSections = useMemo(
  //   () =>
  //     dbData.sections.filter((s) => s.collegeAcademicYearId === selectedYearId),
  //   [dbData.sections, selectedYearId],
  // );

  const filteredBranches = useMemo(
    () =>
      dbData.branches.filter(
        (b) => b.collegeEducationId == selectedEducationId,
      ),
    [dbData.branches, selectedEducationId],
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
        (e) => e.collegeEducationType === selectedDegrees[0],
      ),
    [selectedDegrees, dbData.educations],
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
  ) => setBasicData((p: any) => ({ ...p, [e.target.name]: e.target.value }));

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

  const isAdmin = basicData.role === "Admin";
  const isFaculty = basicData.role === "Faculty";
  const isStudent = basicData.role === "Student";
  const isParent = basicData.role === "Parent";
  const isFinance = basicData.role === "Finance";


  const handleSave = async () => {
    if (!basicData.fullName || !basicData.email || !basicData.role)
      return toast.error("Required fields missing.");

    if (
      isFaculty &&
      (!selectedEducationId ||
        !selectedBranchId ||
        !selectedYearId ||
        !selectedSubjectId ||
        selectedSectionIds.length === 0)
    )
      return toast.error("Complete all academic fields for Faculty.");

    if (isStudent) {
      if (
        !selectedDegrees.length ||
        !selectedDepts.length ||
        !selectedYears.length ||
        !selectedSemester.length ||
        !selectedEntryType.length ||
        !selectedSections.length
      ) {
        return toast.error("Complete all academic fields for Student.");
      }
    }

    if (isParent && !basicData.studentId)
      return toast.error("Student ID required.");

    if (isFinance && !selectedEducationId)
      return toast.error("Select Education Type for Finance.");

    if (
      !user &&
      (!basicData.password || basicData.password !== basicData.confirmPassword)
    )
      return toast.error("Check passwords.");

    setLoading(true);
    let createdUserId: number | null = null;

    try {
      const timestamp = new Date().toISOString();

      let targetUserId: number | null = null;


      if (isAdmin) {
        // 1️⃣ Create Auth user first
        const { data: authData, error: authError } =
          await supabase.auth.signUp({
            email: basicData.email,
            password: basicData.password,
          });

        if (authError || !authData.user) {
          throw new Error(authError?.message || "Auth user creation failed");
        }

        const authId = authData.user.id;

        // 2️⃣ Insert into users table
        const userRes = await upsertUser({
          auth_id: authId, // ✅ VERY IMPORTANT
          fullName: basicData.fullName,
          email: basicData.email,
          mobile: `${basicData.mobileCode}${basicData.mobileNumber}`,
          role: "Admin",
          collegeId: basicData.collegeIntId,
          collegePublicId: basicData.collegeId,
          gender: basicData.gender,
        });

        if (!userRes.success || !userRes.data) {
          throw new Error(userRes.error || "User creation failed");
        }

        targetUserId = userRes.data.userId;

        // 3️⃣ Insert into admins table
        const adminRes = await upsertAdminEntry({
          userId: targetUserId!,
          fullName: basicData.fullName,
          email: basicData.email,
          mobile: `${basicData.mobileCode}${basicData.mobileNumber}`,
          gender: basicData.gender,
          collegePublicId: basicData.collegeId,
          collegeCode: basicData.collegeCode,
        });

        if (!adminRes.success) {
          throw new Error(adminRes.error || "Admin creation failed");
        }
      }
      else {
        // 🔵 All other roles remain EXACTLY SAME
        targetUserId = await persistUser(
          !user,
          { ...basicData, collegePublicId: basicData.collegeId },
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
          collegeEducationId: selectedEducationId!,
          createdBy: basicData.adminId,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }

      if (isFaculty) {
        await persistFaculty(
          targetUserId,
          { ...basicData, collegePublicId: basicData.collegeId },
          {
            educationId: selectedEducationId!,
            branchId: selectedBranchId!,
            yearId: selectedYearId!,
            subjectId: selectedSubjectId!,
            sectionIds: selectedSectionIds,
          },
          timestamp,
          !!user,
        );
      }

      if (!targetUserId) throw new Error("User creation failed");

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

        if (!eduId || !branchId || !yearId || !semesterId || !sectionId) {
          throw new Error("Invalid academic selection data");
        }

        const studentId = await createStudent(
          {
            userId: targetUserId,
            collegeEducationId: eduId,
            collegeBranchId: branchId,
            collegeId: basicData.collegeIntId,
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
      }

      if (isParent && targetUserId) {
        await upsertParentEntry({
          studentId: parseInt(basicData.studentId),
          fullName: basicData.fullName,
          email: basicData.email,
          mobile: `${basicData.mobileCode}${basicData.mobileNumber}`,
          gender: basicData.gender,
          collegeId: basicData.collegeId,
          collegeCode: basicData.collegeId.replace(/\d+/g, ""),
          createdBy: basicData.adminId,
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
    } catch (e: any) {
      console.error(e);
      if (createdUserId && !user) {
        await supabase.from("users").delete().eq("userId", createdUserId);
      }
      toast.error(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
        <div className="bg-white text-black w-full max-w-[550px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
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
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={basicData.fullName}
                onChange={handleBasicChange}
                className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                value={basicData.email}
                onChange={handleBasicChange}
                className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  College ID
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
                  Mobile
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="mobileCode"
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
                <label className="text-xs font-bold text-[#2D3748]">Role</label>
                <div className="relative">
                  <select
                    name="role"
                    value={basicData.role}
                    onChange={handleBasicChange}
                    className="w-full border cursor-pointer border-gray-200 rounded-md px-3 py-1 text-sm appearance-none outline-none bg-white focus:ring-1 focus:ring-[#48C78E] text-gray-600"
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    <option value="Admin">Admin</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Student">Student</option>
                    <option value="Parent">Parent</option>
                    <option value="Finance">Finance</option>
                  </select>
                  <CaretDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {(isFaculty || isFinance || isAdmin) && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Education Type
                  </label>
                  <div className="relative">
                    <select
                      value={selectedEducationId || ""}
                      onChange={(e) => {
                        setSelectedEducationId(Number(e.target.value));
                        setSelectedBranchId(null);
                      }}
                      className="w-full border border-gray-200 appearance-none rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] cursor-pointer"
                    >
                      <option value="" disabled>
                        Select Education Type
                      </option>
                      {dbData.educations.map((e: any) => (
                        <option
                          key={e.collegeEducationId}
                          value={e.collegeEducationId}
                        >
                          {e.collegeEducationType}
                        </option>
                      ))}
                    </select>
                    <CaretDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              )}
              {isStudent && (
                <CustomMultiSelect
                  label="Education Type"
                  placeholder="Select Education"
                  options={degreeOptions}
                  selectedValues={selectedDegrees}
                  onChange={(v) => {
                    handleSingleSelect(v, setSelectedDegrees);
                    setSelectedDepts([]);
                    setSelectedYears([]);
                    setSelectedSemester([]);
                    setSelectedSections([]);
                  }}
                  onRemove={() => setSelectedDegrees([])}
                />
              )}

              {isParent && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Student ID
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

            {isFaculty && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2D3748]">
                      Branch
                    </label>
                    <div className="relative">
                      <select
                        value={selectedBranchId || ""}
                        disabled={!selectedEducationId}
                        onChange={(e) => {
                          setSelectedBranchId(Number(e.target.value));
                          setSelectedYearId(null);
                        }}
                        className="w-full border appearance-none border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] cursor-pointer disabled:bg-gray-50"
                      >
                        <option value="" disabled>
                          Select Branch
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
                      Year
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
                      Subject
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
                  />
                </div>
              </>
            )}

            {isStudent && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <CustomMultiSelect
                    label="Branch Type"
                    placeholder="Select Branch"
                    options={branchOptions}
                    selectedValues={selectedDepts}
                    disabled={selectedDegrees.length === 0}
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
                  <CustomMultiSelect
                    label="Semester"
                    placeholder="Select Semester"
                    options={semesterOptions}
                    selectedValues={selectedSemester}
                    disabled={selectedYears.length === 0}
                    onChange={(v) => handleSingleSelect(v, setSelectedSemester)}
                    onRemove={() => setSelectedSemester([])}
                  />
                  <CustomMultiSelect
                    label="Section"
                    placeholder="Select Section"
                    options={sectionOptions}
                    selectedValues={selectedSections}
                    disabled={selectedYears.length === 0}
                    onChange={(v) => handleSingleSelect(v, setSelectedSections)}
                    onRemove={() => setSelectedSections([])}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <CustomMultiSelect
                    label="Entry Type"
                    placeholder="Select Entry Type"
                    options={ENTRY_TYPES}
                    selectedValues={selectedEntryType}
                    disabled={selectedSemester.length === 0}
                    onChange={(v) =>
                      handleSingleSelect(v, setSelectedEntryType)
                    }
                    onRemove={() => setSelectedEntryType([])}
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">Gender</label>
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

            {!user && (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={basicData.password}
                      onChange={handleBasicChange}
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
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={basicData.confirmPassword}
                    onChange={handleBasicChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-5 border-t border-gray-50 flex gap-4 flex-shrink-0 bg-white">
            <button
              onClick={handleSave}
              disabled={loading || isSuccess}
              className={`flex-1 cursor-pointer text-white text-sm font-medium py-1 rounded-md transition-all shadow-sm ${isSuccess
                ? "bg-green-600 cursor-default"
                : "bg-[#43C17A] hover:bg-[#3ea876]"
                }`}
            >
              {isSuccess ? "Saved" : loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border cursor-pointer border-gray-300 text-[#282828] text-sm font-medium py-1 rounded-md hover:bg-gray-50 transition-all"
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
