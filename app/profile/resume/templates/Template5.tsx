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

export default function ResumeTemplate5({ data }: Props) {
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

  const nameParts = p?.fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");
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
      <div className="flex justify-between items-start px-8 pt-8 pb-5 border-b-2 border-gray-800 gap-6">
        <div>
          {(firstName || lastName) && (
            <h1 className="text-3xl font-black text-gray-900 uppercase leading-tight">
              {firstName}
              {lastName ? <><br />{lastName}</> : null}
            </h1>
          )}
          {p?.workStatus && (
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1 font-medium">
              {p.workStatus}
            </p>
          )}
        </div>
        <div className="text-right text-xs text-gray-600 space-y-1 mt-1">
          {p?.mobile && <p>{p.mobile}</p>}
          {p?.email && <p>{p.email}</p>}
          {p?.currentCity && <p>{p.currentCity}</p>}
          {p?.linkedInId && <p className="break-all">{p.linkedInId}</p>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {summary && (
          <Section5 title="About Me">
            <p className="text-gray-700 text-xs leading-relaxed">{summary}</p>
          </Section5>
        )}

        {hasExperience && (
          <Section5 title="Experience">
            <div className="space-y-4">
              {employment.map((e) => (
                <div key={e.employmentId}>
                  <div className="flex justify-between items-baseline mb-1 gap-3">
                    <p className="text-xs font-bold text-gray-900">{e.companyName.trim()}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {fmtDate(e.startDate)} - {fmtDate(e.endDate)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1 font-medium">{e.designation.trim()}</p>
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
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {fmtDate(i.startDate)} - {fmtDate(i.endDate)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1 font-medium">{i.role}</p>
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
          </Section5>
        )}

        {edu.length > 0 && (
          <Section5 title="Education">
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
                  {e.cgpa != null && <p className="text-gray-600">CGPA: {e.cgpa}</p>}
                  {e.percentage != null && <p className="text-gray-600">Percentage: {e.percentage}%</p>}
                </div>
              ))}
            </div>
          </Section5>
        )}

        {groups.length > 0 && (
          <Section5 title="Key Skills">
            <ul className="text-xs text-gray-700 space-y-1">
              {groups.map((g) => (
                <li key={g.categoryName}>
                  <span className="font-semibold">{g.categoryName}:</span> {g.skills.join(", ")}
                </li>
              ))}
            </ul>
          </Section5>
        )}

        {projects.length > 0 && (
          <Section5 title="Projects">
            <div className="space-y-3 text-xs">
              {projects.map((proj) => (
                <div key={proj.resumeProjectId}>
                  <div className="flex justify-between items-baseline gap-3">
                    <p className="font-bold text-gray-900">{proj.projectName}</p>
                    <span className="text-gray-500 whitespace-nowrap">
                      {fmtDate(proj.startDate)} - {fmtDate(proj.endDate)}
                    </span>
                  </div>
                  {proj.domain && <p className="text-gray-600">{proj.domain}</p>}
                  {proj.toolsAndTechnologies && proj.toolsAndTechnologies.length > 0 && (
                    <p className="text-gray-600">{proj.toolsAndTechnologies.join(", ")}</p>
                  )}
                  {proj.description && (
                    <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
                      <li className="flex gap-1.5">
                        <span>*</span>
                        <span>{proj.description}</span>
                      </li>
                    </ul>
                  )}
                  {proj.projectUrl && <p className="text-xs text-blue-600 mt-1 break-all">{proj.projectUrl}</p>}
                </div>
              ))}
            </div>
          </Section5>
        )}

        {hasAdditional && (
          <Section5 title="Additional Information">
            <ul className="text-xs text-gray-700 space-y-1">
              {langs.length > 0 && <li><span className="font-semibold">Languages:</span> {langs.join(", ")}</li>}
              {certs.length > 0 && <li><span className="font-semibold">Certifications:</span> {certs.map((c) => c.certificationName).join(", ")}</li>}
              {awards.length > 0 && <li><span className="font-semibold">Awards:</span> {awards.map((a) => `${a.awardName} - ${a.issuedBy}`).join(", ")}</li>}
              {clubs.length > 0 && <li><span className="font-semibold">Clubs:</span> {clubs.map((c) => `${c.clubName} (${c.role})`).join(", ")}</li>}
              {exams.length > 0 && <li><span className="font-semibold">Competitive Exams:</span> {exams.map((e) => `${e.examName} - ${e.score}`).join(", ")}</li>}
              {achievements.length > 0 && <li><span className="font-semibold">Achievements:</span> {achievements.map((a) => a.achievementName).join(", ")}</li>}
            </ul>
          </Section5>
        )}
      </div>
    </div>
  );
}

function Section5({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest whitespace-nowrap">{title}</h2>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
      {children}
    </div>
  );
}
