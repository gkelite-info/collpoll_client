"use client";

import { CaretLeft } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useUser } from "@/app/utils/context/UserContext";
import {
  createBonafideCertificate,
  fetchAccountantEducationTypes,
  fetchBonafideStudentByRollNo,
  type AccountantEducationTypeOption,
  type BonafideStudentDetails,
  updateBonafideCertificate,
} from "@/lib/helpers/accountant/bonafideCertificatesAPI";
import type { BonafideCertificate } from "./BonafideCertificatesTable";

const inputClass =
  "h-10 rounded-md border border-[#D7DEE8] bg-white px-3 text-[13px] font-medium text-[#303642] outline-none placeholder:text-[#8A96A8]";

const fieldLabelClass = "text-[12px] font-bold text-[#303642]";

const purposeOptions = [
  "Education Loan",
  "Higher Studies",
  "Visa",
  "Bank Account",
  "Scholarship",
  "Other",
];

const studentTypeOptions = ["Regular", "Lateral Entry", "Transfer", "Other"];
const conductOptions = ["Good", "Very Good", "Excellent", "Satisfactory"];

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

export function BonafideCreateForm({
  initialCertificate,
  onCancel,
  onSave,
}: {
  initialCertificate?: BonafideCertificate | null;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
}) {
  const { collegeId, loading: userLoading, userId } = useUser();
  const academicYearOptions = useMemo(() => getAcademicYearOptions(), []);
  const [educationTypes, setEducationTypes] = useState<AccountantEducationTypeOption[]>([]);
  const [selectedEducationId, setSelectedEducationId] = useState("");
  const [academicYear, setAcademicYear] = useState(
    academicYearOptions[academicYearOptions.length - 1] ?? "",
  );
  const [rollNo, setRollNo] = useState("");
  const [searchStudentName, setSearchStudentName] = useState("");
  const [searchAcademicYear, setSearchAcademicYear] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [studentDetails, setStudentDetails] =
    useState<BonafideStudentDetails | null>(null);
  const [bonafideNo, setBonafideNo] = useState("");
  const [dateIssued, setDateIssued] = useState(getTodayIsoDate());
  const [purpose, setPurpose] = useState("");
  const [studentType, setStudentType] = useState("");
  const [conduct, setConduct] = useState("");
  const [isLoadingEducationTypes, setIsLoadingEducationTypes] = useState(true);
  const [isFetchingStudent, setIsFetchingStudent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;

    let isActive = true;

    async function loadEducationTypes() {
      if (!collegeId) {
        setEducationTypes([]);
        setFormMessage("College context is unavailable for this account.");
        setIsLoadingEducationTypes(false);
        return;
      }

      setIsLoadingEducationTypes(true);
      setFormMessage(null);

      try {
        const options = await fetchAccountantEducationTypes(collegeId);
        if (!isActive) return;
        setEducationTypes(options);
      } catch (error) {
        if (!isActive) return;
        console.error("Failed to load education types", error);
        setFormMessage("Unable to load education types for this college.");
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

  useEffect(() => {
    if (!initialCertificate) {
      return;
    }

    const educationId =
      initialCertificate.collegeEducationId ??
      educationTypes.find(
        (education) =>
          education.collegeEducationType === initialCertificate.educationType,
      )?.collegeEducationId;

    setSelectedEducationId(educationId ? String(educationId) : "");
    setAcademicYear(initialCertificate.academicYear ?? "");
    setRollNo(initialCertificate.rollNo ?? "");
    setAdmissionNo(initialCertificate.admissionNo ?? "");
    setStudentDetails({
      studentId: initialCertificate.studentId ?? 0,
      rollNo: initialCertificate.rollNo ?? "",
      studentName: initialCertificate.studentName,
      fatherName: initialCertificate.fatherName ?? "",
      course: initialCertificate.educationType,
      subCourse: initialCertificate.branch,
      courseYear: initialCertificate.courseYear ?? "",
      batchCode: "-",
    });
    setBonafideNo(initialCertificate.bonafideNo);
    setDateIssued(initialCertificate.dateIssuedIso || getTodayIsoDate());
    setPurpose(initialCertificate.purpose);
    setStudentType(initialCertificate.studentType ?? "");
    setConduct(initialCertificate.conduct ?? "");
  }, [educationTypes, initialCertificate]);

  const handleGetDetails = async () => {
    if (!collegeId) {
      setFormMessage("College context is unavailable for this account.");
      return;
    }

    if (!selectedEducationId) {
      setFormMessage("Select an education type first.");
      return;
    }

    if (!rollNo.trim()) {
      toast.error("Enter the student roll no.");
      setFormMessage("Enter the student roll no.");
      return;
    }

    setIsFetchingStudent(true);
    setFormMessage(null);
    setStudentDetails(null);
    setAdmissionNo("");

    try {
      const student = await fetchBonafideStudentByRollNo({
        collegeId,
        collegeEducationId: Number(selectedEducationId),
        rollNo,
      });

      if (!student) {
        setFormMessage("No active student found for this education type and roll no.");
        return;
      }

      setStudentDetails(student);
    } catch (error) {
      console.error("Failed to fetch student details", error);
      setFormMessage("Unable to fetch student details right now.");
    } finally {
      setIsFetchingStudent(false);
    }
  };

  const handleSave = async (isDraft = false) => {
    if (!collegeId || !userId) {
      setFormMessage("College or user context is unavailable for this account.");
      return;
    }

    if (!selectedEducationId) {
      setFormMessage("Select an education type first.");
      return;
    }

    const isEditMode = Boolean(initialCertificate?.collegeBonafideId);
    const studentId = studentDetails?.studentId || initialCertificate?.studentId;

    if (!isEditMode && !studentId) {
      setFormMessage("Get student details before saving.");
      return;
    }

    if (!isDraft) {
      if (!academicYear || !bonafideNo.trim() || !dateIssued || !purpose || !studentType || !conduct) {
        setFormMessage("Fill all required bonafide details before saving.");
        return;
      }
    }

    setIsSaving(true);
    setFormMessage(null);

    try {
      const payload = {
        collegeId,
        collegeEducationId: Number(selectedEducationId),
        academicYear,
        bonafideNo,
        dateIssued,
        purpose,
        studentType,
        conduct,
        admissionNo,
        issuedBy: userId,
        isDraft,
      };

      if (initialCertificate?.collegeBonafideId) {
        await updateBonafideCertificate({
          ...payload,
          collegeBonafideId: initialCertificate.collegeBonafideId,
          studentId: studentId || undefined,
        });
      } else {
        await createBonafideCertificate({
          ...payload,
          studentId: studentId!,
        });
      }

      toast.success(
        isDraft
          ? "Bonafide saved as draft successfully"
          : initialCertificate?.collegeBonafideId
            ? "Bonafide updated successfully"
            : "Bonafide saved successfully",
      );
      await onSave();
    } catch (error) {
      console.error("Failed to save bonafide certificate", error);
      setFormMessage("Unable to save bonafide certificate right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedEducationType =
    educationTypes.find(
      (education) => String(education.collegeEducationId) === selectedEducationId,
    )?.collegeEducationType ?? "";

  return (
    <div className="rounded-lg bg-white px-4 py-5 shadow-sm">
      <button
        type="button"
        onClick={onCancel}
        aria-label="Back to bonafide certificates"
        className="mb-5 flex h-9 w-9 cursor-pointer items-center justify-center text-[#17213D] transition-colors hover:text-[#43C17A]"
      >
        <CaretLeft size={20} weight="bold" />
      </button>

      <section>
        <h2 className="text-[15px] font-bold text-[#17213D]">
          1. Search Student
        </h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <SelectField
            label="Education Type"
            value={selectedEducationId}
            placeholder={
              isLoadingEducationTypes ? "Loading Education Types" : "Select Education Type"
            }
            options={educationOptions}
            disabled={isLoadingEducationTypes || userLoading}
            onChange={(value) => {
              setSelectedEducationId(value);
              setStudentDetails(null);
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
              setStudentDetails(null);
              setAdmissionNo("");
            }}
            required
          />
          <TextField
            label="Roll Number"
            value={rollNo}
            placeholder="Enter roll no."
            onChange={(value) => {
              setRollNo(value);
              setStudentDetails(null);
              setAdmissionNo("");
            }}
            required
          />
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
              setStudentDetails(null);
              setAdmissionNo("");
            }}
          />
          <TextField
            label="Student Name"
            value={searchStudentName}
            placeholder="Enter name"
            onChange={(value) => {
              setSearchStudentName(value);
              setStudentDetails(null);
              setAdmissionNo("");
            }}
          />
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={handleGetDetails}
              disabled={isFetchingStudent || isLoadingEducationTypes}
              className="h-10 cursor-pointer rounded-md bg-[#43C17A] text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#A8DEC0]"
            >
              {isFetchingStudent ? "Getting..." : "Get Details"}
            </button>
          </div>
        </div>

        {formMessage && (
          <p className="mt-3 text-[12px] font-semibold text-[#B42318]">
            {formMessage}
          </p>
        )}
      </section>

      <section className="mt-5 rounded-lg border border-[#E7ECF3] bg-[#FBFCFE] p-5">
        <h2 className="text-[15px] font-bold text-[#17213D]">
          2. Student Details{" "}
          <span className="text-[11px] font-medium text-[#596579]">
            (Auto Fetched)
          </span>
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <TextField label="Roll No." value={studentDetails?.rollNo ?? ""} placeholder="Enter roll no." readOnly />
          <TextField
            label="Admission No."
            value={admissionNo}
            placeholder="Enter admission no."
            onChange={setAdmissionNo}
          />
          <TextField
            label="Student Name"
            value={studentDetails?.studentName ?? ""}
            placeholder="Enter student name"
            readOnly
          />
          <TextField
            label="Father Name"
            value={studentDetails?.fatherName ?? ""}
            placeholder="Enter father name"
            readOnly
          />
          <TextField
            label="Course"
            value={studentDetails?.course || selectedEducationType}
            placeholder="Enter course"
            readOnly
          />
          <TextField label="Sub Course" value={studentDetails?.subCourse ?? ""} placeholder="Enter sub course" readOnly />
          <TextField
            label="Academic Year"
            value={studentDetails?.courseYear ?? ""}
            placeholder="Enter academic year"
            readOnly
          />
          <TextField label="Year" value={studentDetails ? academicYear : ""} placeholder="Enter year" readOnly />
          <TextField label="Batch Code" value={studentDetails?.batchCode ?? ""} placeholder="Enter batch code" readOnly />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="text-[15px] font-bold text-[#17213D]">
          3. Bonafide Details
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className={fieldLabelClass}>
              Date <RequiredMark />
            </span>
            <input
              type="date"
              value={dateIssued}
              onChange={(event) => setDateIssued(event.target.value)}
              className={inputClass}
            />
          </label>
          <SelectField
            label="Purpose"
            value={purpose}
            placeholder="Select Purpose"
            options={purposeOptions.map((option) => ({ label: option, value: option }))}
            onChange={setPurpose}
            required
          />
          <SelectField
            label="Student Type"
            value={studentType}
            placeholder="Select Student Type"
            options={studentTypeOptions.map((option) => ({
              label: option,
              value: option,
            }))}
            onChange={setStudentType}
            required
          />
          <SelectField
            label="Conduct"
            value={conduct}
            placeholder="Select Conduct"
            options={conductOptions.map((option) => ({ label: option, value: option }))}
            onChange={setConduct}
            required
          />
        </div>
      </section>

      <div className="mt-10 flex justify-end gap-3 border-t border-[#E7ECF3] pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 cursor-pointer rounded-md border border-[#303642] px-8 text-[14px] font-bold text-[#303642]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="h-10 cursor-pointer rounded-md border border-[#16284F] bg-white px-8 text-[14px] font-bold text-[#16284F] disabled:cursor-not-allowed disabled:border-[#7B8AA3] disabled:text-[#7B8AA3]"
        >
          Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="h-10 cursor-pointer rounded-md bg-[#16284F] px-10 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#7B8AA3]"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
