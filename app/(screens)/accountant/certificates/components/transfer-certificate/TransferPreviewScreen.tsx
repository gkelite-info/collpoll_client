"use client";

import { CaretLeft, DownloadSimple, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import Image from "next/image";

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

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatPlace(address: string) {
  const trimmedAddress = address.trim();
  return trimmedAddress || "-";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getImageFormat(dataUrl: string) {
  return dataUrl.includes("image/jpeg") || dataUrl.includes("image/jpg") ? "JPEG" : "PNG";
}

async function imageUrlToDataUrl(url?: string) {
  if (!url) return null;

  const source =
    /^https?:\/\//i.test(url)
      ? `/api/image-proxy?url=${encodeURIComponent(url)}`
      : url;

  try {
    const response = await fetch(source);
    if (!response.ok) return null;

    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function setText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: {
    align?: "left" | "center" | "right";
    color?: [number, number, number];
    fontSize?: number;
    fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
    maxWidth?: number;
  },
) {
  pdf.setFont("helvetica", options?.fontStyle ?? "normal");
  pdf.setFontSize(options?.fontSize ?? 10);
  const color = options?.color ?? [15, 23, 42];
  pdf.setTextColor(color[0], color[1], color[2]);
  pdf.text(text || "-", x, y, {
    align: options?.align ?? "left",
    maxWidth: options?.maxWidth,
  });
}

function drawCenteredWrappedText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  options?: Parameters<typeof setText>[4],
) {
  const lines = pdf.splitTextToSize(text || "-", maxWidth);
  lines.forEach((line: string, index: number) => {
    setText(pdf, line, x, y + index * lineHeight, {
      ...options,
      align: "center",
    });
  });

  return y + lines.length * lineHeight;
}

function drawStarSeparator(pdf: jsPDF, x: number, y: number, width: number) {
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.25);
  pdf.line(x, y, x + width * 0.47, y);
  pdf.line(x + width * 0.53, y, x + width, y);
  setText(pdf, "*", x + width / 2, y + 1.5, {
    align: "center",
    color: [100, 116, 139],
    fontSize: 10,
    fontStyle: "bold",
  });
}

async function addPdfImage(
  pdf: jsPDF,
  imageUrl: string | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const dataUrl = await imageUrlToDataUrl(imageUrl);
  if (!dataUrl) return false;

  pdf.addImage(dataUrl, getImageFormat(dataUrl), x, y, width, height);
  return true;
}

async function addPdfLogoImage(
  pdf: jsPDF,
  imageUrl: string | undefined,
  x: number,
  y: number,
  size: number,
) {
  const dataUrl = await imageUrlToDataUrl(imageUrl);
  if (!dataUrl) return false;

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  const canvasSize = 256;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    pdf.addImage(dataUrl, getImageFormat(dataUrl), x, y, size, size);
    return true;
  }

  const minSide = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const sx = ((image.naturalWidth || image.width) - minSide) / 2;
  const sy = ((image.naturalHeight || image.height) - minSide) / 2;

  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(image, sx, sy, minSide, minSide, 0, 0, canvasSize, canvasSize);
  ctx.restore();

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, size, size);
  return true;
}

