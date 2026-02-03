"use client";

import { FormEvent, useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { Assignment } from "./left";
import { fetchFacultyContext } from "@/lib/helpers/faculty/assignment/fetchFacultyContext";
import { upsertFacultyAssignment } from "@/lib/helpers/faculty/assignment/upsertFacultyAssignment";
import FormSkeleton from "../shimmer/FormSkeleton";

type Props = {
  initialData?: Assignment | null;
  onSave: (data: Assignment) => void;
  onCancel: () => void;
};

const getSafe = (data: any) => (Array.isArray(data) ? data[0] : data) || {};

function toHtmlDate(dateStr: string | number | undefined) {
  if (!dateStr) return "";
  const str = dateStr.toString();
  if (/^\d{8}$/.test(str)) {
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }
  return str;
}

export default function AssignmentForm({
  initialData,
  onSave,
  onCancel,
}: Props) {
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [facultySections, setFacultySections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    assignmentId: initialData?.assignmentId,
    topicName: initialData?.description || "",
    fromDate: toHtmlDate(initialData?.fromDate),
    toDate: toHtmlDate(initialData?.toDate),
    totalMarks: initialData?.marks ? String(initialData.marks) : "",

    subjectId: "",
    branchId: "",
    sectionId: "",
    yearId: "",
  });

  useEffect(() => {
    const loadContext = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error("Not authenticated");

        const { data: userRecord } = await supabase
          .from("users")
          .select("userId")
          .eq("auth_id", auth.user.id)
          .single();

        if (!userRecord) throw new Error("User record not found");

        const context = await fetchFacultyContext(userRecord.userId);

        setFacultyId(context.facultyId);
        setFacultySections(context.sections);

        if (initialData?.sectionId && context.sections.length > 0) {
          const matchedSection = context.sections.find(
            (s: any) => s.collegeSectionsId === Number(initialData.sectionId),
          );

          if (matchedSection) {
            const sectionObj = getSafe(matchedSection.college_sections);

            setForm((prev) => ({
              ...prev,
              subjectId: String(matchedSection.collegeSubjectId),
              branchId: String(sectionObj.collegeBranchId),
              sectionId: String(matchedSection.collegeSectionsId),
              yearId: String(matchedSection.collegeAcademicYearId),
            }));
          }
        }
      } catch (err: any) {
        console.error("Context Load Error:", err);
        toast.error("Failed to load faculty details");
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, [initialData]);

  const uniqueSubjects = useMemo(() => {
    const map = new Map();
    facultySections.forEach((s) => {
      const subjectObj = getSafe(s.college_subjects);
      if (subjectObj && !map.has(s.collegeSubjectId)) {
        map.set(s.collegeSubjectId, subjectObj.subjectName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [facultySections]);

  const availableBranches = useMemo(() => {
    if (!form.subjectId) return [];
    const map = new Map();
    facultySections
      .filter((s) => s.collegeSubjectId === Number(form.subjectId))
      .forEach((s) => {
        const sectionObj = getSafe(s.college_sections);
        const branchObj = getSafe(sectionObj?.college_branch);

        if (sectionObj && branchObj) {
          const bId = sectionObj.collegeBranchId;
          const bName = branchObj.collegeBranchCode;
          if (!map.has(bId)) map.set(bId, bName);
        }
      });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [facultySections, form.subjectId]);

  const availableSections = useMemo(() => {
    if (!form.subjectId || !form.branchId) return [];
    const map = new Map();
    facultySections
      .filter((s) => {
        const sectionObj = getSafe(s.college_sections);
        return (
          s.collegeSubjectId === Number(form.subjectId) &&
          sectionObj?.collegeBranchId === Number(form.branchId)
        );
      })
      .forEach((s) => {
        const sectionObj = getSafe(s.college_sections);
        if (sectionObj) {
          const secId = s.collegeSectionsId;
          const secName = sectionObj.collegeSections;
          if (!map.has(secId)) map.set(secId, secName);
        }
      });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [facultySections, form.subjectId, form.branchId]);

  const availableYears = useMemo(() => {
    if (!form.subjectId || !form.branchId || !form.sectionId) return [];
    const map = new Map();
    facultySections
      .filter((s) => {
        const sectionObj = getSafe(s.college_sections);
        return (
          s.collegeSubjectId === Number(form.subjectId) &&
          sectionObj?.collegeBranchId === Number(form.branchId) &&
          s.collegeSectionsId === Number(form.sectionId)
        );
      })
      .forEach((s) => {
        const yearObj = getSafe(s.college_academic_year);
        if (yearObj) {
          const yId = s.collegeAcademicYearId;
          const yName = yearObj.collegeAcademicYear;
          if (!map.has(yId)) map.set(yId, yName);
        }
      });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [facultySections, form.subjectId, form.branchId, form.sectionId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!facultyId) return toast.error("Faculty ID missing");

    const payload = {
      assignmentId: form.assignmentId,
      facultyId: facultyId,
      subjectId: form.subjectId,
      topicName: form.topicName,
      dateAssigned: form.fromDate,
      submissionDeadline: form.toDate,
      collegeBranchId: form.branchId,
      collegeSectionsId: form.sectionId,
      collegeAcademicYearId: form.yearId,
      marks: form.totalMarks,
    };

    const res = await upsertFacultyAssignment(payload);

    if (res.success) {
      toast.success(res.message || "Operation completed successfully.");
      onSave({
        ...initialData,
        assignmentId: res.data ? res.data[0]?.assignmentId : undefined,
        description: form.topicName,
        title: form.topicName,
        fromDate: form.fromDate,
        toDate: form.toDate,
        marks: form.totalMarks,
      } as Assignment);
    } else {
      toast.error(res.error);
    }
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="w-[68%] mx-1 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit Assignment" : "Add New Assignment"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-4 rounded-xl text-[#282828]">
          {/* Subject */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              value={form.subjectId}
              required
              onChange={(e) =>
                setForm({
                  ...form,
                  subjectId: e.target.value,
                  branchId: "",
                  sectionId: "",
                  yearId: "",
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select Subject</option>
              {uniqueSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic & Marks */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Topic Name
              </label>
              <textarea
                value={form.topicName}
                placeholder="e.g., Implementation of Stack and Queue"
                required
                onChange={(e) =>
                  setForm({ ...form, topicName: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Total Marks
              </label>
              <input
                value={form.totalMarks}
                type="number"
                placeholder="e.g., 100"
                required
                onChange={(e) =>
                  setForm({ ...form, totalMarks: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Branch, Section, Year */}
          <div className="flex gap-4">
            <div className="mb-4 flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Branch
              </label>
              <select
                value={form.branchId}
                required
                disabled={!form.subjectId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    branchId: e.target.value,
                    sectionId: "",
                    yearId: "",
                  })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              >
                <option value="">Select Branch</option>
                {availableBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Section
              </label>
              <select
                value={form.sectionId}
                required
                disabled={!form.branchId}
                onChange={(e) =>
                  setForm({ ...form, sectionId: e.target.value, yearId: "" })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              >
                <option value="">Select Section</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Year
              </label>
              <select
                value={form.yearId}
                required
                disabled={!form.sectionId}
                onChange={(e) => setForm({ ...form, yearId: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              >
                <option value="">Select Year</option>
                {availableYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Date Assigned
              </label>
              <input
                type="date"
                required
                value={form.fromDate}
                onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Submission Deadline
              </label>
              <input
                type="date"
                required
                value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-[#43C17A] cursor-pointer text-white py-2 rounded-md hover:bg-green-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border cursor-pointer py-2 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
