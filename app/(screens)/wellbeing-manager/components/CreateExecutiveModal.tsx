"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { CaretLeft, Eye, EyeSlash, Lock, X, Check } from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchModalInitialData } from "@/lib/helpers/admin/upsertFaculty";
import { fetchWellbeingCategories } from "@/lib/helpers/wellbeingCategories/wellbeingCategoryAPI";
import { saveWellbeingExecutive } from "@/lib/helpers/wellbeing/wellbeingExecutiveAPI";

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

const IDENTIFIER_REGEX = /^(?=.*\d)[A-Za-z0-9]+(?:-[A-Za-z0-9]+){0,2}$/;

const validateIdentifier = (value: string) => {
  if (!value?.trim()) {
    return "is required.";
  }
  if (value.length < 6 || value.length > 15 || !IDENTIFIER_REGEX.test(value)) {
    return "Must be 6–15 characters and include at least one number. Only letters, numbers and up to two hyphen (-) allowed.";
  }
  return null;
};

interface CustomSingleSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  selectedValue: string;
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
  hoverClassName?: string;
}

const CustomSingleSelect: React.FC<CustomSingleSelectProps> = ({
  label,
  placeholder,
  options,
  selectedValue,
  onChange,
  required = false,
  disabled = false,
  hoverClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1 w-full relative" ref={wrapperRef}>
      <label className="text-xs font-bold text-[#2D3748]">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`
          w-full border rounded-md px-3 py-1.5 text-sm flex justify-between items-center bg-white transition-all select-none
          ${isOpen ? "border-[#48C78E] ring-1 ring-[#48C78E]" : "border-gray-200"}
          ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : "cursor-pointer"}
        `}
      >
        <span className={`truncate ${selectedValue ? "text-gray-700 font-medium" : "text-gray-400"}`}>
          {selectedValue || placeholder}
        </span>
        <CaretLeft
          size={14}
          weight="bold"
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : "-rotate-90"
            }`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[9999] top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-100 rounded-md shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">No options available</div>
          ) : (
            options.map((opt, idx) => (
              <div
                key={`${label}-${opt}-${idx}`}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm text-gray-700 transition-colors ${hoverClassName || "hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <span>{opt}</span>
                {selectedValue === opt && (
                  <Check size={14} weight="bold" className="text-[#48C78E]" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function CreateExecutiveModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { collegeId, collegePublicId, userId } = useUser();
  const [dbData, setDbData] = useState<{
    educations: any[];
    branches: any[];
    years: any[];
    sections: any[];
    subjects: any[];
  }>({
    educations: [],
    branches: [],
    years: [],
    sections: [],
    subjects: [],
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const initialBasicData = {
    fullName: "",
    email: "",
    mobileCode: "+91",
    mobileNumber: "",
    role: "WellbeingExecutive",
    gender: "",
    password: "",
    confirmPassword: "",
    dateOfJoining: "",
    professionalExperienceYears: undefined as number | undefined,
    identifierValue: "",
  };

  const [basicData, setBasicData] = useState<any>(initialBasicData);

  const [selectedEducation, setSelectedEducation] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [categoriesObjList, setCategoriesObjList] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (isOpen && collegeId) {
      const init = async () => {
        try {
          const data = await fetchModalInitialData(collegeId);
          setDbData(data);
        } catch (error) {
          toast.error("Failed to load college metadata");
        }
      };
      const loadCategories = async () => {
        setLoadingCategories(true);
        try {
          const { categories: fetched } = await fetchWellbeingCategories(collegeId, 1, 100);
          setCategoriesObjList(fetched);
          const names = fetched.map((cat) => cat.categoryName);
          setCategoriesList(names);
        } catch (error) {
          console.error("Failed to fetch wellbeing categories for executive creation:", error);
        } finally {
          setLoadingCategories(false);
        }
      };
      init();
      loadCategories();
    }
  }, [isOpen, collegeId]);

  const selectedCategoryId = useMemo(() => {
    return categoriesObjList.find((cat) => cat.categoryName === selectedCategory)?.categoryId || null;
  }, [categoriesObjList, selectedCategory]);

  const resetForm = () => {
    setBasicData(initialBasicData);
    setSelectedEducation("");
    setSelectedBranch("");
    setSelectedYear("");
    setSelectedSection("");
    setSelectedCategory("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsSuccess(false);
  };

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
      if (hyphenCount > 2 || sanitized.includes("--")) return;
      formattedValue = sanitized;
    }

    setBasicData((p: any) => ({ ...p, [name]: formattedValue }));
  };

  const degreeOptions = useMemo(
    () => dbData.educations.map((e: any) => e.collegeEducationType),
    [dbData.educations],
  );

  const selectedEducationId = useMemo(() => {
    return dbData.educations.find((e: any) => e.collegeEducationType === selectedEducation)?.collegeEducationId || null;
  }, [dbData.educations, selectedEducation]);

  const filteredBranches = useMemo(
    () =>
      selectedEducationId
        ? dbData.branches.filter(
          (b) => b.collegeEducationId === selectedEducationId,
        )
        : [],
    [dbData.branches, selectedEducationId],
  );

  const branchOptions = useMemo(
    () => filteredBranches.map((b: any) => b.collegeBranchCode),
    [filteredBranches],
  );

  const selectedBranchId = useMemo(() => {
    return filteredBranches.find((b: any) => b.collegeBranchCode === selectedBranch)?.collegeBranchId || null;
  }, [filteredBranches, selectedBranch]);

  const filteredYears = useMemo(() => {
    if (!selectedBranchId) return [];
    const years = dbData.years.filter((y) => y.collegeBranchId == selectedBranchId);
    return years.sort((a, b) => {
      const numA = parseInt(a.collegeAcademicYear) || 0;
      const numB = parseInt(b.collegeAcademicYear) || 0;
      return numA - numB;
    });
  }, [dbData.years, selectedBranchId]);

  const yearOptions = useMemo(
    () => filteredYears.map((y: any) => y.collegeAcademicYear),
    [filteredYears],
  );

  const selectedYearId = useMemo(() => {
    return filteredYears.find((y: any) => y.collegeAcademicYear === selectedYear)?.collegeAcademicYearId || null;
  }, [filteredYears, selectedYear]);

  const filteredSections = useMemo(() => {
    if (!selectedYearId) return [];
    const rawSections = dbData.sections.filter(
      (s) => s.collegeAcademicYearId == selectedYearId
    );
    return Array.from(
      new Map(rawSections.map((s) => [s.collegeSections, s])).values()
    );
  }, [dbData.sections, selectedYearId]);

  const sectionOptions = useMemo(
    () => filteredSections.map((s: any) => s.collegeSections),
    [filteredSections],
  );

  const selectedSectionId = useMemo(() => {
    return filteredSections.find((s: any) => s.collegeSections === selectedSection)?.collegeSectionsId || null;
  }, [filteredSections, selectedSection]);

  const handleSave = async () => {
    if (!basicData.fullName) return toast.error("Full Name is required.");
    if (!basicData.email) return toast.error("Email ID is required.");

    const hasMobileNumber = Boolean(basicData.mobileNumber?.trim());
    if (!basicData.mobileCode) {
      return toast.error("Country code is required.");
    }
    if (!/^\+[0-9]+$/.test(basicData.mobileCode)) {
      return toast.error("Invalid country code format.");
    }
    if (!basicData.mobileNumber) {
      return toast.error("Mobile is required.");
    }
    if (hasMobileNumber && !/^[0-9]{10}$/.test(basicData.mobileNumber)) {
      return toast.error("Mobile must be exactly 10 digits.");
    }
    if (hasMobileNumber && basicData.mobileCode === "+91") {
      if (!["6", "7", "8", "9"].includes(basicData.mobileNumber.charAt(0))) {
        return toast.error(
          "Indian mobile number must start with 6, 7, 8, or 9.",
        );
      }
    }

    if (!selectedEducation) return toast.error("Education Type is required.");
    if (!selectedBranch) return toast.error("Branch is required.");
    if (!selectedYear) return toast.error("Year is required.");
    if (!selectedSection) return toast.error("Section is required.");
    if (!selectedCategory) return toast.error("Category is required.");

    if (!basicData.dateOfJoining) {
      return toast.error("Date of Joining is required.");
    }

    if (basicData.professionalExperienceYears === undefined || basicData.professionalExperienceYears === null) {
      return toast.error("Experience (Years) is required.");
    }

    const empIdError = validateIdentifier(basicData.identifierValue);
    if (empIdError) {
      return toast.error(`Employee Id ${empIdError}`);
    }

    if (!basicData.gender) {
      return toast.error("Please select a gender.");
    }

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

    setLoading(true);
    try {
      const payload = {
        fullName: basicData.fullName,
        email: basicData.email,
        mobileCode: basicData.mobileCode,
        mobileNumber: basicData.mobileNumber,
        gender: basicData.gender,
        dateOfJoining: basicData.dateOfJoining,
        professionalExperienceYears: Number(basicData.professionalExperienceYears),
        employeeId: basicData.identifierValue,
        password: basicData.password,
        collegeId: collegeId!,
        collegePublicId: collegePublicId || "",
        categoryId: selectedCategoryId!,
        collegeEducationId: selectedEducationId!,
        collegeBranchId: selectedBranchId!,
        collegeAcademicYearId: selectedYearId!,
        collegeSectionsId: selectedSectionId!,
        byManager: userId!,
      };

      const res = await saveWellbeingExecutive(payload);

      if (!res.success) {
        throw new Error(res.error);
      }

      toast.success("Wellbeing Executive Created Successfully");
      setIsSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
        setLoading(false);
        setIsSuccess(false);
      }, 2000);
    } catch (e: any) {
      toast.error(e?.message || "Failed to create executive.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
        <div className="bg-white text-black w-full max-w-[550px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-clip animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-bold text-[#16284F]">Add Wellbeing Executive</h2>
            <X
              size={20}
              weight="bold"
              className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
              onClick={onClose}
            />
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex flex-col gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={basicData.fullName}
                onChange={handleBasicChange}
                placeholder="Enter Full Name"
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
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
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  College ID <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={collegeId || ""}
                    readOnly
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-3 py-1.5 text-sm outline-none cursor-not-allowed"
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
                    className="w-[60px] border border-gray-200 rounded-md px-2 py-1.5 text-sm text-center outline-none focus:ring-1 focus:ring-[#48C78E]"
                  />
                  <input
                    type="tel"
                    name="mobileNumber"
                    placeholder="98765432XX"
                    value={basicData.mobileNumber}
                    onChange={handleBasicChange}
                    className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Role <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value="Wellbeing Executive"
                    readOnly
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-3 py-1.5 text-sm outline-none cursor-not-allowed"
                  />
                  <Lock
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              <CustomSingleSelect
                label="Category"
                placeholder={loadingCategories ? "Loading categories..." : "Select Category"}
                options={categoriesList}
                selectedValue={selectedCategory}
                onChange={setSelectedCategory}
                hoverClassName="hover:bg-blue-600 hover:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <CustomSingleSelect
                label="Education Type"
                placeholder="Select Education Type"
                options={degreeOptions}
                selectedValue={selectedEducation}
                onChange={(val) => {
                  setSelectedEducation(val);
                  setSelectedBranch("");
                  setSelectedYear("");
                  setSelectedSection("");
                }}
                required
              />

              <CustomSingleSelect
                label="Branch"
                placeholder="Select Branch"
                options={branchOptions}
                selectedValue={selectedBranch}
                onChange={(val) => {
                  setSelectedBranch(val);
                  setSelectedYear("");
                  setSelectedSection("");
                }}
                disabled={!selectedEducation}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <CustomSingleSelect
                label="Year"
                placeholder="Select Year"
                options={yearOptions}
                selectedValue={selectedYear}
                onChange={(val) => {
                  setSelectedYear(val);
                  setSelectedSection("");
                }}
                disabled={!selectedBranch}
                required
              />

              <CustomSingleSelect
                label="Section"
                placeholder="Select Section"
                options={sectionOptions}
                selectedValue={selectedSection}
                onChange={setSelectedSection}
                disabled={!selectedYear}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Date of Joining <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={basicData.dateOfJoining}
                  onChange={handleBasicChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
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
                  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Employee Id <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="identifierValue"
                  value={basicData.identifierValue}
                  onChange={handleBasicChange}
                  placeholder="Enter Employee Id"
                  maxLength={15}
                  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Gender <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-6 mt-2.5">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                    className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] pr-8"
                  />
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeSlash size={16} />}
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
                    className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] pr-8"
                  />
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Eye size={16} /> : <EyeSlash size={16} />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 border-t border-gray-50 flex gap-4 flex-shrink-0 bg-white">
            <button
              onClick={onClose}
              className="flex-1 border focus:outline-none cursor-pointer border-gray-300 text-[#282828] text-sm font-medium py-2 rounded-md hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || isSuccess}
              className={`flex-1 cursor-pointer focus:outline-none text-white text-sm font-medium py-2 rounded-md transition-all shadow-sm ${isSuccess
                  ? "bg-green-600 cursor-default"
                  : "bg-[#43C17A] hover:bg-[#3ea876]"
                }`}
            >
              {isSuccess ? "Saved" : loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
