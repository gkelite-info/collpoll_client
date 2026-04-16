"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import AddProjectForm from "../../faculty/projects/addProjectForm";
import { fetchEnrichedProjectsByFaculty, EnrichedProject } from "@/lib/helpers/projects/project";
import { ProjectCardProps } from "@/lib/projectTypes/project";
import { ProjectCard, ProjectDetailsModal } from "../../faculty/projects/projectCard";
import ProjectCardShimmer from "../../faculty/projects/shimmers/projectCardshimmer";
import StudentProjectSubmissions from "./components/studentProjectSubmissions";

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
            <div className="flex items-center gap-1 mb-6">
                <CaretLeft
                    size={24}
                    weight="bold"
                    className="text-[#282828] cursor-pointer"
                    onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());

                        if (view === "submissions") {
                            params.delete("view");
                            params.delete("projectId");
                            params.delete("title");

                            router.push(`${pathname}?${params.toString()}`);
                        } else {
                            params.delete("subjectId");
                            params.delete("facultyId");
                            params.delete("projectView");
                            params.delete("subjectName");

                            router.push(`/admin/projects?${params.toString()}`);
                        }
                    }}
                />
                <h1 className="font-bold text-2xl text-[#282828]">
                    {view === "submissions"
                        ? "Project Submissions"
                        : `Projects for ${subjectName ?? ""}`}
                </h1>
            </div>

            {view === "submissions" && projectId ? (
                <StudentProjectSubmissions />
            ) : (
                <>
                    <div className="flex justify-between w-full mb-6">
                        <div className="flex gap-4 pb-1">
                            <h5
                                className={`text-sm cursor-pointer pb-1 ${projectView === "active"
                                    ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]"
                                    : "text-[#282828]"
                                    }`}
                                onClick={() => handleViewChange("active")}
                            >
                                Active Projects
                            </h5>
                            <h5
                                className={`text-sm cursor-pointer pb-1 ${projectView === "completed"
                                    ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]"
                                    : "text-[#282828]"
                                    }`}
                                onClick={() => handleViewChange("completed")}
                            >
                                Completed Projects
                            </h5>
                        </div>

                        <button
                            className="text-sm text-white bg-[#16284F] px-4 py-1.5 rounded-md font-bold hover:bg-[#102040] transition-colors cursor-pointer"
                            onClick={() => setShowCreateForm(true)}
                        >
                            Create Project
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 pb-10">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <ProjectCardShimmer key={i} />
                                ))}
                            </div>
                        ) : filteredProjects.length > 0 ? (
                            <ProjectCard
                                data={filteredProjects.map(mapToCardProps)}
                                onViewDetails={(project) => setSelectedProject(project)}
                            />
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-400 italic">
                                    No {projectView} projects found.
                                </p>
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