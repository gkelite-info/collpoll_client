"use client";

import { LayoutGroup, motion } from "framer-motion";
import Link from "next/link";

const tabs = [
  { id: "requests", label: "Requests" },
  { id: "announcements", label: "Announcements" },
] as const;

export default function TabNavigation({ currentTab }: { currentTab: string }) {
  return (
    <LayoutGroup>
      <div className="relative inline-flex gap-2 rounded-full bg-[#E9E9E9] p-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={`?tab=${tab.id}`}
              scroll={false}
              className={`relative z-10 w-[170px] rounded-full px-6 py-2.5 text-center text-sm font-semibold transition-colors ${
                isActive ? "text-white" : "text-[#282828]"
              }`}
            >
              {tab.label}
              {isActive ? (
                <motion.div
                  layoutId="finance-manager-club-tab-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-[#43C17A] shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              ) : (
                <div className="absolute inset-0 -z-10 rounded-full bg-[#DEDEDE]" />
              )}
            </Link>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
