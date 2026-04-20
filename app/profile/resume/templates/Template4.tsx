"use client";

import { fmtDate, ResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";
import { ReactNode } from "react";

type Props = { data?: ResumeData | null };

function formatEducationLevel(level: string) {
  switch (level?.toLowerCase()) {
    case "phd":
      return "PhD";
    case "postgraduate":
      return "Masters";
    case "undergraduate":
      return "Undergraduate";
    case "intermediate":
      return "Intermediate";
    case "school":
      return "School";
    default:
      return level;
  }
}

export default function ResumeTemplate4({ data }: Props) {
  const p = data?.personal;
  const edu = data?.education ?? [];
  const groups = data?.skillGroups ?? [];
  const internships = data?.internships ?? [];
  const employment = data?.employment ?? [];
  const projects = data?.projects ?? [];
  const summary = data?.summary ?? "";
  const certs = data?.certifications ?? [];
  const awards = data?.awards ?? [];
  const clubs = data?.clubs ?? [];
  const exams = data?.exams ?? [];
  const achievements = data?.achievements ?? [];
  const langs = data?.languages ?? [];

  const hasContact = Boolean(p?.currentCity || p?.mobile || p?.email || p?.linkedInId);
  const hasExperience = employment.length > 0 || internships.length > 0;
  const hasAdditional =
    langs.length > 0 ||
    certs.length > 0 ||
    awards.length > 0 ||
    clubs.length > 0 ||
    exams.length > 0 ||
    achievements.length > 0;

  return (
    <div
      className="bg-white font-sans text-sm px-10 py-8"
      style={{
        width: "794px",
        minHeight: "1123px",
        margin: "0 auto",
      }}
    >
      <div className="text-center mb-6">
        {p?.fullName && (
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-widest">
            {p.fullName}
          </h1>
        )}
        {(p?.workStatus || hasContact) && (
          <>
            {p?.workStatus && (
              <p className="text-gray-600 text-xs mt-0.5 capitalize">
                {p.workStatus}
              </p>
            )}
            {hasContact && (
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
                {p?.currentCity && <span>{p.currentCity}</span>}
                {p?.mobile && <span>{p.mobile}</span>}
                {p?.email && <span>{p.email}</span>}
                {p?.linkedInId && <span>{p.linkedInId}</span>}
              </div>
            )}
          </>
        )}
      </div>

      {summary && (
        <LabelRow label="Summary">
          <p className="text-gray-700 text-xs leading-relaxed">{summary}</p>
        </LabelRow>
      )}

      {hasExperience && (
        <LabelRow label="Work Experience">
          <div className="space-y-4">
            {employment.map((e) => (
              <div key={e.employmentId}>
                <div className="flex justify-between items-baseline mb-1 gap-3">
                  <p className="text-xs font-bold text-gray-900">{e.companyName.trim()}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {fmtDate(e.startDate)} - {fmtDate(e.endDate)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-700 mb-1">{e.designation.trim()}</p>
                {e.description && (
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    <li className="flex gap-1.5">
                      <span>*</span>
                      <span>{e.description}</span>
                    </li>
                  </ul>
                )}
              </div>
            ))}
            {internships.map((i) => (
              <div key={i.resumeInternshipId}>
                <div className="flex justify-between items-baseline mb-1 gap-3">
                  <p className="text-xs font-bold text-gray-900">{i.organizationName.trim()}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {fmtDate(i.startDate)} - {fmtDate(i.endDate)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-700 mb-1">{i.role}</p>
                {i.projectName && <p className="text-xs text-gray-600">{i.projectName.trim()}</p>}
                {i.location && <p className="text-xs text-gray-600">{i.location}</p>}
                {i.domain && <p className="text-xs text-gray-600">{i.domain}</p>}
                {i.description && (
                  <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
                    <li className="flex gap-1.5">
                      <span>*</span>
                      <span>{i.description}</span>
                    </li>
                  </ul>
                )}
                {i.projectUrl && <p className="text-xs text-blue-600 mt-1 break-all">{i.projectUrl.trim()}</p>}
              </div>
            ))}
          </div>
        </LabelRow>
      )}

      {edu.length > 0 && (
        <LabelRow label="Education">
          <div className="space-y-3 text-xs">
            {edu.map((e) => (
              <div key={e.resumeEducationDetailId}>
                <div className="flex justify-between items-baseline gap-3">
                  <p className="font-bold text-gray-900">
                    {formatEducationLevel(e.educationLevel)}:
                    {e.courseName ? ` ${e.courseName}` : ""}
                    {e.specialization ? ` - ${e.specialization}` : ""}
                  </p>
                  <span className="text-gray-500 whitespace-nowrap">
                    {e.startYear && e.endYear ? `${e.startYear} - ${e.endYear}` : e.yearOfPassing ?? ""}
                  </span>
                </div>
                <p className="text-gray-600">Name: {e.institutionName}</p>
                {e.board && <p className="text-gray-600">Board: {e.board}</p>}
                {e.cgpa != null && <p className="text-gray-600">CGPA: {e.cgpa}</p>}
                {e.percentage != null && <p className="text-gray-600">Percentage: {e.percentage}%</p>}
              </div>
            ))}
          </div>
        </LabelRow>
      )}

      {groups.length > 0 && (
        <LabelRow label="Key Skills">
          <ul className="text-xs text-gray-700 space-y-1">
            {groups.map((g) => (
              <li key={g.categoryName}>
                <span className="font-semibold">{g.categoryName}:</span> {g.skills.join(", ")}
              </li>
            ))}
          </ul>
        </LabelRow>
      )}

      {projects.length > 0 && (
        <LabelRow label="Projects">
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.resumeProjectId}>
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-gray-800 text-xs">{proj.projectName}</span>
                  {proj.toolsAndTechnologies && proj.toolsAndTechnologies.length > 0 && (
                    <span className="text-gray-400 text-xs">| {proj.toolsAndTechnologies.join(", ")}</span>
                  )}
                </div>
                {proj.domain && <p className="text-xs text-gray-600 mb-1">{proj.domain}</p>}
                <p className="text-xs text-gray-500 mb-1">
                  {fmtDate(proj.startDate)} - {fmtDate(proj.endDate)}
                </p>
                {proj.description && (
                  <ul className="text-xs text-gray-600 space-y-0.5 mb-1">
                    <li className="flex gap-1.5">
                      <span>*</span>
                      <span>{proj.description}</span>
                    </li>
                  </ul>
                )}
                {proj.projectUrl && (
                  <p className="text-xs text-blue-600 break-all">{proj.projectUrl}</p>
                )}
              </div>
            ))}
          </div>
        </LabelRow>
      )}

      {hasAdditional && (
        <LabelRow label="Additional">
          <ul className="text-xs text-gray-700 space-y-1">
            {langs.length > 0 && <li><span className="font-semibold">Languages:</span> {langs.join(", ")}</li>}
            {certs.length > 0 && <li><span className="font-semibold">Certifications:</span> {certs.map((c) => c.certificationName).join(", ")}</li>}
            {awards.length > 0 && <li><span className="font-semibold">Awards:</span> {awards.map((a) => `${a.awardName} - ${a.issuedBy}`).join(", ")}</li>}
            {clubs.length > 0 && <li><span className="font-semibold">Clubs:</span> {clubs.map((c) => `${c.clubName} (${c.role})`).join(", ")}</li>}
            {exams.length > 0 && <li><span className="font-semibold">Competitive Exams:</span> {exams.map((e) => `${e.examName} - ${e.score}`).join(", ")}</li>}
            {achievements.length > 0 && <li><span className="font-semibold">Achievements:</span> {achievements.map((a) => a.achievementName).join(", ")}</li>}
          </ul>
        </LabelRow>
      )}
    </div>
  );
}

function LabelRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 mb-5 border-t border-gray-100 pt-4">
      <div className="w-28 shrink-0">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
      </div>
      <div className="flex-1 border-l-2 border-gray-300 pl-4">{children}</div>
    </div>
  );
}
