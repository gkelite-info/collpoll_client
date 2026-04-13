"use client";

import { Suspense, useEffect, useState } from "react";
import { ProjectCard, ProjectDetailsModal } from "./projectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { fetchEnrichedProjectsByStudent } from "@/lib/helpers/projects/project"; // ✅ remove fetchEnrichedProjectsByFaculty
import { ProjectCardProps } from "@/lib/projectTypes/project";

const ProjectCardShimmer = () => (
  <div className="bg-white rounded-[26px] shadow-sm border border-gray-100 px-5 py-6 md:px-7 md:py-7 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1 pr-4">
        <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded-full w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded-full w-5/6" />
      </div>
      <div className="h-9 w-24 bg-gray-200 rounded-full shrink-0" />
    </div>
    <div className="space-y-4 mt-5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-4 bg-gray-200 rounded-full w-24 shrink-0" />
          <div className="h-4 bg-gray-200 rounded-full w-40" />
        </div>
      ))}
    </div>
  </div>
);

const Page = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectCardProps | null>(null);
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { collegeBranchCode, collegeAcademicYear, studentId } = useStudent(); // ✅ studentId not facultyId

  useEffect(() => {
    const loadProjects = async () => {
      if (!studentId) return; // ✅ studentId not facultyId
      setIsLoading(true);
      try {
        const enriched = await fetchEnrichedProjectsByStudent(studentId); // ✅ student fetch
        const mapped: ProjectCardProps[] = enriched.map((p) => ({
          title: p.title,
          description: p.description ?? "",
          duration: p.duration,
          techStack: p.domain.join(", "),
          mentors: p.mentors,
          teamMembers: p.teamMembers,
          marks: p.marks ?? 0,
          fileUrls: p.fileUrls,
        }));
        setProjects(mapped);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [studentId]);

  return (
    <main className="p-4 relative overflow-hidden">
      <section className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h1 className="text-black text-2xl font-semibold">
            Projects - {collegeBranchCode ?? "..."} {collegeAcademicYear}
          </h1>
          <p className="text-[#282828] text-sm">
            View and track your assigned projects.
          </p>
        </div>
        <article className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <ProjectCardShimmer key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg font-semibold">No projects assigned yet</p>
          <p className="text-sm mt-1">Your faculty will assign you to a project soon!</p>
        </div>
      ) : (
        <ProjectCard
          data={projects}
          onViewDetails={(project) => setSelectedProject(project)}
        />
      )}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </main>
  );
};

const PageWithSuspense = () => (
  <Suspense fallback={
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-[26px] shadow-sm border border-gray-100 px-5 py-6 md:px-7 md:py-7 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded-full w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded-full w-5/6" />
            </div>
            <div className="h-9 w-24 bg-gray-200 rounded-full shrink-0" />
          </div>
          <div className="space-y-4 mt-5">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="flex gap-4 items-center">
                <div className="h-4 bg-gray-200 rounded-full w-24 shrink-0" />
                <div className="h-4 bg-gray-200 rounded-full w-40" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  }>
    <Page />
  </Suspense>
);

export default PageWithSuspense;