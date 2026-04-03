"use client";

import { FaGear } from "react-icons/fa6"; 

interface PageUnderConstructionProps {
    title?: string;
    description?: string;
}

export default function PageUnderConstruction({
    title = "Module Under Development",
    description = "We are laying the foundational code and wiring up the APIs. This interface will be ready for deployment shortly.",
}: PageUnderConstructionProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center w-full">
            
            <div className="relative flex items-center justify-center w-56 h-56 md:w-64 md:h-64 mb-8">
                <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[50px] animate-pulse"></div>
                <div className="absolute inset-4 rounded-full border-y-2 border-blue-400/30 dark:border-blue-500/30 animate-[spin_8s_linear_infinite]"></div>
                <div className="absolute inset-8 rounded-full border-x-2 border-indigo-400/40 dark:border-indigo-500/40 animate-[spin_12s_linear_infinite_reverse]"></div>
                <div className="relative z-10 flex items-center justify-center w-36 h-36 md:w-44 md:h-44 rounded-full bg-white/50 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-2xl overflow-hidden">
                    <div className="relative w-16 h-16 md:w-20 md:h-20">
                        <FaGear className="absolute top-0 -left-5 w-full h-full text-blue-600 dark:text-blue-400 animate-[spin_5s_linear_infinite] drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                        <FaGear className="absolute -bottom-1 -right-6 w-10 h-10 md:w-13 md:h-13 text-indigo-500 dark:text-indigo-400 animate-[spin_5s_linear_infinite_reverse] drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                    </div>
                </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                {title}
            </h1>
            <p className="max-w-lg text-sm md:text-base text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                {description}
            </p>
        </div>
    );
}