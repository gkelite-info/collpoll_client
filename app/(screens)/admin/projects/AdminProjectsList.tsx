"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { AdminDiscussionShimmer } from "../assignments/components/shimmers/discussionShimmer";
import AddProjectForm from "../../faculty/projects/addProjectForm";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { fetchEnrichedProjectsByFaculty, EnrichedProject } from "@/lib/helpers/projects/project";
import { ProjectCardProps } from "@/lib/projectTypes/project";
import { ProjectCard, ProjectDetailsModal } from "../../faculty/projects/projectCard";
import ProjectCardShimmer from "../../faculty/projects/shimmers/projectCardshimmer";

interface Props {
    subjectId: string;
    college_branch: string | null;
    collegeAcademicYear: string | null;
    faculty_edu_type: string | null;
    subjectName: string | null;
}

// ✅ Map EnrichedProject → ProjectCardProps (techStack = domain joined)
function mapToCardProps(project: EnrichedProject): ProjectCardProps {
    return {
        ...project,
        description: project.description ?? "",  // ✅ null → empty string
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
    subjectId,
    college_branch,
    collegeAcademicYear,
    faculty_edu_type,
    subjectName
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { collegeId } = useAdmin();

    const [projects, setProjects] = useState<EnrichedProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectCardProps | null>(null);

    const facultyId = searchParams.get("facultyId");
    const projectView = searchParams.get("projectView") || "active";

    // ✅ Fetch real enriched projects by facultyId
    useEffect(() => {
        const getProjects = async () => {
            if (!facultyId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await fetchEnrichedProjectsByFaculty(Number(facultyId));
                setProjects(data);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        getProjects();
    }, [facultyId]);

    // ✅ Tab filter — active = no endDate passed, completed = endDate passed
    const filteredProjects = useMemo(() => {
        const today = new Date();
        return projects.filter((p) => {
            if (projectView === "completed") {
                return p.endDate && new Date(p.endDate) < today;
            }
            // active = no endDate or endDate in future
            return !p.endDate || new Date(p.endDate) >= today;
        });
    }, [projects, projectView]);

    const handleViewChange = (view: "active" | "completed") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("projectView", view);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("subjectId");
        params.delete("facultyId");
        params.delete("projectView");
        router.push(`${pathname}?${params.toString()}`);
    };

    // ✅ After create: hide form + refresh projects list
    const handleFormCancel = () => {
        setShowCreateForm(false);
    };

    const handleFormSaved = async () => {
        setShowCreateForm(false);
        // ✅ Refresh list after save
        if (facultyId) {
            setLoading(true);
            try {
                const data = await fetchEnrichedProjectsByFaculty(Number(facultyId));
                setProjects(data);
            } catch (err) {
                console.error("Failed to refresh projects:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    if (showCreateForm) {
        return (
            <AddProjectForm
                onCancel={handleFormSaved} // ✅ triggers refresh on both save and cancel
                college_branch={college_branch}
                collegeAcademicYear={collegeAcademicYear}
                faculty_edu_type={faculty_edu_type}
            />
        );
    }

    return (
        <div className="w-full h-full flex flex-col mx-auto">
            {/* Header */}
            <div className="flex items-center gap-1 mb-6">
                <CaretLeft
                    size={24}
                    weight="bold"
                    className="text-[#282828] cursor-pointer"
                    onClick={handleBack}
                />
                <h1 className="font-bold text-2xl text-[#282828]">
                    Projects for {subjectName ? `- ${subjectName}` : ""}
                </h1>
            </div>

            {/* Tabs + Create button */}
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

            {/* Project list */}
            <div className="flex flex-col gap-4 pb-10">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <ProjectCardShimmer key={i} />
                        ))}
                    </div>
                ) : filteredProjects.length > 0 ? (
                    // ✅ Same ProjectCard UI as faculty side
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

            {/* ✅ Project details modal */}
            {selectedProject && (
                <ProjectDetailsModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </div>
    );
}