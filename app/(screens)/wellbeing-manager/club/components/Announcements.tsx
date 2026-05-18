"use client";

import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import { useState, useRef, useEffect, UIEvent } from "react";
import { motion } from 'framer-motion';
import toast from "react-hot-toast";
import { Avatar } from "@/app/utils/Avatar";
import { StudentAnnouncementsShimmer } from "@/app/(screens)/(student)/clubs/shimmers/StudentAnnouncementsShimmer";
import { announcementsData } from "./mock-data";

export const formatChatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return `Today ${timeString}`;
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday ${timeString}`;
    return `${date.toLocaleDateString("en-GB")} ${timeString}`;
};

export const getMessageDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-GB");
};

export const formatRoleDisplay = (role: string) => {
    switch (role?.toLowerCase()) {
        case "president": return "President";
        case "vicepresident": return "Vice President";
        case "mentor": return "Mentor";
        case "responsiblefaculty": return "Responsible Faculty";
        default: return role;
    }
};

interface Props {
    onDateChange?: (date: string) => void;
}

export default function Announcements({ onDateChange }: Props) {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    const onDateChangeRef = useRef(onDateChange);

    useEffect(() => { onDateChangeRef.current = onDateChange; }, [onDateChange]);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior
            });
        }
    };

    useEffect(() => {
        const loadInitial = () => {
            setLoading(true);
            setTimeout(() => {
                setMessages([...announcementsData].reverse());
                setLoading(false);
                setTimeout(() => scrollToBottom('auto'), 100);
            }, 800);
        };
        loadInitial();
    }, []);

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        if (onDateChange) {
            const messageElements = target.querySelectorAll('[data-date]');
            for (let i = 0; i < messageElements.length; i++) {
                const el = messageElements[i] as HTMLElement;
                if (el.offsetTop - target.offsetTop >= target.scrollTop - 20) {
                    onDateChange(el.getAttribute('data-date') || "Today");
                    break;
                }
            }
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const textToPost = inputValue.trim();
        if (!textToPost || textToPost.length > 1000) return;

        const newMessage = {
            announcementId: Date.now(),
            createdAt: new Date().toISOString(),
            authorRole: "Wellbeing Manager",
            message: textToPost,
            authorFacultyId: 999, // dummy id
            authorStudent: null,
            authorFaculty: { users: { fullName: "Wellbeing Manager", user_profile: { profileUrl: "https://i.pravatar.cc/150?u=wb" } } },
        };

        setMessages(prev => [...prev, newMessage]);
        if (onDateChangeRef.current) onDateChangeRef.current("Today");
        setInputValue("");
        toast.success("Announcement posted (Static Demo)");
        setTimeout(() => scrollToBottom('smooth'), 100);
    };

    const getAuthorDetails = (announcement: any) => {
        if (announcement.authorStudent) {
            const profile = Array.isArray(announcement.authorStudent.users?.user_profile)
                ? announcement.authorStudent.users?.user_profile[0]
                : announcement.authorStudent.users?.user_profile;
            return { name: announcement.authorStudent.users?.fullName, avatar: profile?.profileUrl };
        }
        if (announcement.authorFaculty) {
            const profile = Array.isArray(announcement.authorFaculty.users?.user_profile)
                ? announcement.authorFaculty.users?.user_profile[0]
                : announcement.authorFaculty.users?.user_profile;
            return { name: announcement.authorFaculty.users?.fullName, avatar: profile?.profileUrl };
        }
        return { name: "Unknown", avatar: null };
    };

    if (loading) return <StudentAnnouncementsShimmer />;

    return (
        <div className="mx-auto flex h-[650px] w-full max-w-2xl flex-col bg-transparent">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200"
            >
                <div className="flex flex-col gap-4 pb-2 min-h-full justify-end">
                    {messages.map((announcement) => {
                        const authorInfo = getAuthorDetails(announcement);
                        const dateStr = getMessageDateHeader(announcement.createdAt);
                        const formattedRole = formatRoleDisplay(announcement.authorRole);

                        return (
                            <div key={announcement.announcementId} data-date={dateStr} className="flex flex-col">
                                <div className="group flex items-start gap-4 px-1 relative">
                                    <div className="flex-1 rounded-2xl bg-white p-4 shadow-md border-2 border-[#CCCCCC] transition-all hover:border-[#16284F]/30 relative">
                                        <div className="mb-2 flex items-center justify-between pr-3">
                                            <span className="text-[13px] font-medium text-[#3B3B3B]">
                                                {formatChatDateTime(announcement.createdAt)}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center justify-center gap-1 rounded bg-[#E0E5FA] px-2 py-1 text-[10px] font-bold border border-[#465FAC] tracking-wide text-[#16284F]">
                                                    {formattedRole} {formattedRole === "President" && <span>👑</span>}
                                                </span>
                                                <span className="text-[14px] font-bold text-[#16284F]">
                                                    {authorInfo.name}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[14px] font-medium leading-relaxed text-[#16284F] whitespace-pre-wrap">
                                            {announcement.message}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 shrink-0 flex items-center justify-center text-center overflow-hidden rounded-full shadow-sm border border-gray-100 bg-gray-100">
                                        <Avatar src={authorInfo.avatar} alt="avatar" size={48} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <form onSubmit={handleSend} className="mt-2 pb-2 px-1">
                <div className="flex items-center gap-4">
                    <motion.div initial={false} animate={{ scale: inputValue.trim() ? 1.01 : 1 }} className="relative flex-1">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            maxLength={1000}
                            placeholder="Type here........"
                            className="w-full rounded-full bg-[#E5E5E5] py-3.5 pl-6 pr-14 text-sm font-medium text-[#282828] placeholder-[#6F6F6F] border-2 border-transparent focus:border-[#16284F]/20 focus:bg-white focus:shadow-lg outline-none transition-all duration-300 disabled:opacity-70"
                        />

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 overflow-hidden rounded-full">
                            <motion.button
                                type="submit"
                                disabled={!inputValue.trim()}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9, rotate: -10 }}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: inputValue.trim() ? 0 : 50, opacity: inputValue.trim() ? 1 : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="flex h-10 w-10 items-center justify-center bg-[#16284F] text-white shadow-lg disabled:bg-gray-400 cursor-pointer"
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
