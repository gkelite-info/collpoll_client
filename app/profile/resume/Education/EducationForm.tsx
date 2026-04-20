"use client";

import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { EducationType } from "./Education";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import {
  resumePhdEducationAPI,
  resumePrimaryEducationAPI,
  resumeSecondaryEducationAPI,
  resumeUndergraduateEducationAPI,
  resumeMastersEducationAPI,
} from "@/lib/helpers/student/Resume/Resumeeducationapi";
import {
  PhdShimmer,
  PrimaryShimmer,
  SecondaryShimmer,
  UndergraduateShimmer,
} from "../../shimmers/Educationformshimmer ";
import { ALL_INDIA_BOARDS, MASTERS_COURSES, MASTERS_SPECIALIZATIONS, MEDIUM_OPTIONS, SECONDARY_SPECIALIZATIONS, STATE_BOARDS, UNDERGRADUATE_COURSES, UNDERGRADUATE_SPECIALIZATIONS, YEAR_OPTIONS } from "@/lib/helpers/profile/Educationconstants";


// ─── Regex ────────────────────────────────────────────────────────────────────
const onlyLetters = /^[A-Za-z ]+$/;
const lettersAndAmp = /^[A-Za-z& ]+$/;
const schoolNameRegex = /^[A-Za-z .,'-]+$/;
const cgpaRegex = /^(10\.0|[0-9]\.\d)$/;
const percentageRegex = /^(100(\.0+)?|[0-9]{1,2}(\.[0-9]+)?)%?$/;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTitleCase(value: string, allowAmp = false): string {
  const pattern = allowAmp ? /[^A-Za-z& ]/g : /[^A-Za-z ]/g;
  return value
    .replace(pattern, "")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSchoolName(value: string): string {
  return value
    .replace(/[^A-Za-z .,'-]/g, "")
    .toLowerCase()
    .replace(/(^|\s)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
}

function isFormFilled(form: Record<string, string | number | undefined>): boolean {
  return Object.entries(form).some(([key, v]) => {
    if (key === "resumeEducationDetailId") return false;
    return v !== undefined && String(v).trim() !== "";
  });
}

// ─── Searchable Select ─────────────────────────────────────────────────────────
interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  groups?: { label: string; options: string[] }[];
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

function SearchableSelect({
  label,
  value,
  onChange,
  groups,
  options,
  placeholder,
  required = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherInputValue, setOtherInputValue] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filterItems = (items: string[]) =>
    search ? items.filter((o) => o.toLowerCase().includes(search.toLowerCase())) : items;

  const handleSelect = (val: string) => {
    if (val === "__other__") {
      setOpen(false);
      setSearch("");
      setShowOtherInput(true);
      return;
    }
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  const handleOtherAdd = () => {
    const trimmed = otherInputValue.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setOtherInputValue("");
    setShowOtherInput(false);
  };

  const handleOtherCancel = () => {
    setOtherInputValue("");
    setShowOtherInput(false);
  };

  const displayValue = value || "";

  const allOptions = groups
    ? groups.flatMap((g) => g.options)
    : options ?? [];
  const isCustomValue = !!value && !allOptions.includes(value);

  return (
    <div className="space-y-1 w-[85%]" ref={ref}>
      <label className="text-sm font-medium text-[#282828]">
        {label}
        {required && <span className="text-red-500 ml-[2px]">*</span>}
      </label>
      <div className="relative">
        {isCustomValue && !showOtherInput ? (
          <div className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 flex items-center justify-between min-h-[38px]">
            <div className="flex items-center gap-2 px-2 py-0.5 bg-green-50 border border-[#43C17A] rounded-md">
              <span className="text-sm text-[#282828]">{displayValue}</span>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-gray-400 hover:text-red-500 text-xs cursor-pointer leading-none"
              >
                ✕
              </button>
            </div>
            <span className="text-[#525252] ml-2">▾</span>
          </div>
        ) : !showOtherInput ? (
          <div
            className={`w-full border ${open ? "border-blue-500" : "border-[#CCCCCC]"} text-[#525252] rounded-md px-3 py-2 text-sm flex items-center justify-between cursor-pointer`}
            onClick={() => {
              setOpen((p) => !p);
              if (!open) setSearch("");
            }}
          >
            {open ? (
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder ?? `Select ${label}`}
                className="flex-1 outline-none bg-transparent text-[#525252] text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={displayValue ? "text-[#525252]" : "text-[#aaa]"}>
                {displayValue || (placeholder ?? `Select ${label}`)}
              </span>
            )}
            <span className="ml-2 text-[#525252] text-lg">▾</span>
          </div>
        ) : null}

        {open && !showOtherInput && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-[#CCCCCC] rounded-md shadow-lg max-h-60 overflow-y-auto">
            {groups
              ? groups.map((g) => {
                const filtered = filterItems(g.options);
                if (filtered.length === 0) return null;
                return (
                  <div key={g.label}>
                    <div className="px-3 py-1 text-xs text-[#aaa]">
                      -----{g.label}-----
                    </div>
                    {filtered.map((o) => (
                      <div
                        key={o}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${value === o ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                        onClick={() => handleSelect(o)}
                      >
                        {o}
                      </div>
                    ))}
                  </div>
                );
              })
              : filterItems(options ?? []).map((o) => (
                <div
                  key={o}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${value === o ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                  onClick={() => handleSelect(o)}
                >
                  {o}
                </div>
              ))}

            <div
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 text-[#43C17A] font-medium border-t border-[#f0f0f0]"
              onClick={() => handleSelect("__other__")}
            >
              + Other
            </div>
          </div>
        )}
      </div>

      {showOtherInput && (
        <div className="flex gap-2 items-center mt-1">
          <input
            autoFocus
            value={otherInputValue}
            onChange={(e) => setOtherInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleOtherAdd()}
            placeholder={`Enter ${label}`}
            className="flex-1 h-10 px-3 border border-[#D9D9D9] rounded-md text-sm text-[#525252] focus:outline-none focus:border-[#43C17A]"
          />
          <button
            type="button"
            onClick={handleOtherAdd}
            className="px-4 h-10 cursor-pointer bg-[#43C17A] text-white text-sm font-medium rounded-md hover:bg-[#16A34A] transition"
          >
            Add
          </button>
          <button
            type="button"
            onClick={handleOtherCancel}
            className="px-4 h-10 border border-[#CCCCCC] text-[#525252] text-sm font-medium rounded-md cursor-pointer hover:bg-[#F5F5F5] transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ControlledInput ───────────────────────────────────────────────────────────
function ControlledInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  suffix?: string;
}) {
  return (
    <div className="space-y-1 w-[85%]">
      <label className="text-sm font-medium text-[#282828]">
        {label}
        {required && <span className="text-red-500 ml-[2px]">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={type === "date" ? undefined : `Enter ${label}`}
          className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-text"
        />
        {suffix && value && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── ControlledSelect ──────────────────────────────────────────────────────────
function ControlledSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <div className="space-y-1 w-[85%]">
      <label className="text-sm font-medium text-[#282828]">
        {label}
        {required && <span className="text-red-500 ml-[2px]">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-text appearance-none"
        >
          <option value="">Select {label}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#525252]">
          ▾
        </span>
      </div>
    </div>
  );
}

// ─── YearSelect ────────────────────────────────────────────────────────────────
function YearSelect({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredYears = search
    ? YEAR_OPTIONS.filter((y) => y.includes(search))
    : YEAR_OPTIONS;

  return (
    <div className="space-y-1 flex-1" ref={ref}>
      <label className="text-sm font-medium text-[#282828]">
        {label}
        {required && <span className="text-red-500 ml-[2px]">*</span>}
      </label>
      <div className="relative">
        <div
          className={`w-full border ${open ? "border-blue-500" : "border-[#CCCCCC]"} text-[#525252] rounded-md px-3 py-2 text-sm flex items-center justify-between cursor-pointer`}
          onClick={() => { setOpen((p) => !p); if (!open) setSearch(""); }}
        >
          {open ? (
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Search year..."
              className="flex-1 outline-none bg-transparent text-[#525252] text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={value ? "text-[#525252]" : "text-[#aaa]"}>
              {value || "Select Year"}
            </span>
          )}
          <span className="ml-2 text-[#525252] text-lg">▾</span>
        </div>
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-[#CCCCCC] rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredYears.length > 0 ? filteredYears.map((y) => (
              <div
                key={y}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${value === y ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                onClick={() => { onChange(y); setOpen(false); setSearch(""); }}
              >
                {y}
              </div>
            )) : (
              <div className="px-3 py-2 text-sm text-[#aaa]">No results</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DateInput ────────────────────────────────────────────────────────────────
function DateInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1 w-full">
      <label className="text-sm font-medium text-[#282828]">
        {label}
        {required && <span className="text-red-500 ml-[2px]">*</span>}
      </label>
      <input
        type="date"
        value={value}
        min="1900-01-01"
        max="2099-12-31"
        onChange={(e) => {
          const val = e.target.value;
          if (val) {
            const year = Number(val.split("-")[0]);
            if (year < 1900 || year > 2099) return;
          }
          onChange(val);
        }}
        className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 text-sm text-[#282828] focus:outline-none cursor-text"
      />
    </div>
  );
}

// ─── PercentageInput ───────────────────────────────────────────────────────────
function PercentageInput({
  value,
  onChange,
  required = false,
}: {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}) {
  const numericValue = value.replace("%", "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^0-9]/g, "");
    if (v.length > 3) v = v.slice(0, 3);
    if (v.length === 3) {
      v = v.slice(0, 2) + "." + v.slice(2);
    }
    const num = parseFloat(v);
    if (!isNaN(num) && num > 100) v = "100";
    onChange(v);
  };

  return (
    <div className="space-y-1 w-[85%]">
      <label className="text-sm font-medium text-[#282828]">
        Percentage
        {required && <span className="text-red-500 ml-[2px]">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={numericValue ? `${numericValue}%` : ""}
          onChange={handleChange}
          onFocus={(e) => {
            const len = e.target.value.replace("%", "").length;
            setTimeout(() => e.target.setSelectionRange(len, len), 0);
          }}
          placeholder="Enter Percentage"
          className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-text"
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">Click before % to edit</p>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TITLES: Record<EducationType, string> = {
  primary: "Primary Education",
  secondary: "Secondary Education",
  undergraduate: "Undergraduate Degree",
  masters: "Masters Degree",
  phd: "PhD",
};

interface FieldProps {
  studentId: number;
  collegeId: number;
  onSaveRef: React.MutableRefObject<(() => Promise<void>) | null>;
  onRecordSaved: (id: number) => void;
}

// ─── Main wrapper ──────────────────────────────────────────────────────────────
export default function ResumeEducationForm({
  type,
  onSaveRef,
  onRemove,
  onRecordSaved,
}: {
  type: EducationType;
  onSaveRef: React.MutableRefObject<(() => Promise<void>) | null>;
  onRemove: () => void;
  onRecordSaved?: (id: number) => void;
}) {
  const { studentId, collegeId } = useUser();
  const resetRef = useState<(() => void) | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (recordId == null) {
      setConfirmOpen(false);
      onRemove();
      return;
    }
    if (studentId == null) {
      toast.error("Session expired. Please refresh.");
      return;
    }
    setIsDeleting(true);
    try {
      const apiMap = {
        primary: resumePrimaryEducationAPI,
        secondary: resumeSecondaryEducationAPI,
        undergraduate: resumeUndergraduateEducationAPI,
        masters: resumeMastersEducationAPI,
        phd: resumePhdEducationAPI,
      };
      const response = await apiMap[type].delete(recordId);
      if (response.success) {
        toast.success(`${TITLES[type]} deleted`);
        setConfirmOpen(false);
        if (type === "primary") {
          setRecordId(null);
          resetRef[0]?.();
        } else {
          onRemove();
        }
      } else {
        toast.error(`Failed to delete ${TITLES[type]}. Please try again.`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (studentId == null || collegeId == null) return null;

  const fieldProps: FieldProps = {
    studentId,
    collegeId,
    onSaveRef,
    onRecordSaved: (id: number) => {
      setRecordId(id);
      onRecordSaved?.(id);
    },
  };

  return (
    <>
      <ConfirmDeleteModal
        open={confirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
        isDeleting={isDeleting}
        name={TITLES[type]}
      />
      <div className="flex justify-between items-center w-[85%] mb-3">
        <h3 className="text-[#43C17A] font-medium">{TITLES[type]}</h3>
        {/* ✅ FIXED: same logic as reference — recordId decides, not formDirty */}
        <button
          onClick={() => {
            if (!recordId) {
              onRemove();
              return;
            }
            setConfirmOpen(true);
          }}
          className="w-5 h-5 flex cursor-pointer items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
        >
          <span className="block w-3 h-[3px] bg-white rounded-full" />
        </button>
      </div>
      {type === "primary" && (
        <PrimaryFields {...fieldProps} setResetHandler={resetRef[1]} />
      )}
      {type === "secondary" && <SecondaryFields {...fieldProps} />}
      {type === "undergraduate" && <UndergraduateFields {...fieldProps} />}
      {type === "masters" && <MastersFields {...fieldProps} />}
      {type === "phd" && <PhdFields {...fieldProps} />}
    </>
  );
}

// ─── PrimaryFields ─────────────────────────────────────────────────────────────
function PrimaryFields({
  studentId,
  collegeId,
  onSaveRef,
  onRecordSaved,
  setResetHandler,
}: FieldProps & {
  setResetHandler: React.Dispatch<React.SetStateAction<(() => void) | null>>;
}) {
  const [form, setForm] = useState({
    resumeEducationDetailId: undefined as number | undefined,
    institutionName: "",
    board: "",
    mediumOfStudy: "",
    yearOfPassing: "",
    cgpa: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await resumePrimaryEducationAPI.fetch(studentId);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          resumeEducationDetailId: d.resumeEducationDetailId,
          institutionName: d.institutionName ?? "",
          board: d.board ?? "",
          mediumOfStudy: d.mediumOfStudy ?? "",
          yearOfPassing: d.yearOfPassing ? String(d.yearOfPassing) : "",
          cgpa: d.cgpa != null ? Number(d.cgpa).toFixed(1) : "",
          location: d.location ?? "",
        });
        onRecordSaved(d.resumeEducationDetailId);
      }
      setIsLoading(false);
    })();
  }, [studentId]);

  const handleChange = (field: string, value: string) => {
    let v = value;
    if (field === "institutionName") v = formatSchoolName(v);
    if (field === "location") v = formatTitleCase(v);
    if (field === "cgpa") {
      v = v.replace(/[^0-9.]/g, "");
      const parts = v.split(".");
      if (parts.length > 2) parts.splice(2);
      if (parts[1] !== undefined) parts[1] = parts[1].slice(0, 1);
      v = parts.join(".");
      const num = parseFloat(v);
      if (!isNaN(num) && num > 10) v = "10.0";
      setForm((p) => ({ ...p, [field]: v }));
      return;
    }
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = (): string | null => {
    if (!form.institutionName.trim()) return "School Name is required";
    if (!schoolNameRegex.test(form.institutionName)) return "School Name allows only letters, spaces, dots and commas";
    if (!form.board.trim()) return "Board is required";
    if (!form.mediumOfStudy.trim()) return "Medium of Study is required";
    if (!form.yearOfPassing) return "Year Of Passing is required";
    if (form.yearOfPassing.length !== 4) return "Year Of Passing must be 4 digits";
    if (!form.cgpa.trim()) return "CGPA is required";
    if (!cgpaRegex.test(form.cgpa)) return "CGPA must be between 0.0 and 10.0";
    if (!form.location.trim()) return "Location is required";
    if (!onlyLetters.test(form.location)) return "Location must contain only letters";
    return null;
  };

  const savePrimary = async () => {
    if (isSaving) return;
    const error = validate();
    if (error) { toast.error(error); throw new Error(error); }
    setIsSaving(true);
    try {
      const response = await resumePrimaryEducationAPI.save({
        resumeEducationDetailId: form.resumeEducationDetailId,
        studentId,
        collegeId,
        institutionName: form.institutionName,
        board: form.board,
        mediumOfStudy: form.mediumOfStudy,
        yearOfPassing: Number(form.yearOfPassing),
        cgpa: Number(form.cgpa),
        location: form.location,
      });
      if (!response.success) throw new Error("primary_save_failed");
      if (response.id) {
        setForm((p) => ({ ...p, resumeEducationDetailId: response.id }));
        onRecordSaved(response.id!);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => { onSaveRef.current = savePrimary; }, [form]);

  useEffect(() => {
    const resetPrimaryForm = () => {
      setForm({
        resumeEducationDetailId: undefined,
        institutionName: "",
        board: "",
        mediumOfStudy: "",
        yearOfPassing: "",
        cgpa: "",
        location: "",
      });
    };
    setResetHandler(() => resetPrimaryForm);
  }, [setResetHandler]);

  if (isLoading) return <PrimaryShimmer />;

  return (
    <div className="space-y-4">
      <ControlledInput
        label="School Name"
        required
        value={form.institutionName}
        onChange={(e) => handleChange("institutionName", e.target.value)}
      />
      <SearchableSelect
        label="Board"
        required
        value={form.board}
        onChange={(val) => setForm((p) => ({ ...p, board: val }))}
        groups={[
          { label: "All India", options: ALL_INDIA_BOARDS },
          { label: "State Boards", options: STATE_BOARDS },
        ]}
        placeholder="Select board"
      />
      <SearchableSelect
        label="Medium of Study"
        required
        value={form.mediumOfStudy}
        onChange={(val) => setForm((p) => ({ ...p, mediumOfStudy: val }))}
        options={MEDIUM_OPTIONS}
        placeholder="Select medium"
      />
      <div className="flex gap-5 w-[85%]">
        <YearSelect
          label="Year Of Passing"
          required
          value={form.yearOfPassing}
          onChange={(val) => setForm((p) => ({ ...p, yearOfPassing: val }))}
        />
        <div className="space-y-1 flex-1">
          <label className="text-sm font-medium text-[#282828]">
            CGPA<span className="text-red-500 ml-[2px]">*</span>
          </label>
          <input
            type="text"
            value={form.cgpa}
            onChange={(e) => handleChange("cgpa", e.target.value)}
            placeholder="Enter CGPA"
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer"
          />
        </div>
      </div>
      <ControlledInput
        label="Location"
        required
        value={form.location}
        onChange={(e) => handleChange("location", e.target.value)}
      />
    </div>
  );
}

// ─── SecondaryFields ───────────────────────────────────────────────────────────
function SecondaryFields({ studentId, collegeId, onSaveRef, onRecordSaved }: FieldProps) {
  const [form, setForm] = useState({
    resumeEducationDetailId: undefined as number | undefined,
    institutionName: "",
    board: "",
    mediumOfStudy: "",
    specialization: "",
    startDate: "",
    endDate: "",
    percentage: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await resumeSecondaryEducationAPI.fetch(studentId);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          resumeEducationDetailId: d.resumeEducationDetailId,
          institutionName: d.institutionName ?? "",
          board: d.board ?? "",
          mediumOfStudy: d.mediumOfStudy ?? "",
          specialization: d.specialization ?? "",
          startDate: d.startYear ?? "",
          endDate: d.endYear ?? "",
          percentage: String(d.percentage ?? ""),
          location: d.location ?? "",
        });
        onRecordSaved(d.resumeEducationDetailId);
      }
      setIsLoading(false);
    })();
  }, [studentId]);

  const handleChange = (field: string, value: string) => {
    let v = value;
    if (field === "institutionName") v = formatSchoolName(v);
    if (field === "location") v = formatTitleCase(v);
    if (field === "percentage") v = v.replace(/[^0-9.]/g, "");
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = (): string | null => {
    if (!form.institutionName.trim()) return "Institution Name is required";
    if (!schoolNameRegex.test(form.institutionName)) return "Institution Name allows only letters, spaces, dots and commas";
    if (!form.board.trim()) return "Board is required";
    if (!form.mediumOfStudy.trim()) return "Medium of Study is required";
    if (!form.specialization.trim()) return "Specialization is required";
    if (!form.startDate.trim()) return "Start Date is required";
    if (!form.endDate.trim()) return "End Date is required";
    if (!form.percentage.trim()) return "Percentage is required";
    if (!percentageRegex.test(form.percentage)) return "Percentage must be like 80, 80.4";
    if (!form.location.trim()) return "Location is required";
    if (!onlyLetters.test(form.location)) return "Location must contain only letters";
    return null;
  };

  const saveSecondary = async () => {
    if (isSaving) return;
    const error = validate();
    if (error) { toast.error(error); throw new Error(error); }
    setIsSaving(true);
    const numericPercentage = parseFloat(form.percentage.replace("%", ""));
    try {
      const response = await resumeSecondaryEducationAPI.save({
        resumeEducationDetailId: form.resumeEducationDetailId,
        studentId,
        collegeId,
        institutionName: form.institutionName,
        board: form.board,
        mediumOfStudy: form.mediumOfStudy,
        specialization: form.specialization,
        startDate: form.startDate,
        endDate: form.endDate,
        percentage: numericPercentage,
        location: form.location,
      });
      if (!response.success) throw new Error("secondary_save_failed");
      if (response.id) {
        setForm((p) => ({ ...p, resumeEducationDetailId: response.id }));
        onRecordSaved(response.id!);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => { onSaveRef.current = saveSecondary; }, [form]);

  if (isLoading) return <SecondaryShimmer />;

  return (
    <div className="space-y-4">
      <ControlledInput
        label="Institution Name"
        required
        value={form.institutionName}
        onChange={(e) => handleChange("institutionName", e.target.value)}
      />
      <SearchableSelect
        label="Board"
        required
        value={form.board}
        onChange={(val) => setForm((p) => ({ ...p, board: val }))}
        groups={[
          { label: "All India", options: ALL_INDIA_BOARDS },
          { label: "State Boards", options: STATE_BOARDS },
        ]}
        placeholder="Select board"
      />
      <SearchableSelect
        label="Medium of Study"
        required
        value={form.mediumOfStudy}
        onChange={(val) => setForm((p) => ({ ...p, mediumOfStudy: val }))}
        options={MEDIUM_OPTIONS}
        placeholder="Select medium"
      />
      <SearchableSelect
        label="Specialization"
        required
        value={form.specialization}
        onChange={(val) => setForm((p) => ({ ...p, specialization: val }))}
        options={SECONDARY_SPECIALIZATIONS}
        placeholder="Select specialization"
      />
      <div className="flex gap-5 w-[85%]">
        <DateInput
          label="Start Date"
          required
          value={form.startDate}
          onChange={(val) => setForm((p) => ({ ...p, startDate: val }))}
        />
        <DateInput
          label="End Date"
          required
          value={form.endDate}
          onChange={(val) => setForm((p) => ({ ...p, endDate: val }))}
        />
      </div>
      <PercentageInput
        required
        value={form.percentage}
        onChange={(val) => setForm((p) => ({ ...p, percentage: val }))}
      />
      <ControlledInput
        label="Location"
        required
        value={form.location}
        onChange={(e) => handleChange("location", e.target.value)}
      />
    </div>
  );
}

// ─── UndergraduateFields ───────────────────────────────────────────────────────
function UndergraduateFields({ studentId, collegeId, onSaveRef, onRecordSaved }: FieldProps) {
  const [form, setForm] = useState({
    resumeEducationDetailId: undefined as number | undefined,
    courseName: "",
    specialization: "",
    institutionName: "",
    cgpa: "",
    startDate: "",
    endDate: "",
    courseType: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await resumeUndergraduateEducationAPI.fetch(studentId);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          resumeEducationDetailId: d.resumeEducationDetailId,
          courseName: d.courseName ?? "",
          specialization: d.specialization ?? "",
          institutionName: d.institutionName ?? "",
          cgpa: d.cgpa != null ? Number(d.cgpa).toFixed(1) : "",
          startDate: d.startYear ?? "",
          endDate: d.endYear ?? "",
          courseType: d.courseType ?? "",
        });
        onRecordSaved(d.resumeEducationDetailId);
      }
      setIsLoading(false);
    })();
  }, [studentId]);

  const handleChange = (field: string, value: string) => {
    let v = value;
    if (field === "courseName") v = formatTitleCase(v.replace(/[^A-Za-z& ]/g, ""), true);
    if (field === "specialization") v = v.replace(/[^A-Za-z& ]/g, "");
    if (field === "institutionName") v = formatSchoolName(v);
    if (field === "cgpa") {
      v = v.replace(/[^0-9.]/g, "");
      const parts = v.split(".");
      if (parts.length > 2) parts.splice(2);
      if (parts[1] !== undefined) parts[1] = parts[1].slice(0, 1);
      v = parts.join(".");
      const num = parseFloat(v);
      if (!isNaN(num) && num > 10) v = "10.0";
      setForm((p) => ({ ...p, [field]: v }));
      return;
    }
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = (): string | null => {
    if (!form.courseName.trim()) return "Course Name is required";
    if (!lettersAndAmp.test(form.courseName)) return "Course Name must contain only letters or &";
    if (!form.specialization.trim()) return "Specialization is required";
    if (!lettersAndAmp.test(form.specialization)) return "Specialization must contain only letters or &";
    if (!form.institutionName.trim()) return "College Name is required";
    if (!form.cgpa.trim()) return "CGPA is required";
    if (!cgpaRegex.test(form.cgpa)) return "CGPA must be between 0.0 and 10.0";
    if (!form.startDate.trim()) return "Start Date is required";
    if (!form.endDate.trim()) return "End Date is required";
    if (new Date(form.endDate) < new Date(form.startDate)) return "End Date must be >= Start Date";
    if (!form.courseType.trim()) return "Course Type is required";
    return null;
  };

  const saveUndergraduate = async () => {
    if (isSaving) return;
    const error = validate();
    if (error) { toast.error(error); throw new Error(error); }
    setIsSaving(true);
    try {
      const response = await resumeUndergraduateEducationAPI.save({
        resumeEducationDetailId: form.resumeEducationDetailId,
        studentId,
        collegeId,
        institutionName: form.institutionName,
        courseName: form.courseName,
        specialization: form.specialization,
        cgpa: Number(form.cgpa),
        startDate: form.startDate,
        endDate: form.endDate,
        courseType: form.courseType,
      });
      if (!response.success) throw new Error("undergraduate_save_failed");
      if (response.id) {
        setForm((p) => ({ ...p, resumeEducationDetailId: response.id }));
        onRecordSaved(response.id!);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => { onSaveRef.current = saveUndergraduate; }, [form]);

  if (isLoading) return <UndergraduateShimmer />;

  return (
    <div className="space-y-4">
      <SearchableSelect
        label="Course Name"
        required
        value={form.courseName}
        onChange={(val) => setForm((p) => ({ ...p, courseName: val }))}
        options={UNDERGRADUATE_COURSES}
        placeholder="Select course"
      />
      <SearchableSelect
        label="Specialization"
        required
        value={form.specialization}
        onChange={(val) => setForm((p) => ({ ...p, specialization: val }))}
        options={UNDERGRADUATE_SPECIALIZATIONS}
        placeholder="Select specialization"
      />
      <ControlledInput
        label="College Name"
        required
        value={form.institutionName}
        onChange={(e) => handleChange("institutionName", e.target.value)}
      />
      <ControlledInput
        label="CGPA"
        required
        value={form.cgpa}
        onChange={(e) => handleChange("cgpa", e.target.value)}
      />
      <div className="flex gap-5 w-[85%]">
        <DateInput
          label="Start Date"
          required
          value={form.startDate}
          onChange={(val) => setForm((p) => ({ ...p, startDate: val }))}
        />
        <DateInput
          label="End Date"
          required
          value={form.endDate}
          onChange={(val) => setForm((p) => ({ ...p, endDate: val }))}
        />
      </div>
      <ControlledSelect
        label="Course Type"
        required
        value={form.courseType}
        onChange={(e) => setForm((p) => ({ ...p, courseType: e.target.value }))}
        options={["Regular", "Distance Learning"]}
      />
    </div>
  );
}

// ─── MastersFields ─────────────────────────────────────────────────────────────
function MastersFields({ studentId, collegeId, onSaveRef, onRecordSaved }: FieldProps) {
  const [form, setForm] = useState({
    resumeEducationDetailId: undefined as number | undefined,
    courseName: "",
    specialization: "",
    institutionName: "",
    cgpa: "",
    startDate: "",
    endDate: "",
    courseType: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await resumeMastersEducationAPI.fetch(studentId);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          resumeEducationDetailId: d.resumeEducationDetailId,
          courseName: d.courseName ?? "",
          specialization: d.specialization ?? "",
          institutionName: d.institutionName ?? "",
          cgpa: d.cgpa != null ? Number(d.cgpa).toFixed(1) : "",
          startDate: d.startYear ?? "",
          endDate: d.endYear ?? "",
          courseType: d.courseType ?? "",
        });
        onRecordSaved(d.resumeEducationDetailId);
      }
      setIsLoading(false);
    })();
  }, [studentId]);

  const handleChange = (field: string, value: string) => {
    let v = value;
    if (field === "courseName") v = formatTitleCase(v.replace(/[^A-Za-z& ]/g, ""), true);
    if (field === "specialization") v = v.replace(/[^A-Za-z& ]/g, "");
    if (field === "institutionName") v = formatSchoolName(v);
    if (field === "cgpa") {
      let v = value.replace(/[^0-9]/g, "");
      if (v.length === 0) { setForm((p) => ({ ...p, [field]: "" })); return; }
      if (v.length === 1) { setForm((p) => ({ ...p, [field]: v })); return; }
      let numStr = v.length === 2 ? `${v[0]}.${v[1]}` : `${v[0]}.${v.slice(1, 2)}`;
      let num = parseFloat(numStr);
      if (num > 10) num = 10;
      const finalVal = num.toFixed(1).replace(/\.0$/, ".0");
      setForm((p) => ({ ...p, [field]: finalVal }));
      return;
    }
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = (): string | null => {
    if (!form.courseName.trim()) return "Course Name is required";
    if (!lettersAndAmp.test(form.courseName)) return "Course Name must contain only letters or &";
    if (!form.specialization.trim()) return "Specialization is required";
    if (!lettersAndAmp.test(form.specialization)) return "Specialization must contain only letters or &";
    if (!form.institutionName.trim()) return "College Name is required";
    if (!form.cgpa.trim()) return "CGPA is required";
    if (!cgpaRegex.test(form.cgpa)) return "CGPA must be between 0.0 and 10.0";
    if (!form.startDate.trim()) return "Start Date is required";
    if (!form.endDate.trim()) return "End Date is required";
    if (new Date(form.endDate) < new Date(form.startDate)) return "End Date must be >= Start Date";
    if (!form.courseType.trim()) return "Course Type is required";
    return null;
  };

  const saveMasters = async () => {
    if (isSaving) return;
    const error = validate();
    if (error) { toast.error(error); throw new Error(error); }
    setIsSaving(true);
    try {
      const response = await resumeMastersEducationAPI.save({
        resumeEducationDetailId: form.resumeEducationDetailId,
        studentId,
        collegeId,
        institutionName: form.institutionName,
        courseName: form.courseName,
        specialization: form.specialization,
        cgpa: Number(form.cgpa),
        startDate: form.startDate,
        endDate: form.endDate,
        courseType: form.courseType,
      });
      if (!response.success) throw new Error("masters_save_failed");
      if (response.id) {
        setForm((p) => ({ ...p, resumeEducationDetailId: response.id }));
        onRecordSaved(response.id!);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => { onSaveRef.current = saveMasters; }, [form]);

  if (isLoading) return <UndergraduateShimmer />;

  return (
    <div className="space-y-4">
      <SearchableSelect
        label="Course Name"
        required
        value={form.courseName}
        onChange={(val) => setForm((p) => ({ ...p, courseName: val, specialization: "" }))}
        options={MASTERS_COURSES}
        placeholder="Select course"
      />
      <SearchableSelect
        label="Specialization"
        required
        value={form.specialization}
        onChange={(val) => setForm((p) => ({ ...p, specialization: val }))}
        options={MASTERS_SPECIALIZATIONS}
        placeholder="Select specialization"
      />
      <ControlledInput
        label="College Name"
        required
        value={form.institutionName}
        onChange={(e) => handleChange("institutionName", e.target.value)}
      />
      <ControlledInput
        label="CGPA"
        required
        value={form.cgpa}
        onChange={(e) => handleChange("cgpa", e.target.value)}
      />
      <div className="flex gap-5 w-[85%]">
        <DateInput
          label="Start Date"
          required
          value={form.startDate}
          onChange={(val) => setForm((p) => ({ ...p, startDate: val }))}
        />
        <DateInput
          label="End Date"
          required
          value={form.endDate}
          onChange={(val) => setForm((p) => ({ ...p, endDate: val }))}
        />
      </div>
      <ControlledSelect
        label="Course Type"
        required
        value={form.courseType}
        onChange={(e) => setForm((p) => ({ ...p, courseType: e.target.value }))}
        options={["Regular", "Distance Learning"]}
      />
    </div>
  );
}

// ─── PhdFields ─────────────────────────────────────────────────────────────────
function PhdFields({ studentId, collegeId, onSaveRef, onRecordSaved }: FieldProps) {
  const [form, setForm] = useState({
    resumeEducationDetailId: undefined as number | undefined,
    institutionName: "",
    researchArea: "",
    supervisorName: "",
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await resumePhdEducationAPI.fetch(studentId);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          resumeEducationDetailId: d.resumeEducationDetailId,
          institutionName: d.institutionName ?? "",
          researchArea: d.researchArea ?? "",
          supervisorName: d.supervisorName ?? "",
          startDate: d.startYear ?? "",
          endDate: d.endYear ?? "",
        });
        onRecordSaved(d.resumeEducationDetailId);
      }
      setIsLoading(false);
    })();
  }, [studentId]);

  const handleChange = (field: string, value: string) => {
    let v = value;
    if (["institutionName", "researchArea", "supervisorName"].includes(field)) {
      v = value
        .replace(/[^A-Za-z .''-]/g, "")
        .toLowerCase()
        .replace(/(^|(?<= ))\w/g, (c) => c.toUpperCase());
    }
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = (): string | null => {
    const phdFieldRegex = /^[A-Za-z .''-]+$/;
    if (!form.institutionName.trim()) return "University Name is required";
    if (!phdFieldRegex.test(form.institutionName)) return "University Name allows only letters, spaces, . ' -";
    if (!form.researchArea.trim()) return "Research Area is required";
    if (!phdFieldRegex.test(form.researchArea)) return "Research Area allows only letters, spaces, . ' -";
    if (!form.supervisorName.trim()) return "Supervisor Name is required";
    if (!phdFieldRegex.test(form.supervisorName)) return "Supervisor Name allows only letters, spaces, . ' -";
    if (!form.startDate.trim()) return "Start Date is required";
    if (!form.endDate.trim()) return "End Date is required";
    if (new Date(form.endDate) < new Date(form.startDate)) return "End Date cannot be earlier than Start Date";
    return null;
  };

  const savePhd = async () => {
    if (isSaving) return;
    const error = validate();
    if (error) { toast.error(error); throw new Error(error); }
    setIsSaving(true);
    try {
      const response = await resumePhdEducationAPI.save({
        resumeEducationDetailId: form.resumeEducationDetailId,
        studentId,
        collegeId,
        institutionName: form.institutionName,
        researchArea: form.researchArea,
        supervisorName: form.supervisorName,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      if (!response.success) throw new Error("phd_save_failed");
      if (response.id) {
        setForm((p) => ({ ...p, resumeEducationDetailId: response.id }));
        onRecordSaved(response.id!);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => { onSaveRef.current = savePhd; }, [form]);

  if (isLoading) return <PhdShimmer />;

  return (
    <div className="space-y-4">
      <ControlledInput
        label="University Name"
        required
        value={form.institutionName}
        onChange={(e) => handleChange("institutionName", e.target.value)}
      />
      <ControlledInput
        label="Research Area"
        required
        value={form.researchArea}
        onChange={(e) => handleChange("researchArea", e.target.value)}
      />
      <ControlledInput
        label="Supervisor Name"
        required
        value={form.supervisorName}
        onChange={(e) => handleChange("supervisorName", e.target.value)}
      />
      <div className="flex gap-5 w-[85%]">
        <DateInput
          label="Start Date"
          required
          value={form.startDate}
          onChange={(val) => setForm((p) => ({ ...p, startDate: val }))}
        />
        <DateInput
          label="End Date"
          required
          value={form.endDate}
          onChange={(val) => setForm((p) => ({ ...p, endDate: val }))}
        />
      </div>
    </div>
  );
}