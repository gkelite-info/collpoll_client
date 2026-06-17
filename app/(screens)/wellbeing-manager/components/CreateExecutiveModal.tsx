"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { CaretLeft, Eye, EyeSlash, Lock, X, Check } from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchModalInitialData } from "@/lib/helpers/admin/upsertFaculty";
import { fetchWellbeingCategories } from "@/lib/helpers/wellbeingCategories/wellbeingCategoryAPI";
import {
  saveGroundStaff,
  saveWellbeingExecutive,
} from "@/lib/helpers/wellbeing/wellbeingExecutiveAPI";
import { supabase } from "@/lib/supabaseClient";

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

const toDisplayRegistrationType = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "hostel") return "Hostel";
  if (normalized === "both") return "Both";
  return "College";
};

const expandRegistrationTypes = (values: string[]) => {
  const normalizedValues = values.map(toDisplayRegistrationType);
  if (normalizedValues.includes("Both")) {
    return ["Hostel", "College"];
  }
  return Array.from(new Set(normalizedValues));
};

const toPayloadRegistrationType = (values: string[]) => {
  if (values.includes("Both")) return "Both";
  if (values.includes("College") && values.includes("Hostel")) return "Both";
  return values[0] ?? "";
};

const toUniqueValues = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean))) as string[];

const splitContextValues = (value: string | null) =>
  value
    ? toUniqueValues(value.split(",").map((item) => item.trim()))
    : [];

const validateIdentifier = (value: string) => {
  if (!value?.trim()) {
    return "is required.";
  }
  if (value.length < 6 || value.length > 15 || !IDENTIFIER_REGEX.test(value)) {
    return "Must be 6–15 characters and include at least one number. Only letters, numbers and up to two hyphen (-) allowed.";
  }
  return null;
};

const STAFF_ROLE_OPTIONS = ["Wellbeing Executive", "Ground Staff"];

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

