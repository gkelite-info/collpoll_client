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
  const [domains, setDomains] = useState<string[]>(DEFAULT_DOMAINS);
  const [showOtherDomain, setShowOtherDomain] = useState(false);
  const [otherDomainValue, setOtherDomainValue] = useState("");

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

  const handleAddOtherDomain = () => {
    const value = otherDomainValue.trim();
    if (!value) {
      toast.error("Please enter a domain before adding.");
      return;
    }
    if (!domains.includes(value)) {
      setDomains((prev) => [...prev, value]);
    }
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
      console.error("Save Error:", error);
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
          <div className="relative">
            <select
              {...register("role")}
              disabled={isSubmitting}
              className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer appearance-none"
            >
              <option value="">Select role</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#525252]">▾</span>
          </div>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
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
          <div className="relative">
            <select
              {...register("location")}
              disabled={isSubmitting}
              className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer appearance-none"
            >
              <option value="">Select location</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#525252]">▾</span>
          </div>
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
        </div>
        <div>
          <FieldLabel label="Domain" required />

          {/* Domain select with + Other option */}
          <div className="relative">
            <select
              {...register("domain")}
              disabled={isSubmitting}
              onChange={(e) => {
                if (e.target.value === "__other__") {
                  setShowOtherDomain(true);
                  setValue("domain", "", { shouldValidate: false });
                } else {
                  setShowOtherDomain(false);
                  setValue("domain", e.target.value, { shouldValidate: true });
                }
              }}
              className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer appearance-none"
            >
              <option value="">Select domain</option>
              {domains.map((d) => <option key={d} value={d}>{d}</option>)}
              <option value="__other__">+ Other</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#525252]">▾</span>
          </div>
          {errors.domain && <p className="text-red-500 text-xs mt-1">{errors.domain.message}</p>}

          {/* Other domain input — shown when + Other is selected */}
          {showOtherDomain && (
            <div className="flex gap-2 items-center mt-2">
              <input
                autoFocus
                value={otherDomainValue}
                onChange={(e) => setOtherDomainValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOtherDomain()}
                placeholder="Enter domain"
                className="flex-1 h-10 px-3 border border-[#D9D9D9] rounded-md text-sm text-[#525252] focus:outline-none focus:border-[#43C17A]"
              />
              <button
                type="button"
                onClick={handleAddOtherDomain}
                className="px-4 h-10 cursor-pointer bg-[#43C17A] text-white text-sm font-medium rounded-md hover:bg-[#16A34A] transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowOtherDomain(false); setOtherDomainValue(""); }}
                className="px-4 h-10 border border-[#CCCCCC] text-[#525252] text-sm font-medium rounded-md cursor-pointer hover:bg-[#F5F5F5] transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Description */}
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

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md text-sm text-white 
            ${isSubmitting ? "bg-[#43C17A]/50 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"}`}
        >
          {isSubmitting ? "Saving..." : "Submit"}
        </button>
      </div>
    </div>
  );
}