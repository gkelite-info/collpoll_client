"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { FaChevronDown } from "react-icons/fa6";
import SubjectCard, { CardProps } from "./components/subjectCards";
import { useUser } from "@/app/utils/context/UserContext";
import { useState, useEffect } from "react";
import { getFacultySubjects } from "./components/subjectDetails";
import { fetchFacultyContext } from "@/app/utils/context/facultyContextAPI";



import { CircleNotch } from "@phosphor-icons/react";





export default function Academics() {
  /* --------------------------------
   * Auth / Base Context
   * -------------------------------- */
  const { userId, collegeId, loading } = useUser();

  /* --------------------------------
   * Local State
   * -------------------------------- */
  const [subjects, setSubjects] = useState<CardProps[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  /* --------------------------------
   * Load Faculty → Subjects
   * -------------------------------- */



  useEffect(() => {
    if (loading) return;

    if (userId === null || collegeId === null) {
      console.warn("❌ Missing userId / collegeId", { userId, collegeId });
      return;
    }

    setPageLoading(true);

    // 🔐 TS-SAFE: now these are `number`
    const resolvedUserId: number = userId;
    const resolvedCollegeId: number = collegeId;

    async function loadSubjects() {
      try {
        console.log("🚀 Fetching faculty context for userId:", resolvedUserId);

        const facultyCtx = await fetchFacultyContext(resolvedUserId);
        // fetchFacultyContext(userId) ❌ WRONG
        // fetchFacultyContext(resolvedUserId) ✅ CORRECT

        console.log("✅ Faculty Context:", facultyCtx);

        const data = await getFacultySubjects({
          collegeId: resolvedCollegeId,
          facultyId: facultyCtx.facultyId,
        });

        console.log("📦 Subjects fetched:", data);
        setSubjects(data);
      } catch (err) {
        console.error("❌ Failed to load faculty subjects", err);
      } finally {
        setPageLoading(false);
      }
    }

    loadSubjects();
  }, [userId, collegeId, loading]);





  // export default function Academics() {
  // const MOCK_SUBJECT_DATA: CardProps[] = [
  //   {
  //     subjectTitle: "Data Structures",
  //     year: "Year 2 – CSE A",
  //     units: 15,
  //     topicsCovered: 15,
  //     topicsTotal: 15,
  //     nextLesson: "Trees & Traversals",
  //     students: 35,
  //     percentage: 100,
  //     fromDate: "10-12-2025",
  //     toDate: "01-01-2026",
  //   },
  //   {
  //     subjectTitle: "Algorithms",
  //     year: "Year 3 CSE",
  //     units: 3,
  //     topicsCovered: 10,
  //     topicsTotal: 15,
  //     nextLesson: "Trees & Traversals",
  //     students: 35,
  //     percentage: 60,
  //     fromDate: "15 Jan 2026",
  //     toDate: "10 Apr 2026",
  //   },
  //   {
  //     subjectTitle: "Data Structures",
  //     year: "Year 2 IT",
  //     units: 8,
  //     topicsCovered: 15,
  //     topicsTotal: 20,
  //     nextLesson: "Hashing",
  //     students: 38,
  //     percentage: 55,
  //     fromDate: "12 Dec 2025",
  //     toDate: "02 Mar 2026",
  //   },
  //   {
  //     subjectTitle: "Algorithms",
  //     year: "Year 3 CSE",
  //     units: 3,
  //     topicsCovered: 10,
  //     topicsTotal: 15,
  //     nextLesson: "Trees & Traversals",
  //     students: 35,
  //     percentage: 60,
  //     fromDate: "15 Jan 2026",
  //     toDate: "10 Apr 2026",
  //   },
  //   {
  //     subjectTitle: "OS",
  //     year: "Year 3 CSE",
  //     units: 8,
  //     topicsCovered: 15,
  //     topicsTotal: 30,
  //     nextLesson: "Hashing",
  //     students: 38,
  //     percentage: 40,
  //     fromDate: "12 Dec 2025",
  //     toDate: "02 Mar 2026",
  //   },
  //   {
  //     subjectTitle: "Algorithms",
  //     year: "Year 3 CSE",
  //     units: 3,
  //     topicsCovered: 10,
  //     topicsTotal: 15,
  //     nextLesson: "Trees & Traversals",
  //     students: 35,
  //     percentage: 60,
  //     fromDate: "15 Jan 2026",
  //     toDate: "10 Apr 2026",
  //   },
  // ];

  return (
    <div className="p-2 flex flex-col lg:pb-5">
      <div className="flex justify-between items-center mb-5">
        <div className="flex flex-col w-[50%]">
          <h1 className="text-[#282828] font-semibold text-2xl mb-1">
            My Classes
          </h1>
          <p className="text-[#282828] text-sm">
            Track progress, add lessons and manage course content across all
            your batches.
          </p>
        </div>
        <div className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </div>
      </div>

      <div className="mt-4">
        {pageLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <CircleNotch
                size={48}
                weight="bold"
                className="animate-spin text-[#795FD9]"
              />
              <p className="text-sm font-medium text-[#795FD9]">
                Loading classes...
              </p>
            </div>
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-10">
            No classes assigned
          </p>
        ) : (
          <SubjectCard subjectProps={subjects} />
        )}
      </div>
    </div>
  );
}
