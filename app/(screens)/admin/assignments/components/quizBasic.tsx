// "use client";
// import { useState, useEffect } from "react";
// import { useSearchParams, useRouter, usePathname } from "next/navigation";
// import { CaretLeft } from "@phosphor-icons/react";
// import TabNavigation from "./tabNavigation";
// import DiscussionDeptCard from "./discussionDeptCard";
// import DiscussionCourseCard from "./discussionCourseCard";
// import { FilterDropdown } from "./filterDropdown";

// import AdminQuizList from "./adminQuizList";
// import AdminQuizForm from "./adminQuizForm";
// import AdminAddQuestions from "./adminAddQuestions";
// import AdminQuizSubmissions from "./adminQuizSubmissions";

// import AnnouncementsCard from "@/app/utils/announcementsCard";
// import TaskPanel from "@/app/utils/taskPanel";
// import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
// import AdminQuizResumeBanner from "./adminQuizResumeBanner";

// import { useAdmin } from "@/app/utils/context/admin/useAdmin";

// import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

// import {
//   fetchAdminQuizDepartments,
//   fetchAdminQuizSubjects,
// } from "@/lib/helpers/admin/assignments/quiz/adminQuizAPI";

// const MOCK_TASKS = [
//   {
//     facultyTaskId: 1,
//     title: "Complete Python Lab",
//     description: "Finish all 10 lab programs and upload to portal.",
//     time: "12:40 PM",
//     date: "2026-03-25",
//   },
//   {
//     facultyTaskId: 2,
//     title: "Group Discussion Prep",
//     description:
//       "Research topic 'Impact of AI on Education' for tomorrow's discussion.",
//     time: "12:40 PM",
//     date: "2026-03-26",
//   },
//   {
//     facultyTaskId: 3,
//     title: "Resume Update",
//     description: "Add latest internship experience to resume builder section.",
//     time: "12:40 PM",
//     date: "2026-03-27",
//   },
// ];

// const MOCK_ANNOUNCEMENTS = [
//   {
//     collegeAnnouncementId: 1,
//     title: "Submit internal marks for all subjects before 25 Oct 2025.",
//     professor: "By Justin Orom",
//     image: "/clip.png",
//     imgHeight: "h-10",
//     cardBg: "#E8F8EF",
//     imageBg: "#D3F1E0",
//   },
//   {
//     collegeAnnouncementId: 2,
//     title: "Upload your mini project abstracts by 12 Nov 2025.",
//     professor: "By Justin Orom",
//     image: "/meeting.png",
//     imgHeight: "h-10",
//     cardBg: "#F3E8FF",
//     imageBg: "#E9D5FF",
//   },
//   {
//     collegeAnnouncementId: 3,
//     title: "DBMS Lab Report submissions are due by 10 Nov 2025.",
//     professor: "By Justin Orom",
//     image: "/exam.png",
//     imgHeight: "h-10",
//     cardBg: "#FFF3E8",
//     imageBg: "#FFE4CC",
//   },
// ];

// export default function QuizBasic() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const pathname = usePathname();
//   const { collegeId, collegeEducationId } = useAdmin();

//   const dept = searchParams.get("dept");
//   const year = searchParams.get("year");
//   const branchIdParam = searchParams.get("branchId");
//   const yearIdParam = searchParams.get("yearId");

//   const subjectId = searchParams.get("subjectId");
//   const action = searchParams.get("action");
//   const quizId = searchParams.get("quizId");

//   const [yearFilter, setYearFilter] = useState("All");
//   const [branchFilter, setBranchFilter] = useState("All");

//   const [dynamicDepts, setDynamicDepts] = useState<any[]>([]);
//   const [dynamicCourses, setDynamicCourses] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (!collegeId || !collegeEducationId || branchIdParam) return;
//     setIsLoading(true);
//     fetchAdminQuizDepartments(collegeId, collegeEducationId)
//       .then(setDynamicDepts)
//       .finally(() => setIsLoading(false));
//   }, [collegeId, collegeEducationId, branchIdParam]);

