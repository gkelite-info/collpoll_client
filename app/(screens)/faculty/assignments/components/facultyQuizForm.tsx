"use client";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getFacultyAssignedSubjects } from "@/lib/helpers/faculty/getFacultyAssignedSubjects";
import { getTopicsBySubjectId } from "@/lib/helpers/faculty/getFacultySubjects";
import { fetchQuizById, saveQuiz } from "@/lib/helpers/quiz/quizAPI";
import { fetchFacultyYears, fetchFacultySections } from "@/lib/helpers/faculty/facultyAPI";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FacultyQuizFormProps {
  onCancel: () => void;
  onSaved: () => void;
}

const todayStr = new Date().toISOString().split("T")[0];

export default function FacultyQuizForm({ onCancel, onSaved }: FacultyQuizFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { facultyId } = useFaculty();

  const quizId = searchParams.get("quizId");
  const isEditMode = searchParams.get("action") === "editQuiz";

  const [subjects, setSubjects] = useState<{ collegeSubjectId: number; subjectName: string }[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [topics, setTopics] = useState<{
    topicTitle: string;
    collegeSubjectUnitId: number;
    collegeSubjectUnitTopicId: number;
  }[]>([]);

  const [academicYears, setAcademicYears] = useState<{ id: number; label: string }[]>([]);
  const [availableSections, setAvailableSections] = useState<any[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  const [quizTitle, setQuizTitle] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [questionsCount, setQuestionsCount] = useState("");
  const [marksPerQuestion, setMarksPerQuestion] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("1");

  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  useEffect(() => {
    const total = Number(questionsCount) * Number(marksPerQuestion);
    setTotalMarks(total || 0);
  }, [questionsCount, marksPerQuestion]);

  useEffect(() => {
    if (!facultyId) return;
    getFacultyAssignedSubjects({ facultyId })
      .then((data) => {
        const uniqueSubjects = Array.from(
          new Map(data.map((item: any) => [
            item.college_subjects?.collegeSubjectId,
            item.college_subjects,
          ])).values()
        ).filter(Boolean) as { collegeSubjectId: number; subjectName: string }[];
        setSubjects(uniqueSubjects);
        if (!isEditMode) setSelectedSubjectId(uniqueSubjects[0]?.collegeSubjectId ?? null);
      })
      .catch(() => toast.error("Failed to fetch subjects"));
  }, [facultyId, isEditMode]);

  useEffect(() => {
    if (!selectedSubjectId) return;
    getTopicsBySubjectId(selectedSubjectId)
      .then(setTopics)
      .catch(() => toast.error("Failed to fetch topics"));
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!facultyId) return;
    fetchFacultyYears(facultyId)
      .then(setAcademicYears)
      .catch(() => toast.error("Failed to load academic years"));
  }, [facultyId]);

  useEffect(() => {
    if (!facultyId || !selectedYearId || !selectedSubjectId) {
      setAvailableSections([]);
      setSelectedSectionId(null);
      return;
    }
    fetchFacultySections(facultyId, selectedYearId, selectedSubjectId)
      .then(setAvailableSections)
      .catch(() => toast.error("Failed to load sections"));
    setSelectedSectionId(null);
  }, [facultyId, selectedYearId, selectedSubjectId]);

  useEffect(() => {
    if (!isEditMode || !quizId) return;
    fetchQuizById(Number(quizId))
      .then((data) => {
        if (!data) return;
        setQuizTitle(data.quizTitle);
        setQuestionsCount(String(data.questionsCount));
        setMarksPerQuestion(String(data.marksPerQuestion));
        setStartDate(data.startDate ? data.startDate.split("T")[0] : "");
        setEndDate(data.endDate ? data.endDate.split("T")[0] : "");
        setStartTime(data.startTime || "00:00");
        setEndTime(data.endTime || "00:00");
        setDurationMinutes(String(data.durationMinutes));
        setMaxAttempts(String(data.maxAttempts));
        setSelectedSubjectId(data.collegeSubjectId);
        setSelectedTopicId(data.collegeSubjectUnitTopicId || data.collegeSubjectUnitId);
        setSelectedYearId(data.collegeAcademicYearId ?? null);
        setSelectedSectionId(data.collegeSectionsId ?? null);
      })
      .catch(() => toast.error("Failed to load quiz details"));
  }, [quizId, isEditMode]);

  const formatTo12Hour = (time24: string) => {
    if (!time24) return "";
    const [hours] = time24.split(":");
    return parseInt(hours) >= 12 ? "PM" : "AM";
  };

  const handleSave = async (status: "Draft" | "Active") => {
    if (!quizTitle.trim()) return toast.error("Quiz title is required");
    if (!selectedTopicId) return toast.error("Please select a topic");
    if (!selectedYearId || !selectedSectionId) return toast.error("Year and Section are required");
    if (!questionsCount || !marksPerQuestion) return toast.error("Question details are required");
    if (!durationMinutes) return toast.error("Duration is required");
    if (startTime === "00:00" || endTime === "00:00") return toast.error("Please set valid Start and End times");
    if (endTime <= startTime) return toast.error("End time must be later than start time");
    if (!startDate || !endDate) return toast.error("Dates are required");
    if (!facultyId) return toast.error("Faculty not found");

    try {
      setIsSaving(status === "Active");
      setIsDraftSaving(status === "Draft");

      const selectedTopicObj = topics.find((t) => t.collegeSubjectUnitTopicId === selectedTopicId);
      if (!selectedTopicObj) return toast.error("Invalid topic selected.");

      const result = await saveQuiz({
        quizId: isEditMode && quizId ? Number(quizId) : undefined,
        facultyId,
        collegeSubjectId: selectedSubjectId!,
        collegeAcademicYearId: selectedYearId,
        collegeSectionsId: selectedSectionId,
        collegeSubjectUnitId: selectedTopicObj.collegeSubjectUnitId,
        collegeSubjectUnitTopicId: selectedTopicObj.collegeSubjectUnitTopicId,
        quizTitle: quizTitle.trim(),
        totalMarks,
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

      toast.success(status === "Active" ? "Details saved! Now add your questions." : "Quiz saved as draft!");

      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "quiz");
      params.set("quizView", "active");
      params.set("action", "addQuestions");
      params.set("quizId", String(result.quizId));
      router.push(`${pathname}?${params.toString()}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
      setIsDraftSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center lg:mb-1">
          <CaretLeftIcon size={22} weight="bold" className="text-[#282828] cursor-pointer active:scale-90" onClick={onCancel} />
          <h1 className="font-bold text-2xl text-[#282828] ml-2">{isEditMode ? "Edit Quiz" : "Create New Quiz"}</h1>
        </div>
        <p className="text-[#282828] text-sm lg:ml-8">Set up the timing and scoring for your quiz.</p>
      </div>

      <div className="bg-white rounded-md p-4 flex flex-col gap-4 flex-1 overflow-y-auto border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Quiz Title <span className="text-red-500">*</span></label>
            <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="e.g. Unit 1 Assessment" className="border border-gray-200 rounded-md p-2.5 text-sm outline-none focus:border-[#43C17A] text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Topic <span className="text-red-500">*</span></label>
            <select value={selectedTopicId || ""} onChange={(e) => setSelectedTopicId(parseInt(e.target.value, 10))} className="border border-gray-200 rounded-md p-2.5 text-sm outline-none focus:border-[#43C17A] bg-white cursor-pointer text-[#282828]">
              <option value="">Select Topic</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic.collegeSubjectUnitTopicId}>{topic.topicTitle}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Academic Year <span className="text-red-500">*</span></label>
            <select
              value={selectedYearId || ""}
              onChange={(e) => setSelectedYearId(Number(e.target.value))}
              className="border border-gray-200 rounded-md p-2.5 text-sm outline-none focus:border-[#43C17A] bg-white text-[#282828] cursor-pointer"
            >
              <option value="">Select Year</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>{y.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Section <span className="text-red-500">*</span></label>
            <select
              disabled={!selectedYearId}
              value={selectedSectionId || ""}
              onChange={(e) => setSelectedSectionId(Number(e.target.value))}
              className="border border-gray-200 rounded-md p-2.5 text-sm outline-none focus:border-[#43C17A] bg-white disabled:bg-gray-50 text-[#282828] cursor-pointer"
            >
              <option value="">Select Section</option>
              {availableSections.map((sec) => (
                <option key={sec.collegeSectionsId} value={sec.collegeSectionsId}>
                  {sec.college_sections?.collegeSections}
                </option>
              ))}
            </select>
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
            <div className="flex items-center gap-2">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border border-gray-200 rounded-md p-2.5 text-sm outline-none text-[#282828] flex-1" />
              <span className="text-[10px] font-bold text-[#43C17A] bg-[#43C17A]/10 px-2 py-1 rounded">{formatTo12Hour(startTime)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">End Time <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border border-gray-200 rounded-md p-2.5 text-sm outline-none text-[#282828] flex-1" />
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">{formatTo12Hour(endTime)}</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Start Date <span className="text-red-500">*</span></label>
            <input type="date" value={startDate} min={isEditMode ? undefined : todayStr} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-200 rounded-md p-2.5 text-sm outline-none focus:border-[#43C17A] text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">End Date <span className="text-red-500">*</span></label>
            <input type="date" value={endDate} min={startDate || todayStr} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-200 rounded-md p-2.5 text-sm outline-none focus:border-[#43C17A] text-[#282828]" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
          <button onClick={onCancel} disabled={isSaving} className="px-6 py-2 rounded-md border border-[#16284F] text-[#16284F] text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave("Draft")} disabled={isDraftSaving} className="px-6 py-2 rounded-md bg-[#16284F] text-white text-sm font-medium hover:bg-[#102040] transition-colors cursor-pointer">
              {isDraftSaving ? "Saving..." : "Save Draft"}
            </button>
            <button onClick={() => handleSave("Active")} disabled={isSaving} className="px-6 py-2 rounded-md bg-[#43C17A] text-white text-sm font-medium hover:bg-[#35a868] transition-colors flex items-center gap-2 cursor-pointer">
              {isSaving ? "Saving..." : <>Save & Add Questions <span className="text-lg">›</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}