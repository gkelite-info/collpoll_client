"use client";

import { useEffect, useState, useRef } from "react";
import { X, CaretDown, Check } from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchDegreeAndDepartments, fetchAvailableBatchesByCollege, fetchAdminAssignedEducationsList } from "@/lib/helpers/admin/academicSetupAPI";
import toast, { Toaster } from "react-hot-toast";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { saveAcademicSetupMaster } from "@/lib/helpers/admin/academicSetup/academicSetupMasterAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export type AcademicData = {
  id?: string;
  degree: string;
  branch: string;
  dept: string;
  year: string;
  sections: string[];
  batch?: string;
};

export default function AddAcademicSetup({
  editData,
  onSuccess,
}: {
  editData: AcademicData | null;
  onSuccess?: () => void;
}) {
  const { userId, loading: userLoading, adminId, collegeId } = useUser();

  const [form, setForm] = useState<AcademicData>({
    degree: "",
    branch: "",
    dept: "",
    year: "",
    sections: [],
    batch: "",
  });

  const [academicOptions, setAcademicOptions] = useState<
    Record<string, string[]>
  >({});
  const [availableDepts, setAvailableDepts] = useState<string[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [availableEducations, setAvailableEducations] = useState<{ collegeEducationId: number, collegeEducationType: string }[]>([]);

  const defaultSectionOptions = ["A", "B", "C", "D"];

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingExisting, setIsFetchingExisting] = useState(false);
  const [isFetchingOptions, setIsFetchingOptions] = useState(true);

  const [customMode, setCustomMode] = useState({
    dept: false,
    sections: false,
    batch: false,
  });
  const [tempCustomInput, setTempCustomInput] = useState("");
  const { collegeEducationType } = useAdmin();
  const [selectFocus, setSelectFocus] = useState({ degree: false, dept: false, batch: false });

  useEffect(() => {
    if (editData) {
      // setForm({
      //   ...editData,
      //   // year: editData.year ?? "",
      //   // sections: Array.isArray(editData.sections) ? editData.sections : [],
      //   year: Array.isArray(editData.year) ? (editData.year[0] || "") : (editData.year || ""),
      //   sections: Array.isArray(editData.sections) ? editData.sections : [],
      //   batch: editData.batch || "",
      // });

      // setForm((prev) => {
      //   const safeBatch = editData.batch ? String(editData.batch).trim() : "";
      //   const safeDegree = editData.degree ? String(editData.degree).trim() : "";

      //   return {
      //     ...prev,
      //     ...editData,
      //     degree: safeDegree,
      //     year: editData.year || "",
      //     sections: Array.isArray(editData.sections) ? editData.sections : [],
      //     batch: safeBatch,
      //   };
      // });

      setForm({
        id: editData.id || "",
        degree: editData.degree ? String(editData.degree).trim() : "",
        branch: editData.branch ? String(editData.branch).trim() : "",
        dept: editData.dept ? String(editData.dept).trim() : "",
        year: editData.year ? String(editData.year).trim() : "",
        sections: Array.isArray(editData.sections) ? [...editData.sections] : [],
        batch: editData.batch ? String(editData.batch).trim() : "",
      });
    }
  }, [editData]);

  useEffect(() => {
    const loadOptions = async () => {
      if (userLoading || !userId) return;
      setIsFetchingOptions(true);

      const { success: deptSuccess, data: deptData } =
        await fetchDegreeAndDepartments();
      if (deptSuccess && deptData) {
        setAcademicOptions(deptData);
      }

      // const { success: eduSuccess, data: eduType } =
      //   await fetchAdminAssignedEducation(userId);
      // if (eduSuccess && eduType) {
      //   setForm((prev) => ({
      //     ...prev,
      //     degree: eduType,
      //   }));
      // }

      try {
        const adminEdus = await fetchAdminAssignedEducationsList(userId);
        if (adminEdus.length > 0) {
          setAvailableEducations(adminEdus);

          if (!editData && adminEdus.length === 1) {
            setForm((prev) => ({
              ...prev,
              degree: prev.degree || adminEdus[0].collegeEducationType
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load educations", err);
      }

      try {
        const adminCtx = await fetchAdminContext(userId);
        if (adminCtx?.collegeId) {
          const existingBatches = await fetchAvailableBatchesByCollege(adminCtx.collegeId);
          if (existingBatches.length > 0) {
            setAvailableBatches(existingBatches);
          }
        }
      } catch (err) {
        console.error("Failed to load existing batches", err);
      } finally {
        setIsFetchingOptions(false);
      }
      setIsFetchingOptions(false);
    };
    loadOptions();
  }, [userId, userLoading, editData]);

  useEffect(() => {
    if (form.degree && academicOptions[form.degree]) {
      setAvailableDepts(academicOptions[form.degree]);
    } else {
      setAvailableDepts([]);
    }
  }, [form.degree, academicOptions]);

  const isSchool = isSchoolEducation(form.degree || collegeEducationType);

  const getYearOptions = () => {
    if (isSchool) {
      return [
        "Nursery",
        "LKG",
        "UKG",
        "1st Class",
        "2nd Class",
        "3rd Class",
        "4th Class",
        "5th Class",
        "6th Class",
        "7th Class",
        "8th Class",
        "9th Class",
        "10th Class"
      ];
    }

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
      (_, i) => `${getOrdinal(i + 1)} Year`,
    );
  };

  const handleSave = async () => {
    if (userLoading || !userId) {
      toast.error("User session not ready", { id: "academic-setup-session" });
      return;
    }

    if (isSchool) {
      if (!form.degree.trim() || !form.year.trim()) {
        toast.error("Education and Academic Year are required", { id: "academic-setup-req" });
        return;
      }
    } else {
      if (
        !form.degree.trim() ||
        !form.branch.trim() ||
        !form.dept.trim() ||
        !form.year.trim()
      ) {
        toast.error("Education, Branch, Branch Code and Academic Year are required", { id: "academic-setup-req" });
        return;
      }
    }

    setIsLoading(true);

    try {
      const adminCtx = await fetchAdminContext(userId);

      await saveAcademicSetupMaster({
        educationType: form.degree,
        branch: {
          type: form.branch,
          code: form.dept.replace(/\s+/g, "").toUpperCase(),
          academicYear: form.year,
          sections: form.sections,
          batch: form.batch,
        },
        editDataId: editData?.id,
      },
        {
          adminId: adminCtx.adminId,
          collegeId: adminCtx.collegeId,
        },
      );

      toast.success("Academic setup saved successfully!", { id: "academic-setup-save-success" });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong while saving", { id: "academic-setup-save-error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleSelectChange = (field: "dept" | "batch", value: string) => {
    if (value === "+ other") {
      setCustomMode((prev) => ({ ...prev, [field]: true }));
      setTempCustomInput("");
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
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

  const saveCustomInput = (field: "dept" | "sections" | "batch") => {
    if (!tempCustomInput.trim()) return;

    if (field === "sections") {
      if (!form.sections.includes(tempCustomInput)) {
        setForm((prev) => ({
          ...prev,
          sections: [...prev.sections, tempCustomInput],
        }));
      }
      setCustomMode((prev) => ({ ...prev, sections: false }));
    } else if (field === "batch") {
      if (!availableBatches.includes(tempCustomInput)) {
        setAvailableBatches((prev) => [...prev, tempCustomInput]);
      }
      setForm((prev) => ({ ...prev, batch: tempCustomInput }));
      setCustomMode((prev) => ({ ...prev, batch: false }));
    }
    else {
      setForm((prev) => ({ ...prev, [field]: tempCustomInput }));
      setCustomMode((prev) => ({ ...prev, [field]: false }));
    }

    setTempCustomInput("");
  };

  const cancelCustomInput = (field: "dept" | "sections" | "batch") => {
    setCustomMode((prev) => ({ ...prev, [field]: false }));
    setTempCustomInput("");
  };

  const renderCustomInput = (
    field: "dept" | "sections" | "batch",
    placeholder: string,
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
        className="p-2 cursor-pointer bg-[#D6F1E2] text-[#43C17A] rounded-lg hover:bg-[#c2e5d3]"
      >
        <Check weight="bold" />
      </button>
      <button
        onClick={() => cancelCustomInput(field)}
        className="p-2 cursor-pointer bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
      >
        <X weight="bold" />
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      <Toaster position="top-right" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-[#16284F] font-medium mb-1">
            Education Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={form.degree}
              onClick={() => setSelectFocus(p => ({ ...p, degree: !p.degree }))}
              onBlur={() => setSelectFocus(p => ({ ...p, degree: false }))}
              onChange={(e) => {
                setForm({ ...form, degree: e.target.value, dept: "" });
                setSelectFocus(p => ({ ...p, degree: false }));
              }}
              className="w-full appearance-none border border-[#CCCCCC] cursor-pointer outline-none text-[#2D3748] rounded-lg px-4 py-2 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
            >
              <option value="" disabled>{isFetchingOptions ? "Loading educations..." : "Select Education"}</option>
              {availableEducations.map((edu) => (
                <option key={edu.collegeEducationId} value={edu.collegeEducationType}>
                  {edu.collegeEducationType}
                </option>
              ))}
            </select>
            <CaretDown
              size={14}
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${selectFocus.degree ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {!isSchool && (
          <div>
            <label className="block text-sm text-[#16284F] font-medium mb-1">
              {form.degree === "Inter" ? "Group Type" : "Branch Type"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.branch}
              onChange={(e) => {
                const value = e.target.value;
                const formatted = value
                  .toLowerCase()
                  .replace(/\b\w/g, (char) => char.toUpperCase());
                setForm((prev) => ({ ...prev, branch: formatted }));
              }}
              placeholder={form.degree === "Inter" ? "Enter Group" : "Enter Branch"}
              className="w-full border border-[#CCCCCC] text-[#2D3748] outline-none rounded-lg px-4 py-2 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
            />
          </div>
        )}

        {!isSchool && (
          <div>
            <label className="block text-sm text-[#16284F] font-medium mb-1">
              {form.degree === "Inter" ? "Group Type" : "Branch Code"} <span className="text-red-500">*</span>
            </label>
            {customMode.dept ? (
              renderCustomInput("dept", form.degree === "Inter" ? "Enter Group Code" : "Enter Branch Code")
            ) : (
              <div className="relative">
                <select
                  value={form.dept}
                  onClick={() => setSelectFocus(p => ({ ...p, dept: !p.dept }))}
                  onBlur={() => setSelectFocus(p => ({ ...p, dept: false }))}
                  onChange={(e) => {
                    handleSingleSelectChange("dept", e.target.value);
                    setSelectFocus(p => ({ ...p, dept: false }));
                  }}
                  className="w-full appearance-none border border-[#CCCCCC] cursor-pointer outline-none text-[#2D3748] rounded-lg px-4 py-2"
                  disabled={!form.degree}
                >
                  <option value="" disabled>
                    {form.degree === "Inter" ? "Select Group Code" : "Select Branch Code"}
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
                <CaretDown
                  size={14}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${selectFocus.dept ? "rotate-180" : ""}`}
                />
              </div>
            )}
          </div>
        )}

        <div>
          <CustomMultiSelect
            label="Year"
            placeholder="Select Year"
            options={getYearOptions()}
            selectedValues={form.year ? [form.year] : []}
            onChange={(val) => setForm({ ...form, year: val })}
            onRemove={(_val) => setForm({ ...form, year: "" })}
            mandatory={true}
            singleSelect={true}
          />
        </div>

        <div>
          {customMode.sections ? (
            <div className="space-y-1">
              <label className="text-sm text-[#16284F] font-medium mb-1">
                Sections <span className="text-red-500">*</span>
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
                  ]),
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
                mandatory={true}
              />
            </div>
          )}
        </div>

        {!isSchool && (
          <div>
            <label className="block text-sm text-[#16284F] font-medium mb-1">
              Batch Type <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            {customMode.batch ? (
              renderCustomInput("batch", "Enter Custom Batch")
            ) : (
              <div className="relative">
                <select
                  value={form.batch || ""}
                  onClick={() => setSelectFocus(p => ({ ...p, batch: !p.batch }))}
                  onBlur={() => setSelectFocus(p => ({ ...p, batch: false }))}
                  onChange={(e) => {
                    handleSingleSelectChange("batch", e.target.value);
                    setSelectFocus(p => ({ ...p, batch: false }));
                  }}
                  className="w-full appearance-none border border-[#CCCCCC]  cursor-pointer outline-none text-[#2D3748] rounded-lg px-4 py-1.5"
                >
                  <option value="">{isFetchingOptions ? "Loading batches..." : "Select Batch (Optional)"}</option>
                  {availableBatches.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  {!availableBatches.includes(form.batch || "") && form.batch && (
                    <option value={form.batch}>{form.batch}</option>
                  )}
                  <option className="text-[#43C17A] font-semibold" value="+ other">
                    + Other
                  </option>
                </select>
                <CaretDown
                  size={14}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${selectFocus.batch ? "rotate-180" : ""}`}
                />
              </div>
            )}
          </div>
        )}

      </div>
      <div className="flex justify-center px-auto max-w-md mx-auto">
        {/* <label className="block text-sm font-medium mb-1 opacity-0 pointer-events-none select-none">
          Spacer
        </label> */}
        <button
          onClick={handleSave}
          disabled={
            isLoading || userLoading || isFetchingExisting || !form.degree
          }
          className="bg-[#43C17A] mx-auto w-full cursor-pointer text-white py-2 rounded-lg font-semibold hover:bg-[#3ab06e] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save"
          )}
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
  mandatory?: boolean;
  singleSelect?: boolean;
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
  mandatory = false,
  singleSelect = false,
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
      <label className="text-sm text-[#16284F] font-medium mb-1">{label} {mandatory && <span className="text-red-500">*</span>}</label>
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
          <CaretDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
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
                    if (opt === "+ other" || singleSelect) setIsOpen(false);
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
                ),
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
