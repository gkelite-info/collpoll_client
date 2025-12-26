"use client";

import { EducationType } from "./Education";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { upsertPrimaryEducation } from "@/lib/helpers/upsertPrimaryEducation";
import { upsertSecondaryEducation } from "@/lib/helpers/upsertSecondaryEducation";
import { upsertUndergraduateEducation } from "@/lib/helpers/upsertUndergraduateEducation";
import { upsertPhdEducation } from "@/lib/helpers/upsertPhdEducation";

export default function EducationForm({
  type,
  onSaveRef,
  onRemove
}: {
  type: EducationType;
  onSaveRef: any;
  onRemove: () => void;
}) {
  const TITLES: Record<EducationType, string> = {
    primary: "Primary Education",
    secondary: "Secondary Education",
    undergraduate: "Undergraduate Degree",
    phd: "PhD",
  };

  const defaultStudentId = 1;

  return (
    <>
      <div className="flex justify-between items-center w-[85%] mb-3">
        <h3 className="text-[#43C17A] font-medium">{TITLES[type]}</h3>
        <button
          onClick={onRemove}
          className="
    w-5 h-5
    flex items-center justify-center
    rounded-full
    bg-red-500
    hover:bg-red-600
  "
        >
          <span className="block w-3 h-[3px] bg-white rounded-full"></span>
        </button>
      </div>

    
      {type === "primary" && (
        <PrimaryFields studentId={defaultStudentId} onSaveRef={onSaveRef} />
      )}
      {type === "secondary" && (
        <SecondaryFields studentId={defaultStudentId} onSaveRef={onSaveRef} />
      )}
      {type === "undergraduate" && (
        <UndergraduateFields studentId={defaultStudentId} onSaveRef={onSaveRef} />
      )}
      {type === "phd" && (
        <PhdFields studentId={defaultStudentId} onSaveRef={onSaveRef} />
      )}
    </>
  );
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


function PrimaryFields({ studentId, onSaveRef }: { studentId: number; onSaveRef: any }) {
  const [form, setForm] = useState({
    schoolName: "",
    board: "",
    mediumOfStudy: "",
    yearOfPassing: "",
    location: "",
  });

  function formatTitleCase(value: string): string {
    let clean = value.replace(/[^A-Za-z ]/g, ""); 
    clean = clean
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()); 
    return clean;
  }


  const handleChange = (field: string, value: string) => {
    let cleanValue = value;

  
    if (["schoolName", "board", "mediumOfStudy", "location"].includes(field)) {
      cleanValue = formatTitleCase(value);
    }

  
    if (field === "yearOfPassing") {
      cleanValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setForm((prev) => ({ ...prev, [field]: cleanValue }));
  };



  const onlyLetters = /^[A-Za-z ]+$/;   
  const yearRegex = /^[0-9]{4}$/;        

  const validate = () => {
    if (!form.schoolName.trim())
      return "School Name is required";
    if (!onlyLetters.test(form.schoolName))
      return "School Name must contain only letters";

    if (!form.board.trim())
      return "Board is required";
    if (!onlyLetters.test(form.board))
      return "Board must contain only letters";

    if (!form.mediumOfStudy.trim())
      return "Medium of Study is required";
    if (!onlyLetters.test(form.mediumOfStudy))
      return "Medium of Study must contain only letters";

    if (!form.yearOfPassing.trim())
      return "Year of Passing is required";
    if (!yearRegex.test(form.yearOfPassing))
      return "Year of Passing must be exactly 4 digits";

    if (!form.location.trim())
      return "Location is required";

    return null;
  };

  const savePrimary = async () => {

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const now = new Date().toISOString();

    const payload = {
      studentId,
      ...form,
      yearOfPassing: Number(form.yearOfPassing),
      createdAt: now,
      updatedAt: now,
    };

    console.log(" Sending Payload:", payload);

    const response = await upsertPrimaryEducation(payload);

    console.log(" Supabase Response:", response);

    if (response.success) {
      toast.success(response.message ?? "Primary education saved!");
    } else {
      toast.error(response.error ?? "Something went wrong!");
    }
  };

  useEffect(() => {
    onSaveRef.current = savePrimary;
  }, [form]);

  return (
    <div className="space-y-4">
      <ControlledInput
        label="School Name"
        value={form.schoolName}
        onChange={(e) => handleChange("schoolName", e.target.value)}
      />

      <ControlledInput
        label="Board"
        value={form.board}
        onChange={(e) => handleChange("board", e.target.value)}
      />

      <ControlledInput
        label="Medium of Study"
        value={form.mediumOfStudy}
        onChange={(e) => handleChange("mediumOfStudy", e.target.value)}
      />

      <ControlledInput
        label="Year of Passing"
        value={form.yearOfPassing}
        onChange={(e) => handleChange("yearOfPassing", e.target.value)}
      />

      <ControlledInput
        label="Location"
        value={form.location}
        onChange={(e) => handleChange("location", e.target.value)}
      />
    </div>
  );
}


function SecondaryFields({ studentId, onSaveRef }: { studentId: number; onSaveRef: any }) {
  const [form, setForm] = useState({
    institutionName: "",
    board: "",
    mediumOfStudy: "",
    yearOfPassing: "",
    percentage: "",
    location: "",
  });

  function formatTitleCase(value: string): string {
    let clean = value.replace(/[^A-Za-z ]/g, "");
    clean = clean
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()); 
    return clean;
  }

  const handleChange = (field: string, value: string) => {
    let cleanValue = value;

  
    if (["institutionName", "board", "mediumOfStudy", "location"].includes(field)) {
      cleanValue = formatTitleCase(value);
    }

    
    if (field === "yearOfPassing") {
      cleanValue = value.replace(/\D/g, "").slice(0, 4);
    }

    if (field === "percentage") {
      cleanValue = value.replace(/[^0-9.%]/g, ""); 
    }

    setForm((prev) => ({ ...prev, [field]: cleanValue }));
  };

  const onlyLetters = /^[A-Za-z ]+$/;   
  const yearRegex = /^[0-9]{4}$/;        
  const percentageRegex = /^(100(\.0+)?|[0-9]{1,2}(\.[0-9]+)?)%?$/;


  const validate = () => {
    if (!form.institutionName.trim())
      return "Institution Name is required";
    if (!onlyLetters.test(form.institutionName))
      return "School Name must contain only letters";

    if (!form.board.trim())
      return "Board is required";
    if (!onlyLetters.test(form.board))
      return "Board must contain only letters";

    if (!form.mediumOfStudy.trim())
      return "Medium of Study is required";
    if (!onlyLetters.test(form.mediumOfStudy))
      return "Medium of Study must contain only letters";

    if (!form.yearOfPassing.trim())
      return "Year of Passing is required";
    if (!yearRegex.test(form.yearOfPassing))
      return "Year of Passing must be exactly 4 digits";

    if (!form.percentage.trim())
      return "Percentage is required";
    if (!percentageRegex.test(form.percentage))
      return "Percentage must be like 80, 80.4, 75.55, or 80%";

    if (!form.location.trim())
      return "Location is required";

    return null;
  };

  const saveSecondary = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const now = new Date().toISOString();

    const numericPercentage = parseFloat(form.percentage.replace("%", ""));

    const payload = {
      studentId,
      ...form,
      yearOfPassing: Number(form.yearOfPassing),
      percentage: numericPercentage,
      createdAt: now,
      updatedAt: now,
    };


    console.log("📤 Sending Payload:", payload);

    const response = await upsertSecondaryEducation(payload);

    console.log("📥 Supabase Response:", response);

    if (response.success) {
      toast.success(response.message ?? "Secondary education saved!");
    } else {
      toast.error(response.error ?? "Something went wrong!");
    }
  };


  useEffect(() => {
    onSaveRef.current = saveSecondary;
  }, [form]);


  return (
    <div className="space-y-4">
      <ControlledInput
        label="Institution Name"
        value={form.institutionName}
        onChange={(e) => handleChange("institutionName", e.target.value)}
      />

      <ControlledInput
        label="Board"
        value={form.board}
        onChange={(e) => handleChange("board", e.target.value)}
      />

      <ControlledInput
        label="Medium of Study"
        value={form.mediumOfStudy}
        onChange={(e) => handleChange("mediumOfStudy", e.target.value)}
      />

      <ControlledInput
        label="Year of Passing"
        value={form.yearOfPassing}
        onChange={(e) => handleChange("yearOfPassing", e.target.value)}
      />

      <ControlledInput
        label="Percentage"
        value={form.percentage}
        onChange={(e) => handleChange("percentage", e.target.value)}
      />

      <ControlledInput
        label="Location"
        value={form.location}
        onChange={(e) => handleChange("location", e.target.value)}
      />
    </div>
  );
}


