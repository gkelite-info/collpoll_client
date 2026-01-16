"use client";
import React, { useState, useEffect, useMemo } from "react";
import { X, CaretDown, Eye, EyeSlash, Plus, Lock } from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import { CustomMultiSelect, PillTag } from "./userModalComponents";
import {
  fetchModalInitialData,
  persistUser,
  persistFaculty,
} from "@/lib/helpers/admin/upsertFaculty";

import { useUser } from "@/app/utils/context/UserContext";
import { upsertStudentEntry } from "@/lib/helpers/profile/students";
import { upsertParentEntry } from "@/lib/helpers/parent/createParent";

const BASE_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTION_LETTERS = ["A", "B", "C", "D"];

const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const AddUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}> = ({ isOpen, onClose, user }) => {
  const {
    userId: adminId,
    collegeId,
    collegePublicId,
    loading: userLoading,
  } = useUser();

  const [dbData, setDbData] = useState<any>({
    educations: [],
    departments: [],
    subjects: [],
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
    collegeId: collegePublicId || "",
    collegeIntId: collegeId || 0,
    adminId: adminId || 0,
  };

  const [basicData, setBasicData] = useState<any>(initialBasicData);
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");

  useEffect(() => {
    if (!user && !userLoading && adminId) {
      setBasicData((prev: any) => ({
        ...prev,
        collegeId: collegePublicId || "",
        collegeIntId: collegeId || 0,
        adminId: adminId || 0,
      }));
    }
  }, [userLoading, adminId, collegeId, collegePublicId, user]);

  const resetForm = () => {
    setBasicData({
      ...initialBasicData,
      collegeId: collegePublicId || "",
      collegeIntId: collegeId || 0,
      adminId: adminId || 0,
    });
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
        const { formattedDbData } = await fetchModalInitialData();
        if (formattedDbData) setDbData(formattedDbData);
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
          collegeIntId: user.collegeId || p.collegeIntId,
        }));
        if (user.degrees)
          setSelectedDegrees(
            Array.isArray(user.degrees)
              ? user.degrees.map((d: any) => d.name || d)
              : JSON.parse(user.degrees)
          );
        if (user.departments)
          setSelectedDepts(
            Array.isArray(user.departments)
              ? user.departments.map((d: any) => d.name || d)
              : JSON.parse(user.departments)
          );
        if (user.subjects)
          setSelectedSubjects(
            Array.isArray(user.subjects)
              ? user.subjects.map((s: any) => s.name || s)
              : JSON.parse(user.subjects)
          );
        if (user.sections)
          setSelectedSections(
            Array.isArray(user.sections)
              ? user.sections.map((s: any) => s.name || s)
              : JSON.parse(user.sections)
          );
      } else {
        resetForm();
      }
    }
  }, [isOpen, user]);

  const degreeOptions = useMemo(
    () => dbData.educations.map((e: any) => e.name),
    [dbData.educations]
  );
  const availableDeptsGrouped = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    selectedDegrees.forEach((deg) => {
      const edu = dbData.educations.find((e: any) => e.name === deg);
      if (edu?.rawDepts) grouped[deg] = edu.rawDepts.map((d: any) => d.code);
    });
    return grouped;
  }, [selectedDegrees, dbData.educations]);

  const availableYearsGrouped = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    selectedDepts.forEach((dept) => {
      grouped[dept] = BASE_YEARS.map((year) => `${dept} - ${year}`);
    });
    return grouped;
  }, [selectedDepts]);

  const availableSectionsGrouped = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    selectedDepts.forEach((dept) => {
      grouped[dept] = SECTION_LETTERS.map((letter) => `${dept}-${letter}`);
    });
    return grouped;
  }, [selectedDepts]);

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBasicData((p: any) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const toggleSelection = (list: string[], setList: Function, item: string) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  const isFaculty = basicData.role === "Faculty";
  const isStudent = basicData.role === "Student";
  const isParent = basicData.role === "Parent";
  const showAcademicFields = isFaculty || isStudent;

  const handleSave = async () => {
    if (!basicData.fullName || !basicData.email || !basicData.role)
      return toast.error("Please fill in all required fields.");

    // Parent Validation
    if (isParent && !basicData.studentId)
      return toast.error("Student ID is required for Parent accounts.");

    // Student Validation
    if (isStudent) {
      if (selectedDegrees.length !== 1)
        return toast.error("Students must have exactly one Degree.");
      if (selectedDepts.length !== 1)
        return toast.error("Students must have exactly one Department.");
      if (selectedYears.length !== 1)
        return toast.error("Students must have exactly one Year.");
      if (selectedSections.length !== 1)
        return toast.error("Students must have exactly one Section.");
    }

    if (!user) {
      if (!basicData.password)
        return toast.error("Password is required for new users.");
      if (basicData.password !== basicData.confirmPassword)
        return toast.error("Passwords do not match.");
    }

    setLoading(true);
    try {
      const timestamp = new Date().toISOString();
      const fullMobile = `${basicData.mobileCode}${basicData.mobileNumber}`;

      // 1. Create User (Common)
      const targetUserId = await persistUser(
        !user,
        { ...basicData, collegePublicId: basicData.collegeId },
        user ? user.userId : null,
        timestamp
      );

      // --- FACULTY ---
      if (isFaculty && targetUserId) {
        const degreesPayload = dbData.educations
          .filter((e: any) => selectedDegrees.includes(e.name))
          .map((e: any) => ({ uuid: generateUUID(), name: e.name }));
        const departmentsPayload = dbData.departments
          .filter((d: any) => selectedDepts.includes(d.code))
          .map((d: any) => ({
            uuid: generateUUID(),
            name: d.name,
            code: d.code,
          }));
        const subjectsPayload = selectedSubjects.map((name) => {
          const found = dbData.subjects.find((s: any) => s.name === name);
          return { uuid: found?.uuid || generateUUID(), name };
        });
        const sectionsPayload = selectedSections.map((name) => ({
          uuid: generateUUID(),
          name,
        }));
        const yearsPayload = selectedYears.map((y) => ({
          uuid: generateUUID(),
          name: y,
        }));

        await persistFaculty(
          targetUserId,
          { ...basicData, collegePublicId: basicData.collegeId },
          {
            degrees: degreesPayload,
            departments: departmentsPayload,
            subjects: subjectsPayload,
            sections: sectionsPayload,
            years: yearsPayload,
          },
          timestamp,
          !!user
        );
      }

      // --- STUDENT ---
      if (isStudent && targetUserId) {
        const yearString = selectedYears[0] || "";
        const yearMatch = yearString.match(/(\d+)(?:st|nd|rd|th)/);
        const yearInt = yearMatch ? parseInt(yearMatch[1]) : 1;

        const studentPayload = {
          userId: targetUserId,
          fullName: basicData.fullName,
          email: basicData.email,
          mobile: fullMobile,
          role: "Student",
          gender: basicData.gender,
          collegeId: basicData.collegeId, // String collegePublicId
          createdBy: basicData.adminId,
          department: selectedDepts[0],
          degree: selectedDegrees[0],
          year: yearInt,
          section: selectedSections[0],
        };

        const result = await upsertStudentEntry(studentPayload);
        if (!result.success)
          throw new Error(result.error || "Failed to save student profile");
      }

      if (isParent) {
        const parentPayload = {
          studentId: parseInt(basicData.studentId),
          fullName: basicData.fullName,
          email: basicData.email,
          mobile: fullMobile,
          gender: basicData.gender,
          collegeId: basicData.collegeId, // String collegePubliciD
          collegeCode: basicData.collegeId.replace(/\d+/g, ""),
          createdBy: basicData.adminId,
        };

        const result = await upsertParentEntry(parentPayload);
        if (!result.success)
          throw new Error(result.error || "Failed to save parent profile");
      }

      toast.success("Saved Successfully");
      resetForm();
      onClose();
    } catch (e: any) {
      console.error(e);
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
                    value={basicData.collegeId}
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
                      Select a role
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
              {showAcademicFields && (
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

            {showAcademicFields && (
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
                  {isFaculty ? (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2D3748]">
                        Subject
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter Subject"
                          value={subjectInput}
                          disabled={selectedDepts.length === 0}
                          onChange={(e) => setSubjectInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            subjectInput &&
                            (toggleSelection(
                              selectedSubjects,
                              setSelectedSubjects,
                              subjectInput
                            ),
                            setSubjectInput(""))
                          }
                          className="flex-1 border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                        />
                        <button
                          onClick={() =>
                            subjectInput &&
                            (toggleSelection(
                              selectedSubjects,
                              setSelectedSubjects,
                              subjectInput
                            ),
                            setSubjectInput(""))
                          }
                          className="bg-[#43C17A] text-white p-1.5 rounded-md hover:bg-[#3ea876] transition-colors"
                        >
                          <Plus size={16} weight="bold" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSubjects.map((s) => (
                          <PillTag
                            key={s}
                            label={s}
                            onRemove={() =>
                              toggleSelection(
                                selectedSubjects,
                                setSelectedSubjects,
                                s
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block"></div>
                  )}
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
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        basicData.gender === g
                          ? "border-[#48C78E]"
                          : "border-gray-300"
                      }`}
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
