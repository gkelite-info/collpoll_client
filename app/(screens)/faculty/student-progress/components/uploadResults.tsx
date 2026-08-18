"use client";

import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft, UploadSimple, X, MicrosoftExcelLogoIcon, SpinnerGap } from "@phosphor-icons/react";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/app/utils/context/UserContext";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { checkFacultyResultsExists } from "@/lib/helpers/faculty/results/checkFacultyResultsExists";
import { uploadFacultyResults } from "@/lib/helpers/faculty/results/uploadFacultyResults";

export default function UploadResults() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { collegeEducationType } = useUser();

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndSetFile = (file: File) => {
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      toast.error("Only Excel formats (.xlsx, .xls, .csv) are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum allowed size is 10MB.");
      return;
    }
    setExcelFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleContainerClick = () => {
    if (!excelFile) {
      fileInputRef.current?.click();
    }
  };

  const [formData, setFormData] = useState({
    academicYearId: "",
    branchId: "",
    semesterId: "",
    sectionId: "",
  });

  const {
    collegeId,
    collegeBranchId,
    college_branch,
    faculty_edu_type,
    sections: facultySections
  } = useFaculty();
  const isSchoolFromCookie =
    typeof document !== "undefined" &&
    document.cookie
      .split("; ")
      .some((cookie) => cookie === "isSchool=true");
  const isSchool =
    isSchoolEducation(collegeEducationType) ||
    faculty_edu_type
      ?.split(",")
      .some((educationType) => isSchoolEducation(educationType)) === true ||
    isSchoolFromCookie;

  const branchParam = searchParams.get("branch") || college_branch || "N/A";
  const yearParam = searchParams.get("year") || "N/A";
  const sectionParam = searchParams.get("section") || "N/A";
  const semParam = searchParams.get("semesterId");
  const parsedSemesterId = semParam && semParam !== "null" && semParam !== "undefined" ? semParam : null;
  const examTypeParam = searchParams.get("examType") || "Exam";
  const subjectParam = searchParams.get("subject") || "N/A";

  useEffect(() => {
    const yearId = searchParams.get("academicYearId");
    const semId = searchParams.get("semesterId");
    const secId = searchParams.get("sectionId");
    const branchId = searchParams.get("branchId") || String(collegeBranchId || "");

    const parsedSemId = semId && semId !== "null" && semId !== "undefined" ? semId : "";

    setFormData({
      academicYearId: yearId || "",
      branchId: branchId || "",
      semesterId: parsedSemId,
      sectionId: secId || "",
    });
  }, [searchParams, collegeBranchId]);

  const scheduleIdParam = searchParams.get("collegeExamScheduleId");
  const scheduleId = scheduleIdParam ? Number(scheduleIdParam) : null;

  const { data: existsData, isFetching: isCheckingExists } = useQuery({
    queryKey: ["checkResultsExists", scheduleId, subjectParam, formData.academicYearId, formData.branchId, isSchool],
    queryFn: async () => {
      if (!scheduleId || !formData.academicYearId) return false;
      return await checkFacultyResultsExists({
        scheduleId: scheduleId as number,
        subjectName: subjectParam,
        collegeAcademicYearId: Number(formData.academicYearId),
        collegeBranchId: formData.branchId ? Number(formData.branchId) : null,
        isSchool
      });
    },
    enabled: !!scheduleId && !!formData.academicYearId && !!collegeId,
  });

  useEffect(() => {
    if (existsData) {
      setIsEditMode(true);
      const dummyFile = new File([""], "Results.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      setExcelFile(dummyFile);
    } else {
      setIsEditMode(false);
    }
  }, [existsData]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleGoBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSuccessRedirect = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "details");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (resultsJson: any[]) => {
      const finalSemesterId = formData.semesterId ? Number(formData.semesterId) : 1;
      return await uploadFacultyResults({
        collegeId: collegeId as number,
        scheduleId: scheduleId as number,
        subjectName: subjectParam,
        collegeAcademicYearId: Number(formData.academicYearId),
        collegeBranchId: formData.branchId ? Number(formData.branchId) : null,
        sectionId: Number(formData.sectionId),
        semesterId: finalSemesterId,
        isSchool,
        resultsJson,
      });
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message, { duration: 6000 });
        queryClient.invalidateQueries({ queryKey: ["facultyResultsOverview"] });
        handleSuccessRedirect();
      } else {
        toast.error(res.message);
      }
    },
    onError: (err: any) => {
      console.error("Upload mutation error:", err);
      toast.error(`Upload failed: ${err?.message || "Unknown error occurred"}`);
    }
  });

  const handleSubmit = async () => {
    if (!scheduleId) {
      toast.error("Exam schedule information is missing.");
      return;
    }

    if (!excelFile || !collegeId || !formData.sectionId || !formData.academicYearId) {
      toast.error("Please fill all required fields and upload the excel file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          toast.error("The excel sheet is empty");
          return;
        }

        // Fix Next.js Server Action serialization error by stripping any hidden prototypes from XLSX
        const plainJsonData = JSON.parse(JSON.stringify(jsonData));

        uploadMutation.mutate(plainJsonData);
      } catch (err: any) {
        console.error("Excel parse error:", err);
        toast.error(`Failed to parse excel file: ${err.message || err}`);
      }
    };

    reader.readAsArrayBuffer(excelFile);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handleGoBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} weight="bold" className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-[#282828] text-2xl font-bold">Results Upload</h1>
          <p className="text-gray-600 text-sm mt-1">Upload and manage class results</p>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-6 space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 font-Outfit">Class & Exam Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject</span>
              <p className="text-sm font-extrabold text-[#004d33] mt-1 truncate">{subjectParam}</p>
            </div>
            <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exam Type</span>
              <p className="text-sm font-extrabold text-gray-800 mt-1 truncate">{examTypeParam}</p>
            </div>
            {!isSchool && <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{collegeEducationType === "Inter" ? "Group" : "Branch"}</span>
              <p className="text-sm font-extrabold text-gray-800 mt-1 truncate">{branchParam}</p>
            </div>}
            <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Academic Year</span>
              <p className="text-sm font-extrabold text-gray-800 mt-1 truncate">{yearParam}</p>
            </div>
            <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Section</span>
              <p className="text-sm font-extrabold text-gray-800 mt-1 truncate">Section {sectionParam}</p>
            </div>
          </div>

          {!isSchool && (parsedSemesterId ? (
            <div className="bg-[#E6FBEA] text-[#007A48] border border-[#d2f7da] rounded-xl p-3 text-xs font-semibold flex items-center gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#007A48]"></div>
              Target Semester: Semester {parsedSemesterId}
            </div>
          ) : (
            <div className="bg-[#FFF4E5] text-[#FF9800] border border-[#ffe3be] rounded-xl p-3 text-xs font-semibold flex items-center gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></div>
              Semester is not explicitly specified for this exam schedule. Defaulting to general results mapping.
            </div>
          ))}
        </div>

        <div className="border-t border-gray-150 my-6"></div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Upload Files</h2>
          <div className="w-full">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MicrosoftExcelLogoIcon size={18} className="text-[#107c41]" weight="fill" />
                Bulk Result Upload <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={handleContainerClick}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed transition-all rounded-xl p-8 flex flex-col items-center justify-center text-center relative group ${excelFile ? "cursor-default" : "cursor-pointer"
                  } ${isDragActive
                    ? "border-[#43C17A] bg-[#E6FBEA]"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-105 transition-transform">
                  <UploadSimple size={24} className="text-gray-500" />
                </div>
                {excelFile ? (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[300px]">{excelFile.name}</p>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExcelFile(null); }}
                      className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1 hover:underline relative z-10 cursor-pointer"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-800">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">Only Excel formats (.xlsx, .xls, .csv)</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-150 my-6"></div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={handleGoBack}
            disabled={uploadMutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel Upload
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#43C17A] hover:bg-[#38A166] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed min-w-[120px]"
            disabled={
              (!isSchool && !formData.branchId) ||
              !formData.academicYearId ||
              (parsedSemesterId && !formData.semesterId) ||
              !formData.sectionId ||
              !excelFile ||
              isCheckingExists ||
              uploadMutation.isPending ||
              (isEditMode && excelFile.size === 0)
            }
          >
            {uploadMutation.isPending ? (
              <>
                <SpinnerGap size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              isEditMode ? "Update Results" : "Submit Results"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
