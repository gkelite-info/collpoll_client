"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CaretDown, CaretLeft } from "@phosphor-icons/react";

type AddSelectedStudentScreenProps = {
  onCancel: () => void;
};

type StudentFormState = {
  studentName: string;
  studentId: string;
  branch: string;
  year: string;
  company: string;
  role: string;
  package: string;
  joiningDate: string;
};

const initialState: StudentFormState = {
  studentName: "",
  studentId: "",
  branch: "",
  year: "",
  company: "",
  role: "",
  package: "",
  joiningDate: "",
};

export default function AddSelectedStudentScreen({
  onCancel,
}: AddSelectedStudentScreenProps) {
  const [form, setForm] = useState<StudentFormState>(initialState);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (key: keyof StudentFormState, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSave = () => {
    if (!form.studentName.trim()) {
      toast.error("Student name is required");
      return;
    }

    setIsSaving(true);
    window.setTimeout(() => {
      toast.success("Student added");
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
          <h2 className="text-2xl font-bold text-[#333]">
            Add Selected Student
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Add a selected student to placement records by providing verified details below.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Student Name
          </label>
          <input
            value={form.studentName}
            onChange={(event) => handleChange("studentName", event.target.value)}
            placeholder="Enter Student Name"
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Student ID
          </label>
          <input
            value={form.studentId}
            onChange={(event) => handleChange("studentId", event.target.value)}
            placeholder="Enter Student ID"
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Branch
          </label>
          <div className="relative">
            <input
              value={form.branch}
              onChange={(event) => handleChange("branch", event.target.value)}
              placeholder="Select Branch"
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
            Company
          </label>
          <input
            value={form.company}
            onChange={(event) => handleChange("company", event.target.value)}
            placeholder="e.g., Infosys"
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Role
          </label>
          <div className="relative">
            <input
              value={form.role}
              onChange={(event) => handleChange("role", event.target.value)}
              placeholder="Select Role"
              className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 pr-10 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
            />
            <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Package
          </label>
          <input
            value={form.package}
            onChange={(event) => handleChange("package", event.target.value)}
            placeholder="e.g., ₹6.5 LPA"
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[15px] font-semibold text-[#282828]">
            Joining Date
          </label>
          <input
            value={form.joiningDate}
            onChange={(event) => handleChange("joiningDate", event.target.value)}
            placeholder="DD/MM/YYYY"
            className="w-full rounded-lg border border-[#CCCCCC] px-4 py-2.5 text-sm text-[#525252] shadow-sm outline-none placeholder:text-gray-400 focus:border-[#49C77F]"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_154px_154px]">
        <div />
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="h-10 cursor-pointer rounded-sm border border-[#D6DCE5] bg-white text-[16px] font-medium text-[#333333] disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-10 cursor-pointer rounded-sm bg-[#49C77F] text-[16px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
