"use client";

import { useEffect, useState, useRef } from "react";
import { X, CaretDown, Check } from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchDegreeAndDepartments } from "@/lib/helpers/admin/academicSetupAPI";
import toast, { Toaster } from "react-hot-toast";
import { fetchAdminContext } from "@/app/utils/context/adminContextAPI";
import { saveAcademicSetupMaster } from "@/lib/helpers/admin/academicSetup/academicSetupMasterAPI";

export type AcademicData = {
  id?: string;
  degree: string;
  branch: string;
  dept: string;
  year: string;
  sections: string[];
};

export default function AddAcademicSetup({
  editData,
  onSuccess,
}: {
  editData: AcademicData | null;
  onSuccess?: () => void;
}) {
  const { userId, loading: userLoading } = useUser();

  const [form, setForm] = useState<AcademicData>({
    degree: "",
    branch: "",
    dept: "",
    year: "",
    sections: [],
  });

  const [academicOptions, setAcademicOptions] = useState<
    Record<string, string[]>
  >({});
  const [availableDegrees, setAvailableDegrees] = useState<string[]>([]);
  const [availableDepts, setAvailableDepts] = useState<string[]>([]);

  const defaultSectionOptions = ["A", "B", "C", "D"];

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingExisting, setIsFetchingExisting] = useState(false);

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
    if (editData) {
      setForm({
        ...editData,
        year: editData.year ?? "",
        sections: Array.isArray(editData.sections) ? editData.sections : [],
      });
    }
  }, [editData]);

  const getYearOptions = () => {

    let maxYears;
    switch (form.degree.toLowerCase()) {
      case "b.tech":
      case "b.pharm":
        maxYears = 4;
        break;

      case "degree":
      case "diploma":
      case "polytechnic":
        maxYears = 3;
        break;

      case "b.arch":
        maxYears = 5;
        break;

      case "mbbs":
        maxYears = 6;
        break;

      default:
        maxYears = 2;
    }

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
    if (userLoading || !userId) {
      toast.error("User session not ready");
      return;
    }

    if (
      !form.degree.trim() ||
      !form.branch.trim() ||
      !form.dept.trim() ||
      !form.year.trim()
    ) {
      toast.error(
        "Education, Branch, Branch Code and Academic Year are required"
      );
      return;
    }

    setIsLoading(true);

    try {
      const adminCtx = await fetchAdminContext(userId);

      await saveAcademicSetupMaster(
        {
          educationType: form.degree,
          branch: {
            type: form.branch,
            code: form.dept.replace(/\s+/g, "").toUpperCase(),
            academicYear: form.year,
            sections: form.sections,
          },
        },
        {
          adminId: adminCtx.adminId,
          collegeId: adminCtx.collegeId,
        }
      );

      toast.success("Education, Branch & Academic Year saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
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
          year: "",
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
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-[#16284F] font-medium mb-1">
            Eduation Type
          </label>
          {customMode.degree ? (
            renderCustomInput("degree", "Enter Education Name")
          ) : (
            <select
              value={form.degree}
              onChange={(e) => handleSingleSelectChange("degree", e.target.value)}
              className="w-full border border-[#CCCCCC] text-[#2D3748] outline-none rounded-lg px-4 py-2"
            >
              <option value="" disabled>
                Select Education
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
        <div>
          <label className="block text-sm text-[#16284F] font-medium mb-1">
            Branch Type
          </label>
          <input
            type="text"
            value={form.branch}
            onChange={(e) => {
              const value = e.target.value;

              const formatted = value
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase());

              setForm((prev) => ({
                ...prev,
                branch: formatted,
              }));
            }}
            placeholder="Enter Branch"
            className="w-full border border-[#CCCCCC] text-[#2D3748] outline-none rounded-lg px-4 py-2 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-[#16284F] font-medium mb-1">
            Branch Code
          </label>
          {customMode.dept ? (
            renderCustomInput("dept", "Enter Branch Code")
          ) : (
            <select
              value={form.dept}
              onChange={(e) => handleSingleSelectChange("dept", e.target.value)}
              className="w-full border border-[#CCCCCC] outline-none text-[#2D3748] rounded-lg px-4 py-2"
              disabled={!form.degree && !customMode.degree}
            >
              <option value="" disabled>
                Select Branch Code
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
            selectedValues={form.year ? [form.year] : []}
            // onChange={(val) => {
            //   if (!form.year.includes(val)) {
            //     setForm({ ...form, year: [...form.year, val].sort() });
            //   }
            // }}
            onChange={(val) => {
              setForm({ ...form, year: val });
            }}

            // onRemove={(val) => {
            //   setForm({
            //     ...form,
            //     year: form.year.filter((y) => y !== val),
            //   });
            // }}
            onRemove={(_val) => {
              setForm({ ...form, year: "" });
            }}

          />
        </div>
      </div>

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
          className={`w-full border ${isOpen
            ? "border-[#48C78E] ring-1 ring-[#48C78E]"
            : "border-[#CCCCCC]"
            } rounded-lg px-4 py-2 text-sm flex justify-between items-center cursor-pointer bg-white transition-all ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : ""
            }`}
        >
          <span
            className={`truncate mr-2 ${selectedValues.length ? "text-[#2D3748]" : "text-gray-400"
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
                  className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm ${opt === "+ other"
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
