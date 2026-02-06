"use client";

import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchSubjectOptions } from "@/lib/helpers/admin/academicSetup/subjectDropdownsAPI";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export type SubjectFormData = {
  id?: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  subjectName: string;
  subjectCode: string;
  subjectKey: string;
  credits: number;
};

export type SubjectUIState = {
  education: string;
  branch: string;
  year: string;
  semester: string;
};

export default function AddSubject({
  editData,
  editUi,
  onSave,
  onFormReady,
}: {
  editData: SubjectFormData | null;
  editUi: SubjectUIState | null;
  onSave: (form: SubjectFormData, ui: SubjectUIState) => Promise<void>;
  onFormReady?: () => void;
}) {
  const { userId } = useUser();
  const [form, setForm] = useState<SubjectFormData>({
    collegeEducationId: 0,
    collegeBranchId: 0,
    collegeAcademicYearId: 0,
    collegeSemesterId: 0,
    subjectName: "",
    subjectCode: "",
    subjectKey: "",
    credits: 0,
  });

  const [ui, setUi] = useState<SubjectUIState>({
    education: "",
    branch: "",
    year: "",
    semester: "",
  });

  const [options, setOptions] = useState({
    educations: [] as { id: number; label: string }[],
    branches: [] as { id: number; label: string }[],
    years: [] as { id: number; label: string }[],
    semesters: [] as { id: number; label: string }[],
  });

  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOptions = async () => {
    if (!userId) return;
    setIsLoadingOptions(true);
    try {
      const { collegeId } = await fetchAdminContext(userId);
      const newOptions = await fetchSubjectOptions(collegeId, ui);
      setOptions(newOptions);
    } catch {
      toast.error("Failed to load dropdowns");
    } finally {
      setIsLoadingOptions(false);
      if (onFormReady) onFormReady();
    }
  };

  useEffect(() => {
    loadOptions();
  }, [ui.education, ui.branch, ui.year]);

  useEffect(() => {
    if (editData && editUi) {
      setForm(editData);
      setUi(editUi);
    }
  }, [editData, editUi]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (["education", "branch", "year", "semester"].includes(name)) {
      setUi((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "education" && { branch: "", year: "", semester: "" }),
        ...(name === "branch" && { year: "", semester: "" }),
        ...(name === "year" && { semester: "" }),
      }));
      return;
    }

    if (name === "subjectName") {
      let cleaned = value.replace(/[^a-zA-Z\s&-]/g, "").replace(/\s{2,}/g, " ");
      const parts = cleaned.split("-");
      if (parts.length > 2)
        cleaned = parts[0] + "-" + parts.slice(1).join("").replace(/-/g, "");
      const pascal = cleaned
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const finalParts = pascal.split("-");
      let finalResult = pascal;
      if (finalParts.length === 2)
        finalResult = finalParts[0] + "-" + finalParts[1].toUpperCase();
      setForm({ ...form, subjectName: finalResult });
      return;
    }
    if (name === "subjectCode") {
      setForm({
        ...form,
        subjectCode: value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      });
      return;
    }
    if (name === "subjectKey") {
      setForm({
        ...form,
        subjectKey: value.replace(/[^a-zA-Z]/g, "").toUpperCase(),
      });
      return;
    }
    if (name === "credits") {
      const numValue = value === "" ? 0 : Number(value);
      setForm({ ...form, credits: numValue });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ui.education) return toast.error("Please select Education");
    if (!ui.branch) return toast.error("Please select Branch");
    if (!ui.year) return toast.error("Please select Year");
    if (!ui.semester) return toast.error("Please select Semester");

    if (!form.subjectName.trim())
      return toast.error("Please enter Subject Name");
    if (!form.subjectCode.trim())
      return toast.error("Please enter Subject Code");
    if (!form.subjectKey.trim()) return toast.error("Please enter Subject Key");
    if (!form.credits) return toast.error("Please enter Credits");

    setIsSubmitting(true);

    try {
      await onSave(form, ui);
    } catch (error) {
      console.error("Save error in form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-8 rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Education Type
            </label>
            <select
              name="education"
              value={ui.education}
              onChange={handleChange}
              className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer px-4 py-2 rounded-lg w-full"
            >
              <option value="">Select Education</option>
              {options.educations.map((e) => (
                <option key={e.id}>{e.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Branch Type
            </label>
            <select
              name="branch"
              value={ui.branch}
              onChange={handleChange}
              disabled={!ui.education}
              className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer px-4 py-2 rounded-lg w-full"
            >
              <option value="">Select Branch</option>
              {ui.education &&
                options.branches.map((b) => (
                  <option key={b.id}>{b.label}</option>
                ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Year
            </label>
            <select
              name="year"
              value={ui.year}
              onChange={handleChange}
              className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer px-4 py-2 rounded-lg w-full"
            >
              <option value="">Select Year</option>
              {options.years.map((y) => (
                <option key={y.id}>{y.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Semester
            </label>
            <select
              name="semester"
              value={ui.semester}
              onChange={handleChange}
              className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer px-4 py-2 rounded-lg w-full"
            >
              <option value="">Select Semester</option>
              {options.semesters.map((s) => (
                <option key={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Subject Name
            </label>
            <input
              name="subjectName"
              value={form.subjectName}
              onChange={handleChange}
              placeholder="e.g. Data Structures"
              className="text-[#16284F] border border-[#CCCCCC] outline-none px-4 py-2 rounded-lg w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Subject Code
            </label>
            <input
              name="subjectCode"
              value={form.subjectCode}
              onChange={handleChange}
              placeholder="e.g. CS201"
              className="text-[#16284F] border border-[#CCCCCC] outline-none px-4 py-2 rounded-lg w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Subject Key
            </label>
            <input
              name="subjectKey"
              value={form.subjectKey}
              onChange={handleChange}
              placeholder="e.g. DS"
              className="text-[#16284F] border border-[#CCCCCC] outline-none px-4 py-2 rounded-lg w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Credits
            </label>
            <input
              type="number"
              name="credits"
              onChange={handleChange}
              value={form.credits === 0 ? "" : form.credits}
              onFocus={(e) => e.target.select()}
              placeholder="e.g. 4"
              step={1}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key))
                  e.preventDefault();
              }}
              onWheel={(e) => e.currentTarget.blur()}
              className="text-[#16284F] border border-[#CCCCCC] outline-none px-4 py-2 rounded-lg w-full"
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#43C17A] cursor-pointer text-white px-10 py-2 rounded-lg font-semibold hover:bg-[#3ab06e] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? editData
                ? "Updating..."
                : "Saving..."
              : editData
                ? "Update Subject"
                : "Save Subject"}
          </button>
        </div>
      </form>
    </div>
  );
}
