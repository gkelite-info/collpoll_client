"use client";

import { CaretDown, MagnifyingGlass, UploadSimple, CalendarBlank } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchTransferStudentByRollNo,
  hasTransferTcNoForAnotherStudent,
} from "@/lib/helpers/accountant/transferCertificatesAPI";
import {
  fetchAccountantEducationTypes,
  type AccountantEducationTypeOption,
} from "@/lib/helpers/accountant/bonafideCertificatesAPI";

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

function getAcademicYearOptions(startYear = 2020) {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
    const year = startYear + index;
    return `${year}-${year + 1}`;
  });
}

function TextField({
  label,
  value,
  placeholder,
  required,
  readOnly,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={fieldLabelClass}>
        {label} {required && <RequiredMark />}
      </span>
      <input
        readOnly={readOnly}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={`${inputClass} ${readOnly ? "bg-[#F8FAFC]" : ""}`}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  required,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={fieldLabelClass}>
        {label} {required && <RequiredMark />}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} cursor-pointer appearance-none disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#8A96A8]`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
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
  const { collegeId, loading: userLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState(""); // Can be removed later
  const [isFetching, setIsFetching] = useState(false);

  // New Search Fields State
  const academicYearOptions = useMemo(() => getAcademicYearOptions(), []);
  const [educationTypes, setEducationTypes] = useState<AccountantEducationTypeOption[]>([]);
  const [selectedEducationId, setSelectedEducationId] = useState("");
  const [searchAcademicYear, setSearchAcademicYear] = useState("");
  const [searchStudentName, setSearchStudentName] = useState("");
  const [isLoadingEducationTypes, setIsLoadingEducationTypes] = useState(true);

  useEffect(() => {
    if (userLoading) return;

    let isActive = true;

    async function loadEducationTypes() {
      if (!collegeId) {
        setEducationTypes([]);
        setIsLoadingEducationTypes(false);
        return;
      }

      setIsLoadingEducationTypes(true);

      try {
        const options = await fetchAccountantEducationTypes(collegeId);
        if (!isActive) return;
        setEducationTypes(options);
      } catch (error) {
        if (!isActive) return;
        console.error("Failed to load education types", error);
      } finally {
        if (isActive) setIsLoadingEducationTypes(false);
      }
    }

    loadEducationTypes();

    return () => {
      isActive = false;
    };
  }, [collegeId, userLoading]);

  const educationOptions = useMemo(
    () =>
      educationTypes.map((education) => ({
        label: education.collegeEducationType,
        value: String(education.collegeEducationId),
      })),
    [educationTypes],
  );

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
    if (!collegeId) {
      toast.error("College context is unavailable for this account.");
      return;
    }

    if (!selectedEducationId) {
      toast.error("Select an education type first.");
      return;
    }

    if (!rollNo.trim() && !searchStudentName.trim()) {
      toast.error("Enter the student roll no. or student name.");
      return;
    }

    setIsFetching(true);
    try {
      const student = await fetchTransferStudentByRollNo({
        collegeId,
        collegeEducationId: Number(selectedEducationId),
        rollNo,
        studentName: searchStudentName,
        courseYear: searchAcademicYear,
      });

      if (!student) {
        toast.error("No active student found for these details.");
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
        
        <div>
          <h2 className="mb-4 text-[18px] font-bold text-[#17213D]">
            1. Search Student
          </h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label="Education Type"
              value={selectedEducationId}
              placeholder={isLoadingEducationTypes ? "Loading..." : "Select Education Type"}
              options={educationOptions}
              disabled={isLoadingEducationTypes}
              onChange={(value) => {
                setSelectedEducationId(value);
                setStudentId(null);
                setAdmissionNo("");
              }}
              required
            />
            <SelectField
              label="Year"
              value={academicYear}
              options={academicYearOptions.map((year) => ({
                label: year,
                value: year,
              }))}
              onChange={(value) => {
                setAcademicYear(value);
              }}
              required
            />
            <TextField
              label="Roll Number"
              value={rollNo}
              placeholder="Enter roll no"
              onChange={(value) => {
                setRollNo(value);
                setStudentId(null);
                setAdmissionNo("");
              }}
              required
            />
          </div>

          <div className="mt-5 grid items-end gap-5 md:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label="Academic Year"
              value={searchAcademicYear}
              placeholder="Select Year"
              options={[
                { label: "1st Year", value: "1st Year" },
                { label: "2nd Year", value: "2nd Year" },
                { label: "3rd Year", value: "3rd Year" },
                { label: "4th Year", value: "4th Year" },
              ]}
              onChange={(value) => {
                setSearchAcademicYear(value);
                setStudentId(null);
                setAdmissionNo("");
              }}
            />
            <TextField
              label="Student Name"
              value={searchStudentName}
              placeholder="Enter student name"
              onChange={(value) => {
                setSearchStudentName(value);
                setStudentId(null);
                setAdmissionNo("");
              }}
            />
            <div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isFetching}
                className="h-10 w-full cursor-pointer rounded-md bg-[#43C17A] px-7 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(67,193,122,0.18)] transition-colors hover:bg-[#349c61] disabled:cursor-not-allowed disabled:bg-[#A8DEC0]"
              >
                {isFetching ? "Getting..." : "Get Details"}
              </button>
            </div>
          </div>
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
                    placeholder="Enter Roll No."
                    onChange={(e) => setRollNo(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Admission No.</span>
                  <input
                    type="text"
                    value={admissionNo}
                    placeholder="Enter Admission No."
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Student Name</span>
                  <input
                    type="text"
                    value={studentName}
                    placeholder="Enter Student Name"
                    onChange={(e) => setStudentName(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Father&apos;s Name</span>
                  <input
                    type="text"
                    value={fatherName}
                    placeholder="Enter Father's Name"
                    onChange={(e) => setFatherName(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Mother&apos;s Name</span>
                  <input
                    type="text"
                    value={motherName}
                    placeholder="Enter Mother's Name"
                    onChange={(e) => setMotherName(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Course</span>
                  <input
                    type="text"
                    value={course}
                    placeholder="Enter Course"
                    onChange={(e) => setCourse(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Sub Course</span>
                  <input
                    type="text"
                    value={subCourse}
                    placeholder="Enter Sub Course"
                    onChange={(e) => setSubCourse(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Course Year</span>
                  <input
                    type="text"
                    value={courseYear}
                    placeholder="Enter Course Year"
                    onChange={(e) => setCourseYear(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Academic Year</span>
                  <input
                    type="text"
                    value={academicYear}
                    placeholder="Enter Academic Year"
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#7B8AA3]">Batch Code</span>
                  <input
                    type="text"
                    value={batchCode}
                    placeholder="Enter Batch Code"
                    onChange={(e) => setBatchCode(e.target.value)}
                    className="h-10 rounded-md border border-[#E2E8F0] bg-[#F1F3F7] px-3 text-[13px] font-medium text-[#17213D] outline-none w-full focus:border-[#43C17A] focus:bg-white transition-colors"
                  />
                </label>
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
