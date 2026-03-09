"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { InputField } from "../components/reusableComponents";
import toast from "react-hot-toast";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { EducationDropdown, getEducationDropdown } from "@/lib/helpers/superadmin/fetchEducations";
import { insertEducationDepartments } from "@/lib/helpers/superadmin/insertdepartment";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [educations, setEducations] = useState<EducationDropdown[]>([]);

  useEffect(() => {
    const loadEducations = async () => {
      const res = await getEducationDropdown();

      if (!res.success) {
        toast.error(res.error);
      } else {
        setEducations(res.data);
      }
    };

    loadEducations();
  }, []);

  const handleAddOrUpdate = () => {
    const name = departmentName.trim();
    const code = departmentCode.trim();
    if (!educationId) {
      toast.error("Education ID is required.");
      return;
    }
    if (!name) {
      toast.error("Department name is required.");
      return;
    }
    if (!code) {
      toast.error("Department code is required.");
      return;
    }

    const isDuplicate = departments.some(
      (d) =>
        d.uuid !== editingId &&
        (d.name.toLowerCase() === name.toLowerCase() ||
          d.code.toLowerCase() === code.toLowerCase())
    );

    if (isDuplicate) {
      toast.error("Department name or code already exists");
      return;
    }

    if (editingId) {
      setDepartments((prev) =>
        prev.map((d) => (d.uuid === editingId ? { ...d, name, code } : d))
      );
      setEditingId(null);
    } else {
      setDepartments((prev) => [
        ...prev,
        { uuid: crypto.randomUUID(), name, code },
      ]);
    }

    setDepartmentName("");
    setDepartmentCode("");
  };

  const handleEdit = (department: DepartmentItem) => {
    setDepartmentName(department.name);
    setDepartmentCode(department.code);
    setEditingId(department.uuid);
  };

  const handleCancelEdit = () => {
    setDepartmentName("");
    setDepartmentCode("");
    setEditingId(null);
  };

  const handleDelete = (uuid: string) => {
    if (editingId === uuid) {
      handleCancelEdit();
    }
    setDepartments((prev) => prev.filter((d) => d.uuid !== uuid));
  };

  const handleSubmit = async () => {
    try {
      const eduId = Number(educationId);

      if (!eduId || eduId < 1) {
        toast.error("Education ID must be 1 or greater");
        return;
      }

      if (departments.length === 0) {
        toast.error("Add at least one department");
        return;
      }

      setLoading(true);

      const payload = {
        educationId: eduId,
        departments,
      };

      await insertEducationDepartments(payload);

      toast.success("Departments saved successfully");
      setDepartments([]);
      setDepartmentName("");
      setDepartmentCode("");
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-4 max-w-[980px]"
    >
      <div className="grid grid-cols-2 gap-[32px]">
        <div className="flex flex-col">
          <label className="text-[#282828] font-semibold text-[15px] mb-1.5">
            Education Type
          </label>

          <select
            value={educationId}
            onChange={(e) => setEducationId(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-2.5 text-sm text-[#282828]
               focus:outline-none focus:border-[#49C77F] cursor-pointer"
          >
            <option value="">Select education</option>

            {educations.map((edu) => (
              <option key={edu.educationId} value={edu.educationId}>
                {edu.educationName}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Department Name"
          name="departmentName"
          placeholder="Enter Department Name"
          value={departmentName}
          onChange={(e: any) => setDepartmentName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-[32px] items-end">
        <InputField
          label="Department Code"
          name="departmentCode"
          placeholder="Enter Department Code"
          value={departmentCode}
          onChange={(e: any) => setDepartmentCode(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddOrUpdate}
            className={`flex-1 cursor-pointer text-white h-[42px] rounded-lg font-semibold transition-colors ${editingId
              ? "bg-blue-600"
              : "bg-[#49C77F]"
              }`}
          >
            {editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 bg-gray-200 cursor-pointer text-gray-700 h-[42px] rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {departments.map((d, i) => (
          <div
            key={d.uuid}
            className={`flex justify-between items-center px-4 py-3 rounded-md text-sm text-gray-900 border transition-all ${editingId === d.uuid
              ? "bg-blue-50 border-blue-300 shadow-sm"
              : "bg-[#F9FAFB] border-gray-200"
              }`}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-base">
                {i + 1}. {d.name}
              </span>
              <span className="text-gray-500 text-xs font-mono mt-0.5">
                Code: {d.code}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleEdit(d)}
                className="text-blue-600 cursor-pointer"
                title="Edit"
              >
                <PencilSimpleIcon size={22} />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(d.uuid)}
                className="text-red-600  cursor-pointer"
                title="Delete"
              >
                <TrashIcon size={22} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`bg-[#49C77F] text-white
             h-[43px] w-[300px]
             rounded-md font-semibold
             flex items-center justify-center
             hover:bg-[#3fb070] transition-colors
      ${loading
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-[#3ab06d] cursor-pointer"
            }
    `}
        >
          {loading ? "Saving..." : "Save Departments"}
        </button>
      </div>
    </motion.div>
  );
}