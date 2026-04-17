"use client";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getFacultyAssignedSubjects } from "@/lib/helpers/faculty/getFacultyAssignedSubjects";
import { getTopicsBySubjectId } from "@/lib/helpers/faculty/getFacultySubjects";
import { fetchQuizById, saveQuiz } from "@/lib/helpers/quiz/quizAPI";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FacultyQuizFormProps {
  onCancel: () => void;
  onSaved: () => void;
}

const todayStr = new Date().toISOString().split("T")[0];

const isPastDate = (date: string) => new Date(date) < new Date(todayStr);
const isEndBeforeStart = (start: string, end: string) =>
  new Date(end) < new Date(start);

export default function FacultyQuizForm({
  onCancel,
  onSaved,
}: FacultyQuizFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { facultyId } = useFaculty();

  const quizId = searchParams.get("quizId");
  const isEditMode = searchParams.get("action") === "editQuiz";

  const [subjects, setSubjects] = useState<
    { collegeSubjectId: number; subjectName: string }[]
  >([]);
  const [sections, setSections] = useState<
    { collegeSectionsId: number; collegeSections: string }[]
  >([]);

  const [topics, setTopics] = useState<
    {
      topicTitle: string;
      collegeSubjectUnitId: number;
      collegeSubjectUnitTopicId: number;
    }[]
  >([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );
  const [quizTitle, setQuizTitle] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  useEffect(() => {
    if (!facultyId) return;
    getFacultyAssignedSubjects({ facultyId })
      .then((data) => {
        const uniqueSubjects = Array.from(
          new Map(
            data.map((item: any) => [
              item.college_subjects?.collegeSubjectId,
              item.college_subjects,
            ]),
          ).values(),
        ).filter(Boolean) as {
          collegeSubjectId: number;
          subjectName: string;
        }[];
        setSubjects(uniqueSubjects);
        if (!isEditMode)
          setSelectedSubjectId(uniqueSubjects[0]?.collegeSubjectId ?? null);

        const uniqueSections = Array.from(
          new Map(
            data.map((item: any) => [
              item.college_sections?.collegeSectionsId,
              item.college_sections,
            ]),
          ).values(),
        ).filter(Boolean) as {
          collegeSectionsId: number;
          collegeSections: string;
        }[];
        setSections(uniqueSections);
      })
      .catch(() => toast.error("Failed to fetch subjects"));
  }, [facultyId, isEditMode]);

  useEffect(() => {
    if (!selectedSubjectId) return;
    getTopicsBySubjectId(selectedSubjectId)
      .then((data) => setTopics(data))
      .catch(() => toast.error("Failed to fetch topics"));
  }, [selectedSubjectId]);

  useEffect(() => {
    if (isEditMode && quizId) {
      fetchQuizById(Number(quizId))
        .then((data) => {
          if (data) {
            setQuizTitle(data.quizTitle);
            setTotalMarks(String(data.totalMarks));
            setStartDate(data.startDate ? data.startDate.split("T")[0] : "");
            setEndDate(data.endDate ? data.endDate.split("T")[0] : "");
            setSelectedSubjectId(data.collegeSubjectId);
            setSelectedTopicId(
              data.collegeSubjectUnitTopicId || data.collegeSubjectUnitId,
            );
          }
        })
        .catch(() => toast.error("Failed to load quiz details"));
    }
  }, [quizId, isEditMode]);

  const handleSave = async (status: "Draft" | "Active") => {
    if (!quizTitle.trim()) return toast.error("Quiz title is required");
    if (!totalMarks) return toast.error("Total marks is required");
    if (!startDate) return toast.error("Start date is required");
    if (!endDate) return toast.error("End date is required");
    if (!isEditMode && isPastDate(startDate))
      return toast.error("Start date cannot be in past");
    if (isEndBeforeStart(startDate, endDate))
      return toast.error("End date must be after start date");
    if (!selectedTopicId) return toast.error("Please select a topic");
    if (!subjects[0]?.collegeSubjectId) return toast.error("Subject not found");
    if (!sections[0]?.collegeSectionsId)
      return toast.error("Section not found");
    if (!facultyId) return toast.error("Faculty not found");

    try {
      setIsSaving(true);
      setIsDraftSaving(true);

      const selectedTopicObj = topics.find(
        (t) => t.collegeSubjectUnitTopicId === selectedTopicId,
      );

      if (!selectedTopicObj) {
        toast.error("Invalid topic selected.");
        return;
      }

      const result = await saveQuiz({
        quizId: isEditMode && quizId ? Number(quizId) : undefined,
        facultyId,
        collegeSubjectId: subjects[0].collegeSubjectId,
        collegeSectionsId: sections[0].collegeSectionsId,
        collegeSubjectUnitId: selectedTopicObj.collegeSubjectUnitId, // This will be 10
        collegeSubjectUnitTopicId: selectedTopicObj.collegeSubjectUnitTopicId, // This will be 21
        quizTitle: quizTitle.trim(),
        totalMarks: Number(totalMarks),
        startDate,
        endDate,
        status,
      });

      if (!result.success) {
        toast.error("Failed to save quiz");
        return;
      }

      toast.success(
        status === "Draft"
          ? "Quiz saved as draft!"
          : "Quiz saved successfully!",
      );

      const params = new URLSearchParams();
      params.set("tab", "quiz");
      params.set("quizView", "active");
      params.set("action", "addQuestions");
      params.set("quizId", String(result.quizId));
      router.push(`${pathname}?${params.toString()}`);
    } catch (err) {
      console.error("handleSave error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
      setIsDraftSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6">
        <div className="bg-blue-00 flex items-center lg:mb-1">
          <CaretLeftIcon
            size={22}
            weight="bold"
            className="text-[#282828] cursor-pointer active:scale-90"
            onClick={onCancel}
          />
          <h1 className="font-bold text-2xl text-[#282828]">
            {isEditMode ? "Edit Quiz" : "Create New Quiz"}
          </h1>
        </div>
        <p className="text-[#282828] text-sm lg:ml-6">
          Enter details below to set up and publish your quiz for students.
        </p>
      </div>

      <div className="bg-white rounded-md p-3 flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-[#282828]">Quiz Title</label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="CPU Scheduling"
            className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Subject</label>
            <input
              type="text"
              value={
                subjects.find((s) => s.collegeSubjectId === selectedSubjectId)
                  ?.subjectName ||
                subjects[0]?.subjectName ||
                ""
              }
              readOnly
              placeholder="Loading..."
              className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Topic</label>
            <div className="relative">
              <select
                value={selectedTopicId || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSelectedTopicId(isNaN(val) ? null : val);
                }}
                className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors appearance-none bg-white cursor-pointer w-full"
              >
                <option value="">Select Topic</option>
                {topics.map((topic, index) => (
                  <option key={index} value={topic.collegeSubjectUnitTopicId}>
                    {topic.topicTitle}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-[#282828]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">
              Section(s)
            </label>
            <input
              type="text"
              value={sections[0]?.collegeSections || ""}
              readOnly
              placeholder="Loading..."
              className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">
              Total Marks
            </label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="Eg: 40"
              onWheel={(e) => e.currentTarget.blur()}
              className="border border-gray-200 rounded-md p-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-[#282828]">Duration</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#282828]">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!isEditMode && isPastDate(value)) {
                    toast.error("Start date cannot be in past");
                    return;
                  }
                  if (endDate && isEndBeforeStart(value, endDate)) {
                    setEndDate("");
                  }
                  setStartDate(value);
                }}
                min={isEditMode ? undefined : todayStr}
                className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#282828]">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!startDate) {
                    toast.error("Select start date first");
                    return;
                  }
                  if (isEndBeforeStart(startDate, value)) {
                    toast.error("End date must be after start date");
                    return;
                  }
                  setEndDate(value);
                }}
                min={startDate || todayStr}
                className="border border-gray-200 rounded-md px-4 py-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-6 py-2 rounded-md cursor-pointer border border-[#16284F] text-[#16284F] text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave("Draft")}
              disabled={isDraftSaving}
              className="px-6 py-2 rounded-md cursor-pointer bg-[#16284F] text-white text-sm font-medium hover:bg-[#102040] transition-colors disabled:opacity-50"
            >
              {isDraftSaving ? "Saving..." : "Save as Draft"}
            </button>

            <button
              onClick={() => handleSave("Active")}
              disabled={isSaving}
              className="flex items-center cursor-pointer gap-2 px-6 py-2 rounded-md bg-[#43C17A] text-white text-sm font-medium hover:bg-[#35a868] transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  {" "}
                  Add Questions <span className="text-base">›</span>{" "}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
