import React, { useMemo } from "react";
import { CustomMultiSelect, CustomSingleSelect } from "@/app/(screens)/admin/(dashboard)/components/modal/userModalComponents";

interface StudentRegistrationFieldsProps {
  dbData: any;
  processingFields: Record<string, boolean>;
  handleWithLoader: (fieldId: string, action: () => void) => void;
  selectedEducationId: number | null;
  setSelectedEducationId: (val: number | null) => void;
  selectedDepts: string[];
  setSelectedDepts: React.Dispatch<React.SetStateAction<string[]>>;
  selectedYears: string[];
  setSelectedYears: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSemester: string[];
  setSelectedSemester: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSections: string[];
  setSelectedSections: React.Dispatch<React.SetStateAction<string[]>>;
  selectedEntryType: string[];
  setSelectedEntryType: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSessionType: string[];
  setSelectedSessionType: React.Dispatch<React.SetStateAction<string[]>>;
  studentAvailableBranches: any[];
  studentAvailableYears: any[];
  studentAvailableSemesters: any[];
  studentAvailableSections: any[];
  isSelectedSchool: boolean;
  studentSelectedEducation: any;
  sessionOptions: any[];
  handleSingleSelect: (value: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => void;
  ENTRY_TYPES: string[];
  INTER_ENTRY: string[];
}

export const StudentRegistrationFields: React.FC<StudentRegistrationFieldsProps> = ({
  dbData,
  processingFields,
  handleWithLoader,
  selectedEducationId,
  setSelectedEducationId,
  selectedDepts,
  setSelectedDepts,
  selectedYears,
  setSelectedYears,
  selectedSemester,
  setSelectedSemester,
  selectedSections,
  setSelectedSections,
  selectedEntryType,
  setSelectedEntryType,
  selectedSessionType,
  setSelectedSessionType,
  studentAvailableBranches,
  studentAvailableYears,
  studentAvailableSemesters,
  studentAvailableSections,
  isSelectedSchool,
  studentSelectedEducation,
  sessionOptions,
  handleSingleSelect,
  ENTRY_TYPES,
  INTER_ENTRY,
}) => {
  const degreeOptions = useMemo(() => dbData.educations.map((e: any) => e.collegeEducationType), [dbData.educations]);
  const branchOptions = useMemo(() => studentAvailableBranches.map((b) => b.collegeBranchCode), [studentAvailableBranches]);
  const yearOptions = useMemo(() => studentAvailableYears.map((y) => y.collegeAcademicYear), [studentAvailableYears]);
  const semesterOptions = useMemo(() => studentAvailableSemesters.map((s) => s.collegeSemester.toString()), [studentAvailableSemesters]);
  const sectionOptions = useMemo(() => studentAvailableSections.map((s) => s.collegeSections), [studentAvailableSections]);
  
  const filteredSessionOptions = useMemo(
    () =>
      selectedEducationId
        ? sessionOptions.filter((s) => s.collegeEducationId === selectedEducationId)
        : sessionOptions,
    [sessionOptions, selectedEducationId]
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            Degree / Education <span className="text-red-600">*</span>
          </label>
          <CustomSingleSelect
            options={degreeOptions}
            selectedValue={
              selectedEducationId
                ? dbData.educations.find((e: any) => e.collegeEducationId === selectedEducationId)?.collegeEducationType || ""
                : ""
            }
            onChange={(value) => {
              handleWithLoader("studentEducation", () => {
                const ed = dbData.educations.find((e: any) => e.collegeEducationType === value);
                setSelectedEducationId(ed?.collegeEducationId || null);
                setSelectedDepts([]);
                setSelectedYears([]);
                setSelectedSections([]);
                setSelectedSemester([]);
                setSelectedEntryType([]);
              });
            }}
            placeholder="Select degree"
            isProcessing={processingFields["studentEducation"]}
          />
        </div>

        {!isSelectedSchool && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">
              Department <span className="text-red-600">*</span>
            </label>
            <CustomSingleSelect
              options={branchOptions}
              selectedValue={selectedDepts[0] || ""}
              onChange={(val) => {
                handleWithLoader("studentDept", () => {
                  handleSingleSelect(val, setSelectedDepts);
                  setSelectedYears([]);
                  setSelectedSections([]);
                  setSelectedSemester([]);
                });
              }}
              placeholder="Select department"
              disabled={!selectedEducationId}
              isProcessing={processingFields["studentDept"]}
            />
          </div>
        )}
      </div>

      <div className="grid landscape:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            {isSelectedSchool ? "Class" : "Year"} <span className="text-red-600">*</span>
          </label>
          <CustomSingleSelect
            options={yearOptions}
            selectedValue={selectedYears[0] || ""}
            onChange={(val) => {
              handleWithLoader("studentYear", () => {
                handleSingleSelect(val, setSelectedYears);
                setSelectedSections([]);
                setSelectedSemester([]);
              });
            }}
            placeholder={`Select ${isSelectedSchool ? "class" : "year"}`}
            disabled={(!selectedDepts.length && !isSelectedSchool) || !selectedEducationId}
            isProcessing={processingFields["studentYear"]}
          />
        </div>

        {!["Inter"].includes(studentSelectedEducation?.collegeEducationType || "") && !isSelectedSchool && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">
              Semester <span className="text-red-600">*</span>
            </label>
            <CustomSingleSelect
              options={semesterOptions}
              selectedValue={selectedSemester[0] || ""}
              onChange={(val) => handleSingleSelect(val, setSelectedSemester)}
              placeholder="Select semester"
              disabled={!selectedYears.length}
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            Entry Type <span className="text-red-600">*</span>
          </label>
          <CustomSingleSelect
            options={
              ["Inter"].includes(studentSelectedEducation?.collegeEducationType || "")
                ? INTER_ENTRY
                : ENTRY_TYPES
            }
            selectedValue={selectedEntryType[0] || ""}
            onChange={(val) => handleSingleSelect(val, setSelectedEntryType)}
            placeholder="Select Entry"
            disabled={!selectedEducationId}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            Section <span className="text-red-600">*</span>
          </label>
          <CustomSingleSelect
            options={sectionOptions}
            selectedValue={selectedSections[0] || ""}
            onChange={(val) => handleSingleSelect(val, setSelectedSections)}
            placeholder="Select section"
            disabled={!selectedYears.length}
          />
        </div>

        {filteredSessionOptions.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">
              Session Types
            </label>
            <CustomSingleSelect
              options={filteredSessionOptions.map((s) => s.label)}
              selectedValue={selectedSessionType[0] || ""}
              onChange={(val) => handleSingleSelect(val, setSelectedSessionType)}
              placeholder="Select Session Types"
              disabled={!selectedEducationId}
            />
          </div>
        )}
      </div>
    </>
  );
};