//   useEffect(() => {
//     if (!collegeId || !branchIdParam || !yearIdParam) return;
//     setIsLoading(true);
//     fetchAdminQuizSubjects(
//       collegeId,
//       Number(branchIdParam),
//       Number(yearIdParam),
//     )
//       .then(setDynamicCourses)
//       .finally(() => setIsLoading(false));
//   }, [collegeId, branchIdParam, yearIdParam]);

//   // const yearOptions = ["All", ...new Set(dynamicDepts.map((d) => d.year))];
//   // const branchOptions = ["All", ...new Set(dynamicDepts.map((d) => d.name))];

//   const yearOptions = ["All", ...new Set(dynamicDepts.map((d) => d.year))].map(
//     (y) => ({
//       label: String(y),
//       value: String(y),
//     }),
//   );

//   const branchOptions = [
//     "All",
//     ...new Set(dynamicDepts.map((d) => d.name)),
//   ].map((b) => ({
//     label: String(b),
//     value: String(b),
//   }));

//   const handleBackToDepartments = () => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.delete("dept");
//     params.delete("year");
//     params.delete("branchId");
//     params.delete("yearId");
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const isInnerScreen =
//     action === "createQuiz" ||
//     action === "editQuiz" ||
//     action === "addQuestions" ||
//     action === "viewQuizSubmissions" ||
//     !!subjectId;

//   const renderInnerContent = () => {
//     if (action === "createQuiz" || action === "editQuiz") {
//       return (
//         <div className="flex flex-col h-full">
//           <AdminQuizForm
//             onCancel={() => {
//               const params = new URLSearchParams(searchParams.toString());
//               params.delete("action");
//               router.push(`${pathname}?${params.toString()}`);
//             }}
//           />
//           <AdminQuizResumeBanner
//             subjectId={Number(subjectId)}
//             margintop="lg:mt-5"
//           />
//         </div>
//       );
//     }
//     if (action === "addQuestions") {
//       return (
//         <AdminAddQuestions
//           quizId={Number(quizId)}
//           onBack={() => {
//             const params = new URLSearchParams(searchParams.toString());
//             params.set("action", "createQuiz");
//             router.push(`${pathname}?${params.toString()}`);
//           }}
//         />
//       );
//     }
//     if (action === "viewQuizSubmissions") {
//       return (
//         <AdminQuizSubmissions
//           quizId={Number(quizId)}
//           onBack={() => {
//             const params = new URLSearchParams(searchParams.toString());
//             params.delete("action");
//             params.delete("quizId");
//             router.push(`${pathname}?${params.toString()}`);
//           }}
//         />
//       );
//     }
//     if (subjectId) {
//       return <AdminQuizList subjectId={subjectId} />;
//     }
//     return null;
//   };

//   return (
//     <div className="flex flex-col m-4 w-full mx-auto p-2 ">
//       <TabNavigation />

//       {!isInnerScreen ? (
//         !branchIdParam ? (
//           <>
//             <div className="flex flex-wrap items-center gap-6 mt-1 mb-5">
//               <FilterDropdown
//                 label="Branch"
//                 value={branchFilter}
//                 options={branchOptions}
//                 onChange={setBranchFilter}
//               />
//               <FilterDropdown
//                 label="Year"
//                 value={yearFilter}
//                 options={yearOptions}
//                 onChange={setYearFilter}
//               />
//             </div>

//             <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col ">
//               {isLoading ? (
//                 <div className="w-full text-center py-20">
//                   <Loader />
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
//                   {dynamicDepts
//                     .filter(
//                       (d) =>
//                         (branchFilter === "All" || d.name === branchFilter) &&
//                         (yearFilter === "All" || d.year === yearFilter),
//                     )
//                     .map((deptCard, idx) => (
//                       <DiscussionDeptCard
//                         key={idx}
//                         {...deptCard}
//                         activeText="Active Subjects with Quiz"
//                       />
//                     ))}
//                 </div>
//               )}
//             </div>
//           </>
//         ) : (
//           <>
//             <div className="min-h-[calc(100vh-200px)] rounded-xl flex flex-col">
//               <div className="flex items-center gap-1 mb-6">
//                 <button
//                   onClick={handleBackToDepartments}
//                   className="flex cursor-pointer items-center justify-center p-2 pl-0 hover:text-gray-600 transition-colors"
//                 >
//                   <CaretLeft
//                     size={20}
//                     weight="bold"
//                     className="text-[#282828] cursor-pointer active:scale-90"
//                   />
//                 </button>
//                 <h2 className="text-xl font-bold text-gray-800">
//                   {dept} - {year}
//                 </h2>
//               </div>

