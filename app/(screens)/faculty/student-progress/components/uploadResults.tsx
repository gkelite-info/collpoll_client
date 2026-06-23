"use client";

import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft, UploadSimple, X, MicrosoftExcelLogoIcon } from "@phosphor-icons/react";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";

export default function UploadResults() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { collegeEducationType } = useUser();

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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
      const validExtensions = [".xlsx", ".xls", ".csv"];
      const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        alert("Only Excel formats (.xlsx, .xls, .csv) are allowed for results upload.");
        return;
      }
      setExcelFile(file);
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
    sections: facultySections
  } = useFaculty();

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

  useEffect(() => {
    const checkExistingResults = async () => {
      const scheduleIdParam = searchParams.get("collegeExamScheduleId");
      const scheduleId = scheduleIdParam ? Number(scheduleIdParam) : null;
      if (!scheduleId) return;

      let targetSubjectId = facultySections.find(s => s.faculty_subject?.subjectName === subjectParam)?.collegeSubjectId;

      if (!targetSubjectId && formData.branchId) {
        const { data: subData } = await supabase
          .from("college_subjects")
          .select("collegeSubjectId")
          .eq("subjectName", subjectParam)
          .eq("collegeBranchId", Number(formData.branchId))
          .is("deletedAt", null)
          .maybeSingle();
        targetSubjectId = subData?.collegeSubjectId;
      }

      if (!targetSubjectId) return;

      const { count, error } = await supabase
        .from("results")
        .select("*", { count: "exact", head: true })
        .eq("subjectId", targetSubjectId)
        .eq("collegeExamScheduleId", scheduleId)
        .is("deletedAt", null);

      if (!error && count && count > 0) {
        setIsEditMode(true);
        const fileName = "Results.xlsx";
        const dummyFile = new File([""], fileName, {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        setExcelFile(dummyFile);
      }
    };

    if (collegeId && formData.sectionId && formData.academicYearId) {
      checkExistingResults();
    }
  }, [collegeId, formData.sectionId, formData.academicYearId, subjectParam, facultySections, formData.branchId, examTypeParam, searchParams]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = [".xlsx", ".xls", ".csv"];
      const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        alert("Only Excel formats (.xlsx, .xls, .csv) are allowed for results upload.");
        return;
      }
      setExcelFile(file);
    }
  };

  const handleGoBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSubmit = async () => {
    const finalSemesterId = formData.semesterId ? Number(formData.semesterId) : 1;
    const scheduleIdParam = searchParams.get("collegeExamScheduleId");
    const scheduleId = scheduleIdParam ? Number(scheduleIdParam) : null;

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

        const sampleRow = jsonData[0];
        const keys = Object.keys(sampleRow);

        const findKey = (candidates: string[]) => {
          return keys.find(k => candidates.includes(k.toLowerCase().trim()));
        };

        const rollNoKey = findKey(["roll no", "rollno", "student id", "studentid", "pin number", "pinnumber", "student roll no", "register no", "reg no"]);
        const internalKey = findKey(["internal marks", "internalmarks", "internal", "internals"]);
        const externalKey = findKey(["external marks", "externalmarks", "external", "externals"]);
        const totalKey = findKey(["total", "total marks", "totalmarks"]);
        const gradeKey = findKey(["grade", "grade secured", "result grade"]);

        if (!rollNoKey || !gradeKey) {
          toast.error("Excel sheet must contain at least a 'Roll No' (or Student ID) and a 'Grade' column.");
          return;
        }

        const sectionIdNum = Number(formData.sectionId);
        const yearIdNum = Number(formData.academicYearId);

        const { data: historyRows, error: histError } = await supabase
          .from("student_academic_history")
          .select("studentId")
          .eq("collegeSectionsId", sectionIdNum)
          .eq("collegeAcademicYearId", yearIdNum)
          .eq("isCurrent", true)
          .is("deletedAt", null);

        if (histError) throw histError;

        if (!historyRows || historyRows.length === 0) {
          toast.error("No students found currently enrolled in this section/year.");
          return;
        }

        const studentIds = historyRows.map(h => h.studentId);

        const { data: pinRows, error: pinError } = await supabase
          .from("student_pins")
          .select("studentId, pinNumber")
          .in("studentId", studentIds)
          .eq("collegeId", collegeId)
          .eq("isActive", true)
          .is("deletedAt", null);

        if (pinError) throw pinError;

        const pinMap = new Map<string, number>();
        pinRows?.forEach(r => {
          if (r.pinNumber) {
            pinMap.set(r.pinNumber.trim().toUpperCase(), r.studentId);
          }
        });

        let targetSubjectId = facultySections.find(s => s.faculty_subject?.subjectName === subjectParam)?.collegeSubjectId;

        if (!targetSubjectId) {
          const { data: subData } = await supabase
            .from("college_subjects")
            .select("collegeSubjectId")
            .eq("subjectName", subjectParam)
            .eq("collegeBranchId", Number(formData.branchId))
            .is("deletedAt", null)
            .maybeSingle();
          targetSubjectId = subData?.collegeSubjectId;
        }

        if (!targetSubjectId) {
          toast.error(`Could not resolve subject ID for subject "${subjectParam}"`);
          return;
        }

        const resultsToInsert: any[] = [];
        const notFoundRollNos: string[] = [];

        jsonData.forEach(row => {
          const rollVal = String(row[rollNoKey] || "").trim().toUpperCase();
          const studentId = pinMap.get(rollVal);

          if (!studentId) {
            notFoundRollNos.push(rollVal);
            return;
          }

          const internal = Number(row[internalKey || ""] || 0);
          const external = Number(row[externalKey || ""] || 0);
          const total = row[totalKey || ""] !== undefined ? Number(row[totalKey || ""]) : (internal + external);
          const grade = String(row[gradeKey] || "").trim();

          resultsToInsert.push({
            studentId,
            subjectId: targetSubjectId,
            collegeSemesterId: finalSemesterId,
            collegeExamScheduleId: scheduleId,
            internalMarks: internal,
            externalMarks: external,
            total,
            grade,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });

        if (resultsToInsert.length === 0) {
          toast.error("No matching student roll numbers found in the excel sheet.");
          return;
        }

        const targetStudentIds = resultsToInsert.map(r => r.studentId);
        const { error: deleteError } = await supabase
          .from("results")
          .delete()
          .in("studentId", targetStudentIds)
          .eq("subjectId", targetSubjectId)
          .eq("collegeSemesterId", finalSemesterId)
          .eq("collegeExamScheduleId", scheduleId);

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
          .from("results")
          .insert(resultsToInsert);

        if (insertError) throw insertError;

        let message = `Successfully uploaded results for ${resultsToInsert.length} students!`;
        if (notFoundRollNos.length > 0) {
          message += ` Note: ${notFoundRollNos.length} roll numbers were not found in this section: ${notFoundRollNos.join(", ")}`;
        }

        toast.success(message, { duration: 6000 });
        handleGoBack();
      } catch (err: any) {
        console.error("Excel upload error:", err);
        toast.error(`Failed to process results upload: ${err.message || err}`);
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
            <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{collegeEducationType === "Inter" ? "Group" : "Branch"}</span>
              <p className="text-sm font-extrabold text-gray-800 mt-1 truncate">{branchParam}</p>
            </div>
            <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Academic Year</span>
              <p className="text-sm font-extrabold text-gray-800 mt-1 truncate">{yearParam}</p>
            </div>
            <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Section</span>
              <p className="text-sm font-extrabold text-gray-800 mt-1 truncate">Section {sectionParam}</p>
            </div>
          </div>

          {parsedSemesterId ? (
            <div className="bg-[#E6FBEA] text-[#007A48] border border-[#d2f7da] rounded-xl p-3 text-xs font-semibold flex items-center gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#007A48]"></div>
              Target Semester: Semester {parsedSemesterId}
            </div>
          ) : (
            <div className="bg-[#FFF4E5] text-[#FF9800] border border-[#ffe3be] rounded-xl p-3 text-xs font-semibold flex items-center gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></div>
              Semester is not explicitly specified for this exam schedule. Defaulting to general results mapping.
            </div>
          )}
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
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel Upload
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#43C17A] hover:bg-[#38A166] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            disabled={
              !formData.branchId ||
              !formData.academicYearId ||
              (parsedSemesterId && !formData.semesterId) ||
              !formData.sectionId ||
              !excelFile ||
              (isEditMode && excelFile.size === 0)
            }
          >
            {isEditMode ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
