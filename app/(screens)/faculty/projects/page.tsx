"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { ProjectCard, ProjectDetailsModal } from "./projectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { FaPlus } from "react-icons/fa6";
import { useRouter, useSearchParams } from "next/navigation";
import AddProjectForm from "./addProjectForm";
import { fetchEnrichedProjectsByFaculty } from "@/lib/helpers/projects/project";
import { ProjectCardProps } from "@/lib/projectTypes/project";
import ProjectCardShimmer from "./shimmers/projectCardshimmer";
import { motion } from "framer-motion";
import { CaretLeft } from "@phosphor-icons/react";
import StudentSubmissions from "./submissions";
import { decodeId, encodeId } from "@/app/utils/crypto";
import toast from "react-hot-toast";


const Page = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectCardProps | null>(null);
  const [projects, setProjects] = useState<ProjectCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { college_branch, collegeAcademicYear, faculty_edu_type, facultyId } = useFaculty();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const projectId = useMemo(() => {
    const encryptedId = searchParams.get("projectId");
    const decoded = encryptedId ? decodeId(encryptedId) : null;
    return decoded;
  }, [searchParams]);

  const modalId = useMemo(() => {
    const rawModalId = searchParams.get("modalId");
    return rawModalId ? decodeId(rawModalId) : null;
  }, [searchParams]);

  const encryptedId = searchParams.get("projectId");
  const rawModalId = searchParams.get("modalId");

  const [activeTab, setActiveTab] = useState<ProjectTab>("active");

  type ProjectTab = "active" | "previous";

  const tabs = [
    { id: "active", label: "Active Projects" },
    { id: "previous", label: "Previous Projects" },
  ];

  useEffect(() => {
    const loadProjects = async () => {
      if (!facultyId) return;
      setIsLoading(true);
      try {
        const enriched = await fetchEnrichedProjectsByFaculty(facultyId);

        const mapped: ProjectCardProps[] = enriched.map((p) => {
          const isPast = p.endDate ? new Date(p.endDate).getTime() < new Date().getTime() : false;

          return {
            projectId: p.projectId,
            title: p.title,
            description: p.description ?? "",
            duration: p.duration,
            techStack: p.domain.join(", "),
            mentors: p.mentors,
            teamMembers: p.teamMembers,
            marks: p.marks ?? 0,
            fileUrls: p.fileUrls,
            status: isPast ? "previous" : "active",
          };
        });

        setProjects(mapped);
      } catch (err) {
        toast.error("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [facultyId, tab]);

  useEffect(() => {
    if (rawModalId && projects.length > 0) {
      const decodedModalId = decodeId(rawModalId);

      if (decodedModalId) {
        const projectToOpen = projects.find(p => String(p.projectId) === String(decodedModalId));
        if (projectToOpen) {
          setSelectedProject(projectToOpen);
          router.replace(window.location.pathname, { scroll: false });
        }
      }
    }
  }, [rawModalId, projects, router]);

  const filteredProjects = Object.values(projects).filter((project: any) => {
    const status = project.status || "active";
    return status === activeTab;
  });

  const handleAddProject = () => {
    router.push("?tab=new_project");
  };

  const handleViewSubmissions = (project: ProjectCardProps) => {
    setSelectedProject(null);
    const encryptedId = encodeId(String(project.projectId));
    const encryptedTitle = encodeURIComponent(project.title);

    router.push(`?tab=submissions&projectId=${encryptedId}&title=${encryptedTitle}`);
  };

  if (tab === "new_project") {
    return (
      <AddProjectForm
        onCancel={() => router.back()}
        collegeAcademicYear={collegeAcademicYear}
        college_branch={college_branch}
        faculty_edu_type={faculty_edu_type}
      />
    );
  }

  if (tab === "submissions") {
    return (
      <main className="p-4">
        <button
          onClick={() => {
            if (projectId) {
              const encryptedModalId = encodeId(projectId);
              router.push(`?modalId=${encryptedModalId}`);
            } else {
              router.push(window.location.pathname);
            }
          }}
          className="mb-4 text-sm font-medium flex items-center gap-2 text-[#282828]"
        >
          <CaretLeft size={20} className="cursor-pointer active:scale-90 text-[#282828]" />
          Back to Details
        </button>

        <StudentSubmissions />
      </main>
    );
  }

  return (
    <main className="p-4 relative overflow-hidden">
      <section className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h1 className="text-black text-2xl font-semibold">
            Projects - {college_branch ?? "..."} {collegeAcademicYear}
          </h1>
          <p className="text-[#282828] text-sm">
            Create, manage, and track student projects effortlessly.
          </p>
        </div>
        <article className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <div className="w-full flex justify-start items-center lg:mb-4">
        <button
          className="flex items-center gap-1 bg-[#43C17A] text-white w-fit px-3 py-1 lg:rounded-md cursor-pointer font-medium"
          onClick={handleAddProject}
        >
          <FaPlus className="text-white" /> Add Project
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative flex items-center bg-white p-1.5 rounded-full">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as ProjectTab)}
              className={`relative px-6 py-2 text-sm font-semibold z-10 transition-colors ${activeTab === t.id ? "text-white" : "text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
            >
              {t.label}
              {activeTab === t.id && (
                <motion.div
                  layoutId="project-pill"
                  className="absolute inset-0 rounded-full -z-10 shadow-[0_2px_8px_rgba(16,185,129,0.4)]"
                  style={{ background: "linear-gradient(180deg, #34D399 0%, #10B981 100%)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <ProjectCardShimmer key={i} />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-lg font-semibold">No {activeTab} projects found</p>
          <p className="text-sm mt-1">
            {activeTab === "active" ? "Click 'Add Project' to get started!" : "Projects will appear here once they are completed."}
          </p>
        </div>
      ) : (
        <ProjectCard
          data={filteredProjects}
          onViewDetails={(project) => setSelectedProject(project)}
          role="Faculty"
        />
      )}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => {
            setSelectedProject(null);
            if (searchParams.get("modalId")) router.push(window.location.pathname);
          }}
          onViewSubmissions={handleViewSubmissions}
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