//               {isLoading ? (
//                 <div className="w-full text-center py-20">
//                   <Loader />
//                 </div>
//               ) : dynamicCourses.length === 0 ? (
//                 <div className="w-full text-center py-20 text-gray-400">
//                   No subjects found.
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
//                   {dynamicCourses.map((course) => (
//                     <DiscussionCourseCard
//                       key={course.id}
//                       {...course}
//                       activeLabel="Active Quiz"
//                       buttonText="View Quiz"
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>
//           </>
//         )
//       ) : (
//         <div className="flex w-full gap-4 mt-2">
//           <div className="flex-1 min-w-0">{renderInnerContent()}</div>

//           <div className="w-[32%] p-2 h-full flex flex-col">
//             <WorkWeekCalendar />
//             <TaskPanel
//               role="faculty"
//               facultyTasks={MOCK_TASKS as any}
//               loading={false}
//               onAddTask={() => {}}
//               onSaveTask={async () => {}}
//               onDeleteTask={async () => {}}
//             />
//             <AnnouncementsCard
//               announceCard={MOCK_ANNOUNCEMENTS}
//               height="80vh"
//               onViewChange={() => {}}
//               refreshAnnouncements={async () => {}}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import TabNavigation from "./tabNavigation";
import DiscussionDeptCard from "./discussionDeptCard";
import DiscussionCourseCard from "./discussionCourseCard";
import { FilterDropdown } from "./filterDropdown";

import AdminQuizList from "./adminQuizList";
import AdminQuizForm from "./adminQuizForm";
import AdminAddQuestions from "./adminAddQuestions";
import AdminQuizSubmissions from "./adminQuizSubmissions";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import AdminQuizResumeBanner from "./adminQuizResumeBanner";

import { useAdmin } from "@/app/utils/context/admin/useAdmin";

import {
  fetchAdminQuizDepartments,
  fetchAdminQuizSubjects,
  fetchQuizFilterOptions,
} from "@/lib/helpers/admin/assignments/quiz/adminQuizAPI";
import { DiscussionDeptCardSkeleton } from "./shimmers/DiscussionDeptCardSkeleton";
import { DiscussionCourseCardSkeleton } from "./shimmers/courseCardSkeleton";

// --- Shimmer Components ---
const DeptCardShimmer = () => (
  <div className="bg-white rounded-[10px] p-4 shadow-sm border-l-[8px] border-gray-200 flex flex-col h-[184px] animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
      <div className="h-6 bg-gray-200 rounded-full w-12"></div>
    </div>
    <div className="flex items-center gap-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="flex -space-x-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
          ></div>
        ))}
      </div>
    </div>
    <div className="flex justify-between items-center mb-6">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-6 bg-gray-200 rounded-full w-8"></div>
    </div>
    <div className="flex justify-between items-center mt-auto">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-200"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const CourseCardShimmer = () => (
  <div className="bg-white w-auto rounded-[10px] p-5 shadow-sm border border-gray-100 flex flex-col animate-pulse h-[256px]">
    <div className="text-center mb-4">
      <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-px w-full bg-gray-200" />
    </div>
    <div className="flex items-center gap-3 mb-5 px-1">
      <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
      <div className="flex flex-col gap-2 w-full">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
    <div className="flex flex-col gap-3 mb-6 px-1">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded-full w-6"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded-full w-6"></div>
      </div>
    </div>
    <div className="h-10 bg-gray-200 rounded-full w-full mt-auto"></div>
  </div>
);
// --------------------------

