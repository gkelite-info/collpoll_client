"use client";

import { Suspense, useEffect, useState } from "react";
import { ProjectCard, ProjectDetailsModal } from "./projectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { fetchEnrichedProjectsByStudent } from "@/lib/helpers/projects/project";
import { ProjectCardProps } from "@/lib/projectTypes/project";
import { useUser } from "@/app/utils/context/UserContext";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { useTranslations } from "next-intl";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { CustomDropdown } from "@/app/components/CustomDropdown";

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
    collegeSectionsId,
    subjects: studentSubjects,
  } = useStudent();
  const [subjectFilter, setSubjectFilter] = useState<string | number>("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { role } = useUser();

  useEffect(() => {
    const loadProjects = async () => {
      if (!studentId) return;
      setIsLoading(true);
      try {
        const subjectIds = studentSubjects.map(s => s.collegeSubjectId);
        const enriched = await fetchEnrichedProjectsByStudent(
          studentId, 
          collegeSectionsId, 
          subjectIds
        );

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
    { value: "All", label: t("All") },
    ...studentSubjects.map((subject) => ({
      value: subject.collegeSubjectId,
      label: subject.subjectName,
    })),
  ];
  const statusOptions = [
    { value: "All", label: t("All") },
    { value: "Active", label: t("Active") },
    { value: "Completed", label: t("Completed") },
  ];
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / itemsPerPage),
  );
  const displayedPage = Math.min(currentPage, totalPages);
  const paginatedProjects = filteredProjects.slice(
    (displayedPage - 1) * itemsPerPage,
    displayedPage * itemsPerPage,
  );

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
          <div className="w-[180px] md:w-[280px]">
            <CustomDropdown
              value={subjectFilter}
              options={subjectOptions}
              onChange={(value) => {
                setSubjectFilter(value === "All" ? "All" : Number(value));
                setCurrentPage(1);
              }}
              theme="always-green"
              hideCheckmark
              className="!rounded-full !border-transparent !px-3 md:!px-4 !py-1 md:!py-1.5 !pr-8 md:!pr-10 !text-[12px] md:!text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[12px] md:text-sm font-medium text-[#525252] whitespace-nowrap">
            {t("Status:")}
          </label>
          <div className="w-[120px] md:w-[150px]">
            <CustomDropdown
              value={statusFilter}
              options={statusOptions}
              onChange={(value) => {
                setStatusFilter(String(value));
                setCurrentPage(1);
              }}
              theme="always-green"
              hideCheckmark
              className="!rounded-full !border-transparent !px-3 md:!px-4 !py-1 md:!py-1.5 !pr-8 md:!pr-10 !text-[12px] md:!text-sm"
            />
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
          <p className="text-sm mt-2">
            {t("We couldnt find any projects for filter", {
              subject:
                subjectFilter === "All"
                  ? "any subject"
                  : studentSubjects.find((s) => s.collegeSubjectId === subjectFilter)
                      ?.subjectName || String(subjectFilter),
              status: statusFilter !== "All" ? statusFilter : "",
            })}
          </p>

          {(subjectFilter !== "All" || statusFilter !== "All") && (
            <button
              onClick={() => {
                setSubjectFilter("All");
                setStatusFilter("All");
                setCurrentPage(1);
              }}
              className="mt-4 text-blue-600 text-sm font-medium hover:underline cursor-pointer"
            >
              {t("Clear all filters")}
            </button>
          )}
        </div>
      ) : (
        <ProjectCard
          data={paginatedProjects}
          onViewDetails={(project) => setSelectedProject(project)}
        />
      )}

      {!isLoading && filteredProjects.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl">
          <Pagination
            currentPage={displayedPage}
            totalItems={filteredProjects.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            alwaysShow
          />
        </div>
      )}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          role={role}
          studentId={studentId}
          onSubmissionChange={(fileUrl) => {
            setProjects((current) =>
              current.map((project) =>
                project.projectId === selectedProject.projectId
                  ? { ...project, studentFileUrl: fileUrl }
                  : project,
              ),
            );
            setSelectedProject((current) =>
              current ? { ...current, studentFileUrl: fileUrl } : current,
            );
          }}
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
