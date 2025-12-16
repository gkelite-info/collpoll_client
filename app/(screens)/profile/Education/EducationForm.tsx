"use client";

import { EducationType } from "./Education";

const TITLES: Record<EducationType, string> = {
  primary: "Primary Education",
  secondary: "Secondary Education",
  undergraduate: "Undergraduate Degree",
  phd: "PhD",
};

export default function EducationForm({ type }: { type: EducationType }) {
  const handleSubmit = () => {
    console.log(`${type} form submitted`);
  };

  return (
    <>
      <h3 className="text-[#43C17A] font-medium mb-3">
        {TITLES[type]}
      </h3>

      {type === "primary" && <PrimaryFields />}
      {type === "secondary" && <SecondaryFields />}
      {type === "undergraduate" && <UndergraduateFields />}
      {type === "phd" && <PhdFields />}
    </>
  );
}

function PrimaryFields() {
  return (
    <div className="space-y-4">
      <Input label="School Name" />
      <Input label="Board" />
      <Input label="Medium of Study" />
      <Input label="Year of Passing" />
      <Input label="Location" />
    </div>
  );
}

function SecondaryFields() {
  return (
    <div className="space-y-4">
      <Input label="Institution Name" />
      <Select label="Board" />
      <Input label="Medium of Study" />
      <Input label="Year of Passing" />
      <Input label="Percentage" />
      <Input label="Passing Year" />
      <Input label="Location" />
    </div>
  );
}

function UndergraduateFields() {
  return (
    <div className="space-y-4">
      <Input label="Course Name" />
      <Select label="Specialization" />
      <Input label="College Name" />
      <Input label="Grading System" />
      <Input label="CGPA out of 10" />
      <div className="flex gap-5 w-[85%]">
        <Input label="Start Year" />
        <Input label="End Year" />
      </div>
      <Select label="Course Type" />
    </div>
  );
}

function PhdFields() {
  return (
    <div className="space-y-4">
      <Input label="University Name" />
      <Input label="Research Area" />
      <Input label="Supervisor Name" />

      <div className="flex gap-5 w-[85%]">
        <Input label="Start Year" />
        <Input label="End Year" />
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
