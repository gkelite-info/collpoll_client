import React, { useMemo } from "react";
import { Trash, Copy, CaretDown, CheckCircle } from "@phosphor-icons/react";
import { AssignmentRow } from "./facultyAssignmentTypes";
import { CustomMultiSelect, CustomSingleSelect } from "@/app/(screens)/admin/(dashboard)/components/modal/userModalComponents";

type FacultyAssignmentRowProps = {
  row: AssignmentRow;
  index: number;
  isSchool: boolean;
  educationType: string;
  educationId: number | null;
  branchId: number | null;
  dbData: { years: any[]; sections: any[]; subjects: any[]; semesters: any[] };
  canRemove: boolean;
  onUpdate: (rowId: string, field: string, value: any) => void;
  onToggleSection: (rowId: string, sectionId: number) => void;
  onRemove: (rowId: string) => void;
  onDuplicate: (rowId: string) => void;
  processingFields: Record<string, boolean>;
  handleWithLoader: (fieldId: string, action: () => void) => void;
};

export default function FacultyAssignmentRow({
  row,
  index,
  isSchool,
  educationType,
  educationId,
  branchId,
  dbData,
  canRemove,
  onUpdate,
  onToggleSection,
  onRemove,
  onDuplicate,
  processingFields,
  handleWithLoader,
}: FacultyAssignmentRowProps) {
  const isInter = educationType === "Inter";
  const needsSemester = !isSchool && !isInter;

  const yearLabel = isSchool ? "Class" : "Year";
  
  // Filter years
  const filteredYears = useMemo(() => {
    return dbData.years
      .filter((y) =>
        isSchool
          ? y.collegeEducationId === educationId
          : y.collegeBranchId === branchId
      )
      .sort(
        (a, b) =>
          (parseInt(a.collegeAcademicYear) || 0) -
          (parseInt(b.collegeAcademicYear) || 0)
      );
  }, [dbData.years, educationId, branchId, isSchool]);

  // Filter semesters
  const filteredSemesters = useMemo(() => {
    if (!needsSemester || !row.yearId) return [];
    return dbData.semesters.filter(
      (s) => s.collegeAcademicYearId === row.yearId
    );
  }, [dbData.semesters, row.yearId, needsSemester]);

  // Filter subjects
  const filteredSubjects = useMemo(() => {
    if (!row.yearId) return [];
    if (!needsSemester) {
      return dbData.subjects.filter(
        (s) => s.collegeAcademicYearId === row.yearId
      );
    }
    if (row.semesterId) {
      return dbData.subjects.filter(
        (s) =>
          s.collegeAcademicYearId === row.yearId &&
          s.collegeSemesterId === row.semesterId
      );
    }
    return [];
  }, [dbData.subjects, row.yearId, row.semesterId, needsSemester]);

  // Filter sections
  const filteredSections = useMemo(() => {
    if (!row.yearId) return [];
    const raw = dbData.sections.filter(
      (s) =>
        s.collegeAcademicYearId === row.yearId &&
        (isSchool
          ? s.collegeEducationId === educationId
          : s.collegeBranchId === branchId)
    );
    // Deduplicate by name
    return Array.from(
      new Map(raw.map((s) => [s.collegeSections, s])).values()
    );
  }, [dbData.sections, row.yearId, educationId, branchId, isSchool]);

  // Map sections for CustomMultiSelect
  const sectionOptions: string[] = filteredSections.map((s) => s.collegeSections);
  const selectedSectionNames: string[] = filteredSections
    .filter((s) => row.sectionIds.includes(s.collegeSectionsId))
    .map((s) => s.collegeSections);

  const handleSectionToggle = (val: string) => {
    const section = filteredSections.find((s) => s.collegeSections === val);
    if (section) {
      onToggleSection(row.id, section.collegeSectionsId);
    }
  };

  const isComplete =
    row.yearId &&
    (!needsSemester || row.semesterId) &&
    row.subjectId &&
    row.sectionIds.length > 0;

  return (
    <div
      className={`relative grid grid-cols-1 md:grid-cols-2 gap-4 p-5 pt-7 pb-6 rounded-xl border bg-white ${
        isComplete
          ? "border-l-4 border-l-emerald-500 border-gray-200"
          : "border-l-4 border-l-rose-400 border-gray-200"
      } shadow-sm transition-all hover:shadow-md group mt-5`}
    >
      {/* Row Number Badge & Complete Indicator */}
      <div className="absolute -top-3 -left-3 flex items-center gap-2">
        <div className="w-6 h-6 bg-slate-800 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
          {index + 1}
        </div>
        {isComplete && (
          <div className="text-emerald-500 bg-white rounded-full shadow-sm" title="Row complete">
            <CheckCircle size={20} weight="fill" />
          </div>
        )}
      </div>

      {/* Actions (Duplicate / Delete) - Floating Top Right */}
      <div className="absolute -top-3 right-4 flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => onDuplicate(row.id)}
          title="Duplicate row"
          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
        >
          <Copy size={16} weight="duotone" />
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(row.id)}
            title="Remove row"
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
          >
            <Trash size={16} weight="duotone" />
          </button>
        )}
      </div>

      {/* Year Dropdown */}
      <div className="col-span-1 relative">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {yearLabel} <span className="text-rose-500">*</span>
        </label>
        <CustomSingleSelect
          placeholder="Select"
          options={filteredYears.map((y) => y.collegeAcademicYear)}
          selectedValue={
            filteredYears.find((y) => y.collegeAcademicYearId === row.yearId)?.collegeAcademicYear || ""
          }
          onChange={(val) => {
            const y = filteredYears.find((yr) => yr.collegeAcademicYear === val);
            onUpdate(row.id, "yearId", y ? y.collegeAcademicYearId : null);
          }}
          paddingY="py-2"
          closedBorder="border-slate-300"
        />
      </div>

      {/* Semester Dropdown */}
      {needsSemester && (
        <div className="col-span-1 relative">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Semester <span className="text-rose-500">*</span>
          </label>
          <CustomSingleSelect
            placeholder="Select"
            disabled={!row.yearId}
            options={filteredSemesters.map((s) => s.collegeSemester.toString())}
            selectedValue={
              filteredSemesters.find((s) => s.collegeSemesterId === row.semesterId)?.collegeSemester.toString() || ""
            }
            onChange={(val) => {
              const s = filteredSemesters.find((sm) => sm.collegeSemester.toString() === val);
              onUpdate(row.id, "semesterId", s ? s.collegeSemesterId : null);
            }}
            paddingY="py-2"
            closedBorder="border-slate-300"
          />
        </div>
      )}

      {/* Subject Dropdown */}
      <div className="col-span-1 relative">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Subject <span className="text-rose-500">*</span>
        </label>
        <CustomSingleSelect
          placeholder="Select Subject"
          disabled={!row.yearId || (needsSemester && !row.semesterId)}
          options={filteredSubjects.map((s) => `${s.subjectName} ${s.subjectCode ? `(${s.subjectCode})` : ""}`.trim())}
          selectedValue={(() => {
            const s = filteredSubjects.find((s) => s.collegeSubjectId === row.subjectId);
            return s ? `${s.subjectName} ${s.subjectCode ? `(${s.subjectCode})` : ""}`.trim() : "";
          })()}
          onChange={(val) => {
            const s = filteredSubjects.find(
              (subj) => `${subj.subjectName} ${subj.subjectCode ? `(${subj.subjectCode})` : ""}`.trim() === val
            );
            onUpdate(row.id, "subjectId", s ? s.collegeSubjectId : null);
          }}
          paddingY="py-2"
          closedBorder="border-slate-300"
        />
      </div>

      {/* Sections MultiSelect */}
      <div className={`col-span-1 ${!needsSemester ? "md:col-span-2" : ""} relative`}>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
          <span>Sections <span className="text-rose-500">*</span></span>
          {row.sectionIds.length > 0 && (
            <span className="text-emerald-500 font-bold">{row.sectionIds.length} selected</span>
          )}
        </label>
        <div className="min-w-0 flex-1">
          <CustomMultiSelect
            placeholder="Sections"
            options={sectionOptions}
            selectedValues={selectedSectionNames}
            onChange={handleSectionToggle}
            onRemove={handleSectionToggle}
            disabled={!row.yearId}
            required={false}
            paddingY="py-2"
            gap="gap-0"
            closedBorder="border-slate-300"
          />
        </div>
      </div>
    </div>
  );
}
