"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import SubjectCard from "./components/subjectCards";
import { useUser } from "@/app/utils/context/UserContext";
import { useState, useEffect, useRef } from "react";
import { fetchFacultyContext } from "@/app/utils/context/faculty/facultyContextAPI";
import { Loader } from "../../(student)/calendar/right/timetable";
import { getFacultySubjects } from "@/lib/helpers/faculty/getFacultySubjects";
import { CardProps } from "@/lib/types/faculty";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";

export default function Academics() {
  const { userId, collegeId } = useUser();
  const [pageLoading, setPageLoading] = useState(true);
  const [subjects, setSubjects] = useState<CardProps[]>([]);
  const [facultyCtx, setFacultyCtx] = useState<any>(null);
  const { facultyId } = useFaculty();

  const hasLoadedOnce = useRef(false);

  useEffect(() => {

    if (userId === null || collegeId === null) {
      setPageLoading(false);
      return;
    }

    const safeUserId = userId;
    const safeCollegeId = collegeId;

    if (!hasLoadedOnce.current) {
      setPageLoading(true);
    }

    let isCancelled = false;

    async function loadSubjects() {
      try {
        const ctx = await fetchFacultyContext(safeUserId);

        if (!ctx) {
          setSubjects([]);
          return;
        }

        setFacultyCtx(ctx);

        if (!ctx.subjectIds?.length) {
          setSubjects([]);
          return;
        }

        const data = await getFacultySubjects({
          collegeId: safeCollegeId,
          collegeEducationId: ctx.collegeEducationId,
          collegeBranchId: ctx.collegeBranchId,
          academicYearIds: ctx.academicYearIds,
          subjectIds: ctx.subjectIds,
          sectionIds: ctx.sectionIds,
        });

        if (!isCancelled) {
          setSubjects(data);
        }
      } catch (err) {
        console.error("❌ Failed to load faculty subjects", err);
      } finally {
        if (!isCancelled) {
          setPageLoading(false);
          hasLoadedOnce.current = true;
        }
      }
    }
    loadSubjects();

    return () => {
      isCancelled = true;
    };
  }, [userId, collegeId]);

  return (
    <div className="p-2 flex flex-col h-[calc(100vh-80px)] lg:pb-5">

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

      {pageLoading ? (
        <Loader />
      ) : (
        <div className="mt-4 flex-1 overflow-y-auto pr-2">
          {subjects.length === 0 && facultyId ? (
            <p className="text-sm text-gray-500 text-center mt-10">
              No classes assigned
            </p>
          ) : (
            <SubjectCard subjectProps={subjects} facultyCtx={facultyCtx} />
          )}
        </div>
      )}
    </div>
  );
}