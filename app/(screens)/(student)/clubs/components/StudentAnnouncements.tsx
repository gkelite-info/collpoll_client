"use client";

import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {motion} from 'framer-motion'
import { formatChatDateTime } from "@/app/utils/formatChatDateTime";

const DEFAULT_ANNOUNCEMENTS = [
    {
        id: "ann-1",
        time: "2026-04-17T16:25:00",
        author: "Rohith Sharma",
        role: "President",
        message: "Practice session scheduled today at 5 PM on the main ground.Please report 10 minutes early for warm-up.",
        avatar: "https://i.pravatar.cc/150?u=1"
    },
    {
        id: "ann-2",
        time: "2026-04-16T08:05:00",
        author: "Rohith Sharma",
        role: "President",
        message: "Inter-college football match this Saturday at 4 PM. Selected players must report by 3 PM without fail.",
        avatar: "https://i.pravatar.cc/150?u=2"
    },
    {
        id: "ann-3",
        time: "2026-04-16T08:05:01",
        author: "Rohith Sharma",
        role: "President",
        message: "Basketball team trials will be held tomorrow at 6 AM. Venue: Indoor stadium. Bring your ID cards.",
        avatar: "https://i.pravatar.cc/150?u=1"
    },
    {
        id: "ann-4",
        time: "2026-04-16T08:05:01",
        author: "Rohith Sharma",
        role: "President",
        message: "Cricket tournament registrations are now open. Submit your names before 25th April to participate.",
        avatar: "https://i.pravatar.cc/150?u=3"
    },
    {
        id: "ann-5",
        time: "2026-04-16T08:05:02",
        author: "Rohith Sharma",
        role: "President",
        message: "Mandatory meeting for all members tomorrow at 2 PM. Important updates regarding upcoming events will be shared.",
        avatar: "https://i.pravatar.cc/150?u=1"
    },
    {
        id: "ann-6",
        time: "2026-05-03T17:07:00",
        author: "Rohith Sharma",
        role: "President",
        message: "All players are requested to submit fitness certificates. Deadline is this weekend without any extensions.",
        avatar: "https://i.pravatar.cc/150?u=4"
    },
    {
        id: "ann-7",
        time: "2026-05-03T17:07:00",
        author: "Rohith Sharma",
        role: "President",
        message: "Practice session scheduled today at 5 PM on the main ground.Please report 10 minutes early for warm-up.",
        avatar: "https://i.pravatar.cc/150?u=1"
    }
];

interface Announcement {
    id: string;
    time: string;
    author: string;
    role: string;
    message: string;
    avatar: string;
}

export default function StudentAnnouncements() {
    const [messages, setMessages] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
        const newMessage: Announcement = {
            id: `new-${Date.now()}`,
            time: timeString,
            author: "Rohith Sharma",
            role: "President",
            message: inputValue.trim(),
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50) + 20}` 
        };
        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
    };

    return (
        <div className="mx-auto flex h-[650px] w-full max-w-2xl flex-col bg-transparent">
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                <div className="flex flex-col gap-4 pb-4">
                    {messages.map((announcement) => (
                        <div key={announcement.id} className="flex items-start gap-4 px-1">
                            <div className="flex-1 rounded-2xl bg-white p-4 shadow-md border-2 border-[#CCCCCC]">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-[13px] font-medium text-[#3B3B3B]">
                                        {formatChatDateTime(announcement.time)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1 rounded bg-[#E0E5FA] px-2 py-1 text-[10px] font-bold border border-[#465FAC] tracking-wide text-[#16284F]">
                                            {announcement.role} <span>👑</span>
                                        </span>
                                        <span className="text-[14px] font-bold text-[#16284F]">
                                            {announcement.author}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[14px] font-medium leading-relaxed text-[#16284F]">
                                    {announcement.message}
                                </p>
                            </div>
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full shadow-sm border border-gray-100">
                                <Image
                                    src={announcement.avatar}
                                    alt={announcement.author}
                                    height={50}
                                    width={50}
                                />
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <form onSubmit={handleSend} className="mt-2 pb-4 px-1">
                <div className="flex items-center gap-4">
                    <motion.div 
                        initial={false}
                        animate={{ scale: inputValue.trim() ? 1.01 : 1 }}
                        className="relative flex-1"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type here........"
                            className="w-full rounded-full bg-[#E5E5E5] py-3.5 pl-6 pr-14 text-sm font-medium text-[#282828] placeholder-[#6F6F6F] border-2 border-transparent focus:border-[#16284F]/20 focus:bg-white focus:shadow-lg outline-none transition-all duration-300"
                        />
                        
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
                            <motion.button
                                type="submit"
                                disabled={!inputValue.trim()}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9, rotate: -10 }}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ 
                                    x: inputValue.trim() ? 0 : 50, 
                                    opacity: inputValue.trim() ? 1 : 0 
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="flex h-10 w-10 items-center justify-center bg-[#16284F] text-white shadow-lg disabled:bg-gray-400"
                            >
                                <PaperPlaneRightIcon size={22} weight="fill" className="ml-0.5" />
                            </motion.button>
                        </div>
                    </motion.div>                    
                    <div className="w-12 shrink-0" />
                </div>
            </form>
        </div>
    );
}