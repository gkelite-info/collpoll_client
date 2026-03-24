"use client";
import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import TabNavigation from "./tabNavigation";
import DiscussionDeptCard from "./discussionDeptCard";
import DiscussionCourseCard from "./discussionCourseCard";
import { FilterDropdown, MOCK_COURSES, MOCK_DEPTS } from "./filterDropdown";

import AdminQuizList from "./adminQuizList";
import AdminQuizForm from "./adminQuizForm";
import AdminAddQuestions from "./adminAddQuestions";
import AdminQuizSubmissions from "./adminQuizSubmissions";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import AdminQuizResumeBanner from "./adminQuizResumeBanner";

const MOCK_TASKS = [
  { facultyTaskId: 1, title: "Complete Python Lab", description: "Finish all 10 lab programs and upload to portal.", time: "12:40 PM", date: "2026-03-25" },
  { facultyTaskId: 2, title: "Group Discussion Prep", description: "Research topic 'Impact of AI on Education' for tomorrow's discussion.", time: "12:40 PM", date: "2026-03-26" },
  { facultyTaskId: 3, title: "Resume Update", description: "Add latest internship experience to resume builder section.", time: "12:40 PM", date: "2026-03-27" }
];

const MOCK_ANNOUNCEMENTS = [
  { collegeAnnouncementId: 1, title: "Submit internal marks for all subjects before 25 Oct 2025.", professor: "By Justin Orom", image: "/clip.png", imgHeight: "h-10", cardBg: "#E8F8EF", imageBg: "#D3F1E0" },
  { collegeAnnouncementId: 2, title: "Upload your mini project abstracts by 12 Nov 2025.", professor: "By Justin Orom", image: "/meeting.png", imgHeight: "h-10", cardBg: "#F3E8FF", imageBg: "#E9D5FF" },
  { collegeAnnouncementId: 3, title: "DBMS Lab Report submissions are due by 10 Nov 2025.", professor: "By Justin Orom", image: "/exam.png", imgHeight: "h-10", cardBg: "#FFF3E8", imageBg: "#FFE4CC" }
];

export default function QuizBasic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const dept = searchParams.get("dept");
  const year = searchParams.get("year");
  const subjectId = searchParams.get("subjectId");
  const action = searchParams.get("action");
  const quizId = searchParams.get("quizId"); // Ready for tomorrow's inner screens

  const [yearFilter, setYearFilter] = useState("2nd Year");
  const [branchFilter, setBranchFilter] = useState("All");

  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "All"];
  const branchOptions = ["All", ...new Set(MOCK_DEPTS.map(d => d.name))];

  const handleBackToDepartments = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dept");
    params.delete("year");
    router.push(`${pathname}?${params.toString()}`);
  };

  // const isInnerScreen = action === "createQuiz" || action === "editQuiz" || action === "viewQuizSubmissions" || !!subjectId;
  const isInnerScreen = action === "createQuiz" || action === "editQuiz" || action === "addQuestions" || action === "viewQuizSubmissions" || !!subjectId;

  const renderInnerContent = () => {
    if (action === "createQuiz" || action === "editQuiz") {
      return (
        <div className="flex flex-col h-full">
          <AdminQuizForm onCancel={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("action");
            router.push(`${pathname}?${params.toString()}`);
          }} />

          <AdminQuizResumeBanner margintop="lg:mt-5" />
        </div>
      );
    }
    if (action === "addQuestions") {
      return <AdminAddQuestions quizId={Number(quizId)} onBack={() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("action", "createQuiz");
        router.push(`${pathname}?${params.toString()}`);
      }} />;
    }
    if (action === "viewQuizSubmissions") {
      return <AdminQuizSubmissions quizId={Number(quizId)} onBack={() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.delete("quizId");
        router.push(`${pathname}?${params.toString()}`);
      }} />;
    }
    if (subjectId) {
      return <AdminQuizList subjectId={subjectId} />;
    }
    return null;
  };

  return (
    <div className="flex flex-col m-4 w-full mx-auto p-2">
      <TabNavigation />

      {!isInnerScreen ? (
        !dept ? (
          <>
            <div className="flex flex-wrap items-center gap-6 mt-1 mb-5">
              <FilterDropdown label="Branch" value={branchFilter} options={branchOptions} onChange={setBranchFilter} />
              <FilterDropdown label="Year" value={yearFilter} options={yearOptions} onChange={setYearFilter} />
            </div>

            <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
                {MOCK_DEPTS.filter(
                  (d) => (branchFilter === "All" || d.name === branchFilter)
                ).map((deptCard, idx) => (
                  <DiscussionDeptCard
                    key={idx}
                    {...deptCard}
                    activeText="Active Subjects with Quiz"
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="min-h-[calc(100vh-200px)] rounded-xl flex flex-col">
              <div className="flex items-center gap-1 mb-6">
                <button
                  onClick={handleBackToDepartments}
                  className="flex cursor-pointer items-center justify-center p-2 pl-0 hover:text-gray-600 transition-colors"
                >
                  <CaretLeft size={20} weight="bold" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">
                  B.Tech {dept} - {year}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
                {MOCK_COURSES.map((course) => (
                  <DiscussionCourseCard
                    key={course.id}
                    {...course}
                    activeLabel="Active Quiz"
                    buttonText="View Quiz"
                  />
                ))}
              </div>
            </div>
          </>
        )
      ) : (
        <div className="flex w-full gap-4 mt-2">
          <div className="flex-1 min-w-0">
            {renderInnerContent()}
          </div>

          <div className="w-[32%] p-2 h-full flex flex-col">
            <WorkWeekCalendar />
            <TaskPanel
              role="faculty"
              facultyTasks={MOCK_TASKS as any}
              loading={false}
              onAddTask={() => { }}
              onSaveTask={async () => { }}
              onDeleteTask={async () => { }}
            />
            <AnnouncementsCard
              announceCard={MOCK_ANNOUNCEMENTS}
              height="80vh"
              onViewChange={() => { }}
              refreshAnnouncements={async () => { }}
            />
          </div>
        </div>
      )}
    </div>
  );
}