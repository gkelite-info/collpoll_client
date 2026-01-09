"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CollegeRegistration } from "./components/collegeRegistration";
import { AdminRegistration } from "./components/adminRegistration";

export default function Page() {
  const [activeTab, setActiveTab] = useState("college");

  return (
    <div className="min-h-screen bg-white rounded-xl flex justify-center p-6 mx-4 font-sans">
      <div className="w-full max-w-2xl">
        <h1 className="text-[#333] text-2xl font-bold mb-1">
          {activeTab === "college"
            ? "College Registration"
            : "Admin Registration"}
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Add a new college to the CollPoll network by providing verified
          details below.
        </p>

        <div className="flex justify-center mb-10">
          <div className="bg-[#F0F2F5] p-1.5 rounded-full flex relative w-full max-w-[400px]">
            <motion.div
              layoutId="activeTab"
              className="absolute bg-[#49C77F] rounded-full h-[calc(100%-12px)] top-[6px]"
              animate={{
                left: activeTab === "college" ? "6px" : "50%",
                width: "calc(50% - 9px)",
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
            <button
              onClick={() => setActiveTab("college")}
              className={`flex-1 py-2 rounded-full text-sm font-semibold z-10 ${
                activeTab === "college" ? "text-white" : "text-gray-600"
              }`}
            >
              College Registration
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-2 rounded-full text-sm font-semibold z-10 ${
                activeTab === "admin" ? "text-white" : "text-gray-600"
              }`}
            >
              Admin Registration
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "college" ? (
            <CollegeRegistration key="college" />
          ) : (
            <AdminRegistration key="admin" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
