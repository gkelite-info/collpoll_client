"use client";

import { FormEvent, useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { Assignment } from "./left";
import { fetchFacultyContext } from "@/lib/helpers/faculty/assignment/fetchFacultyContext";
import { upsertFacultyAssignment } from "@/lib/helpers/faculty/assignment/upsertFacultyAssignment";
import FormSkeleton from "../shimmer/FormSkeleton";
import { useRouter } from "next/navigation";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";

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
  const router = useRouter();
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [facultySections, setFacultySections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { faculty_edu_type } = useFaculty();
  const [sectionSelect, setSectionSelect] = useState("");

  const [form, setForm] = useState({
    assignmentId: initialData?.assignmentId,
    topicName: initialData?.description || "",
    fromDate: toHtmlDate(initialData?.fromDate),
    toDate: toHtmlDate(initialData?.toDate),
    totalMarks: initialData?.marks ? String(initialData.marks) : "",

    subjectId: "",
    branchId: "",
    sectionIds: [] as string[],
    yearId: "",
  });

  const today = new Date().toISOString().split("T")[0];

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
              sectionIds: [String(matchedSection.collegeSectionsId)],
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

  useEffect(() => {
    if (uniqueSubjects.length === 1 && !form.subjectId) {
      setForm((prev) => ({
        ...prev,
        subjectId: String(uniqueSubjects[0].id),
      }));
    }
  }, [uniqueSubjects, form.subjectId]);

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

  useEffect(() => {
    if (
      availableBranches.length === 1 &&
      form.branchId !== String(availableBranches[0].id)
    ) {
      setForm((prev) => ({
        ...prev,
        branchId: String(availableBranches[0].id),
      }));
    }
  }, [availableBranches, form.branchId]);

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
    if (!form.subjectId || !form.branchId || form.sectionIds.length === 0)
      return [];
    const map = new Map();
    facultySections
      .filter((s) => {
        const sectionObj = getSafe(s.college_sections);
        return (
          s.collegeSubjectId === Number(form.subjectId) &&
          sectionObj?.collegeBranchId === Number(form.branchId) &&
          form.sectionIds.includes(String(s.collegeSectionsId))
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
  }, [facultySections, form.subjectId, form.branchId, form.sectionIds]);

  // ==========================================
  // FIX: ROBUST PRE-SUBMISSION VALIDATION
  // ==========================================
  const validateForm = () => {
    if (!facultyId) {
      toast.error("Faculty ID missing");
      return false;
    }

    if (!form.subjectId) {
      toast.error("Please select a Subject.");
      return false;
    }

    // Topic Validation: letters, numbers, spaces, &, :, -
    const topicRegex = /^[A-Za-z0-9\s&:\-]+$/;
    if (!form.topicName.trim()) {
      toast.error("Topic Name is required.");
      return false;
    }
    if (!topicRegex.test(form.topicName.trim())) {
      toast.error(
        "Topic Name can contain only letters, numbers, spaces, &, :, and -",
      );
      return false;
    }

    if (!form.totalMarks) {
      toast.error("Total Marks are required.");
      return false;
    }

    if (!form.branchId) {
      toast.error(
        `Please select a ${faculty_edu_type === "Inter" ? "Group" : "Branch"}.`,
      );
      return false;
    }

    if (form.sectionIds.length === 0) {
      toast.error("Please select at least one Section.");
      return false;
    }

    if (!form.yearId) {
      toast.error("Please select an Academic Year.");
      return false;
    }

    if (!form.fromDate || !form.toDate) {
      toast.error("Both start and end dates are required.");
      return false;
    }

    const fromDateObj = new Date(form.fromDate);
    const toDateObj = new Date(form.toDate);
    const todayObj = new Date(today);

    if (!initialData) {
      if (fromDateObj < todayObj) {
        toast.error("Assigned date cannot be in the past.");
        return false;
      }
      if (toDateObj < todayObj) {
        toast.error("Submission deadline cannot be in the past.");
        return false;
      }
    }

    if (fromDateObj > toDateObj) {
      toast.error("Assigned date must be before the submission deadline.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return; // Stop submission if validation fails

    setIsSaving(true);
    try {
      for (const sectionId of form.sectionIds) {
        const payload = {
          assignmentId: form.assignmentId,
          facultyId: facultyId as number, // Safe due to validation above
          subjectId: form.subjectId,
          topicName: form.topicName.trim(),
          dateAssigned: form.fromDate,
          submissionDeadline: form.toDate,
          collegeBranchId: form.branchId,
          collegeSectionsId: sectionId,
          collegeAcademicYearId: form.yearId,
          marks: form.totalMarks,
        };

        const res = await upsertFacultyAssignment(payload);

        if (!res.success) {
          throw new Error(res.error);
        }
      }

      toast.success("Assignment saved successfully");

      onSave({
        ...initialData,
        description: form.topicName.trim(),
        title: form.topicName.trim(),
        fromDate: form.fromDate,
        toDate: form.toDate,
        marks: form.totalMarks,
      } as Assignment);

      router.push("/faculty/assignments");
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <FormSkeleton />;

  const singleSubjectDisplay =
    uniqueSubjects.length === 1 ? uniqueSubjects[0].name : "";

  return (
    <div className="w-[68%] mx-1 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit Assignment" : "Add New Assignment"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-4 rounded-xl text-[#282828]">
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject
            </label>
            {uniqueSubjects.length === 1 ? (
              <div className="w-full cursor-not-allowed rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-700">
                {singleSubjectDisplay}
              </div>
            ) : (
              <select
                value={form.subjectId}
                required
                onChange={(e) =>
                  setForm({
                    ...form,
                    subjectId: e.target.value,
                    branchId: "",
                    sectionIds: [] as string[],
                    yearId: "",
                  })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
              >
                <option value="">Select Subject</option>
                {uniqueSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Topic Name
              </label>
              <textarea
                value={form.topicName}
                placeholder="e.g., Implementation of Stack and Queue"
                required
                onChange={(e) => {
                  const value = e.target.value;
                  // Optional: Live validation UX
                  if (/^[A-Za-z0-9\s&:\-]*$/.test(value)) {
                    setForm({ ...form, topicName: value });
                  } else {
                    toast.error(
                      "Invalid character entered. Use letters, numbers, spaces, &, :, or -",
                      { id: "topic-char-err" },
                    );
                  }
                }}
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
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
                maxLength={3}
                required
                onWheel={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                  setForm({ ...form, totalMarks: value });
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mb-4 flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {faculty_edu_type === "Inter" ? "Group" : "Branch"}
              </label>
              {availableBranches.length === 1 ? (
                <div className="w-full cursor-not-allowed rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-700">
                  {availableBranches[0].name}
                </div>
              ) : (
                <select
                  value={form.branchId}
                  required
                  disabled={!form.subjectId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      branchId: e.target.value,
                      sectionIds: [],
                      yearId: "",
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 outline-none"
                >
                  <option value="">Select Branch</option>
                  {availableBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-4 flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Section
              </label>

              <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white min-h-[40px] flex flex-wrap gap-2">
                {form.sectionIds.map((id) => {
                  const section = availableSections.find(
                    (s) => String(s.id) === id,
                  );

                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 bg-[#ECFDF5] text-[#065F46] px-3 py-1 rounded-full text-xs"
                    >
                      {section?.name}

                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            sectionIds: prev.sectionIds.filter(
                              (sid) => sid !== id,
                            ),
                          }))
                        }
                        className="text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                <select
                  value={sectionSelect}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return;

                    setForm((prev) => ({
                      ...prev,
                      sectionIds: prev.sectionIds.includes(value)
                        ? prev.sectionIds
                        : [...prev.sectionIds, value],
                    }));

                    setSectionSelect("");
                  }}
                  className="text-sm outline-none flex-1 cursor-pointer text-black"
                >
                  <option value="">Select section</option>

                  {availableSections
                    .filter((s) => !form.sectionIds.includes(String(s.id)))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mb-4 flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Year
              </label>
              <select
                value={form.yearId}
                required
                disabled={form.sectionIds.length === 0}
                onChange={(e) => setForm({ ...form, yearId: e.target.value })}
                className="w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 outline-none"
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

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Date Assigned
              </label>
              <input
                type="date"
                required
                min={today}
                value={form.fromDate}
                onChange={(e) => {
                  const selectedDate = e.target.value;

                  setForm((prev) => ({
                    ...prev,
                    fromDate: selectedDate,
                    toDate:
                      prev.toDate && prev.toDate < selectedDate
                        ? ""
                        : prev.toDate,
                  }));
                }}
                className="w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Submission Deadline
              </label>
              <input
                type="date"
                required
                min={form.fromDate || today}
                value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                className="w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-[#43C17A] font-semibold cursor-pointer text-white py-2 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 border font-semibold cursor-pointer py-2 rounded-md  disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