async function drawPdfHeader(
  pdf: jsPDF,
  headerConfig: HeaderConfig,
  x: number,
  y: number,
  width: number,
  options?: {
    logoSize?: number;
    titleSize?: number;
    detailSize?: number;
    titleColor?: [number, number, number];
    titleUppercase?: boolean;
  },
) {
  const centerX = x + width / 2;
  const logoSize = options?.logoSize ?? 30;
  const titleSize = options?.titleSize ?? 14;
  const detailSize = options?.detailSize ?? 8.5;
  const title = options?.titleUppercase === false
    ? headerConfig.collegeName
    : headerConfig.collegeName.toUpperCase();

  await addPdfLogoImage(pdf, headerConfig.logoUrl, centerX - logoSize / 2, y, logoSize);
  const afterTitle = drawCenteredWrappedText(
    pdf,
    title,
    centerX,
    y + logoSize + 7,
    width - 26,
    5,
    {
      color: options?.titleColor ?? [15, 23, 42],
      fontSize: titleSize,
      fontStyle: "bold",
    },
  );

  let nextY = afterTitle + 2.5;
  setText(pdf, headerConfig.affiliation, centerX, nextY, {
    align: "center",
    color: [71, 85, 105],
    fontSize: detailSize,
    fontStyle: "bolditalic",
  });
  nextY += 5;

  if (headerConfig.address) {
    nextY = drawCenteredWrappedText(pdf, headerConfig.address, centerX, nextY, width - 32, 4, {
      color: [71, 85, 105],
      fontSize: detailSize,
      fontStyle: "normal",
    }) + 1;
  }

  if (headerConfig.phone) {
    setText(pdf, `Ph : ${headerConfig.phone}`, centerX, nextY + 3, {
      align: "center",
      color: [15, 23, 42],
      fontSize: detailSize + 0.5,
      fontStyle: "bold",
    });
  }
}

function drawPdfRows(
  pdf: jsPDF,
  rows: Array<[string, string]>,
  x: number,
  y: number,
  width: number,
  options?: {
    labelWidth?: number;
    rowHeight?: number;
    fontSize?: number;
  },
) {
  const labelWidth = options?.labelWidth ?? 72;
  const rowHeight = options?.rowHeight ?? 11;
  const fontSize = options?.fontSize ?? 8;

  rows.forEach(([label, value], index) => {
    const rowY = y + index * rowHeight;
    setText(pdf, label, x, rowY, {
      color: [30, 41, 59],
      fontSize,
      fontStyle: "bold",
      maxWidth: labelWidth - 4,
    });
    setText(pdf, value || "-", x + labelWidth, rowY, {
      color: [2, 6, 23],
      fontSize,
      fontStyle: "normal",
      maxWidth: width - labelWidth,
    });
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.2);
    pdf.line(x, rowY + 4.3, x + width, rowY + 4.3);
  });
}

function drawPdfImageTemplateMask(
  pdf: jsPDF,
  imageNumber: number,
  certX: number,
  certY: number,
  certWidth: number,
  certHeight: number,
) {
  const scaleX = certWidth / 620;
  const scaleY = certHeight / 876;
  const bounds =
    imageNumber === 3
      ? { left: 72, top: 42, right: 72, bottom: 74, fill: [247, 248, 241] as [number, number, number] }
      : imageNumber === 2
      ? { left: 64, top: 58, right: 64, bottom: 50 }
      : { left: 66, top: 58, right: 66, bottom: 66 };

  pdf.setFillColor(...(bounds.fill ?? [255, 253, 233]));
  pdf.rect(
    certX + bounds.left * scaleX,
    certY + bounds.top * scaleY,
    (620 - bounds.left - bounds.right) * scaleX,
    (876 - bounds.top - bounds.bottom) * scaleY,
    "F",
  );
}

