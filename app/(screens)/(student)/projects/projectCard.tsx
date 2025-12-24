"use client";

import { CaretLeft } from "@phosphor-icons/react";
import { ProjectCardProps } from "./page";

type ProjectCardListProps = {
  data: ProjectCardProps[];
  onViewDetails: (project: ProjectCardProps) => void;
};

export const ProjectCard = ({ data, onViewDetails }: ProjectCardListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((project, index) => (
        <div
          key={index}
          className="bg-white rounded-[26px] shadow-sm border border-gray-100 px-5 py-6 md:px-7 md:py-7"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[#1f2933]">
                {project.title}
              </h2>

              <p className="text-sm md:text-base text-[#4b5563] mt-2 max-w-md">
                {project.description}
              </p>
            </div>

            <button
              className="shrink-0 px-5 py-2 cursor-pointer rounded-full bg-[#22c55e] text-white text-sm font-semibold shadow-sm"
              onClick={() => onViewDetails(project)}
            >
              View Details
            </button>
          </div>

          <div className="space-y-4 mt-5 text-sm md:text-base">
            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">
                Duration
              </span>
              <span className="px-4 py-1.5 rounded-full bg-[#EFE8FF] text-[#5B4FE1] font-medium">
                {project.duration}
              </span>
            </div>

            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">
                Tech Stack
              </span>
              <p className="truncate md:max-w-sm text-[#374151]">
                {project.techStack}
              </p>
            </div>

            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">
                Team Members
              </span>

              <div className="flex">
                {project.teamMembers.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-gray-200 ${
                      i > 0 ? "-ml-3" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Team member ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">Mentor</span>
              <p className="text-[#374151]">{project.mentor}</p>
            </div>

            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">Marks</span>
              <p className="text-[#374151]">{project.marks}</p>
            </div>

            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">
                Attachments
              </span>
              <a
                href={project.attachment}
                className="text-blue-600 truncate md:max-w-sm"
              >
                {project.attachment}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

type ProjectDetailsModalProps = {
  project: ProjectCardProps;
  onClose: () => void;
};

export const ProjectDetailsModal = ({
  project,
  onClose,
}: ProjectDetailsModalProps) => {
  const skills = project.techStack
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const outcomes = [
    "A fully responsive and user friendly UI.",
    "Proper backend integration with database and API.",
    "Secure login and role based access system.",
    "Optimized performance with clean code structure.",
    "Deployed live version with documentation.",
  ];

  const attachments = [
    project.attachment || "https://example.com/files/project-guide.pdf",
    "https://example.com/files/requirements-document.pdf",
    "https://example.com/files/reference-material.pdf",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10">
      <div className="mt-8 w-full max-w-3xl rounded-3xl bg-white p-6 md:p-8 shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <div className="cursor-pointer">
            <CaretLeft onClick={onClose} size={32} />{" "}
          </div>

          <p className="font-semibold text-2xl">Project Details</p>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-[#16a34a] mb-6">
          {project.title}
        </h1>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            Project Descriptions
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            {project.description}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            Skills Required
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-[#16284F21] text-[#16284F] text-xs md:text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            Duration
          </h2>
          <span className="inline-flex px-4 py-1.5 rounded-full bg-[#EFE8FF] text-[#5B4FE1] text-sm font-medium">
            {project.duration}
          </span>
        </section>

        <section className="mb-6">
          <div className="flex flex-wrap gap-10">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                Team Members
              </h2>
              <div className="flex">
                {project.teamMembers.slice(0, 5).map((img, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-gray-200 ${
                      i > 0 ? "-ml-3" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Team member ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                Mentor
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=150&q=80"
                    alt={project.mentor}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {project.mentor}
                  </p>
                  <p className="text-xs text-gray-500">
                    CSE Year 2 Roll 43425667
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            Expected Outcomes
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm md:text-base text-gray-700">
            {outcomes.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            Attachments
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm md:text-base text-gray-700">
            {attachments.map((link, i) => (
              <li key={i}>
                <a href={link} className="text-blue-600 break-all">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
