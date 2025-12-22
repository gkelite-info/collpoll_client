"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Heart, MessageCircle, Share2 } from "lucide-react";
import { createPortal } from "react-dom";
import { MegaphoneIcon } from "@phosphor-icons/react";
import { Plus } from "lucide-react";
import AddPostModal from "./AddPostModal";



function Portal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(children, document.body);
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

const tabs = [
    "All",
    "Achievements",
    "Announcements",
    "Clubs & Activities",
] as const;

const announcements = [
    {
        id: 1,
        title: "CSE Dept Topper 2025 Announced",
        desc: "Congratulations to Ananya Singh (9.4 CGPA) for securing the top position in the CSE Department!",
        image: "/Announcement-1.png",
        likes: 120,
        comments: 25,
        shares: 5,
    },
    {
        id: 2,
        title: "Team BugBusters Wins Hackathon",
        desc: "Our CSE students secured 1st place at the IIIT Hyderabad Hackathon.",
        image: "/Announcement-2.png",
        likes: 98,
        comments: 25,
        shares: 5,
    },
    {
        id: 3,
        title: "Tech Fest 2025 Registrations Open",
        desc: "Join coding contests, workshops, robotics expos and many more activities.",
        image: "/Announcement-3.png",
        likes: 76,
        comments: 25,
        shares: 5,
    },
];

