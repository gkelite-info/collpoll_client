"use client";

import { CaretDown, MagnifyingGlass, UploadSimple, CalendarBlank } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchTransferStudentByRollNo,
  hasTransferTcNoForAnotherStudent,
} from "@/lib/helpers/accountant/transferCertificatesAPI";

export type TransferCertificateData = {
  collegeTcId?: number;
  studentId?: number;
  rollNo: string;
  admissionNo: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  course: string;
  subCourse: string;
  courseYear: string;
  academicYear: string;
  batchCode: string;

  tcNo: string;
  date: string;
  classAtLeaving: string;
  dateOfAdmission: string;
  dateOfLeaving: string;
  dateOfBirth: string;
  conductRemarks: string;
  reasonForLeaving: string;
  belongsToScStBc: string;
  receiptOfScholarship: string;
  otherRemarks?: string;
};

const inputClass =
  "h-10 rounded-md border border-[#D7DEE8] bg-white px-3 text-[13px] font-medium text-[#17213D] outline-none placeholder:text-[#8A96A8] w-full focus:border-[#43C17A] transition-colors relative";

const selectClass =
  "h-10 rounded-md border border-[#D7DEE8] bg-white px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] transition-colors cursor-pointer pr-10 appearance-none";

const fieldLabelClass = "flex min-h-[38px] items-end gap-0.5 text-[12px] font-bold text-[#17213D]";

function RequiredMark() {
  return <span className="text-[#EF4444]">*</span>;
}

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const maybeError = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    return [maybeError.message, maybeError.details, maybeError.hint, maybeError.code]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .join(" ");
  }

  return String(error);
}

const romanYearLabels = ["I Year", "II Year", "III Year", "IV Year"];

function getCourseYearLimit(educationType: string) {
  const normalized = educationType.toLowerCase();

  if (normalized.includes("inter") || normalized.includes("intermediate")) return 2;
  if (normalized.includes("degree")) return 3;
  if (
    normalized.includes("b.tech") ||
    normalized.includes("btech") ||
    normalized.includes("bachelor of technology")
  ) {
    return 4;
  }

  return 4;
}

function getRomanYearFromValue(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("iv year") || normalized.includes("4th year")) return "IV Year";
  if (normalized.includes("iii year") || normalized.includes("3rd year")) return "III Year";
  if (normalized.includes("ii year") || normalized.includes("2nd year")) return "II Year";
  if (normalized.includes("i year") || normalized.includes("1st year")) return "I Year";

  return "";
}

function buildClassAtLeavingValue(yearLabel: string, course: string, subCourse: string) {
  return [yearLabel, course, subCourse].map((value) => value.trim()).filter(Boolean).join(" ");
}

