"use client";
import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import TabNavigation from "./tabNavigation";
import DiscussionDeptCard from "./discussionDeptCard";
import DiscussionCourseCard from "./discussionCourseCard";
import { FilterDropdown, MOCK_COURSES, MOCK_DEPTS } from "./filterDropdown";
import AdminDiscussionList from "./adminDiscussionList";
import AdminDiscussionForm from "./adminDiscussionForm";
import AdminDiscussionSubmissions from "./adminDiscussionSubmissions";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";

const MOCK_TASKS = [
  { facultyTaskId: 1, title: "Complete Python Lab", description: "Finish all 10 lab programs and upload to portal.", time: "12:40 PM", date: "2026-03-25" },
  { facultyTaskId: 2, title: "Group Discussion Prep", description: "Research topic 'Impact of AI on Education' for tomorrow's discussion.", time: "12:40 PM", date: "2026-03-26" },
  { facultyTaskId: 3, title: "Resume Update", description: "Add latest internship experience to resume builder section.", time: "12:40 PM", date: "2026-03-27" }
];

const MOCK_ANNOUNCEMENTS = [
  { collegeAnnouncementId: 1, title: "Submit internal marks for all subjects before 25 Oct 2025.", professor: "By Justin Orom", image: "/clip.png", imgHeight: "h-10", cardBg: "#E8F8EF", imageBg: "#D3F1E0" },
  { collegeAnnouncementId: 2, title: "Upload your mini project abstracts by 12 Nov 2025.", professor: "By Justin Orom", image: "/meeting.png", imgHeight: "h-10", cardBg: "#F3E8FF", imageBg: "#E9D5FF" },
  { collegeAnnouncementId: 3, title: "DBMS Lab Report submissions are due by 10 Nov 2025.", professor: "By Justin Orom", image: "/exam.png", imgHeight: "h-10", cardBg: "#FFF3E8", imageBg: "#FFE4CC" },
  { collegeAnnouncementId: 4, title: "Mid-semester exams are scheduled from 15–20 Nov 2025.", professor: "By Justin Orom", image: "/calendar-3d.png", imgHeight: "h-10", cardBg: "#E8EEFF", imageBg: "#CCDAFF" }
];

export default function DiscussionForumBasic() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const dept = searchParams.get("dept");
  const year = searchParams.get("year");
  const subjectId = searchParams.get("subjectId");
  const action = searchParams.get("action");
  const discussionId = searchParams.get("discussionId");

  const [yearFilter, setYearFilter] = useState("2nd Year");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "All"];
  const generalOptions = ["All"];

  const handleBackToDepartments = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dept");
    params.delete("year");
    router.push(`?${params.toString()}`);
  };

  const isInnerScreen = action === "createDiscussion" || action === "editDiscussion" || action === "viewSubmissions" || !!subjectId;

  const renderInnerContent = () => {
    if (action === "createDiscussion" || action === "editDiscussion") {
      return <AdminDiscussionForm discussionId={discussionId ? Number(discussionId) : undefined} />;
    }
    if (action === "viewSubmissions") {
      return <AdminDiscussionSubmissions discussionId={discussionId} />;
    }
    if (subjectId) {
      return <AdminDiscussionList subjectId={subjectId} />;
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
              <FilterDropdown label="Year" value={yearFilter} options={yearOptions} onChange={setYearFilter} />
              <FilterDropdown label="Section" value={sectionFilter} options={generalOptions} onChange={setSectionFilter} />
              <FilterDropdown label="Sem" value={semFilter} options={generalOptions} onChange={setSemFilter} />
              <FilterDropdown label="Subject" value={subjectFilter} options={generalOptions} onChange={setSubjectFilter} />
            </div>

            <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto ">
                {MOCK_DEPTS.filter(
                  (d) => (yearFilter === "All" || d.year === yearFilter.charAt(0))
                ).map((deptCard, idx) => (
                  <DiscussionDeptCard key={idx} {...deptCard} />
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
                  B.Tech {dept} - Year {year}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
                {MOCK_COURSES.map((course) => (
                  <DiscussionCourseCard key={course.id} {...course} />
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

          <div className="w-[32%] p-2 h-full flex flex-col ">
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