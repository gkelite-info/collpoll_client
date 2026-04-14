"use client";

import { useState, useEffect, useRef } from "react";
import ResumeTemplate1 from "./templates/Template1";
import ResumeTemplate2 from "./templates/Template2";
import ResumeTemplate3 from "./templates/Template3";
import ResumeTemplate4 from "./templates/Template4";
import ResumeTemplate5 from "./templates/Template5";
import ResumeTemplate6 from "./templates/Template6";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAllResumeData, ResumeData } from "@/lib/helpers/student/Resume/Resumedatafetcher";
import { generateResumePdf } from "@/lib/helpers/student/Resume/resumeDownloadAPI";
import { calculateATSScore, ATSResult } from "@/lib/helpers/student/Resume/atsScoreCalculator";

type Props = { onBack?: () => void };

const TEMPLATES = [
  { id: 1, name: "Classic Two-Column", component: ResumeTemplate1 },
  { id: 2, name: "Clean Professional", component: ResumeTemplate2 },
  { id: 3, name: "Gray Box Sections", component: ResumeTemplate3 },
  { id: 4, name: "Label Sidebar", component: ResumeTemplate4 },
  { id: 5, name: "Side Contact", component: ResumeTemplate5 },
  { id: 6, name: "GK Elite — Centered", component: ResumeTemplate6 },
];

const SRC_W = 672;
const CARD_W = 420;
const SCALE = CARD_W / SRC_W;
const CARD_H = Math.round(CARD_W * 1.414);

