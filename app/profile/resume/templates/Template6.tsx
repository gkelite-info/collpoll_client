"use client";

import { useUser } from "@/app/utils/context/UserContext";
import { fmtDate, ResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";


type Props = { data?: ResumeData | null };

// ── GK Elite Info SVG Logo (inline — no external image needed) ────────────────
function GKEliteLogo() {
    return (
        <div className="flex items-center gap-1.5">
            {/* Replicate the GK cyan/blue gradient logo shape */}
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="6" fill="#0a0a0a" />
                {/* G shape */}
                <path
                    d="M8 20 C8 13 13 8 20 8 C25 8 29 11 31 15 L26 15 C24.5 12.5 22.5 11.5 20 11.5 C15 11.5 11.5 15.2 11.5 20 C11.5 24.8 15 28.5 20 28.5 C23.5 28.5 26.5 26.5 27.5 23.5 L21 23.5 L21 20 L31 20 L31 32 L28 32 L27.5 29.5 C25.5 31.5 23 32.5 20 32.5 C13 32.5 8 27 8 20Z"
                    fill="url(#gkGrad)"
                />
                {/* K shape */}
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

export default function ResumeTemplate6({ data }: Props) {
    // ── Get profile photo from UserContext ────────────────────────────────────
    const { profilePhoto } = useUser();

    const p = data?.personal;
    const edu = data?.education ?? [];
    const groups = data?.skillGroups ?? [];
    const internships = data?.internships ?? [];
    const awards = data?.awards ?? [];
    const clubs = data?.clubs ?? [];
    const certs = data?.certifications ?? [];
    const exams = data?.exams ?? [];
    const langs = data?.languages ?? [];
    const summary = data?.summary ?? "";

    const initials = p?.fullName
        ? p.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "AR";

    return (
        <div
            className="bg-white font-sans text-sm px-10 py-8"
            style={{
                width: "794px",
                minHeight: "1123px",
                margin: "0 auto",
            }}
        >

            {/* ── Top strip: GK Elite Info logo left | empty right ── */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-100">
                <GKEliteLogo />
                {/* right side intentionally blank — mirrors Universal Business School layout */}
                <div />
            </div>

            {/* ── Header: name CENTERED, photo only if profilePhoto exists ── */}
            <div className="px-8 pt-5 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between gap-4">

                    {/* Left spacer — same width as photo area so name is truly centered */}
                    <div className="w-16 shrink-0" />

                    {/* Centered name block */}
                    <div className="flex-1 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {p?.fullName ?? "Aarav Reddy"}
                        </h1>
                        <p className="text-gray-500 text-xs mt-1">
                            {p?.workStatus ?? "B.A Graduate"} | Web Developer | Problem Solver
                        </p>
                    </div>

                    {/* Profile photo — shown ONLY if profilePhoto URL exists */}
                    {profilePhoto ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-gray-200">
                            <img
                                src={profilePhoto}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        /* Invisible placeholder to keep centering balanced */
                        <div className="w-16 shrink-0" />
                    )}
                </div>
            </div>

            {/* ── Profile Summary ── */}
            <div className="px-8 py-4 border-b border-gray-100">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Profile Summary</h2>
                <p className="text-gray-600 leading-relaxed text-xs">
                    {summary || "A Passionate Computer Science Student With A Strong Interest In Software Development And Problem-Solving. And Continuously Learn New Technologies To Grow As A Developer."}
                </p>
            </div>

            {/* ── Two-column layout (identical to Template 1) ── */}
            <div className="flex">

                {/* Left Column */}
                <div className="w-2/5 px-6 py-4 border-r border-gray-100 space-y-6">

                    {/* Personal Details */}
                    <div>
                        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Personal Details</h2>
                        <div className="space-y-1 text-gray-600 text-xs">
                            <p>{p?.email ?? "Aarav.Reddy@Gmail.Com"}</p>
                            <p>{p?.mobile ?? "+91 98765 43210"}</p>
                            {p?.linkedInId && <p className="break-all">{p.linkedInId}</p>}
                            <p>{p?.currentCity ?? "Hyderabad, Telangana"}</p>
                        </div>
                    </div>

                    {/* Education */}
                    <div>
                        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Education</h2>
                        <div className="space-y-3 text-xs">
                            {edu.length > 0 ? edu.map((e) => (
                                <div key={e.resumeEducationDetailId}>
                                    <p className="text-gray-500">{e.board ?? e.educationLevel}</p>
                                    <p className="font-medium text-gray-800">{e.institutionName}</p>
                                    <p className="text-gray-500">
                                        {e.startYear && e.endYear ? `${e.startYear} – ${e.endYear}` : e.yearOfPassing ?? ""}
                                    </p>
                                    {e.percentage != null && <p className="text-gray-500">{e.percentage}%</p>}
                                    {e.cgpa != null && <p className="text-gray-500">{e.cgpa} CGPA</p>}
                                </div>
                            )) : (
                                <>
                                    <div>
                                        <p className="text-gray-500">State Board Of Secondary Education</p>
                                        <p className="font-medium text-gray-800">Joseph's High School</p>
                                        <p className="text-gray-500">2018 - 2026</p>
                                        <p className="text-gray-500">88%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Under Graduate</p>
                                        <p className="font-medium text-gray-800">Malla Reddy Engineering College.</p>
                                        <p className="text-gray-500">2025 – 2028</p>
                                        <p className="text-gray-500">8.5</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Skills</h2>
                        <div className="text-xs space-y-3">
                            {groups.length > 0 ? groups.map((g) => (
                                <div key={g.categoryName}>
                                    <p className="font-semibold text-gray-800 mb-1">{g.categoryName}</p>
                                    <p className="text-gray-600">{g.skills.join(", ")}</p>
                                </div>
                            )) : (
                                <>
                                    <div>
                                        <p className="font-semibold text-gray-800 mb-1">Technical Skills</p>
                                        <p className="text-gray-600">HTML, CSS, JavaScript</p>
                                        <p className="text-gray-600">Python (Basics)</p>
                                        <p className="text-gray-600">SQL</p>
                                        <p className="text-gray-600">Web Development</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 mb-1">Soft Skills</p>
                                        <p className="text-gray-600">Communication</p>
                                        <p className="text-gray-600">Teamwork</p>
                                        <p className="text-gray-600">Problem Solving</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-3/5 px-6 py-4 space-y-6">

                    {/* Internship */}
                    <div>
                        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Internship</h2>
                        {internships.length > 0 ? internships.map((i) => (
                            <div key={i.resumeInternshipId} className="text-xs space-y-1 mb-3">
                                <p className="font-semibold text-gray-800">{i.organizationName.trim()}</p>
                                <p className="text-gray-600">{i.role}</p>
                                {i.projectName && <p className="text-gray-600">{i.projectName.trim()}</p>}
                                {i.location && <p className="text-gray-600">{i.location}</p>}
                                {i.domain && <p className="text-gray-600">{i.domain}</p>}
                                <p className="text-gray-500">{fmtDate(i.startDate)} - {fmtDate(i.endDate)}</p>
                                {i.projectUrl && <p className="text-blue-600 break-all">{i.projectUrl.trim()}</p>}
                            </div>
                        )) : (
                            <div className="text-xs space-y-1">
                                <p className="font-semibold text-gray-800">Google</p>
                                <p className="text-gray-600">Software Developer Intern</p>
                                <p className="text-gray-600">Internal Dashboard Optimization</p>
                                <p className="text-gray-600">Bangalore</p>
                                <p className="text-gray-600">Web Development</p>
                                <p className="text-gray-500">01/06/2024 - 31/08/2024</p>
                                <p className="text-blue-600 break-all">Https://Github.Com/Aaravreddy/Google-Internship</p>
                            </div>
                        )}
                    </div>

                    {/* Accomplishments */}
                    <div>
                        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Accomplishments</h2>
                        <div className="text-xs space-y-3">

                            {awards.length > 0 ? (
                                <div>
                                    <p className="font-semibold text-gray-800 mb-1">Awards</p>
                                    <ul className="text-gray-600 space-y-0.5">
                                        {awards.map((a) => (
                                            <li key={a.awardId} className="flex items-start gap-1">
                                                <span>•</span><span>{a.awardName} – {a.issuedBy}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-semibold text-gray-800 mb-1">Awards</p>
                                    <ul className="text-gray-600 space-y-0.5">
                                        <li className="flex items-start gap-1"><span>•</span><span>Best Project Award – Final Year Project</span></li>
                                        <li className="flex items-start gap-1"><span>•</span><span>Academic Excellence Award (2023)</span></li>
                                    </ul>
                                </div>
                            )}

                            {clubs.length > 0 ? (
                                <div>
                                    <p className="font-semibold text-gray-800 mb-1">Clubs & Committees</p>
                                    <ul className="text-gray-600 space-y-0.5">
                                        {clubs.map((c) => (
                                            <li key={c.resumeClubCommitteeId} className="flex items-start gap-1">
                                                <span>•</span><span>{c.clubName} – {c.role}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-semibold text-gray-800 mb-1">Clubs & Committees</p>
                                    <ul className="text-gray-600 space-y-0.5">
                                        <li className="flex items-start gap-1"><span>•</span><span>Technical Club Member</span></li>
                                        <li className="flex items-start gap-1"><span>•</span><span>College Coding Society</span></li>
                                    </ul>
                                </div>
                            )}

                            {certs.length > 0 ? (
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
                            ) : (
                                <div>
                                    <p className="font-semibold text-gray-800 mb-1">Certifications</p>
                                    <ul className="text-gray-600 space-y-0.5">
                                        <li className="flex items-start gap-1"><span>•</span><span>Python For Everybody – Coursera</span></li>
                                    </ul>
                                </div>
                            )}

                            {exams.length > 0 ? (
                                <div>
                                    <p className="font-semibold text-gray-800 mb-1">Competitive Exams</p>
                                    <ul className="text-gray-600 space-y-0.5">
                                        {exams.map((e) => (
                                            <li key={e.competitiveExamsId} className="flex items-start gap-1">
                                                <span>•</span><span>{e.examName} – Score: {e.score}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-semibold text-gray-800 mb-1">Competitive Exams</p>
                                    <ul className="text-gray-600 space-y-0.5">
                                        <li className="flex items-start gap-1"><span>•</span><span>GATE (Appeared)</span></li>
                                        <li className="flex items-start gap-1"><span>•</span><span>TCS CodeVita (Participant)</span></li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Languages */}
                    <div>
                        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Languages</h2>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                            {langs.length > 0 ? langs.map((l) => (
                                <li key={l} className="flex items-center gap-1"><span>•</span>{l}</li>
                            )) : (
                                <>
                                    <li className="flex items-center gap-1"><span>•</span>English</li>
                                    <li className="flex items-center gap-1"><span>•</span>Telugu</li>
                                    <li className="flex items-center gap-1"><span>•</span>Hindi</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}