function UndergraduateFields({ studentId, onSaveRef }: { studentId: number; onSaveRef: any }) {
  const [form, setForm] = useState({
    courseName: "",
    specialization: "",
    collegeName: "",
    CGPA: "",
    startYear: "",
    endYear: "",
    courseType: "",
  })

  function formatTitleCase(value: string): string {
    let clean = value.replace(/[^A-Za-z& ]/g, ""); // remove invalid chars but allow "&"
    clean = clean
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Title Case
    return clean;
  }

  const handleChange = (field: string, value: string) => {
    let cleanValue = value;

    
    if (field === "specialization") {
      cleanValue = value.replace(/[^A-Za-z& ]/g, "");
    }

    if (field === "courseName") {
      cleanValue = value.replace(/[^A-Za-z& ]/g, "");
      cleanValue = formatTitleCase(cleanValue);
    }

    if (field === "collegeName") {
      cleanValue = value.replace(/[^A-Za-z ]/g, "");
      cleanValue = formatTitleCase(cleanValue);
    }


    if (field === "CGPA") {
      cleanValue = value.replace(/[^0-9.]/g, "");

      const parts = cleanValue.split(".");
      if (parts.length > 2) {
        parts.splice(2);
      }

      if (parts[1]) {
        parts[1] = parts[1].slice(0, 1);
      }

      cleanValue = parts.join(".");
    }



    if (field === "startYear" || field === "endYear") {
      cleanValue = value.replace(/\D/g, "").slice(0, 4);
    }

    if (field === "courseType") {
      cleanValue = value.replace(/[^A-Za-z. ]/g, "");
    }

    setForm((p) => ({ ...p, [field]: cleanValue }));
  };


  const onlyLetters = /^[A-Za-z ]+$/;
  const lettersAndAmp = /^[A-Za-z& ]+$/;  
  const specializationRegex = /^[A-Za-z& ]+$/;  
  const courseTypeRegex = /^[A-Za-z. ]+$/;
  const cgpaRegex = /^(10|[0-9](\.[0-9])?)$/;
  const yearRegex = /^[0-9]{4}$/;

  const validate = () => {

    if (!form.courseName.trim()) return "Course Name is required";
    if (!lettersAndAmp.test(form.courseName))
      return "Course Name must contain only letters or &";

    if (!form.specialization.trim()) return "Specialization is required";
    if (!specializationRegex.test(form.specialization))
      return "Specialization must contain only letters or &";

    if (!form.collegeName.trim()) return "College Name is required";
    if (!onlyLetters.test(form.collegeName))
      return "College Name must contain only letters";

    if (!form.CGPA.trim()) return "CGPA is required";
    if (!cgpaRegex.test(form.CGPA))
      return "CGPA must be 1–10 like 8, 9.2, 7.85";

    if (!form.startYear.trim()) return "Start Year is required";
    if (!yearRegex.test(form.startYear))
      return "Start Year must be exactly 4 digits";

    if (!form.endYear.trim()) return "End Year is required";
    if (!yearRegex.test(form.endYear))
      return "End Year must be exactly 4 digits";

    if (Number(form.endYear) < Number(form.startYear))
      return "End Year should be greater than or equal to Start Year";

    if (!form.courseType.trim()) return "Course Type is required";
    if (!courseTypeRegex.test(form.courseType))
      return "Course Type must contain only letters or dot (.)";

    return null;
  };


  const saveUndergraduate = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const now = new Date().toISOString();

    const payload = {
      studentId,
      ...form,
      CGPA: Number(form.CGPA),
      startYear: Number(form.startYear),
      endYear: Number(form.endYear),
      createdAt: now,
      updatedAt: now,
    };

    console.log(" Undergraduate Payload:", payload);

    const response = await upsertUndergraduateEducation(payload);

    console.log(" Undergraduate Response:", response);

    if (response.success) {
      toast.success("Undergraduate education saved successfully!");
    } else {
      toast.error(response.error ?? "Something went wrong!");
    }
  };

  useEffect(() => {
    onSaveRef.current = saveUndergraduate;
  }, [form]);

  return (
    <div className="space-y-4">

      <ControlledInput
        label="Course Name"
        value={form.courseName}
        onChange={(e) => handleChange("courseName", e.target.value)}
      />

      <ControlledInput
        label="Specialization"
        value={form.specialization}
        onChange={(e) => handleChange("specialization", e.target.value)}
      />

      <ControlledInput
        label="College Name"
        value={form.collegeName}
        onChange={(e) => handleChange("collegeName", e.target.value)}
      />

      <ControlledInput
        label="CGPA (out of 10)"
        value={form.CGPA}
        onChange={(e) => handleChange("CGPA", e.target.value)}
      />

    
      <div className="flex gap-5 w-[85%]">
        <ControlledInput
          label="Start Year"
          value={form.startYear}
          onChange={(e) => handleChange("startYear", e.target.value)}
        />

        <ControlledInput
          label="End Year"
          value={form.endYear}
          onChange={(e) => handleChange("endYear", e.target.value)}
        />
      </div>

      <ControlledInput
        label="Course Type"
        value={form.courseType}
        onChange={(e) => handleChange("courseType", e.target.value)}
      />
    </div>
  );
}



