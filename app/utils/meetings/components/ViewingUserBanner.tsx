"use client";

import { motion } from "framer-motion";
import { ArrowLeft, UserCircle } from "@phosphor-icons/react";
import { SelectUser } from "@/lib/helpers/Hr/meetings/getCollegeUsers";

interface ViewingUserBannerProps {
    viewedUser: SelectUser;
    onBackToMyCalendar: () => void;
}

export default function ViewingUserBanner({ viewedUser, onBackToMyCalendar }: ViewingUserBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-emerald-50/80 border-b border-emerald-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden shrink-0"
        >
            <div className="flex items-center gap-3 min-w-0">
                {viewedUser.avatar ? (
                    <img src={viewedUser.avatar} alt={viewedUser.name} className="w-10 h-10 rounded-full object-cover shadow-sm border border-emerald-200" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-400 to-slate-500 flex items-center justify-center text-white text-[15px] font-bold shadow-sm">
                        {viewedUser.name.charAt(0)}
                    </div>
                )}
                
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-emerald-500 uppercase tracking-wider">Viewing Schedule</span>
                    </div>
                    <h3 className="text-[16px] font-bold text-emerald-950 truncate">
                        {viewedUser.name}
                    </h3>
                    <span className="text-[13px] text-emerald-700/70 font-medium truncate">
                        ID: {viewedUser.userId} • {viewedUser.subLabel}
                    </span>
                </div>
            </div>

            <button
                onClick={onBackToMyCalendar}
                className="cursor-pointer shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-[14px] font-bold hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm active:scale-95 w-full sm:w-auto"
            >
                <ArrowLeft size={16} weight="bold" />
                <span>Back to My Calendar</span>
            </button>
        </motion.div>
    );
}
