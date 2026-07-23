"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AddProjectForm from "../../faculty/projects/addProjectForm";
import { fetchEnrichedProjectsByFaculty, EnrichedProject } from "@/lib/helpers/projects/project";
import { ProjectCardProps } from "@/lib/projectTypes/project";
import { ProjectCard, ProjectDetailsModal } from "../../faculty/projects/projectCard";
import ProjectCardShimmer from "../../faculty/projects/shimmers/projectCardshimmer";
import StudentProjectSubmissions from "./components/studentProjectSubmissions";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

interface Props {
    subjectId: string;
    college_branch: string | null;
    collegeAcademicYear: string | null;
    faculty_edu_type: string | null;
    subjectName: string | null;
}

function mapToCardProps(project: EnrichedProject): ProjectCardProps {
    return {
        ...project,
        description: project.description ?? "",
        techStack: project.domain?.join(", ") ?? "",
        duration: (() => {
            const start = project.startDate
                ? new Date(project.startDate).toLocaleDateString("en-GB")
                : "";
            const end = project.endDate
                ? new Date(project.endDate).toLocaleDateString("en-GB")
                : "";
            return start && end ? `${start} - ${end}` : "N/A";
        })(),
        mentors: project.mentors.map((m) => ({
            name: m.name,
            image: m.image ?? "",
        })),
        teamMembers: project.teamMembers.map((t) => ({
            name: t.name,
            image: t.image ?? "",
        })),
        fileUrls: project.fileUrls ?? [],
        marks: project.marks ?? 0,
    };
}

export default function AdminProjectsList({
    subjectId: subjectIdProp,
    college_branch,
    collegeAcademicYear,
    faculty_edu_type,
    subjectName
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [projects, setProjects] = useState<EnrichedProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectCardProps | null>(null);
    const facultyId = searchParams.get("facultyId");
    const projectView = searchParams.get("projectView") || "active";
    const subjectId = searchParams.get("subjectId") ?? subjectIdProp;
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 8;


    useEffect(() => {
        const getProjects = async () => {
            if (!facultyId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await fetchEnrichedProjectsByFaculty(
                    Number(facultyId),
                    subjectId ? Number(subjectId) : undefined
                );
                setProjects(data);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        getProjects();
    }, [facultyId, subjectId]);

    const filteredProjects = useMemo(() => {
        const today = new Date();
        return projects.filter((p) => {
            if (projectView === "completed") {
                return p.endDate && new Date(p.endDate) < today;
            }
            return !p.endDate || new Date(p.endDate) >= today;
        });
    }, [projects, projectView]);

    const handleViewChange = (view: "active" | "completed") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("projectView", view);
        if (!params.get("subjectId") && subjectIdProp) {
            params.set("subjectId", subjectIdProp);
        }
        setCurrentPage(1);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("subjectId");
        params.delete("facultyId");
        params.delete("projectView");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleFormCancel = () => {
        setShowCreateForm(false);
    };

    const handleFormSaved = async () => {
        setShowCreateForm(false);
        if (facultyId) {
            setLoading(true);
            try {
                const data = await fetchEnrichedProjectsByFaculty(
                    Number(facultyId),
                    subjectId ? Number(subjectId) : undefined
                );
                setProjects(data);
            } catch (err) {
                console.error("Failed to refresh projects:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleViewSubmissions = (project: ProjectCardProps) => {
        const params = new URLSearchParams(searchParams.toString());

        params.set("view", "submissions");
        params.set("projectId", String(project.projectId));
        params.set("title", project.title);

        router.push(`${pathname}?${params.toString()}`);
    };

    if (showCreateForm) {
        return (
            <AddProjectForm
                onCancel={handleFormSaved}
                college_branch={college_branch}
                collegeAcademicYear={collegeAcademicYear}
                faculty_edu_type={faculty_edu_type}
            />
        );
    }

    const view = searchParams.get("view");
    const projectId = searchParams.get("projectId");
    return (
        <div className="bg-red-00 w-full h-full flex flex-col mx-auto">
            {view === "submissions" && projectId ? (
                <>
                    <div className="flex items-center gap-1 mb-6">
                        <CaretLeft
                            size={24}
                            weight="bold"
                            className="text-[#282828] cursor-pointer"
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());

                                params.delete("view");
                                params.delete("projectId");
                                params.delete("title");

                                router.push(`${pathname}?${params.toString()}`);
                            }}
                        />
                        <h1 className="font-bold text-2xl text-[#282828]">
                            Project Submissions
                        </h1>
                    </div>
                    <StudentProjectSubmissions />
                </>
            ) : (
                <>
                    <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                        <div aria-hidden="true" />

                        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 p-2">
                            <button
                                className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors ${projectView === "active"
                                    ? "text-[#E9E9E9]"
                                    : "text-[#414141]"
                                    }`}
                                onClick={() => handleViewChange("active")}
                            >
                                Active Projects
                                {projectView === "active" && (
                                    <motion.div
                                        layoutId="admin-project-pill"
                                        className="absolute inset-0 -z-10 rounded-full bg-[#43C17A] shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {projectView !== "active" && (
                                    <div className="absolute inset-0 -z-10 rounded-full bg-[#DEDEDE] shadow-sm" />
                                )}
                            </button>
                            <button
                                className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors ${projectView === "completed"
                                    ? "text-[#E9E9E9]"
                                    : "text-[#414141]"
                                    }`}
                                onClick={() => handleViewChange("completed")}
                            >
                                Previous Projects
                                {projectView === "completed" && (
                                    <motion.div
                                        layoutId="admin-project-pill"
                                        className="absolute inset-0 -z-10 rounded-full bg-[#43C17A] shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                {projectView !== "completed" && (
                                    <div className="absolute inset-0 -z-10 rounded-full bg-[#DEDEDE] shadow-sm" />
                                )}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button
                                className="text-sm text-white bg-[#16284F] px-4 py-1.5 rounded-md font-bold hover:bg-[#102040] transition-colors cursor-pointer"
                                onClick={() => setShowCreateForm(true)}
                            >
                                Create Project
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col flex-1 min-h-[calc(100vh-320px)] pb-10">
                        <div className="flex flex-col gap-4 flex-1">
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[...Array(4)].map((_, i) => (
                                        <ProjectCardShimmer key={i} />
                                    ))}
                                </div>
                            ) : filteredProjects.length > 0 ? (
                                (() => {
                                    const startIndex = (currentPage - 1) * cardsPerPage;
                                    const paginatedProjects = filteredProjects.slice(startIndex, startIndex + cardsPerPage);
                                    return (
                                        <ProjectCard
                                            data={paginatedProjects.map(mapToCardProps)}
                                            onViewDetails={(project) => setSelectedProject(project)}
                                        />
                                    );
                                })()
                            ) : (
                                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 italic">
                                        No {projectView} projects found.
                                    </p>
                                </div>
                            )}
                        </div>

                        {!loading && filteredProjects.length > 0 && (
                            <div className="flex justify-center items-center mt-auto pt-6 w-full max-w-[1200px] mx-auto rounded-lg shadow-sm">
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={filteredProjects.length}
                                    itemsPerPage={cardsPerPage}
                                    onPageChange={(p) => setCurrentPage(p)}
                                    alwaysShow={true}
                                    roundedBottom="rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    {selectedProject && (
                        <ProjectDetailsModal
                            project={selectedProject}
                            onClose={() => setSelectedProject(null)}
                            onViewSubmissions={handleViewSubmissions}
                        />
                    )}
                </>
            )}
        </div>
    );
}
