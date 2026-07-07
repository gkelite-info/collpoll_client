"use client";

import { CaretLeft, DownloadSimple, X, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import type { TransferCertificateData } from "./TransferCreateForm";
import type { HeaderConfig } from "./TransferUploadHeaderScreen";

function DetailsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 py-2 border-b border-[#E2E8F0] last:border-0">
      <span className="text-[12px] font-medium text-[#7B8AA3]">{label}</span>
      <span className="max-w-[200px] text-right text-[12px] font-bold text-[#17213D]">{value}</span>
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function TransferCertificateLayout({
  data,
  headerConfig,
  templateId,
}: {
  data: TransferCertificateData;
  headerConfig: HeaderConfig;
  templateId: number;
}) {
  const isTemplate1 = templateId === 1;
  const isTemplate2 = templateId === 2;
  const isTemplate3 = templateId === 3;
  const isImageTemplate = templateId >= 4;

  // For Image-based Templates (4, 5, 6), render the PNG templates directly without HTML text overlays
  if (isImageTemplate) {
    const imageNumber = templateId - 3; // 4 -> 1, 5 -> 2, 6 -> 3
    const bgUrl = `/tc%20template-${imageNumber}.png`;

    return (
      <div
        className="w-[620px] h-[876px] relative bg-white font-sans text-slate-900 rounded-none overflow-hidden select-none"
        style={{
          backgroundImage: `url('${bgUrl}')`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      />
    );
  }

  // Outer border styles: template 3 has double border, template 2 has no border, template 1 has solid thin border
  const containerClass = `w-[620px] min-h-[790px] relative bg-white font-sans text-slate-800 flex flex-col justify-between rounded-none p-10 pb-12 ${
    isTemplate3
      ? "border-[16px] border-double border-[#2C3E50]"
      : isTemplate2
      ? "border-0"
      : "border-[2px] border-solid border-slate-400"
  }`;

  return (
    <div className={containerClass}>
      <div>
        {/* HEADER SECTION */}
        {isTemplate1 ? (
          /* Template 1 Standard Flat Header */
          <div className="text-center border-b border-slate-200 pb-3 mb-5 flex flex-col items-center">
            {headerConfig.logoUrl ? (
              <img src={headerConfig.logoUrl} alt="College Logo" className="w-16 h-16 object-contain mb-2" />
            ) : (
              <div className="w-16 h-16 rounded-full border border-slate-300 flex items-center justify-center bg-slate-50 mb-2 overflow-hidden">
                <svg className="w-10 h-10 text-slate-300" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            )}
            <h2 className="text-[16px] font-extrabold tracking-wide uppercase text-slate-900 leading-tight">
              {headerConfig.collegeName}
            </h2>
            <p className="text-[9px] text-slate-500 font-bold mt-1 italic">
              {headerConfig.affiliation}
            </p>
            <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
              {headerConfig.address}
            </p>
            <p className="text-[9px] text-slate-800 font-bold mt-0.5">
              Ph : {headerConfig.phone}
            </p>
          </div>
        ) : (
          /* Template 2 & 3 Arched Header */
          <div className="text-center pb-3 flex flex-col items-center">
            {/* Arched College Name using SVG curved text - peak y=10 to prevent viewport clipping */}
            <div className="w-full flex justify-center -mb-8">
              <svg viewBox="0 0 500 100" className="w-[460px] h-20">
                <path id="headerCurve" d="M 45 90 Q 250 10 455 90" fill="transparent" />
                <text className="text-[11px] font-black fill-[#E11D48] tracking-widest uppercase">
                  <textPath href="#headerCurve" startOffset="50%" textAnchor="middle">
                    {headerConfig.collegeName}
                  </textPath>
                </text>
              </svg>
            </div>

            {/* Logo Badge */}
            {headerConfig.logoUrl ? (
              <img src={headerConfig.logoUrl} alt="College Logo" className="w-16 h-16 object-contain mb-2 z-10" />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-double border-slate-400 flex items-center justify-center bg-slate-50 mb-2 overflow-hidden z-10">
                <svg className="w-10 h-10 text-slate-400" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            )}

            {/* Affiliation / Board */}
            <p className="text-[8px] text-slate-500 font-bold mt-1 italic leading-tight">
              {headerConfig.affiliation}
            </p>
            <p className="text-[8px] text-slate-500 font-semibold mt-0.5 leading-tight">
              {headerConfig.address}
            </p>
            <p className="text-[8px] text-slate-800 font-bold mt-0.5 leading-tight">
              Ph : {headerConfig.phone}
            </p>

            {/* Separator Bar */}
            <div className="w-full h-0.5 bg-[#2563EB]/40 my-3"></div>
          </div>
        )}

        {/* Decorative separator symbol for Template 1 */}
        {isTemplate1 && (
          <div className="w-full flex items-center justify-center my-3 text-slate-400 gap-2">
            <span className="h-[1px] bg-slate-200 flex-1"></span>
            <span className="text-[10px]">✸</span>
            <span className="h-[1px] bg-slate-200 flex-1"></span>
          </div>
        )}

        {/* Certificate Title */}
        {isTemplate1 ? (
          <h1 className="text-center text-[20px] font-extrabold tracking-[0.08em] underline underline-offset-4 decoration-2 text-slate-950 mb-6 uppercase">
            TRANSFER CERTIFICATE
          </h1>
        ) : (
          /* Red Bordered Box Title for Template 2 & 3 */
          <div className="flex justify-center my-4">
            <div className="border-2 border-[#E11D48] px-8 py-1 text-[#E11D48] font-black text-[13px] tracking-widest uppercase">
              TRANSFER CERTIFICATE
            </div>
          </div>
        )}

        {/* TC & Roll No. Info Row */}
        <div className="flex justify-between items-center text-[12px] font-bold text-slate-700 mb-6">
          <div className="flex gap-1.5">
            <span>T.C. No.</span>
            <span className="text-[#E11D48]">{data.tcNo}</span>
          </div>
          <div className="flex gap-6">
            <div className="flex gap-1.5">
              <span>Roll No.</span>
              <span className="text-[#E11D48]">{data.rollNo}</span>
            </div>
            <div>
              <span>Date :</span>
              <span className="text-slate-900 ml-1">{formatDate(data.date)}</span>
            </div>
          </div>
        </div>

        {/* LINE ITEMS SECTION (1 to 9 with underlines) */}
        <div className="text-[12px] leading-8 flex flex-col gap-2.5">
          <div className="flex items-end border-b border-slate-200 pb-0.5 w-full">
            <span className="w-[300px] font-semibold text-slate-700">1. Name :</span>
            <span className="flex-1 font-bold text-slate-950 uppercase pl-4">{data.studentName}</span>
          </div>

          <div className="flex items-end border-b border-slate-200 pb-0.5 w-full">
            <span className="w-[300px] font-semibold text-slate-700">2. Father's Name :</span>
            <span className="flex-1 font-bold text-slate-950 uppercase pl-4">{data.fatherName}</span>
          </div>

          <div className="flex items-end border-b border-slate-200 pb-0.5 w-full">
            <span className="w-[300px] font-semibold text-slate-700">3. Date of Birth :</span>
            <span className="flex-1 font-bold text-slate-950 pl-4">{formatDate(data.dateOfBirth)}</span>
          </div>

          <div className="flex items-end border-b border-slate-200 pb-0.5 w-full">
            <span className="w-[300px] font-semibold text-slate-700">4. Date of Admission & Class :</span>
            <span className="flex-1 font-bold text-slate-900 pl-4">{formatDate(data.dateOfAdmission)} and {data.classAtLeaving}</span>
          </div>

          <div className="flex items-end border-b border-slate-200 pb-0.5 w-full">
            <span className="w-[300px] font-semibold text-slate-700">5. Date of Leaving & Class :</span>
            <span className="flex-1 font-bold text-slate-900 pl-4">{formatDate(data.dateOfLeaving)} and {data.classAtLeaving}</span>
          </div>

          <div className="flex items-end border-b border-slate-200 pb-0.5 w-full">
            <span className="w-[300px] font-semibold text-slate-700">6. Reason for Leaving & Class :</span>
            <span className="flex-1 font-bold text-slate-900 pl-4">{data.reasonForLeaving}</span>
          </div>

          <div className="flex items-end border-b border-slate-200 pb-0.5 w-full">
            <span className="w-[300px] font-semibold text-slate-700">7. Whether the Candidate belongs to SC / ST / BC :</span>
            <span className="flex-1 font-bold text-slate-900 pl-4">{data.belongsToScStBc}</span>
          </div>

          <div className="flex items-end border-b border-slate-200 pb-0.5 w-full">
            <span className="w-[300px] font-semibold text-slate-700">8. Whether the Candidate is in receipt of any Scholarship :</span>
            <span className="flex-1 font-bold text-slate-900 pl-4">{data.receiptOfScholarship}</span>
          </div>

          <div className="flex items-end border-b border-slate-200 pb-0.5 w-full">
            <span className="w-[300px] font-semibold text-slate-700">9. General Remarks and Conduct :</span>
            <span className="flex-1 font-bold text-slate-950 pl-4">{data.conductRemarks}</span>
          </div>

          {data.otherRemarks && (
            <div className="flex items-end border-b border-slate-200 pb-0.5 w-full">
              <span className="w-[300px] font-semibold text-slate-700">10. Any other Remarks :</span>
              <span className="flex-1 font-medium text-slate-700 italic pl-4">{data.otherRemarks}</span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER SIGNATURE & SEAL SECTION */}
      <div className="mt-14 flex justify-between items-end text-[11px] font-bold text-slate-800 border-t border-slate-200 pt-6 relative">
        {isTemplate1 ? (
          /* Template 1 Footer Layout */
          <>
            <div className="flex flex-col gap-1">
              <p>Place : <span className="font-bold text-slate-950">RATNAPURI</span></p>
              <p>Date : <span className="font-bold text-slate-950">{formatDate(data.date)}</span></p>
            </div>

            {/* Circular Stamp */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-purple-400/80 flex flex-col items-center justify-center text-[7px] font-bold text-purple-400/90 uppercase tracking-tight leading-none rotate-[-6deg] absolute bottom-4 left-[150px] pointer-events-none select-none bg-white/20">
              <span>TURKALA</span>
              <span>KHANAPUR</span>
              <span className="text-[6px] border-t border-purple-300/50 mt-1 pt-0.5">RATNAPURI</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-6"></div>
              <p className="tracking-wide">Signature of Principal</p>
              <p className="text-[9px] font-medium text-slate-500 mt-0.5">(With Stamp and Seal)</p>
            </div>
          </>
        ) : (
          /* Template 2 & 3 Detailed Footer Layout */
          <>
            <div className="flex flex-col gap-1.5 text-[9px] font-bold text-slate-700 text-left">
              <p>Place : <span className="font-bold text-slate-950">RATNAPURI</span></p>
              <p>Date : <span className="font-bold text-slate-950">{formatDate(data.date)}</span></p>
              <div className="mt-3 flex flex-col gap-1">
                <div>Prepared by : <span className="inline-block w-20 border-b border-slate-300"></span></div>
                <div>Verified by : <span className="inline-block w-20 border-b border-slate-300"></span></div>
                <div>Date of Issue : <span className="inline-block w-20 border-b border-slate-300"></span></div>
              </div>
            </div>

            {/* Circular Stamp centered */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-purple-400/80 flex flex-col items-center justify-center text-[7px] font-bold text-purple-400/90 uppercase tracking-tight leading-none rotate-[-6deg] absolute bottom-4 left-[165px] pointer-events-none select-none bg-white/20">
              <span>TURKALA</span>
              <span>KHANAPUR</span>
              <span className="text-[6px] border-t border-purple-300/50 mt-1 pt-0.5">RATNAPURI</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              {/* Signature principal box */}
              <div className="border border-slate-300 p-2 px-4 rounded bg-slate-50/50 flex flex-col items-center justify-center min-w-[130px] text-center">
                <div className="h-4"></div>
                <p className="text-[9px] font-extrabold text-slate-800 tracking-wider">Principal</p>
                <p className="text-[8px] font-medium text-slate-500 leading-none mt-0.5">(Signature with Seal)</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TransferPreviewScreen({
  data,
  headerConfig,
  onBack,
  onCancel,
  onGenerate,
}: {
  data: TransferCertificateData;
  headerConfig: HeaderConfig;
  onBack: () => void;
  onCancel: () => void;
  onGenerate: (isDraft: boolean) => void;
}) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [templateId, setTemplateId] = useState(1);

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const y = Math.max(margin, (pageHeight - imageHeight) / 2);

      pdf.addImage(imageData, "PNG", margin, y, imageWidth, imageHeight);
      pdf.save(`${data.tcNo || "transfer-certificate"}-template-${templateId}.pdf`);
      toast.success("PDF generated and downloaded successfully!");
      onGenerate(false); // trigger parent generate flow
    } catch (error) {
      console.error("Failed to download transfer certificate PDF", error);
      toast.error("Unable to download PDF right now.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNextTemplate = () => {
    setTemplateId((prev) => (prev === 6 ? 1 : prev + 1));
    toast.success(`Switched to Template ${templateId === 6 ? 1 : templateId + 1}`);
  };

  const handlePrevTemplate = () => {
    setTemplateId((prev) => (prev === 1 ? 6 : prev - 1));
    toast.success(`Switched to Template ${templateId === 1 ? 6 : templateId - 1}`);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Breadcrumb Header with caret back button */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-center gap-4 text-[24px] font-bold leading-tight md:text-[28px]">
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer text-[#7B8AA3] hover:text-[#17213D] transition-colors p-1"
              aria-label="Back to Edit"
            >
              <CaretLeft size={24} weight="bold" />
            </button>
            <span className="text-[#17213D]">Transfer Certificate Preview</span>
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#7B8AA3]">
            Please review details and choose template before downloading.
          </p>
        </div>
      </section>

      {/* Main Grid containing Sidebar and Certificate Page */}
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
        {/* Sidebar Info Area */}
        <aside className="flex flex-col gap-5">
          {/* Certificate Details Card */}
          <section className="rounded-md border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-2 mb-3">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#17213D]">
                Certificate Details
              </h3>
              <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                Template {templateId}
              </span>
            </div>
            <div className="flex flex-col text-[11px]">
              <DetailsRow label="TC No." value={data.tcNo} />
              <DetailsRow label="Date" value={formatDate(data.date)} />
              <DetailsRow label="Admission No." value={data.admissionNo} />
              <DetailsRow label="Roll No." value={data.rollNo} />
              <DetailsRow label="Student Name" value={data.studentName} />
              <DetailsRow label="Course" value={data.course} />
              <DetailsRow label="Branch / Sub Course" value={data.subCourse} />
              <DetailsRow label="Course Year" value={data.courseYear} />
              <DetailsRow label="Date of Admission" value={formatDate(data.dateOfAdmission)} />
              <DetailsRow label="Date of Leaving" value={formatDate(data.dateOfLeaving)} />
              <DetailsRow label="Reason for Leaving" value={data.reasonForLeaving} />
              <DetailsRow label="Conduct / Remarks" value={data.conductRemarks} />
              <DetailsRow label="Belongs to" value={data.belongsToScStBc} />
              <DetailsRow label="Scholarship Received" value={data.receiptOfScholarship} />
            </div>
          </section>

          {/* Info notice banner */}
          <div className="flex items-start gap-2.5 rounded-md bg-[#EFF6FF] p-4 text-[#1E40AF]">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[11px] font-semibold leading-normal">
              This is how the Transfer Certificate will appear after downloading.
            </span>
          </div>
        </aside>

        {/* Certificate Display Area & Buttons Column */}
        <div className="flex flex-col gap-6">
          {/* Certificate display wrapper with NO outer border */}
          <section className="rounded-md bg-[#F1F3F7] p-8 flex justify-center items-center overflow-auto">
            <div
              ref={certificateRef}
              className=""
            >
              <TransferCertificateLayout data={data} headerConfig={headerConfig} templateId={templateId} />
            </div>
          </section>

          {/* Actions Footer below the certificate display */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 cursor-pointer rounded-md border border-[#DDE4EE] bg-white px-7 text-[13px] font-bold text-[#17213D] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handlePrevTemplate}
              className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#16284F] bg-white px-6 text-[13px] font-bold text-[#16284F] hover:bg-slate-50 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              Prev Template
            </button>

            <button
              type="button"
              onClick={handleNextTemplate}
              className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#16284F] bg-white px-6 text-[13px] font-bold text-[#16284F] hover:bg-slate-50 transition-all cursor-pointer"
            >
              Next Template
              <ArrowRight size={16} />
            </button>
            
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#43C17A] px-7 text-[13px] font-bold text-white hover:bg-[#349c61] transition-all cursor-pointer shadow-[0_4px_12px_rgba(67,193,122,0.15)] disabled:bg-[#A8DEC0] disabled:cursor-not-allowed"
            >
              <DownloadSimple size={16} weight="bold" />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
