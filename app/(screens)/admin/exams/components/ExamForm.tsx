import { Trash, Plus, Pencil } from "@phosphor-icons/react";
import { CustomSelect } from "./CustomSelect";

interface ExamFormProps {
  scheduleTitle: string;
  setScheduleTitle: (val: string) => void;
  educations: any[];
  educationSelect: number | null;
  setEducationSelect: (val: number | null) => void;
  isSchool: boolean;
  isInter: boolean;
  examTypeSelect: string;
  setExamTypeSelect: (val: string) => void;
  isCustomExamType: boolean;
  setIsCustomExamType: (val: boolean) => void;
  customExamTypes: any[];
  setCustomExamTypes: (val: any[]) => void;
  showDateRangePicker: boolean;
  setShowDateRangePicker: (val: boolean) => void;
  fromDate: string;
  setFromDate: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  branches: any[];
  branchSelect: number | null;
  setBranchSelect: (val: number | null) => void;
  academicYears: any[];
  yearSelect: string;
  setYearSelect: (val: string) => void;
  semesters: any[];
  semesterSelect: number | null;
  setSemesterSelect: (val: number | null) => void;
  sections: any[];
  sectionSelect: number | null;
  setSectionSelect: (val: number | null) => void;
  scheduledSubjects: any[];
  setScheduledSubjects: (val: any) => void;
  editingScheduleId: number | null;
  setIsAddSubjectOpen: (val: boolean) => void;
  setNewSubjectName: (val: string) => void;
  setNewSubjectDate: (val: string) => void;
  setNewSubjectTime: (val: string) => void;
  loading: boolean;
  handleCreateSchedule: (e: React.FormEvent) => void;
}

