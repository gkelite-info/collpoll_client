import { DownloadSimple, X } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import type { BonafideCertificate } from "./BonafideCertificatesTable";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";

const fallbackCertificate: BonafideCertificate = {
  bonafideNo: "BON/24-25/0001",
  admissionNo: "AD-2023-0012",
  studentName: "Arun Kumar",
  fatherName: "Suresh Kumar",
  rollNo: "23CS1056",
  educationType: "B.Tech",
  branch: "CSE",
  courseYear: "3rd Year",
  purpose: "Higher Studies",
  dateIssued: "20 May 2025",
  academicYear: "2024 - 2025",
  studentType: "Regular",
  conduct: "Good",
  status: "Issued",
};

function DetailsCard({
  title,
  rows,
}: {
  title: string;
  rows: string[][];
}) {
  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
      <h3 className="text-[14px] font-bold uppercase text-[#17213D]">{title}</h3>
      <div className="mt-4 flex flex-col gap-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-5">
            <span className="text-[11px] font-medium text-[#7B8AA3]">{label}</span>
            <span className="max-w-[130px] text-right text-[11px] font-bold text-[#17213D]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BonafideCertificateLayout({ details }: { details: BonafideCertificate }) {
  return (
    <div className="min-h-[530px] border-[3px] border-[#242424] p-8">
      <h2 className="text-center text-[28px] font-bold tracking-[0.04em]">
        BONAFIDE CERTIFICATE
      </h2>

      <div className="mt-12 text-[13px] leading-8">
        <p>
          This is to certify that Mr./Miss.{" "}
          <span className="inline-block min-w-[150px] border-b border-[#242424] px-3 text-center">
            {details.studentName}
          </span>{" "}
          S/o or D/o of Mr./Mrs.{" "}
          <span className="inline-block min-w-[150px] border-b border-[#242424] px-3 text-center">
            {details.fatherName ?? "-"}
          </span>{" "}
          bearing roll no{" "}
          <span className="inline-block min-w-[120px] border-b border-[#242424] px-3 text-center">
            {details.rollNo ?? "-"}
          </span>{" "}
          and admission no{" "}
          <span className="inline-block min-w-[120px] border-b border-[#242424] px-3 text-center">
            {details.admissionNo ?? "-"}
          </span>{" "}
          is a bonafide student of this school/college/institution and studied in Class{" "}
          <span className="inline-block min-w-[110px] border-b border-[#242424] px-3 text-center">
            {details.educationType}
          </span>{" "}
          studying{" "}
          <span className="inline-block min-w-[110px] border-b border-[#242424] px-3 text-center">
            {details.branch}
          </span>{" "}
          course for the academic year{" "}
          <span className="inline-block min-w-[110px] border-b border-[#242424] px-3 text-center">
            {details.academicYear ?? "-"}
          </span>
          .
        </p>
      </div>

      <div className="mt-12 text-[13px] leading-7">
        <p>Dated: {details.dateIssued}</p>
      </div>

      <div className="mt-6 text-right text-[12px] font-bold">
        <p>Signature Head of the</p>
        <p>Institution/School</p>
        <p className="mt-1 text-[10px] font-medium">(with Stamp)</p>
      </div>
    </div>
  );
}

export async function downloadBonafidePdf(details: BonafideCertificate) {
  const container = document.createElement("div");
  container.className = "w-[620px] mx-auto min-h-[540px] max-w-[620px] border border-[#242424] bg-white p-0.5 text-[#111827] absolute left-[-9999px] top-[-9999px]";
  document.body.appendChild(container);

  const root = createRoot(container);
  
  flushSync(() => {
    root.render(<BonafideCertificateLayout details={details} />);
  });

  try {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(container, {
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
    pdf.save(`${details.bonafideNo || "bonafide-certificate"}.pdf`);
  } catch (err) {
    console.error("Failed to generate PDF", err);
    throw err;
  } finally {
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(container);
    }, 0);
  }
}

export function BonafidePreviewScreen({
  certificate,
  onBackToEdit,
  onCancel,
}: {
  certificate: BonafideCertificate | null;
  onBackToEdit: () => void;
  onCancel: () => void;
}) {
  const details = certificate ?? fallbackCertificate;
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const studentDetails = [
    ["Roll No.", details.rollNo ?? "-"],
    ["Admission No.", details.admissionNo ?? "-"],
    ["Student Name", details.studentName],
    ["Father Name", details.fatherName ?? "-"],
    ["Course", details.educationType],
    ["Branch", details.branch],
    ["Course Year", details.courseYear ?? "-"],
    ["Academic Year", details.academicYear ?? "-"],
  ];
  const bonafideDetails = [
    ["Bonafide No.", details.bonafideNo],
    ["Date", details.dateIssued],
    ["Purpose", details.purpose],
    ["Student Type", details.studentType ?? "-"],
    ["Conduct", details.conduct ?? "-"],
  ];

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;

    setIsDownloading(true);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
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
      pdf.save(`${details.bonafideNo || "bonafide-certificate"}.pdf`);
    } catch (error) {
      console.error("Failed to download bonafide PDF", error);
      toast.error("Unable to download PDF right now.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
      <header className="flex items-start justify-between border-b border-[#E7ECF3] px-7 py-5">
        <div>
          <h1 className="text-[18px] font-bold text-[#17213D]">
            Preview Bonafide Certificate
          </h1>
          <p className="mt-1 text-[12px] font-medium text-[#7B8AA3]">
            Please verify the details below. You can download the certificate.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close preview"
          onClick={onCancel}
          className="cursor-pointer text-[#7B8AA3] hover:text-[#17213D]"
        >
          <X size={22} weight="regular" />
        </button>
      </header>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-md border border-[#DDE4EE] bg-white p-7">
          <div
            ref={certificateRef}
            className="mx-auto min-h-[540px] max-w-[620px] border border-[#242424] bg-white p-0.5 text-[#111827]"
          >
            <BonafideCertificateLayout details={details} />
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          <DetailsCard title="Student Details" rows={studentDetails} />
          <DetailsCard title="Bonafide Details" rows={bonafideDetails} />
        </aside>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E7ECF3] px-6 py-5">
        <button
          type="button"
          onClick={onBackToEdit}
          className="h-10 cursor-pointer rounded-md border border-[#43C17A] px-5 text-[13px] font-bold text-[#43C17A]"
        >
          Back to Edit
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 cursor-pointer rounded-md border border-[#DDE4EE] px-7 text-[13px] font-bold text-[#17213D]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-7 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#A8DEC0]"
          >
            <DownloadSimple size={16} weight="bold" />
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </footer>
    </div>
  );
}
