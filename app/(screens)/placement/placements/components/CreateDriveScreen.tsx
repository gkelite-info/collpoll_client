"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CaretDown, CaretLeft } from "@phosphor-icons/react";

type CreateDriveScreenProps = {
  onCancel: () => void;
};

type DriveFormState = {
  driveName: string;
  company: string;
  driveDate: string;
  educationType: string;
  branches: string;
  year: string;
  eligibilityCriteria: string;
  packageRange: string;
};

const initialState: DriveFormState = {
  driveName: "",
  company: "",
  driveDate: "",
  educationType: "B.Tech",
  branches: "",
  year: "",
  eligibilityCriteria: "",
  packageRange: "",
};

export default function CreateDriveScreen({ onCancel }: CreateDriveScreenProps) {
  const [form, setForm] = useState<DriveFormState>(initialState);
  const [isCreating, setIsCreating] = useState(false);

  const handleChange = (key: keyof DriveFormState, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.driveName.trim()) {
      toast.error("Drive name is required");
      return;
    }

    setIsCreating(true);
    window.setTimeout(() => {
      toast.success("Drive created");
      onCancel();
    }, 400);
  };

  return (
    <div className="m-2 rounded-2xl bg-white p-8 shadow-sm">
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
          <h2 className="text-2xl font-bold text-[#333]">Create New Drive</h2>
          <p className="mt-2 text-sm text-gray-500">
            Add a new placement drive by providing verified recruitment details below.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Drive Name
          </label>
          <input
            value={form.driveName}
            onChange={(event) => handleChange("driveName", event.target.value)}
            placeholder="e.g., Infosys Campus Drive 2026"
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Company
          </label>
          <input
            value={form.company}
            onChange={(event) => handleChange("company", event.target.value)}
            placeholder="Enter Company Name"
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Drive Date
          </label>
          <input
            value={form.driveDate}
            onChange={(event) => handleChange("driveDate", event.target.value)}
            placeholder="DD/MM/YYYY"
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Education Type
          </label>
          <input
            value={form.educationType}
            onChange={(event) => handleChange("educationType", event.target.value)}
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Branche(s)
          </label>
          <div className="relative">
            <input
              value={form.branches}
              onChange={(event) => handleChange("branches", event.target.value)}
              placeholder="Select Branches"
              className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 pr-10 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
            />
            <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Year
          </label>
          <div className="relative">
            <input
              value={form.year}
              onChange={(event) => handleChange("year", event.target.value)}
              placeholder="Select Year"
              className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 pr-10 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
            />
            <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Eligibility Criteria
          </label>
          <input
            value={form.eligibilityCriteria}
            onChange={(event) =>
              handleChange("eligibilityCriteria", event.target.value)
            }
            placeholder="e.g., Min 7.0 CGPA"
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Package Range
          </label>
          <input
            value={form.packageRange}
            onChange={(event) => handleChange("packageRange", event.target.value)}
            placeholder="e.g., ₹8.0 LPA"
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_140px_140px]">
        <div />
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="h-10 cursor-pointer rounded-sm border border-[#D6DCE5] bg-white text-[14px] font-medium text-[#333333] disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isCreating}
          className="h-10 cursor-pointer rounded-sm bg-[#49C77F] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isCreating ? "Creating..." : "Create Drive"}
        </button>
      </div>
    </div>
  );
}
