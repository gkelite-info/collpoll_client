"use client";

import { useUser } from "@/app/utils/context/UserContext";
import { fmtDate, ResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";

type Props = { data?: ResumeData | null };

function GKEliteLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="6" fill="#0a0a0a" />
        <path
          d="M8 20 C8 13 13 8 20 8 C25 8 29 11 31 15 L26 15 C24.5 12.5 22.5 11.5 20 11.5 C15 11.5 11.5 15.2 11.5 20 C11.5 24.8 15 28.5 20 28.5 C23.5 28.5 26.5 26.5 27.5 23.5 L21 23.5 L21 20 L31 20 L31 32 L28 32 L27.5 29.5 C25.5 31.5 23 32.5 20 32.5 C13 32.5 8 27 8 20Z"
          fill="url(#gkGrad)"
        />
        <defs>
          <linearGradient id="gkGrad" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00e5ff" />
            <stop offset="1" stopColor="#2979ff" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <p className="text-[10px] font-black text-gray-800 leading-tight tracking-wide">GK Elite Info</p>
        <p className="text-[8px] text-gray-400 leading-tight">Technology Solutions</p>
      </div>
    </div>
  );
}

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

export default function ResumeTemplate6({ data }: Props) {
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

  const hasPersonalDetails = Boolean(p?.email || p?.mobile || p?.linkedInId || p?.currentCity);
  const hasAccomplishments = awards.length > 0 || clubs.length > 0 || certs.length > 0 || exams.length > 0;

  return (
    <div
      className="bg-white font-sans text-sm px-10 py-8"
      style={{
        width: "794px",
        minHeight: "1123px",
        margin: "0 auto",
      }}
    >
      <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-100">
        <GKEliteLogo />
        <div />
      </div>

      <div className="px-8 pt-5 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="w-16 shrink-0" />

          <div className="flex-1 text-center">
            {p?.fullName && (
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {p.fullName}
              </h1>
            )}
            {p?.workStatus && (
              <p className="text-gray-500 text-xs mt-1 capitalize">{p.workStatus}</p>
            )}
          </div>

          {profilePhoto ? (
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-gray-200">
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 shrink-0" />
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
          {hasPersonalDetails && (
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
                    <p className="font-semibold text-gray-800">
                      {formatEducationLevel(e.educationLevel)}:
                      {e.courseName ? ` ${e.courseName}` : ""}
                      {e.specialization ? ` - ${e.specialization}` : ""}
                    </p>
                    <p className="text-gray-600">Name: {e.institutionName}</p>
                    <p className="text-gray-500">
                      {e.startYear && e.endYear ? `${e.startYear} - ${e.endYear}` : e.yearOfPassing ?? ""}
                    </p>
                    {e.cgpa != null && <p className="text-gray-500">CGPA: {e.cgpa}</p>}
                    {e.percentage != null && <p className="text-gray-500">Percentage: {e.percentage}%</p>}
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

          {langs.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Languages</h2>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {langs.map((l) => (
                  <li key={l} className="flex items-center gap-1">
                    <span>*</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="w-3/5 px-6 py-4 space-y-6">
          {(employment.length > 0 || internships.length > 0) && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Experience</h2>
              <div className="space-y-4">
                {employment.map((e) => (
                  <div key={e.employmentId} className="text-xs space-y-1">
                    <p className="font-semibold text-gray-800">{e.companyName.trim()}</p>
                    <p className="text-gray-600">{e.designation.trim()}</p>
                    <p className="text-gray-500">{fmtDate(e.startDate)} - {fmtDate(e.endDate)}</p>
                    {e.description && <p className="text-gray-600">{e.description}</p>}
                  </div>
                ))}
                {internships.map((i) => (
                  <div key={i.resumeInternshipId} className="text-xs space-y-1">
                    <p className="font-semibold text-gray-800">{i.organizationName.trim()}</p>
                    <p className="text-gray-600">{i.role}</p>
                    {i.projectName && <p className="text-gray-600">{i.projectName.trim()}</p>}
                    {i.location && <p className="text-gray-600">{i.location}</p>}
                    {i.domain && <p className="text-gray-600">{i.domain}</p>}
                    <p className="text-gray-500">{fmtDate(i.startDate)} - {fmtDate(i.endDate)}</p>
                    {i.projectUrl && <p className="text-blue-600 break-all">{i.projectUrl.trim()}</p>}
                    {i.description && <p className="text-gray-600">{i.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Projects</h2>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.resumeProjectId} className="text-xs space-y-1">
                    <p className="font-semibold text-gray-800">{proj.projectName}</p>
                    {proj.domain && <p className="text-gray-600">{proj.domain}</p>}
                    <p className="text-gray-500">{fmtDate(proj.startDate)} - {fmtDate(proj.endDate)}</p>
                    {proj.toolsAndTechnologies && proj.toolsAndTechnologies.length > 0 && (
                      <p className="text-gray-600">{proj.toolsAndTechnologies.join(", ")}</p>
                    )}
                    {proj.description && <p className="text-gray-600">{proj.description}</p>}
                    {proj.projectUrl && <p className="text-blue-600 break-all">{proj.projectUrl}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasAccomplishments && (
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Accomplishments</h2>
              <div className="text-xs space-y-3">
                {awards.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Awards</p>
                    <ul className="text-gray-600 space-y-0.5">
                      {awards.map((a) => (
                        <li key={a.awardId} className="flex items-start gap-1">
                          <span>*</span>
                          <span>{a.awardName} - {a.issuedBy}</span>
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
                          <span>*</span>
                          <span>{c.clubName} - {c.role}</span>
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
                          <span>*</span>
                          <span>{c.certificationName}</span>
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
                          <span>*</span>
                          <span>{e.examName} - Score: {e.score}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
