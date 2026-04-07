"use client";

import { Input, TextArea } from "@/app/utils/ReusableComponents";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  addEmployment,
  updateEmployment,
  deleteEmployment,
} from "@/lib/helpers/profile/employment";
import ConfirmDeleteModal from "@/app/components/campusBuzz/ConfirmDeleteModal";

export default function EmploymentForm({
  index,
  data,
  studentId,
  onSuccess,
}: {
  index: number;
  data: any;
  studentId: number;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    companyName: data?.companyName ?? "",
    designation: data?.designation ?? "",
    experienceYears: data?.experienceYears ?? "",   // ✅ plain number
    experienceMonths: data?.experienceMonths ?? "", // ✅ plain number
    from: data?.startDate ?? "",
    to: data?.endDate === null ? "current" : data?.endDate ?? "",
    description: data?.description ?? "",
  });

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.companyName.trim()) return "Company Name is required";
    if (!form.designation.trim()) return "Designation is required";
    if (form.experienceYears === "") return "Please enter experience in years";
    if (!form.from) return "Start date is required";
    if (!form.to) return "Select end date or mark as currently working";
    if (form.to !== "current" && form.to > today)
      return "End date cannot be in the future";
    if (form.to !== "current" && form.to < form.from)
      return "End date cannot be before start date";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      studentId,
      companyName: form.companyName,
      designation: form.designation,
      experienceYears: Number(form.experienceYears) || 0, // ✅
      experienceMonths: Number(form.experienceMonths) || 0, // ✅
      startDate: form.from,
      endDate: form.to === "current" ? null : form.to,
      description: form.description,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (data?.employmentId) {
        await updateEmployment(data.employmentId, payload);
        toast.success(`Employment ${index + 1} updated`);
      } else {
        await addEmployment({ ...payload, createdAt: new Date().toISOString() });
        toast.success(`Employment ${index + 1} submitted`);
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting employment:", error);
      toast.error(error.message || "Failed to save employment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!data?.employmentId) return;
    try {
      setIsDeleting(true);
      await deleteEmployment(data.employmentId);
      toast.success("Employment deleted successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete employment");
    } finally {
      setIsDeleting(false);
      setOpenDelete(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-[#282828]">
          Employment {index + 1}
        </h3>
        {data?.employmentId && (
          <button
            onClick={() => setOpenDelete(true)}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 cursor-pointer"
          >
            <span className="block w-3 h-[3px] bg-white rounded-full" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Company Name"
          name="companyName"
          value={form.companyName}
          onChange={handleChange}
          placeholder="e.g. Google, Infosys"
        />
        <Input
          label="Designation"
          name="designation"
          value={form.designation}
          onChange={handleChange}
          placeholder="e.g. Software Engineer"
        />

        <div className="md:col-span-2">
          <p className="text-sm font-medium mb-2 text-[#282828]">
            Total Work Experience
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Years"
              name="experienceYears"
              type="number"
              value={form.experienceYears}
              onChange={(e: any) => {
                const val = Math.max(0, Math.min(50, Number(e.target.value)));
                setForm({ ...form, experienceYears: String(val) });
              }}
              placeholder="e.g. 2"
              min="0"
              max="50"
            />
            <Input
              label="Months"
              name="experienceMonths"
              type="number"
              value={form.experienceMonths}
              onChange={(e: any) => {
                const val = Math.max(0, Math.min(11, Number(e.target.value)));
                setForm({ ...form, experienceMonths: String(val) });
              }}
              placeholder="e.g. 6"
              min="0"
              max="11"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm font-medium mb-2 text-[#282828]">
            Working Since
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="From"
              name="from"
              type="date"
              value={form.from}
              onChange={handleChange}
            />
            <div className="flex flex-col gap-2">
              <Input
                label="To"
                name="to"
                type="date"
                value={form.to === "current" ? "" : form.to}
                onChange={handleChange}
                disabled={form.to === "current"}
              />
              <label className="flex items-center gap-2 text-sm text-[#282828] cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={form.to === "current"}
                  onChange={(e) =>
                    setForm({ ...form, to: e.target.checked ? "current" : "" })
                  }
                  className="accent-[#43C17A] w-4 h-4 cursor-pointer"
                />
                Currently Working Here
              </label>
            </div>
          </div>
        </div>

        <TextArea
          label="Short Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Explain your role, key contributions, and skills..."
        />

        <div className="md:col-span-2 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#43C17A] cursor-pointer text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        open={openDelete}
        title="Delete Employment"
        description="Are you sure you want to delete this employment?"
        onCancel={() => setOpenDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}