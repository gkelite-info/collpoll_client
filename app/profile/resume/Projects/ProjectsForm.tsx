"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import ProjectItem, { ProjectData } from "./ProjectItem";
import {
  fetchResumeProjects,
  deleteResumeProject,
  ResumeProject,
} from "@/lib/helpers/student/Resume/resumeProjectsAPI";
import ResumeProjectsShimmer from "./ResumeProjectsShimmer";

const emptyProject = (): ProjectData => ({
  projectName: "",
  domain: "",
  startDate: "",
  endDate: "",
  tools: [],
  projectLink: "",
  description: "",
  isSubmitted: false,
  dbId: undefined,
});

export default function ProjectsForm() {
  const { studentId } = useUser();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectData[]>([emptyProject()]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(true); // ← ADD: controls new form visibility

  // ── Load existing projects ─────────────────────────────────────
  useEffect(() => {
    if (!studentId) return;

    const load = async () => {
      try {
        const rows: ResumeProject[] = await fetchResumeProjects(studentId);
        if (rows.length > 0) {
          const mapped: ProjectData[] = rows.map((r) => ({
            projectName: r.projectName,
            domain: r.domain,
            startDate: r.startDate ? r.startDate.slice(0, 10) : "",
            endDate: r.endDate ? r.endDate.slice(0, 10) : "",
            tools: r.toolsAndTechnologies ?? [],
            projectLink: r.projectUrl ?? "",
            description: r.description ?? "",
            isSubmitted: true,
            dbId: r.resumeProjectId,
          }));
          setProjects(mapped);
          setShowNewForm(false); // ← ADD: hide new form if existing projects loaded
        } else {
          setProjects([]);
          setShowNewForm(true);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [studentId]);

  const updateProject = (index: number, data: ProjectData) => {
    const copy = [...projects];
    copy[index] = data;
    setProjects(copy);
  };

  const handleAddProject = () => {
    if (showNewForm) {
      toast.error("Please submit the current project before adding new one");
      return;
    }
    setShowNewForm(true); // ← ADD: show the new form
  };

  const handleDelete = async (index: number) => {
    const project = projects[index];
    if (project.dbId) {
      setDeletingId(project.dbId);
      try {
        await deleteResumeProject(project.dbId);
      } catch (err) {
        console.error("Failed to delete project:", err);
        toast.error("Failed to delete project");
        setDeletingId(null);
        return;
      }
      setDeletingId(null);
    }
    setProjects((prev) => prev.filter((_, i) => i !== index));
    toast.success("Project deleted");
  };

  // ← ADD: new empty project state for the add form
  const [newProject, setNewProject] = useState<ProjectData>(emptyProject());

  const handleNewProjectUpdate = (data: ProjectData) => {
    setNewProject(data);
    // When submitted (dbId assigned), move to saved list and hide form
    if (data.isSubmitted && data.dbId) {
      setProjects((prev) => [...prev, data]);
      setNewProject(emptyProject());
      setShowNewForm(false);
    }
  };

  if (loading || !studentId) return <ResumeProjectsShimmer />;

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-xl shadow">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#282828]">Projects</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddProject}
            className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium"
          >
            Add +
          </button>
          <button
            type="button"
            onClick={() => router.push("/profile?resume=profile-summary&Step=7")}
            className="bg-[#43C17A] cursor-pointer text-white px-6 py-1.5 rounded-md text-sm font-medium"
          >
            Next
          </button>
        </div>
      </div>

      {/* Saved projects */}
      {projects.map((project, index) => (
        <ProjectItem
          key={project.dbId ?? `saved-${index}`}
          index={index}
          data={project}
          onUpdate={(data) => updateProject(index, data)}
          onDelete={project.isSubmitted ? () => handleDelete(index) : undefined}
          isDeleting={!!project.dbId && deletingId === project.dbId}
        />
      ))}

      {/* New project form — shown only when Add+ clicked */}
      {showNewForm && (
        <ProjectItem
          key="new-project"
          index={projects.length}
          data={newProject}
          onUpdate={handleNewProjectUpdate}
          onClose={() => {                     // ← ADD: minus button hides form
            setShowNewForm(false);
            setNewProject(emptyProject());
          }}
        />
      )}
    </div>
  );
}