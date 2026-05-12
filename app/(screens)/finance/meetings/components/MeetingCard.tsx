"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, PencilSimple, Trash, X } from "@phosphor-icons/react";
import PillTag from "./PillTag";
import { Meeting } from "../page";
import { useTranslations } from "next-intl";
import { Avatar } from "@/app/utils/Avatar";

const formatToAMPM = (timeStr: string) => {
  if (!timeStr) return "";
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${minuteStr} ${ampm}`;
};

export default function MeetingCard({
  data,
  onDelete,
  role,
  category,
  onEdit,
}: {
  data: Meeting;
  onDelete?: (meeting: Meeting) => void;
  role: string | null;
  category?: string | null;
  onEdit?: (meeting: number, sectionId: number | null) => void;
}) {
  const t = useTranslations("Meetings.parent");
  const [fromTime, toTime] = data.timeRange.split(" - ");
  const formattedTimeRange = `${formatToAMPM(fromTime)} - ${formatToAMPM(toTime)}`;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-t-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="bg-[#43C17A26] px-3 py-1.5 flex items-center justify-between gap-3 border-b-2 border-dotted border-[#43C17A]">
          <div className="flex gap-2 items-center justify-center">
            <div className="bg-[#43C17A] p-1 rounded-full text-white">
              <Laptop size={18} weight="fill" color="#E9E9E9" />
            </div>
            <span className="text-[#11934A] font-medium text-[15px]">
              {formattedTimeRange}
            </span>
          </div>

          <div className="hidden max-md:block bg-[#43C17A] text-white px-3 py-0.5 rounded-full text-xs font-medium">
            {data.date}
          </div>

          {data.type === "upcoming" && role === "Finance" && (
            <div className="flex gap-1.5 items-center justify-center max-md:hidden">
              <button
                className="w-6 h-6 cursor-pointer flex items-center justify-center rounded-full bg-white"
                onClick={(e: any) => {
                  e.stopPropagation();
                  onEdit?.(
                    data.financeMeetingId,
                    data.financeMeetingSectionsId,
                  );
                }}
              >
                <PencilSimple
                  size={14}
                  weight="fill"
                  className="text-[#43C17A]"
                />
              </button>
              <button
                className="w-6 h-6 cursor-pointer flex items-center justify-center rounded-full bg-white"
                onClick={(e: any) => {
                  e.stopPropagation();
                  onDelete?.(data);
                }}
              >
                <Trash size={14} weight="fill" className="text-[#FF0000]" />
              </button>
            </div>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="w-full overflow-hidden">
              <h2 className="text-[#43C17A] font-semibold text-sm max-md:text-base truncate">
                {data.title}
              </h2>
            </div>

            {((category && category !== "Admin") ||
              (role && !["Admin", "Finance"].includes(role))) && (
              <span className="bg-[#22c55e] text-[#ffffff] px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap max-md:hidden">
                {data.branch} - {data.section}
              </span>
            )}
          </div>

          {/* Desktop Content Only */}
          <div className="space-y-2 text-sm text-gray-600 max-md:hidden">
            <div className="flex items-center gap-1">
              <span className="text-[#303030] font-normal text-xs">
                {t("Description :")}
              </span>
              <p className="truncate text-xs text-[#16284F]">
                {data.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-[#303030] font-normal text-xs">
                  {t("Date :")}
                </span>
                <div className="scale-90 origin-left">
                  <PillTag label={data.date} />
                </div>
              </div>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  data.type === "previous"
                    ? "bg-[#CDCDCD] text-[#414141]"
                    : "bg-[#16284F] text-white"
                }`}
                onClick={(e: any) => {
                  e.stopPropagation();
                  data.type !== "previous" &&
                    window.open(data.meetingLink, "_blank");
                }}
              >
                {data.type === "previous" ? t("Completed") : t("Join Meeting")}
              </button>
            </div>
          </div>

          {/* Mobile Content Only (image_1d4161.png) */}
          <div className="hidden max-md:flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#303030] text-sm">By :</span>
              <div className="flex items-center gap-1.5 bg-[#E2E6ED] pl-1 pr-2.5 py-0.5 rounded-full">
                <Avatar
                  src={(data as any).hostImage || null}
                  alt={(data as any).hostName || "host"}
                  size={16}
                />
                <span className="text-xs text-[#16284F]">
                  {(data as any).hostName || "Dr. Anil Kumar"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#303030] text-sm">Subject :</span>
                <div className="bg-[#E2E6ED] text-[#16284F] px-2.5 py-1 rounded-full text-[11px] font-medium">
                  {(data as any).subject || "DBMS"}
                </div>
              </div>
              <button
                className="bg-[#16284F] text-white px-4 py-1.5 rounded-full text-xs font-semibold"
                onClick={(e: any) => {
                  e.stopPropagation();
                  window.open(data.meetingLink, "_blank");
                }}
              >
                {t("Join Meeting")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            style={{ background: "#3E3D3DA3" }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden relative p-5 py-4 m-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-[#282828] leading-none">
                  {data.title}
                </h2>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 cursor-pointer rounded-full"
                >
                  <X size={20} weight="bold" className="text-[#282828]" />
                </button>
              </div>
              <p className="text-sm text-[#282828] mb-6 leading-none">
                {data.description}
              </p>

              <div className="grid grid-cols-2 gap-x-6 max-md:grid-cols-1 max-md:gap-y-3">
                <div className="flex gap-y-3 flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-[#303030] font-medium text-sm">
                      {t("Role :")}
                    </span>
                    <PillTag label={t((data as any).category) || t("NA")} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#303030] font-medium text-sm">
                      {t("Date :")}
                    </span>
                    <PillTag label={data.date || t("NA")} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#303030] font-medium text-sm">
                      {t("Time :")}
                    </span>
                    <PillTag label={formattedTimeRange} />
                  </div>
                </div>
                {((category && category !== "Admin") ||
                  (role && !["Admin", "Finance"].includes(role))) && (
                  <div className="flex gap-y-3 flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-[#303030] font-medium text-sm">
                        {t("Branch :")}
                      </span>
                      <PillTag label={data.branch || t("NA")} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#303030] font-medium text-sm">
                        {t("Year :")}
                      </span>
                      <PillTag label={data.year || t("NA")} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#303030] font-medium text-sm">
                        {t("Section :")}
                      </span>
                      <PillTag label={data.section || t("NA")} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
