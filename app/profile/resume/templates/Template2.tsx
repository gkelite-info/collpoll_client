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
    <div
      className="bg-white font-sans text-sm px-10 py-8"
      style={{
        width: "794px",
        minHeight: "1123px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div className="text-center mb-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-widest uppercase">
          {p?.fullName ?? "Aarav Reddy"}
        </h1>
      </div>
      <div className="flex items-center justify-center gap-5 text-xs text-gray-500 mb-6 flex-wrap">
        <span className="flex items-center gap-1">📍 {p?.currentCity ?? "Hyderabad, Telangana"}</span>
        <span className="flex items-center gap-1">📞 {p?.mobile ?? "9012345678"}</span>
        <span className="flex items-center gap-1">✉️ {p?.email ?? "shravanireddy@gmail.com"}</span>
        {p?.linkedInId && <span className="flex items-center gap-1">🔗 {p.linkedInId}</span>}
      </div>

      <hr className="border-gray-300 mb-5" />

      {/* Professional Summary */}
      <Section title="Professional Summary">
        <p className="text-gray-600 text-xs leading-relaxed">
          {summary || "Results-driven Computer Science Engineering student with a strong foundation in software development, data structures, and web technologies. Skilled in full-stack development, problem-solving, and collaborative project execution. Passionate about building efficient and scalable digital solutions. Eager to contribute technical expertise and creative ideas to innovative real-world projects that drive meaningful user experiences, about continuous learning and adapting to emerging technologies in AI, cloud, and automation."}
        </p>
      </Section>

      {/* Key Skills */}
      <Section title="Key Skills">
        {groups.length > 0 ? (
          <ul className="text-xs text-gray-700 space-y-1">
            {groups.map((g) => (
              <li key={g.categoryName}>
                <span className="font-semibold">{g.categoryName}:</span> {g.skills.join(", ")}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="text-xs text-gray-700 space-y-1">
            <li><span className="font-semibold">Programming Languages:</span> Python, Java, C++</li>
            <li><span className="font-semibold">Web Technologies:</span> HTML, CSS, JavaScript, React.js, Node.js</li>
            <li><span className="font-semibold">Databases:</span> MySQL, MongoDB</li>
            <li><span className="font-semibold">Tools & Platforms:</span> Git, VS Code, Postman, Figma, Linux</li>
            <li><span className="font-semibold">Soft Skills:</span> Analytical Thinking, Teamwork, Communication, Time Management</li>
          </ul>
        )}
      </Section>

      {/* Experience — employment + internships */}
      <Section title="Experience">
        <div className="space-y-4">
          {employment.length > 0 || internships.length > 0 ? (
            <>
              {employment.map((e) => (
                <ExperienceBlock
                  key={e.employmentId}
                  company={e.companyName.trim()}
                  role={e.designation.trim()}
                  date={`${fmtDate(e.startDate)} – ${fmtDate(e.endDate)}`}
                  bullets={e.description ? [e.description] : []}
                />
              ))}
              {internships.map((i) => (
                <ExperienceBlock
                  key={i.resumeInternshipId}
                  company={i.organizationName.trim()}
                  role={i.role}
                  date={`${fmtDate(i.startDate)} – ${fmtDate(i.endDate)}`}
                  bullets={[
                    ...(i.domain ? [`Domain: ${i.domain}`] : []),
                    ...(i.description ? [i.description] : []),
                  ]}
                />
              ))}
            </>
          ) : (
            <>
              <ExperienceBlock
                company="Hyderabad, Telangana"
                role="Infosys Ltd, Bengaluru"
                date="July 2024 – Oct 2024"
                bullets={[
                  "Developed and maintained scalable web applications using React.js, Node.js, and Express.",
                  "Designed RESTful APIs to integrate backend services with front-end systems.",
                  "Collaborated with cross-functional teams to implement new product features and fix critical bugs in production.",
                  "Automated testing and deployment pipelines using Jenkins and Git, reducing manual deployment effort by 40%.",
                  "Conducted code reviews and performance optimization to ensure high-quality deliverables.",
                ]}
              />
              <ExperienceBlock
                company="Software Development Intern"
                role="TCS Digital Labs, Bengaluru"
                date="Jan 2024 – June 2024"
                bullets={[
                  "Built a student performance tracking system using React.js and Firebase to visualize academic insights.",
                  "Designed modular components and improved reusability by following component-driven architecture.",
                  "Integrated Google APIs for authentication and cloud data sync, increasing reliability by 35%.",
                  "Worked closely with senior engineers to identify and fix performance bottlenecks in web modules.",
                  "Conducted unit testing using Jest and Postman, ensuring high-quality and secure API integrations.",
                ]}
              />
            </>
          )}
        </div>
      </Section>

      {/* Projects */}
      <Section title="Projects">
        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.resumeProjectId}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-gray-800 text-xs">{proj.projectName}</span>
                  {proj.toolsAndTechnologies && proj.toolsAndTechnologies.length > 0 && (
                    <span className="text-gray-400 text-xs">| {proj.toolsAndTechnologies.join(", ")}</span>
                  )}
                </div>
                {proj.description && (
                  <ul className="text-xs text-gray-600 space-y-0.5 mb-1">
                    <li className="flex gap-1.5"><span>•</span>{proj.description}</li>
                  </ul>
                )}
                {proj.projectUrl && (
                  <p className="text-xs text-blue-600">🔗 GitHub: {proj.projectUrl}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-gray-800 text-xs">DigiCampus – College Management Portal</span>
              <span className="text-gray-400 text-xs">| React.js, Firebase, Node.js</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-0.5 mb-1">
              <li className="flex gap-1.5"><span>•</span>Built a centralized digital platform for students and faculty to manage attendance, assignments, and performance data.</li>
              <li className="flex gap-1.5"><span>•</span>Designed the UI/UX and implemented role-based access authentication.</li>
              <li className="flex gap-1.5"><span>•</span>Improved task tracking efficiency by 45%.</li>
            </ul>
            <p className="text-xs text-blue-600">🔗 GitHub: github.com/shravanireddy/digicampus</p>
          </div>
        )}
      </Section>

      {/* Additional — certs, awards, clubs, exams, achievements, languages */}
      {(certs.length > 0 || awards.length > 0 || clubs.length > 0 || exams.length > 0 || achievements.length > 0 || langs.length > 0 || edu.length > 0) && (
        <>
          {edu.length > 0 && (
            <Section title="Education">
              <div className="space-y-3 text-xs">
                {edu.map((e) => (
                  <div key={e.resumeEducationDetailId}>
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-gray-900">
                        {e.courseName ? `${e.courseName}${e.specialization ? ` – ${e.specialization}` : ""}` : e.educationLevel}
                      </p>
                      <span className="text-gray-500 shrink-0 ml-2">
                        {e.startYear && e.endYear ? `${e.startYear} – ${e.endYear}` : e.yearOfPassing ?? ""}
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
              {langs.length > 0 && (
                <li><span className="font-semibold">Languages:</span> {langs.join(", ")}</li>
              )}
              {certs.length > 0 && (
                <li><span className="font-semibold">Certifications:</span> {certs.map((c) => c.certificationName).join(", ")}</li>
              )}
              {awards.length > 0 && (
                <li><span className="font-semibold">Awards:</span> {awards.map((a) => `${a.awardName} – ${a.issuedBy}`).join(", ")}</li>
              )}
              {clubs.length > 0 && (
                <li><span className="font-semibold">Clubs & Committees:</span> {clubs.map((c) => `${c.clubName} (${c.role})`).join(", ")}</li>
              )}
              {exams.length > 0 && (
                <li><span className="font-semibold">Competitive Exams:</span> {exams.map((e) => `${e.examName} – ${e.score}`).join(", ")}</li>
              )}
              {achievements.length > 0 && (
                <li><span className="font-semibold">Achievements:</span> {achievements.map((a) => a.achievementName).join(", ")}</li>
              )}
            </ul>
          </Section>
        </>
      )}

      {/* Research Papers — static fallback only shown when no real data */}
      {projects.length === 0 && (
        <Section title="Research Papers">
          <div>
            <p className="font-semibold text-gray-800 text-xs mb-1">AI-Powered Student Performance Prediction Using Machine Learning Algorithms</p>
            <ul className="text-xs text-gray-600 space-y-0.5">
              <li className="flex gap-1.5"><span>•</span>Conducted research on predicting academic outcomes using Random Forest and Support Vector Machine (SVM) models.</li>
              <li className="flex gap-1.5"><span>•</span>Achieved an accuracy rate of 92.5% using optimized feature selection and dataset preprocessing.</li>
            </ul>
          </div>
        </Section>
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
      <ul className="text-xs text-gray-600 space-y-0.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-1.5"><span>•</span><span>{b}</span></li>
        ))}
      </ul>
    </div>
  );
}