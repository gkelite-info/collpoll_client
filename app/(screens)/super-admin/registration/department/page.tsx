"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InputField } from "../components/reusableComponents";
import { insertEducationDepartments } 
  from "@/lib/helpers/superadmin/insertdepartment";


type DepartmentItem = {
  uuid: string;
  name: string;
  code: string;
};

export default function Department() {
  const [educationId, setEducationId] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(false);


  const addDepartment = () => {
    const name = departmentName.trim();
    const code = departmentCode.trim();

    if (!name || !code) {
      alert("Department name and code are required");
      return;
    }

    if (
      departments.some(
        (d) =>
          d.name.toLowerCase() === name.toLowerCase() ||
          d.code.toLowerCase() === code.toLowerCase()
      )
    ) {
      alert("Department name or code already added");
      return;
    }

    setDepartments((prev) => [
      ...prev,
      { uuid: crypto.randomUUID(), name, code },
    ]);

    setDepartmentName("");
    setDepartmentCode("");
  };

  
  const handleSubmit = async () => {
    try {
      const eduId = Number(educationId);

      if (!eduId || eduId < 1) {
        alert("Education ID must be 1 or greater");
        return;
      }

      if (departments.length === 0) {
        alert("Add at least one department");
        return;
      }

      setLoading(true);

      const payload = {
        educationId: eduId,
        departments,
      };

      console.log("Submitting payload:", payload);

      const res = await insertEducationDepartments(payload);
      console.log("Saved:", res);

      alert("Departments saved successfully");

     
      setDepartments([]);
      setDepartmentName("");
      setDepartmentCode("");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-5"
    >
      <InputField
        label="Education ID"
        name="educationId"
        type="number"
        placeholder="1"
        value={educationId}
        onChange={(e: any) => setEducationId(e.target.value)}
        
      />

      <div className="grid grid-cols-3 gap-4 items-end">
        <InputField
          label="Department Name"
          name="departmentName"
          value={departmentName}
          onChange={(e: any) => setDepartmentName(e.target.value)}
        />

        <InputField
          label="Department Code"
          name="departmentCode"
          value={departmentCode}
          onChange={(e: any) => setDepartmentCode(e.target.value)}
        />

        <button
          type="button"
          onClick={addDepartment}
          className="bg-[#49C77F] text-white h-[42px] rounded-lg font-semibold hover:bg-[#3fb070]"
        >
          Add
        </button>
      </div>

      {departments.map((d, i) => (
        <div
          key={d.uuid}
          className="flex justify-between items-center
                     bg-[#F9FAFB] border border-gray-200
                     px-4 py-2 rounded-md
                     text-sm text-gray-900"
        >
          <span className="font-semibold">
            {i + 1}. {d.name}
          </span>
          <span className="text-gray-600 text-xs font-mono">
            {d.code}
          </span>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`bg-[#49C77F] text-white h-[42px] px-8 rounded-lg font-bold text-lg shadow-md ${
            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#3fb070]"
          }`}
        >
          {loading ? "Saving..." : "Save Departments"}
        </button>
      </div>
    </motion.div>
  );
}
