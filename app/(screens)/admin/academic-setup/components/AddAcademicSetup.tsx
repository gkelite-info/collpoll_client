"use client";

import { useEffect, useState, useRef } from "react";
import { X, CaretDown, Check } from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchDegreeAndDepartments,
  saveAcademicSetup,
  fetchExistingSetup,
} from "@/lib/helpers/admin/academicSetupAPI";
import { generateUUID } from "@/lib/helpers/generateUUID";
import toast, { Toaster } from "react-hot-toast";

export type AcademicData = {
  id?: string;
  degree: string;
  dept: string;
  year: string[];
  sections: string[];
};

export default function AddAcademicSetup({
  editData,
  onSuccess,
}: {
  editData: AcademicData | null;
  onSuccess?: () => void;
}) {
  const { userId: adminId, loading: userLoading } = useUser();

  const [form, setForm] = useState<AcademicData>({
    degree: "",
    dept: "",
    year: [],
    sections: [],
  });

  const [academicOptions, setAcademicOptions] = useState<
    Record<string, string[]>
  >({});
  const [availableDegrees, setAvailableDegrees] = useState<string[]>([]);
  const [availableDepts, setAvailableDepts] = useState<string[]>([]);

  const defaultSectionOptions = ["A", "B", "C", "D"];
  const [currentSectionOptions, setCurrentSectionOptions] = useState<string[]>(
    defaultSectionOptions
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingExisting, setIsFetchingExisting] = useState(false); // New loading state

  const [customMode, setCustomMode] = useState({
    degree: false,
    dept: false,
    sections: false,
  });
  const [tempCustomInput, setTempCustomInput] = useState("");

  useEffect(() => {
    const loadOptions = async () => {
      const { success, data } = await fetchDegreeAndDepartments();
      if (success && data) {
        setAcademicOptions(data);
        setAvailableDegrees(Object.keys(data));
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (form.degree && academicOptions[form.degree]) {
      setAvailableDepts(academicOptions[form.degree]);
    } else {
      setAvailableDepts([]);
    }
  }, [form.degree, academicOptions]);

  useEffect(() => {
    const checkExisting = async () => {
      if (
        form.degree &&
        form.dept &&
        !customMode.degree &&
        !customMode.dept &&
        !editData
      ) {
        setIsFetchingExisting(true);
        const { success, data } = await fetchExistingSetup(
          form.degree,
          form.dept
        );

        if (success && data) {
          setForm((prev) => ({
            ...prev,
            id: data.id,
            sections: data.sections,
            year: data.year,
          }));

          toast.success("Loaded existing configuration.", {
            id: "loaded-existing",
          });
        } else {
          setForm((prev) => ({
            ...prev,
            id: undefined,
            sections: [],
            year: [],
          }));
        }
        setIsFetchingExisting(false);
      }
    };

    checkExisting();
  }, [form.degree, form.dept]);

  useEffect(() => {
    if (editData) {
      setForm({
        ...editData,
        year: Array.isArray(editData.year) ? editData.year : [],
        sections: Array.isArray(editData.sections) ? editData.sections : [],
      });
    }
  }, [editData]);

  const getYearOptions = () => {
    const maxYears = form.degree === "B.Tech" ? 4 : 3;
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    return Array.from(
      { length: maxYears },
      (_, i) => `${getOrdinal(i + 1)} Year`
    );
  };

  const handleSave = async () => {
    if (userLoading) return;
    if (!adminId) {
      toast.error("User session not found. Please reload or log in.");
      return;
    }

    if (!form.degree.trim()) return toast.error("Please select a Degree Type.");
    if (!form.dept.trim()) return toast.error("Please select a Department.");
    if (form.year.length === 0)
      return toast.error("Please select at least one Year.");
    if (form.sections.length === 0)
      return toast.error("Please select at least one Section.");

    if (customMode.degree || customMode.dept || customMode.sections) {
      return toast.error(
        "You have unsaved custom input. Please click the checkmark or cancel."
      );
    }

    setIsLoading(true);

    const payload = {
      ...form,
      year: form.year.map((y) => ({
        name: y,
        uuid: generateUUID(),
      })),
      sections: form.sections.map((s) => ({
        name: s,
        uuid: generateUUID(),
      })),
    };

    // @ts-ignore
    const result = await saveAcademicSetup(payload, adminId, !!form.id);

    setIsLoading(false);

    if (result.success) {
      toast.success("Academic setup saved successfully!");
      if (!editData) {
        setForm({
          id: undefined,
          degree: "",
          dept: "",
          year: [],
          sections: [],
        });
      }
      if (onSuccess) {
        onSuccess();
      } else {
        if (!editData)
          setForm({
            id: undefined,
            degree: "",
            dept: "",
            year: [],
            sections: [],
          });
      }
    } else {
      toast.error(
        (result.error as { message?: string })?.message ||
          "Failed to save data. Please try again."
      );
    }
  };

  const handleSingleSelectChange = (
    field: "degree" | "dept",
    value: string
  ) => {
    if (value === "+ other") {
      setCustomMode((prev) => ({ ...prev, [field]: true }));
      setTempCustomInput("");
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (field === "degree") {
        setForm((prev) => ({
          ...prev,
          degree: value,
          dept: "",
          year: [],
          sections: [],
          id: undefined,
        }));
      }
    }
  };

  const handleSectionSelect = (val: string) => {
    if (val === "+ other") {
      setCustomMode((prev) => ({ ...prev, sections: true }));
      setTempCustomInput("");
    } else {
      if (!form.sections.includes(val)) {
        setForm({ ...form, sections: [...form.sections, val].sort() });
      }
    }
  };

  const saveCustomInput = (field: "degree" | "dept" | "sections") => {
    if (!tempCustomInput.trim()) return;

    if (field === "sections") {
      if (!form.sections.includes(tempCustomInput)) {
        setForm((prev) => ({
          ...prev,
          sections: [...prev.sections, tempCustomInput],
        }));
      }
      setCustomMode((prev) => ({ ...prev, sections: false }));
    } else {
      setForm((prev) => ({ ...prev, [field]: tempCustomInput }));
      setCustomMode((prev) => ({ ...prev, [field]: false }));
    }
    setTempCustomInput("");
  };

  const cancelCustomInput = (field: "degree" | "dept" | "sections") => {
    setCustomMode((prev) => ({ ...prev, [field]: false }));
    setTempCustomInput("");
  };

  const renderCustomInput = (
    field: "degree" | "dept" | "sections",
    placeholder: string
  ) => (
    <div className="flex items-center gap-2 w-full">
      <input
        type="text"
        value={tempCustomInput}
        onChange={(e) => {
          const val = e.target.value;

          setTempCustomInput(field === "dept" ? val.toUpperCase() : val);
        }}
        placeholder={placeholder}
        className="w-full border border-[#CCCCCC] text-[#2D3748] outline-none rounded-lg px-4 py-2"
        autoFocus
      />
      <button
        onClick={() => saveCustomInput(field)}
        className="p-2 bg-[#D6F1E2] text-[#43C17A] rounded-lg hover:bg-[#c2e5d3]"
      >
        <Check weight="bold" />
      </button>
      <button
        onClick={() => cancelCustomInput(field)}
        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
      >
        <X weight="bold" />
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      <Toaster position="top-right" />
      <div>
        <label className="block text-sm text-[#16284F] font-medium mb-1">
          Degree Type
        </label>
        {customMode.degree ? (
          renderCustomInput("degree", "Enter Degree Name")
        ) : (
          <select
            value={form.degree}
            onChange={(e) => handleSingleSelectChange("degree", e.target.value)}
            className="w-full border border-[#CCCCCC] text-[#2D3748] outline-none rounded-lg px-4 py-2"
          >
            <option value="" disabled>
              Select Degree
            </option>
            {availableDegrees.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            {!availableDegrees.includes(form.degree) && form.degree && (
              <option value={form.degree}>{form.degree}</option>
            )}
            <option className="text-[#43C17A] font-semibold" value="+ other">
              + Other
            </option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-[#16284F] font-medium mb-1">
            Department
          </label>
          {customMode.dept ? (
            renderCustomInput("dept", "Enter Department")
          ) : (
            <select
              value={form.dept}
              onChange={(e) => handleSingleSelectChange("dept", e.target.value)}
              className="w-full border border-[#CCCCCC] outline-none text-[#2D3748] rounded-lg px-4 py-2"
              disabled={!form.degree && !customMode.degree}
            >
              <option value="" disabled>
                Select Department
              </option>
              {availableDepts.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              {!availableDepts.includes(form.dept) && form.dept && (
                <option value={form.dept}>{form.dept}</option>
              )}
              <option className="text-[#43C17A] font-semibold" value="+ other">
                + Other
              </option>
            </select>
          )}
        </div>

        <div>
          <CustomMultiSelect
            label="Year"
            placeholder="Select Years"
            options={getYearOptions()}
            selectedValues={form.year}
            onChange={(val) => {
              if (!form.year.includes(val)) {
                setForm({ ...form, year: [...form.year, val].sort() });
              }
            }}
            onRemove={(val) => {
              setForm({
                ...form,
                year: form.year.filter((y) => y !== val),
              });
            }}
          />
        </div>
      </div>

      {/* Sections & Save Button */}
      <div className="grid grid-cols-2 gap-6 items-end">
        <div>
          {customMode.sections ? (
            <div className="space-y-1">
              <label className="text-sm text-[#16284F] font-medium mb-1">
                Sections
              </label>
              {renderCustomInput("sections", "Enter Custom Section")}
            </div>
          ) : (
            <div
              className={
                isFetchingExisting ? "opacity-50 pointer-events-none" : ""
              }
            >
              <CustomMultiSelect
                label="Sections"
                placeholder={
                  isFetchingExisting ? "Loading..." : "Select Sections"
                }
                options={Array.from(
                  new Set([
                    ...defaultSectionOptions,
                    ...form.sections,
                    "+ other",
                  ])
                )}
                selectedValues={form.sections}
                onChange={handleSectionSelect}
                direction="up"
                onRemove={(val) => {
                  setForm({
                    ...form,
                    sections: form.sections.filter((s) => s !== val),
                  });
                }}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading || userLoading || isFetchingExisting}
          className="bg-[#43C17A] self-end cursor-pointer text-white py-2 rounded-lg font-semibold hover:bg-[#3ab06e] transition-colors disabled:opacity-70"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

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
  direction?: "up" | "down";
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
  direction = "down",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1 w-full" ref={wrapperRef}>
      <label className="text-sm text-[#16284F] font-medium mb-1">{label}</label>
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full border ${
            isOpen
              ? "border-[#48C78E] ring-1 ring-[#48C78E]"
              : "border-[#CCCCCC]"
          } rounded-lg px-4 py-2 text-sm flex justify-between items-center cursor-pointer bg-white transition-all ${
            disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : ""
          }`}
        >
          <span
            className={`truncate mr-2 ${
              selectedValues.length ? "text-[#2D3748]" : "text-gray-400"
            }`}
          >
            {selectedValues.length > 0
              ? `${selectedValues.length} selected`
              : placeholder}
          </span>
          <CaretDown size={14} className="text-gray-400 shrink-0" />
        </div>

        {isOpen && !disabled && (
          <div
            className={`absolute z-50 left-0 right-0 bg-white border border-gray-100 rounded-md shadow-xl max-h-48 overflow-y-auto custom-scrollbar 
            ${direction === "up" ? "bottom-full mb-1" : "top-full mt-1"} 
            `}
          >
            {!isGrouped
              ? (options as string[]).map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      if (opt === "+ other") setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm ${
                      opt === "+ other"
                        ? "text-[#43C17A] font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedValues.includes(opt) && (
                      <Check
                        size={14}
                        weight="bold"
                        className="text-[#48C78E]"
                      />
                    )}
                  </div>
                ))
              : Object.entries(options as Record<string, string[]>).map(
                  ([category, items]) => (
                    <div key={category}>
                      <div className="sticky top-0 z-10 px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        {category}
                      </div>
                      {items.map((opt) => (
                        <div
                          key={opt}
                          onClick={() => onChange(opt)}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 pl-5"
                        >
                          <span>{opt}</span>
                          {selectedValues.includes(opt) && (
                            <Check
                              size={14}
                              weight="bold"
                              className="text-[#48C78E]"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )
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
