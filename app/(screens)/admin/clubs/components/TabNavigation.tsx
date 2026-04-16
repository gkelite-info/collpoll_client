"use client";

import { motion } from "framer-motion";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: "add" | "view") => void;
}

const TABS = [
  { id: "add", label: "Add New Club" },
  { id: "view", label: "View Clubs" },
] as const;

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-[#E9E9E9] p-2 rounded-full inline-flex gap-2 mx-auto self-center">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as "add" | "view")}
            className={`relative z-10 cursor-pointer px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive ? "text-[#ffffff]" : "text-[#282828]"
            }`}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="club-tab-pill"
                className="absolute inset-0 rounded-full bg-[#43C17A] shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {!isActive && (
              <div className="absolute inset-0 rounded-full bg-[#DEDEDE] shadow-sm -z-10" />
            )}
          </button>
        );
      })}
    </div>
  );
}