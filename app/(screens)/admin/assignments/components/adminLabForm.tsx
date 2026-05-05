"use client";

import { CaretLeftIcon, UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchLabManualById,
  saveLabManual,
  uploadLabManualFile,
} from "@/lib/helpers/faculty/facultyLabManualHelper";

type AdminLabFormProps = {
  initialData?: any;
  onSaved?: () => void;
};

type SubjectOption = {
  collegeSubjectId: number;
  subjectName: string;
  subjectCode?: string | null;
  collegeAcademicYearId: number;
  college_academic_year?: {
    collegeAcademicYear?: string | null;
  } | null;
};

type SectionOption = {
  collegeSectionsId: number;
  collegeSections: string;
};

export default function AdminLabForm({ initialData, onSaved }: AdminLabFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { adminId, collegeId, collegeEducationId } = useAdmin();
  const labIdParam = searchParams.get("labId");
  const subjectIdParam = searchParams.get("subjectId");
  const facultyIdParam = searchParams.get("facultyId");
  const branchIdParam = searchParams.get("branchId");
  const yearIdParam = searchParams.get("yearId");

  const [labTitle, setLabTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [loadedInitialData, setLoadedInitialData] = useState<any>(initialData);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subjectSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!collegeId || !collegeEducationId) return;

    const loadSubjects = async () => {
      setSubjectsLoading(true);
      try {
        let query = supabase
          .from("college_subjects")
          .select(`
            collegeSubjectId,
            subjectName,
            subjectCode,
            collegeAcademicYearId,
            college_academic_year:collegeAcademicYearId (
              collegeAcademicYear
            )
          `)
          .eq("collegeId", collegeId)
          .eq("collegeEducationId", collegeEducationId)
          .eq("isActive", true)
          .is("deletedAt", null);

        if (branchIdParam) {
          query = query.eq("collegeBranchId", Number(branchIdParam));
        }

        if (yearIdParam) {
          query = query.eq("collegeAcademicYearId", Number(yearIdParam));
        }

        const { data, error } = await query.order("subjectName", {
          ascending: true,
        });

        if (error) throw error;
        setSubjects((data || []) as SubjectOption[]);
      } catch (error) {
        console.error("Admin lab subjects error:", error);
        toast.error("Failed to load subjects");
      } finally {
        setSubjectsLoading(false);
      }
    };

    loadSubjects();
  }, [branchIdParam, collegeId, collegeEducationId, yearIdParam]);

  useEffect(() => {
    if (!academicYearId || !collegeId || !collegeEducationId) {
      setSections([]);
      return;
    }

    const loadSections = async () => {
      setSectionsLoading(true);
      try {
        const { data, error } = await supabase
          .from("college_sections")
          .select("collegeSectionsId, collegeSections")
          .eq("collegeId", collegeId)
          .eq("collegeEducationId", collegeEducationId)
          .eq("collegeAcademicYearId", Number(academicYearId))
          .eq("isActive", true)
          .is("deletedAt", null)
          .order("collegeSections", { ascending: true });

        if (error) throw error;
        setSections((data || []) as SectionOption[]);
      } catch (error) {
        console.error("Admin lab sections error:", error);
        toast.error("Failed to load sections");
      } finally {
        setSectionsLoading(false);
      }
    };

    loadSections();
  }, [academicYearId, collegeId, collegeEducationId]);

  useEffect(() => {
    setLoadedInitialData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (loadedInitialData || !labIdParam) return;

    const loadLabForEdit = async () => {
      try {
        const lab = await fetchLabManualById(Number(labIdParam));
        setLoadedInitialData({
          labId: lab.labManualId,
          labTitle: lab.labTitle,
          description: lab.description,
          collegeSubjectId: lab.collegeSubjectId,
          collegeAcademicYearId: lab.collegeAcademicYearId,
          collegeSectionsId: lab.collegeSectionsId,
          pdfUrl: lab.pdfUrl,
        });
      } catch (error) {
        console.error("Admin lab edit fetch error:", error);
        toast.error("Failed to load lab manual");
      }
    };

    loadLabForEdit();
  }, [labIdParam, loadedInitialData]);

  useEffect(() => {
    if (!loadedInitialData) return;

    setLabTitle(loadedInitialData.labTitle || "");
    setDescription(loadedInitialData.description || "");
    setSubjectId(String(loadedInitialData.collegeSubjectId || ""));
    setAcademicYearId(String(loadedInitialData.collegeAcademicYearId || ""));
    setSectionId(String(loadedInitialData.collegeSectionsId || ""));
    setExistingFileName(loadedInitialData.pdfUrl?.split("/").pop() || null);
  }, [loadedInitialData]);

  useEffect(() => {
    if (loadedInitialData || !subjectIdParam || subjects.length === 0) return;

    const subject = subjects.find(
      (item) => String(item.collegeSubjectId) === subjectIdParam,
    );
    if (!subject) return;

    setSubjectId(subjectIdParam);
    setAcademicYearId(String(subject.collegeAcademicYearId || yearIdParam || ""));
  }, [loadedInitialData, subjectIdParam, subjects, yearIdParam]);

  const selectedSubject = subjects.find(
    (subject) => String(subject.collegeSubjectId) === subjectId,
  );
  const availableYears = Array.from(
    new Map(
      subjects
        .filter((subject) => subject.collegeAcademicYearId)
        .map((subject) => [
          subject.collegeAcademicYearId,
          {
            id: subject.collegeAcademicYearId,
            label:
              subject.college_academic_year?.collegeAcademicYear ||
              `Year ID: ${subject.collegeAcademicYearId}`,
          },
        ]),
    ).values(),
  );

  const handleSubjectChange = (value: string) => {
    setSubjectId(value);
    const subject = subjects.find(
      (item) => String(item.collegeSubjectId) === value,
    );
    setAcademicYearId(subject?.collegeAcademicYearId ? String(subject.collegeAcademicYearId) : "");
    setSectionId("");
  };

  const openSubjectSelect = () => {
    const select = subjectSelectRef.current as
      | (HTMLSelectElement & { showPicker?: () => void })
      | null;
    if (!select || select.disabled) return;
    select.showPicker?.();
    select.focus();
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "lab");
    params.delete("action");
    params.delete("labId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      toast.error("Please upload a PDF file only.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      toast.error("Please upload a PDF file only.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async () => {
    if (!adminId) return toast.error("Admin session not found");
    if (!labTitle.trim()) return toast.error("Lab title is required");
    if (!subjectId) return toast.error("Subject is required");
    if (!academicYearId) return toast.error("Academic year is required");
    if (!sectionId) return toast.error("Section is required");
    if (!pdfFile && !loadedInitialData) return toast.error("PDF is required");
    if (
      pdfFile &&
      (!facultyIdParam ||
        facultyIdParam === "-" ||
        Number.isNaN(Number(facultyIdParam)))
    ) {
      return toast.error("Faculty is required to upload lab manual PDF");
    }

    try {
      setIsSaving(true);
      setUploadProgress(10);
      let filePath = loadedInitialData?.pdfUrl;

      if (pdfFile) {
        filePath = await uploadLabManualFile(
          pdfFile,
          `faculty_${Number(facultyIdParam)}`,
        );
      }

      setUploadProgress(60);

      await saveLabManual(
        {
          labManualId: loadedInitialData?.labId,
          labTitle,
          description,
          pdfUrl: filePath,
          collegeSubjectId: Number(subjectId),
          collegeAcademicYearId: Number(academicYearId),
          collegeSectionsId: Number(sectionId),
        },
        {
          id: adminId,
          role: "admin",
        },
      );

      setUploadProgress(100);

      toast.success(
        loadedInitialData
          ? "Lab manual updated successfully"
          : "Lab manual uploaded successfully",
      );
      onSaved?.();
      handleBack();
    } catch (error) {
      console.error("Admin lab save error:", error);
      toast.error("Failed to save lab manual");
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-[68%] h-full p-2 flex flex-col">
      <div className="flex items-start gap-3 mb-6">
        <button onClick={handleBack} className="transition-colors cursor-pointer lg:mt-1">
          <CaretLeftIcon size={22} weight="bold" className="text-black" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#282828]">
            {loadedInitialData ? "Edit Lab Manual" : "Upload Lab Manual"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload a PDF lab manual for your assigned sections
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-5 bg-white rounded-md p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#282828]">
            Lab Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={labTitle}
            onChange={(e) => {
              const value = e.target.value;
              setLabTitle(value.charAt(0).toUpperCase() + value.slice(1));
            }}
            placeholder="e.g. Experiment 3"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#282828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#282828]">
              Subject <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                ref={subjectSelectRef}
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={subjectsLoading || !!subjectIdParam}
                className="sr-only"
              >
                <option value="">
                  {subjectsLoading ? "Loading..." : "Select subject"}
                </option>
                {subjects.map((subject) => (
                  <option
                    key={subject.collegeSubjectId}
                    value={subject.collegeSubjectId}
                  >
                    {subject.subjectName}
                  </option>
                  ))}
              </select>
              <div
                onClick={openSubjectSelect}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-8 text-sm text-[#282828] bg-white focus-within:ring-2 focus-within:ring-[#43C17A] cursor-pointer disabled:bg-gray-50"
              >
                <div className="overflow-x-auto whitespace-nowrap scrollbar-thin">
                  {selectedSubject?.subjectName ||
                    (subjectsLoading ? "Loading..." : "Select subject")}
                </div>
              </div>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#282828]">
              Year <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={academicYearId}
                onChange={(e) => {
                  setAcademicYearId(e.target.value);
                  setSectionId("");
                }}
                disabled={!subjectId || sectionsLoading}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#282828] bg-white focus:outline-none appearance-none cursor-pointer disabled:bg-gray-50"
              >
                <option value="">Select year</option>
                {availableYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#282828]">
              Section <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!academicYearId || sectionsLoading}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#282828] bg-white focus:outline-none appearance-none cursor-pointer disabled:bg-gray-50"
              >
                <option value="">Select section</option>
                {sections.map((section) => (
                  <option
                    key={section.collegeSectionsId}
                    value={section.collegeSectionsId}
                  >
                    {section.collegeSections}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#282828]">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              const value = e.target.value;
              setDescription(value.charAt(0).toUpperCase() + value.slice(1));
            }}
            placeholder="Briefly describe the objective of this lab"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#282828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#43C17A] transition-all resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#282828]">
            Lab Manual PDF <span className="text-red-500">*</span>
          </label>

          {pdfFile ? (
            <div className="w-full border border-[#43C17A]/30 bg-[#F0FFF7] rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D5FFE7] flex items-center justify-center flex-shrink-0">
                <UploadSimpleIcon size={22} className="text-[#43C17A]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#282828] truncate">
                  {pdfFile.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatFileSize(pdfFile.size)}
                </p>

                {isSaving && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-[#43C17A] h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {!isSaving && (
                <button
                  onClick={() => setPdfFile(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                >
                  <XIcon size={16} weight="bold" className="text-red-500 cursor-pointer" />
                </button>
              )}
            </div>
          ) : existingFileName ? (
            <div className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                <UploadSimpleIcon size={22} className="text-gray-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#282828] truncate">
                  {existingFileName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Already uploaded
                </p>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-12 px-6 cursor-pointer transition-all ${
                isDragging
                  ? "border-[#43C17A] bg-[#F0FFF7]"
                  : "border-gray-200 bg-[#FAFAFA] hover:border-[#43C17A] hover:bg-[#F7FFFE]"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                  isDragging ? "bg-[#D5FFE7]" : "bg-[#F0F4F8]"
                }`}
              >
                <UploadSimpleIcon
                  size={28}
                  className={isDragging ? "text-[#43C17A]" : "text-[#94A3B8]"}
                />
              </div>

              <p className="text-sm font-semibold text-[#282828] mb-1">
                Drag & drop your PDF here
              </p>
              <p className="text-xs text-gray-400 mb-4">
                or click to browse from your computer
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 pb-4">
          <button
            onClick={handleBack}
            className="px-6 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#282828] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg bg-[#16284F] text-sm font-medium text-white hover:bg-[#102040] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSaving
              ? loadedInitialData
                ? "Updating..."
                : "Uploading..."
              : loadedInitialData
                ? "Update Lab Manual"
                : "Upload Lab Manual"}
          </button>
        </div>
      </div>
    </div>
  );
}
