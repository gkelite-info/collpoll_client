"use client";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { saveQuiz } from "@/lib/helpers/quiz/quizAPI";
import { getTopicsBySubjectId } from "@/lib/helpers/faculty/getFacultySubjects";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { fetchFacultyForSubject } from "@/lib/helpers/admin/assignments/quiz/adminQuizAPI";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { useFacultyAssignmentsHierarchy } from "@/lib/helpers/faculty/assignment/useFacultyAssignmentsHierarchy";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

interface AdminQuizFormProps {
  onCancel: () => void;
}

const todayStr = new Date().toISOString().split("T")[0];

export default function AdminQuizForm({ onCancel }: AdminQuizFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { adminId } = useAdmin();
  const subjectId = searchParams.get("subjectId");

  const [topics, setTopics] = useState<{
    topicTitle: string;
    collegeSubjectUnitId: number;
    collegeSubjectUnitTopicId: number;
  }[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [selectedFacultyIdentifier, setSelectedFacultyIdentifier] = useState<string | null>(null);
  const [assignedFacultyName, setAssignedFacultyName] = useState<string>("Loading...");

  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    subjectId ? Number(subjectId) : null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const { data: hierarchyData = [] } = useFacultyAssignmentsHierarchy(selectedFacultyId);

  const [quizTitle, setQuizTitle] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [questionsCount, setQuestionsCount] = useState("");
  const [marksPerQuestion, setMarksPerQuestion] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  useEffect(() => {
    const total = Number(questionsCount) * Number(marksPerQuestion);
    setTotalMarks(total || 0);
  }, [questionsCount, marksPerQuestion]);

  useEffect(() => {
    if (subjectId) {
      fetchFacultyForSubject(Number(subjectId)).then((facultyData) => {
        if (facultyData) {
          setSelectedFacultyId(facultyData.facultyId);
          setAssignedFacultyName(facultyData.fullName);
          setSelectedFacultyIdentifier(facultyData.identifierId);
        } else {
          setAssignedFacultyName("Unassigned");
          setSelectedFacultyIdentifier(null);
        }
      });
    }
  }, [subjectId]);

  useEffect(() => {
    if (!selectedSubjectId) {
      setTopics([]);
      setSelectedTopicId(null);
      return;
    }
    getTopicsBySubjectId(selectedSubjectId)
      .then(setTopics)
      .catch(() => toast.error("Failed to fetch topics"));
    setSelectedSectionId(null);
  }, [selectedSubjectId]);

  const educations = useMemo(() => hierarchyData.map((education) => ({
    value: education.collegeEducationId,
    label: education.educationType,
  })), [hierarchyData]);
  const selectedEducation = hierarchyData.find((education) => education.collegeEducationId === selectedEducationId);
  const branches = (selectedEducation?.branches || []).map((branch) => ({ value: branch.collegeBranchId, label: branch.branchCode }));
  const selectedBranch = selectedEducation?.branches.find((branch) => branch.collegeBranchId === selectedBranchId);
  const years = (selectedBranch?.years || []).map((year) => ({ value: year.collegeAcademicYearId, label: year.yearName }));
  const selectedYear = selectedBranch?.years.find((year) => year.collegeAcademicYearId === selectedYearId);
  const semesters = (selectedYear?.semesters || []).map((semester) => ({ value: semester.collegeSemesterId, label: semester.semesterName }));
  const selectedSemester = selectedYear?.semesters.find((semester) => semester.collegeSemesterId === selectedSemesterId);
  const subjects = (selectedSemester?.subjects || []).map((subject) => ({ value: subject.collegeSubjectId, label: subject.subjectName }));
  const selectedSubject = selectedSemester?.subjects.find((subject) => subject.collegeSubjectId === selectedSubjectId);
  const sections = (selectedSubject?.sections || []).map((section) => ({ value: section.collegeSectionsId, label: section.sectionName }));
  const isSchool = selectedEducation ? isSchoolEducation(selectedEducation.educationType) : false;
  const isInter = selectedEducation?.educationType.toUpperCase() === "INTER" || selectedEducation?.educationType.toUpperCase() === "INTERMEDIATE";

  useEffect(() => {
    if (!subjectId || hierarchyData.length === 0 || selectedEducationId) return;
    const targetSubjectId = Number(subjectId);
    for (const education of hierarchyData) {
      for (const branch of education.branches) {
        for (const year of branch.years) {
          for (const semester of year.semesters) {
            if (semester.subjects.some((subject) => subject.collegeSubjectId === targetSubjectId)) {
              setSelectedEducationId(education.collegeEducationId);
              setSelectedBranchId(branch.collegeBranchId);
              setSelectedYearId(year.collegeAcademicYearId);
              setSelectedSemesterId(semester.collegeSemesterId);
              setSelectedSubjectId(targetSubjectId);
              return;
            }
          }
        }
      }
    }
  }, [hierarchyData, selectedEducationId, subjectId]);

  useEffect(() => {
    if (selectedEducation && selectedEducation.branches.length === 1 && !selectedBranchId) {
      setSelectedBranchId(selectedEducation.branches[0].collegeBranchId);
    }
  }, [selectedEducation, selectedBranchId]);

  useEffect(() => {
    if (selectedBranch && selectedBranch.years.length === 1 && !selectedYearId) {
      setSelectedYearId(selectedBranch.years[0].collegeAcademicYearId);
    }
  }, [selectedBranch, selectedYearId]);

  useEffect(() => {
    if (selectedYear && selectedYear.semesters.length === 1 && !selectedSemesterId) {
      setSelectedSemesterId(selectedYear.semesters[0].collegeSemesterId);
    }
  }, [selectedYear, selectedSemesterId]);

  useEffect(() => {
    if (selectedSemester && selectedSemester.subjects.length === 1 && !selectedSubjectId) {
      setSelectedSubjectId(selectedSemester.subjects[0].collegeSubjectId);
    }
  }, [selectedSemester, selectedSubjectId]);

  useEffect(() => {
    if (sections.length === 1 && !selectedSectionId) {
      setSelectedSectionId(sections[0].value);
    }
  }, [sections, selectedSectionId]);

  const formatTo12Hour = (time24: string) => {
    if (!time24) return "";
    const [hours] = time24.split(":");
    const h = parseInt(hours);
    return h >= 12 ? "PM" : "AM";
  };

  const handleSave = async (status: "Draft" | "Active") => {
    if (!quizTitle.trim()) return toast.error("Quiz title is required");
    if (!selectedEducationId) return toast.error("Please select an education type");
    if (!selectedBranchId) return toast.error(`Please select a ${isInter ? "group" : "branch"}`);
    if (!selectedSubjectId) return toast.error("Please select a subject");
    if (!selectedTopicId) return toast.error("Please select a topic");
    if (!selectedYearId || !selectedSectionId) return toast.error("Year and Section are required");
    if (!questionsCount || !marksPerQuestion) return toast.error("Question details are required");
    if (!durationMinutes) return toast.error("Duration is required");
    if (!startDate || !endDate) return toast.error("Dates are required");

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (startDateTime >= endDateTime) {
      return toast.error("End date and time must be after the start date and time");
    }

    if (!selectedFacultyId) return toast.error("No Faculty assigned to this subject.");

    try {
      setIsSaving(status === "Active");
      setIsDraftSaving(status === "Draft");

      const selectedTopicObj = topics.find((t) => t.collegeSubjectUnitTopicId === selectedTopicId);
      if (!selectedTopicObj) return toast.error("Invalid topic selected.");

      const result = await saveQuiz({
        adminId: adminId,
        facultyId: selectedFacultyId,
        collegeEducationId: selectedEducationId,
        collegeBranchId: selectedBranchId,
        collegeSemesterId: selectedSemesterId,
        collegeSubjectId: Number(selectedSubjectId),
        collegeAcademicYearId: selectedYearId,
        collegeSectionsId: selectedSectionId,
        collegeSubjectUnitId: selectedTopicObj.collegeSubjectUnitId,
        collegeSubjectUnitTopicId: selectedTopicObj.collegeSubjectUnitTopicId,
        quizTitle: quizTitle.trim(),
        totalMarks: totalMarks,
        questionsCount: Number(questionsCount),
        marksPerQuestion: Number(marksPerQuestion),
        startTime,
        endTime,
        durationMinutes: Number(durationMinutes),
        startDate,
        endDate,
        maxAttempts: Number(maxAttempts),
        status: "Draft",
      });

      if (!result.success) throw new Error();

      toast.success(status === "Active" ? "Details saved! Redirecting..." : "Quiz saved as draft!");

      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "quiz");
      params.set("action", "addQuestions");
      params.set("quizId", String(result.quizId));
      router.push(`${pathname}?${params.toString()}`);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
      setIsDraftSaving(false);
    }
  };

  return (
    <div className="w-full h-fit flex flex-col">
      <div className="mb-6">
        <div className="flex items-center lg:mb-1">
          <CaretLeftIcon size={22} weight="bold" className="text-[#282828] cursor-pointer active:scale-90" onClick={onCancel} />
          <h1 className="font-bold text-2xl text-[#282828] ml-2">Create New Quiz</h1>
        </div>
        <p className="text-[#282828] text-sm lg:ml-8">Set up the timing and scoring for your quiz.</p>
      </div>

      <div className="bg-white rounded-md p-4 flex flex-col gap-4 flex-1 overflow-y-auto border border-gray-100">
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-bold text-[#282828]">Quiz Title <span className="text-red-500">*</span></label>
          <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="e.g. Unit 1 Assessment" className="border border-gray-200 rounded-md p-2.5 text-[13px] outline-none focus:border-[#43C17A] text-[#282828]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomDropdown
            label="Education *"
            value={selectedEducationId ?? ""}
            options={educations}
            onChange={(value) => {
              setSelectedEducationId(Number(value));
              setSelectedBranchId(null);
              setSelectedYearId(null);
              setSelectedSemesterId(null);
              setSelectedSubjectId(null);
              setSelectedSectionId(null);
            }}
            placeholder="Select Education"
            theme="green"
          />
          {!isSchool ? (
            <CustomDropdown
              label={isInter ? "Group *" : "Branch *"}
              value={selectedBranchId ?? ""}
              options={branches}
              onChange={(value) => {
                setSelectedBranchId(Number(value));
                setSelectedYearId(null);
                setSelectedSemesterId(null);
                setSelectedSubjectId(null);
                setSelectedSectionId(null);
              }}
              placeholder={isInter ? "Select Group" : "Select Branch"}
              disabled={!selectedEducationId}
              theme="green"
            />
          ) : <div />}

          <CustomDropdown
            label="Academic Year *"
            value={selectedYearId ?? ""}
            options={years}
            onChange={(value) => {
              setSelectedYearId(Number(value));
              setSelectedSemesterId(null);
              setSelectedSubjectId(null);
              setSelectedSectionId(null);
            }}
            placeholder="Select Year"
            disabled={!selectedBranchId}
            theme="green"
          />
          <CustomDropdown
            label="Semester *"
            value={selectedSemesterId ?? ""}
            options={semesters}
            onChange={(value) => {
              setSelectedSemesterId(Number(value));
              setSelectedSubjectId(null);
              setSelectedSectionId(null);
            }}
            placeholder="Select Semester"
            disabled={!selectedYearId}
            theme="green"
          />
          <CustomDropdown
            label="Subject *"
            value={selectedSubjectId ?? ""}
            options={subjects}
            onChange={(value) => {
              setSelectedSubjectId(Number(value));
              setSelectedSectionId(null);
            }}
            placeholder="Select Subject"
            disabled={!selectedSemesterId}
            theme="green"
          />
          <CustomDropdown
            label="Topic *"
            value={selectedTopicId ?? ""}
            options={topics.map((topic) => ({
              value: topic.collegeSubjectUnitTopicId,
              label: topic.topicTitle,
            }))}
            onChange={(value) => setSelectedTopicId(Number(value))}
            placeholder="Select Topic"
            disabled={!selectedSubjectId}
            theme="green"
          />
          <CustomDropdown
            label="Section *"
            value={selectedSectionId ?? ""}
            options={sections}
            onChange={(value) => setSelectedSectionId(Number(value))}
            placeholder="Select Section"
            disabled={!selectedSubjectId}
            theme="green"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Assigned Faculty</label>
            <div className="border border-gray-200 rounded-md p-2.5 text-[13px] bg-gray-50 text-gray-500 flex justify-between items-center min-h-[42px]">
              <span>{assignedFacultyName}</span>
              <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">ID: {selectedFacultyIdentifier ?? "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">No. of Questions <span className="text-red-500">*</span></label>
            <input type="number" value={questionsCount} onWheel={(e) => e.currentTarget.blur()} onChange={(e) => setQuestionsCount(e.target.value === "" || parseInt(e.target.value) < 1 ? "1" : e.target.value)} min="1" className="border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-[#43C17A] text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">Marks per Qtn <span className="text-red-500">*</span></label>
            <input type="number" value={marksPerQuestion} onWheel={(e) => e.currentTarget.blur()} onChange={(e) => setMarksPerQuestion(e.target.value === "" || parseInt(e.target.value) < 1 ? "1" : e.target.value)} min="1" className="border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-[#43C17A] text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">Total Marks</label>
            <div className="p-2 text-sm font-bold text-[#43C17A] bg-white border border-gray-100 rounded-md text-center">{totalMarks}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Duration (Mins) <span className="text-red-500">*</span></label>
            <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value === "" || parseInt(e.target.value) < 1 ? "1" : e.target.value)} min="1" className="border border-gray-200 rounded-md p-2.5 text-sm outline-none text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Max Attempts</label>
            <input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value === "" || parseInt(e.target.value) < 1 ? "1" : e.target.value)} min="1" className="border border-gray-200 rounded-md p-2.5 text-sm outline-none text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Start Time <span className="text-red-500">*</span></label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border border-gray-200 rounded-md p-2.5 text-sm outline-none text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">End Time <span className="text-red-500">*</span></label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border border-gray-200 rounded-md p-2.5 text-sm outline-none text-[#282828]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Start Date <span className="text-red-500">*</span></label>
            <input type="date" value={startDate} min={todayStr} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-200 rounded-md p-2.5 text-sm outline-none text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">End Date <span className="text-red-500">*</span></label>
            <input type="date" value={endDate} min={startDate || todayStr} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-200 rounded-md p-2.5 text-sm outline-none text-[#282828]" />
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
          <button onClick={onCancel} className="px-6 py-2 rounded-md border border-[#16284F] text-[#16284F] text-sm font-medium cursor-pointer">Cancel</button>
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave("Draft")} disabled={isDraftSaving} className="px-6 py-2 rounded-md bg-[#16284F] text-white text-sm font-medium cursor-pointer">
              {isDraftSaving ? "Saving..." : "Save Draft"}
            </button>
            <button onClick={() => handleSave("Active")} disabled={isSaving} className="px-6 py-2 rounded-md bg-[#43C17A] text-white text-sm font-medium flex items-center gap-2 cursor-pointer">
              {isSaving ? "Saving..." : <>Add Questions <span>›</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