interface CustomMultiSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  selectedValues: string[];
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  required = false,
  disabled = false,
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
        <span
          className={`truncate ${
            selectedValues.length ? "text-gray-700 font-medium" : "text-gray-400"
          }`}
        >
          {selectedValues.length ? selectedValues.join(", ") : placeholder}
        </span>
        <CaretLeft
          size={14}
          weight="bold"
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-90" : "-rotate-90"
          }`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[9999] top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-100 rounded-md shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">No options available</div>
          ) : (
            options.map((opt, idx) => {
              const isSelected = selectedValues.includes(opt);
              return (
                <div
                  key={`${label}-${opt}-${idx}`}
                  onClick={() => onChange(opt)}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <span>{opt}</span>
                  {isSelected && (
                    <Check size={14} weight="bold" className="text-[#48C78E]" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default function CreateExecutiveModal({
  isOpen,
  onClose,
  onSaveSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
}) {
  const {
    collegeId,
    collegePublicId,
    userId,
    collegeEducationType,
    wellBeingIds,
    wellBeingRegistrationTypes,
  } = useUser();
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
  const [selectedStaffRole, setSelectedStaffRole] = useState("Wellbeing Executive");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedRegistrationTypes, setSelectedRegistrationTypes] = useState<string[]>([]);
  const [managerEducationOptions, setManagerEducationOptions] = useState<string[]>([]);
  const [hostelBlock, setHostelBlock] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [hostelType, setHostelType] = useState("");

  const isWellbeingHostel = selectedRegistrationTypes.some(
    (type) => type === "Hostel" || type === "Both",
  );
  const isWellbeingCollege = selectedRegistrationTypes.some(
    (type) => type === "College" || type === "Both",
  );

  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [categoriesObjList, setCategoriesObjList] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const managerRegistrationTypeOptions = useMemo(
    () => expandRegistrationTypes(wellBeingRegistrationTypes),
    [wellBeingRegistrationTypes],
  );

  useEffect(() => {
    if (isOpen && collegeId) {
      const init = async () => {
        try {
          const data = await fetchModalInitialData(collegeId);
          setDbData(data);
        } catch {
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

  useEffect(() => {
    if (!isOpen) return;

    setSelectedRegistrationTypes(managerRegistrationTypeOptions);
  }, [isOpen, managerRegistrationTypeOptions]);

  useEffect(() => {
    if (!isOpen) return;

    const loadManagerEducationTypes = async () => {
      const fallbackEducationTypes = splitContextValues(collegeEducationType);

      if (!wellBeingIds.length) {
        setManagerEducationOptions(fallbackEducationTypes);
        setSelectedEducation((prev) =>
          fallbackEducationTypes.includes(prev)
            ? prev
            : fallbackEducationTypes.length === 1
              ? fallbackEducationTypes[0]
              : "",
        );
        return;
      }

      try {
        const { data, error } = await supabase
          .from("wellbeing_college_details")
          .select(`
            collegeEducationId,
            college_education:collegeEducationId ( collegeEducationType )
          `)
          .in("wellBeingId", wellBeingIds);

        if (error) throw error;

        const fetchedEducationTypes = toUniqueValues(
          (data ?? []).map((detail: any) => {
            const relation = detail.college_education;
            return Array.isArray(relation)
              ? relation[0]?.collegeEducationType
              : relation?.collegeEducationType;
          }),
        );
        const nextOptions = fetchedEducationTypes.length
          ? fetchedEducationTypes
          : fallbackEducationTypes;

        setManagerEducationOptions(nextOptions);
        setSelectedEducation((prev) =>
          nextOptions.includes(prev)
            ? prev
            : nextOptions.length === 1
              ? nextOptions[0]
              : "",
        );
      } catch (error) {
        console.error("Failed to fetch wellbeing manager education types:", error);
        setManagerEducationOptions(fallbackEducationTypes);
        setSelectedEducation((prev) =>
          fallbackEducationTypes.includes(prev)
            ? prev
            : fallbackEducationTypes.length === 1
              ? fallbackEducationTypes[0]
              : "",
        );
      }
    };

    loadManagerEducationTypes();
  }, [collegeEducationType, isOpen, wellBeingIds]);

  const selectedCategoryId = useMemo(() => {
    return categoriesObjList.find((cat) => cat.categoryName === selectedCategories[0])?.categoryId || null;
  }, [categoriesObjList, selectedCategories]);

  const selectedCategoryIds = useMemo(() => {
    const selectedNames = new Set(selectedCategories);
    return categoriesObjList
      .filter((cat) => selectedNames.has(cat.categoryName))
      .map((cat) => cat.categoryId);
  }, [categoriesObjList, selectedCategories]);

  const selectedCategoryObj = useMemo(() => {
    return categoriesObjList.find((cat) => cat.categoryName === selectedCategories[0]) ?? null;
  }, [categoriesObjList, selectedCategories]);

  const subCategoryOptions = useMemo(() => {
    const selectedNames = new Set(selectedCategories);
    return categoriesObjList
      .filter((cat) => selectedNames.has(cat.categoryName))
      .flatMap((cat) => cat.wellbeing_sub_categories ?? [])
      .map((sub: any) => sub.subCategoryName);
  }, [categoriesObjList, selectedCategories]);

  const selectedSubCategoryIds = useMemo(() => {
    return (selectedCategoryObj?.wellbeing_sub_categories ?? [])
      .filter((sub: any) => sub.subCategoryName === selectedSubCategory)
      .map((sub: any) => sub.subCategoryId);
  }, [selectedCategoryObj, selectedSubCategory]);

  const isGroundLevelStaff = selectedStaffRole === "Ground Staff";
  const shouldShowHostelAddressFields = isWellbeingHostel && !isGroundLevelStaff;
  const shouldShowEducationType = isWellbeingCollege && !isGroundLevelStaff;

  const resetForm = () => {
    setBasicData(initialBasicData);
    setSelectedEducation(managerEducationOptions.length === 1 ? managerEducationOptions[0] : "");
    setSelectedStaffRole("Wellbeing Executive");
    setSelectedCategories([]);
    setSelectedSubCategory("");
    setSelectedRegistrationTypes(managerRegistrationTypeOptions);
    setHostelBlock("");
    setBuildingNumber("");
    setHostelType("");
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

  const selectedEducationId = useMemo(() => {
    return dbData.educations.find((e: any) => e.collegeEducationType === selectedEducation)?.collegeEducationId || null;
  }, [dbData.educations, selectedEducation]);

  const groundStaffEducationId = useMemo(() => {
    const availableEducationTypes = managerEducationOptions.length
      ? managerEducationOptions
      : splitContextValues(collegeEducationType);
    const selectedType = selectedEducation || availableEducationTypes[0];

    return (
      dbData.educations.find((education: any) =>
        selectedType
          ? education.collegeEducationType === selectedType
          : availableEducationTypes.includes(education.collegeEducationType),
      )?.collegeEducationId ?? null
    );
  }, [collegeEducationType, dbData.educations, managerEducationOptions, selectedEducation]);

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

    if (!selectedStaffRole) return toast.error("Role is required.");
    if (!selectedCategories.length) return toast.error("Category is required.");
    if (isGroundLevelStaff && !selectedSubCategory) {
      return toast.error("Sub Category is required for Ground Staff.");
    }
    if (isGroundLevelStaff && !groundStaffEducationId) {
      return toast.error("Education Type is required for Ground Staff setup.");
    }
    if (!selectedRegistrationTypes.length) return toast.error("Registration Type is required.");

    if (shouldShowEducationType) {
      if (!selectedEducation) return toast.error("Education Type is required.");
    }

    if (shouldShowHostelAddressFields) {
      if (!hostelBlock.trim()) return toast.error("Block is required.");
      if (!buildingNumber.trim()) return toast.error("Building Number is required.");
    }

    if (isWellbeingHostel) {
      if (!hostelType) return toast.error("Hostel Type is required.");
    }

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
        categoryIds: selectedCategoryIds,
        subCategoryIds: isGroundLevelStaff ? selectedSubCategoryIds : [],
        staffRole: selectedStaffRole as "Wellbeing Executive" | "Ground Staff",
        byManager: userId!,
        registrationType: toPayloadRegistrationType(selectedRegistrationTypes),
        collegeEducationId: shouldShowEducationType ? selectedEducationId! : null,
        collegeBranchId: null,
        collegeBranchIds: [],
        collegeAcademicYearId: null,
        collegeSectionsId: null,
        collegeDetails: [],
        hostelBlock: shouldShowHostelAddressFields ? hostelBlock : undefined,
        buildingNumber: shouldShowHostelAddressFields ? buildingNumber : undefined,
        hostelType: isWellbeingHostel ? hostelType : undefined,
      };

      const res = isGroundLevelStaff
        ? await saveGroundStaff({
            fullName: payload.fullName,
            email: payload.email,
            mobileCode: payload.mobileCode,
            mobileNumber: payload.mobileNumber,
            gender: payload.gender,
            dateOfJoining: payload.dateOfJoining,
            professionalExperienceYears: payload.professionalExperienceYears,
            employeeId: payload.employeeId,
            password: payload.password,
            collegeId: payload.collegeId,
            collegePublicId: payload.collegePublicId,
            categoryId: payload.categoryId,
            subCategoryId: selectedSubCategoryIds[0]!,
            registrationType: payload.registrationType,
            hostelType: payload.hostelType ?? null,
            collegeEducationId: groundStaffEducationId!,
            createdBy: userId!,
          })
        : await saveWellbeingExecutive(payload);

      if (!res.success) {
        throw new Error(res.error);
      }

      toast.success(`${selectedStaffRole} Created Successfully`);
      setIsSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
        onSaveSuccess?.();
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
            <h2 className="text-lg font-bold text-[#16284F]">
              Add {selectedStaffRole}
            </h2>
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
              <CustomSingleSelect
                label="Role"
                placeholder="Select Role"
                options={STAFF_ROLE_OPTIONS}
                selectedValue={selectedStaffRole}
                onChange={(val) => {
                  setSelectedStaffRole(val);
                  setSelectedCategories([]);
                  setSelectedSubCategory("");
                }}
                required
              />

              {isGroundLevelStaff ? (
                <CustomSingleSelect
                  label="Category"
                  placeholder={loadingCategories ? "Loading categories..." : "Select Category"}
                  options={categoriesList}
                  selectedValue={selectedCategories[0] ?? ""}
                  onChange={(val) => {
                    setSelectedCategories([val]);
                    setSelectedSubCategory("");
                  }}
                  required
                />
              ) : (
                <CustomMultiSelect
                  label="Category"
                  placeholder={loadingCategories ? "Loading categories..." : "Select Category"}
                  options={categoriesList}
                  selectedValues={selectedCategories}
                  onChange={(val) => {
                    setSelectedCategories((prev) =>
                      prev.includes(val)
                        ? prev.filter((item) => item !== val)
                        : [...prev, val],
                    );
                    setSelectedSubCategory("");
                  }}
                  required
                />
              )}
            </div>

            {isGroundLevelStaff && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <CustomSingleSelect
                  label="Sub Category"
                  placeholder={
                    selectedCategories.length
                      ? "Select Sub Categories"
                      : "Select Category First"
                  }
                  options={subCategoryOptions}
                  selectedValue={selectedSubCategory}
                  onChange={setSelectedSubCategory}
                  disabled={!selectedCategories.length}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <CustomMultiSelect
                label="Registration Type"
                placeholder="Select Registration Type"
                options={managerRegistrationTypeOptions}
                selectedValues={selectedRegistrationTypes}
                onChange={(val) => {
                  setSelectedRegistrationTypes((prev) => {
                    const next = prev.includes(val)
                      ? prev.filter((type) => type !== val)
                      : [...prev, val];
                    const hasCollege = next.some((type) => type === "College" || type === "Both");
                    const hasHostel = next.some((type) => type === "Hostel" || type === "Both");

                    if (!hasCollege) {
                      setSelectedEducation("");
                    }
                    if (!hasHostel) {
                      setHostelBlock("");
                      setBuildingNumber("");
                      setHostelType("");
                    }

                    return next;
                  });
                }}
                required
              />

              {isWellbeingHostel ? (
                <CustomSingleSelect
                  label="Hostel Type"
                  placeholder="Select Hostel Type"
                  options={["boyshostel", "girlshostel", "both"]}
                  selectedValue={hostelType}
                  onChange={setHostelType}
                  required
                />
              ) : shouldShowEducationType ? (
                <CustomSingleSelect
                  label="Education Type"
                  placeholder={
                    managerEducationOptions.length
                      ? "Select Education Type"
                      : "No Education Type Assigned"
                  }
                  options={managerEducationOptions}
                  selectedValue={selectedEducation}
                  onChange={setSelectedEducation}
                  disabled={!managerEducationOptions.length}
                  required
                />
              ) : null}
            </div>

            {shouldShowHostelAddressFields && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Block <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={hostelBlock}
                    onChange={(e) => setHostelBlock(e.target.value.toUpperCase())}
                    placeholder="Enter block"
                    className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Building Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={buildingNumber}
                    onChange={(e) => setBuildingNumber(e.target.value.toUpperCase())}
                    placeholder="Enter building number"
                    className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                  />
                </div>
              </div>
            )}

            {shouldShowEducationType && isWellbeingHostel && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-in fade-in duration-200">
                  <CustomSingleSelect
                    label="Education Type"
                    placeholder={
                      managerEducationOptions.length
                        ? "Select Education Type"
                        : "No Education Type Assigned"
                    }
                    options={managerEducationOptions}
                    selectedValue={selectedEducation}
                    onChange={setSelectedEducation}
                    disabled={!managerEducationOptions.length}
                    required
                  />
                </div>
              </>
            )}

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
