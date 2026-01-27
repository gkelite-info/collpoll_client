"use client";

import { useParams } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import ProjectsHeader from "../compounents/ProjectsHeader";
import ProjectFilters from "../compounents/ProjectFilters";
import ProjectGrid from "../compounents/ProjectGrid";

export default function DepartmentProjectsPage() {
  const params = useParams();
  const department = decodeURIComponent(params.department as string);

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-[18px]">
        <ProjectsHeader title={`${department} Projects`} />

        {/* Right side date card */}
        <div className="w-[350px]">
          <CourseScheduleCard />
        </div>
      </div>

      {/* Filters */}
      <div style={{marginTop:"-25px", marginBottom:"15px"}}>
      <ProjectFilters />
      </div>

      {/* Projects Grid */}
      <ProjectGrid department={department} />
    </div>
  );
}
