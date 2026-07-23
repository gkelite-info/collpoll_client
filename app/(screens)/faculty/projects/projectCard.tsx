"use client";

import { ProjectCardProps } from "@/lib/projectTypes/project";
import { CaretLeft } from "@phosphor-icons/react";
import { Avatar } from "@/app/utils/Avatar";
import { getSecureAttachmentUrl } from "@/lib/helpers/projects/projectFiles";

type ProjectCardListProps = {
  data: ProjectCardProps[];
  onViewDetails: (project: ProjectCardProps) => void;
  role?: string;
};

const MemberAvatar = ({
  image,
  name,
  index,
}: {
  image: string;
  name?: string;
  index: number;
}) => {
  return (
    <div
      title={name ?? "Unknown"}
      className={`rounded-full border-2 border-white bg-gray-200 flex-shrink-0 ${index > -4 ? "-ml-3" : ""}`}
    >
      <Avatar src={image} alt={name ?? "member"} size={36} />
    </div>
  );
};

export const ProjectCard = ({
  data,
  onViewDetails,
  role,
}: ProjectCardListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((project, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 md:px-5 md:py-4 max-w-[680px]"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="max-w-full overflow-x-auto whitespace-nowrap pb-1 text-lg md:text-xl font-bold text-[#1f2933] [scrollbar-color:#CBD5E1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
                {project.title}
              </h2>
              <p className="text-sm text-[#4b5563] mt-1 line-clamp-2 md:truncate md:max-w-md whitespace-normal">
                {project.description}
              </p>
            </div>
            <button
              className="shrink-0 w-auto cursor-pointer rounded-full bg-[#22c55e] hover:bg-[#1fa951] transition-colors px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-white shadow-sm flex items-center justify-center"
              onClick={() => onViewDetails(project)}
            >
              View Details
            </button>
          </div>

          <div className="space-y-2 mt-3 text-sm">
            <div className="grid grid-cols-[120px_1fr] md:flex md:gap-4 items-start md:items-center">
              <span className="font-semibold text-[#111827] md:w-28 text-xs sm:text-sm">
                Duration
              </span>
              <span className="w-fit px-3 py-1.5 rounded-full bg-[#EFE8FF] text-[#5B4FE1] text-xs font-medium inline-block">
                {project.duration}
              </span>
            </div>

            <div className="grid grid-cols-[120px_1fr] md:flex md:gap-4 items-start md:items-center">
              <span className="font-semibold text-[#111827] md:w-28 text-xs sm:text-sm">
                Tech Stack
              </span>
              <p className="text-xs sm:text-sm md:text-base text-[#374151] break-words md:truncate md:max-w-sm leading-relaxed">
                {project.techStack}
              </p>
            </div>

            <div className="grid grid-cols-[120px_1fr] md:flex md:gap-4 items-center">
              <span className="font-semibold text-[#111827] md:w-28 text-xs sm:text-sm">
                Team
              </span>
              <div className="flex">
                {project.teamMembers.length > 0 ? (
                  project.teamMembers
                    .slice(0, 4)
                    .map((member, i) => (
                      <MemberAvatar
                        key={i}
                        image={member.image}
                        name={member.name}
                        index={i}
                      />
                    ))
                ) : (
                  <span className="text-gray-400 text-xs italic">
                    No members
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] md:flex md:gap-4 items-center">
              <span className="font-semibold text-[#111827] md:w-28 text-xs sm:text-sm">
                Mentor
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {project.mentors.length > 0 ? (
                  project.mentors.map((mentor, i) => (
                    <MemberAvatar
                      key={i}
                      image={mentor.image}
                      name={mentor.name}
                      index={i}
                    />
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">
                    No mentor
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] md:flex md:gap-4 items-start md:items-center">
              <span className="font-semibold text-[#111827] md:w-28 text-xs sm:text-sm">
                Marks
              </span>
              <p className="text-xs sm:text-sm md:text-base text-[#374151] font-medium">
                {project.marks}
              </p>
            </div>

            <div className="grid grid-cols-[120px_1fr] md:flex md:gap-4 items-start">
              <span className="font-semibold text-[#111827] md:w-28 text-xs sm:text-sm">
                Attachments
              </span>
              <div className="flex flex-col gap-1 min-w-0">
                {project.fileUrls.length > 0 ? (
                  project.fileUrls.map((url, i) => (
                    <a
                      key={i}
                      href={getSecureAttachmentUrl(url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors truncate hover:underline text-xs sm:text-sm block md:max-w-sm"
                    >
                      {url.split("/").pop()}
                    </a>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">
                    No attachments
                  </span>
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

export const ProjectDetailsModal = ({
  project,
  onClose,
  onViewSubmissions,
}: ProjectDetailsModalProps) => {
  const domains = project.techStack
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="flex w-full max-w-2xl max-h-[84vh] flex-col rounded-3xl bg-white shadow-lg">
        <div className="bg-red-00 flex shrink-0 items-start justify-between gap-4 px-6 pt-6 md:px-8 md:pt-8">
          <div className="flex min-w-0 items-center gap-2 text-sm text-gray-600 mb-4">
            <CaretLeft
              onClick={onClose}
              size={22}
              className="shrink-0 cursor-pointer active:scale-90"
            />
            <p className="font-semibold text-lg">Project Details</p>
          </div>
          <button
            className="shrink-0 bg-[#16284F] rounded-md px-3 py-1.5 text-white text-sm cursor-pointer"
            onClick={() => {
              if (project.projectId !== null && onViewSubmissions) {
                onViewSubmissions(project);
              }
            }}
          >
            View Submissions
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 md:px-8 md:pb-8">
          <h1 className="mb-4 max-w-full overflow-x-auto whitespace-nowrap pb-1 text-lg lg:text-2xl font-semibold text-[#16a34a] [scrollbar-color:#CBD5E1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
            {project.title}
          </h1>

          <section className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {project.description || "No description provided."}
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              Domain(s)
            </h2>
            <div className="flex flex-wrap gap-2">
              {domains.length > 0 ? (
                domains.map((d, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-[#16284F21] text-[#16284F] text-xs md:text-sm font-medium"
                  >
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs italic">
                  No domains specified
                </span>
              )}
            </div>
          </section>

          <section className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              Duration
            </h2>
            <span className="inline-flex px-4 py-1.5 rounded-full bg-[#EFE8FF] text-[#5B4FE1] text-sm font-medium">
              {project.duration}
            </span>
          </section>

          <section className="mb-4">
            <div className="flex flex-wrap gap-10">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                  Team Members
                </h2>
                <div className="flex">
                  {project.teamMembers.length > 0 ? (
                    project.teamMembers
                      .slice(0, 5)
                      .map((member, i) => (
                        <MemberAvatar
                          key={i}
                          image={member.image}
                          name={member.name}
                          index={i}
                        />
                      ))
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      No members assigned
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                  Mentor(s)
                </h2>
                <div className="flex flex-col gap-3">
                  {project.mentors.length > 0 ? (
                    project.mentors.map((mentor, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Avatar
                          src={mentor.image}
                          alt={mentor.name}
                          size={40}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {mentor.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Faculty / Guide
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      No mentor assigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              Marks
            </h2>
            <span className="inline-flex px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
              {project.marks} pts
            </span>
          </section>

          <section>
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              Attachments
            </h2>
            {project.fileUrls.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm md:text-base text-gray-700">
                {project.fileUrls.map((url, i) => (
                  <li key={i}>
                    <a
                      href={getSecureAttachmentUrl(url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 break-all hover:underline"
                    >
                      {url.split("/").pop() || url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm italic">
                No attachments uploaded
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
