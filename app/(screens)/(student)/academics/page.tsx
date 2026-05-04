"use client";

import { Suspense } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import SubjectCard from "./components/subjectCard";
import {
  StudentProvider,
  useStudent,
} from "@/lib/helpers/student/academics/studentFetchAcademics";
import SubjectSkeleton from "./shimmer/subjectSkeleton";
import { Loader } from "../calendar/right/timetable";
import { useTranslations } from "next-intl";

function AcademicsContent() {
  const { studentProfile, subjects, loading } = useStudent();
  const t = useTranslations("Academics.student");

  return (
    <div className="p-2 flex flex-col lg:pb-5">
      <div className="flex justify-between items-center mb-5">
        <div className="flex flex-col w-[68%]">
          <h1 className="text-[#282828] font-bold text-[28px] mb-1">
            {t("Academics")}
          </h1>
          <p className="text-[#282828] text-sm">
            {t("Track syllabus progress and manage notes by semester")}
          </p>
        </div>
        <div className="flex justify-end w-[32%]">
          <CourseScheduleCard
            department={loading ? "..." : studentProfile?.department || "N/A"}
            degree={loading ? "..." : studentProfile?.degree || "N/A"}
            year={loading ? "..." : studentProfile?.year || "N/A"}
            style="w-[320px]"
          />
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <SubjectSkeleton />
        ) : (
          <SubjectCard subjectProps={subjects} />
        )}
      </div>
    </div>
  );
}

export default function Academics() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-10 text-sm text-gray-500">
          <Loader />
        </div>
      }
    >
      <StudentProvider>
        <AcademicsContent />
      </StudentProvider>
    </Suspense>
  );
}
