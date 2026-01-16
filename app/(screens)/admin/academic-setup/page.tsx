"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AddAcademicSetup from "./components/AddAcademicSetup";
import ViewAcademicStructure from "./components/ViewAcademicStructure";

export type AcademicData = {
  degree: string;
  dept: string;
  year: string;
  sections: string;
};

type Tab = "view" | "add";

export default function AcademicSetup() {
  const [activeTab, setActiveTab] = useState<Tab>("view");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    console.log("🔍 Raw localStorage user:", stored);
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const finalUser = Array.isArray(parsed) ? parsed[0] : parsed;


    console.log("✅ Parsed user object:", finalUser);
    console.log("🆔 userId (adminId):", finalUser?.userId, typeof finalUser?.userId);
    setUser(finalUser);
  }, []);

  //   // 🔥 HANDLE ARRAY CASE
  //   setUser(Array.isArray(parsed) ? parsed[0] : parsed);
  // }, []);

  const tabs = [
    { id: "view", label: "View Academic Structure" },
    { id: "add", label: "Add Academic Setup" },
  ];

  const [editData, setEditData] = useState<AcademicData | null>(null);

  const handleEdit = (row: AcademicData) => {
    setEditData(row);
    setActiveTab("add");
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

        <div className="flex justify-center mb-10">
          <div className="relative flex items-center bg-gray-100 p-1.5 rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`relative cursor-pointer px-6 py-2 text-sm font-semibold z-10 ${activeTab === tab.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}

                {activeTab === tab.id && (
                  <motion.div
                    layoutId="academic-pill"
                    className="absolute inset-0 rounded-full -z-10"
                    style={{
                      background:
                        "linear-gradient(180deg, #34D399 0%, #10B981 100%)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 28,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* {activeTab === "view" && <ViewAcademicStructure onEdit={handleEdit}  adminId={user?.userId}
 />} */}
        {activeTab === "view" && (
          <>
            {console.log("➡️ Passing adminId to ViewAcademicStructure:", user?.userId)}
            <ViewAcademicStructure
              onEdit={handleEdit}
              adminId={user?.userId}
            />
          </>
        )}

        {activeTab === "add" && <AddAcademicSetup editData={editData} />}
      </div>
    </section>
  );
}
