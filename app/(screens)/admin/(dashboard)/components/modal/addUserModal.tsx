"use client";
import React, { useState } from "react";
import { Eye, EyeSlash, X } from "@phosphor-icons/react";
import { Toaster } from "react-hot-toast";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import FacultyTeachingAssignments from "./faculty/FacultyTeachingAssignments";
import { AddUserBasicFields } from "./registration/AddUserBasicFields";
import { StudentRegistrationFields } from "./registration/StudentRegistrationFields";
import { StaffRegistrationFields } from "./registration/StaffRegistrationFields";
import { useAddUserModalState } from "./registration/hooks/useAddUserModalState";
import { submitUserRegistration } from "@/lib/helpers/admin/registrations/userRegistrationSubmit";
import toast from "react-hot-toast";

const ENTRY_TYPES = ["Regular", "Lateral", "Transfer"];
const INTER_ENTRY = ["Regular", "Transfer"];

const validatePassword = (password: string) => {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    return "Password must contain one uppercase, one lowercase, one number and one special character.";
  }
  return null;
};

const AddUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}> = ({ isOpen, onClose, user }) => {
  const {
    adminId: creatorAdminId,
    collegeEducationType,
    loading: isAdminContextLoading,
  } = useAdmin();
  const state = useAddUserModalState(isOpen, user, collegeEducationType);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    basicData, setBasicData, dbData, processingFields, handleWithLoader,
    loading, setLoading, isFetchingData, setIsSuccess,
    selectedEducationId, setSelectedEducationId, selectedBranchId, setSelectedBranchId,
    selectedYearId, setSelectedYearId, selectedSubjectId, setSelectedSubjectId,
    selectedSectionIds, setSelectedSectionIds, selectedDepts, setSelectedDepts,
    selectedYears, setSelectedYears, selectedSections, setSelectedSections,
    selectedSemester, setSelectedSemester, selectedEntryType, setSelectedEntryType,
    selectedSessionType, setSelectedSessionType, selectedFinanceEducationTypes,
    setSelectedFinanceEducationTypes, selectedWellbeingEducationTypes,
    setSelectedWellbeingEducationTypes, sessionOptions,
    adminEducationOptions, assignments, setAssignments, handleBasicChange,
    handleSingleSelect, toggleMultiSelectValue, resetForm, studentSelectedEducation,
    studentAvailableBranches, studentSelectedBranch, studentAvailableYears,
    studentSelectedYear, studentAvailableSemesters, studentAvailableSections,
    selectedSessionId, isSelectedSchool
  } = state;

  const canonicalRole =
    ({
      "Finance Manager": "FinanceManager",
      "Placement Officer": "PlacementOfficer",
      "Wellbeing Manager": "WellbeingManager",
      "College HR": "CollegeHr",
    } as Record<string, string>)[basicData.role] ?? basicData.role;
  const isAdmin = canonicalRole === "Admin";
  const isFaculty = canonicalRole === "Faculty";
  const isStudent = canonicalRole === "Student";
  const isParent = canonicalRole === "Parent";
  const isFinance = canonicalRole === "Finance";
  const isFinanceManager = canonicalRole === "FinanceManager";
  const isAccountant = canonicalRole === "Accountant";
  const showFinanceFields = isFinance || isFinanceManager || isAccountant;
  const isHR = canonicalRole === "CollegeHr";
  const isPlacement = canonicalRole === "PlacementOfficer";
  const isWellbeing = canonicalRole === "WellbeingManager";
  const selectedWellbeingRegistrationType = basicData.wellbeingRegistrationType || "";
  const isWellbeingHostel = isWellbeing && (selectedWellbeingRegistrationType === "Hostel" || selectedWellbeingRegistrationType === "Both");
  const isWellbeingCollege = isWellbeing && (selectedWellbeingRegistrationType === "College" || selectedWellbeingRegistrationType === "Both");

  const showEmploymentFields = !isStudent && !isParent && !isWellbeing && basicData.role !== "";
  const showDateOfJoiningField = !isStudent && !isParent && basicData.role !== "";
  const showRollNoField = isStudent;
  const showEmployeeIdField = !isStudent && !isParent && basicData.role !== "";

  const handleSaveWrapper = async () => {
    if (isAdminContextLoading) {
      return toast.error("Admin information is still loading. Please try again.");
    }
    if (!creatorAdminId) {
      return toast.error("Admin profile was not found. Please refresh and try again.");
    }
    if (!basicData.fullName) return toast.error("Full Name is required.");
    if (!basicData.email) return toast.error("Email is required.");
    if (!basicData.role) return toast.error("Role is required.");

    const hasMobileNumber = Boolean(basicData.mobileNumber?.trim());
    if (!isWellbeing && !basicData.mobileCode) {
      return toast.error("Country code is required.");
    }
    if ((hasMobileNumber || !isWellbeing) && !/^\+[0-9]+$/.test(basicData.mobileCode)) {
      return toast.error("Invalid country code format.");
    }
    if (!isWellbeing && !basicData.mobileNumber) {
      return toast.error("Mobile number is required.");
    }
    if (hasMobileNumber && !/^[0-9]{10}$/.test(basicData.mobileNumber)) {
      return toast.error("Mobile number must be exactly 10 digits.");
    }
    if (hasMobileNumber && basicData.mobileCode === "+91") {
      if (!["6", "7", "8", "9"].includes(basicData.mobileNumber.charAt(0))) {
        return toast.error("Indian mobile number must start with 6, 7, 8, or 9.");
      }
    }

    if (isWellbeing) {
      if (!basicData.dateOfJoining) return toast.error("Date of Joining is required.");
      if (!selectedWellbeingRegistrationType) return toast.error("Registration Type is required.");
      if (isWellbeingHostel) {
        if (!basicData.hostelBlock) return toast.error("Block is required.");
        if (!basicData.buildingNumber) return toast.error("Building Number is required.");
        if (!basicData.hostelType) return toast.error("Hostel Type is required.");
      }
      if (isWellbeingCollege) {
        if (!selectedWellbeingEducationTypes.length) return toast.error("Select Education Type for wellbeing college registration.");
      }
    }

    if (showRollNoField || showEmployeeIdField) {
      const value = basicData.identifierValue;
      if (!value?.trim()) return toast.error(`${showRollNoField ? "Roll no" : "Employee Id"} is required.`);
      const IDENTIFIER_REGEX = /^(?=.*\d)[A-Za-z0-9]+(?:[-/][A-Za-z0-9]+){0,2}$/;
      if (value.length < 6 || value.length > 15 || !IDENTIFIER_REGEX.test(value)) {
        return toast.error(`${showRollNoField ? "Roll no" : "Employee Id"} Must be 6–15 characters and include at least one number. Only letters, numbers and up to two hyphens (-) or slashes (/) allowed.`);
      }
    }

    if (!basicData.gender) return toast.error("Please select a gender.");

    if (isStudent) {
      if (
        !selectedEducationId ||
        (!selectedDepts.length && !isSelectedSchool) ||
        !selectedYears.length ||
        (!["Inter"].includes(studentSelectedEducation?.collegeEducationType || "") && !selectedSemester.length && !isSelectedSchool) ||
        !selectedEntryType.length ||
        !selectedSections.length
      ) {
        return toast.error("Complete all academic fields for Student.");
      }
    }

    if (isParent && !basicData.studentId) return toast.error("Student pin number is required.");

    if (showFinanceFields && !user && !isAccountant) {
      if (!selectedFinanceEducationTypes.length) return toast.error("Select Education Type for Finance.");
    }

    if (isPlacement && !selectedEducationId) return toast.error("Select Education Type for Placement Officer.");

    if (!user) {
      if (!basicData.password) return toast.error("Password is required.");
      const passwordError = validatePassword(basicData.password);
      if (passwordError) return toast.error(passwordError);
      if (!basicData.confirmPassword) return toast.error("Confirm Password is required.");
      if (basicData.password !== basicData.confirmPassword) return toast.error("Password and Confirm Password do not match.");
    }

    await submitUserRegistration({
      basicData: { ...basicData, role: canonicalRole }, user, isAdmin, isFaculty, isStudent, isParent, isFinance, isFinanceManager, isAccountant, isHR, isPlacement, isWellbeing, isWellbeingHostel, isWellbeingCollege, showFinanceFields,
      selectedEducationId, selectedFinanceEducationTypes, selectedWellbeingEducationTypes, selectedEntryType, selectedSemester, selectedSections, selectedSessionId,
      assignments, studentSelectedEducation, studentSelectedBranch, studentSelectedYear, studentAvailableSemesters, studentAvailableSections, isSelectedSchool, dbData,
      creatorAdminId, setLoading, setIsSuccess, resetForm, onClose
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
        <div className="bg-white text-black w-full max-w-137.5 max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-clip animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-medium text-[#282828]">Add User</h2>
            <X
              size={20}
              weight="bold"
              className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
              onClick={onClose}
            />
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex flex-col gap-3.5">
            <AddUserBasicFields
              basicData={basicData}
              handleBasicChange={handleBasicChange}
              isStudent={isStudent}
              isParent={isParent}
              isWellbeing={isWellbeing}
              showEmploymentFields={showEmploymentFields}
              showDateOfJoiningField={showDateOfJoiningField}
              showEmployeeIdField={showEmployeeIdField}
              showRollNoField={showRollNoField}
              ENTRY_TYPES={ENTRY_TYPES}
            />

            {isStudent && (
              <StudentRegistrationFields
                dbData={dbData}
                processingFields={processingFields}
                handleWithLoader={handleWithLoader}
                selectedEducationId={selectedEducationId}
                setSelectedEducationId={setSelectedEducationId}
                selectedDepts={selectedDepts}
                setSelectedDepts={setSelectedDepts}
                selectedYears={selectedYears}
                setSelectedYears={setSelectedYears}
                selectedSemester={selectedSemester}
                setSelectedSemester={setSelectedSemester}
                selectedSections={selectedSections}
                setSelectedSections={setSelectedSections}
                selectedEntryType={selectedEntryType}
                setSelectedEntryType={setSelectedEntryType}
                selectedSessionType={selectedSessionType}
                setSelectedSessionType={setSelectedSessionType}
                studentAvailableBranches={studentAvailableBranches}
                studentAvailableYears={studentAvailableYears}
                studentAvailableSemesters={studentAvailableSemesters}
                studentAvailableSections={studentAvailableSections}
                isSelectedSchool={isSelectedSchool}
                studentSelectedEducation={studentSelectedEducation}
                sessionOptions={sessionOptions}
                handleSingleSelect={handleSingleSelect}
                ENTRY_TYPES={ENTRY_TYPES}
                INTER_ENTRY={INTER_ENTRY}
              />
            )}

            <StaffRegistrationFields
              dbData={dbData}
              basicData={basicData}
              handleBasicChange={handleBasicChange}
              isFinance={isFinance}
              isFinanceManager={isFinanceManager}
              isAccountant={isAccountant}
              showFinanceFields={showFinanceFields}
              selectedFinanceEducationTypes={selectedFinanceEducationTypes}
              setSelectedFinanceEducationTypes={setSelectedFinanceEducationTypes}
              isPlacement={isPlacement}
              selectedEducationId={selectedEducationId}
              setSelectedEducationId={setSelectedEducationId}
              isWellbeing={isWellbeing}
              selectedWellbeingRegistrationType={selectedWellbeingRegistrationType}
              isWellbeingHostel={isWellbeingHostel}
              isWellbeingCollege={isWellbeingCollege}
              selectedWellbeingEducationTypes={selectedWellbeingEducationTypes}
              setSelectedWellbeingEducationTypes={setSelectedWellbeingEducationTypes}
              handleSingleSelect={handleSingleSelect}
              toggleMultiSelectValue={toggleMultiSelectValue}
              adminEducationOptions={adminEducationOptions}
              user={user}
            />

            {isFaculty && (
              <FacultyTeachingAssignments
                dbData={dbData}
                processingFields={processingFields}
                handleWithLoader={handleWithLoader}
                assignments={assignments}
                setAssignments={setAssignments}
                isSelectedSchool={isSelectedSchool}
              />
            )}

            {!user && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={basicData.password}
                      onChange={handleBasicChange}
                      placeholder="Enter password"
                      autoComplete="new-password"
                      className="w-full border border-gray-200 rounded-md px-3 py-2 pr-10 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <Eye size={16} /> : <EyeSlash size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D3748]">
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={basicData.confirmPassword}
                      onChange={handleBasicChange}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      className="w-full border border-gray-200 rounded-md px-3 py-2 pr-10 text-sm outline-none focus:ring-1 focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <Eye size={16} /> : <EyeSlash size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-100 flex gap-4 flex-shrink-0 bg-white rounded-b-2xl">
            <button
              onClick={handleSaveWrapper}
              disabled={loading || isFetchingData || isAdminContextLoading || !creatorAdminId}
              className={`flex-1 focus:outline-none text-white text-sm font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                loading || isFetchingData || isAdminContextLoading || !creatorAdminId
                  ? "bg-[#43C17A]/70 cursor-not-allowed opacity-80"
                  : "bg-[#43C17A] hover:bg-[#3ea876] hover:shadow-md cursor-pointer active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : user ? (
                "Save Changes"
              ) : (
                "Save"
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-gray-200 focus:outline-none cursor-pointer bg-white text-gray-700 text-sm font-bold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUserModal;
