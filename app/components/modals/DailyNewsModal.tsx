"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import Image from "next/image";
import { NewspaperIcon } from "@phosphor-icons/react";
import { CaretLeft } from "@phosphor-icons/react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  article: any;
};

export default function DailyNewsModal({ isOpen, onClose, article }: Props) {
  const pdfRef = useRef<HTMLDivElement>(null);

  // const handleDownload = async () => {
  //   if (!pdfRef.current) return;

  //   const images = pdfRef.current.querySelectorAll("img");
  //   await Promise.all(
  //     Array.from(images).map(
  //       (img) =>
  //         new Promise((resolve) => {
  //           if (img.complete) resolve(true);
  //           else img.onload = () => resolve(true);
  //         }),
  //     ),
  //   );

  //   const canvas = await html2canvas(pdfRef.current, {
  //     useCORS: true,
  //     backgroundColor: "#ffffff",
  //     scale: 1.5,
  //     logging: false,
  //   });

  //   console.log(pdfRef.current);

  //   const imgData = canvas.toDataURL("image/jpeg", 0.95);

  //   const pdf = new jsPDF("p", "mm", "a4");
  //   const width = pdf.internal.pageSize.getWidth();
  //   const height = (canvas.height * width) / canvas.width;
  //   pdf.addImage(imgData, "JPEG", 0, 0, width, height);
  //   pdf.save("news.pdf");
  // };

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[2000]"
      />
      <div
        className="
    fixed inset-0 top-0 right-0
    z-[2100]
    flex items-center justify-center
  "
      >
        <div
          ref={pdfRef}
          className="
      bg-[#F7F7F7]
      rounded-2xl
      shadow-xl
      w-[calc(100%-64px)]
      max-w-[1000px]
      max-h-[80vh]
      overflow-y-auto
    "
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            {/* LEFT: back arrow + icon + title */}
            <div className="flex items-center gap-1">
              {/* Just the < icon (no circle) */}
              <button onClick={onClose} className="hover:opacity-70">
                <CaretLeft
                  size={22}
                  weight="light"
                  className="text-[#454545] cursor-pointer"
                />
              </button>
              {/* Green newspaper icon */}
              <NewspaperIcon size={22} weight="fill" color="#43C17A" />

              {/* Title */}
              <h2
                className="text-[#111827]"
                style={{
                  fontSize: "24px",
                  fontWeight: 500,
                  lineHeight: "100%",
                }}
              >
                News
              </h2>
            </div>

            {/* <button
              className="
                flex items-center gap-2
                bg-[#43C17A] text-white
                px-3 py-2 rounded-full
                shadow-sm hover:bg-[#3AAD6D] transition cursor-pointer
              "
              onClick={handleDownload}
            >
              <span className="flex items-center justify-center w-7 h-7 bg-white rounded-full">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#43C17A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </span>
              <span className="text-[16px] font-medium">Download</span>
            </button> */}
          </div>

          {/* TAG, TITLE, SUBTITLE */}
          <div className="px-8 mt-3">
            {/* 🗞️ Daily News */}
            <div
              className="flex items-center gap-2 text-[#111827]"
              style={{
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "100%",
              }}
            >
              <span className="text-[16px] text-[#111827] font-medium leading-none fontWeight: 500">
                🗞️
              </span>
              <span>Daily News</span>
            </div>

            {/* Main title */}
            <h3 className="mt-3 text-[#111827]">{article?.title}</h3>

            {/* Subtitle */}
            <p className="mt-2 mb-6 text-[#414141] italic">
              {article?.description}
            </p>
          </div>

          {/* IMAGE CARD – Figma accurate */}
          <div className="px-8 pb-8 flex justify-center">
            <div
              className="
      bg-white
       border-[5px]
      rounded-[14px]
      p-2
      w-[950px]
    "
            >
              <img
                src={
                  article?.image
                    ? `/api/image-proxy?url=${encodeURIComponent(article.image)}`
                    : "/news.png"
                }
                alt="news"
                className="rounded-[10px] w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
