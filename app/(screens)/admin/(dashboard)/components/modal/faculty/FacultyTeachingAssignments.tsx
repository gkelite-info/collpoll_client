import React, { useState } from "react";
import { Plus, CaretDown, X, ChalkboardTeacher } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { TeachingAssignment } from "./facultyAssignmentTypes";
import { createEmptyAssignment, createEmptyRow, duplicateRow } from "@/lib/helpers/admin/registrations/faculty/facultyAssignmentHelpers";
import FacultyAssignmentRow from "./FacultyAssignmentRow";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { CustomSingleSelect } from "@/app/(screens)/admin/(dashboard)/components/modal/userModalComponents";

type FacultyTeachingAssignmentsProps = {
  assignments: TeachingAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<TeachingAssignment[]>>;
  dbData: {
    educations: any[];
    branches: any[];
    years: any[];
    sections: any[];
    subjects: any[];
    semesters: any[];
  };
  processingFields: Record<string, boolean>;
  handleWithLoader: (fieldId: string, action: () => void) => void;
  isFetchingData?: boolean;
  isSelectedSchool?: boolean;
};

export default function FacultyTeachingAssignments({
  assignments,
  setAssignments,
  dbData,
  processingFields,
  handleWithLoader,
  isFetchingData = false,
  isSelectedSchool = false,
}: FacultyTeachingAssignmentsProps) {
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: () => void;
    title: string;
    description: string;
    actionType?: "accept" | "reject" | "remove" | "warning" | null;
  }>({
    isOpen: false,
    action: () => {},
    title: "",
    description: "",
  });

  const addAssignment = () => {
    setAssignments((prev) => [...prev, createEmptyAssignment()]);
  };

  const removeAssignment = (id: string) => {
    if (assignments.length <= 1) return;
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAssignmentEducation = (id: string, educationId: number) => {
    const assignment = assignments.find((a) => a.id === id);
    if (!assignment) return;

    // Has it changed?
    if (assignment.educationId === educationId) return;

    // Are there any configured rows?
    const hasRows = assignment.rows.some(
      (r) => r.yearId || r.subjectId || r.sectionIds.length > 0
    );

    const performUpdate = () => {
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          return {
            ...a,
            educationId,
            branchId: null, // Clear branch
            rows: [createEmptyRow()], // Clear all rows
          };
        })
      );
    };

    if (hasRows) {
      setConfirmModal({
        isOpen: true,
        title: "Change Education Type",
        description:
          "Changing the education type will remove all subject rows currently configured in this assignment. Are you sure you want to continue?",
        action: performUpdate,
        actionType: "warning",
      });
    } else {
      performUpdate();
    }
  };

  const updateAssignmentBranch = (id: string, branchId: number) => {
    const assignment = assignments.find((a) => a.id === id);
    if (!assignment) return;

    // Has it changed?
    if (assignment.branchId === branchId) return;

    // Are there any configured rows?
    const hasRows = assignment.rows.some(
      (r) => r.yearId || r.subjectId || r.sectionIds.length > 0
    );

    const isInter =
      dbData.educations.find((e) => e.collegeEducationId === assignment.educationId)
        ?.collegeEducationType === "Inter";

    const label = isInter ? "Group" : "Branch";

    const performUpdate = () => {
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          return {
            ...a,
            branchId,
            rows: [createEmptyRow()], // Clear all rows
          };
        })
      );
    };

    if (hasRows) {
      setConfirmModal({
        isOpen: true,
        title: `Change ${label} Type`,
        description: `Changing the ${label.toLowerCase()} will remove all subject rows currently configured in this assignment. Are you sure you want to continue?`,
        action: performUpdate,
        actionType: "warning",
      });
    } else {
      performUpdate();
    }
  };

  const addRow = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        if (a.rows.length >= 8) {
          toast("You've added many subject rows. Consider using a separate Teaching Assignment card.", {
            icon: "ℹ️",
            duration: 4000,
          });
        }
        return { ...a, rows: [...a.rows, createEmptyRow()] };
      })
    );
  };

  const removeRow = (assignmentId: string, rowId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        if (a.rows.length <= 1) return a; // Cannot remove last row
        return { ...a, rows: a.rows.filter((r) => r.id !== rowId) };
      })
    );
  };

  const updateRow = (assignmentId: string, rowId: string, field: string, value: any) => {
    // Duplicate Subject Validation - MUST be outside setState to prevent React render conflicts
    if (field === "subjectId" && value !== null) {
      const currentAssignment = assignments.find(a => a.id === assignmentId);
      if (currentAssignment) {
        const targetEdu = currentAssignment.educationId;
        const targetBranch = currentAssignment.branchId;
        const targetSubj = value;
        let duplicateFound = false;

        for (const a of assignments) {
          if (a.educationId !== targetEdu || a.branchId !== targetBranch) continue;
          for (const r of a.rows) {
            if (r.id === rowId) continue;
            if (r.subjectId === targetSubj) {
              duplicateFound = true;
              break;
            }
          }
          if (duplicateFound) break;
        }

        if (duplicateFound) {
          toast.error("This subject is already configured in another row. Please add your sections there instead.", {
            id: "duplicate-subject",
            duration: 8000,
            icon: "⚠️"
          });
          return; // Abort update!
        }
      }
    }

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          rows: a.rows.map((r) => {
            if (r.id !== rowId) return r;
            
            const updated = { ...r, [field]: value };
            
            // Cascade clears
            if (field === "yearId") {
              updated.semesterId = null;
              updated.subjectId = null;
              updated.sectionIds = [];
            }
            if (field === "semesterId") {
              updated.subjectId = null;
              updated.sectionIds = [];
            }
            if (field === "subjectId") {
              updated.sectionIds = [];
            }
            
            return updated;
          }),
        };
      })
    );
  };

  const toggleSection = (assignmentId: string, rowId: string, sectionId: number) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          rows: a.rows.map((r) => {
            if (r.id !== rowId) return r;
            const newSections = r.sectionIds.includes(sectionId)
              ? r.sectionIds.filter((id) => id !== sectionId)
              : [...r.sectionIds, sectionId];
            return { ...r, sectionIds: newSections };
          }),
        };
      })
    );
  };

  const handleDuplicateRow = (assignmentId: string, rowId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const sourceRow = a.rows.find((r) => r.id === rowId);
        if (!sourceRow) return a;
        
        // Find index to insert right after
        const index = a.rows.findIndex((r) => r.id === rowId);
        const newRows = [...a.rows];
        newRows.splice(index + 1, 0, duplicateRow(sourceRow));
        
        return { ...a, rows: newRows };
      })
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {assignments.map((assignment, aIndex) => {
        const eduObj = dbData.educations.find(
          (e) => e.collegeEducationId === assignment.educationId
        );
        const eduType = eduObj?.collegeEducationType || "";
        const isSchool = eduType ? isSchoolEducation(eduType) : isSelectedSchool;
        const isInter = eduType === "Inter";
        
        const branchLabel = isInter ? "Group Type" : "Branch Type";
        
        const branchObj = dbData.branches.find(
          (b) => b.collegeBranchId === assignment.branchId
        );
        
        // Card title logic
        const cardTitleParts = [];
        if (eduType) cardTitleParts.push(eduType);
        if (!isSchool && branchObj) cardTitleParts.push(branchObj.collegeBranchCode);
        cardTitleParts.push(`${assignment.rows.length} subject row${assignment.rows.length !== 1 ? 's' : ''}`);
        const cardTitle = cardTitleParts.join(" • ");

        return (
          <div
            key={assignment.id}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <ChalkboardTeacher size={24} weight="duotone" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg truncate">
                    Teaching Assignment {assignments.length > 1 ? aIndex + 1 : ""}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                    {assignment.educationId ? cardTitle : "Select an education type to begin"}
                  </p>
                </div>
              </div>
              
              {assignments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAssignment(assignment.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                  title="Remove Assignment"
                >
                  <X size={20} weight="bold" />
                </button>
              )}
            </div>

            {/* Education & Branch Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Education Type <span className="text-rose-500">*</span>
                </label>
                <CustomSingleSelect
                  placeholder="Select Education"
                  disabled={isFetchingData}
                  options={dbData.educations.map((e) => e.collegeEducationType)}
                  selectedValue={
                    dbData.educations.find((e) => e.collegeEducationId === assignment.educationId)?.collegeEducationType || ""
                  }
                  onChange={(val) => {
                    const e = dbData.educations.find((edu) => edu.collegeEducationType === val);
                    if (e) updateAssignmentEducation(assignment.id, e.collegeEducationId);
                  }}
                  paddingY="py-2.5"
                  closedBorder="border-slate-300"
                />
              </div>

              {!isSchool && (
                <div className="relative">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {branchLabel} <span className="text-rose-500">*</span>
                  </label>
                  <CustomSingleSelect
                    placeholder={`Select ${branchLabel}`}
                    disabled={!assignment.educationId || isFetchingData}
                    options={dbData.branches
                      .filter((b) => b.collegeEducationId === assignment.educationId)
                      .map((b) => b.collegeBranchCode)}
                    selectedValue={
                      dbData.branches.find((b) => b.collegeBranchId === assignment.branchId)?.collegeBranchCode || ""
                    }
                    onChange={(val) => {
                      const b = dbData.branches.find((br) => br.collegeBranchCode === val && br.collegeEducationId === assignment.educationId);
                      if (b) updateAssignmentBranch(assignment.id, b.collegeBranchId);
                    }}
                    paddingY="py-2.5"
                    closedBorder="border-slate-300"
                  />
                </div>
              )}
            </div>

            {/* Subject Rows */}
            {assignment.educationId && (isSchool || assignment.branchId) ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mt-8 mb-2 px-1">
                  <h4 className="text-sm font-bold text-slate-700">Subject Rows</h4>
                  <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-md">
                    {assignment.rows.length} Row{assignment.rows.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {assignment.rows.map((row, rIndex) => (
                  <FacultyAssignmentRow
                    key={row.id}
                    row={row}
                    index={rIndex}
                    isSchool={isSchool}
                    educationType={eduType}
                    educationId={assignment.educationId}
                    branchId={assignment.branchId}
                    dbData={dbData}
                    canRemove={assignment.rows.length > 1}
                    onUpdate={(rowId, field, value) => updateRow(assignment.id, rowId, field, value)}
                    onToggleSection={(rowId, sectionId) => toggleSection(assignment.id, rowId, sectionId)}
                    onRemove={(rowId) => removeRow(assignment.id, rowId)}
                    onDuplicate={(rowId) => handleDuplicateRow(assignment.id, rowId)}
                    processingFields={processingFields}
                    handleWithLoader={handleWithLoader}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => addRow(assignment.id)}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-indigo-200 text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer"
                >
                  <Plus size={16} weight="bold" />
                  Add Subject Row
                </button>
              </div>
            ) : (
              <div className="mt-8 p-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-white">
                <ChalkboardTeacher size={48} weight="duotone" className="mb-3 opacity-50" />
                <p className="font-medium text-slate-500">
                  Select {isSchool ? "Education Type" : `Education and ${branchLabel}`} to configure subjects
                </p>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addAssignment}
        className="w-full bg-indigo-600 text-white font-semibold py-3 text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer hover:shadow-md"
      >
        <Plus size={18} weight="bold" />
        Add Teaching Assignment
      </button>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        open={confirmModal.isOpen}
        onConfirm={() => {
          confirmModal.action();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        name=""
        customDescription={confirmModal.description}
        confirmText="Continue"
        actionType={confirmModal.actionType === undefined ? "remove" : confirmModal.actionType}
      />
    </div>
  );
}