const MOCK_TASKS = [
  {
    facultyTaskId: 1,
    title: "Complete Python Lab",
    description: "Finish all 10 lab programs and upload to portal.",
    time: "12:40 PM",
    date: "2026-03-25",
  },
  {
    facultyTaskId: 2,
    title: "Group Discussion Prep",
    description:
      "Research topic 'Impact of AI on Education' for tomorrow's discussion.",
    time: "12:40 PM",
    date: "2026-03-26",
  },
  {
    facultyTaskId: 3,
    title: "Resume Update",
    description: "Add latest internship experience to resume builder section.",
    time: "12:40 PM",
    date: "2026-03-27",
  },
];

const MOCK_ANNOUNCEMENTS = [
  {
    collegeAnnouncementId: 1,
    title: "Submit internal marks for all subjects before 25 Oct 2025.",
    professor: "By Justin Orom",
    image: "/clip.png",
    imgHeight: "h-10",
    cardBg: "#E8F8EF",
    imageBg: "#D3F1E0",
  },
  {
    collegeAnnouncementId: 2,
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By Justin Orom",
    image: "/meeting.png",
    imgHeight: "h-10",
    cardBg: "#F3E8FF",
    imageBg: "#E9D5FF",
  },
  {
    collegeAnnouncementId: 3,
    title: "DBMS Lab Report submissions are due by 10 Nov 2025.",
    professor: "By Justin Orom",
    image: "/exam.png",
    imgHeight: "h-10",
    cardBg: "#FFF3E8",
    imageBg: "#FFE4CC",
  },
];

