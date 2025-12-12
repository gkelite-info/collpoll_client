// Internships.tsx
"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Plus, Trash } from "@phosphor-icons/react";

/* ---------------------------
   Validation schema (Yup)
   - mark optional fields with notRequired() / nullable()
   --------------------------- */
const schema = yup
  .object({
    organization: yup.string().required("Organization is required"),
    role: yup.string().required("Role is required"),
    startDate: yup.string().notRequired().nullable(),
    endDate: yup.string().notRequired().nullable(),
    projectName: yup.string().notRequired().nullable(),
    projectUrl: yup.string().url("Must be a valid URL").notRequired().nullable(),
    location: yup.string().required(),
    domain: yup.string().required(),
    description: yup.string().max(500, "Max 500 characters").notRequired().nullable(),
  })
  .required();

/* ---------------------------
   Derive strongly-typed form type from schema
   (IMPORTANT: this keeps your schema and TS type in sync)
   --------------------------- */
type FormValues = yup.InferType<typeof schema>;

/* ---------------------------
   Static option arrays
   --------------------------- */
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

export default function Internships() {
  const [items, setItems] = useState<Array<FormValues & { id: number }>>([]);
  const maxDesc = 500;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      organization: "",
      role: roles[0],
      startDate: "",
      endDate: "",
      projectName: "",
      projectUrl: "",
      location: locations[0],
      domain: domains[0],
      description: "",
    },
  });

  const descriptionValue = watch("description") ?? "";

  const onAdd: SubmitHandler<FormValues> = (data) => {
    setItems((prev) => [...prev, { ...data, id: Date.now() }]);
    reset({
      organization: "",
      role: roles[0],
      startDate: "",
      endDate: "",
      projectName: "",
      projectUrl: "",
      location: locations[0],
      domain: domains[0],
      description: "",
    });
  };

  function removeItem(id: number) {
    setItems((s) => s.filter((x) => x.id !== id));
  }

  return (
    <div className="mt-3">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Internships</h2>

          <button
            onClick={handleSubmit(onAdd)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-3 py-1.5 rounded"
            type="button"
            aria-label="Add internship"
            disabled={isSubmitting}
          >
            
            <span className="flex justify-center items-center gap-1">Add <Plus size={14} weight="bold" /></span>
          </button>
        </div>

        <form className="mt-6" onSubmit={handleSubmit(onAdd)} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Organization Name</label>
              <input
                {...register("organization")}
                placeholder="Google"
                className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
                  errors.organization ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-emerald-200"
                }`}
              />
              {errors.organization && (
                <p className="text-sm text-red-600 mt-1">{errors.organization.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Role/Position</label>
              <select
                {...register("role")}
                className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
                  errors.role ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-emerald-200"
                }`}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                {...register("startDate")}
                placeholder="DD/MM/YYYY"
                className="mt-2 w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input
                {...register("endDate")}
                placeholder="DD/MM/YYYY"
                className="mt-2 w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Project Name</label>
              <input
                {...register("projectName")}
                placeholder="Enter the name of the project"
                className="mt-2 w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Project URL</label>
              <input
                {...register("projectUrl")}
                placeholder="https://example.com"
                className={`mt-2 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 ${
                  errors.projectUrl ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-emerald-200"
                }`}
              />
              {errors.projectUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.projectUrl.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <select
                {...register("location")}
                className="mt-2 w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              >
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Domain</label>
              <select
                {...register("domain")}
                className="mt-2 w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Short Description</label>
            <textarea
              {...register("description")}
              placeholder="Describe your key responsibilities, achievements, and skills gained during the internship..."
              maxLength={maxDesc}
              className="mt-2 w-full border border-gray-200 rounded px-3 py-2 text-sm min-h-[110px] resize-none outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {(descriptionValue ?? "").length}/{maxDesc}
            </div>
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">No internships added yet.</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{it.organization}</div>
                  <div className="text-sm text-gray-600">{it.role} • {it.location}</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500">{it.startDate || "—"} - {it.endDate || "—"}</div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                    aria-label="Remove internship"
                  >
                    <Trash size={16} />
                    Remove
                  </button>
                </div>
              </div>

              {it.projectName && (
                <div className="mt-3 text-sm">
                  <div className="font-medium">Project:</div>
                  <div>
                    {it.projectName}
                    {it.projectUrl && (
                      <a className="text-emerald-600 ml-2" href={it.projectUrl} target="_blank" rel="noreferrer">View</a>
                    )}
                  </div>
                </div>
              )}

              {it.description && (
                <div className="mt-3 text-sm text-gray-700">{it.description}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
