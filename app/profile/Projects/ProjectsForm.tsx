"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ProjectItem, { ProjectData } from "./ProjectItem";
import { useRouter } from "next/navigation";

const emptyProject = (): ProjectData => ({
  projectName: "",
  domain: "",
  startDate: "",
  endDate: "",
  tools: [],
  projectLink: "",
  description: "",
  isSubmitted: false,
});

export default function ProjectsForm() {
  const [projects, setProjects] = useState<ProjectData[]>([
    emptyProject(),
  ]);

  const router = useRouter(); 

  const updateProject = (index: number, data: ProjectData) => {
    const copy = [...projects];
    copy[index] = data;
    setProjects(copy);
  };

  const handleAddProject = () => {
    const last = projects[projects.length - 1];

    if (!last.isSubmitted) {
      toast.error("Please submit the current project before adding a new one");
      return;
    }

    setProjects([...projects, emptyProject()]);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#282828]">
          Projects
        </h2>

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
            onClick={()=>router.push('/profile?profile-summary')}
            className="bg-[#43C17A] cursor-pointer text-white px-6 py-1.5 rounded-md text-sm font-medium"
          >
            Next
          </button>
        </div>
      </div>
      {projects.map((project, index) => (
        <ProjectItem
          key={index}
          index={index}
          data={project}
          onUpdate={(data) => updateProject(index, data)}
        />
      ))}
    </div>
  );
}
