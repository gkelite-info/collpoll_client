"use client";

import { useParams } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import ProjectsHeader from "../components/ProjectsHeader";
import ProjectFilters from "../components/ProjectFilters";
import ProjectGrid from "../components/ProjectGrid";
import WipOverlay from "@/app/utils/WipOverlay";

export default function DepartmentProjectsPage() {
  const params = useParams();
  const department = decodeURIComponent(params.department as string);

  return (
    <div className="relative h-full overflow-y-auto p-6 flex flex-col">
      <WipOverlay fullHeight={true} />
      {/* Header */}
      <div className="flex justify-between items-start mb-[18px]">
        <ProjectsHeader title={`${department} Projects`} />

        {/* Right side date card */}
        <div className="w-[350px]">
          <CourseScheduleCard />
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginTop: "-25px", marginBottom: "15px" }}>
        <ProjectFilters />
      </div>

      {/* Projects Grid */}
      <ProjectGrid department={department} />
    </div>
  );
}
