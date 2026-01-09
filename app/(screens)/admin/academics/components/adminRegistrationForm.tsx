"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

const InputField = ({
  label,
  placeholder,
  type = "text",
  className = "",
}: any) => (
  <div className={`flex flex-col w-full ${className}`}>
    <label className="text-[#333] font-semibold text-[15px] mb-1.5">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:border-[#49C77F] transition-colors shadow-sm"
    />
  </div>
);

const SelectField = ({ label, placeholder, className = "" }: any) => (
  <div className={`flex flex-col w-full relative ${className}`}>
    <label className="text-[#333] font-semibold text-[15px] mb-1.5">
      {label}
    </label>
    <div className="relative">
      <select
        defaultValue=""
        className="appearance-none border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 w-full focus:outline-none focus:border-[#49C77F] bg-white cursor-pointer shadow-sm"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        <option value="1">Option 1</option>
      </select>
      <CaretDown
        size={18}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
    </div>
  </div>
);

const CollegeRegistration = () => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    className="space-y-5"
  >
    <InputField
      label="College Name"
      placeholder="Enter the full official name of the institution."
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="College Email"
        placeholder='e.g., "admin@stjosephs.edu"'
      />
      <div className="flex flex-col">
        <label className="text-[#333] font-semibold text-[15px] mb-1.5">
          Phone
        </label>
        <div className="flex gap-2">
          <input
            disabled
            value="+91"
            className="border border-gray-300 rounded-lg w-16 text-center text-sm text-gray-500 bg-gray-50"
          />
          <input
            placeholder="9017632946"
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#49C77F]"
          />
        </div>
      </div>
    </div>

    <div>
      <h4 className="text-[#333] font-bold text-base mb-3">
        Verification Details
      </h4>
      <div className="flex flex-col gap-1.5">
        <label className="text-[#333] font-semibold text-[14px]">Proof</label>
        <div className="flex gap-4">
          <button className="bg-[#142444] text-white px-8 py-2.5 rounded-md text-sm font-semibold flex-shrink-0 hover:bg-[#0d182d] transition-all">
            Upload File
          </button>
          <div className="border border-dashed border-gray-300 rounded-lg flex-1 flex items-center px-4 text-xs text-gray-500">
            Upload any government/board affiliation proof (PDF, PNG, JPG)
          </div>
        </div>
      </div>
    </div>

    <div>
      <h4 className="text-[#333] font-bold text-base mb-3">Location Details</h4>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <SelectField label="Country" placeholder="Select Country" />
        <SelectField label="State" placeholder="Select State" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <InputField label="City" placeholder='e.g., "Chennai"' />
        <InputField label="Zip / Pincode" placeholder='e.g., "600040"' />
      </div>

      <div className="flex items-end gap-4">
        <InputField
          label="Address"
          placeholder='e.g., "Chennai"'
          className="flex-[3]"
        />
        <button className="flex-3 bg-[#49C77F] text-white h-[42px] rounded-lg font-bold text-lg shadow-md hover:bg-[#3fb070] transition-all">
          Save
        </button>
      </div>
    </div>
  </motion.div>
);

const AdminRegistration = () => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    className="space-y-5"
  >
    <InputField label="FullName" placeholder='e.g., "Admin Mallareddy"' />

    <div className="grid grid-cols-2 gap-4">
      <InputField
        label="Email Address"
        placeholder='e.g., "admin.mallareddy@gmail.com"'
      />
      <div className="flex flex-col">
        <label className="text-[#333] font-semibold text-[15px] mb-1.5">
          Phone
        </label>
        <div className="flex gap-2">
          <input
            disabled
            value="+91"
            className="border border-gray-300 rounded-lg w-16 text-center text-sm text-gray-500 bg-gray-50"
          />
          <input
            placeholder="9017632946"
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#49C77F]"
          />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <InputField label="College ID" placeholder='e.g., "MRCE001"' />
      <InputField label="College Code" placeholder='e.g., "MRCE"' />
    </div>

    <div>
      <h4 className="text-[#333] font-bold text-base mb-3">Security Setup</h4>
      <InputField
        label="Password"
        type="password"
        placeholder="Minimum 8 characters..."
        className="mb-4"
      />

      <div className="flex items-end gap-4">
        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password..."
          className="flex-[3]"
        />
      </div>
      <button className=" my-6 bg-[#49C77F] text-white h-[42px] w-[50%] rounded-lg font-bold text-lg shadow-md hover:bg-[#3fb070] transition-all">
        Save
      </button>
    </div>
  </motion.div>
);

export default function RegistrationForm() {
  const [activeTab, setActiveTab] = useState("college");

  return (
    <div className="min-h-screen bg-white flex justify-center p-6 font-sans">
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
