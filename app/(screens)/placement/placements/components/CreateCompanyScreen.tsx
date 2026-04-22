"use client";

import { useUser } from "@/app/utils/context/UserContext";
import { fetchAcademicYears, fetchBranches, fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns";
import { createPlacementCompany, updatePlacementCompany } from "@/lib/helpers/placements/createPlacementCompany";
import { CaretDown, CaretLeft, FilePdf, ImageSquare, Trash, UploadSimple, X } from "@phosphor-icons/react";
import { ReactNode, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type CreateCompanyScreenProps = {
  onCancel: () => void;
  initialData?: Partial<
    Omit<CompanyFormState, "companyLogo" | "certificates">
  > & {
    id?: string;
    placementCompanyIds?: number[];
  };
};

type CascadeOption = { id: number; label: string; code?: string };

type CompanyFormState = {
  companyName: string;
  email: string;
  countryCode: string;
  phone: string;
  description: string;
  website: string;
  jobRole: string;
  jobRoleOther: string;
  requiredSkills: string;
  jobType: string;
  workMode: string;
  locations: string;
  annualPackage: string;
  driveType: string;
  startDate: string;
  endDate: string;
  educationType: CascadeOption | null;
  branch: CascadeOption | null;
  academicYear: CascadeOption | null;
  eligibilityCriteria: string;
  companyLogo: File | null;
  certificates: File[];
  existingLogoName: string;
  existingCertificates: string[];
};

const initialFormState: CompanyFormState = {
  companyName: "",
  email: "",
  countryCode: "+91",
  phone: "",
  description: "",
  website: "",
  jobRole: "",
  jobRoleOther: "",
  requiredSkills: "",
  jobType: "",
  workMode: "",
  locations: "",
  annualPackage: "",
  driveType: "",
  startDate: "",
  endDate: "",
  educationType: null,
  branch: null,
  academicYear: null,
  eligibilityCriteria: "",
  companyLogo: null,
  certificates: [],
  existingLogoName: "",
  existingCertificates: [],
};

const JOB_ROLE_OPTIONS = [
  "Software Engineer",
  "SDE Intern",
  "Analyst",
  "QA Engineer",
];

// ─── Enum value maps (DB value → display label) ───────────────────────────────

const JOB_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "Full Time", value: "fulltime" },
  { label: "Internship", value: "internship" },
  { label: "Contract", value: "contract" },
];

const WORK_MODE_OPTIONS: { label: string; value: string }[] = [
  { label: "Onsite", value: "onsite" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Remote", value: "remote" },
];

const DRIVE_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "Virtual", value: "virtual" },
  { label: "In Person", value: "inperson" },
];

// ─── Sanitizers ───────────────────────────────────────────────────────────────

