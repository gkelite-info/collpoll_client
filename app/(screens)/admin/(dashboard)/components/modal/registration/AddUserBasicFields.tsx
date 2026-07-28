import React from "react";
import { Lock } from "@phosphor-icons/react";
import { CustomSingleSelect } from "../userModalComponents";

interface AddUserBasicFieldsProps {
  basicData: any;
  handleBasicChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isStudent: boolean;
  isParent: boolean;
  isWellbeing: boolean;
  showEmploymentFields: boolean;
  showDateOfJoiningField: boolean;
  showEmployeeIdField: boolean;
  showRollNoField: boolean;
  ENTRY_TYPES: string[];
}

export const AddUserBasicFields: React.FC<AddUserBasicFieldsProps> = ({
  basicData,
  handleBasicChange,
  isStudent,
  isParent,
  isWellbeing,
  showEmploymentFields,
  showDateOfJoiningField,
  showEmployeeIdField,
  showRollNoField,
}) => {
  return (
    <>
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#2D3748]">
          Full Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={basicData.fullName}
          onChange={handleBasicChange}
          placeholder="Enter Fullname"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#2D3748]">
          Email ID <span className="text-red-600">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={basicData.email}
          onChange={handleBasicChange}
          placeholder="Enter email address"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
        />
      </div>
      <div className="grid landscape:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            College Code <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={basicData.collegeCode || ""}
              placeholder="Fetching..."
              readOnly
              className={`w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm outline-none cursor-not-allowed ${
                !basicData.collegeCode ? "animate-pulse placeholder-gray-400" : "text-gray-500"
              }`}
            />
            <Lock
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            Mobile {!isWellbeing && <span className="text-red-600">*</span>}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="mobileCode"
              value={basicData.mobileCode}
              onChange={handleBasicChange}
              placeholder="+91"
              className="w-16 border border-gray-200 rounded-md px-2 py-2 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E] text-center shrink-0"
            />
            <input
              type="text"
              name="mobileNumber"
              value={basicData.mobileNumber}
              onChange={handleBasicChange}
              placeholder="Enter mobile number"
              autoComplete="off"
              className="flex-1 min-w-0 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            Role <span className="text-red-600">*</span>
          </label>
          <CustomSingleSelect
            placeholder="Select Role"
            options={[
              "Student",
              "Parent",
              "Faculty",
              "Finance",
              "Finance Manager",
              "Accountant",
              "CollegeHr",
              "Placement Officer",
              "Wellbeing Manager",
              "Admin",
            ]}
            selectedValue={basicData.role}
            onChange={(val) =>
              handleBasicChange({
                target: { name: "role", value: val },
              } as React.ChangeEvent<HTMLInputElement>)
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            Gender <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center gap-4 py-[6px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={basicData.gender === "Male"}
                onChange={handleBasicChange}
                className="w-4 h-4 text-[#48C78E] focus:ring-[#48C78E] cursor-pointer accent-[#48C78E]"
              />
              <span className="text-sm text-gray-700">Male</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={basicData.gender === "Female"}
                onChange={handleBasicChange}
                className="w-4 h-4 text-[#48C78E] focus:ring-[#48C78E] cursor-pointer accent-[#48C78E]"
              />
              <span className="text-sm text-gray-700">Female</span>
            </label>
          </div>
        </div>

        {showDateOfJoiningField && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">
              Date of Joining <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="dateOfJoining"
              value={basicData.dateOfJoining}
              onChange={handleBasicChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
            />
          </div>
        )}

        {showEmploymentFields && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">
              Experience (Years)
            </label>
            <input
              type="number"
              name="professionalExperienceYears"
              value={basicData.professionalExperienceYears ?? ""}
              onChange={handleBasicChange}
              placeholder="e.g. 3.5"
              min="0"
              max="50"
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
            />
          </div>
        )}

        {isParent && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">
              Student Pin Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="studentId"
              value={basicData.studentId}
              onChange={handleBasicChange}
              placeholder="Enter Student Pin Number"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
            />
          </div>
        )}
      </div>

      {(showEmployeeIdField || showRollNoField) && (
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            {showRollNoField ? "Roll no." : "Employee Id"} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="identifierValue"
            value={basicData.identifierValue}
            onChange={handleBasicChange}
            placeholder={`Enter ${showRollNoField ? "Roll no." : "Employee Id"}`}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
          />
        </div>
      )}

      {isStudent && (
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">Batch</label>
          <input
            type="text"
            name="batch"
            value={basicData.batch}
            onChange={handleBasicChange}
            placeholder="e.g. A"
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
          />
        </div>
      )}
    </>
  );
};
