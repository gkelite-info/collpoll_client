"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AddAcademicSetup, { AcademicData } from "./components/AddAcademicSetup";
import ViewAcademicStructure, {
  AcademicViewData,
} from "./components/ViewAcademicStructure";

type Tab = "view" | "add";

export default function AcademicSetup() {
  const [activeTab, setActiveTab] = useState<Tab>("view");
  const [editData, setEditData] = useState<AcademicData | null>(null);

  const tabs = [
    { id: "view", label: "View Academic Structure" },
    { id: "add", label: "Add Academic Setup" },
  ];

  // --- Handle Edit Click ---
  const handleEdit = (row: AcademicViewData) => {
    // TRANSFORM DATA: Object Array -> String Array
    const extractNames = (arr: any[]) => {
      if (!Array.isArray(arr)) return [];

      return arr
        .map((item) => {
          // 1. If it's already a string/number, return it
          if (typeof item === "string" || typeof item === "number")
            return String(item);

          // 2. If it's an object, try to find a valid text property
          if (item && typeof item === "object") {
            return item.name || item.code || item.label || item.value || "";
            // Returning "" filters it out below if properties are missing
          }

          return "";
        })
        .filter((val) => val !== "" && val !== "[object Object]"); // Filter out invalid entries
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

  // --- Handle Successful Save ---
  const handleSaveSuccess = () => {
    setEditData(null);
    setActiveTab("view");
  };

  return (
    <section className="min-h-[85vh] p-2">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-[#282828] mb-1">
          Academic Structure
        </h1>
        <p className="text-[#5C5C5C] mb-8 text-sm">
          Add new academic structures for your institution.
        </p>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="relative flex items-center bg-gray-100 p-1.5 rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as Tab);
                  if (tab.id === "add") setEditData(null);
                }}
                className={`relative cursor-pointer px-6 py-2 text-sm font-semibold z-10 ${
                  activeTab === tab.id
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

        {/* Tab Content */}
        {activeTab === "view" && <ViewAcademicStructure onEdit={handleEdit} />}

        {activeTab === "add" && (
          <AddAcademicSetup editData={editData} onSuccess={handleSaveSuccess} />
        )}
      </div>
    </section>
  );
}
