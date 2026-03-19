"use client";

import {
  primaryEducationAPI,
  secondaryEducationAPI,
  undergraduateEducationAPI,
  phdEducationAPI,
} from "@/lib/helpers/profile/educationAPI";
import {
  PrimaryShimmer,
  SecondaryShimmer,
  UndergraduateShimmer,
  PhdShimmer,
} from "../shimmers/Educationformshimmer ";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

import { EducationType } from "./Education";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";

const onlyLetters = /^[A-Za-z ]+$/;
const lettersAndAmp = /^[A-Za-z& ]+$/;
const courseTypeRegex = /^[A-Za-z. ]+$/;
const cgpaRegex = /^(10|[0-9](\.[0-9])?)$/;
const yearRegex = /^[0-9]{4}$/;
const percentageRegex = /^(100(\.0+)?|[0-9]{1,2}(\.[0-9]+)?)%?$/;

function formatTitleCase(value: string, allowAmp = false): string {
  const pattern = allowAmp ? /[^A-Za-z& ]/g : /[^A-Za-z ]/g;
  return value
    .replace(pattern, "")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}


function ControlledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1 w-[85%]">
      <label className="text-sm font-medium text-[#282828]">{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label}`}
        className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
      />
    </div>
  );
}

const TITLES: Record<EducationType, string> = {
  primary: "Primary Education",
  secondary: "Secondary Education",
  undergraduate: "Undergraduate Degree",
  phd: "PhD",
};

interface FieldProps {
  userId: number;
  collegeId: number;
  onSaveRef: React.MutableRefObject<(() => Promise<void>) | null>;
  onRecordSaved: (id: number) => void;
}

export default function ProfileEducationForm({
  type,
  onSaveRef,
  onRemove,
}: {
  type: EducationType;
  onSaveRef: React.MutableRefObject<(() => Promise<void>) | null>;
  onRemove: () => void;
}) {
  const { userId, collegeId } = useUser();

  const [recordId, setRecordId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (recordId == null) {
      setConfirmOpen(false);
      onRemove();
      return;
    }

    if (userId == null) {
      toast.error("Session expired. Please refresh.");
      return;
    }

    setIsDeleting(true);
    try {
      const apiMap = {
        primary: primaryEducationAPI,
        secondary: secondaryEducationAPI,
        undergraduate: undergraduateEducationAPI,
        phd: phdEducationAPI,
      };
      const response = await apiMap[type].delete(recordId, userId);
      if (response.success) {
        toast.success(`${TITLES[type]} deleted`);
        setConfirmOpen(false);
        onRemove();
      } else {
        toast.error(`Failed to delete ${TITLES[type]}. Please try again.`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (userId == null || collegeId == null) return null;

  const fieldProps: FieldProps = {
    userId,
    collegeId,
    onSaveRef,
    onRecordSaved: setRecordId,
  };

  return (
    <>
      <ConfirmDeleteModal
        open={confirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
        isDeleting={isDeleting}
        name={TITLES[type]}
      />

      <div className="flex justify-between items-center w-[85%] mb-3">
        <h3 className="text-[#43C17A] font-medium">{TITLES[type]}</h3>
        <button
          onClick={() => setConfirmOpen(true)}
          className="w-5 h-5 flex cursor-pointer items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
        >
          <span className="block w-3 h-[3px] bg-white rounded-full" />
        </button>
      </div>

      {type === "primary" && <PrimaryFields       {...fieldProps} />}
      {type === "secondary" && <SecondaryFields     {...fieldProps} />}
      {type === "undergraduate" && <UndergraduateFields {...fieldProps} />}
      {type === "phd" && <PhdFields           {...fieldProps} />}
    </>
  );
}


function PrimaryFields({ userId, collegeId, onSaveRef, onRecordSaved }: FieldProps) {
  const [form, setForm] = useState({
    primaryEducationId: undefined as number | undefined,
    schoolName: "",
    board: "",
    mediumOfStudy: "",
    yearOfPassing: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await primaryEducationAPI.fetch(userId);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          primaryEducationId: d.primaryEducationId,
          schoolName: d.schoolName ?? "",
          board: d.board ?? "",
          mediumOfStudy: d.mediumOfStudy ?? "",
          yearOfPassing: String(d.yearOfPassing ?? ""),
          location: d.location ?? "",
        });
        onRecordSaved(d.primaryEducationId);
      }
      setIsLoading(false);
    })();
  }, [userId]);

  const handleChange = (field: string, value: string) => {
    let v = value;
    if (["schoolName", "board", "mediumOfStudy", "location"].includes(field))
      v = formatTitleCase(v);
    if (field === "yearOfPassing") v = v.replace(/\D/g, "").slice(0, 4);
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = (): string | null => {
    if (!form.schoolName.trim()) return "School Name is required";
    if (!onlyLetters.test(form.schoolName)) return "School Name must contain only letters";
    if (!form.board.trim()) return "Board is required";
    if (!onlyLetters.test(form.board)) return "Board must contain only letters";
    if (!form.mediumOfStudy.trim()) return "Medium of Study is required";
    if (!onlyLetters.test(form.mediumOfStudy)) return "Medium of Study must contain only letters";
    if (!form.yearOfPassing.trim()) return "Year of Passing is required";
    if (!yearRegex.test(form.yearOfPassing)) return "Year of Passing must be exactly 4 digits";
    if (!form.location.trim()) return "Location is required";
    return null;
  };

  const savePrimary = async () => {
    if (isSaving) return;
    const error = validate();
    if (error) {
      toast.error(error);
      throw new Error(error);
    }
    setIsSaving(true);
    try {
      const response = await primaryEducationAPI.save({
        primaryEducationId: form.primaryEducationId,
        userId,
        collegeId,
        schoolName: form.schoolName,
        board: form.board,
        mediumOfStudy: form.mediumOfStudy,
        yearOfPassing: Number(form.yearOfPassing),
        location: form.location,
      });
      if (!response.success) {
        throw new Error("primary_save_failed");
      }
      if (response.id) {
        setForm((p) => ({ ...p, primaryEducationId: response.id }));
        onRecordSaved(response.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => { onSaveRef.current = savePrimary; }, [form]);

  if (isLoading) return <PrimaryShimmer />;

  return (
    <div className="space-y-4">
      <ControlledInput label="School Name" value={form.schoolName} onChange={(e) => handleChange("schoolName", e.target.value)} />
      <ControlledInput label="Board" value={form.board} onChange={(e) => handleChange("board", e.target.value)} />
      <ControlledInput label="Medium of Study" value={form.mediumOfStudy} onChange={(e) => handleChange("mediumOfStudy", e.target.value)} />
      <ControlledInput label="Year of Passing" value={form.yearOfPassing} onChange={(e) => handleChange("yearOfPassing", e.target.value)} />
      <ControlledInput label="Location" value={form.location} onChange={(e) => handleChange("location", e.target.value)} />
    </div>
  );
}


function SecondaryFields({ userId, collegeId, onSaveRef, onRecordSaved }: FieldProps) {
  const [form, setForm] = useState({
    secondaryEducationId: undefined as number | undefined,
    institutionName: "",
    board: "",
    mediumOfStudy: "",
    yearOfPassing: "",
    percentage: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await secondaryEducationAPI.fetch(userId);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          secondaryEducationId: d.secondaryEducationId,
          institutionName: d.institutionName ?? "",
          board: d.board ?? "",
          mediumOfStudy: d.mediumOfStudy ?? "",
          yearOfPassing: String(d.yearOfPassing ?? ""),
          percentage: String(d.percentage ?? ""),
          location: d.location ?? "",
        });
        onRecordSaved(d.secondaryEducationId);
      }
      setIsLoading(false);
    })();
  }, [userId]);

  const handleChange = (field: string, value: string) => {
    let v = value;
    if (["institutionName", "board", "mediumOfStudy", "location"].includes(field))
      v = formatTitleCase(v);
    if (field === "yearOfPassing") v = v.replace(/\D/g, "").slice(0, 4);
    if (field === "percentage") v = v.replace(/[^0-9.%]/g, "");
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = (): string | null => {
    if (!form.institutionName.trim()) return "Institution Name is required";
    if (!onlyLetters.test(form.institutionName)) return "Institution Name must contain only letters";
    if (!form.board.trim()) return "Board is required";
    if (!onlyLetters.test(form.board)) return "Board must contain only letters";
    if (!form.mediumOfStudy.trim()) return "Medium of Study is required";
    if (!onlyLetters.test(form.mediumOfStudy)) return "Medium of Study must contain only letters";
    if (!form.yearOfPassing.trim()) return "Year of Passing is required";
    if (!yearRegex.test(form.yearOfPassing)) return "Year of Passing must be exactly 4 digits";
    if (!form.percentage.trim()) return "Percentage is required";
    if (!percentageRegex.test(form.percentage)) return "Percentage must be like 80, 80.4, or 80%";
    if (!form.location.trim()) return "Location is required";
    return null;
  };

  const saveSecondary = async () => {
    if (isSaving) return;
    const error = validate();
    if (error) {
      toast.error(error);
      throw new Error(error);
    }
    setIsSaving(true);
    const numericPercentage = parseFloat(form.percentage.replace("%", ""));
    try {
      const response = await secondaryEducationAPI.save({
        secondaryEducationId: form.secondaryEducationId,
        userId,
        collegeId,
        institutionName: form.institutionName,
        board: form.board,
        mediumOfStudy: form.mediumOfStudy,
        yearOfPassing: Number(form.yearOfPassing),
        percentage: numericPercentage,
        location: form.location,
      });
      if (!response.success) throw new Error("secondary_save_failed");
      if (response.id) {
        setForm((p) => ({ ...p, secondaryEducationId: response.id }));
        onRecordSaved(response.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => { onSaveRef.current = saveSecondary; }, [form]);

  if (isLoading) return <SecondaryShimmer />;

  return (
    <div className="space-y-4">
      <ControlledInput label="Institution Name" value={form.institutionName} onChange={(e) => handleChange("institutionName", e.target.value)} />
      <ControlledInput label="Board" value={form.board} onChange={(e) => handleChange("board", e.target.value)} />
      <ControlledInput label="Medium of Study" value={form.mediumOfStudy} onChange={(e) => handleChange("mediumOfStudy", e.target.value)} />
      <ControlledInput label="Year of Passing" value={form.yearOfPassing} onChange={(e) => handleChange("yearOfPassing", e.target.value)} />
      <ControlledInput label="Percentage" value={form.percentage} onChange={(e) => handleChange("percentage", e.target.value)} />
      <ControlledInput label="Location" value={form.location} onChange={(e) => handleChange("location", e.target.value)} />
    </div>
  );
}

function UndergraduateFields({ userId, collegeId, onSaveRef, onRecordSaved }: FieldProps) {
  const [form, setForm] = useState({
    undergraduateEducationId: undefined as number | undefined,
    courseName: "",
    specialization: "",
    collegeName: "",
    CGPA: "",
    startYear: "",
    endYear: "",
    courseType: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await undergraduateEducationAPI.fetch(userId);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          undergraduateEducationId: d.undergraduateEducationId,
          courseName: d.courseName ?? "",
          specialization: d.specialization ?? "",
          collegeName: d.collegeName ?? "",
          CGPA: String(d.CGPA ?? ""),
          startYear: String(d.startYear ?? ""),
          endYear: String(d.endYear ?? ""),
          courseType: d.courseType ?? "",
        });
        onRecordSaved(d.undergraduateEducationId);
      }
      setIsLoading(false);
    })();
  }, [userId]);

  const handleChange = (field: string, value: string) => {
    let v = value;
    if (field === "courseName") v = formatTitleCase(v.replace(/[^A-Za-z& ]/g, ""), true);
    if (field === "specialization") v = v.replace(/[^A-Za-z& ]/g, "");
    if (field === "collegeName") v = formatTitleCase(v.replace(/[^A-Za-z ]/g, ""));
    if (field === "CGPA") {
      v = v.replace(/[^0-9.]/g, "");
      const parts = v.split(".");
      if (parts.length > 2) parts.splice(2);
      if (parts[1]) parts[1] = parts[1].slice(0, 1);
      v = parts.join(".");
    }
    if (field === "startYear" || field === "endYear") v = v.replace(/\D/g, "").slice(0, 4);
    if (field === "courseType") v = v.replace(/[^A-Za-z. ]/g, "");
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = (): string | null => {
    if (!form.courseName.trim()) return "Course Name is required";
    if (!lettersAndAmp.test(form.courseName)) return "Course Name must contain only letters or &";
    if (!form.specialization.trim()) return "Specialization is required";
    if (!lettersAndAmp.test(form.specialization)) return "Specialization must contain only letters or &";
    if (!form.collegeName.trim()) return "College Name is required";
    if (!onlyLetters.test(form.collegeName)) return "College Name must contain only letters";
    if (!form.CGPA.trim()) return "CGPA is required";
    if (!cgpaRegex.test(form.CGPA)) return "CGPA must be between 0 and 10";
    if (!form.startYear.trim()) return "Start Year is required";
    if (!yearRegex.test(form.startYear)) return "Start Year must be exactly 4 digits";
    if (!form.endYear.trim()) return "End Year is required";
    if (!yearRegex.test(form.endYear)) return "End Year must be exactly 4 digits";
    if (Number(form.endYear) < Number(form.startYear)) return "End Year must be >= Start Year";
    if (!form.courseType.trim()) return "Course Type is required";
    if (!courseTypeRegex.test(form.courseType)) return "Course Type must contain only letters or dot";
    return null;
  };

  const saveUndergraduate = async () => {
    if (isSaving) return;
    const error = validate();
    if (error) {
      toast.error(error);
      throw new Error(error);
    }
    setIsSaving(true);
    try {
      const response = await undergraduateEducationAPI.save({
        undergraduateEducationId: form.undergraduateEducationId,
        userId,
        collegeId,
        courseName: form.courseName,
        specialization: form.specialization,
        collegeName: form.collegeName,
        CGPA: Number(form.CGPA),
        startYear: Number(form.startYear),
        endYear: Number(form.endYear),
        courseType: form.courseType,
      });
      if (!response.success) throw new Error("undergraduate_save_failed");
      if (response.id) {
        setForm((p) => ({ ...p, undergraduateEducationId: response.id }));
        onRecordSaved(response.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => { onSaveRef.current = saveUndergraduate; }, [form]);

  if (isLoading) return <UndergraduateShimmer />;

  return (
    <div className="space-y-4">
      <ControlledInput label="Course Name" value={form.courseName} onChange={(e) => handleChange("courseName", e.target.value)} />
      <ControlledInput label="Specialization" value={form.specialization} onChange={(e) => handleChange("specialization", e.target.value)} />
      <ControlledInput label="College Name" value={form.collegeName} onChange={(e) => handleChange("collegeName", e.target.value)} />
      <ControlledInput label="CGPA (out of 10)" value={form.CGPA} onChange={(e) => handleChange("CGPA", e.target.value)} />
      <div className="flex gap-5 w-[85%]">
        <ControlledInput label="Start Year" value={form.startYear} onChange={(e) => handleChange("startYear", e.target.value)} />
        <ControlledInput label="End Year" value={form.endYear} onChange={(e) => handleChange("endYear", e.target.value)} />
      </div>
      <ControlledInput label="Course Type" value={form.courseType} onChange={(e) => handleChange("courseType", e.target.value)} />
    </div>
  );
}

function PhdFields({ userId, collegeId, onSaveRef, onRecordSaved }: FieldProps) {
  const [form, setForm] = useState({
    phdeducationId: undefined as number | undefined,
    universityName: "",
    researchArea: "",
    supervisorName: "",
    startYear: "",
    endYear: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await phdEducationAPI.fetch(userId);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          phdeducationId: d.phdeducationId,
          universityName: d.universityName ?? "",
          researchArea: d.researchArea ?? "",
          supervisorName: d.supervisorName ?? "",
          startYear: String(d.startYear ?? ""),
          endYear: String(d.endYear ?? ""),
        });
        onRecordSaved(d.phdeducationId);
      }
      setIsLoading(false);
    })();
  }, [userId]);

  const handleChange = (field: string, value: string) => {
    let v = value;
    if (["universityName", "researchArea", "supervisorName"].includes(field))
      v = formatTitleCase(v);
    if (field === "startYear" || field === "endYear")
      v = v.replace(/\D/g, "").slice(0, 4);
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = (): string | null => {
    if (!form.universityName.trim()) return "University Name is required";
    if (!onlyLetters.test(form.universityName)) return "University Name must contain only letters";
    if (!form.researchArea.trim()) return "Research Area is required";
    if (!onlyLetters.test(form.researchArea)) return "Research Area must contain only letters";
    if (!form.supervisorName.trim()) return "Supervisor Name is required";
    if (!onlyLetters.test(form.supervisorName)) return "Supervisor Name must contain only letters";
    if (!form.startYear.trim()) return "Start Year is required";
    if (!yearRegex.test(form.startYear)) return "Start Year must be exactly 4 digits";
    if (!form.endYear.trim()) return "End Year is required";
    if (!yearRegex.test(form.endYear)) return "End Year must be exactly 4 digits";
    if (Number(form.endYear) < Number(form.startYear)) return "End Year cannot be earlier than Start Year";
    return null;
  };

  const savePhd = async () => {
    if (isSaving) return;
    const error = validate();
    if (error) {
      toast.error(error);
      throw new Error(error);
    }
    setIsSaving(true);
    try {
      const response = await phdEducationAPI.save({
        phdeducationId: form.phdeducationId,
        userId,
        collegeId,
        universityName: form.universityName,
        researchArea: form.researchArea,
        supervisorName: form.supervisorName,
        startYear: Number(form.startYear),
        endYear: Number(form.endYear),
      });
      if (!response.success) throw new Error("phd_save_failed");
      if (response.id) {
        setForm((p) => ({ ...p, phdeducationId: response.id }));
        onRecordSaved(response.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => { onSaveRef.current = savePhd; }, [form]);

  if (isLoading) return <PhdShimmer />;

  return (
    <div className="space-y-4">
      <ControlledInput label="University Name" value={form.universityName} onChange={(e) => handleChange("universityName", e.target.value)} />
      <ControlledInput label="Research Area" value={form.researchArea} onChange={(e) => handleChange("researchArea", e.target.value)} />
      <ControlledInput label="Supervisor Name" value={form.supervisorName} onChange={(e) => handleChange("supervisorName", e.target.value)} />
      <div className="flex gap-5 w-[85%]">
        <ControlledInput label="Start Year" value={form.startYear} onChange={(e) => handleChange("startYear", e.target.value)} />
        <ControlledInput label="End Year" value={form.endYear} onChange={(e) => handleChange("endYear", e.target.value)} />
      </div>
    </div>
  );
}