export function ExamForm({
  scheduleTitle,
  setScheduleTitle,
  educations,
  educationSelect,
  setEducationSelect,
  isSchool,
  isInter,
  examTypeSelect,
  setExamTypeSelect,
  isCustomExamType,
  setIsCustomExamType,
  customExamTypes,
  setCustomExamTypes,
  showDateRangePicker,
  setShowDateRangePicker,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  branches,
  branchSelect,
  setBranchSelect,
  academicYears,
  yearSelect,
  setYearSelect,
  semesters,
  semesterSelect,
  setSemesterSelect,
  sections,
  sectionSelect,
  setSectionSelect,
  scheduledSubjects,
  setScheduledSubjects,
  editingScheduleId,
  setIsAddSubjectOpen,
  setNewSubjectName,
  setNewSubjectDate,
  setNewSubjectTime,
  loading,
  handleCreateSchedule,
}: ExamFormProps) {
  const handleRemoveSubject = (idx: number) => {
    const updated = [...scheduledSubjects];
    updated.splice(idx, 1);
    setScheduledSubjects(updated);
  };

  let defaultExamTypes: { value: string; label: string }[] = [];
  
  if (isSchool) {
    defaultExamTypes = [
      { value: "FA 1", label: "FA 1" },
      { value: "FA 2", label: "FA 2" },
      { value: "FA 3", label: "FA 3" },
      { value: "FA 4", label: "FA 4" },
      { value: "SA 1", label: "SA 1" },
      { value: "SA 2", label: "SA 2" },
      { value: "Unit Test 1", label: "Unit Test 1" },
      { value: "Unit Test 2", label: "Unit Test 2" },
      { value: "Unit Test 3", label: "Unit Test 3" },
      { value: "Unit Test 4", label: "Unit Test 4" },
      { value: "Quarterly Exam", label: "Quarterly Exam" },
      { value: "Half Yearly Exam", label: "Half Yearly Exam" },
      { value: "Pre-Final Exam", label: "Pre-Final Exam" },
      { value: "Annual Exam", label: "Annual Exam" },
    ];
  } else if (isInter) {
    defaultExamTypes = [
      { value: "Unit Test 1", label: "Unit Test 1" },
      { value: "Unit Test 2", label: "Unit Test 2" },
      { value: "Unit Test 3", label: "Unit Test 3" },
      { value: "Unit Test 4", label: "Unit Test 4" },
      { value: "Quarterly Exam", label: "Quarterly Exam" },
      { value: "Half Yearly Exam", label: "Half Yearly Exam" },
      { value: "Pre-Final Exam", label: "Pre-Final Exam" },
      { value: "Final Exam", label: "Final Exam" },
    ];
  } else {
    defaultExamTypes = [
      { value: "Mid 1 Exam", label: "Mid 1 Exam" },
      { value: "Mid 2 Exam", label: "Mid 2 Exam" },
      { value: "Semester Exam", label: "Semester Exam" },
      { value: "Internal Exam", label: "Internal Exam" },
      { value: "External Exam", label: "External Exam" },
    ];
  }

  const examTypeOptions = [
    { value: "Select", label: "Select Exam Type" },
    ...customExamTypes.map((t) => ({ value: t.examTypeName, label: t.examTypeName })),
    ...defaultExamTypes.filter((d) => !customExamTypes.some((c) => c.examTypeName === d.value)),
    { value: "custom", label: "+ Add Custom Exam Type" },
  ];

  return (
    <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-6">
        {editingScheduleId !== null ? "Edit Exam Schedule" : "New Exam Schedule"}
      </h2>
      <form onSubmit={handleCreateSchedule} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-600 mb-1.5">Schedule Title</label>
            <input
              type="text"
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              placeholder="e.g. Midterm Exams 2026"
              className="w-full bg-white border border-gray-300 rounded-sm px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-600 mb-1.5">Education Type</label>
            <CustomSelect
              value={educationSelect?.toString() || ""}
              onChange={(val) => setEducationSelect(Number(val))}
              options={educations.map((edu) => ({
                value: edu.collegeEducationId,
                label: edu.collegeEducationType,
              }))}
              placeholder="Select Education"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col">
              <label className="text-xs font-bold text-gray-600 mb-1.5">Exam Type</label>
              {isCustomExamType ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={examTypeSelect === "Select" ? "" : examTypeSelect}
                    onChange={(e) => setExamTypeSelect(e.target.value)}
                    placeholder="Enter custom exam type"
                    className="flex-1 bg-white border border-gray-300 rounded-sm px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomExamType(false);
                      setExamTypeSelect("Select");
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Cancel custom exam type"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ) : (
                <CustomSelect
                  value={examTypeSelect}
                  onChange={(val) => {
                    if (val === "custom") {
                      setIsCustomExamType(true);
                      setExamTypeSelect("");
                    } else {
                      setExamTypeSelect(val.toString());
                    }
                  }}
                  options={examTypeOptions}
                  placeholder="Select Exam Type"
                />
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <input
                type="checkbox"
                id="showDateRangePicker"
                checked={showDateRangePicker}
                onChange={(e) => setShowDateRangePicker(e.target.checked)}
                className="w-4 h-4 text-[#43C17A] bg-gray-100 border-gray-300 rounded focus:ring-[#43C17A] cursor-pointer"
              />
              <label
                htmlFor="showDateRangePicker"
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                Date Range Schedule
              </label>
            </div>
          </div>

          {showDateRangePicker && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 p-4 bg-gray-50 border border-gray-150 rounded-xl">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1.5">From Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-sm px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A] cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1.5">To Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-sm px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Class/Branch Logic */}
        {!showDateRangePicker && (
          <>
            <div className={`grid grid-cols-1 gap-6 ${isSchool ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {!isSchool && (
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 mb-1.5">
                    {isInter ? "Group" : "Branch"}
                  </label>
                  <CustomSelect
                    value={branchSelect?.toString() || ""}
                    onChange={(val) => setBranchSelect(Number(val))}
                    options={branches.map((b) => ({
                      value: b.collegeBranchId,
                      label: b.collegeBranchCode,
                    }))}
                    placeholder={`Select ${isInter ? "Group" : "Branch"}`}
                  />
                </div>
              )}

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1.5">
                  {isSchool ? "Class" : "Year"}
                </label>
                <CustomSelect
                  value={yearSelect}
                  onChange={(val) => setYearSelect(val.toString())}
                  options={academicYears.map((yr) => ({
                    value: yr.collegeAcademicYear,
                    label: yr.collegeAcademicYear,
                  }))}
                  placeholder={`Select ${isSchool ? "Class" : "Year"}`}
                />
              </div>

              {!isSchool && !isInter && (
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 mb-1.5">Semester</label>
                  <CustomSelect
                    value={semesterSelect?.toString() || ""}
                    onChange={(val) => setSemesterSelect(Number(val))}
                    options={semesters.map((s) => ({
                      value: s.collegeSemesterId,
                      label: s.collegeSemester,
                    }))}
                    placeholder="Select Semester"
                  />
                </div>
              )}

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1.5">Section</label>
                <CustomSelect
                  value={sectionSelect?.toString() || ""}
                  onChange={(val) => setSectionSelect(Number(val))}
                  options={sections.map((s) => ({
                    value: s.collegeSectionsId,
                    label: s.collegeSections,
                  }))}
                  placeholder="Select Section"
                />
              </div>
            </div>
          </>
        )}

        {!showDateRangePicker && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3 border-b border-gray-150 pb-2">
              <h3 className="text-sm font-bold text-gray-800">Scheduled Subjects</h3>
              <button
                type="button"
                onClick={() => setIsAddSubjectOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#43C17A] hover:text-[#38b16d] bg-[#E6FBEA] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                Add Subject
              </button>
            </div>
            {scheduledSubjects.length > 0 ? (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {scheduledSubjects.map((sub, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 border border-gray-150 p-3 rounded-xl"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">{sub.subject}</span>
                      <span className="text-xs font-semibold text-gray-500">
                        {sub.examDate} at {sub.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setNewSubjectName(sub.subject);
                          setNewSubjectDate(sub.examDate);
                          setNewSubjectTime(sub.time);
                          handleRemoveSubject(idx);
                          setIsAddSubjectOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#43C17A] hover:bg-[#E6FBEA] rounded-lg transition-colors cursor-pointer"
                        title="Edit Subject"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-sm font-bold text-gray-500">No subjects scheduled yet.</p>
                <p className="text-xs font-medium text-gray-400 mt-1">
                  Click 'Add Subject' to start building your exam timetable.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-150">
          <button
            type="submit"
            className="flex-1 bg-[#43C17A] hover:bg-[#38b16d] text-white py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
            disabled={loading}
          >
            {loading ? "Saving..." : editingScheduleId !== null ? "Update" : "Create Exam Schedule"}
          </button>
        </div>
      </form>
    </div>
  );
}
