"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

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
  onSubmitted,
}: {
  onSubmitted: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
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

  const descriptionValue = watch("description") ?? "";

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const existing = JSON.parse(
      localStorage.getItem("internships") || "[]"
    );

    localStorage.setItem(
      "internships",
      JSON.stringify([...existing, data])
    );

    //toast.success("Internship saved successfully");
    alert('Internship saved successfully')
    onSubmitted();
  };

  return (
    <form
      className="mt-6 bg-white rounded-lg mb-10"
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
            placeholder="DD/MM/YYYY"
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
          <label className="text-sm font-medium text-[#282828]">
            End Date
          </label>
          <input
            {...register("endDate")}
            placeholder="DD/MM/YYYY"
            className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.endDate
                ? "border-red-300 focus:ring-red-200"
                : "border-gray-200 focus:ring-emerald-200"
            }`}
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
          <label className="text-sm font-medium text-[#282828]">
            Location
          </label>
          <select
            {...register("location")}
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
          <label className="text-sm font-medium text-[#282828]">
            Domain
          </label>
          <select
            {...register("domain")}
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
            <p className="text-sm text-red-600 mt-1">
              {errors.domain.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-[#282828]">
          Short Description
        </label>
        <textarea
          {...register("description")}
          placeholder="Describe your key responsibilities, achievements, and skills gained during the internship.........."
          maxLength={500}
          className="mt-2 w-full border border-gray-200 rounded px-3 py-2 text-sm min-h-[110px] resize-none outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <div className="text-right text-sm text-gray-400 mt-1">
          {descriptionValue.length}/500
        </div>
      </div>

      <button
        type="submit"
        className="mt-1 bg-[#43C17A] cursor-pointer text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
}