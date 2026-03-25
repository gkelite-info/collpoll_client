"use client";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { saveQuiz } from "@/lib/helpers/quiz/quizAPI";
import { getTopicsBySubjectId } from "@/lib/helpers/faculty/getFacultySubjects";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { fetchFacultyForSubject } from "@/lib/helpers/admin/assignments/quiz/adminQuizAPI";

interface AdminQuizFormProps {
  onCancel: () => void;
}

export default function AdminQuizForm({ onCancel }: AdminQuizFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { collegeId } = useAdmin();
  const subjectId = searchParams.get("subjectId");

  const [topics, setTopics] = useState<
    { topicTitle: string; collegeSubjectUnitId: number }[]
  >([]);

  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(
    null,
  );
  const [assignedFacultyName, setAssignedFacultyName] =
    useState<string>("Loading...");

  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (subjectId) {
      getTopicsBySubjectId(Number(subjectId))
        .then(setTopics)
        .catch(console.error);

      setSectionId(1);

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

  const handleSave = async (status: "Draft" | "Active") => {
    if (!quizTitle.trim()) return toast.error("Quiz title is required");
    if (!totalMarks) return toast.error("Total marks is required");
    if (!startDate || !endDate) return toast.error("Dates are required");
    if (!selectedTopicId) return toast.error("Please select a topic");
    if (!selectedFacultyId)
      return toast.error("No Faculty assigned to this subject.");
    if (!subjectId || !sectionId)
      return toast.error("Context missing (Subject/Section)");

    try {
      setIsSaving(true);
      const result = await saveQuiz({
        facultyId: selectedFacultyId,
        collegeSubjectId: Number(subjectId),
        collegeSectionsId: sectionId,
        collegeSubjectUnitId: selectedTopicId,
        quizTitle: quizTitle.trim(),
        totalMarks: Number(totalMarks),
        startDate,
        endDate,
        status,
      });

      if (!result.success) throw new Error("Failed to save");

      toast.success(
        status === "Draft"
          ? "Quiz saved as draft!"
          : "Quiz saved successfully!",
      );

      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "quiz");
      params.set("quizView", "active");
      params.set("action", "addQuestions");
      params.set("quizId", String(result.quizId));
      router.push(`${pathname}?${params.toString()}`);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center lg:mb-1">
          <CaretLeftIcon
            size={22}
            weight="bold"
            className="text-[#282828] cursor-pointer"
            onClick={onCancel}
          />
          <h1 className="font-bold text-2xl text-[#282828]">Create New Quiz</h1>
        </div>
      </div>

      <div className="bg-white rounded-md text-[#282828] p-4 flex flex-col gap-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-[#282828]">
            Assign Faculty
          </label>
          <select
            value={selectedFacultyId ?? ""}
            disabled
            className="border border-gray-200 rounded-md p-2.5 text-sm outline-none bg-gray-50 cursor-not-allowed appearance-none"
          >
            <option value={selectedFacultyId ?? ""}>
              {assignedFacultyName}{" "}
              {selectedFacultyId ? `(ID: ${selectedFacultyId})` : ""}
            </option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">
              Quiz Title
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g. Memory Management"
              className="border border-gray-200 rounded-md p-2.5 text-sm outline-none "
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Topic</label>
            <select
              value={selectedTopicId ?? ""}
              onChange={(e) => setSelectedTopicId(Number(e.target.value))}
              className="border border-gray-200 rounded-md p-2.5 text-sm outline-none  bg-white cursor-pointer"
            >
              <option value="">Select Topic</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic.collegeSubjectUnitId}>
                  {topic.topicTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">
              Total Marks
            </label>
            <input
              type="number"
              placeholder="50"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              className="border border-gray-200 rounded-md p-2.5 text-sm outline-none "
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-md p-2.5 text-sm outline-none "
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-md p-2.5 text-sm outline-none "
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-6 py-2 rounded-md border text-[#16284F] text-sm cursor-pointer font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave("Draft")}
              disabled={isSaving}
              className="px-6 py-2 rounded-md bg-[#16284F] text-white text-sm font-medium cursor-pointer hover:bg-[#102040]"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSave("Active")}
              disabled={isSaving}
              className="px-6 py-2 rounded-md bg-[#43C17A] text-white cursor-pointer text-sm font-medium hover:bg-[#35a868]"
            >
              Add Questions ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