function PhdFields({ studentId, onSaveRef }: { studentId: number; onSaveRef: any }) {
  const [form, setForm] = useState({
    universityName: "",
    researchArea: "",
    supervisorName: "",
    startYear: "",
    endYear: "",
  });

  function formatTitleCase(value: string) {
    let clean = value.replace(/[^A-Za-z ]/g, "");
    clean = clean
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return clean;
  }

  
  const handleChange = (field: string, value: string) => {
    let cleanValue = value;

    if (["universityName", "researchArea", "supervisorName"].includes(field)) {
      cleanValue = value.replace(/[^A-Za-z ]/g, "");
      cleanValue = formatTitleCase(cleanValue);
    }

    if (field === "startYear" || field === "endYear") {
      cleanValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setForm((prev) => ({ ...prev, [field]: cleanValue }));
  };

  
  const onlyLetters = /^[A-Za-z ]+$/;
  const yearRegex = /^[0-9]{4}$/;

  const validate = () => {
  
    if (!form.universityName.trim())
      return "University Name is required";
    if (!onlyLetters.test(form.universityName))
      return "University Name must contain only letters";


    if (!form.researchArea.trim())
      return "Research Area is required";
    if (!onlyLetters.test(form.researchArea))
      return "Research Area must contain only letters";

  
    if (!form.supervisorName.trim())
      return "Supervisor Name is required";
    if (!onlyLetters.test(form.supervisorName))
      return "Supervisor Name must contain only letters";

  
    if (!form.startYear.trim())
      return "Start Year is required";
    if (!yearRegex.test(form.startYear))
      return "Start Year must be exactly 4 digits";

    
    if (!form.endYear.trim())
      return "End Year is required";
    if (!yearRegex.test(form.endYear))
      return "End Year must be exactly 4 digits";

    if (Number(form.endYear) < Number(form.startYear))
      return "End Year cannot be earlier than Start Year";

    return null;
  };

  
  const savePhd = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const now = new Date().toISOString();

    const payload = {
      studentId,
      ...form,
      startYear: Number(form.startYear),
      endYear: Number(form.endYear),
      createdAt: now,
      updatedAt: now,
    };

    console.log(" PhD Payload:", payload);

    const response = await upsertPhdEducation(payload);

    console.log(" Supabase Response:", response);

    if (response.success) {
      toast.success("PhD education saved successfully!");
    } else {
      toast.error(response.error ?? "Something went wrong!");
    }
  };

  // expose save function to parent
  useEffect(() => {
    onSaveRef.current = savePhd;
  }, [form]);

 
  return (
    <div className="space-y-4">
      <ControlledInput
        label="University Name"
        value={form.universityName}
        onChange={(e) => handleChange("universityName", e.target.value)}
      />

      <ControlledInput
        label="Research Area"
        value={form.researchArea}
        onChange={(e) => handleChange("researchArea", e.target.value)}
      />

      <ControlledInput
        label="Supervisor Name"
        value={form.supervisorName}
        onChange={(e) => handleChange("supervisorName", e.target.value)}
      />

      <div className="flex gap-5 w-[85%]">
        <ControlledInput
          label="Start Year"
          value={form.startYear}
          onChange={(e) => handleChange("startYear", e.target.value)}
        />

        <ControlledInput
          label="End Year"
          value={form.endYear}
          onChange={(e) => handleChange("endYear", e.target.value)}
        />
      </div>
    </div>
  );
}




function Input({ label }: { label: string }) {
  return (
    <div className="space-y-1 w-[85%]">
      <label className="text-sm font-medium text-[#282828]">{label}</label>
      <input
        placeholder={`Enter ${label}`}
        className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm
        focus:outline-none"
      />
    </div>
  );
}

function Select({ label }: { label: string }) {
  return (
    <div className="space-y-1 w-[85%]">
      <label className="text-sm font-medium text-[#282828]">{label}</label>
      <select
        className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm
        focus:outline-none"
      >
        <option value="">Select</option>
        <option value="">Option 1</option>
        <option value="">Option 2</option>
        <option value="">Option 3</option>
      </select>
    </div>
  );
}