export default function AnnouncementModal({ isOpen, onClose }: Props) {
    const [activeTab, setActiveTab] =
        useState<(typeof tabs)[number]>("All");

    const [postStates, setPostStates] = useState(
        announcements.map((item) => ({
            id: item.id,
            liked: false,
            commentsActive: false,
            shared: false
        }))
    );

    const [isAddPostOpen, setIsAddPostOpen] = useState(false);





    const toggleLike = (id: number) => {
        setPostStates((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, liked: !p.liked } : p
            )
        );
    };

    const toggleComments = (id: number) => {
        setPostStates((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, commentsActive: !p.commentsActive } : p
            )
        );
    };

    const toggleShare = (id: number) => {
        setPostStates((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, shared: !p.shared } : p
            )
        );
    };



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
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="
                fixed z-[1000]
                top-[80px] left-[745px] 
                w-[500px] h-[80vh]
                bg-white translate-x-6
                rounded-xl
                shadow-xl
                overflow-hidden
                flex flex-col
              "
                        >
                            {/* ================= HEADER ================= */}
                            <div className="px-[20px] pt-[20px] shrink-0">

                                {/* TOP ROW (ICON + TEXT LEFT) (ADD POST + CLOSE RIGHT) */}
                                <div className="flex items-center justify-between w-full">

                                    {/* LEFT SIDE */}
                                    <div className="flex items-center gap-3">
                                        <MegaphoneIcon size={32} weight="fill" color="#43C17A" />

                                        <h2 className="text-[22px] font-roboto font-semibold text-[#282828] leading-none">
                                            Campus Buzz
                                        </h2>
                                    </div>

                                    {/* RIGHT SIDE (ADD POST + CLOSE) */}
                                    <div className="flex items-center gap-4">

                                        {/* ADD POST BUTTON */}
                                        {!isAddPostOpen && (
                                            <button
                                                onClick={() => setIsAddPostOpen(true)}
                                                className="
            flex items-center justify-center gap-2
            px-4 py-[6px]
            rounded-full
            bg-[rgba(67,193,122,0.12)]
            text-[#43C17A]
            text-[16px] font-medium
        "
                                            >
                                                <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                                <span>Add Post</span>
                                            </button>
                                        )}

                                        {/* CLOSE BUTTON */}
                                        <button onClick={onClose}>
                                            <X className="w-6 h-6 text-[#6B7280]" />
                                        </button>
                                    </div>

                                </div>

                                {/* SUBTITLE (ALWAYS BELOW HEADER) */}
                                <p className="
        mt-[10px]
        text-[18px]
        font-roboto
        text-[#282828]
        leading-[22px]
        tracking-[-0.2px]
    ">
                                    Stay update with everything happening on campus.
                                </p>
                            </div>



                            {/* Search */}
                            <div className="mt-[16px] px-[20px]">
                                <div
                                    className="
      flex items-center justify-between
      w-[460px]
      h-[45px]
      px-6
      rounded-full
      bg-[#ECECEC]
    "
                                >
                                    <input
                                        placeholder="what do you want to find ?"
                                        className="
        w-full bg-transparent outline-none
        text-[18px] font-roboto font-regular text-[#282828]
        placeholder:text-[#282828]    /* FIXED */
    "
                                    />

                                    <Search className="w-[20px] h-[24px] text-[#43C17A]" />
                                </div>
                            </div>

                            {/* Tabs — horizontal scroll */}
                            <div className="mt-4 px-[20px] shrink-0">
                                <div
                                    className="
      flex gap-3 
      overflow-x-auto 
      scrollbar-none 
      pb-1
    "
                                >
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`
          px-5
          h-[32px]
          rounded-[48px]
          text-[14px] font-roboto font-medium
          flex items-center justify-center
          whitespace-nowrap
          ${activeTab === tab
                                                    ? "bg-[#43C17A] text-white"
                                                    : "bg-[#EAF7F1] text-[#43C17A]"
                                                }
        `}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div className="flex-1 mt-4 px-[20px] overflow-y-auto space-y-8 pb-6">

                                {announcements.map((item) => {
                                    const state = postStates.find((p) => p.id === item.id)!;

                                    return (
                                        <div key={item.id} className="relative">

                                            {/* TITLE */}
                                            <h3 className="text-[16px] font-roboto font-medium text-[#282828]">
                                                {item.title}
                                            </h3>

                                            {/* DESCRIPTION */}
                                            <p className="text-[14px] font-roboto text-[#282828] mt-[6px] leading-[20px]">
                                                {item.desc}
                                            </p>

                                            {/* IMAGE */}
                                            <img
                                                src={item.image}
                                                className="w-full h-[220px] object-cover rounded-xl mt-[12px]"
                                            />

                                            {/* LIKE / COMMENT / SHARE */}
                                            <div className="flex items-center gap-8 mt-4 select-none">

                                                {/* ❤️ LIKE WITH POP ANIMATION */}
                                                <button
                                                    onClick={() => toggleLike(item.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <motion.div
                                                        initial={{ scale: 1 }}
                                                        animate={{ scale: state.liked ? 1.4 : 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Heart
                                                            size={20}
                                                            className={`${state.liked
                                                                ? "text-red-500 fill-red-500"
                                                                : "text-red-500"
                                                                }`}
                                                        />
                                                    </motion.div>

                                                    <span className="text-[14px] text-[#282828]">
                                                        {state.liked ? item.likes + 1 : item.likes} Likes
                                                    </span>
                                                </button>

                                                {/* 💬 COMMENTS DRAWER BUTTON */}
                                                <button
                                                    onClick={() => toggleComments(item.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <MessageCircle
                                                        size={20}
                                                        className={`${state.commentsActive
                                                            ? "text-[#43C17A] fill-[#43C17A]"
                                                            : "text-[#43C17A]"
                                                            }`}
                                                    />
                                                    <span className="text-[14px] text-[#282828]">
                                                        {item.comments} Comments
                                                    </span>
                                                </button>

                                                {/* 🔄 SHARE POPUP */}
                                                <button
                                                    onClick={() => toggleShare(item.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Share2
                                                        size={20}
                                                        className={`${state.shared
                                                            ? "text-[#43C17A] fill-[#43C17A]"
                                                            : "text-[#43C17A]"
                                                            }`}
                                                    />
                                                    <span className="text-[14px] text-[#282828]">
                                                        {state.shared ? item.shares + 1 : item.shares} Shares
                                                    </span>
                                                </button>
                                            </div>

                                            {/* ===========================
                 COMMENT DRAWER (BOTTOM)
               =========================== */}
                                            <AnimatePresence>
                                                {state.commentsActive && (
                                                    <motion.div
                                                        initial={{ y: "100%" }}
                                                        animate={{ y: 0 }}
                                                        exit={{ y: "100%" }}
                                                        transition={{ type: "spring", stiffness: 120 }}
                                                        className="fixed bottom-0 left-0 right-0 h-[45vh] bg-white rounded-t-3xl p-5 shadow-xl z-[2000]"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="text-lg font-medium">Comments</h3>
                                                            <button onClick={() => toggleComments(item.id)}>
                                                                <X className="text-gray-500" />
                                                            </button>
                                                        </div>

                                                        <p className="mt-4 text-gray-500 text-sm">
                                                            Comment section coming soon...
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* ===========================
                 SHARE POPUP 
               =========================== */}
                                            <AnimatePresence>
                                                {state.shared && (
                                                    <motion.div
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="fixed inset-0 bg-black/30 flex items-center justify-center z-[2100]"
                                                        onClick={() => toggleShare(item.id)}
                                                    >
                                                        <div
                                                            className="bg-white rounded-xl p-6 w-[260px]"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <h3 className="text-lg font-medium">Share Post</h3>

                                                            <div className="mt-4 space-y-3">
                                                                <button className="w-full p-2 bg-[#EAF7F1] rounded-md text-[#43C17A]">
                                                                    Copy Link
                                                                </button>
                                                                <button className="w-full p-2 bg-[#EAF7F1] rounded-md text-[#43C17A]">
                                                                    Share to WhatsApp
                                                                </button>
                                                                <button className="w-full p-2 bg-[#EAF7F1] rounded-md text-[#43C17A]">
                                                                    Share to Instagram
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                        </div>
                                    );
                                })}

                            </div>
                        </motion.div>

                        {/* ⭐ ADD POST MODAL MUST BE HERE ⭐ */}
                        <AddPostModal
                            isOpen={isAddPostOpen}
                            onClose={() => setIsAddPostOpen(false)}
                        />
                    </>
                </Portal>
            )
            }
        </AnimatePresence >
    );
}