export function TransferCreateForm({
  initialCertificate,
  onCancel,
  onUploadHeader,
}: {
  initialCertificate?: Partial<TransferCertificateData> | null;
  onCancel: () => void;
  onPreview: (data: TransferCertificateData) => void;
  onUploadHeader: (data: TransferCertificateData) => Promise<void> | void;
}) {
  const { collegeId } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  // Student Details State
  const [studentId, setStudentId] = useState<number | null>(null);
  const [rollNo, setRollNo] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [studentName, setStudentName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [course, setCourse] = useState("");
  const [subCourse, setSubCourse] = useState("");
  const [courseYear, setCourseYear] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [batchCode, setBatchCode] = useState("");

  // TC Details State
  const [tcNo, setTcNo] = useState("");
  const [date, setDate] = useState(getTodayIsoDate);
  const [classAtLeaving, setClassAtLeaving] = useState("");
  const [dateOfAdmission, setDateOfAdmission] = useState("");
  const [dateOfLeaving, setDateOfLeaving] = useState(getTodayIsoDate);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [conductRemarks, setConductRemarks] = useState("Good");
  const [reasonForLeaving, setReasonForLeaving] = useState("Higher Studies");
  const [belongsToScStBc, setBelongsToScStBc] = useState("BC-B");
  const [receiptOfScholarship, setReceiptOfScholarship] = useState("Yes");
  const [otherRemarks, setOtherRemarks] = useState("");
  const classAtLeavingOptions = useMemo(() => {
    const yearLimit = getCourseYearLimit(course);

    return romanYearLabels.slice(0, yearLimit).map((yearLabel) => ({
      label: buildClassAtLeavingValue(yearLabel, course, subCourse),
      value: buildClassAtLeavingValue(yearLabel, course, subCourse),
    }));
  }, [course, subCourse]);

  // Auto set classLeaving when course/subCourse/courseYear change
  useEffect(() => {
    if (!classAtLeavingOptions.length) return;

    const matchingOption = classAtLeavingOptions.find((option) => option.value === classAtLeaving);

    if (matchingOption) return;

    const yearLabel = getRomanYearFromValue(courseYear || classAtLeaving);
    const preferredOption =
      classAtLeavingOptions.find((option) => option.value.startsWith(yearLabel)) ??
      classAtLeavingOptions[0];

    if (preferredOption) {
      setClassAtLeaving(preferredOption.value);
    }
  }, [classAtLeaving, classAtLeavingOptions, courseYear]);

  // Load initial certificate data if editing
  useEffect(() => {
    if (initialCertificate) {
      setStudentId(initialCertificate.studentId ?? null);
      setRollNo(initialCertificate.rollNo ?? "");
      setAdmissionNo(initialCertificate.admissionNo ?? "");
      setStudentName(initialCertificate.studentName ?? "");
      setFatherName(initialCertificate.fatherName ?? "");
      setMotherName(initialCertificate.motherName ?? "");
      setCourse(initialCertificate.course ?? "");
      setSubCourse(initialCertificate.subCourse ?? "");
      setCourseYear(initialCertificate.courseYear ?? "");
      setAcademicYear(initialCertificate.academicYear ?? "");
      setBatchCode(initialCertificate.batchCode ?? "");

      setTcNo(initialCertificate.tcNo ?? "");
      if (initialCertificate.date) setDate(initialCertificate.date);
      setClassAtLeaving(
        initialCertificate.classAtLeaving
          ? buildClassAtLeavingValue(
              getRomanYearFromValue(initialCertificate.classAtLeaving) || initialCertificate.courseYear || "",
              initialCertificate.course ?? "",
              initialCertificate.subCourse ?? "",
            )
          : "",
      );
      if (initialCertificate.dateOfAdmission) setDateOfAdmission(initialCertificate.dateOfAdmission);
      if (initialCertificate.dateOfLeaving) setDateOfLeaving(initialCertificate.dateOfLeaving);
      if (initialCertificate.dateOfBirth) setDateOfBirth(initialCertificate.dateOfBirth);
      setConductRemarks(initialCertificate.conductRemarks ?? "Good");
      setReasonForLeaving(initialCertificate.reasonForLeaving ?? "Higher Studies");
      setBelongsToScStBc(initialCertificate.belongsToScStBc ?? "BC-B");
      setReceiptOfScholarship(initialCertificate.receiptOfScholarship ?? "Yes");
      setOtherRemarks(initialCertificate.otherRemarks ?? "");
    }
  }, [initialCertificate]);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      toast.error("Please enter roll number or admission number.");
      return;
    }

    setIsFetching(true);
    try {
      const student = await fetchTransferStudentByRollNo({
        collegeId: collegeId ?? 0,
        rollNo: query,
      });

      if (!student) {
        toast.error("No active student found for this roll number.");
        return;
      }

      setStudentId(student.studentId);
      setRollNo(student.rollNo);
      setAdmissionNo(student.admissionNo);
      setStudentName(student.studentName);
      setFatherName(student.fatherName);
      setMotherName(student.motherName);
      setCourse(student.course);
      setSubCourse(student.subCourse);
      setCourseYear(student.courseYear);
      setAcademicYear(student.academicYear);
      setBatchCode(student.batchCode);
      if (student.dateOfBirth) setDateOfBirth(student.dateOfBirth);
      setClassAtLeaving(
        buildClassAtLeavingValue(
          getRomanYearFromValue(student.courseYear) || "I Year",
          student.course,
          student.subCourse,
        ),
      );

      toast.success("Student details fetched successfully!");
    } catch (err) {
      const message = getErrorMessage(err);
      console.error("Failed to query transfer certificate student details", message, err);
      toast.error(message || "Failed to query student details.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setStudentId(null);
    setRollNo("");
    setAdmissionNo("");
    setStudentName("");
    setFatherName("");
    setMotherName("");
    setCourse("");
    setSubCourse("");
    setCourseYear("");
    setAcademicYear("");
    setBatchCode("");
  };

  const buildTransferCertificateData = (): TransferCertificateData | null => {
    if (!studentId) {
      toast.error("Please search and select a student first.");
      return null;
    }

    if (
      !tcNo.trim() ||
      !date ||
      !classAtLeaving ||
      !dateOfAdmission ||
      !dateOfLeaving ||
      !dateOfBirth ||
      !conductRemarks ||
      !reasonForLeaving ||
      !belongsToScStBc ||
      !receiptOfScholarship
    ) {
      toast.error("Please fill in all required TC details.");
      return null;
    }

    return {
      collegeTcId: initialCertificate?.collegeTcId,
      studentId,
      rollNo,
      admissionNo,
      studentName,
      fatherName,
      motherName,
      course,
      subCourse,
      courseYear,
      academicYear,
      batchCode,
      tcNo,
      date,
      classAtLeaving,
      dateOfAdmission,
      dateOfLeaving,
      dateOfBirth,
      conductRemarks,
      reasonForLeaving,
      belongsToScStBc,
      receiptOfScholarship,
      otherRemarks,
    };
  };

  const handleUploadHeader = async () => {
    const data = buildTransferCertificateData();
    if (!data) return;
    if (!collegeId) {
      toast.error("College context is unavailable for this account.");
      return;
    }

    try {
      const duplicateExists = await hasTransferTcNoForAnotherStudent({
        collegeId,
        studentId: data.studentId ?? 0,
        collegeTcNo: data.tcNo,
        collegeTcId: data.collegeTcId,
      });

      if (duplicateExists) {
        toast.error("This TC number is already assigned to another student.");
        return;
      }
    } catch (err) {
      console.error("Failed to validate transfer certificate number", getErrorMessage(err), err);
      toast.error("Unable to validate TC number right now.");
      return;
    }

    await onUploadHeader(data);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Date Picker webkit-calendar-picker-indicator reset */}
      <style dangerouslySetInnerHTML={{__html: `
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
      `}} />

      {/* Top Breadcrumb Header */}
      <section>
        <h1 className="flex flex-wrap items-center gap-4 text-[24px] font-bold leading-tight md:text-[28px]">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer text-[#17213D] transition-colors hover:text-[#43C17A]"
          >
            Bonafides
          </button>
          <span className="text-[#17213D] font-normal">/</span>
          <span className="text-[#43C17A]">Transfer Certificate</span>
        </h1>
        <p className="mt-1 text-[13px] font-medium text-[#7B8AA3]">
          Create, review, and issue student certificate requests.
        </p>
      </section>

      {/* Main Form Container */}
      <div className="rounded-lg border border-[#E7ECF3] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.06)] flex flex-col gap-8">
        
        {/* Student Search Section */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4 pb-2">
            <div>
              <h2 className="text-[18px] font-bold text-[#17213D]">Student Search</h2>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-6">
            {/* Search Input Box with actions */}
            <div className="flex w-full flex-wrap items-center justify-between gap-4">
              <div className="relative flex h-11 w-full max-w-[690px] items-center rounded-md border border-[#D7DEE8] bg-white px-4 text-[#8A96A8] focus-within:border-[#43C17A] transition-all lg:max-w-[48%]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter Hall Ticket No. / Roll No. / Admission No."
                  className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#17213D] outline-none placeholder:text-[#8A96A8] pr-10"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isFetching}
                  className="absolute right-4 cursor-pointer text-[#7B8AA3] hover:text-[#17213D] transition-colors disabled:cursor-not-allowed"
                  aria-label="Search student"
                >
                  <MagnifyingGlass size={18} weight="bold" />
                </button>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isFetching}
                  className="h-11 cursor-pointer rounded-md bg-[#43C17A] px-7 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(67,193,122,0.18)] transition-colors hover:bg-[#349c61] disabled:cursor-not-allowed disabled:bg-[#A8DEC0]"
                >
                  {isFetching ? "Getting..." : "Get Details"}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="h-11 rounded-md border border-[#D7DEE8] bg-white px-7 text-[13px] font-bold text-[#303642] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="rounded-md border border-[#BFEBD3] bg-[#F0FDF6] px-4 py-3 text-[12px] font-semibold text-[#16803A]">
              Enter the student roll number or hall ticket number, then click Get Details to auto-fill the student values for this college.
            </div>

            {/* Student Details (Auto Filled) Panel (White background box, border #E2E8F0) */}
            <div className="rounded-md border border-[#E2E8F0] bg-white p-5">
              <h3 className="text-[13px] font-bold text-[#17213D] mb-4">
                Student Details (Auto Filled)
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Roll No.</span>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Admission No.</span>
                  <input
                    type="text"
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Student Name</span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Father&apos;s Name</span>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Mother&apos;s Name</span>
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Course</span>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Sub Course</span>
                  <input
                    type="text"
                    value={subCourse}
                    onChange={(e) => setSubCourse(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Course Year</span>
                  <input
                    type="text"
                    value={courseYear}
                    onChange={(e) => setCourseYear(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Academic Year</span>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Batch Code</span>
                  <input
                    type="text"
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* TC Details Section */}
        <div className="border-t border-[#F1F5F9] pt-6">
          <h2 className="text-[18px] font-bold text-[#17213D] mb-6">TC Details</h2>
          
          <div className="grid items-start gap-6 md:grid-cols-3">
            {/* Column 1 */}
            <div className="flex flex-col gap-5">
              {/* TC No */}
              <label className="flex flex-col gap-2">
                <span className={fieldLabelClass}>TC No. <RequiredMark /></span>
                <input
                  type="text"
                  value={tcNo}
                  onChange={(e) => setTcNo(e.target.value)}
                  placeholder="Enter TC No."
                  className={inputClass}
                />
              </label>

              {/* Date of Admission */}
              <label className="flex flex-col gap-2">
                <span className={fieldLabelClass}>Date of Admission <RequiredMark /></span>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dateOfAdmission}
                    onChange={(e) => setDateOfAdmission(e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                  <CalendarBlank size={16} className="absolute right-3 text-[#7B8AA3] pointer-events-none" />
                </div>
              </label>

              {/* Reason for Leaving */}
              <label className="flex flex-col gap-2">
                <span className={fieldLabelClass}>Reason for Leaving <RequiredMark /></span>
                <div className="relative flex items-center">
                  <select
                    value={reasonForLeaving}
                    onChange={(e) => setReasonForLeaving(e.target.value)}
                    className={selectClass}
                  >
                    <option value="Higher Studies">Higher Studies</option>
                    <option value="Completed Course">Completed Course</option>
                    <option value="Personal Reasons">Personal Reasons</option>
                    <option value="Other">Other</option>
                  </select>
                  <CaretDown size={14} weight="bold" className="absolute right-3 text-[#7B8AA3] pointer-events-none" />
                </div>
              </label>

              {/* Whether Candidate is in receipt of Scholarship */}
              <label className="flex flex-col gap-2">
                <span className={fieldLabelClass}>Whether the Candidate is in receipt of any Scholarship</span>
                <div className="relative flex items-center">
                  <select
                    value={receiptOfScholarship}
                    onChange={(e) => setReceiptOfScholarship(e.target.value)}
                    className={selectClass}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <CaretDown size={14} weight="bold" className="absolute right-3 text-[#7B8AA3] pointer-events-none" />
                </div>
              </label>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-5">
              {/* Date */}
              <label className="flex flex-col gap-2">
                <span className={fieldLabelClass}>Date <RequiredMark /></span>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                  <CalendarBlank size={16} className="absolute right-3 text-[#7B8AA3] pointer-events-none" />
                </div>
              </label>

              {/* Date of Birth */}
              <label className="flex flex-col gap-2">
                <span className={fieldLabelClass}>Date of Birth <RequiredMark /></span>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                  <CalendarBlank size={16} className="absolute right-3 text-[#7B8AA3] pointer-events-none" />
                </div>
              </label>

              {/* Date of Leaving */}
              <label className="flex flex-col gap-2">
                <span className={fieldLabelClass}>Date of Leaving <RequiredMark /></span>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dateOfLeaving}
                    onChange={(e) => setDateOfLeaving(e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                  <CalendarBlank size={16} className="absolute right-3 text-[#7B8AA3] pointer-events-none" />
                </div>
              </label>

              {/* SC/ST/BC Category */}
              <label className="flex flex-col gap-2">
                <span className={fieldLabelClass}>Whether the Candidate belongs to SC / ST / BC</span>
                <div className="relative flex items-center">
                  <select
                    value={belongsToScStBc}
                    onChange={(e) => setBelongsToScStBc(e.target.value)}
                    className={selectClass}
                  >
                    <option value="BC-B">BC-B</option>
                    <option value="BC-A">BC-A</option>
                    <option value="BC-C">BC-C</option>
                    <option value="BC-D">BC-D</option>
                    <option value="BC-E">BC-E</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OC">OC</option>
                  </select>
                  <CaretDown size={14} weight="bold" className="absolute right-3 text-[#7B8AA3] pointer-events-none" />
                </div>
              </label>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-5">
              {/* Class at the time of Leaving */}
              <label className="flex flex-col gap-2">
                <span className={fieldLabelClass}>Class at the time of Leaving <RequiredMark /></span>
                <div className="relative flex items-center">
                <select
                  value={classAtLeaving}
                  onChange={(e) => setClassAtLeaving(e.target.value)}
                  className={selectClass}
                >
                  {classAtLeavingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                  <CaretDown size={14} weight="bold" className="absolute right-3 text-[#7B8AA3] pointer-events-none" />
                </div>
              </label>

              {/* Conduct / General Remarks */}
              <label className="flex flex-col gap-2">
                <span className={fieldLabelClass}>Conduct / General Remarks <RequiredMark /></span>
                <div className="relative flex items-center">
                  <select
                    value={conductRemarks}
                    onChange={(e) => setConductRemarks(e.target.value)}
                    className={selectClass}
                  >
                    <option value="Good">Good</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Satisfactory">Satisfactory</option>
                  </select>
                  <CaretDown size={14} weight="bold" className="absolute right-3 text-[#7B8AA3] pointer-events-none" />
                </div>
              </label>

              {/* Any Other Remarks (Optional) */}
              <label className="flex flex-col gap-2">
                <span className="flex min-h-[38px] items-end text-[12px] font-bold text-[#17213D]">Any Other Remarks (Optional)</span>
                <textarea
                  value={otherRemarks}
                  onChange={(e) => setOtherRemarks(e.target.value)}
                  placeholder="Enter any other remarks"
                  rows={2}
                  className="rounded-md border border-[#D7DEE8] bg-white px-3 py-2 text-[13px] font-medium text-[#303642] outline-none focus:border-[#43C17A] transition-colors w-full resize-none h-[75px]"
                />
              </label>

              {/* Action Buttons inside Column 3 footer block */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-10 rounded-md border border-[#DDE4EE] bg-white px-7 text-[13px] font-bold text-[#17213D] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={handleUploadHeader}
                  className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-md bg-[#0F172A] px-6 text-white shadow-[0_4px_12px_rgba(15,23,42,0.15)] transition-colors hover:bg-slate-800"
                >
                  <UploadSimple size={20} />
                  <div className="flex flex-col items-start text-left leading-tight">
                    <span className="text-[12px] font-bold text-white tracking-wide">Upload College</span>
                    <span className="text-[12px] font-bold text-white tracking-wide">Header</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
