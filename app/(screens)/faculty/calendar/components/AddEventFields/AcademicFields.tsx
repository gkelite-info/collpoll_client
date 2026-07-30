"use client";

import { ModalSelect } from "./ModalSelect";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

interface AcademicFieldsProps {
  educationId?: number;
  setEducationId: (id: number) => void;
  educations: any[];
  branchId?: number;
  setBranchId: (id: number) => void;
  branches: any[];
  academicYearId?: number;
  setAcademicYearId: (id: number) => void;
  academicYears: any[];
  semester?: number;
  setSemester: (sem: number) => void;
  semesters: any[];
  facultyEduType: string | null;
  INPUT_HEIGHT: string;
  isSingleSubject: boolean;
}

const AcademicFields: React.FC<AcademicFieldsProps> = ({
  educationId,
  setEducationId,
  educations,
  branchId,
  setBranchId,
  branches,
  academicYearId,
  setAcademicYearId,
  academicYears,
  semester,
  setSemester,
  semesters,
  facultyEduType,
  INPUT_HEIGHT,
  isSingleSubject,
}) => {
  const isSchool = isSchoolEducation(facultyEduType);
  const isInter = facultyEduType === "Inter";

  const educationInput = (
    <div className="flex-1 w-full min-w-0">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Education Type <span className="text-red-500">*</span>
      </label>
      {isSingleSubject || educations.length <= 1 ? (
        <input
          readOnly
          value={educations.find((e) => e.collegeEducationId === educationId)?.collegeEducationType || ""}
          placeholder="Select Education"
          className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9] rounded-lg px-3 bg-gray-50 text-gray-900 cursor-not-allowed outline-none placeholder:text-gray-400`}
        />
      ) : (
        <ModalSelect
          value={educationId}
          options={educations.map((e) => ({ value: e.collegeEducationId, label: e.collegeEducationType }))}
          onChange={(val) => setEducationId(Number(val))}
          placeholder="Select Education"
          INPUT_HEIGHT={INPUT_HEIGHT}
        />
      )}
    </div>
  );

  const branchInput = (
    <div className="flex-1 w-full min-w-0">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Branch <span className="text-red-500">*</span>
      </label>
      {isSingleSubject || branches.length <= 1 ? (
        <input
          type="text"
          readOnly
          value={branches.find((b) => b.collegeBranchId === branchId)?.collegeBranchCode || ""}
          placeholder="Select Branch"
          className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9] rounded-lg px-3 bg-gray-50 text-gray-900 cursor-not-allowed outline-none placeholder:text-gray-400`}
        />
      ) : (
        <ModalSelect
          value={branchId}
          options={branches.map((b) => ({ value: b.collegeBranchId, label: b.collegeBranchCode }))}
          onChange={(val) => setBranchId(Number(val))}
          placeholder="Select Branch"
          INPUT_HEIGHT={INPUT_HEIGHT}
        />
      )}
    </div>
  );

  const yearInput = (
    <div className="flex-1 w-full min-w-0">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {isSchool ? "Class / Year" : "Year"} <span className="text-red-500">*</span>
      </label>
      {isSingleSubject || academicYears.length <= 1 ? (
        <input
          readOnly
          value={academicYears.find((y) => y.collegeAcademicYearId === academicYearId)?.collegeAcademicYear || ""}
          placeholder="Select Year"
          className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9] rounded-lg px-3 bg-gray-50 text-gray-900 cursor-not-allowed outline-none placeholder:text-gray-400`}
        />
      ) : (
        <ModalSelect
          value={academicYearId}
          options={academicYears.map((y) => ({ value: y.collegeAcademicYearId, label: y.collegeAcademicYear }))}
          onChange={(val) => setAcademicYearId(Number(val))}
          placeholder="Select Year"
          INPUT_HEIGHT={INPUT_HEIGHT}
        />
      )}
    </div>
  );

  const semesterInput = (
    <div className="flex-1 w-full min-w-0">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Semester <span className="text-red-500">*</span>
      </label>
      {isSingleSubject || semesters.length <= 1 ? (
        <input
          readOnly
          value={semesters.find((s) => s.collegeSemesterId === semester)?.collegeSemester ? `Semester ${semesters.find((s) => s.collegeSemesterId === semester)?.collegeSemester}` : ""}
          placeholder="Select Semester"
          className={`w-full ${INPUT_HEIGHT} border border-[#C9C9C9] rounded-lg px-3 bg-gray-50 text-gray-900 cursor-not-allowed outline-none placeholder:text-gray-400`}
        />
      ) : (
        <ModalSelect
          value={semester}
          options={semesters.map((s) => ({ value: s.collegeSemesterId, label: `Semester ${s.collegeSemester}` }))}
          onChange={(val) => setSemester(Number(val))}
          placeholder="Select Semester"
          INPUT_HEIGHT={INPUT_HEIGHT}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {isSchool ? (
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {educationInput}
          {yearInput}
        </div>
      ) : isInter ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {educationInput}
            {branchInput}
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {yearInput}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {educationInput}
            {branchInput}
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {yearInput}
            {semesterInput}
          </div>
        </>
      )}
    </div>
  );
};

export default AcademicFields;