const sanitizeName = (v: string) => v.replace(/[^a-zA-Z0-9\s\-'()]/g, "");

const sanitizeEmail = (v: string): string => {
  const cleaned = v.toLowerCase().replace(/[^a-z0-9@._\-+]/g, "");
  const atIndex = cleaned.indexOf("@");
  if (atIndex !== -1) {
    const domain = cleaned.slice(atIndex + 1);
    const tldMatch = domain.match(/^([a-z0-9.\-]+\.[a-z]{2,})/);
    if (tldMatch) {
      return cleaned.slice(0, atIndex + 1) + tldMatch[1];
    }
  }
  return cleaned;
};

const sanitizePhone = (v: string) => v.replace(/\D/g, "").slice(0, 10);
const sanitizeLocation = (v: string) => v.replace(/[^a-zA-Z0-9\s\-']/g, "");
const sanitizePackage = (v: string) => v.replace(/[^a-zA-Z0-9\s.]/g, "");

// ─── Validators ───────────────────────────────────────────────────────────────

type FormErrors = Partial<Record<keyof CompanyFormState | "jobRoleOther", string>>;

function validate(
  form: CompanyFormState,
  { isEditMode }: { isEditMode: boolean },
): FormErrors {
  const errors: FormErrors = {};

  if (!form.companyName.trim()) {
    errors.companyName = "Company name is required";
  } else if (form.companyName.trim().length < 2) {
    errors.companyName = "Must be at least 2 characters";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[a-z0-9._+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(form.email.trim())) {
    errors.email = "Enter a valid email (all lowercase, e.g. info@company.com)";
  }

  if (form.phone.trim() && !/^\d{10}$/.test(form.phone.trim())) {
    errors.phone = "Phone must be exactly 10 digits";
  }

  if (!form.description.trim()) {
    errors.description = "Company Job description is required";
  } else if (form.description.trim().length < 20) {
    errors.description = "Description must be at least 20 characters";
  }

  if (!form.website.trim()) {
    errors.website = "Website URL is required";
  } else if (!/^https:\/\/.+\..+/.test(form.website.trim())) {
    errors.website = "Website must start with https://";
  }

  if (!form.jobRole) {
    errors.jobRole = "Job role is required";
  } else if (form.jobRole === "Other" && !form.jobRoleOther.trim()) {
    errors.jobRoleOther = "Please specify the job role";
  }

  if (!form.requiredSkills.trim()) errors.requiredSkills = "Required skills are needed";
  if (!form.jobType) errors.jobType = "Job type is required";
  if (!form.workMode) errors.workMode = "Work mode is required";
  if (!form.locations.trim()) errors.locations = "Location is required";
  if (!form.annualPackage.trim()) errors.annualPackage = "Annual package is required";
  if (!form.driveType) errors.driveType = "Drive type is required";

  if (!form.startDate) errors.startDate = "Start date is required";
  if (!form.endDate) {
    errors.endDate = "End date is required";
  } else if (form.startDate && form.endDate <= form.startDate) {
    errors.endDate = "End date must be after start date";
  }

  if (!form.educationType) errors.educationType = "Education type is required";
  if (!form.branch) errors.branch = "Branch is required";
  if (!form.academicYear) errors.academicYear = "Academic year is required";

  if (!form.eligibilityCriteria.trim())
    errors.eligibilityCriteria = "Eligibility criteria is required";

  if (!form.companyLogo && !(isEditMode && form.existingLogoName)) {
    errors.companyLogo = "Company logo is required";
  }
  if (!form.certificates.length && !(isEditMode && form.existingCertificates.length))
    errors.certificates = "At least one certificate is required";

  return errors;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function SectionLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

function inputCls(hasError?: boolean) {
  return `w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F] ${hasError ? "border-red-400" : "border-[#CCCCCC]"
    }`;
}

// ─── Enum Select Field (label/value pairs) ────────────────────────────────────

function EnumSelectField({
  value,
  onChange,
  placeholder,
  options,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
  hasError?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[#49C77F] ${value ? "text-[#525252]" : "text-gray-400"
        } ${hasError ? "border-red-400" : "border-[#CCCCCC]"}`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── Cascade Single-Select Dropdown ──────────────────────────────────────────

function CascadeSelect({
  label,
  required,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  loading,
  hasError,
  errorMsg,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  options: CascadeOption[];
  value: CascadeOption | null;
  onChange: (opt: CascadeOption | null) => void;
  disabled?: boolean;
  loading?: boolean;
  hasError?: boolean;
  errorMsg?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div>
      <SectionLabel required={required}>{label}</SectionLabel>
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => setOpen((p) => !p)}
          className={`flex w-full items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#49C77F]
            ${hasError ? "border-red-400" : "border-[#CCCCCC]"}
            ${disabled || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            ${value ? "text-[#525252]" : "text-gray-400"}
          `}
        >
          <span className="truncate">
            {loading ? "Loading..." : value ? value.label : placeholder}
          </span>
          <CaretDown
            size={15}
            weight="bold"
            className={`ml-2 flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && !disabled && !loading && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">No options available</div>
              ) : (
                options.map((opt) => {
                  const isSelected = value?.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => { onChange(opt); setOpen(false); }}
                      className={`flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm transition
                        ${isSelected ? "bg-green-50 font-medium text-[#1e7a4a]" : "text-[#525252] hover:bg-gray-50"}
                      `}
                    >
                      {isSelected ? (
                        <svg viewBox="0 0 12 12" className="h-3 w-3 flex-shrink-0">
                          <path d="M1 6l3.5 3.5L11 2" stroke="#49C77F" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span className="h-3 w-3 flex-shrink-0" />
                      )}
                      {opt.label}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
      <FieldError msg={errorMsg} />
    </div>
  );
}

// ─── Job Role Dropdown ────────────────────────────────────────────────────────

function JobRoleDropdown({
  value,
  otherValue,
  onValueChange,
  onOtherChange,
  hasError,
  hasOtherError,
}: {
  value: string;
  otherValue: string;
  onValueChange: (v: string) => void;
  onOtherChange: (v: string) => void;
  hasError?: boolean;
  hasOtherError?: boolean;
}) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherInput, setOtherInput] = useState(otherValue);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpenDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commitOther = () => {
    const v = otherInput.trim();
    if (!v) { toast.error("Please enter a job role before adding."); return; }
    onValueChange("Other");
    onOtherChange(v);
    setShowOtherInput(false);
  };

  const cancelOther = () => {
    setShowOtherInput(false);
    setOtherInput("");
    onValueChange("");
    onOtherChange("");
  };

  if (value === "Other" && otherValue.trim()) {
    return (
      <div className={`flex min-h-[42px] w-full items-center justify-between rounded-lg border bg-white px-4 py-2 shadow-sm ${hasError ? "border-red-400" : "border-[#CCCCCC]"}`}>
        <span className="flex items-center gap-2 rounded-md border border-[#49C77F] bg-green-50 px-2 py-0.5 text-sm text-[#282828]">
          {otherValue}
          <button
            type="button"
            onClick={() => { onValueChange(""); onOtherChange(""); setOtherInput(""); setShowOtherInput(false); }}
            className="text-xs text-gray-400 hover:text-red-500"
          >✕</button>
        </span>
        <span className="text-[#525252]">▾</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpenDropdown((p) => !p)}
        className={`flex w-full cursor-pointer items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-sm shadow-sm ${hasError ? "border-red-400" : "border-[#CCCCCC]"
          } ${value && value !== "Other" ? "text-[#525252]" : "text-gray-400"}`}
      >
        <span>{value && value !== "Other" ? value : "Select Job Role"}</span>
        <span className="text-[#525252]">▾</span>
      </div>

      {openDropdown && (
        <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
          <div onClick={() => { onValueChange(""); setOpenDropdown(false); }} className="cursor-pointer px-3 py-2 text-gray-400 hover:bg-gray-100">
            Select Job Role
          </div>
          {JOB_ROLE_OPTIONS.map((o) => (
            <div
              key={o}
              onClick={() => { onValueChange(o); onOtherChange(""); setShowOtherInput(false); setOtherInput(""); setOpenDropdown(false); }}
              className={`cursor-pointer px-3 py-2 transition ${value === o ? "bg-green-100 font-medium text-green-700" : "text-gray-700 hover:bg-gray-100"}`}
            >{o}</div>
          ))}
          <div
            onClick={() => { setShowOtherInput(true); onValueChange("Other"); setOpenDropdown(false); }}
            className="cursor-pointer px-3 py-2 font-medium text-[#49C77F] hover:bg-green-50"
          >+ Other</div>
        </div>
      )}

      {showOtherInput && (
        <div className="mt-2 flex items-center gap-2">
          <input
            autoFocus
            value={otherInput}
            onChange={(e) => setOtherInput(sanitizeName(e.target.value))}
            onKeyDown={(e) => { if (e.key === "Enter") commitOther(); if (e.key === "Escape") cancelOther(); }}
            placeholder="Enter custom job role"
            className={`h-10 flex-1 rounded-md border px-3 text-sm text-[#525252] outline-none focus:border-[#49C77F] ${hasOtherError ? "border-red-400" : "border-[#D9D9D9]"}`}
          />
          <button type="button" onClick={commitOther} className="h-10 rounded-md bg-[#49C77F] px-4 text-sm text-white hover:bg-[#3ab36e] cursor-pointer">Add</button>
          <button type="button" onClick={cancelOther} className="h-10 rounded-md border border-[#CCCCCC] px-4 text-sm text-[#525252] hover:bg-gray-50 cursor-pointer">Cancel</button>
        </div>
      )}
    </div>
  );
}

// ─── Logo Upload ──────────────────────────────────────────────────────────────

function LogoUpload({
  file,
  existingLogoName,
  onChange,
  hasError,
}: {
  file: File | null;
  existingLogoName?: string;
  onChange: (f: File | null) => void;
  hasError?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onChange(f);
    e.target.value = "";
  };

  return (
    <div className={`rounded-lg border bg-white shadow-sm ${hasError ? "border-red-400" : "border-[#CCCCCC]"}`}>
      {file || existingLogoName ? (
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-gray-100 bg-gray-50 text-[#49C77F]">
            <ImageSquare size={20} />
          </span>
          <span className="flex-1 truncate text-sm text-[#525252]">
            {file?.name || existingLogoName}
          </span>
          <button type="button" onClick={() => inputRef.current?.click()} className="flex-shrink-0 rounded-md bg-[#49C77F] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#3ab36e] cursor-pointer">
            Replace
          </button>
          {file && (
            <button type="button" onClick={() => onChange(null)} className="flex-shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
              <X size={15} weight="bold" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-[#49C77F]"><ImageSquare size={20} /></span>
          <span className="flex-1 text-sm text-gray-400">Upload company logo (PNG, JPG, SVG)</span>
          <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-shrink-0 items-center gap-1.5 rounded-md bg-[#49C77F] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#3ab36e] cursor-pointer">
            <UploadSimple size={13} weight="bold" />Upload
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" className="hidden" onChange={handleChange} />
    </div>
  );
}

// ─── Certificates Upload ──────────────────────────────────────────────────────

function CertificatesUpload({
  files,
  existingCertificates,
  onChange,
  hasError,
}: {
  files: File[];
  existingCertificates?: string[];
  onChange: (files: File[]) => void;
  hasError?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (!incoming.length) return;
    const existing = new Set(files.map((f) => `${f.name}-${f.size}`));
    const fresh = incoming.filter((f) => !existing.has(`${f.name}-${f.size}`));
    onChange([...files, ...fresh]);
    e.target.value = "";
  };

  const handleRemove = (index: number) => onChange(files.filter((_, i) => i !== index));

  const FileIcon = ({ file }: { file: File }) =>
    file.type === "application/pdf" ? (
      <FilePdf size={16} className="shrink-0 text-red-400" />
    ) : (
      <ImageSquare size={16} className="shrink-0 text-blue-400" />
    );

  return (
    <div className={`rounded-lg border bg-white shadow-sm ${hasError ? "border-red-400" : "border-[#CCCCCC]"}`}>
      {(existingCertificates?.length || files.length > 0) && (
        <ul className="divide-y divide-gray-100">
          {existingCertificates?.map((certificate) => (
            <li key={certificate} className="flex items-center gap-2 px-4 py-2.5">
              <FilePdf size={16} className="shrink-0 text-red-400" />
              <span className="flex-1 truncate text-sm text-[#525252]">{certificate}</span>
              <span className="shrink-0 text-xs font-medium text-[#49C77F]">
                Existing
              </span>
            </li>
          ))}
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center gap-2 px-4 py-2.5">
              <FileIcon file={file} />
              <span className="flex-1 truncate text-sm text-[#525252]">{file.name}</span>
              <button type="button" onClick={() => handleRemove(i)} className="shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
                <Trash size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-[#49C77F]"><FilePdf size={20} /></span>
        <span className="flex-1 text-sm text-gray-400">
          {files.length === 0 ? "Upload replacement certificate(s)" : `${files.length} new file${files.length > 1 ? "s" : ""} selected`}
        </span>
        <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-shrink-0 items-center gap-1.5 rounded-md bg-[#49C77F] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#3ab36e] cursor-pointer">
          <UploadSimple size={13} weight="bold" />
          {files.length ? "Add More" : "Upload"}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="application/pdf,image/png,image/jpeg,image/jpg" multiple className="hidden" onChange={handleChange} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateCompanyScreen({ onCancel, initialData }: CreateCompanyScreenProps) {
  const { collegeId, placementEmployeeId } = useUser();
  const isEditMode = Boolean(initialData?.id);

  const [form, setForm] = useState<CompanyFormState>({
    ...initialFormState,
    ...(initialData ?? {}),
    companyLogo: null,
    certificates: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // ── Cascade data ──────────────────────────────────────────────────────────
  const [educations, setEducations] = useState<CascadeOption[]>([]);
  const [branches, setBranches] = useState<CascadeOption[]>([]);
  const [academicYears, setAcademicYears] = useState<CascadeOption[]>([]);
  const [loadingEdu, setLoadingEdu] = useState(false);
  const [loadingBranch, setLoadingBranch] = useState(false);
  const [loadingYear, setLoadingYear] = useState(false);
  const educationTypeId = form.educationType?.id;
  const branchId = form.branch?.id;

  // 1️⃣ Fetch education types on mount
  useEffect(() => {
    if (!collegeId) return;
    setLoadingEdu(true);
    fetchEducations(collegeId)
      .then((data) => setEducations(data.map((e) => ({ id: e.collegeEducationId, label: e.collegeEducationType }))))
      .catch(console.error)
      .finally(() => setLoadingEdu(false));
  }, [collegeId]);

  // 2️⃣ Fetch branches when education type changes
  useEffect(() => {
    if (!collegeId || !educationTypeId) { setBranches([]); return; }
    setLoadingBranch(true);
    fetchBranches(collegeId, educationTypeId)
      .then((data) => setBranches(data.map((b) => ({
        id: b.collegeBranchId,
        label: b.collegeBranchCode,
        code: b.collegeBranchCode
      }))))
      .catch(console.error)
      .finally(() => setLoadingBranch(false));
  }, [collegeId, educationTypeId]);

  // 3️⃣ Fetch academic years when branch changes
  useEffect(() => {
    if (!collegeId || !educationTypeId || !branchId) { setAcademicYears([]); return; }
    setLoadingYear(true);
    fetchAcademicYears(collegeId, educationTypeId, branchId)
      .then((data) => setAcademicYears(data.map((y) => ({ id: y.collegeAcademicYearId, label: y.collegeAcademicYear }))))
      .catch(console.error)
      .finally(() => setLoadingYear(false));
  }, [collegeId, educationTypeId, branchId]);

  function set<K extends keyof CompanyFormState>(key: K, value: CompanyFormState[K]) {
    setForm((prev: CompanyFormState) => ({ ...prev, [key]: value }));
    setErrors((prev: FormErrors) => ({ ...prev, [key]: undefined }));
  }

  const handleSave = async () => {
    const errs = validate(form, { isEditMode });
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the errors before saving");
      return;
    }

    if (!collegeId || !placementEmployeeId) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setIsSaving(true);
    try {
      const packageNum = parseFloat(form.annualPackage.replace(/[^0-9.]/g, ""));
      if (isNaN(packageNum)) {
        toast.error("Invalid annual package value");
        throw new Error("Invalid package");
      }

      const skillsArray = form.requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const jobRoleOffered =
        form.jobRole === "Other" ? form.jobRoleOther : form.jobRole;

      const basePayload = {
        companyName: form.companyName,
        companyEmail: form.email,
        companyPhone: form.phone ? `${form.countryCode}${form.phone}` : "",
        companyJobDescription: form.description,
        companyWebsite: form.website,
        jobRoleOffered,
        requiredSkills: skillsArray,
        jobType: form.jobType,       // already the DB enum value e.g. "fulltime"
        workMode: form.workMode,     // already the DB enum value e.g. "hybrid"
        location: form.locations,
        annualPackage: packageNum,
        driveType: form.driveType,   // already the DB enum value e.g. "virtual"
        startDate: form.startDate,
        endDate: form.endDate,
        eligibilityCriteria: form.eligibilityCriteria,
        collegeId,
        collegeBranchId: form.branch!.id,
        collegeAcademicYearId: form.academicYear!.id,
        createdBy: placementEmployeeId,
      };

      if (isEditMode) {
        await updatePlacementCompany({
          ...basePayload,
          placementCompanyIds: initialData?.placementCompanyIds ?? [
            Number(initialData?.id),
          ],
          updatedBy: placementEmployeeId,
          companyLogo: form.companyLogo,
          companyCertificates: form.certificates,
        });
      } else {
        await createPlacementCompany({
          ...basePayload,
          companyLogo: form.companyLogo!,
          companyCertificates: form.certificates,
        });
      }

      toast.success(isEditMode ? "Updated successfully" : "Saved successfully");
      onCancel();
    } catch {
      toast.error(isEditMode ? "Failed to update. Please try again." : "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="m-2 rounded-2xl bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="mt-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#D7D7D7] text-[#333] transition hover:bg-gray-50"
          aria-label="Back"
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#333]">{isEditMode ? "Edit Company" : "Add Company"}</h2>
          <p className="mt-2 text-sm text-gray-500">
            {isEditMode ? "Update the company details below." : "Add a new company to the placement network by providing verified details below."}
          </p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Company Name */}
        <div>
          <SectionLabel required>Company Name</SectionLabel>
          <input
            value={form.companyName}
            onChange={(e) => set("companyName", sanitizeName(e.target.value))}
            placeholder="Enter company name (e.g., Infosys)"
            className={inputCls(!!errors.companyName)}
          />
          <FieldError msg={errors.companyName} />
        </div>

        {/* Email + Phone */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <SectionLabel required>Email Address</SectionLabel>
            <input
              type="text"
              value={form.email}
              onChange={(e) => set("email", sanitizeEmail(e.target.value))}
              placeholder="e.g., info@infosys.com"
              className={inputCls(!!errors.email)}
            />
            <FieldError msg={errors.email} />
          </div>
          <div>
            <SectionLabel>Phone</SectionLabel>
            <div className="grid grid-cols-[88px_1fr] gap-3">
              <input
                value={form.countryCode}
                onChange={(e) => set("countryCode", e.target.value)}
                placeholder="+91"
                className={inputCls()}
              />
              <input
                value={form.phone}
                onChange={(e) => set("phone", sanitizePhone(e.target.value))}
                placeholder="10-digit number"
                inputMode="numeric"
                maxLength={10}
                className={inputCls(!!errors.phone)}
              />
            </div>
            <FieldError msg={errors.phone} />
          </div>
        </div>

        {/* Description */}
        <div>
          <SectionLabel required>Company Job Description</SectionLabel>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Brief about company, e.g., Infosys is a global leader in technology services.."
            className={`min-h-[110px] w-full rounded-lg border px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F] ${errors.description ? "border-red-400" : "border-[#CCCCCC]"
              }`}
          />
          <div className="flex items-start justify-between">
            <FieldError msg={errors.description} />
            <span className="ml-auto text-xs text-gray-400">{form.description.length} chars</span>
          </div>
        </div>

        {/* Website + Job Role */}
        <div className="-mt-2 grid gap-5 md:grid-cols-2">
          <div>
            <SectionLabel required>Website</SectionLabel>
            <input
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://company.com"
              className={inputCls(!!errors.website)}
            />
            <FieldError msg={errors.website} />
          </div>
          <div>
            <SectionLabel required>Job Role Offered</SectionLabel>
            <JobRoleDropdown
              value={form.jobRole}
              otherValue={form.jobRoleOther}
              onValueChange={(v) => { set("jobRole", v); if (v !== "Other") set("jobRoleOther", ""); }}
              onOtherChange={(v) => set("jobRoleOther", v)}
              hasError={!!errors.jobRole}
              hasOtherError={!!errors.jobRoleOther}
            />
            <FieldError msg={errors.jobRole ?? errors.jobRoleOther} />
          </div>
        </div>

        {/* Required Skills + Job Type */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <SectionLabel required>Required Skills</SectionLabel>
            <input
              value={form.requiredSkills}
              onChange={(e) => set("requiredSkills", e.target.value)}
              placeholder="e.g., React, Node.js, SQL"
              className={inputCls(!!errors.requiredSkills)}
            />
            <FieldError msg={errors.requiredSkills} />
          </div>
          <div>
            <SectionLabel required>Job Type</SectionLabel>
            <EnumSelectField
              value={form.jobType}
              onChange={(v) => set("jobType", v)}
              placeholder="Select Job Type"
              options={JOB_TYPE_OPTIONS}
              hasError={!!errors.jobType}
            />
            <FieldError msg={errors.jobType} />
          </div>
        </div>

        {/* Work Mode + Locations */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <SectionLabel required>Work Mode</SectionLabel>
            <EnumSelectField
              value={form.workMode}
              onChange={(v) => set("workMode", v)}
              placeholder="Select Work Mode"
              options={WORK_MODE_OPTIONS}
              hasError={!!errors.workMode}
            />
            <FieldError msg={errors.workMode} />
          </div>
          <div>
            <SectionLabel required>Location(s)</SectionLabel>
            <input
              value={form.locations}
              onChange={(e) => set("locations", sanitizeLocation(e.target.value))}
              placeholder="e.g., Bengaluru, Hyderabad, Pune"
              className={inputCls(!!errors.locations)}
            />
            <FieldError msg={errors.locations} />
          </div>
        </div>

        {/* Annual Package + Drive Type */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <SectionLabel required>Annual Package</SectionLabel>
            <input
              value={form.annualPackage}
              onChange={(e) => set("annualPackage", sanitizePackage(e.target.value))}
              placeholder="e.g., 6 LPA, 12 LPA"
              className={inputCls(!!errors.annualPackage)}
            />
            <FieldError msg={errors.annualPackage} />
          </div>
          <div>
            <SectionLabel required>Drive Type</SectionLabel>
            <EnumSelectField
              value={form.driveType}
              onChange={(v) => set("driveType", v)}
              placeholder="Select Drive Type"
              options={DRIVE_TYPE_OPTIONS}
              hasError={!!errors.driveType}
            />
            <FieldError msg={errors.driveType} />
          </div>
        </div>

        {/* Start Date + End Date */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <SectionLabel required>Start Date</SectionLabel>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className={`${inputCls(!!errors.startDate)} cursor-pointer`}
            />
            <FieldError msg={errors.startDate} />
          </div>
          <div>
            <SectionLabel required>End Date</SectionLabel>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              min={form.startDate || undefined}
              disabled={!form.startDate}
              className={`${inputCls(!!errors.endDate)} cursor-pointer ${!form.startDate ? "cursor-not-allowed opacity-50" : ""}`}
            />
            <FieldError msg={errors.endDate} />
          </div>
        </div>

        {/* Education Type + Branch */}
        <div className="grid gap-5 md:grid-cols-2">
          <CascadeSelect
            label="Education Type"
            required
            placeholder="Select Education Type"
            options={educations}
            value={form.educationType}
            onChange={(opt) => {
              set("educationType", opt);
              set("branch", null);
              set("academicYear", null);
            }}
            loading={loadingEdu}
            hasError={!!errors.educationType}
            errorMsg={errors.educationType}
          />
          <CascadeSelect
            label="Branch"
            required
            placeholder="Select Branch"
            options={branches}
            value={form.branch}
            onChange={(opt) => {
              set("branch", opt);
              set("academicYear", null);
            }}
            disabled={!form.educationType}
            loading={loadingBranch}
            hasError={!!errors.branch}
            errorMsg={errors.branch}
          />
        </div>

        {/* Academic Year + Eligibility Criteria */}
        <div className="grid gap-5 md:grid-cols-2">
          <CascadeSelect
            label="Academic Year"
            required
            placeholder="Select Academic Year"
            options={academicYears}
            value={form.academicYear}
            onChange={(opt) => set("academicYear", opt)}
            disabled={!form.branch}
            loading={loadingYear}
            hasError={!!errors.academicYear}
            errorMsg={errors.academicYear}
          />
          <div>
            <SectionLabel required>Eligibility Criteria</SectionLabel>
            <input
              value={form.eligibilityCriteria}
              onChange={(e) => set("eligibilityCriteria", e.target.value)}
              placeholder="e.g., Min 7.0 CGPA"
              className={inputCls(!!errors.eligibilityCriteria)}
            />
            <FieldError msg={errors.eligibilityCriteria} />
          </div>
        </div>

        {/* Upload Company Logo + Upload Certificate(s) */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <SectionLabel required>Upload Company Logo</SectionLabel>
            <LogoUpload
              file={form.companyLogo}
              existingLogoName={form.existingLogoName}
              onChange={(f) => set("companyLogo", f)}
              hasError={!!errors.companyLogo}
            />
            <FieldError msg={errors.companyLogo} />
          </div>
          <div>
            <SectionLabel required>Upload PDF</SectionLabel>
            <CertificatesUpload
              files={form.certificates}
              existingCertificates={form.existingCertificates}
              onChange={(files) => set("certificates", files)}
              hasError={!!errors.certificates}
            />
            <FieldError msg={errors.certificates} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-4 pt-2 md:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="h-10 cursor-pointer rounded-sm border border-[#CFD6E3] bg-white text-base font-medium text-[#2B2B2B] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 cursor-pointer rounded-sm bg-[#49C77F] text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}
