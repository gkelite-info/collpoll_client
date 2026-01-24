"use client";

import { Suspense } from "react";
import ProjectsHeader from "./compounents/ProjectsHeader";
import FacultyAcademicCard from "./compounents/facultyAcademicCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

function ProjectsOverview() {
  return (
    <div className="p-4 flex flex-col">
      {/* Header Section */}
      <div className="flex w-full justify-between items-center">
        <ProjectsHeader />
        <div className="w-[350px]">
        <CourseScheduleCard isVisibile={false} />
        </div>
      </div>
      {/* Cards Section – 3 Rows (9 Cards) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Row 1 */}
        <FacultyAcademicCard
          name="CSE"
          text="#FF767D"
          color="#FFB4B8"
          bgColor="#FFE5E7"
          studentTeams={38}
          facultyGuides={12}
          projectsCount={54}
          lastUpdate="20/12/2025"
        />

        <FacultyAcademicCard
          name="Mechanical"
          text="#F8CF64"
          color="#F3E2B6"
          bgColor="#FFF1C1"
          studentTeams={38}
          facultyGuides={12}
          projectsCount={54}
          lastUpdate="20/12/2025"
        />

        <FacultyAcademicCard
          name="IT"
          text="#66EEFA"
          color="#BCECF0"
          bgColor="#E7F5FF"
          studentTeams={38}
          facultyGuides={12}
          projectsCount={54}
          lastUpdate="20/12/2025"
        />

        {/* Row 2 */}
        <FacultyAcademicCard
          name="Civil"
          text="#6AFF6A"
          color="#BDF5BD"
          bgColor="#E6FFE6"
          studentTeams={38}
          facultyGuides={12}
          projectsCount={54}
          lastUpdate="20/12/2025"
        />

        <FacultyAcademicCard
          name="EEE"
          text="#8EA2FF"
          color="#C7D0FF"
          bgColor="#E8EBFF"
          studentTeams={38}
          facultyGuides={12}
          projectsCount={54}
          lastUpdate="20/12/2025"
        />

        <FacultyAcademicCard
          name="AI & Data Science"
          text="#F58BFF"
          color="#F1C4FF"
          bgColor="#FBE8FF"
          studentTeams={38}
          facultyGuides={12}
          projectsCount={54}
          lastUpdate="20/12/2025"
        />

        {/* Row 3 */}
        <FacultyAcademicCard
          name="Biotechnology"
          text="#FF8A8A"
          color="#FFC1C1"
          bgColor="#FFEAEA"
          studentTeams={38}
          facultyGuides={12}
          projectsCount={54}
          lastUpdate="20/12/2025"
        />

        <FacultyAcademicCard
          name="MBA"
          text="#5FE4FF"
          color="#BDEFFF"
          bgColor="#E8FAFF"
          studentTeams={38}
          facultyGuides={12}
          projectsCount={54}
          lastUpdate="20/12/2025"
        />

        <FacultyAcademicCard
          name="ECE"
          text="#FF9F7E"
          color="#F3D3C8"
          bgColor="#FFF9DB"
          studentTeams={38}
          facultyGuides={12}
          projectsCount={54}
          lastUpdate="20/12/2025"
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading projects...</div>}>
      <ProjectsOverview />
    </Suspense>
  );
}
