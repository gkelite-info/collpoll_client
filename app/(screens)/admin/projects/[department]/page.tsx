"use client";

import { useSearchParams, useRouter } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import ProjectsHeader from "../components/ProjectsHeader";
import ProjectFilters from "../components/ProjectFilters";
import ProjectGrid from "../components/ProjectGrid";

export default function DepartmentProjectsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const dept = searchParams.get("dept");
  const year = searchParams.get("year");
  const subjectId = searchParams.get("subjectId");
  const subjectName = searchParams.get("subjectName");

  const isProjectLevel = !!subjectId;
  const isFacultyLevel = !!dept && !subjectId;
  const showBack = isFacultyLevel || isProjectLevel;

  const displayTitle = isProjectLevel
    ? (subjectName || "Projects")
    : isFacultyLevel
      ? `${dept} - ${year}`
      : "Projects Overview";

  const handleBack = () => {
    if (isProjectLevel) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("subjectId");
      params.delete("facultyId");
      params.delete("subjectName");
      router.push(`/admin/projects?${params.toString()}`);
    } else {
      router.push("/admin/projects");
    }
  };

  return (
    <div className="relative h-full overflow-y-auto p-6 flex flex-col">
      <div className="flex w-full justify-between items-center">
        <ProjectsHeader
          title={displayTitle}
          subtitle={isProjectLevel ? "View specific subject projects" : "View project activity across all branches."}
          showBack={showBack}
          onBackClick={handleBack}
        />
        <div className="w-[350px]">
          <CourseScheduleCard isVisibile={false} />
        </div>
      </div>

      <div style={{ marginTop: "-25px", marginBottom: "15px" }}>
        <ProjectFilters />
      </div>

      <ProjectGrid department={dept || ""} />
    </div>
  );
}