"use client";
import {
  fetchAdminContext,
  fetchModalInitialData,
  persistFaculty,
  persistUser,
} from "@/lib/helpers/admin/upsertFaculty";
import { upsertParentEntry } from "@/lib/helpers/parent/createParent";
import { upsertStudentEntry } from "@/lib/helpers/profile/students";
import { supabase } from "@/lib/supabaseClient";
import { CaretDown, Eye, EyeSlash, Lock, X } from "@phosphor-icons/react";
import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CustomMultiSelect } from "./userModalComponents";

const BASE_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTION_LETTERS = ["A", "B", "C", "D"];

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
  }>({ educations: [], branches: [], years: [], sections: [], subjects: [] });

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
  const [subjectInput, setSubjectInput] = useState("");

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
    setSubjectInput("");
    setShowPassword(false);
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
            adminId: adminContext.adminId,
          }));

          const data = await fetchModalInitialData(adminContext.collegeId);
          setDbData(data);
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

  const filteredBranches = useMemo(
    () =>
      dbData.branches.filter(
        (b) => b.collegeEducationId === selectedEducationId,
      ),
    [dbData.branches, selectedEducationId],
  );

  const filteredYears = useMemo(
    () => dbData.years.filter((y) => y.collegeBranchId === selectedBranchId),
    [dbData.years, selectedBranchId],
  );

  const filteredSubjects = useMemo(
    () =>
      dbData.subjects.filter((s) => s.collegeAcademicYearId === selectedYearId),
    [dbData.subjects, selectedYearId],
  );

  const filteredSections = useMemo(
    () =>
      dbData.sections.filter((s) => s.collegeAcademicYearId === selectedYearId),
    [dbData.sections, selectedYearId],
  );

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setBasicData((p: any) => ({ ...p, [e.target.name]: e.target.value }));
  const toggleSelection = (list: string[], setList: Function, item: string) =>
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
    );
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
  const availableDeptsGrouped = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    selectedDegrees.forEach((degName) => {
      const edu = dbData.educations.find(
        (e: any) => e.collegeEducationType === degName,
      );
      if (edu) {
        grouped[degName] = dbData.branches
          .filter((b: any) => b.collegeEducationId === edu.collegeEducationId)
          .map((b: any) => b.collegeBranchCode);
      }
    });
    return grouped;
  }, [selectedDegrees, dbData.educations, dbData.branches]);
  const availableYearsGrouped = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    selectedDepts.forEach((dept) => {
      grouped[dept] = BASE_YEARS.map((y) => `${dept} - ${y}`);
    });
    return grouped;
  }, [selectedDepts]);
  const availableSectionsGrouped = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    selectedDepts.forEach((dept) => {
      grouped[dept] = SECTION_LETTERS.map((l) => `${dept}-${l}`);
    });
    return grouped;
  }, [selectedDepts]);

  const isFaculty = basicData.role === "Faculty";
  const isStudent = basicData.role === "Student";
  const isParent = basicData.role === "Parent";

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
      return toast.error("Complete all academic fields.");
    if (isParent && !basicData.studentId)
      return toast.error("Student ID required.");
    if (
      !user &&
      (!basicData.password || basicData.password !== basicData.confirmPassword)
    )
      return toast.error("Check passwords.");

    setLoading(true);
    let createdUserId: number | null = null;

    try {
      const timestamp = new Date().toISOString();
      const targetUserId = await persistUser(
        !user,
        { ...basicData, collegePublicId: basicData.collegeId },
        user ? user.userId : null,
        timestamp,
      );
      if (!user) createdUserId = targetUserId;

      if (isFaculty && targetUserId) {
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

      if (isStudent && targetUserId) {
        const yearInt = parseInt(selectedYears[0]?.match(/(\d+)/)?.[1] || "1");
        await upsertStudentEntry({
          userId: targetUserId,
          fullName: basicData.fullName,
          email: basicData.email,
          mobile: `${basicData.mobileCode}${basicData.mobileNumber}`,
          role: "Student",
          gender: basicData.gender,
          collegeId: basicData.collegeId,
          createdBy: basicData.adminId,
          department: selectedDepts[0],
          degree: selectedDegrees[0],
          year: yearInt,
          section: selectedSections[0],
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

      toast.success("Saved Successfully");
      resetForm();
      onClose();
    } catch (e: any) {
      console.error(e);
      if (createdUserId && !user)
        await supabase.from("users").delete().eq("userId", createdUserId);
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
                    type="number"
                    name="mobileNumber"
                    value={basicData.mobileNumber}
                    onChange={handleBasicChange}
                    className="flex-1 border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
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
                    <option value="Faculty">Faculty</option>
                    <option value="Student">Student</option>
                    <option value="Parent">Parent</option>
                  </select>
                  <CaretDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              {isFaculty && (
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
                  label="Degree"
                  placeholder="Select Degree"
                  options={degreeOptions}
                  selectedValues={selectedDegrees}
                  onChange={(v) =>
                    toggleSelection(selectedDegrees, setSelectedDegrees, v)
                  }
                  onRemove={(v) =>
                    toggleSelection(selectedDegrees, setSelectedDegrees, v)
                  }
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
                    label="Department"
                    placeholder="Select Dept"
                    options={availableDeptsGrouped}
                    selectedValues={selectedDepts}
                    disabled={selectedDegrees.length === 0}
                    isGrouped={true}
                    onChange={(v) =>
                      toggleSelection(selectedDepts, setSelectedDepts, v)
                    }
                    onRemove={(v) =>
                      toggleSelection(selectedDepts, setSelectedDepts, v)
                    }
                  />
                  <div className="hidden md:block"></div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <CustomMultiSelect
                    label="Year"
                    placeholder="Select Year"
                    options={availableYearsGrouped}
                    selectedValues={selectedYears}
                    disabled={selectedDepts.length === 0}
                    isGrouped={true}
                    onChange={(v) =>
                      toggleSelection(selectedYears, setSelectedYears, v)
                    }
                    onRemove={(v) =>
                      toggleSelection(selectedYears, setSelectedYears, v)
                    }
                  />
                  <CustomMultiSelect
                    label="Section"
                    placeholder="Select Section"
                    options={availableSectionsGrouped}
                    selectedValues={selectedSections}
                    disabled={selectedDepts.length === 0}
                    isGrouped={true}
                    onChange={(v) =>
                      toggleSelection(selectedSections, setSelectedSections, v)
                    }
                    onRemove={(v) =>
                      toggleSelection(selectedSections, setSelectedSections, v)
                    }
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
              disabled={loading}
              className="flex-1 bg-[#43C17A] text-white text-sm font-medium py-1 rounded-md hover:bg-[#3ea876] transition-all shadow-sm"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-[#282828] text-sm font-medium py-1 rounded-md hover:bg-gray-50 transition-all"
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
