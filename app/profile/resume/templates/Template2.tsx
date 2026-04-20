"use client";

import { fmtDate, ResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";
import { ReactNode } from "react";

type Props = { data?: ResumeData | null };

export default function ResumeTemplate2({ data }: Props) {
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
      <div className="text-center mb-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-widest uppercase">{p?.fullName ?? ""}</h1>
      </div>

      <div className="flex items-center justify-center gap-5 text-xs text-gray-500 mb-6 flex-wrap">
        {p?.currentCity && <span className="flex items-center gap-1">📍 {p.currentCity}</span>}
        {p?.mobile && <span className="flex items-center gap-1">📞 {p.mobile}</span>}
        {p?.email && <span className="flex items-center gap-1">✉️ {p.email}</span>}
        {p?.linkedInId && <span className="flex items-center gap-1">🔗 {p.linkedInId}</span>}
      </div>

      <hr className="border-gray-300 mb-5" />

      {summary && (
        <Section title="Professional Summary">
          <p className="text-gray-600 text-xs leading-relaxed">{summary}</p>
        </Section>
      )}

      {groups.length > 0 && (
        <Section title="Key Skills">
          <ul className="text-xs text-gray-700 space-y-1">
            {groups.map((g) => (
              <li key={g.categoryName}>
                <span className="font-semibold">{g.categoryName}:</span> {g.skills.join(", ")}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(employment.length > 0 || internships.length > 0) && (
        <Section title="Experience">
          <div className="space-y-4">
            {employment.map((e) => (
              <ExperienceBlock
                key={e.employmentId}
                company={e.companyName.trim()}
                role={e.designation.trim()}
                date={`${fmtDate(e.startDate)} - ${fmtDate(e.endDate)}`}
                bullets={e.description ? [e.description] : []}
              />
            ))}
            {internships.map((i) => (
              <ExperienceBlock
                key={i.resumeInternshipId}
                company={i.organizationName.trim()}
                role={i.role}
                date={`${fmtDate(i.startDate)} - ${fmtDate(i.endDate)}`}
                bullets={[
                  ...(i.projectName ? [`Project: ${i.projectName.trim()}`] : []),
                  ...(i.domain ? [`Domain: ${i.domain}`] : []),
                  ...(i.description ? [i.description] : []),
                ]}
              />
            ))}
          </div>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.resumeProjectId}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-gray-800 text-xs">{proj.projectName}</span>
                  {proj.toolsAndTechnologies?.length ? (
                    <span className="text-gray-400 text-xs">| {proj.toolsAndTechnologies.join(", ")}</span>
                  ) : null}
                </div>
                {proj.description && (
                  <ul className="text-xs text-gray-600 space-y-0.5 mb-1">
                    <li className="flex gap-1.5"><span>•</span>{proj.description}</li>
                  </ul>
                )}
                {proj.projectUrl && <p className="text-xs text-blue-600">🔗 GitHub: {proj.projectUrl}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {(certs.length > 0 || awards.length > 0 || clubs.length > 0 || exams.length > 0 || achievements.length > 0 || langs.length > 0 || edu.length > 0) && (
        <>
          {edu.length > 0 && (
            <Section title="Education">
              <div className="space-y-3 text-xs">
                {edu.map((e) => (
                  <div key={e.resumeEducationDetailId}>
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-gray-900">
                        {e.courseName ? `${e.courseName}${e.specialization ? ` - ${e.specialization}` : ""}` : e.educationLevel}
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
            </Section>
          )}

          <Section title="Additional Information">
            <ul className="text-xs text-gray-700 space-y-1">
              {langs.length > 0 && <li><span className="font-semibold">Languages:</span> {langs.join(", ")}</li>}
              {certs.length > 0 && <li><span className="font-semibold">Certifications:</span> {certs.map((c) => c.certificationName).join(", ")}</li>}
              {awards.length > 0 && <li><span className="font-semibold">Awards:</span> {awards.map((a) => `${a.awardName} - ${a.issuedBy}`).join(", ")}</li>}
              {clubs.length > 0 && <li><span className="font-semibold">Clubs & Committees:</span> {clubs.map((c) => `${c.clubName} (${c.role})`).join(", ")}</li>}
              {exams.length > 0 && <li><span className="font-semibold">Competitive Exams:</span> {exams.map((e) => `${e.examName} - ${e.score}`).join(", ")}</li>}
              {achievements.length > 0 && <li><span className="font-semibold">Achievements:</span> {achievements.map((a) => a.achievementName).join(", ")}</li>}
            </ul>
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function ExperienceBlock({ company, role, date, bullets }: {
  company: string; role: string; date: string; bullets: string[];
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">{company}</p>
        <span className="text-xs text-gray-500 shrink-0 ml-2">{date}</span>
      </div>
      <p className="text-xs font-semibold text-gray-700 mb-1">{role}</p>
      {bullets.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-0.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-1.5"><span>•</span><span>{b}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}
