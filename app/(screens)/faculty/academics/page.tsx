"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { FaChevronDown } from "react-icons/fa6";
import SubjectCard, { CardProps } from "./components/subjectCards";
import { useUser } from "@/app/utils/context/UserContext";
import { useState, useEffect, useRef } from "react";
// import { getFacultySubjects } from "./components/subjectDetails";
import { fetchFacultyContext } from "@/app/utils/context/faculty/facultyContextAPI";

import { CircleNotch } from "@phosphor-icons/react";
import { Loader } from "../../(student)/calendar/right/timetable";
import { getFacultySubjects } from "@/lib/helpers/faculty/getFacultySubjects";

export default function Academics() {
  const { userId, collegeId, loading: userLoading } = useUser();
  const [pageLoading, setPageLoading] = useState(true);
  const [subjects, setSubjects] = useState<CardProps[]>([]);

  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (userLoading) return;

    if (userId === null || collegeId === null) {
      setPageLoading(false);
      return;
    }

    if (!hasLoadedOnce.current) {
      setPageLoading(true);
    }

    async function loadSubjects() {
      try {
        console.log("🟢 loadSubjects triggered");
    console.log("➡️ userId:", userId);
    console.log("➡️ collegeId:", collegeId);
        if (userId === null || collegeId === null) return;
         console.log("❌ userId or collegeId is null");

        const facultyCtx = await fetchFacultyContext(userId);
        console.log("➡️ facultyCtx:", facultyCtx);

        const data = await getFacultySubjects({
          collegeId,
          facultyId: facultyCtx.facultyId,
        });
         console.log("✅ getFacultySubjects result:", data);

        setSubjects(data);
      } catch (err) {
        console.error("❌ Failed to load faculty subjects", err);
      } finally {
        setPageLoading(false);
        hasLoadedOnce.current = true;
      }
    }

    loadSubjects();
  }, [userId, collegeId, userLoading]);

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

      {userLoading || pageLoading ? (
          <Loader />
      ) : (
        <>
          <div className="mt-4">
            {subjects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-10">
                No classes assigned
              </p>
            ) : (
              <SubjectCard subjectProps={subjects} />
            )}
          </div>
        </>
      )}
    </div>
  );
}