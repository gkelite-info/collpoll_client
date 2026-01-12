"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, CaretDown, Check, Eye, EyeSlash } from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";

// --- Mock Data ---
const DEGREE_OPTIONS = ["B.Tech", "B.Sc", "M.Tech"];

const DEPT_MAPPING: Record<string, string[]> = {
  "B.Tech": ["ECE", "CIVIL", "CSE"],
  "B.Sc": ["Physics", "Maths", "Chemistry"],
  "M.Tech": ["Power Systems", "Structural Eng"],
};

const SUBJECT_MAPPING: Record<string, string[]> = {
  ECE: ["Digital Electronics", "Signals & Systems", "Microprocessors"],
  CIVIL: ["Fluid Mechanics", "Surveying", "Structural Analysis"],
  CSE: ["Data Structures", "Algorithms", "Operating Systems"],
  Physics: ["Quantum Mechanics", "Thermodynamics", "Optics"],
  Maths: ["Calculus", "Real Analysis", "Abstract Algebra"],
  Chemistry: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
  "Power Systems": ["Smart Grid", "Renewable Energy"],
  "Structural Eng": ["Advanced Concrete Design", "Earthquake Engineering"],
};

const SECTION_MAPPING: Record<string, string[]> = {
  ECE: ["ECE-A", "ECE-B"],
  CIVIL: ["CIVIL-A", "CIVIL-B"],
  CSE: ["CSE-A", "CSE-B", "CSE-C"],
  Physics: ["PHY-A", "PHY-B"],
  Maths: ["MAT-A", "MAT-B"],
  Chemistry: ["CHM-A"],
  "Power Systems": ["PS-A"],
  "Structural Eng": ["SE-A"],
};

const PillTag = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <span className="bg-[#D6F1E2] text-[#43C17A] text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
    {label}
    <X
      size={10}
      weight="bold"
      className="cursor-pointer hover:text-red-500"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    />
  </span>
);

interface MultiSelectProps {
  label: string;
  placeholder: string;
  options: string[] | Record<string, string[]>;
  selectedValues: string[];
  onChange: (val: string) => void;
  onRemove: (val: string) => void;
  disabled?: boolean;
  isGrouped?: boolean;
}

const CustomMultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  onRemove,
  disabled = false,
  isGrouped = false,
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
    <div className="space-y-1 w-full" ref={wrapperRef}>
      <label className="text-xs font-bold text-[#2D3748]">{label}</label>
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full border ${
            isOpen
              ? "border-[#48C78E] ring-1 ring-[#48C78E]"
              : "border-gray-200"
          } rounded-md px-3 py-1 text-sm flex justify-between items-center cursor-pointer bg-white transition-all ${
            disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : ""
          }`}
        >
          <span
            className={`truncate mr-2 ${
              selectedValues.length ? "text-gray-700" : "text-gray-400"
            }`}
          >
            {selectedValues.length > 0
              ? `${selectedValues.length} ${label}(s) selected`
              : placeholder}
          </span>
          <CaretDown size={14} className="text-gray-400 flex-shrink-0" />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-md shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
            {!isGrouped
              ? // --- Flat List ---
                (options as string[]).map((opt) => {
                  const isSelected = selectedValues.includes(opt);
                  return (
                    <div
                      key={opt}
                      onClick={() => onChange(opt)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                    >
                      <span>{opt}</span>
                      {isSelected && (
                        <Check
                          size={14}
                          weight="bold"
                          className="text-[#48C78E]"
                        />
                      )}
                    </div>
                  );
                })
              : // --- Grouped List ---
                Object.entries(options as Record<string, string[]>).map(
                  ([category, items]) => (
                    <div key={category}>
                      <div className="sticky top-0 z-10 px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        {category}
                      </div>
                      {items.map((opt) => {
                        const isSelected = selectedValues.includes(opt);
                        return (
                          <div
                            key={opt}
                            onClick={() => onChange(opt)}
                            className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 pl-5 border-l-2 border-transparent hover:border-l-gray-200"
                          >
                            <span>{opt}</span>
                            {isSelected && (
                              <Check
                                size={14}
                                weight="bold"
                                className="text-[#48C78E]"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
            {(!options || (Array.isArray(options) && options.length === 0)) && (
              <div className="p-3 text-xs text-gray-400 text-center">
                No options available
              </div>
            )}
          </div>
        )}
      </div>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((val) => (
            <PillTag key={val} label={val} onRemove={() => onRemove(val)} />
          ))}
        </div>
      )}
    </div>
  );
};

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const [basicData, setBasicData] = useState({
    fullName: "",
    email: "",
    collegeId: "",
    mobileCode: "+91",
    mobileNumber: "",
    role: "",
    gender: "Male",
    password: "",
    confirmPassword: "",
  });

  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // 1. Group Departments by Degree
  const availableDeptsGrouped: Record<string, string[]> = {};
  selectedDegrees.forEach((deg) => {
    if (DEPT_MAPPING[deg]) {
      availableDeptsGrouped[deg] = DEPT_MAPPING[deg];
    }
  });

  // 2. Group Subjects by Department
  const availableSubjectsGrouped: Record<string, string[]> = {};
  selectedDepts.forEach((dept) => {
    if (SUBJECT_MAPPING[dept]) {
      availableSubjectsGrouped[dept] = SUBJECT_MAPPING[dept];
    }
  });

  // 3. Group Sections by Department
  const availableSectionsGrouped: Record<string, string[]> = {};
  selectedDepts.forEach((dept) => {
    if (SECTION_MAPPING[dept]) {
      availableSectionsGrouped[dept] = SECTION_MAPPING[dept];
    }
  });

  useEffect(() => {
    const validDepts = new Set(
      selectedDegrees.flatMap((deg) => DEPT_MAPPING[deg] || [])
    );
    setSelectedDepts((prev) => prev.filter((d) => validDepts.has(d)));
  }, [selectedDegrees]);

  useEffect(() => {
    const validSubjects = new Set(
      selectedDepts.flatMap((d) => SUBJECT_MAPPING[d] || [])
    );
    setSelectedSubjects((prev) => prev.filter((s) => validSubjects.has(s)));

    const validSections = new Set(
      selectedDepts.flatMap((d) => SECTION_MAPPING[d] || [])
    );
    setSelectedSections((prev) => prev.filter((s) => validSections.has(s)));
  }, [selectedDepts]);

  if (!isOpen) return null;

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBasicData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSelection = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (currentList.includes(item)) {
      setList(currentList.filter((i) => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const validateForm = () => {
    if (!basicData.fullName.trim()) return "Full Name is required";
    if (!basicData.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicData.email))
      return "Invalid email format";
    if (!basicData.collegeId.trim()) return "College ID is required";
    if (!basicData.mobileNumber.trim()) return "Mobile number is required";
    if (!basicData.role) return "Please select a Role";

    if (basicData.role === "Faculty") {
      if (selectedDegrees.length === 0)
        return "Please select at least one Degree";
      if (selectedDepts.length === 0)
        return "Please select at least one Department";
    }

    if (!basicData.password) return "Password is required";
    if (basicData.password !== basicData.confirmPassword)
      return "Passwords do not match";

    return null;
  };

  const handleSave = () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      ...basicData,
      degrees: selectedDegrees,
      departments: selectedDepts,
      subjects: selectedSubjects,
      sections: selectedSections,
    };

    console.log("Submitting:", payload);
    toast.success("User added successfully!");

    setTimeout(() => onClose(), 1000);
  };

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
                className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@gmail.com"
                value={basicData.email}
                onChange={handleBasicChange}
                className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  College ID
                </label>
                <input
                  type="text"
                  name="collegeId"
                  placeholder="ID9876345678"
                  value={basicData.collegeId}
                  onChange={handleBasicChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Mobile
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="mobileCode"
                    placeholder="+91"
                    value={basicData.mobileCode}
                    onChange={handleBasicChange}
                    className="w-[60px] border border-gray-200 rounded-md px-2 py-1 text-sm text-center outline-none focus:ring-1 focus:ring-[#48C78E]"
                  />
                  <input
                    type="number"
                    name="mobileNumber"
                    placeholder="9078972084"
                    value={basicData.mobileNumber}
                    onChange={handleBasicChange}
                    className="flex-1 border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] placeholder:text-gray-300"
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
                    onChange={(e) => {
                      handleBasicChange(e);
                      if (e.target.value !== "Faculty") {
                        setSelectedDegrees([]);
                        setSelectedDepts([]);
                        setSelectedSubjects([]);
                        setSelectedSections([]);
                      }
                    }}
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

              {basicData.role === "Faculty" && (
                <CustomMultiSelect
                  label="Degree"
                  placeholder="Select Degree"
                  options={DEGREE_OPTIONS}
                  selectedValues={selectedDegrees}
                  onChange={(val) =>
                    toggleSelection(selectedDegrees, setSelectedDegrees, val)
                  }
                  onRemove={(val) =>
                    toggleSelection(selectedDegrees, setSelectedDegrees, val)
                  }
                />
              )}
            </div>

            {basicData.role === "Faculty" && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <CustomMultiSelect
                    label="Department"
                    placeholder="0 Department(s) selected"
                    options={availableDeptsGrouped}
                    selectedValues={selectedDepts}
                    disabled={selectedDegrees.length === 0}
                    isGrouped={true}
                    onChange={(val) =>
                      toggleSelection(selectedDepts, setSelectedDepts, val)
                    }
                    onRemove={(val) =>
                      toggleSelection(selectedDepts, setSelectedDepts, val)
                    }
                  />

                  <CustomMultiSelect
                    label="Subject"
                    placeholder="0 Subjects(s) selected"
                    options={availableSubjectsGrouped}
                    selectedValues={selectedSubjects}
                    disabled={selectedDepts.length === 0}
                    isGrouped={true}
                    onChange={(val) =>
                      toggleSelection(
                        selectedSubjects,
                        setSelectedSubjects,
                        val
                      )
                    }
                    onRemove={(val) =>
                      toggleSelection(
                        selectedSubjects,
                        setSelectedSubjects,
                        val
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <CustomMultiSelect
                    label="Section"
                    placeholder="0 Section(s) Selected"
                    options={availableSectionsGrouped}
                    selectedValues={selectedSections}
                    disabled={selectedDepts.length === 0}
                    isGrouped={true}
                    onChange={(val) =>
                      toggleSelection(
                        selectedSections,
                        setSelectedSections,
                        val
                      )
                    }
                    onRemove={(val) =>
                      toggleSelection(
                        selectedSections,
                        setSelectedSections,
                        val
                      )
                    }
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2D3748]">
                      Gender
                    </label>
                    <div className="flex gap-6 mt-3">
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
                            onChange={handleBasicChange}
                            className="hidden"
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-[#2D3748]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter Password"
                    value={basicData.password}
                    onChange={handleBasicChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] placeholder:text-gray-300 pr-8"
                  />
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeSlash size={16} />}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={basicData.confirmPassword}
                    onChange={handleBasicChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] placeholder:text-gray-300 pr-8"
                  />
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeSlash size={16} />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 border-t border-gray-50 flex gap-4 flex-shrink-0 bg-white">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#43C17A] cursor-pointer text-white text-sm font-medium py-1 rounded-md hover:bg-[#3ea876] transition-all shadow-sm"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 cursor-pointer text-[#282828] text-sm font-medium py-1 rounded-md hover:bg-gray-50 transition-all"
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
