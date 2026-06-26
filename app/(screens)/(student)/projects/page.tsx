"use client";

import { Suspense, useEffect, useState } from "react";
import { ProjectCard, ProjectDetailsModal } from "./projectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { fetchEnrichedProjectsByStudent } from "@/lib/helpers/projects/project";
import { ProjectCardProps } from "@/lib/projectTypes/project";
import { useUser } from "@/app/utils/context/UserContext";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { useTranslations } from "next-intl";
import { FaChevronDown } from "react-icons/fa6";

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
  const t = useTranslations("Projects.student"); // Hook
  const [selectedProject, setSelectedProject] =
    useState<ProjectCardProps | null>(null);
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    collegeBranchCode,
    collegeAcademicYear,
    studentId,
    subjects: studentSubjects,
  } = useStudent();
  const [subjectFilter, setSubjectFilter] = useState<string | number>("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const { role } = useUser();

  useEffect(() => {
    const loadProjects = async () => {
      if (!studentId) return;
      setIsLoading(true);
      try {
        const enriched = await fetchEnrichedProjectsByStudent(studentId);

        const mapped: ProjectCardProps[] = enriched.map((p) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const pDate = p.endDate ? new Date(p.endDate) : null;

          const currentStatus = pDate && pDate < today ? "Completed" : "Active";

          return {
            ...p,
            collegeSubjectId: p.collegeSubjectId,
            title: p.title,
            description: p.description ?? "",
            duration: p.duration,
            techStack: p.domain.join(", "),
            mentors: p.mentors,
            teamMembers: p.teamMembers,
            marks: p.marks ?? 0,
            fileUrls: p.fileUrls,
            subject: p.subjectName || "",
            status: currentStatus,
          };
        });

        setProjects(mapped);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [studentId]);

  const filteredProjects = projects.filter((project) => {
    const matchesSubject =
      subjectFilter === "All" || project.collegeSubjectId === subjectFilter;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const projectEndDate = project.endDate ? new Date(project.endDate) : null;
    let calculatedStatus = "Active";
    if (projectEndDate && projectEndDate < today) {
      calculatedStatus = "Completed";
    }

    const matchesStatus =
      statusFilter === "All" || calculatedStatus === statusFilter;

    return matchesSubject && matchesStatus;
  });

  const subjectOptions = [
    t("All"),
    ...studentSubjects.map((s) => s.subjectName),
  ];

  const statuses = [t("All"), t("Active"), t("Completed")];

  return (
    <main className="p-4 relative overflow-hidden">
      <section className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h1 className="text-black text-2xl font-semibold">
            {t("Projects")} - {collegeBranchCode ?? "..."} {collegeAcademicYear}
          </h1>
          <p className="text-[#282828] text-sm">
            {t("View and track your assigned projects")}
          </p>
        </div>
        <article className=" flex justify-end w-[32%] max-md:hidden">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <div className="flex flex-nowrap items-center gap-3 md:gap-6 mb-6 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[12px] md:text-sm font-medium text-[#525252] whitespace-nowrap">
            {t("Subject:")}
          </label>
          <div className="relative flex items-center">
            <select
              className="appearance-none bg-[#DCEAE2] text-[#43C17A] rounded-full px-3 md:px-4 py-1 md:py-1.5 text-[12px] md:text-sm font-semibold outline-none cursor-pointer pr-8 md:pr-10 max-w-[130px] md:max-w-none transition-colors hover:bg-[#cfe2d7]"
              value={subjectFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSubjectFilter(val === "All" ? "All" : Number(val));
              }}
            >
              <option value="All">{t("All")}</option>
              {studentSubjects.map((s) => (
                <option key={s.collegeSubjectId} value={s.collegeSubjectId}>
                  {s.subjectName}
                </option>
              ))}
            </select>
            <span className="absolute right-3 pointer-events-none text-[#43C17A] text-[10px] md:text-xs">
              <FaChevronDown />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[12px] md:text-sm font-medium text-[#525252] whitespace-nowrap">
            {t("Status:")}
          </label>
          <div className="relative flex items-center">
            <select
              className="appearance-none bg-[#DCEAE2] text-[#43C17A] rounded-full px-3 md:px-4 py-1 md:py-1.5 text-[12px] md:text-sm font-semibold outline-none cursor-pointer pr-8 md:pr-10 transition-colors hover:bg-[#cfe2d7]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="absolute right-3 pointer-events-none text-[#43C17A] text-[10px] md:text-xs">
              <FaChevronDown />
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <ProjectCardShimmer key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50/50 rounded-[26px] border-2 border-dashed border-gray-100">
          <p className="text-lg font-semibold text-gray-600">
            {t("No projects found")}
          </p>
          <p className="text-sm mt-1 max-w-[280px] text-center">
            {subjectFilter !== "All" || statusFilter !== "All"
              ? t("We couldnt find any projects for filter", {
                subject: subjectFilter === "All" ? "" : subjectFilter,
                status: statusFilter === "All" ? "" : statusFilter,
              })
              : t("Your faculty hasnt assigned any projects to you yet")}
          </p>

          {(subjectFilter !== "All" || statusFilter !== "All") && (
            <button
              onClick={() => {
                setSubjectFilter("All");
                setStatusFilter("All");
              }}
              className="mt-4 text-blue-600 text-sm font-medium hover:underline cursor-pointer"
            >
              {t("Clear all filters")}
            </button>
          )}
        </div>
      ) : (
        <ProjectCard
          data={filteredProjects}
          onViewDetails={(project) => setSelectedProject(project)}
        />
      )}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          role={role}
          studentId={studentId}
        />
      )}
    </main>
  );
};

const PageWithSuspense = () => (
  <Suspense
    fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-[26px] shadow-sm border border-gray-100 px-5 py-6 md:px-7 md:py-7 animate-pulse"
          >
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
    }
  >
    <Page />
  </Suspense>
);

export default PageWithSuspense;
