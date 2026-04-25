"use client";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { saveQuiz } from "@/lib/helpers/quiz/quizAPI";
import { getTopicsBySubjectId } from "@/lib/helpers/faculty/getFacultySubjects";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { fetchFacultyForSubject } from "@/lib/helpers/admin/assignments/quiz/adminQuizAPI";
import { fetchFacultyYears, fetchFacultySections } from "@/lib/helpers/faculty/facultyAPI";

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
  const [assignedFacultyName, setAssignedFacultyName] = useState<string>("Loading...");

  const [academicYears, setAcademicYears] = useState<{ id: number; label: string }[]>([]);
  const [availableSections, setAvailableSections] = useState<any[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

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
      getTopicsBySubjectId(Number(subjectId))
        .then(setTopics)
        .catch(() => toast.error("Failed to fetch topics"));

      fetchFacultyForSubject(Number(subjectId)).then((facultyData) => {
        if (facultyData) {
          setSelectedFacultyId(facultyData.facultyId);
          setAssignedFacultyName(facultyData.fullName);
        } else {
          setAssignedFacultyName("Unassigned");
        }
      });
    }
  }, [subjectId]);

  useEffect(() => {
    if (selectedFacultyId) {
      fetchFacultyYears(selectedFacultyId)
        .then(setAcademicYears)
        .catch(() => toast.error("Failed to load academic years"));
    }
  }, [selectedFacultyId]);

  useEffect(() => {
    if (selectedFacultyId && selectedYearId && subjectId) {
      fetchFacultySections(selectedFacultyId, selectedYearId, Number(subjectId))
        .then(setAvailableSections)
        .catch(() => toast.error("Failed to load sections"));
    } else {
      setAvailableSections([]);
    }
    setSelectedSectionId(null);
  }, [selectedYearId, selectedFacultyId, subjectId]);

  const formatTo12Hour = (time24: string) => {
    if (!time24) return "";
    const [hours] = time24.split(":");
    const h = parseInt(hours);
    return h >= 12 ? "PM" : "AM";
  };

  const handleSave = async (status: "Draft" | "Active") => {
    if (!quizTitle.trim()) return toast.error("Quiz title is required");
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
        collegeSubjectId: Number(subjectId),
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
          <h1 className="font-bold text-2xl text-[#282828] ml-2">Create New Quiz (Admin)</h1>
        </div>
        <p className="text-[#282828] text-sm lg:ml-8">Assign details and scoring logic for this quiz.</p>
      </div>

      <div className="bg-white rounded-md p-4 flex flex-col gap-4 flex-1 overflow-y-auto border border-gray-100">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-[#282828]">Assign Faculty</label>
          <div className="border border-gray-200 rounded-md p-2.5 text-sm bg-gray-50 text-gray-500 flex justify-between items-center">
            <span>{assignedFacultyName}</span>
            <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">ID: {selectedFacultyId ?? "N/A"}</span>
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
              {academicYears.map((y) => <option key={y.id} value={y.id}>{y.label}</option>)}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Quiz Title <span className="text-red-500">*</span></label>
            <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="e.g. Mid-Term Exam" className="border border-gray-200 rounded-md p-2.5 text-sm outline-none focus:border-[#43C17A] text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Topic <span className="text-red-500">*</span></label>
            <select value={selectedTopicId || ""} onChange={(e) => setSelectedTopicId(parseInt(e.target.value, 10))} className="border border-gray-200 rounded-md p-2.5 text-sm outline-none focus:border-[#43C17A] bg-white text-[#282828] cursor-pointer">
              <option value="">Select Topic</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic.collegeSubjectUnitTopicId}>{topic.topicTitle}</option>
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