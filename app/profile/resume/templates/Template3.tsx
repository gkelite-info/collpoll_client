"use client";

import { fmtDate, ResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";
import { ReactNode } from "react";

type Props = { data?: ResumeData | null };

export default function ResumeTemplate3({ data }: Props) {
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

  return (
    <div className="bg-white font-sans text-sm px-10 py-8" style={{ width: "794px", minHeight: "1123px", margin: "0 auto" }}>
      <div className="mb-1">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider">{p?.fullName ?? ""}</h1>
        {p?.workStatus && <p className="text-gray-600 text-xs font-medium mt-0.5">{p.workStatus}</p>}
      </div>

      <div className="flex items-center gap-5 text-xs text-gray-500 mb-5 flex-wrap">
        {p?.currentCity && <span>📍 {p.currentCity}</span>}
        {p?.mobile && <span>📞 {p.mobile}</span>}
        {p?.email && <span>✉️ {p.email}</span>}
        {p?.linkedInId && <span>🔗 {p.linkedInId}</span>}
      </div>

      {summary && (
        <GraySection title="Summary">
          <p className="text-gray-700 text-xs leading-relaxed">{summary}</p>
        </GraySection>
      )}

      {groups.length > 0 && (
        <GraySection title="Technical Skills">
          <ul className="text-xs text-gray-700 space-y-1">
            {groups.map((g) => (
              <li key={g.categoryName}>
                <span className="font-semibold">{g.categoryName}:</span> {g.skills.join(", ")}
              </li>
            ))}
          </ul>
        </GraySection>
      )}

      {(employment.length > 0 || internships.length > 0) && (
        <GraySection title="Professional Experience">
          <div className="space-y-4">
            {employment.map((e) => (
              <div key={e.employmentId}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-xs font-bold text-gray-900">{e.companyName.trim()} - {e.designation.trim()}</p>
                  <span className="text-xs text-gray-500">{fmtDate(e.startDate)} - {fmtDate(e.endDate)}</span>
                </div>
                {e.description && (
                  <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
                    <li className="flex gap-1.5"><span>•</span>{e.description}</li>
                  </ul>
                )}
              </div>
            ))}
            {internships.map((i) => (
              <div key={i.resumeInternshipId}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-xs font-bold text-gray-900">{i.organizationName.trim()} - {i.role}</p>
                  <span className="text-xs text-gray-500">{fmtDate(i.startDate)} - {fmtDate(i.endDate)}</span>
                </div>
                {i.description && (
                  <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
                    <li className="flex gap-1.5"><span>•</span>{i.description}</li>
                  </ul>
                )}
              </div>
            ))}
          </div>
        </GraySection>
      )}

      {edu.length > 0 && (
        <GraySection title="Education">
          <div className="space-y-3 text-xs">
            {edu.map((e) => (
              <div key={e.resumeEducationDetailId}>
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-gray-900">
                    {e.courseName ? `${e.courseName}${e.specialization ? ` - ${e.specialization}` : ""}` : e.institutionName}
                  </p>
                  <span className="text-gray-500 shrink-0 ml-2">
                    {e.startYear && e.endYear ? `${e.startYear} - ${e.endYear}` : e.yearOfPassing ?? ""}
                  </span>
                </div>
                <p className="text-gray-600">{e.institutionName}</p>
                {e.cgpa != null && <p className="text-gray-600">CGPA: {e.cgpa}</p>}
                {e.percentage != null && <p className="text-gray-600">Percentage: {e.percentage}%</p>}
              </div>
            ))}
          </div>
        </GraySection>
      )}

      {projects.length > 0 && (
        <GraySection title="Projects">
          <div className="space-y-3 text-xs">
            {projects.map((proj) => (
              <div key={proj.resumeProjectId}>
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-gray-900">{proj.projectName}</p>
                  <span className="text-gray-500 shrink-0 ml-2">{fmtDate(proj.startDate)}</span>
                </div>
                {proj.toolsAndTechnologies?.length ? <p className="text-gray-600">{proj.toolsAndTechnologies.join(", ")}</p> : null}
                {proj.description && (
                  <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
                    <li className="flex gap-1.5"><span>•</span>{proj.description}</li>
                  </ul>
                )}
                {proj.projectUrl && <p className="text-xs text-blue-600 mt-1">🔗 {proj.projectUrl}</p>}
              </div>
            ))}
          </div>
        </GraySection>
      )}

      {(langs.length > 0 || certs.length > 0 || awards.length > 0 || clubs.length > 0 || exams.length > 0 || achievements.length > 0) && (
        <GraySection title="Additional Information">
          <ul className="text-xs text-gray-700 space-y-1">
            {langs.length > 0 && <li><span className="font-semibold">Languages:</span> {langs.join(", ")}</li>}
            {certs.length > 0 && <li><span className="font-semibold">Certifications:</span> {certs.map((c) => c.certificationName).join(", ")}</li>}
            {awards.length > 0 && <li><span className="font-semibold">Awards:</span> {awards.map((a) => `${a.awardName} - ${a.issuedBy}`).join(", ")}</li>}
            {clubs.length > 0 && <li><span className="font-semibold">Clubs:</span> {clubs.map((c) => `${c.clubName} (${c.role})`).join(", ")}</li>}
            {exams.length > 0 && <li><span className="font-semibold">Competitive Exams:</span> {exams.map((e) => `${e.examName} - ${e.score}`).join(", ")}</li>}
            {achievements.length > 0 && <li><span className="font-semibold">Achievements:</span> {achievements.map((a) => a.achievementName).join(", ")}</li>}
          </ul>
        </GraySection>
      )}
    </div>
  );
}

function GraySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="bg-gray-200 px-3 py-1 mb-3">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </div>
  );
}
