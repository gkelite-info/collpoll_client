"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AddAcademicSetup, { AcademicData } from "./components/AddAcademicSetup";
import ViewAcademicStructure, {
  AcademicViewData,
} from "./components/ViewAcademicStructure";
import ViewSubjects, {
  SubjectViewData,
} from "./components/ViewSubjects";
import AddSubject, { SubjectFormData } from "./components/AddSubject";
import toast from "react-hot-toast";

type Tab = "view" | "add" | "view-subject" | "add-subject";

export default function AcademicSetup() {
  const [activeTab, setActiveTab] = useState<Tab>("view");
  const [editData, setEditData] = useState<AcademicData | null>(null);
  const [editSubject, setEditSubject] =
    useState<SubjectFormData | null>(null);

  const [subjects, setSubjects] = useState<SubjectViewData[]>([
    {
      id: "1",
      subjectName: "Mathematics",
      degree: "B.Tech",
      department: "CSE",
    },
    {
      id: "2",
      subjectName: "Physics",
      degree: "B.Sc",
      department: "Science",
    },
  ]);

  const tabs = [
    { id: "view", label: "View Academic Structure" },
    { id: "add", label: "Add Academic Setup" },
    { id: "add-subject", label: "Add Subject" },
    { id: "view-subject", label: "View Subjects" },
  ];

  const handleEdit = (row: AcademicViewData) => {
    const extractNames = (arr: any[]) => {
      if (!Array.isArray(arr)) return [];

      return arr
        .map((item) => {
          if (typeof item === "string" || typeof item === "number")
            return String(item);

          if (item && typeof item === "object") {
            return item.name || item.code || item.label || item.value || "";
          }

          return "";
        })
        .filter((val) => val !== "" && val !== "[object Object]");
    };

    const sanitizedData: AcademicData = {
      id: row.id,
      degree: row.degree,
      dept: row.dept,
      year: extractNames(row.year),
      sections: extractNames(row.sections),
    };

    setEditData(sanitizedData);
    setActiveTab("add");
  };

  const handleSaveSuccess = () => {
    setEditData(null);
    setActiveTab("view");
  };

  const handleSubjectEdit = (row: SubjectViewData) => {
    setEditSubject(row);
    setActiveTab("add-subject");
  };

  const handleSubjectSave = (data: SubjectFormData) => {
    if (data.id) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
      );
      toast.success("Subject updated successfully");
    } else {
      setSubjects((prev) => [
        ...prev,
        { ...data, id: Date.now().toString() },
      ]);
      toast.success("Subject added successfully");
    }

    setEditSubject(null);
    setActiveTab("view-subject");
  };

  return (
    <section className="min-h-[85vh] p-2">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-8 min-h-[84vh]">
        <h1 className="text-xl font-bold text-[#282828] mb-1">
          Academic Structure
        </h1>
        <p className="text-[#5C5C5C] mb-8 text-sm">
          Add new academic structures for your institution.
        </p>

        <div className="flex justify-center mb-10">
          <div className="relative flex items-center bg-gray-100 p-1.5 rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as Tab);
                  if (tab.id === "add") setEditData(null);
                }}
                className={`relative cursor-pointer px-6 py-2 text-sm font-semibold z-10 ${activeTab === tab.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="academic-pill"
                    className="absolute shadow-[0_2px_8px_rgba(16,185,129,0.4)] inset-0 rounded-full -z-10"
                    style={{
                      background:
                        "linear-gradient(180deg, #34D399 0%, #10B981 100%)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "view" && <ViewAcademicStructure onEdit={handleEdit} />}

        {activeTab === "add" && (
          <AddAcademicSetup editData={editData} onSuccess={handleSaveSuccess} />
        )}
        {activeTab === "view-subject" && (
          <ViewSubjects
            data={subjects} // 🔹 NEW
            onEdit={handleSubjectEdit}
          />
        )}

        {activeTab === "add-subject" && (
          <AddSubject
            editData={editSubject}
            onSave={handleSubjectSave} // 🔹 NEW
          />
        )}
      </div>
    </section>
  );
}