export default function ResumeTemplateSelector({ onBack }: Props) {
  const { studentId, profilePhoto } = useUser();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalId, setModalId] = useState<number | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [beforeDownloadScore, setBeforeDownloadScore] = useState<ATSResult | null>(null);
  const [afterDownloadScore, setAfterDownloadScore] = useState<ATSResult | null>(null);
  const [showATSModal, setShowATSModal] = useState(false);
  const [usedAI, setUsedAI] = useState(false);
  const [isDoneClosing, setIsDoneClosing] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("ats_before_score");
    if (stored) {
      try {
        setBeforeDownloadScore(JSON.parse(stored));
      } catch { }
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetchAllResumeData(studentId)
      .then((data) => {
        setResumeData(data);
      })
      .catch()
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setModalId(null); setDownloadOpen(false); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalId !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalId]);

  const handleDone = () => {
    setIsDoneClosing(true);
    setTimeout(() => {
      setShowATSModal(false);
      setIsDoneClosing(false);
    }, 600);
  };

  const handlePDF = async () => {
    try {
      setDownloadOpen(false);
      setIsPrinting(true);

      const element = printRef.current;
      if (!element) return;

      const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Resume</title>
          <script src="https://cdn.tailwindcss.com"><\/script>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `;

      const blob = await generateResumePdf(html);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      if (resumeData) {
        const afterScore = calculateATSScore(resumeData);
        setAfterDownloadScore(afterScore);

        const storedBefore = sessionStorage.getItem("ats_before_score");
        const parsedBefore: ATSResult | null = storedBefore
          ? JSON.parse(storedBefore)
          : null;

        if (parsedBefore) {
          setBeforeDownloadScore(parsedBefore);
        }


        const improved = parsedBefore != null
          ? afterScore.total > parsedBefore.total
          : false;

        setUsedAI(improved);
        setShowATSModal(true);

        sessionStorage.removeItem("ats_before_score");
      }

    } catch (error) {
    } finally {
      setIsPrinting(false);
    }
  };

  const handleWord = () => {
    setDownloadOpen(false);
    setIsDownloadingWord(true);
    if (!resumeData) { setIsDownloadingWord(false); return; }

    const p = resumeData.personal;
    const edu = resumeData.education ?? [];
    const groups = resumeData.skillGroups ?? [];
    const internships = resumeData.internships ?? [];
    const awards = resumeData.awards ?? [];
    const clubs = resumeData.clubs ?? [];
    const certs = resumeData.certifications ?? [];
    const exams = resumeData.exams ?? [];
    const langs = resumeData.languages ?? [];
    const summary = resumeData.summary ?? "";

    const sec = (title: string, body: string) => `
    <p style="font-family:Arial;font-size:8pt;font-weight:bold;text-transform:uppercase;
              letter-spacing:1pt;border-bottom:1pt solid #cccccc;padding-bottom:2pt;
              margin:10pt 0 5pt 0;color:#111111;">${title}</p>
    ${body}`;

    const txt = (content: string, bold = false, size = "9pt", color = "#444444") =>
      `<p style="font-family:Arial;font-size:${size};color:${color};margin:1pt 0;
               ${bold ? "font-weight:bold;" : ""}">${content}</p>`;

    const bullet = (content: string) =>
      `<p style="font-family:Arial;font-size:9pt;color:#444444;margin:1pt 0 1pt 10pt;">• ${content}</p>`;

    const eduHtml = edu.map((e) => `
    ${txt(e.board ?? e.educationLevel, false, "8pt", "#888888")}
    ${txt(e.institutionName, true, "9pt")}
    ${txt(e.startYear && e.endYear
      ? `${String(e.startYear)} – ${String(e.endYear)}`
      : String(e.yearOfPassing ?? ""), false, "8pt", "#888888")}
    ${e.percentage != null ? txt(`${String(e.percentage)}%`, false, "8pt", "#888888") : ""}
    ${e.cgpa != null ? txt(`${String(e.cgpa)} CGPA`, false, "8pt", "#888888") : ""}
    <p style="margin:3pt;"></p>
  `).join("");

    const skillsHtml = groups.map((g) => `
    ${txt(g.categoryName, true)}
    ${txt(g.skills.join(", "))}
    <p style="margin:3pt;"></p>
  `).join("");

    const internHtml = internships.map((i) => `
    ${txt(i.organizationName.trim(), true)}
    ${txt(i.role)}
    ${i.projectName ? txt(i.projectName.trim()) : ""}
    ${i.location ? txt(i.location) : ""}
    ${i.domain ? txt(i.domain) : ""}
    ${txt(`${String(i.startDate ?? "")} – ${String(i.endDate ?? "")}`, false, "8pt", "#888888")}
    ${i.projectUrl ? `<p style="font-family:Arial;font-size:9pt;color:#2563eb;margin:1pt 0;">${i.projectUrl}</p>` : ""}
    <p style="margin:4pt;"></p>
  `).join("");

    const awardsHtml = awards.length > 0
      ? `${txt("Awards", true)}` + awards.map((a) => bullet(`${a.awardName} – ${a.issuedBy}`)).join("")
      : `${txt("Awards", true)}${bullet("Best Project Award – Final Year")}`;

    const clubsHtml = clubs.length > 0
      ? `<p style="margin:4pt;"></p>${txt("Clubs & Committees", true)}` + clubs.map((c) => bullet(`${c.clubName} – ${c.role}`)).join("")
      : `<p style="margin:4pt;"></p>${txt("Clubs & Committees", true)}${bullet("Technical Club Member")}`;

    const certsHtml = certs.length > 0
      ? `<p style="margin:4pt;"></p>${txt("Certifications", true)}` + certs.map((c) => bullet(c.certificationName)).join("")
      : "";

    const examsHtml = exams.length > 0
      ? `<p style="margin:4pt;"></p>${txt("Competitive Exams", true)}` + exams.map((e) => bullet(`${e.examName} – Score: ${e.score}`)).join("")
      : "";

    const langsHtml = langs.length > 0
      ? langs.map((l) => bullet(l)).join("")
      : `${bullet("English")}${bullet("Telugu")}${bullet("Hindi")}`;

    const generateDoc = (photoBase64: string | null) => {
      const avatarHtml = photoBase64
        ? `<img src="${photoBase64}"
              width="56" height="56"
              style="width:56pt;height:56pt;object-fit:cover;border-radius:28pt;display:block;" />`
        : (() => {
          const initials = p?.fullName
            ?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() ?? "AR";
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56">
            <circle cx="28" cy="28" r="28" fill="#d1d5db"/>
            <text x="28" y="35" text-anchor="middle" font-family="Arial"
                  font-size="18" font-weight="bold" fill="#4b5563">${initials}</text>
          </svg>`;
          return `<img src="data:image/svg+xml;base64,${btoa(svg)}"
                       width="56" height="56"
                       style="width:56pt;height:56pt;display:block;" />`;
        })();

      const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Resume</title>
          <!--[if gte mso 9]><xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml><![endif]-->
          <style>
            @page { size: 21cm 29.7cm; margin: 1.5cm; }
            body { margin: 0; font-family: Arial, sans-serif; font-size: 9pt; }
            table { border-collapse: collapse; }
            td { vertical-align: top; padding: 0; }
            img { width: 56pt; height: 56pt; }
          </style>
        </head>
        <body>
          <table style="width:100%;">
            <tr>
              <td style="vertical-align:middle;">
                <p style="font-family:Arial;font-size:20pt;font-weight:bold;color:#111111;margin:0 0 2pt 0;">
                  ${p?.fullName ?? "Ashish Kumar"}
                </p>
                <p style="font-family:Arial;font-size:9pt;color:#666666;margin:0;">
                  ${p?.workStatus ?? "fresher"} | Web Developer | Problem Solver
                </p>
              </td>
              <td style="width:60pt;vertical-align:middle;text-align:right;">
                ${avatarHtml}
              </td>
            </tr>
          </table>
          <hr style="border:none;border-top:1pt solid #dddddd;margin:6pt 0 8pt 0;" />
          ${sec("Profile Summary", `
            <p style="font-family:Arial;font-size:9pt;color:#444444;line-height:1.5;margin:0 0 8pt 0;">
              ${summary || "Highly motivated backend developer with experience building scalable APIs."}
            </p>
          `)}
          <table style="width:100%;margin-top:4pt;">
            <tr>
              <td style="width:38%;padding-right:14pt;border-right:1pt solid #eeeeee;vertical-align:top;">
                ${sec("Personal Details", `
                  ${txt(p?.email ?? "")}
                  ${txt(p?.mobile ?? "")}
                  ${p?.linkedInId ? `<p style="font-family:Arial;font-size:9pt;color:#2563eb;margin:1pt 0;word-break:break-all;">${p.linkedInId}</p>` : ""}
                  ${txt(p?.currentCity ?? "Hyderabad")}
                `)}
                ${sec("Education", eduHtml)}
                ${sec("Skills", skillsHtml)}
              </td>
              <td style="width:62%;padding-left:14pt;vertical-align:top;">
                ${internHtml ? sec("Internship", internHtml) : ""}
                ${sec("Accomplishments", awardsHtml + clubsHtml + certsHtml + examsHtml)}
                ${sec("Languages", langsHtml)}
              </td>
            </tr>
          </table>
        </body>
      </html>`;

      const blob = new Blob(["\ufeff", docContent], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Resume.doc";
      a.click();
      URL.revokeObjectURL(url);
      setIsDownloadingWord(false);
    };

    
    if (resumeData) {
      const afterScore = calculateATSScore(resumeData);
      setAfterDownloadScore(afterScore);

      const storedBefore = sessionStorage.getItem("ats_before_score");
      const parsedBefore: ATSResult | null = storedBefore
        ? JSON.parse(storedBefore)
        : null;

      if (parsedBefore) {
        setBeforeDownloadScore(parsedBefore);
      }

      const improved = parsedBefore != null
        ? afterScore.total > parsedBefore.total
        : false;

      setUsedAI(improved);
      setShowATSModal(true);

      sessionStorage.removeItem("ats_before_score");
    }

    if (profilePhoto) {
      fetch(profilePhoto)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => generateDoc(reader.result as string);
          reader.readAsDataURL(blob);
        })
        .catch(() => generateDoc(null));
    } else {
      generateDoc(null);
    }
  };

  const ModalTemplate = modalId ? TEMPLATES.find(t => t.id === modalId)?.component : null;
  const modalTemplateName = modalId ? TEMPLATES.find(t => t.id === modalId)?.name : "";

  const closeModal = () => { setModalId(null); setDownloadOpen(false); };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #resume-print-area, #resume-print-area * { visibility: visible !important; }
          #resume-print-area {
            position: fixed !important;
            top: 0; left: 0; width: 100vw;
            z-index: 99999;
            box-shadow: none !important;
            background: white !important;
          }
        }
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
        }
      `}</style>

      <div className="bg-white min-h-screen rounded-2xl p-4">

        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-[#16284F]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-sm text-gray-400 font-medium">Loading resume data…</p>
            </div>
          </div>
        )}
        {!loading && (
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollSnapType: "x mandatory" }}>
            {TEMPLATES.map((t) => {
              const TC = t.component;
              return (
                <div
                  key={t.id}
                  className="shrink-0 group relative border-4 border-gray-200 hover:border-[#16284F] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg overflow-hidden"
                  style={{ width: CARD_W, height: CARD_H, scrollSnapAlign: "start" }}
                  onClick={() => { setModalId(t.id); setDownloadOpen(false); }}
                  title={t.name}
                >
                  <div
                    className="absolute top-0 left-0 origin-top-left pointer-events-none"
                    style={{ transform: `scale(${SCALE})`, width: `${SRC_W}px` }}
                  >
                    <TC data={resumeData} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-[#16284F]/0 group-hover:bg-[#16284F]/10 transition-all duration-200">
                    <span className="opacity-0 group-hover:opacity-100 transition-all bg-[#16284F] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                      Preview &amp; Download
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div> 
      {modalId !== null && ModalTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ width: "min(700px, 95vw)", maxHeight: "92vh" }}
          >
           
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-sm font-black text-[#16284F]">{modalTemplateName}</p>
                <p className="text-[10px] text-gray-400">Scroll to see full resume</p>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-100 p-5">
              <div
                id="resume-print-area"
                ref={printRef}
                className="bg-white"
                style={{ width: "794px", minHeight: "1123px", margin: "0 auto" }}
              >
                <ModalTemplate data={resumeData} />
              </div>
            </div>
            <div className="shrink-0 px-5 py-4 bg-white border-t border-gray-100">

              {downloadOpen && (
                <div className="flex gap-3 mb-3">

                  <button
                    onClick={handlePDF}
                    disabled={isPrinting}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-red-400 text-red-600 hover:bg-red-50 font-bold text-sm py-3 rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPrinting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Preparing PDF…
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21H5a2 2 0 01-2-2V5a2 2 0 012-2h10l4 4v4" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17v-2a2 2 0 00-2-2h-1a2 2 0 00-2 2v2m0 0v2m0-2h4m-4 2h4" />
                        </svg>
                        Download as PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleWord}
                    disabled={isDownloadingWord}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold text-sm py-3 rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isDownloadingWord ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Preparing Word…
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21H5a2 2 0 01-2-2V5a2 2 0 012-2h10l4 4v4M13 3v5h5M9 17l1.5-6L12 15l1.5-4L15 17" />
                        </svg>
                        Download as Word
                      </>
                    )}
                  </button>
                </div>
              )}
              <button
                onClick={() => setDownloadOpen((o) => !o)}
                disabled={isPrinting || isDownloadingWord}
                className="w-full bg-[#16284F] hover:bg-[#1d3566] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-white text-sm font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isPrinting || isDownloadingWord ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Preparing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                    </svg>
                    Download Resume
                    <svg
                      className={`w-4 h-4 ml-1 transition-transform ${downloadOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showATSModal && afterDownloadScore && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleDone(); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: "min(460px, 95vw)", maxHeight: "90vh", overflowY: "auto" }}
          >

            <div
              className="px-6 py-5 text-center relative"
              style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)" }}
            >
              <button
                onClick={handleDone}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {usedAI ? (
                <>
                  <div className="text-4xl mb-2" style={{ animation: "floatBob 2s ease-in-out infinite" }}>🎉</div>
                  <p className="text-white font-black text-xl tracking-tight">Congratulations!</p>
                  <p className="text-purple-200 text-xs mt-1 font-medium">AI enhanced your resume score</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-white font-black text-xl tracking-tight">Resume Downloaded!</p>
                  <p className="text-purple-200 text-xs mt-1 font-medium">Your resume is ready to go</p>
                </>
              )}
            </div>

            <div className="px-6 py-5">

              {usedAI && beforeDownloadScore ? (
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Before AI</p>
                    <div className="relative" style={{ width: 80, height: 80 }}>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#e9d5ff" strokeWidth="7" />
                        <circle
                          cx="40" cy="40" r="32"
                          fill="none"
                          stroke={beforeDownloadScore.color}
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 32}
                          strokeDashoffset={2 * Math.PI * 32 - (beforeDownloadScore.total / 100) * 2 * Math.PI * 32}
                          transform="rotate(-90 40 40)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black" style={{ color: beforeDownloadScore.color }}>
                          {beforeDownloadScore.total}
                        </span>
                        <span className="text-[8px] text-gray-400">/100</span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${beforeDownloadScore.color}20`, color: beforeDownloadScore.color }}
                    >
                      {beforeDownloadScore.label}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">→</span>
                    <span className="text-xs font-black text-green-500">
                      +{afterDownloadScore.total - beforeDownloadScore.total} pts
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">After AI</p>
                    <div className="relative" style={{ width: 80, height: 80 }}>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#e9d5ff" strokeWidth="7" />
                        <circle
                          cx="40" cy="40" r="32"
                          fill="none"
                          stroke={afterDownloadScore.color}
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 32}
                          strokeDashoffset={2 * Math.PI * 32 - (afterDownloadScore.total / 100) * 2 * Math.PI * 32}
                          transform="rotate(-90 40 40)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black" style={{ color: afterDownloadScore.color }}>
                          {afterDownloadScore.total}
                        </span>
                        <span className="text-[8px] text-gray-400">/100</span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${afterDownloadScore.color}20`, color: afterDownloadScore.color }}
                    >
                      {afterDownloadScore.label}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 mb-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your ATS Score</p>
                  <div className="relative" style={{ width: 96, height: 96 }}>
                    <svg width="96" height="96" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="38" fill="none" stroke="#e9d5ff" strokeWidth="8" />
                      <circle
                        cx="48" cy="48" r="38"
                        fill="none"
                        stroke={afterDownloadScore.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 - (afterDownloadScore.total / 100) * 2 * Math.PI * 38}
                        transform="rotate(-90 48 48)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black" style={{ color: afterDownloadScore.color }}>
                        {afterDownloadScore.total}
                      </span>
                      <span className="text-[9px] text-gray-400">/100</span>
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: `${afterDownloadScore.color}20`, color: afterDownloadScore.color }}
                  >
                    {afterDownloadScore.label}
                  </span>
                </div>
              )}

              {!usedAI && (
                <div
                  className="mb-5 rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #6d28d9 60%, #4c1d95 100%)" }}
                >
                  {/* Decorative blobs */}
                  <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
                    style={{ background: "rgba(167,139,250,0.15)", transform: "translate(35%,-35%)" }} />
                  <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full pointer-events-none"
                    style={{ background: "rgba(124,58,237,0.15)", transform: "translate(-35%,35%)" }} />

                  <div className="flex justify-center mb-3">
                    <div className="text-3xl" style={{ animation: "floatBob 2.5s ease-in-out infinite" }}>🤖</div>
                  </div>

                  <p className="text-white font-black text-sm text-center mb-1">
                    Your score can go even higher!
                  </p>
                  <p className="text-purple-200 text-[11px] text-center mb-4 leading-relaxed">
                    Students who use AI see an average of{" "}
                    <span className="text-yellow-300 font-bold">+15 pts</span> boost.
                  </p>

                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-full border-2 border-purple-400 flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.1)" }}>
                        <span className="text-white text-sm font-black">{afterDownloadScore.total}</span>
                      </div>
                      <span className="text-purple-300 text-[9px] font-semibold">Current</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-yellow-300 text-xl">✨</span>
                      <span className="text-purple-300 text-[9px]">with AI</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-14 h-14 rounded-full border-2 border-green-400 flex items-center justify-center"
                        style={{ background: "rgba(34,197,94,0.15)", animation: "pulseGlow 2s ease-in-out infinite" }}
                      >
                        <span className="text-green-300 text-sm font-black">
                          {Math.min(100, afterDownloadScore.total + 15)}+
                        </span>
                      </div>
                      <span className="text-green-300 text-[9px] font-semibold">Potential</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                      <span className="text-base shrink-0">✍️</span>
                      <span className="text-purple-100 text-[11px]">AI-powered summary tailored to your target role</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                      <span className="text-base shrink-0">🎯</span>
                      <span className="text-purple-100 text-[11px]">Skill gap analysis against real job descriptions</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                      <span className="text-base shrink-0">📈</span>
                      <span className="text-purple-100 text-[11px]">Keyword optimisation to pass ATS filters</span>
                    </div>
                  </div>
                </div>
              )}

              <div
                className="rounded-xl p-3 text-center text-xs font-semibold mb-4"
                style={{
                  background: usedAI ? "#f0fdf4" : "#faf7ff",
                  color: usedAI ? "#16a34a" : "#7c3aed",
                  border: `1px solid ${usedAI ? "#bbf7d0" : "#e9d5ff"}`,
                }}
              >
                {usedAI
                  ? afterDownloadScore.total >= 80
                    ? "🏆 Your resume is fully ATS-optimized and ready to impress recruiters!"
                    : afterDownloadScore.total >= 60
                      ? "💪 Great progress! Add more skills and a strong summary to push past 80."
                      : afterDownloadScore.total >= 40
                        ? "📈 You're on the right track. Use AI suggestions to boost your score further."
                        : "🚀 Add projects, skills, and a summary to significantly improve your ATS score."
                  : "🚀 Try AI enhancement — make your resume stand out to top recruiters!"}
              </div>

    
              <button
                onClick={handleDone}
                disabled={isDoneClosing}
                className="w-full bg-[#1e1b4b] hover:bg-[#2d2a6e] disabled:opacity-70 text-white text-sm font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isDoneClosing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Closing…
                  </>
                ) : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
