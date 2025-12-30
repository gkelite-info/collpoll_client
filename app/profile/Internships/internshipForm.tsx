"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import {
  createInternshipAction,
  updateInternshipAction,
} from "@/lib/helpers/profile/actions/internship.actions";
import { InternshipInsert } from "@/lib/helpers/profile/types";

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
  endDate: yup.string().required("End date is required"),
  projectName: yup.string().required("Project name is required"),
  projectUrl: yup
    .string()
    .url("Must be a valid URL")
    .required("Project URL is required"),
  location: yup.string().required("Location is required"),
  domain: yup.string().required("Domain is required"),
  description: yup.string().max(500, "Max 500 characters").default(""),
});

type FormValues = yup.InferType<typeof schema>;

const roles = [
  "Software Developer Intern",
  "Frontend Intern",
  "Backend Intern",
  "Data Science Intern",
  "Mobile Developer Intern",
];

const locations = ["Bangalore", "Hyderabad", "Chennai", "Mumbai", "Remote"];
const domains = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
];

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
  const {
    register,
    handleSubmit,
    watch,
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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const now = new Date().toISOString();

      const startIso = new Date(data.startDate).toISOString();
      const endIso = new Date(data.endDate).toISOString();

      const payloadBase = {
        studentId: studentId,
        organizationName: data.organization,
        role: data.role,
        startDate: startIso,
        endDate: endIso,
        projectName: data.projectName,
        projectUrl: data.projectUrl,
        location: data.location,
        domain: data.domain,
        description: data.description || "",
        isDeleted: false,
      };

      let resultId = internshipId;

      if (internshipId) {
        const updatePayload: any = {
          ...payloadBase,
          updatedAt: now,
        };
        await updateInternshipAction(internshipId, updatePayload);
        toast.success("Internship updated successfully");
      } else {
        // --- CREATE ---
        const insertPayload: any = {
          ...payloadBase,
          createdAt: now,
          updatedAt: now,
        };

        const result = await createInternshipAction(insertPayload);

        const savedData = result as any;
        resultId =
          savedData.internshipId ||
          savedData.id ||
          (Array.isArray(savedData) && savedData[0]?.internshipId);

        toast.success("Internship saved successfully");
      }

      onSubmitted(data as InternshipFormData, resultId);
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(`Failed to save: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <form
      className="mt-6 bg-white rounded-lg mb-10 text-black"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[#282828]">
            Organization Name
          </label>
          <input
            {...register("organization")}
            placeholder="Enter Org"
            disabled={isSubmitting}
            className={`mt-2 w-full border border-[#CCCCCC] rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.organization
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-emerald-200"
            }`}
          />
          {errors.organization && (
            <p className="text-sm text-red-600 mt-1">
              {errors.organization.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#282828]">
            Role / Position
          </label>
          <select
            {...register("role")}
            disabled={isSubmitting}
            className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.role
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-emerald-200"
            }`}
          >
            <option value="">Select role</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#282828]">
            Start Date
          </label>
          <input
            {...register("startDate")}
            type="date"
            disabled={isSubmitting}
            className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.startDate
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-emerald-200"
            }`}
          />
          {errors.startDate && (
            <p className="text-sm text-red-600 mt-1">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#282828]">End Date</label>
          <input
            {...register("endDate")}
            type="date"
            disabled={isSubmitting || !startDateValue}
            min={startDateValue}
            className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.endDate
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-emerald-200"
            } ${!startDateValue ? "bg-gray-50 cursor-not-allowed" : ""}`}
          />
          {errors.endDate && (
            <p className="text-sm text-red-600 mt-1">
              {errors.endDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#282828]">
            Project Name
          </label>
          <input
            {...register("projectName")}
            disabled={isSubmitting}
            placeholder="Enter Project Name"
            className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.projectName
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-emerald-200"
            }`}
          />
          {errors.projectName && (
            <p className="text-sm text-red-600 mt-1">
              {errors.projectName.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#282828]">
            Project URL
          </label>
          <input
            {...register("projectUrl")}
            disabled={isSubmitting}
            placeholder="Enter Project URL"
            className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.projectUrl
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-emerald-200"
            }`}
          />
          {errors.projectUrl && (
            <p className="text-sm text-red-600 mt-1">
              {errors.projectUrl.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#282828]">Location</label>
          <select
            {...register("location")}
            disabled={isSubmitting}
            className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.location
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-emerald-200"
            }`}
          >
            <option value="">Select location</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {errors.location && (
            <p className="text-sm text-red-600 mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[#282828]">Domain</label>
          <select
            {...register("domain")}
            disabled={isSubmitting}
            className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.domain
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-emerald-200"
            }`}
          >
            <option value="">Select domain</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.domain && (
            <p className="text-sm text-red-600 mt-1">{errors.domain.message}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-[#282828]">
          Short Description
        </label>
        <textarea
          {...register("description")}
          disabled={isSubmitting}
          placeholder="Describe your key responsibilities..."
          maxLength={500}
          className="mt-2 w-full border border-gray-200 rounded px-3 py-2 text-sm min-h-[110px] resize-none outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <div className="text-right text-sm text-gray-400 mt-1">
          {descriptionValue.length}/500
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-1 text-white px-4 py-2 rounded transition-all ${
          isSubmitting
            ? "bg-emerald-300 cursor-not-allowed"
            : "bg-[#43C17A] cursor-pointer hover:bg-emerald-600"
        }`}
      >
        {isSubmitting ? "Saving..." : "Submit"}
      </button>
    </form>
  );
}
