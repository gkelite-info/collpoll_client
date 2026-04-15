"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { upsertResumeInternship } from "@/lib/helpers/student/Resume/resumeInternshipsAPI";
import { useState } from "react";

export interface InternshipFormData {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  projectName: string;
  projectUrl: string;
  location: string;
  domain: string;
  description: string;
}

const schema = yup.object({
  organization: yup.string().required("Organization is required"),
  role: yup.string().required("Role is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().optional().default(""),
  projectName: yup.string().optional().default(""),
  projectUrl: yup
    .string()
    .optional()
    .default("")
    .test("url-or-empty", "Must be a valid URL", (val) => {
      if (!val || val.trim() === "") return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }),
  location: yup.string().required("Location is required"),
  domain: yup.string().required("Domain is required"),
  description: yup.string().max(500, "Max 500 characters").optional().default(""),
});

type FormValues = yup.InferType<typeof schema>;

const ROLES = [
  "Software Developer Intern",
  "Frontend Intern",
  "Backend Intern",
  "Data Science Intern",
  "Mobile Developer Intern",
];

const LOCATIONS = ["Bangalore", "Hyderabad", "Chennai", "Mumbai", "Remote"];

const DEFAULT_DOMAINS = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
];

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-[#282828] mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

/** Reusable: renders a select that, when a custom value is active, shows a badge inside the box */
function SelectWithCustomBadge({
  value,
  options,
  placeholder,
  isCustom,
  showOther,
  otherValue,
  disabled,
  onSelectChange,
  onOtherChange,
  onOtherKeyDown,
  onOtherAdd,
  onOtherCancel,
  onBadgeClear,
  otherPlaceholder,
  error,
  register,
  fieldName,
}: {
  value: string;
  options: string[];
  placeholder: string;
  isCustom: boolean;
  showOther: boolean;
  otherValue: string;
  disabled: boolean;
  onSelectChange: (val: string) => void;
  onOtherChange: (val: string) => void;
  onOtherKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtherAdd: () => void;
  onOtherCancel: () => void;
  onBadgeClear: () => void;
  otherPlaceholder: string;
  error?: string;
  register: any;
  fieldName: string;
}) {
  return (
    <div>
      <div className="relative">
        {isCustom && !showOther ? (
          /* Custom value active — show badge inside a select-styled box */
          <div className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 flex items-center justify-between min-h-[38px]">
            <div className="flex items-center gap-2 px-2 py-0.5 bg-green-50 border border-[#43C17A] rounded-md">
              <span className="text-sm text-[#282828]">{value}</span>
              <button
                type="button"
                onClick={onBadgeClear}
                className="text-gray-400 hover:text-red-500 text-xs cursor-pointer leading-none"
              >
                ✕
              </button>
            </div>
            <span className="text-[#525252] ml-2">▾</span>
          </div>
        ) : (
          /* Normal select */
          <>
            <select
              {...register(fieldName)}
              disabled={disabled}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSelectChange(e.target.value)}
              className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer appearance-none"
            >
              <option value="">{placeholder}</option>
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
              <option value="__other__">+ Other</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#525252]">▾</span>
          </>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* "Other" inline input */}
      {showOther && (
        <div className="flex gap-2 items-center mt-2">
          <input
            autoFocus
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            onKeyDown={onOtherKeyDown}
            placeholder={otherPlaceholder}
            className="flex-1 h-10 px-3 border border-[#D9D9D9] rounded-md text-sm text-[#525252] focus:outline-none focus:border-[#43C17A]"
          />
          <button
            type="button"
            onClick={onOtherAdd}
            className="px-4 h-10 cursor-pointer bg-[#43C17A] text-white text-sm font-medium rounded-md hover:bg-[#16A34A] transition"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onOtherCancel}
            className="px-4 h-10 border border-[#CCCCCC] text-[#525252] text-sm font-medium rounded-md cursor-pointer hover:bg-[#F5F5F5] transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function InternshipForm({
  studentId,
  onSubmitted,
  initialData,
  internshipId,
}: {
  studentId: number;
  onSubmitted: (data: InternshipFormData, dbId?: number) => void;
  initialData?: InternshipFormData;
  internshipId?: number;
}) {
  const [showOtherDomain, setShowOtherDomain] = useState(false);
  const [otherDomainValue, setOtherDomainValue] = useState("");
  const [showOtherRole, setShowOtherRole] = useState(false);
  const [otherRoleValue, setOtherRoleValue] = useState("");
  const [showOtherLocation, setShowOtherLocation] = useState(false);
  const [otherLocationValue, setOtherLocationValue] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      organization: "",
      role: "",
      startDate: "",
      endDate: "",
      projectName: "",
      projectUrl: "",
      location: "",
      domain: "",
      description: "",
    },
  });

  const startDateValue = watch("startDate");
  const descriptionValue = watch("description") ?? "";
  const watchedRole = watch("role");
  const watchedLocation = watch("location");
  const watchedDomain = watch("domain");

  /* ── Role helpers ── */
  const handleRoleSelectChange = (val: string) => {
    if (val === "__other__") {
      setShowOtherRole(true);
      setValue("role", "", { shouldValidate: false });
    } else {
      setShowOtherRole(false);
      setValue("role", val, { shouldValidate: true });
    }
  };
  const handleAddOtherRole = () => {
    const value = otherRoleValue.trim();
    if (!value) { toast.error("Please enter a role before adding."); return; }
    setValue("role", value, { shouldValidate: true });
    setOtherRoleValue("");
    setShowOtherRole(false);
  };

  /* ── Location helpers ── */
  const handleLocationSelectChange = (val: string) => {
    if (val === "__other__") {
      setShowOtherLocation(true);
      setValue("location", "", { shouldValidate: false });
    } else {
      setShowOtherLocation(false);
      setValue("location", val, { shouldValidate: true });
    }
  };
  const handleAddOtherLocation = () => {
    const value = otherLocationValue.trim();
    if (!value) { toast.error("Please enter a location before adding."); return; }
    setValue("location", value, { shouldValidate: true });
    setOtherLocationValue("");
    setShowOtherLocation(false);
  };

  /* ── Domain helpers ── */
  const handleDomainSelectChange = (val: string) => {
    if (val === "__other__") {
      setShowOtherDomain(true);
      setValue("domain", "", { shouldValidate: false });
    } else {
      setShowOtherDomain(false);
      setValue("domain", val, { shouldValidate: true });
    }
  };
  const handleAddOtherDomain = () => {
    const value = otherDomainValue.trim();
    if (!value) { toast.error("Please enter a domain before adding."); return; }
    setValue("domain", value, { shouldValidate: true });
    setOtherDomainValue("");
    setShowOtherDomain(false);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const result = await upsertResumeInternship({
        resumeInternshipId: internshipId,
        studentId,
        organizationName: data.organization,
        role: data.role,
        startDate: data.startDate,
        endDate: data.endDate || null,
        projectName: data.projectName || null,
        projectUrl: data.projectUrl || null,
        location: data.location,
        domain: data.domain,
        description: data.description || null,
      });

      toast.success(internshipId ? "Internship updated successfully" : "Internship saved successfully");
      onSubmitted(data as InternshipFormData, result.resumeInternshipId);
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <div className="mt-4 space-y-4">

      {/* Row 1: Organization | Role */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Organization Name" required />
          <input
            {...register("organization")}
            placeholder="Organization Name"
            disabled={isSubmitting}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
          {errors.organization && <p className="text-red-500 text-xs mt-1">{errors.organization.message}</p>}
        </div>
        <div>
          <FieldLabel label="Role / Position" required />
          <SelectWithCustomBadge
            value={watchedRole}
            options={ROLES}
            placeholder="Select role"
            isCustom={!!watchedRole && !ROLES.includes(watchedRole)}
            showOther={showOtherRole}
            otherValue={otherRoleValue}
            disabled={isSubmitting}
            onSelectChange={handleRoleSelectChange}
            onOtherChange={setOtherRoleValue}
            onOtherKeyDown={(e) => e.key === "Enter" && handleAddOtherRole()}
            onOtherAdd={handleAddOtherRole}
            onOtherCancel={() => { setShowOtherRole(false); setOtherRoleValue(""); }}
            onBadgeClear={() => setValue("role", "", { shouldValidate: false })}
            otherPlaceholder="Enter role"
            error={errors.role?.message}
            register={register}
            fieldName="role"
          />
        </div>
      </div>

      {/* Row 2: Start Date | End Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Start Date" required />
          <input
            {...register("startDate")}
            type="date"
            disabled={isSubmitting}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer"
          />
          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <FieldLabel label="End Date" />
          <input
            {...register("endDate")}
            type="date"
            disabled={isSubmitting || !startDateValue}
            min={startDateValue}
            className={`w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer ${!startDateValue ? "bg-gray-50 cursor-not-allowed" : ""}`}
          />
          {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
        </div>
      </div>

      {/* Row 3: Project Name | Project URL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Project Name" />
          <input
            {...register("projectName")}
            placeholder="Enter the name of the project"
            disabled={isSubmitting}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div>
          <FieldLabel label="Project URL" />
          <input
            {...register("projectUrl")}
            placeholder="Project URL"
            disabled={isSubmitting}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
          {errors.projectUrl && <p className="text-red-500 text-xs mt-1">{errors.projectUrl.message}</p>}
        </div>
      </div>

      {/* Row 4: Location | Domain */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Location" required />
          <SelectWithCustomBadge
            value={watchedLocation}
            options={LOCATIONS}
            placeholder="Select location"
            isCustom={!!watchedLocation && !LOCATIONS.includes(watchedLocation)}
            showOther={showOtherLocation}
            otherValue={otherLocationValue}
            disabled={isSubmitting}
            onSelectChange={handleLocationSelectChange}
            onOtherChange={setOtherLocationValue}
            onOtherKeyDown={(e) => e.key === "Enter" && handleAddOtherLocation()}
            onOtherAdd={handleAddOtherLocation}
            onOtherCancel={() => { setShowOtherLocation(false); setOtherLocationValue(""); }}
            onBadgeClear={() => setValue("location", "", { shouldValidate: false })}
            otherPlaceholder="Enter location"
            error={errors.location?.message}
            register={register}
            fieldName="location"
          />
        </div>
        <div>
          <FieldLabel label="Domain" required />
          <SelectWithCustomBadge
            value={watchedDomain}
            options={DEFAULT_DOMAINS}
            placeholder="Select domain"
            isCustom={!!watchedDomain && !DEFAULT_DOMAINS.includes(watchedDomain)}
            showOther={showOtherDomain}
            otherValue={otherDomainValue}
            disabled={isSubmitting}
            onSelectChange={handleDomainSelectChange}
            onOtherChange={setOtherDomainValue}
            onOtherKeyDown={(e) => e.key === "Enter" && handleAddOtherDomain()}
            onOtherAdd={handleAddOtherDomain}
            onOtherCancel={() => { setShowOtherDomain(false); setOtherDomainValue(""); }}
            onBadgeClear={() => setValue("domain", "", { shouldValidate: false })}
            otherPlaceholder="Enter domain"
            error={errors.domain?.message}
            register={register}
            fieldName="domain"
          />
        </div>
      </div>
      <div>
        <FieldLabel label="Short Description" />
        <textarea
          {...register("description")}
          disabled={isSubmitting}
          placeholder="Describe your key responsibilities, achievements, and skills gained during the internship.........."
          rows={4}
          maxLength={500}
          className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{descriptionValue.length}/500</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md text-sm text-white 
            ${isSubmitting ? "bg-[#43C17A]/50 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"}`}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}