"use client";
import React, { useState } from "react";
import { X, CaretDown } from "@phosphor-icons/react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    collegeId: "",
    mobile: "",
    role: "Faculty",
    rollNumber: "",
    degree: "BSC",
    password: "",
    confirmPassword: "",
    gender: "Female",
  });

  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (val: string, type: "dept" | "sec") => {
    if (!val) return;
    if (type === "dept") {
      if (!selectedDepts.includes(val))
        setSelectedDepts([...selectedDepts, val]);
    } else {
      if (!selectedSections.includes(val))
        setSelectedSections([...selectedSections, val]);
    }
  };

  const removeTag = (tag: string, type: "dept" | "sec") => {
    if (type === "dept")
      setSelectedDepts(selectedDepts.filter((t) => t !== tag));
    else setSelectedSections(selectedSections.filter((t) => t !== tag));
  };

  const isAdmin = formData.role === "Admin";
  const isParent = formData.role === "Parent";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white text-black w-full max-w-[480px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-[#2D3748]">Add User</h2>
          <X
            size={18}
            weight="bold"
            className="cursor-pointer text-gray-400 hover:text-red-500"
            onClick={onClose}
          />
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar flex flex-col gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">Email ID</label>
            <input
              type="email"
              name="email"
              placeholder="name@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                College ID
              </label>
              <input
                type="text"
                placeholder="ID9876345678"
                className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">Mobile</label>
              <div className="flex">
                <span className="border border-r-0 border-gray-200 rounded-l-lg px-2 py-2 text-xs text-gray-400 bg-gray-50 flex items-center">
                  +91
                </span>
                <input
                  type="text"
                  placeholder="9078972084"
                  className="w-full border border-gray-200 rounded-r-lg p-2 text-sm outline-none flex-1"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">Role</label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm appearance-none outline-none bg-white"
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Parent">Parent</option>
                  <option value="Admin">Admin</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              {formData.role === "Student" && (
                <>
                  <label className="text-xs font-bold text-[#2D3748]">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none"
                  />
                </>
              )}
              {formData.role === "Faculty" && (
                <>
                  <label className="text-xs font-bold text-[#2D3748]">
                    Degree
                  </label>
                  <div className="relative">
                    <select
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm appearance-none outline-none bg-white"
                    >
                      <option value="BSC">BSC</option>
                      <option value="MSC">MSC</option>
                    </select>
                    <CaretDown
                      size={12}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Department
              </label>
              <div className="relative">
                <select
                  disabled={isAdmin || isParent}
                  onChange={(e) => handleMultiSelect(e.target.value, "dept")}
                  className={`w-full border border-gray-200 rounded-lg p-2 text-sm appearance-none outline-none ${
                    isAdmin || isParent
                      ? "bg-gray-50 cursor-not-allowed"
                      : "bg-white"
                  }`}
                >
                  <option value="">
                    {selectedDepts.length} Department(s) selected
                  </option>
                  <option value="ECE">ECE</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedDepts.map((d) => (
                  <span
                    key={d}
                    className="bg-[#E1F7EC] text-[#3EAD6F] text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                  >
                    {d}{" "}
                    <X
                      size={10}
                      className="cursor-pointer"
                      onClick={() => removeTag(d, "dept")}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Section
              </label>
              <div className="relative">
                <select
                  disabled={isAdmin || isParent}
                  onChange={(e) => handleMultiSelect(e.target.value, "sec")}
                  className={`w-full border border-gray-200 rounded-lg p-2 text-sm appearance-none outline-none ${
                    isAdmin || isParent
                      ? "bg-gray-50 cursor-not-allowed"
                      : "bg-white"
                  }`}
                >
                  <option value="">
                    {selectedSections.length} Section(s) Selected
                  </option>
                  <option value="ECE-B">ECE-B</option>
                  <option value="CIVIL-B">CIVIL-B</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedSections.map((s) => (
                  <span
                    key={s}
                    className="bg-[#E1F7EC] text-[#3EAD6F] text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                  >
                    {s}{" "}
                    <X
                      size={10}
                      className="cursor-pointer"
                      onClick={() => removeTag(s, "sec")}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Password
              </label>
              <input
                type="password"
                disabled={isAdmin}
                placeholder="Enter Password"
                className={`w-full border border-gray-200 rounded-lg p-2 text-sm outline-none ${
                  isAdmin ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Confirm Password
              </label>
              <input
                type="password"
                disabled={isAdmin}
                placeholder="Confirm Password"
                className={`w-full border border-gray-200 rounded-lg p-2 text-sm outline-none ${
                  isAdmin ? "bg-gray-50" : ""
                }`}
              />
            </div>
          </div>

          <div className="mt-1 flex-shrink-0">
            <label className="text-xs font-bold text-[#2D3748]">Gender</label>
            <div className="flex gap-6 mt-1">
              {["Male", "Female"].map((g) => (
                <label
                  key={g}
                  className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                    className="accent-[#48C78E] h-4 w-4"
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer Buttons */}
        <div className="px-5 py-4 border-t border-gray-50 flex gap-3 flex-shrink-0 bg-white">
          <button className="flex-1 bg-[#48C78E] text-white text-sm font-bold py-2.5 rounded-lg hover:opacity-90 transition-all">
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-500 text-sm font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