export default function QuizBasic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { collegeId, collegeEducationId } = useAdmin();

  const dept = searchParams.get("dept");
  const year = searchParams.get("year");
  const branchIdParam = searchParams.get("branchId");
  const yearIdParam = searchParams.get("yearId");

  const subjectId = searchParams.get("subjectId");
  const action = searchParams.get("action");
  const quizId = searchParams.get("quizId");

  const [yearFilter, setYearFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [branchOptions, setBranchOptions] = useState([
    { label: "All", value: "All" },
  ]);
  const [yearOptions, setYearOptions] = useState([
    { label: "All", value: "All" },
  ]);

  const [dynamicDepts, setDynamicDepts] = useState<any[]>([]);
  const [dynamicCourses, setDynamicCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!collegeId || !collegeEducationId) return;
    fetchQuizFilterOptions(collegeId, collegeEducationId).then((res) => {
      setBranchOptions(res.branchOptions);
      setYearOptions(res.yearOptions);
    });
  }, [collegeId, collegeEducationId]);

  useEffect(() => {
    if (!collegeId || !collegeEducationId || branchIdParam) return;
    setIsLoading(true);
    fetchAdminQuizDepartments(
      collegeId,
      collegeEducationId,
      branchFilter,
      yearFilter,
      page,
      9,
    )
      .then((res) => {
        setDynamicDepts(res.data);
        setTotalPages(res.totalPages);
      })
      .finally(() => setIsLoading(false));
  }, [
    collegeId,
    collegeEducationId,
    branchIdParam,
    branchFilter,
    yearFilter,
    page,
  ]);

  useEffect(() => {
    if (!collegeId || !branchIdParam || !yearIdParam) return;
    setIsLoading(true);
    fetchAdminQuizSubjects(
      collegeId,
      Number(branchIdParam),
      Number(yearIdParam),
    )
      .then(setDynamicCourses)
      .finally(() => setIsLoading(false));
  }, [collegeId, branchIdParam, yearIdParam]);

  const handleBackToDepartments = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dept");
    params.delete("year");
    params.delete("branchId");
    params.delete("yearId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const isInnerScreen =
    action === "createQuiz" ||
    action === "editQuiz" ||
    action === "addQuestions" ||
    action === "viewQuizSubmissions" ||
    !!subjectId;

  const renderInnerContent = () => {
    if (action === "createQuiz" || action === "editQuiz") {
      return (
        <div className="flex flex-col h-full">
          <AdminQuizForm
            onCancel={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("action");
              router.push(`${pathname}?${params.toString()}`);
            }}
          />
          <AdminQuizResumeBanner
            subjectId={Number(subjectId)}
            margintop="lg:mt-5"
          />
        </div>
      );
    }
    if (action === "addQuestions") {
      return (
        <AdminAddQuestions
          quizId={Number(quizId)}
          onBack={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("action", "createQuiz");
            router.push(`${pathname}?${params.toString()}`);
          }}
        />
      );
    }
    if (action === "viewQuizSubmissions") {
      return (
        <AdminQuizSubmissions
          quizId={Number(quizId)}
          onBack={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("action");
            params.delete("quizId");
            router.push(`${pathname}?${params.toString()}`);
          }}
        />
      );
    }
    if (subjectId) {
      return <AdminQuizList subjectId={subjectId} />;
    }
    return null;
  };

  return (
    <div className="flex flex-col m-4 w-full mx-auto p-2 ">
      <TabNavigation />

      {!isInnerScreen ? (
        !branchIdParam ? (
          <>
            <div className="flex flex-wrap items-center gap-6 mt-1 mb-5">
              <FilterDropdown
                label="Branch"
                value={branchFilter}
                options={branchOptions}
                onChange={(val) => {
                  setBranchFilter(val);
                  setPage(1);
                }}
              />
              <FilterDropdown
                label="Year"
                value={yearFilter}
                options={yearOptions}
                onChange={(val) => {
                  setYearFilter(val);
                  setPage(1);
                }}
              />
            </div>

            <div className="bg-[#F3F6F9] min-h-screen rounded-xl flex flex-col ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
                {isLoading ? (
                  <>
                    <DiscussionDeptCardSkeleton />
                    <DiscussionDeptCardSkeleton />
                    <DiscussionDeptCardSkeleton />
                    <DiscussionDeptCardSkeleton />
                    <DiscussionDeptCardSkeleton />
                    <DiscussionDeptCardSkeleton />
                  </>
                ) : (
                  dynamicDepts.map((deptCard, idx) => (
                    <DiscussionDeptCard
                      key={idx}
                      {...deptCard}
                      activeText="Active Subjects with Quiz"
                    />
                  ))
                )}
              </div>

              {/* Dynamic Pagination Component */}
              {!isLoading && totalPages > 1 && (
                <div className="flex justify-center pb-4 shrink-0 pt-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={`p-2 rounded-md ${
                        page === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300 cursor-pointer"
                      }`}
                    >
                      <CaretLeft size={16} weight="bold" />
                    </button>

                    <div className="flex items-center gap-2 max-w-[60vw] overflow-x-auto scrollbar-hide">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1 cursor-pointer rounded-md text-sm font-medium ${
                              page === p
                                ? "bg-[#16284F] text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                          >
                            {p}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className={`p-2 rounded-md ${
                        page === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300 cursor-pointer"
                      }`}
                    >
                      <CaretRight size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              )}
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
                  <CaretLeft
                    size={20}
                    weight="bold"
                    className="text-[#282828] cursor-pointer active:scale-90"
                  />
                </button>
                <h2 className="text-xl font-bold text-gray-800">
                  {dept} - {year}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mx-auto">
                {isLoading ? (
                  <>
                    <DiscussionCourseCardSkeleton />
                    <DiscussionCourseCardSkeleton />
                    <DiscussionCourseCardSkeleton />
                  </>
                ) : dynamicCourses.length === 0 ? (
                  <div className="col-span-full w-full text-center py-20 text-gray-400">
                    No subjects found.
                  </div>
                ) : (
                  dynamicCourses.map((course) => (
                    <DiscussionCourseCard
                      key={course.id}
                      {...course}
                      activeLabel="Active Quiz"
                      buttonText="View Quiz"
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )
      ) : (
        <div className="flex w-full gap-4 mt-2">
          <div className="flex-1 min-w-0">{renderInnerContent()}</div>

          <div className="w-[32%] p-2 h-full flex flex-col">
            <WorkWeekCalendar />
            <TaskPanel
              role="faculty"
              facultyTasks={MOCK_TASKS as any}
              loading={false}
              onAddTask={() => {}}
              onSaveTask={async () => {}}
              onDeleteTask={async () => {}}
            />
            <AnnouncementsCard
              announceCard={MOCK_ANNOUNCEMENTS}
              height="80vh"
              onViewChange={() => {}}
              refreshAnnouncements={async () => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
