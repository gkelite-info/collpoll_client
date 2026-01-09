"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { BellSimpleIcon, BookIcon } from "@phosphor-icons/react";
import { title } from "process";
import { desc } from "framer-motion/client";
import { createPortal } from "react-dom";
import { useEffect } from "react";


function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}


type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const notifications = {
  Academics: [
    {
      title: "New Assignment Posted",
      desc: "Data Structures – Assignment 3 uploaded. Submit before Nov 5.",
      time: "Just now",
    },
    {
      title: "Unit Test Results Released",
      desc: "Operating Systems marks are now live on the portal.",
      time: "4 hours ago",
    },
    {
      title: "Class Schedule Updated",
      desc: "Tomorrow’s AI lecture is rescheduled to 11:30 AM.",
      time: "1 day ago",
    },
    {
      title: "Mid-Sem Exam Notification",
      desc: "Timetable for mid-sem exams(Nov 15-20) is now available.",
      time: "5 days ago",

    },
    {
      title: "New Study Material added",
      desc: 'Lecture notes for "Database Management Sysytem" uploaded.',
      time: "5 days ago",
    }, {
      title: "Project Evaluation Date Announced",
      desc: "CSE mini project review scheduled on Nov 12",
      time: "5 days ago",
    },
    {
      title: "Attendance Reminder",
      desc: "Your attendance in Theory of Computation is below 75%.",
      time: "5 days ago",
    },
  ],
  Placements: [],
};

export default function NotificationsModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"Academics" | "Placements">(
    "Academics"
  );

  return (
   <AnimatePresence>
  {isOpen && (
    <Portal>
      <>
        {/* Backdrop */}
        <motion.div
          onClick={onClose}
          className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="
            fixed top-16 right-7 z-[1000]
            translate-x-3
            w-[320px] max-h-[420px]
            bg-white
            rounded-lg
            border border-[#E5E7EB]
            shadow-lg
            overflow-hidden
          "
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <BellSimpleIcon size={18} weight="fill" color="#3FAA6E" />
              <h2 className="text-base font-semibold text-[#1F2937]">
                Notifications
              </h2>
            </div>

            <button onClick={onClose}>
              <X className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>

      
          <div className="flex px-4 pt-3 border-b border-[#E5E7EB]">
            {(["Academics", "Placements"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 mr-6 text-sm font-medium relative ${
                  activeTab === tab
                    ? "text-[#43C17A]"
                    : "text-[#6B7280]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-[#43C17A]"
                  />
                )}
              </button>
            ))}
          </div>

        
          <div className="max-h-[280px] overflow-y-auto">
            {notifications[activeTab].length === 0 ? (
              <p className="text-center text-sm text-[#6B7280] py-10">
                No notifications available
              </p>
            ) : (
              notifications[activeTab].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex gap-2 px-3 py-2 border-b border-[#F3F4F6] last:border-none"
                >
              
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#3FAA6E26",
                    }}
                  >
                    <BookIcon size={16} weight="fill" color="#3FAA6E" />
                  </div>

              
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1F2937]">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#6B7280] leading-snug">
                      {item.desc}
                    </p>
                  </div>

            
                  <span className="text-[10px] text-[#9CA3AF] whitespace-nowrap">
                    {item.time}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </>
    </Portal>
  )}
</AnimatePresence>
  );
}
