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
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { CaretLeft } from "@phosphor-icons/react";

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
  const isSchoolFromCookie =
    typeof document !== "undefined" &&
    document.cookie
      .split("; ")
      .some((cookie) => cookie === "isSchool=true");

  const [form, setForm] = useState({
    assignmentId: initialData?.assignmentId,
    topicName: initialData?.description || "",
    fromDate: toHtmlDate(initialData?.fromDate),
    toDate: toHtmlDate(initialData?.toDate),
    totalMarks: initialData?.marks ? String(initialData.marks) : "",

    educationTypeId: "",
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
              educationTypeId: String(sectionObj.collegeEducationId || ""),
              subjectId: String(matchedSection.collegeSubjectId),
              branchId: String(sectionObj.collegeBranchId || ""),
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

  const availableEducationTypes = useMemo(() => {
    const map = new Map();
    facultySections.forEach((s) => {
      const sectionObj = getSafe(s.college_sections);
      const eduObj = getSafe(sectionObj?.college_education);
      if (sectionObj && eduObj) {
        map.set(sectionObj.collegeEducationId, eduObj.collegeEducationType);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [facultySections]);

  useEffect(() => {
    if (
      availableEducationTypes.length === 1 &&
      form.educationTypeId !== String(availableEducationTypes[0].id)
    ) {
      setForm((prev) => ({
        ...prev,
        educationTypeId: String(availableEducationTypes[0].id),
      }));
    }
  }, [availableEducationTypes, form.educationTypeId]);

  const isSchool = useMemo(() => {
    if (!form.educationTypeId) {
      return (
        faculty_edu_type
          ?.split(",")
          .some((educationType) => isSchoolEducation(educationType)) === true ||
        isSchoolFromCookie
      );
    }
    const selectedEdu = availableEducationTypes.find(
      (e) => String(e.id) === form.educationTypeId
    );
    if (selectedEdu) {
      return isSchoolEducation(selectedEdu.name);
    }
    return false;
  }, [form.educationTypeId, availableEducationTypes, faculty_edu_type, isSchoolFromCookie]);

  const availableBranches = useMemo(() => {
    if (isSchool || !form.educationTypeId) return [];
    const map = new Map();
    facultySections
      .filter((s) => {
        const sectionObj = getSafe(s.college_sections);
        return String(sectionObj?.collegeEducationId) === form.educationTypeId;
      })
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
  }, [facultySections, form.educationTypeId, isSchool]);

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

  const availableYears = useMemo(() => {
    if (!form.educationTypeId) return [];
    if (!isSchool && !form.branchId) return [];
    const map = new Map();

    facultySections
      .filter((s) => {
        const sectionObj = getSafe(s.college_sections);
        if (String(sectionObj?.collegeEducationId) !== form.educationTypeId) return false;
        return isSchool || sectionObj?.collegeBranchId === Number(form.branchId);
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
  }, [facultySections, form.educationTypeId, form.branchId, isSchool]);

  useEffect(() => {
    if (
      availableYears.length === 1 &&
      form.yearId !== String(availableYears[0].id)
    ) {
      setForm((prev) => ({
        ...prev,
        yearId: String(availableYears[0].id),
      }));
    }
  }, [availableYears, form.yearId]);

  const uniqueSubjects = useMemo(() => {
    if (!form.educationTypeId) return [];
    if (!isSchool && !form.branchId) return [];
    if (!form.yearId) return [];

    const map = new Map();
    facultySections
      .filter((s) => {
        const sectionObj = getSafe(s.college_sections);
        if (String(sectionObj?.collegeEducationId) !== form.educationTypeId) return false;
        const branchMatch = isSchool || sectionObj?.collegeBranchId === Number(form.branchId);
        const yearMatch = s.collegeAcademicYearId === Number(form.yearId);
        return branchMatch && yearMatch;
      })
      .forEach((s) => {
        const subjectObj = getSafe(s.college_subjects);
        if (subjectObj && !map.has(s.collegeSubjectId)) {
          map.set(s.collegeSubjectId, subjectObj.subjectName);
        }
      });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [facultySections, form.educationTypeId, form.branchId, form.yearId, isSchool]);

  useEffect(() => {
    if (
      uniqueSubjects.length === 1 &&
      form.subjectId !== String(uniqueSubjects[0].id)
    ) {
      setForm((prev) => ({
        ...prev,
        subjectId: String(uniqueSubjects[0].id),
      }));
    }
  }, [uniqueSubjects, form.subjectId]);

  const availableSections = useMemo(() => {
    if (!form.educationTypeId || !form.subjectId || (!isSchool && !form.branchId) || !form.yearId) return [];
    const map = new Map();

    facultySections
      .filter((s) => {
        const sectionObj = getSafe(s.college_sections);
        if (String(sectionObj?.collegeEducationId) !== form.educationTypeId) return false;
        return (
          s.collegeSubjectId === Number(form.subjectId) &&
          (isSchool || sectionObj?.collegeBranchId === Number(form.branchId)) &&
          s.collegeAcademicYearId === Number(form.yearId)
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
  }, [facultySections, form.educationTypeId, form.subjectId, form.branchId, form.yearId, isSchool]);

  // ==========================================
  // FIX: ROBUST PRE-SUBMISSION VALIDATION
  // ==========================================
  const validateForm = () => {
    if (!facultyId) {
      toast.error("Faculty ID missing");
      return false;
    }

    if (!form.educationTypeId) {
      toast.error("Please select an Education Type.");
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

    if (!isSchool && !form.branchId) {
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
          collegeBranchId: isSchool ? null : form.branchId,
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
      <div className="mb-6 flex items-center gap-2">
        <button type="button" onClick={onCancel} className="text-gray-900 cursor-pointer p-1">
          <CaretLeft size={24} weight="bold" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit Assignment" : "Add New Assignment"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-4 rounded-xl text-[#282828]">
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Education Type <span className="text-red-500">*</span>
            </label>
            {availableEducationTypes.length === 1 ? (
              <div className="w-full cursor-not-allowed rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-700">
                {availableEducationTypes[0].name}
              </div>
            ) : (
              <CustomDropdown
                value={form.educationTypeId}
                theme="green"
                options={availableEducationTypes.map((edu) => ({ value: edu.id, label: edu.name }))}
                onChange={(val) =>
                  setForm({
                    ...form,
                    educationTypeId: String(val),
                    branchId: "",
                    yearId: "",
                    subjectId: "",
                    sectionIds: [],
                  })
                }
                placeholder="Select Education Type"
              />
            )}
          </div>

          <div className="flex gap-4 mb-4">
            {!isSchool && <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {faculty_edu_type === "Inter" ? "Group" : "Branch"}
              </label>
              {availableBranches.length === 1 ? (
                <div className="w-full cursor-not-allowed rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-700">
                  {availableBranches[0].name}
                </div>
              ) : (
                <CustomDropdown
                  value={form.branchId}
                  theme="green"
                  options={availableBranches.map((b) => ({ value: b.id, label: b.name }))}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      branchId: String(val),
                      yearId: "",
                      subjectId: "",
                      sectionIds: [],
                    })
                  }
                  placeholder="Select Branch"
                />
              )}
            </div>}

            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Year <span className="text-red-500">*</span>
              </label>
              {availableYears.length === 1 ? (
                <div className="w-full cursor-not-allowed rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-700">
                  {availableYears[0].name}
                </div>
              ) : (
                <CustomDropdown
                  value={form.yearId}
                  theme="green"
                  disabled={!isSchool && !form.branchId}
                  options={availableYears.map((y) => ({ value: y.id, label: y.name }))}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      yearId: String(val),
                      subjectId: "",
                      sectionIds: [],
                    })
                  }
                  placeholder={!isSchool && !form.branchId ? "Select branch first" : "Select Year"}
                />
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Subject <span className="text-red-500">*</span>
              </label>
              {uniqueSubjects.length === 1 ? (
                <div className="w-full cursor-not-allowed rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-700">
                  {singleSubjectDisplay}
                </div>
              ) : (
                <CustomDropdown
                  value={form.subjectId}
                  theme="green"
                  disabled={!form.yearId}
                  options={uniqueSubjects.map((s) => ({ value: s.id, label: s.name }))}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      subjectId: String(val),
                      sectionIds: [] as string[],
                    })
                  }
                  placeholder={!form.yearId ? "Select year first" : "Select Subject"}
                />
              )}
            </div>

            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Section <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                value=""
                theme="green"
                isMultiSelect={true}
                selectedValues={form.sectionIds}
                disabled={!form.subjectId}
                options={availableSections.map((s) => ({ value: s.id, label: s.name }))}
                onChange={(val) => {
                  const strVal = String(val);
                  setForm((prev) => ({
                    ...prev,
                    sectionIds: prev.sectionIds.includes(strVal)
                      ? prev.sectionIds.filter((id) => id !== strVal)
                      : [...prev.sectionIds, strVal],
                  }));
                }}
                placeholder={!form.subjectId ? "Select subject first" : "Select section"}
              />
            </div>
          </div>

          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Topic Name <span className="text-red-500">*</span>
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
                Total Marks <span className="text-red-500">*</span>
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
                // onChange={(e) => {
                //   const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                //   setForm({ ...form, totalMarks: value });
                // }}
                onChange={(e) => {
                  let value = e.target.value;

                  if (value.startsWith("0")) {
                    return;
                  }

                  const cleanedValue = value.replace(/\D/g, "").slice(0, 3);

                  setForm({ ...form, totalMarks: cleanedValue });
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Date Assigned <span className="text-red-500">*</span>
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
                Submission Deadline <span className="text-red-500">*</span>
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
