"use client";

import { supabase } from "@/lib/supabaseClient";
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


const EDUCATION_OPTIONS: Record<string, string[]> = {
  Degree: ["B.Sc", "B.Com", "B.A"],
  "B.Tech": ["CSE", "ECE", "EEE"],
  MBA: ["HR", "Finance"],
};

const YEAR_BY_EDU: Record<string, number> = {
  Degree: 3,
  "B.Tech": 4,
  MBA: 2,
};

export default function AddSubject({
  editData,
  editUi,
  onSave,
}: {
  editData: SubjectFormData | null;
  editUi: SubjectUIState | null;
  onSave: (form: SubjectFormData, ui: SubjectUIState) => void;
}) {
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOptions();
  }, [ui.education, ui.branch, ui.year]);


  useEffect(() => {
    if (editData && editUi) {
      setForm(editData);
      setUi(editUi);
    }
  }, [editData, editUi]);

  useEffect(() => {
    if (!editData) {
      setIsSubmitting(false);
    }
  }, [editData]);

  const loadOptions = async () => {
    try {
      const { data: eduData } = await supabase
        .from("college_education")
        .select("collegeEducationId, collegeEducationType")
        .is("isActive", true);

      const selectedEdu = eduData?.find(
        (e) => e.collegeEducationType === ui.education
      );

      const { data: branchData } = selectedEdu
        ? await supabase
          .from("college_branch")
          .select("collegeBranchId, collegeBranchCode")
          .eq("collegeEducationId", selectedEdu.collegeEducationId)
          .is("deletedAt", null)
        : { data: [] };

      const selectedBranch = branchData?.find(
        (b) => b.collegeBranchCode === ui.branch
      );

      const { data: yearData } = selectedBranch
        ? await supabase
          .from("college_academic_year")
          .select("collegeAcademicYearId, collegeAcademicYear")
          .eq("collegeBranchId", selectedBranch.collegeBranchId)
          .is("deletedAt", null)
        : { data: [] };

      const selectedYear = yearData?.find(
        (y) => y.collegeAcademicYear === ui.year
      );

      const { data: semData } = selectedYear
        ? await supabase
          .from("college_semester")
          .select("collegeSemesterId, collegeSemester")
          .eq("collegeAcademicYearId", selectedYear.collegeAcademicYearId)
          .is("deletedAt", null)
        : { data: [] };

      setOptions({
        educations: eduData?.map((e) => ({
          id: e.collegeEducationId,
          label: e.collegeEducationType,
        })) ?? [],
        branches: branchData?.map((b) => ({
          id: b.collegeBranchId,
          label: b.collegeBranchCode,
        })) ?? [],
        years: yearData?.map((y) => ({
          id: y.collegeAcademicYearId,
          label: y.collegeAcademicYear,
        })) ?? [],
        semesters: semData?.map((s) => ({
          id: s.collegeSemesterId,
          label: String(s.collegeSemester),
        })) ?? [],
      });
    } catch {
      toast.error("Failed to load dropdowns");
    }
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // if (name === "subjectName") {
    //   let cleaned = value.replace(/[^a-zA-Z\s-]/g, "");

    //   const parts = cleaned.split("-");
    //   if (parts.length > 2) {
    //     cleaned = parts[0] + "-" + parts.slice(1).join("").replace(/-/g, "");
    //   }
    //   const pascal = cleaned
    //     .toLowerCase()
    //     .replace(/\b\w/g, (c) => c.toUpperCase());

    //   setForm({ ...form, subjectName: pascal });
    //   return;
    // }

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
      let cleaned = value.replace(/[^a-zA-Z\s&-]/g, "");
      cleaned = cleaned.replace(/\s{2,}/g, " ");
      const parts = cleaned.split("-");
      if (parts.length > 2) {
        cleaned = parts[0] + "-" + parts.slice(1).join("").replace(/-/g, "");
      }

      const pascal = cleaned
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const finalParts = pascal.split("-");
      let finalResult = pascal;

      if (finalParts.length === 2) {
        finalResult = finalParts[0] + "-" + finalParts[1].toUpperCase();
      }

      setForm({ ...form, subjectName: finalResult });
      return;
    }
    if (name === "subjectCode") {
      const cleaned = value.replace(/[^a-zA-Z0-9]/g, "");
      setForm({ ...form, subjectCode: cleaned.toUpperCase() });
      return;
    }

    if (name === "subjectKey") {
      const cleaned = value.replace(/[^a-zA-Z]/g, "");
      setForm({ ...form, subjectKey: cleaned.toUpperCase() });
      return;
    }

    if (name === "credits") {
      setForm({ ...form, credits: Number(value) });
      return;
    }

    // if (name === "credits") {
    //   const num = value.replace(/\D/g, ""); // 🔹 allow digits only

    //   if (num === "") {
    //     setForm({ ...form, credits: "" });
    //     return;
    //   }

    //   const creditValue = Math.min(Number(num), 4); // 🔹 cap at 4

    //   setForm({ ...form, credits: creditValue.toString() });
    //   return;
    // }

    // if (name === "education") {
    //   setForm({
    //     ...form,
    //     education: value,
    //     branch: "",
    //     year: "",
    //     semester: "",
    //   });
    //   return;
    // }

    // if (name === "education") {
    //   setUi({
    //     education: value,
    //     branch: "",
    //     year: "",
    //     semester: "",
    //   });
    //   return;
    // }

    setForm({ ...form, [name]: value });
  };

  const years =
    ui.education && YEAR_BY_EDU[ui.education]
      ? Array.from(
        { length: YEAR_BY_EDU[ui.education] },
        (_, i) => `${i + 1} Year`
      )
      : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // if (!form.education)
    //   return toast.error("Please select an Education type");
    // if (!form.branch)
    //   return toast.error("Please select a Branch");
    // if (!form.year)
    //   return toast.error("Please select a Year");
    // if (!form.semester)
    //   return toast.error("Please select a Semester");

    if (!ui.education) return toast.error("Please select Education");
    if (!ui.branch) return toast.error("Please select Branch");
    if (!ui.year) return toast.error("Please select Year");
    if (!ui.semester) return toast.error("Please select Semester");

    if (!form.subjectName.trim())
      return toast.error("Please enter Subject Name");
    if (!form.subjectCode.trim())
      return toast.error("Please enter Subject Code");
    if (!form.subjectKey.trim())
      return toast.error("Please enter Subject Key");
    if (!form.credits)
      return toast.error("Please enter Credits");

    console.log("Subject Payload:", form);
    setIsSubmitting(true);
    onSave(form, ui);
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
              inputMode="text"
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
              inputMode="text"
              // autoComplete="off"
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
              inputMode="text"
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
              value={form.credits}
              onChange={handleChange}
              placeholder="e.g. 4"
              // min={0}
              // max={4}
              step={1}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
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
            className="bg-[#43C17A] cursor-pointer text-white px-10 py-2 rounded-lg font-semibold hover:bg-[#3ab06e]"
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
