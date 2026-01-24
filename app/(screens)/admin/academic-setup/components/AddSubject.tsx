"use client";

import { useEffect, useState } from "react";

export type SubjectFormData = {
  id?: string;
  subjectName: string;
  degree: string;
  department: string;
};

export default function AddSubject({
  editData,
  onSave, // 🔹 NEW
}: {
  editData: SubjectFormData | null;
  onSave: (data: SubjectFormData) => void;
}) {
  const [form, setForm] = useState<SubjectFormData>({
    subjectName: "",
    degree: "",
    department: "",
  });

  // 🔹 AUTO FILL
  useEffect(() => {
    if (editData) setForm(editData);
    else
      setForm({ subjectName: "", degree: "", department: "" });
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form); // 🔹 CENTRAL SAVE
  };

  return (
    <div className="w-[60%] mx-auto bg-gray-50 p-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-6">
        {editData ? "Edit Subject" : "Add Subject"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="subjectName"
          value={form.subjectName}
          onChange={handleChange}
          placeholder="Subject Name"
          className="w-full px-4 py-2 border rounded-md"
          required
        />

        <input
          name="degree"
          value={form.degree}
          onChange={handleChange}
          placeholder="Degree"
          className="w-full px-4 py-2 border rounded-md"
          required
        />

        <input
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Department"
          className="w-full px-4 py-2 border rounded-md"
          required
        />

        <button className="px-6 py-2 bg-emerald-500 text-white rounded-md cursor-pointer">
          {editData ? "Update Subject" : "Save Subject"}
        </button>
      </form>
    </div>
  );
}
