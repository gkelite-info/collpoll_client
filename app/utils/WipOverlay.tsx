"use client";

import { useEffect, useState } from "react";
import { FaGear } from "react-icons/fa6";

interface WipOverlayProps {
    title?: string;
    description?: string;
    borderRadius?: string;
    fullWidth?: boolean;
    isOverlayVisible?: boolean;
    fullHeight?: boolean;
}

export default function WipOverlay({
    title = "Integration in Progress",
    description = "This module is currently undergoing active development to connect with live dynamic data streams.",
    borderRadius = "rounded-lg",
    fullWidth = false,
    isOverlayVisible = true,
    fullHeight = false,
}: WipOverlayProps) {
    const [isVisible, setIsVisible] = useState(isOverlayVisible);
    const [isFading, setIsFading] = useState(false);

    const handleReveal = () => {
        setIsFading(true);
        setTimeout(() => {
            setIsVisible(false);
        }, 400);
    };

     useEffect(() => {
        setIsVisible(isOverlayVisible);
    }, [isOverlayVisible]);

    if (!isVisible) return null;

    return (
        <div
            className={`absolute inset-0 z-50 flex flex-col items-center 
                ${fullHeight ? "justify-start pt-10 sm:pt-14 md:pt-50" : "justify-center"}
                 p-3 sm:p-4 text-center transition-opacity duration-400 ease-in-out 
                ${isFading ? "opacity-0" : "opacity-95"} 
                bg-linear-to-br from-slate-900/85 to-slate-800/90 backdrop-blur-md border border-white/10 
                ${borderRadius} overflow-hidden`}
        >
            <div className="relative flex-none w-[46px] h-[40px] mb-2 sm:mb-3 mt-1">
                <div className="absolute top-1 left-2 w-8 h-8 bg-blue-500/30 blur-xl rounded-full scale-150"></div>

                <div className="absolute left-0 top-0 w-[32px] h-[32px] animate-[spin_4s_linear_infinite]">
                    <FaGear className="text-blue-400 w-full h-full drop-shadow-md" />
                </div>

                <div className="absolute left-[27px] top-[15px] w-[25px] h-[25px] animate-[spin_4s_linear_infinite_reverse]">
                    <FaGear
                        className="text-blue-300 w-full h-full drop-shadow-md"
                        style={{ transform: "rotate(22.5deg)" }}
                    />
                </div>
            </div>

            <div className={`flex flex-col gap-1.5 sm:gap-2 ${fullWidth ? "w-full" : "items-center"}`}>
                <h4 className="text-white font-bold text-[13px] sm:text-sm tracking-wide drop-shadow-md leading-tight">
                    {title}
                </h4>

                <p className={`text-slate-200 text-[10px] sm:text-xs ${fullWidth ? "w-full" : "max-w-[95%] sm:max-w-[85%]"
                    } leading-snug font-medium`}>
                    {description}
                </p>

                <button
                    onClick={handleReveal}
                    className="cursor-pointer mt-1 px-4 py-1.5 sm:px-5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-white/10 border border-white/20 rounded-md shadow-sm hover:bg-white/20 hover:border-white/50 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                >
                    Preview Layout
                </button>
            </div>
        </div>
    );
}