async function generateTransferCertificatePdf({
  data,
  headerConfig,
  templateId,
}: {
  data: TransferCertificateData;
  headerConfig: HeaderConfig;
  templateId: number;
}) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const certX = 12;
  const certY = 8;
  const certWidth = pageWidth - 24;
  const certHeight = pageHeight - 16;
  const footerDate = formatDate(getTodayIsoDate());
  const footerPlace = formatPlace(headerConfig.address);
  let footerX = certX + 15;
  let footerRightX = certX + certWidth - 16;
  let footerY = certY + certHeight - 38;

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  const rows: Array<[string, string]> = [
    ["1. Name :", data.studentName],
    ["2. Father's Name :", data.fatherName],
    ["3. Date of Birth :", formatDate(data.dateOfBirth)],
    ["4. Date of Admission & Class :", `${formatDate(data.dateOfAdmission)} and ${data.classAtLeaving}`],
    ["5. Date of Leaving & Class :", `${formatDate(data.dateOfLeaving)} and ${data.classAtLeaving}`],
    ["6. Reason for Leaving & Class :", data.reasonForLeaving],
    ["7. Whether the Candidate belongs to SC / ST / BC :", data.belongsToScStBc],
    ["8. Whether the Candidate is in receipt of any Scholarship :", data.receiptOfScholarship],
    ["9. General Remarks and Conduct :", data.conductRemarks],
  ];

  if (templateId >= 4) {
    const imageNumber = templateId - 3;
    await addPdfImage(pdf, `/tc%20template-${imageNumber}.png`, certX, certY, certWidth, certHeight);
    drawPdfImageTemplateMask(pdf, imageNumber, certX, certY, certWidth, certHeight);

    const contentX = certX + (imageNumber === 3 ? 34 : 36);
    const contentWidth = certWidth - (imageNumber === 3 ? 68 : 72);
    const headerY = certY + (imageNumber === 1 ? 26 : imageNumber === 2 ? 30 : 20);
    const metaY = certY + (imageNumber === 3 ? 86 : 92);
    const titleY = certY + (imageNumber === 3 ? 102 : 116);
    const rowsY = certY + (imageNumber === 3 ? 124 : 128);
    footerX = contentX;
    footerRightX = contentX + contentWidth;
    footerY = certY + certHeight - (imageNumber === 3 ? 46 : 52);

    await drawPdfHeader(pdf, headerConfig, contentX, headerY, contentWidth, {
      logoSize: imageNumber === 3 ? 22 : 30,
      titleSize: imageNumber === 3 ? 10 : 14,
      detailSize: imageNumber === 3 ? 6.5 : 8,
      titleColor: imageNumber === 3 ? [15, 23, 42] : [225, 29, 72],
    });
    setText(pdf, "T.C. No.", contentX, metaY, {
      color: [15, 23, 42],
      fontSize: 8.5,
      fontStyle: "bold",
    });
    setText(pdf, data.tcNo, contentX + 19, metaY, {
      color: [225, 29, 72],
      fontSize: 8.5,
      fontStyle: "normal",
    });
    setText(pdf, `Date : ${formatDate(data.date)}`, contentX + contentWidth, metaY, {
      align: "right",
      color: [15, 23, 42],
      fontSize: 8.5,
      fontStyle: "bold",
    });
    setText(pdf, "TRANSFER CERTIFICATE", certX + certWidth / 2, titleY, {
      align: "center",
      color: [225, 29, 72],
      fontSize: 15,
      fontStyle: "bold",
    });
    drawPdfRows(pdf, rows, contentX, rowsY, contentWidth, {
      labelWidth: imageNumber === 3 ? 78 : 86,
      rowHeight: imageNumber === 3 ? 10.8 : 9.8,
      fontSize: imageNumber === 3 ? 7 : 7.4,
    });
  } else {
    if (templateId === 3) {
      pdf.setDrawColor(44, 62, 80);
      pdf.setLineWidth(2.2);
      pdf.rect(certX, certY, certWidth, certHeight);
      pdf.setLineWidth(0.8);
      pdf.rect(certX + 4, certY + 4, certWidth - 8, certHeight - 8);
    } else if (templateId === 1) {
      pdf.setDrawColor(148, 163, 184);
      pdf.setLineWidth(0.9);
      pdf.rect(certX, certY, certWidth, certHeight);
    }

    const innerX = certX + 15;
    const innerWidth = certWidth - 30;

    await drawPdfHeader(pdf, headerConfig, innerX, certY + 12, innerWidth, {
      logoSize: 30,
      titleSize: 14,
      detailSize: 8,
      titleColor: templateId === 1 ? [15, 23, 42] : [225, 29, 72],
    });

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.35);
    pdf.line(innerX, certY + 74, innerX + innerWidth, certY + 74);
    drawStarSeparator(pdf, innerX, certY + 82, innerWidth);

    setText(pdf, "TRANSFER CERTIFICATE", certX + certWidth / 2, certY + 96, {
      align: "center",
      color: templateId === 1 ? [2, 6, 23] : [225, 29, 72],
      fontSize: 14,
      fontStyle: "bold",
    });
    pdf.setDrawColor(2, 6, 23);
    pdf.setLineWidth(0.5);
    pdf.line(certX + certWidth / 2 - 32, certY + 99, certX + certWidth / 2 + 32, certY + 99);

    const topInfoY = certY + 115;
    const tcX = innerX;
    const rollX = innerX + innerWidth * 0.48;
    const dateX = innerX + innerWidth;

    setText(pdf, "T.C. No.", tcX, topInfoY, { fontSize: 8, fontStyle: "bold" });
    setText(pdf, data.tcNo, tcX + 17, topInfoY, {
      color: [225, 29, 72],
      fontSize: 8,
      fontStyle: "normal",
    });
    setText(pdf, "Roll No.", rollX, topInfoY, { fontSize: 8, fontStyle: "bold" });
    setText(pdf, data.rollNo, rollX + 18, topInfoY, {
      color: [225, 29, 72],
      fontSize: 8,
      fontStyle: "normal",
      maxWidth: 33,
    });
    setText(pdf, `Date : ${formatDate(data.date)}`, dateX, topInfoY, {
      align: "right",
      fontSize: 8,
      fontStyle: "normal",
    });

    drawPdfRows(pdf, rows, innerX, certY + 132, innerWidth, {
      labelWidth: 78,
      rowHeight: 11.5,
      fontSize: 8,
    });
  }

  setText(pdf, `Place : ${footerPlace}`, footerX, footerY, {
    fontSize: 8,
    fontStyle: "normal",
  });
  setText(pdf, `Date : ${footerDate}`, footerX, footerY + 10, {
    fontSize: 8,
    fontStyle: "normal",
  });
  setText(pdf, "Signature of Principal", footerRightX, footerY + 3, {
    align: "right",
    fontSize: 8,
    fontStyle: "normal",
  });
  setText(pdf, "(With Stamp)", footerRightX, footerY + 11,
  {
    align: "right",
    color: [71, 85, 105],
    fontSize: 7,
  });

  return pdf;
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
  const footerDate = formatDate(getTodayIsoDate());
  const footerPlace = formatPlace(headerConfig.address);

  if (isImageTemplate) {
    const imageNumber = templateId - 3; // 4 -> 1, 5 -> 2, 6 -> 3
    const bgUrl = `/tc%20template-${imageNumber}.png`;
    const isGreenTemplate = imageNumber === 3;
    const imageTemplateHeightClass = "h-[876px]";
    const maskClass =
      imageNumber === 3
        ? "left-[72px] right-[72px] top-[42px] bottom-[74px] bg-[#f7f8f1]"
        : imageNumber === 2
          ? "left-[64px] right-[64px] top-[58px] bottom-[50px] bg-[#fffde9]"
          : "left-[66px] right-[66px] top-[58px] bottom-[66px] bg-[#fffde9]";
    const contentClass =
      imageNumber === 3
        ? "left-[106px] right-[106px] top-[78px] bottom-[82px]"
        : imageNumber === 2
          ? "left-[88px] right-[88px] top-[104px] bottom-[96px]"
          : "left-[90px] right-[90px] top-[100px] bottom-[98px]";

    if (isGreenTemplate) {
      const greenRows = [
        [351, "1.", "Name", data.studentName],
        [375, "2.", "Father's Name", data.fatherName],
        [399, "3.", "Date of Birth", formatDate(data.dateOfBirth)],
        [423, "4.", "Date of Admission & Class", `${formatDate(data.dateOfAdmission)} and ${data.classAtLeaving}`],
        [447, "5.", "Date of Leaving & Class", `${formatDate(data.dateOfLeaving)} and ${data.classAtLeaving}`],
        [472, "6.", "Reason for Leaving & Class", data.reasonForLeaving],
        [505, "7.", "Whether the Candidate belongs to SC / ST / BC", data.belongsToScStBc],
        [548, "8.", "Whether the Candidate is in receipt of any Scholarship", data.receiptOfScholarship],
        [585, "9.", "General Remarks and Conduct", data.conductRemarks],
      ];
      const paperBackground = {
        backgroundColor: "#f7f8f1",
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(230, 190, 180, 0.16), transparent 34%), repeating-linear-gradient(24deg, rgba(80, 105, 90, 0.045) 0, rgba(80, 105, 90, 0.045) 1px, transparent 1px, transparent 7px), repeating-linear-gradient(116deg, rgba(80, 105, 90, 0.035) 0, rgba(80, 105, 90, 0.035) 1px, transparent 1px, transparent 8px)",
      };

      return (
        <div
          className="w-[620px] h-[876px] relative bg-white font-sans text-slate-900 rounded-none overflow-hidden select-none"
          style={{ fontFamily: "'Inter', Arial, sans-serif" }}
        >
          <img src={bgUrl} alt="Background" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-fill z-0" />
          
          <div className="relative z-10 w-full h-full">
            <div
              className="absolute left-[72px] right-[72px] top-[42px] bottom-[74px]"
              style={{
                ...paperBackground,
                boxShadow: "0 0 12px 10px rgba(247, 248, 241, 0.96)",
              }}
            />

          <div className="absolute left-[150px] top-[62px] flex w-[320px] flex-col items-center text-center">
            {headerConfig.logoUrl && (
              <Image
                src={headerConfig.logoUrl}
                alt="College Logo"
                width={80}
                height={80}
                unoptimized
                className="mb-2 h-[100px] w-[100px] rounded-full object-cover"
              />
            )}
            <h2 className="max-w-[320px] text-[22px] font-black uppercase leading-tight text-[#17213D]">
              {headerConfig.collegeName}
            </h2>
            <p className="mt-1 text-[13px] font-bold italic text-slate-600">
              {headerConfig.affiliation}
            </p>
            {headerConfig.address && (
              <p className="mt-1 max-w-[280px] text-[13px] font-bold leading-tight text-slate-700">
                {headerConfig.address}
              </p>
            )}
            {headerConfig.phone && (
              <p className="mt-1 text-[13px] font-black text-slate-800">Ph : {headerConfig.phone}</p>
            )}
          </div>

          <div className="absolute left-[95px] right-[95px] top-[270px] h-px bg-[#2555A0]" />
          <h1 className="absolute left-[185px] top-[290px] w-[250px] text-center text-[17px] font-black uppercase tracking-[0.08em] text-[#E11D48]">
            Transfer Certificate
          </h1>

          <div className="absolute left-[95px] top-[325px] flex items-baseline gap-2">
            <span className="font-serif text-[12px] italic text-slate-900">T.C. No. :</span>
            <span className="text-[11px] font-bold text-[#E11D48]">{data.tcNo}</span>
          </div>
          <div className="absolute right-[92px] top-[325px] flex items-baseline gap-2">
            <span className="font-serif text-[12px] italic text-slate-900">Date :</span>
            <span className="text-[11px] font-bold text-slate-900">{formatDate(data.date)}</span>
          </div>
          <div className="absolute left-[95px] top-[347px] flex items-baseline gap-2">
            <span className="font-serif text-[12px] italic text-slate-900">Roll No. :</span>
            <span className="text-[11px] font-bold text-slate-900">{data.rollNo}</span>
          </div>

          {greenRows.map(([top, number, label, value]) => (
            <div key={`${top}-${label}`}>
              <span
                className="absolute left-[95px] w-[18px] text-right font-serif text-[11px] italic text-slate-900"
                style={{ top: Number(top) }}
              >
                {number}
              </span>
              <span
                className="absolute left-[124px] max-w-[170px] font-serif text-[11px] italic leading-tight text-slate-900"
                style={{ top: Number(top) }}
              >
                {label} :
              </span>
              <span
                className="absolute left-[315px] max-w-[230px] truncate text-[11px] font-bold uppercase text-slate-950"
                style={{ top: Number(top) + 1 }}
              >
                {String(value || "-")}
              </span>
              <span className="absolute left-[315px] h-px w-[235px] bg-slate-700/70" style={{ top: Number(top) + 17 }} />
            </div>
          ))}

          <div className="absolute left-[110px] top-[632px] text-[9px] font-bold text-slate-900">
            <p>Place : <span>{footerPlace}</span></p>
            <p className="mt-2">Date : <span>{footerDate}</span></p>
          </div>
            <div className="absolute right-[92px] top-[631px] w-[155px] text-center text-[9px] font-bold text-slate-900">
              <p>Signature of Principal</p>
              <p className="mt-1 text-[7px] font-medium text-slate-600">(With Stamp)</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`w-[620px] ${imageTemplateHeightClass} relative bg-white font-sans text-slate-900 rounded-none overflow-hidden select-none`}
        style={{ fontFamily: "'Inter', Arial, sans-serif" }}
      >
        <img src={bgUrl} alt="Background" crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-fill z-0" />
        
        <div className="relative z-10 w-full h-full">
        <div className={`absolute ${maskClass}`} />
        
        <div
          className={`absolute flex flex-col text-slate-900 ${contentClass}`}
        >
          <div className="flex flex-col items-center text-center">
            {headerConfig.logoUrl && (
              <Image
                src={headerConfig.logoUrl}
                alt="College Logo"
                width={80}
                height={80}
                unoptimized
                className={`${isGreenTemplate ? "mb-2 h-[76px] w-[76px]" : "mb-3 h-[92px] w-[92px]"} rounded-full object-cover`}
              />
            )}
            <h2
              className={`max-w-[420px] font-black uppercase leading-tight ${
                isGreenTemplate ? "text-[20px] text-[#17213D]" : "text-[26px] text-[#E11D48]"
              }`}
            >
              {headerConfig.collegeName}
            </h2>
            <p className={`${isGreenTemplate ? "mt-0.5 text-[12px]" : "mt-1 text-[14px]"} font-bold italic text-slate-600`}>
              {headerConfig.affiliation}
            </p>
            <p className={`${isGreenTemplate ? "hidden" : "mt-0.5"} max-w-[390px] text-[14px] font-semibold leading-tight text-slate-600`}>
              {headerConfig.address}
            </p>
            <p className={`${isGreenTemplate ? "hidden" : "mt-1"} text-[14px] font-bold text-slate-800`}>
              Ph : {headerConfig.phone}
            </p>
          </div>

          <div className={`${isGreenTemplate ? "mt-4" : "mt-7"} flex items-center justify-between text-[11px] font-bold text-slate-800`}>
            <span>
              <span className="text-slate-800">T.C. No. </span>
              <span className="text-[#E11D48]">{data.tcNo}</span>
            </span>
            <span>Date : {formatDate(data.date)}</span>
          </div>

          <h1 className={`${isGreenTemplate ? "mt-3 text-[15px]" : "mt-5 text-[17px]"} text-center font-black uppercase tracking-[0.08em] text-[#E11D48]`}>
            Transfer Certificate
          </h1>

          <div className={`${isGreenTemplate ? "mt-4 gap-2.5 text-[10px]" : "mt-5 gap-1.5 text-[9.5px]"} flex flex-col leading-tight pr-3`}>
            {[
              ["1. Name", data.studentName],
              ["2. Father's Name", data.fatherName],
              ["3. Date of Birth", formatDate(data.dateOfBirth)],
              ["4. Date of Admission & Class", `${formatDate(data.dateOfAdmission)} and ${data.classAtLeaving}`],
              ["5. Date of Leaving & Class", `${formatDate(data.dateOfLeaving)} and ${data.classAtLeaving}`],
              ["6. Reason for Leaving & Class", data.reasonForLeaving],
              ["7. Whether the Candidate belongs to SC / ST / BC", data.belongsToScStBc],
              ["8. Whether the Candidate is in receipt of any Scholarship", data.receiptOfScholarship],
              ["9. General Remarks and Conduct", data.conductRemarks],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[230px_1fr] items-end gap-5 border-b border-slate-200 pb-1.5">
                <span className="font-bold leading-tight text-slate-900">{label} :</span>
                <span className="font-normal leading-tight text-slate-950">{value || "-"}</span>
              </div>
            ))}
            {data.otherRemarks && (
              <div className="grid grid-cols-[230px_1fr] items-end gap-5 border-b border-slate-200 pb-1.5">
                <span className="font-bold leading-tight text-slate-900">Other Remarks :</span>
                <span className="font-normal leading-tight text-slate-950">{data.otherRemarks}</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between border-t border-transparent pt-3 text-[10px] font-normal text-slate-900">
            <div className="max-w-[260px]">
              <p>Place : <span>{footerPlace}</span></p>
              <p className="mt-2">Date : <span>{footerDate}</span></p>
            </div>
            <div className="text-center">
              <p>Signature of Principal</p>
              <p className="text-[9px] font-medium text-slate-600">(With Stamp)</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Outer border styles: template 3 has double border, template 2 has no border, template 1 has solid thin border
  const containerClass = `w-[620px] min-h-[876px] relative bg-white font-sans text-slate-800 flex flex-col justify-between rounded-none p-10 pb-12 ${
    isTemplate3
      ? "border-[16px] border-double border-[#2C3E50]"
      : isTemplate2
      ? "border-0"
      : "border-[4px] border-solid border-slate-400"
  }`;

  return (
    <div className={containerClass} style={{ fontFamily: "'Inter', Arial, sans-serif" }}>
      <div>
        {/* HEADER SECTION */}
        {isTemplate1 ? (
          /* Template 1 Standard Flat Header */
          <div className="text-center border-b border-slate-200 pb-5 mb-6 flex flex-col items-center">
            {headerConfig.logoUrl ? (
              <Image
                src={headerConfig.logoUrl}
                alt="College Logo"
                width={120}
                height={120}
                unoptimized
                className="mb-3 h-[120px] w-[120px] object-contain"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border border-slate-300 flex items-center justify-center bg-slate-50 mb-2 overflow-hidden">
                <svg className="w-14 h-14 text-slate-300" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            )}
            <h2 className="text-[28px] font-extrabold tracking-wide uppercase text-slate-900 leading-tight">
              {headerConfig.collegeName}
            </h2>
            <p className="text-[15px] text-slate-500 font-bold mt-1 italic">
              {headerConfig.affiliation}
            </p>
            <p className="text-[15px] text-slate-500 font-semibold mt-0.5">
              {headerConfig.address}
            </p>
            <p className="text-[15px] text-slate-800 font-bold mt-0.5">
              Ph : {headerConfig.phone}
            </p>
          </div>
        ) : (
          /* Template 2 & 3 Arched Header */
          <div className="text-center pb-5 flex flex-col items-center">
            {/* Arched College Name using SVG curved text - peak y=10 to prevent viewport clipping */}
            <div className="w-full flex justify-center -mb-8">
              <svg viewBox="0 0 500 100" className="w-[460px] h-20">
                <path id="headerCurve" d="M 45 90 Q 250 10 455 90" fill="transparent" />
                <text className="text-[20px] font-black fill-[#E11D48] tracking-widest uppercase">
                  <textPath href="#headerCurve" startOffset="50%" textAnchor="middle">
                    {headerConfig.collegeName}
                  </textPath>
                </text>
              </svg>
            </div>

            {/* Logo Badge */}
            {headerConfig.logoUrl ? (
              <Image
                src={headerConfig.logoUrl}
                alt="College Logo"
                width={120}
                height={120}
                unoptimized
                className="z-10 mb-3 h-[120px] w-[120px] object-contain"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-double border-slate-400 flex items-center justify-center bg-slate-50 mb-2 overflow-hidden z-10">
                <svg className="w-14 h-14 text-slate-400" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            )}

            {/* Affiliation / Board */}
            <p className="text-[14px] text-slate-500 font-bold mt-1 italic leading-tight">
              {headerConfig.affiliation}
            </p>
            <p className="text-[14px] text-slate-500 font-semibold mt-0.5 leading-tight">
              {headerConfig.address}
            </p>
            <p className="text-[14px] text-slate-800 font-bold mt-0.5 leading-tight">
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
            <span className="w-[300px] font-semibold text-slate-700">2. Father&apos;s Name :</span>
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
              <p>Place : <span className="font-bold text-slate-950">{footerPlace}</span></p>
              <p>Date : <span className="font-bold text-slate-950">{footerDate}</span></p>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-6"></div>
              <p className="tracking-wide">Signature of Principal</p>
              <p className="text-[9px] font-medium text-slate-500 mt-0.5">(With Stamp)</p>
            </div>
          </>
        ) : (
          /* Template 2 & 3 Detailed Footer Layout */
          <>
            <div className="flex flex-col gap-1.5 text-[9px] font-bold text-slate-700 text-left">
              <p>Place : <span className="font-bold text-slate-950">{footerPlace}</span></p>
              <p>Date : <span className="font-bold text-slate-950">{footerDate}</span></p>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              {/* Signature principal box */}
              <div className="border border-slate-300 p-2 px-4 rounded bg-slate-50/50 flex flex-col items-center justify-center min-w-[130px] text-center">
                <div className="h-4"></div>
                <p className="text-[9px] font-extrabold text-slate-800 tracking-wider">Principal</p>
                <p className="text-[8px] font-medium text-slate-500 leading-none mt-0.5">(With Stamp)</p>
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
  onGenerate: (saveStatus: "Draft" | "Saved" | "Generated") => void;
}) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const downloadLockRef = useRef(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [templateId, setTemplateId] = useState(1);

  const handleDownloadPdf = async () => {
    if (downloadLockRef.current) return;
    downloadLockRef.current = true;
    setIsDownloading(true);

    try {
      const pdf = await generateTransferCertificatePdf({
        data,
        headerConfig,
        templateId,
      });

      pdf.save(`${data.tcNo || "transfer-certificate"}-template-${templateId}.pdf`);
      await wait(300);
      onGenerate("Generated"); // trigger parent generate flow
    } catch (error) {
      console.error("Failed to download transfer certificate PDF", error);
      toast.error("Unable to download PDF right now.");
    } finally {
      downloadLockRef.current = false;
      setIsDownloading(false);
    }
  };

  const handleNextTemplate = () => {
    const nextId = templateId === 6 ? 1 : templateId + 1;
    setTemplateId(nextId);
    toast.success(`Switched to Template ${nextId}`, { id: "template-switch" });
  };

  const handlePrevTemplate = () => {
    const prevId = templateId === 1 ? 6 : templateId - 1;
    setTemplateId(prevId);
    toast.success(`Switched to Template ${prevId}`, { id: "template-switch" });
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
          {/* Certificate display wrapper */}
          <section className="flex items-start">
            <div
              ref={certificateRef}
              data-tc-capture="true"
              className="w-[620px] shrink-0"
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
