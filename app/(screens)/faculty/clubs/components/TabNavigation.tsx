"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const TABS = [
    { id: "requests", label: "Requests" },
    { id: "announcements", label: "Announcements" },
] as const;

export default function TabNavigation({ currentTab }: { currentTab: string }) {
    return (
        <div className="bg-[#E9E9E9] relative p-2 rounded-full inline-flex gap-2">
            {TABS.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                    <Link
                        key={tab.id}
                        href={`?tab=${tab.id}`}
                        scroll={false}
                        className={`relative z-10 w-[170px] text-center px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                            isActive ? "text-white" : "text-[#282828]"
                        }`}
                    >
                        {tab.label}

                        {isActive && (
                            <motion.div
                                layoutId="faculty-club-tab-pill"
                                className="absolute inset-0 rounded-full bg-[#2bd97c] shadow-sm -z-10"
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30
                                }}
                            />
                        )}

                        {!isActive && (
                            <div className="absolute inset-0 rounded-full bg-[#DEDEDE] -z-10" />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}