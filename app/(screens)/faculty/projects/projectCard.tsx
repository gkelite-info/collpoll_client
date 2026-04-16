"use client";

import { ProjectCardProps } from "@/lib/projectTypes/project";
import { CaretLeft } from "@phosphor-icons/react";

type ProjectCardListProps = {
  data: ProjectCardProps[];
  onViewDetails: (project: ProjectCardProps) => void;
  role?: string;
};

const MemberAvatar = ({ image, name, index }: { image: string; name?: string; index: number }) => {
  const isValidImage = image && (
    image.startsWith("http") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  );

  return (
    <div
      title={name ?? "Unknown"}
      className={`w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center flex-shrink-0 ${index > 0 ? "-ml-3" : ""}`}
    >
      {isValidImage ? (
        <img src={image} alt={name ?? "member"} className="w-full h-full object-cover" />
      ) : (
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )}
    </div>
  );
};

export const ProjectCard = ({ data, onViewDetails, role }: ProjectCardListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((project, index) => (
        <div
          key={index}
          className="bg-white rounded-[26px] shadow-sm border border-gray-100 px-5 py-6 md:px-7 md:py-7"
        >
          <div className="flex items-start justify-between">
            <div className="bg-yellow-00 lg:w-[72%]">
              <h2 className="text-xl md:text-2xl font-semibold text-[#1f2933] truncate">
                {project.title}
              </h2>
              <p className="text-sm md:text-base text-[#4b5563] mt-2 max-w-md truncate">
                {project.description}
              </p>
            </div>
            <button
              className="shrink-0 px-5 py-2 lg:w-[28%] cursor-pointer rounded-full bg-[#22c55e] text-white text-sm font-semibold shadow-sm"
              onClick={() => onViewDetails(project)}
            >
              View Details
            </button>
          </div>

          <div className="space-y-4 mt-5 text-sm md:text-base">
            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">Duration</span>
              <span className="px-4 py-1.5 rounded-full bg-[#EFE8FF] text-[#5B4FE1] font-medium">
                {project.duration}
              </span>
            </div>

            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">Tech Stack</span>
              <p className="truncate md:max-w-sm text-[#374151]">{project.techStack}</p>
            </div>

            <div className="flex gap-4 items-center">
              <span className="w-28 font-semibold text-[#111827]">Team Members</span>
              <div className="flex">
                {project.teamMembers.length > 0 ? (
                  project.teamMembers.slice(0, 4).map((member, i) => (
                    <MemberAvatar key={i} image={member.image} name={member.name} index={i} />
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">No members</span>
                )}
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <span className="w-28 font-semibold text-[#111827]">Mentor</span>
              <div className="flex items-center gap-2 flex-wrap">
                {project.mentors.length > 0 ? (
                  project.mentors.map((mentor, i) => (
                    <MemberAvatar key={i} image={mentor.image} name={mentor.name} index={i} />
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">No mentor</span>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">Marks</span>
              <p className="text-[#374151]">{project.marks}</p>
            </div>

            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">Attachments</span>
              <div className="flex flex-col gap-1">
                {project.fileUrls.length > 0 ? (
                  project.fileUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer"
                      className="text-blue-600 truncate md:max-w-sm hover:underline text-sm">
                      {url.split("/").pop()}
                    </a>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">No attachments</span>
                )}
              </div>
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
  onViewSubmissions?: (project: ProjectCardProps) => void;

};

export const ProjectDetailsModal = ({ project, onClose, onViewSubmissions }: ProjectDetailsModalProps) => {
  const domains = project.techStack.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10">
      <div className="mt-8 w-full max-w-3xl rounded-3xl bg-white p-6 md:p-8 shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="bg-red-00 flex items-start justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <CaretLeft onClick={onClose} size={22} className="cursor-pointer active:scale-90" />
            <p className="font-semibold text-lg">Project Details</p>
          </div>
          <button
            className="bg-[#16284F] lg:rounded-md px-2.5 py-1 text-white text-sm cursor-pointer"
            onClick={() => {
              if (project.projectId !== null && onViewSubmissions) {
                onViewSubmissions(project);
              }
            }}
          >
            View Submissions
          </button>
        </div>

        <h1 className="text-lg lg:text-2xl font-semibold text-[#16a34a] mb-6">
          {project.title}
        </h1>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            {project.description || "No description provided."}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Domain(s)</h2>
          <div className="flex flex-wrap gap-2">
            {domains.length > 0 ? (
              domains.map((d, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-[#16284F21] text-[#16284F] text-xs md:text-sm font-medium">
                  {d}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs italic">No domains specified</span>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Duration</h2>
          <span className="inline-flex px-4 py-1.5 rounded-full bg-[#EFE8FF] text-[#5B4FE1] text-sm font-medium">
            {project.duration}
          </span>
        </section>

        <section className="mb-6">
          <div className="flex flex-wrap gap-10">

            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Team Members</h2>
              <div className="flex">
                {project.teamMembers.length > 0 ? (
                  project.teamMembers.slice(0, 5).map((member, i) => (
                    <MemberAvatar key={i} image={member.image} name={member.name} index={i} />
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">No members assigned</span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Mentor(s)</h2>
              <div className="flex flex-col gap-3">
                {project.mentors.length > 0 ? (
                  project.mentors.map((mentor, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                        {mentor.image && (mentor.image.startsWith("http") || mentor.image.startsWith("data:")) ? (
                          <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{mentor.name}</p>
                        <p className="text-xs text-gray-500">Faculty / Guide</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">No mentor assigned</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Marks</h2>
          <span className="inline-flex px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
            {project.marks} pts
          </span>
        </section>

        <section>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Attachments</h2>
          {project.fileUrls.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm md:text-base text-gray-700">
              {project.fileUrls.map((url, i) => (
                <li key={i}>
                  <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 break-all hover:underline">
                    {url.split("/").pop() || url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm italic">No attachments uploaded</p>
          )}
        </section>
      </div>
    </div>
  );
};