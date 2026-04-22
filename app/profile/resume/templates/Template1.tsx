"use client";

import { useUser } from "@/app/utils/context/UserContext";
import { fmtDate, ResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";

type Props = { data?: ResumeData | null };

export default function ResumeTemplate1({ data }: Props) {
  const { profilePhoto } = useUser();

  const p = data?.personal;
  const edu = data?.education ?? [];
  const groups = data?.skillGroups ?? [];
  const internships = data?.internships ?? [];
  const employment = data?.employment ?? [];
  const projects = data?.projects ?? [];
  const awards = data?.awards ?? [];
  const clubs = data?.clubs ?? [];
  const certs = data?.certifications ?? [];
  const exams = data?.exams ?? [];
  const langs = data?.languages ?? [];
  const summary = data?.summary ?? "";

  const initials = p?.fullName
    ? p.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AR";

  const formatEducationLevel = (level: string) => {
    const normalized = level.toLowerCase();
    if (normalized === "phd") return "PhD";
    if (normalized === "masters") return "Masters";
    if (normalized === "undergraduate") return "Undergraduate";
    if (normalized === "secondary") return "Secondary";
    if (normalized === "primary") return "Primary";
    return level;
  };

  return (
    <div
      className="bg-white font-sans text-sm px-10 py-8"
      style={{ width: "794px", minHeight: "1123px", margin: "0 auto" }}
    >
      <div className="px-8 pt-8 pb-4 flex items-start justify-between border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{p?.fullName ?? ""}</h1>
          {p?.workStatus && <p className="text-gray-500 text-xs mt-1">{p.workStatus}</p>}
        </div>

        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 ml-4 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-600 text-xl font-bold">{initials}</span>
          )}
        </div>
      </div>

      {summary && (
        <div className="px-8 py-4 border-b border-gray-100">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Profile Summary</h2>
          <p className="text-gray-600 leading-relaxed text-xs">{summary}</p>
        </div>
      )}

      <div className="flex">
        <div className="w-2/5 px-6 py-4 border-r border-gray-100 space-y-6">
          {(p?.email || p?.mobile || p?.linkedInId || p?.currentCity) && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Personal Details</h2>
              <div className="space-y-1 text-gray-600 text-xs">
                {p?.email && <p>{p.email}</p>}
                {p?.mobile && <p>{p.mobile}</p>}
                {p?.linkedInId && <p className="break-all">{p.linkedInId}</p>}
                {p?.currentCity && <p>{p.currentCity}</p>}
              </div>
            </div>
          )}

          {edu.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Education</h2>
              <div className="space-y-3 text-xs">
                {edu.map((e) => (
                  <div key={e.resumeEducationDetailId}>
                    <p className="font-semibold text-[#16284F]">{formatEducationLevel(e.educationLevel)}:</p>
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-800">Name:</span> {e.institutionName}
                    </p>
                    {e.courseName && (
                      <p className="text-gray-600">
                        <span className="font-semibold text-gray-700">Course:</span> {e.courseName}
                        {e.specialization ? ` - ${e.specialization}` : ""}
                      </p>
                    )}
                    <p className="text-gray-500">
                      {e.startYear && e.endYear ? `${e.startYear} - ${e.endYear}` : e.yearOfPassing ?? ""}
                    </p>
                    {e.percentage != null && <p className="text-gray-500">{e.percentage}%</p>}
                    {e.cgpa != null && <p className="text-gray-500">{e.cgpa} CGPA</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {groups.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Skills</h2>
              <div className="text-xs space-y-3">
                {groups.map((g) => (
                  <div key={g.categoryName}>
                    <p className="font-semibold text-gray-800 mb-1">{g.categoryName}</p>
                    <p className="text-gray-600">{g.skills.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-3/5 px-6 py-4 space-y-6">
          {internships.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Internship</h2>
              {internships.map((i) => (
                <div key={i.resumeInternshipId} className="text-xs space-y-1 mb-3">
                  <p className="font-semibold text-gray-800">{i.organizationName.trim()}</p>
                  <p className="text-gray-600">{i.role}</p>
                  {i.projectName && <p className="text-gray-600">{i.projectName.trim()}</p>}
                  {i.location && <p className="text-gray-600">{i.location}</p>}
                  {i.domain && <p className="text-gray-600">{i.domain}</p>}
                  <p className="text-gray-500">{fmtDate(i.startDate)} - {fmtDate(i.endDate)}</p>
                  {i.projectUrl && <p className="text-blue-600 break-all">{i.projectUrl.trim()}</p>}
                </div>
              ))}
            </div>
          )}

          {employment.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Employment</h2>
              {employment.map((item) => (
                <div key={item.employmentId} className="text-xs space-y-1 mb-3">
                  <p className="font-semibold text-gray-800">{item.companyName.trim()}</p>
                  <p className="text-gray-600">{item.designation.trim()}</p>
                  <p className="text-gray-500">{fmtDate(item.startDate)} - {fmtDate(item.endDate)}</p>
                  {(item.experienceYears > 0 || item.experienceMonths > 0) && (
                    <p className="text-gray-500">Experience: {item.experienceYears}y {item.experienceMonths}m</p>
                  )}
                  {item.description && <p className="text-gray-600">{item.description}</p>}
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Projects</h2>
              {projects.map((project) => (
                <div key={project.resumeProjectId} className="text-xs space-y-1 mb-3">
                  <p className="font-semibold text-gray-800">{project.projectName.trim()}</p>
                  {project.domain && <p className="text-gray-600">{project.domain}</p>}
                  {project.toolsAndTechnologies?.length ? (
                    <p className="text-gray-600">{project.toolsAndTechnologies.join(", ")}</p>
                  ) : null}
                  <p className="text-gray-500">{fmtDate(project.startDate)} - {fmtDate(project.endDate)}</p>
                  {project.description && <p className="text-gray-600">{project.description}</p>}
                  {project.projectUrl && <p className="text-blue-600 break-all">{project.projectUrl.trim()}</p>}
                </div>
              ))}
            </div>
          )}

          {(awards.length > 0 || clubs.length > 0 || certs.length > 0 || exams.length > 0) && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Accomplishments</h2>
              <div className="text-xs space-y-3">
                {awards.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Awards</p>
                    <ul className="text-gray-600 space-y-0.5">
                      {awards.map((a) => (
                        <li key={a.awardId} className="flex items-start gap-1">
                          <span>•</span><span>{a.awardName} - {a.issuedBy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {clubs.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Clubs & Committees</p>
                    <ul className="text-gray-600 space-y-0.5">
                      {clubs.map((c) => (
                        <li key={c.resumeClubCommitteeId} className="flex items-start gap-1">
                          <span>•</span><span>{c.clubName} - {c.role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {certs.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Certifications</p>
                    <ul className="text-gray-600 space-y-0.5">
                      {certs.map((c) => (
                        <li key={c.resumeCertificateId} className="flex items-start gap-1">
                          <span>•</span><span>{c.certificationName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {exams.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Competitive Exams</p>
                    <ul className="text-gray-600 space-y-0.5">
                      {exams.map((e) => (
                        <li key={e.competitiveExamsId} className="flex items-start gap-1">
                          <span>•</span><span>{e.examName} - Score: {e.score}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {langs.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Languages</h2>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {langs.map((l) => (
                  <li key={l} className="flex items-center gap-1"><span>•</span>{l}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
