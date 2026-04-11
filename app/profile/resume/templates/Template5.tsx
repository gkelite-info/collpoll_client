"use client";

import { fmtDate, ResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";
import { ReactNode } from "react";


type Props = { data?: ResumeData | null };

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

  // Split name into two lines like the original "David\nAnderson"
  const nameParts = p?.fullName?.split(" ") ?? ["David", "Anderson"];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div
      className="bg-white font-sans text-sm px-10 py-8"
      style={{
        width: "794px",
        minHeight: "1123px",
        margin: "0 auto",
      }}
    >
      {/* Header with contact info on right */}
      <div className="flex justify-between items-start px-8 pt-8 pb-5 border-b-2 border-gray-800">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase leading-tight">
            {firstName}<br />{lastName}
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1 font-medium">
            {p?.workStatus ?? "B.A Graduate"} | Web Developer
          </p>
        </div>
        <div className="text-right text-xs text-gray-600 space-y-1 mt-1">
          <p>📞 {p?.mobile ?? "9012345678"}</p>
          <p>✉️ {p?.email ?? "davidanderson@gmail.com"}</p>
          <p>📍 {p?.currentCity ?? "Hyderabad, Telangana"}</p>
          {p?.linkedInId && <p>🔗 {p.linkedInId}</p>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* About Me */}
        <Section5 title="About Me">
          <p className="text-gray-700 text-xs leading-relaxed">
            {summary || "Results-driven Computer Science Engineering student with a strong foundation in software development, data structures, and web technologies. Skilled in full-stack development, problem-solving and collaborative project execution. Passionate about building efficient and scalable digital solutions. Eager to contribute technical expertise and creative ideas to innovative real-world projects that drive meaningful user experiences."}
          </p>
        </Section5>

        {/* Experience */}
        <Section5 title="Experience">
          <div className="space-y-4">
            {employment.length > 0 || internships.length > 0 ? (
              <>
                {employment.map((e) => (
                  <div key={e.employmentId}>
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-xs font-bold text-gray-900">{e.companyName.trim()}</p>
                      <span className="text-xs text-gray-400">{fmtDate(e.startDate)} – {fmtDate(e.endDate)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">{e.designation.trim()}</p>
                    {e.description && (
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        <li className="flex gap-1.5"><span>•</span>{e.description}</li>
                      </ul>
                    )}
                  </div>
                ))}
                {internships.map((i) => (
                  <div key={i.resumeInternshipId}>
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-xs font-bold text-gray-900">{i.organizationName.trim()}</p>
                      <span className="text-xs text-gray-400">{fmtDate(i.startDate)} – {fmtDate(i.endDate)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">{i.role}</p>
                    {i.description && (
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        <li className="flex gap-1.5"><span>•</span>{i.description}</li>
                      </ul>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <>
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="text-xs font-bold text-gray-900">Infosys Ltd, Bengaluru</p>
                    <span className="text-xs text-gray-400">2024 – 2024</span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    <li className="flex gap-1.5"><span>•</span>Developed and maintained scalable web applications using React.js, Node.js, and Express.</li>
                    <li className="flex gap-1.5"><span>•</span>Designed restful APIs to integrate backend services with front-end systems.</li>
                    <li className="flex gap-1.5"><span>•</span>Collaborated with cross-functional teams to implement new product features and fix critical bugs in production.</li>
                  </ul>
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="text-xs font-bold text-gray-900">TCS Digital Labs, Bengaluru</p>
                    <span className="text-xs text-gray-400">2024 – 2024</span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    <li className="flex gap-1.5"><span>•</span>Built a student performance tracking system using React.js and Firebase to visualize academic insights.</li>
                    <li className="flex gap-1.5"><span>•</span>Designed modular components and improved reusability by following component-driven architecture.</li>
                    <li className="flex gap-1.5"><span>•</span>Integrated Google APIs for authentication and cloud data sync, increasing reliability by 35%.</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </Section5>

        {/* Education */}
        <Section5 title="Education">
          <div className="space-y-3 text-xs">
            {edu.length > 0 ? edu.map((e) => (
              <div key={e.resumeEducationDetailId}>
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-gray-900">
                    {e.courseName ? `${e.courseName}${e.specialization ? ` – ${e.specialization}` : ""}` : e.educationLevel}
                  </p>
                  <span className="text-gray-500">
                    {e.startYear && e.endYear ? `${e.startYear} – ${e.endYear}` : e.yearOfPassing ?? ""}
                  </span>
                </div>
                <p className="text-gray-600">{e.institutionName}</p>
                {e.cgpa != null && <p className="text-gray-600">CGPA: {e.cgpa}</p>}
                {e.percentage != null && <p className="text-gray-600">Percentage: {e.percentage}%</p>}
              </div>
            )) : (
              <>
                <div>
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-gray-900">Bachelor Of Technology (B.Tech) CSE</p>
                    <span className="text-gray-500">2028-2026</span>
                  </div>
                  <p className="text-gray-600">RV College of Engineering, Bengaluru</p>
                  <p className="text-gray-600">Percentage : 85%</p>
                </div>
                <div>
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-gray-900">Senior Secondary (Class XII) – <em>MPC (Mathematics, Physics, Chemistry)</em></p>
                    <span className="text-gray-500">2028-2026</span>
                  </div>
                  <p className="text-gray-600">Narayana Junior College, Himayatnagar, Hyderabad, Telangana</p>
                  <p className="text-gray-600">Percentage : 63%</p>
                </div>
                <div>
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-gray-900">Secondary (Class X) – SSC</p>
                    <span className="text-gray-500">2028-2026</span>
                  </div>
                  <p className="text-gray-600">Sri Chaitanya High School, Dilsukhnagar, Hyderabad, Telangana</p>
                  <p className="text-gray-600">CGPA : 8.7%</p>
                </div>
              </>
            )}
          </div>
        </Section5>

        {/* Key Skills */}
        <Section5 title="Key Skills">
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
        </Section5>

        {/* Projects */}
        {projects.length > 0 && (
          <Section5 title="Projects">
            <div className="space-y-3 text-xs">
              {projects.map((proj) => (
                <div key={proj.resumeProjectId}>
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-gray-900">{proj.projectName}</p>
                    <span className="text-gray-500">{fmtDate(proj.startDate)}</span>
                  </div>
                  {proj.toolsAndTechnologies && proj.toolsAndTechnologies.length > 0 && (
                    <p className="text-gray-600">{proj.toolsAndTechnologies.join(", ")}</p>
                  )}
                  {proj.description && (
                    <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
                      <li className="flex gap-1.5"><span>•</span>{proj.description}</li>
                    </ul>
                  )}
                  {proj.projectUrl && <p className="text-xs text-blue-600 mt-1">🔗 {proj.projectUrl}</p>}
                </div>
              ))}
            </div>
          </Section5>
        )}

        {/* Additional Information */}
        <Section5 title="Additional Information">
          <ul className="text-xs text-gray-700 space-y-1">
            {langs.length > 0 ? (
              <li><span className="font-semibold">Languages:</span> {langs.join(", ")}</li>
            ) : (
              <li><span className="font-semibold">Programming Languages:</span> Python, Java, C++</li>
            )}
            {certs.length > 0 && <li><span className="font-semibold">Certifications:</span> {certs.map((c) => c.certificationName).join(", ")}</li>}
            {awards.length > 0 && <li><span className="font-semibold">Awards:</span> {awards.map((a) => `${a.awardName} – ${a.issuedBy}`).join(", ")}</li>}
            {clubs.length > 0 && <li><span className="font-semibold">Clubs:</span> {clubs.map((c) => `${c.clubName} (${c.role})`).join(", ")}</li>}
            {exams.length > 0 && <li><span className="font-semibold">Competitive Exams:</span> {exams.map((e) => `${e.examName} – ${e.score}`).join(", ")}</li>}
            {achievements.length > 0 && <li><span className="font-semibold">Achievements:</span> {achievements.map((a) => a.achievementName).join(", ")}</li>}
            {certs.length === 0 && langs.length === 0 && (
              <>
                <li><span className="font-semibold">Web Technologies:</span> HTML, CSS, JavaScript, React.js, Node.js</li>
                <li><span className="font-semibold">Databases:</span> MySQL, MongoDB</li>
                <li><span className="font-semibold">Tools & Platforms:</span> Git, VS Code, Postman, Figma, Linux</li>
                <li><span className="font-semibold">Soft Skills:</span> Analytical Thinking, Teamwork, Communication, Time Management</li>
              </>
            )}
          </ul>
        </Section5>
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