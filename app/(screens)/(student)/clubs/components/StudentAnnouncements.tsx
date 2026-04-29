"use client";

import { PaperPlaneRightIcon, DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react";
import { useState, useRef, useEffect, UIEvent } from "react";
import { motion } from 'framer-motion'
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { fetchAnnouncements, postStudentAnnouncement, updateAnnouncement, deleteAnnouncement, subscribeToClubAnnouncements, broadcastNewAnnouncement, fetchSingleAnnouncement } from "@/lib/helpers/clubActivity/studentAnnouncementAPI";
import { StudentAnnouncementsShimmer } from "../shimmers/StudentAnnouncementsShimmer";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { Avatar } from "@/app/utils/Avatar";

const FETCH_LIMIT = 5;

export const formatChatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return `Today ${timeString}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${timeString}`;
    }

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
    userRole?: string | null;
    clubId: number;
    collegeId: number;
    studentId: number;
    onDateChange?: (date: string) => void;
}

export default function StudentAnnouncements({ userRole, clubId, collegeId, studentId, onDateChange }: Props) {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [isPosting, setIsPosting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isFetchingRef = useRef(false);
    const channelRef = useRef<any>(null);
    const onDateChangeRef = useRef(onDateChange);

    const processedIds = useRef<Set<number>>(new Set());

    const canPost = userRole === "president" || userRole === "vicepresident";

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior
            });
        }
    };

    useEffect(() => { onDateChangeRef.current = onDateChange; }, [onDateChange]);

    // useEffect(() => {
    //     if (!clubId) return;

    //     const loadInitial = async () => {
    //         try {
    //             const data = await fetchAnnouncements(clubId, undefined, FETCH_LIMIT);
    //             setMessages(data.reverse());
    //             setHasMore(data.length === FETCH_LIMIT);

    //             if (data.length > 0 && onDateChange) {
    //                 onDateChange(getMessageDateHeader(data[data.length - 1].createdAt));
    //             }

    //             setTimeout(() => scrollToBottom('auto'), 100);
    //         } catch (err) {
    //             toast.error("Failed to load announcements", { id: "load-err" });
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     loadInitial();

    //     const channel = supabase.channel(`club_${clubId}_announcements`)
    //         .on('postgres_changes', { event: '*', schema: 'public', table: 'club_announcements', filter: `clubId=eq.${clubId}` }, (payload) => {
    //             if (payload.eventType === 'INSERT') {
    //                 setTimeout(async () => {
    //                     const { data, error } = await supabase
    //                         .from("club_announcements")
    //                         .select(`*, authorStudent:students!club_announcements_authorStudentId_fkey(users(fullName, user_profile(profileUrl))), authorFaculty:faculty!club_announcements_authorFacultyId_fkey(users(fullName, user_profile(profileUrl)))`)
    //                         .eq("announcementId", payload.new.announcementId)
    //                         .single();

    //                     if (data && !error) {
    //                         setMessages(prev => {
    //                             if (prev.some(m => m.announcementId === data.announcementId)) return prev;
    //                             return [...prev, data];
    //                         });
    //                         setTimeout(() => scrollToBottom('smooth'), 100);
    //                     }
    //                 }, 300);
    //             } else if (payload.eventType === 'UPDATE') {
    //                 if (payload.new.is_deleted) {
    //                     setMessages(prev => prev.filter(m => m.announcementId !== payload.new.announcementId));
    //                 } else {
    //                     setMessages(prev => prev.map(m => m.announcementId === payload.new.announcementId
    //                         ? { ...m, ...payload.new }
    //                         : m
    //                     ));
    //                 }
    //             }
    //         })
    //         .subscribe();

    //     return () => { supabase.removeChannel(channel); };
    // }, [clubId]);


    // CHANGED: Update this entire useEffect block in StudentAnnouncements.tsx

    const appendMessage = (msg: any) => {
        setMessages(prev => {
            if (prev.some(m => m.announcementId === msg.announcementId)) return prev;
            return [...prev, msg];
        });
        setTimeout(() => scrollToBottom('smooth'), 100);
    };

    useEffect(() => {
        if (!clubId) return;
        const abortController = new AbortController();

        const loadInitial = async () => {
            try {
                setLoading(true);
                const data = await fetchAnnouncements(clubId, undefined, FETCH_LIMIT, abortController.signal);

                if (!abortController.signal.aborted) {
                    setMessages(data.reverse());
                    setHasMore(data.length === FETCH_LIMIT);
                    if (data.length > 0 && onDateChangeRef.current) {
                        onDateChangeRef.current(getMessageDateHeader(data[data.length - 1].createdAt));
                    }
                    setTimeout(() => scrollToBottom('auto'), 100);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError' && err.code !== '57014' && !abortController.signal.aborted) {
                    toast.error("Network is unstable, but we are trying to connect...", { id: "load-err" });
                }
            } finally {
                if (!abortController.signal.aborted) setLoading(false);
            }
        };

        loadInitial();

        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channel = subscribeToClubAnnouncements(clubId, {
            onInsertBroadcast: (payload) => {
                if (abortController.signal.aborted) return;

                processedIds.current.add(payload.announcementId);

                appendMessage(payload);
                if (onDateChangeRef.current) onDateChangeRef.current("Today");
            },
            onPostgresFallback: (payload) => {
                if (abortController.signal.aborted) return;

                if (processedIds.current.has(payload.new.announcementId)) return;

                setTimeout(() => {
                    if (abortController.signal.aborted || processedIds.current.has(payload.new.announcementId)) return;

                    fetchSingleAnnouncement(payload.new.announcementId).then(data => {
                        if (data && !abortController.signal.aborted) {
                            processedIds.current.add(data.announcementId);
                            appendMessage(data);
                            if (onDateChangeRef.current) onDateChangeRef.current("Today");
                        }
                    }).catch(() => console.warn("Fallback fetch failed."));
                }, 2000);
            },
            onUpdate: (updatedRow) => {
                if (abortController.signal.aborted) return;
                if (updatedRow.is_deleted) {
                    setMessages(prev => prev.filter(m => m.announcementId !== updatedRow.announcementId));
                } else {
                    setMessages(prev => prev.map(m => m.announcementId === updatedRow.announcementId
                        ? { ...m, message: updatedRow.message, updatedAt: updatedRow.updatedAt }
                        : m
                    ));
                }
            }
        });

        channelRef.current = channel;

        return () => {
            abortController.abort();
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [clubId]);

    const fetchOlderMessages = async () => {
        if (!hasMore || isFetchingRef.current || messages.length === 0) return;

        isFetchingRef.current = true;
        setFetchingMore(true);

        const oldestMessage = messages[0];
        try {
            const olderMessages = await fetchAnnouncements(clubId, oldestMessage.createdAt, FETCH_LIMIT);
            if (olderMessages.length < FETCH_LIMIT) setHasMore(false);

            const scrollHeightBefore = scrollRef.current?.scrollHeight || 0;

            setMessages(prev => {
                const existingIds = new Set(prev.map(m => m.announcementId));
                const newUniqueMessages = olderMessages.reverse().filter(m => !existingIds.has(m.announcementId));
                return [...newUniqueMessages, ...prev];
            });

            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight - scrollHeightBefore;
                }
            }, 0);
        } catch (err) {
            toast.error("Failed to load older messages", { id: "pg-err" });
        } finally {
            isFetchingRef.current = false;
            setFetchingMore(false);
        }
    };

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;

        if (target.scrollTop <= 10 && hasMore && !isFetchingRef.current && messages.length > 0) {
            fetchOlderMessages();
        }

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

    // const handleSend = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!inputValue.trim() || inputValue.length > 1000 || !canPost || isPosting) return;
    //     setIsPosting(true);
    //     try {
    //         if (editingId) {
    //             await updateAnnouncement(editingId, inputValue.trim());
    //             setEditingId(null);
    //             toast.success("Announcement updated", { id: "upd-success" });
    //         } else {
    //             const newMessage = await postStudentAnnouncement(clubId, collegeId, studentId, userRole || "president", inputValue.trim());
    //             setMessages(prev => {
    //                 if (prev.some(m => m.announcementId === newMessage.announcementId)) return prev;
    //                 return [...prev, newMessage];
    //             });

    //             if (onDateChange) onDateChange("Today");
    //             setTimeout(() => scrollToBottom('smooth'), 50);
    //         }
    //         setInputValue("");
    //     } catch (err) {
    //         toast.error("Failed to post announcement", { id: "post-err" });
    //     } finally {
    //         setIsPosting(false);
    //     }
    // };

    // const handleSend = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!inputValue.trim() || inputValue.length > 1000 || !canPost || isPosting) return;
    //     setIsPosting(true);
    //     try {
    //         if (editingId) {
    //             await updateAnnouncement(editingId, inputValue.trim());
    //             setEditingId(null);
    //             toast.success("Announcement updated", { id: "upd-success" });
    //         } else {
    //             const newMessage = await postStudentAnnouncement(clubId, collegeId, studentId, userRole || "president", inputValue.trim());
    //             setMessages(prev => {
    //                 if (prev.some(m => m.announcementId === newMessage.announcementId)) return prev;
    //                 return [...prev, newMessage];
    //             });

    //             if (onDateChange) onDateChange("Today");
    //             setTimeout(() => scrollToBottom('smooth'), 50);
    //         }
    //         setInputValue("");
    //     } catch (err) {
    //         toast.error("Slow connection. Failed to post.", { id: "post-err" });
    //     } finally {
    //         setIsPosting(false);
    //     }
    // };

    // const confirmDelete = async () => {
    //     if (!selectedDeleteId) return;
    //     setIsDeleting(true);
    //     try {
    //         await deleteAnnouncement(selectedDeleteId);
    //         setMessages(prev => prev.filter(m => m.announcementId !== selectedDeleteId));
    //         toast.success("Announcement deleted", { id: "del-success" });
    //         setDeleteModalOpen(false);
    //     } catch (err) {
    //         toast.error("Failed to delete", { id: "del-err" });
    //     } finally {
    //         setIsDeleting(false);
    //     }
    // };



    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        const textToPost = inputValue.trim();
        if (!textToPost || textToPost.length > 1000 || !canPost || isPosting) return;

        setIsPosting(true);

        try {
            if (editingId) {
                await updateAnnouncement(editingId, textToPost);
                setMessages(prev => prev.map(m => m.announcementId === editingId
                    ? { ...m, message: textToPost, updatedAt: new Date().toISOString() }
                    : m
                ));
                setEditingId(null);
                toast.success("Announcement updated", { id: "upd-success" });

                setInputValue("");
            } else {
                const newMessage = await postStudentAnnouncement(clubId, collegeId, studentId, userRole || "president", textToPost);

                processedIds.current.add(newMessage.announcementId);
                appendMessage(newMessage);
                if (onDateChangeRef.current) onDateChangeRef.current("Today");

                broadcastNewAnnouncement(channelRef.current, newMessage);

                setInputValue("");
            }
        } catch (err) {
            toast.error("Slow connection. Failed to post.", { id: "post-err" });
        } finally {
            setIsPosting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedDeleteId) return;
        setIsDeleting(true);
        try {
            await deleteAnnouncement(selectedDeleteId);
            setMessages(prev => prev.filter(m => m.announcementId !== selectedDeleteId));
            toast.success("Announcement deleted", { id: "del-success" });
            setDeleteModalOpen(false);
        } catch (err) {
            toast.error("Failed to delete", { id: "del-err" });
        } finally {
            setIsDeleting(false);
        }
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
                {messages.length === 0 && !loading && (
                    <div className="flex h-full flex-col items-center justify-center text-center opacity-80 animate-in fade-in duration-500">
                        <div className="bg-[#16284F]/10 p-6 h-24 w-24 flex items-center justify-center rounded-full mb-4">
                            <span className="text-4xl">📢</span>
                        </div>
                        <p className="text-lg font-bold text-[#16284F] mb-1">No Announcements Yet</p>
                        <p className="text-sm font-medium text-gray-500 max-w-xs">
                            {canPost ? "Be the first to share an update or important information with the club!" : "When club leaders post updates, they will appear here."}
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-4 pb-2 min-h-full justify-end">

                    {hasMore && messages.length > 0 && (
                        <div className="flex justify-center py-2 animate-in fade-in">
                            <button onClick={fetchOlderMessages} disabled={fetchingMore} className="cursor-pointer text-xs font-bold text-gray-400 hover:text-[#16284F] transition-colors py-2 px-4 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 border border-gray-200">
                                {fetchingMore ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#16284F] border-t-transparent inline-block align-middle mr-2"></span> : null}
                                {fetchingMore ? "Loading..." : "Load older messages"}
                            </button>
                        </div>
                    )}

                    {messages.map((announcement) => {
                        const authorInfo = getAuthorDetails(announcement);
                        const isMyMessage = announcement.authorStudentId === studentId;
                        const dateStr = getMessageDateHeader(announcement.createdAt);
                        const formattedRole = formatRoleDisplay(announcement.authorRole);

                        return (
                            <div key={announcement.announcementId} data-date={dateStr} className="flex flex-col">
                                <div className="group flex items-start gap-4 px-1 relative">
                                    <div className="flex-1 rounded-2xl bg-white p-4 shadow-md border-2 border-[#CCCCCC] transition-all hover:border-[#16284F]/30 relative">

                                        {isMyMessage && (
                                            <div className="absolute top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 group/menu">
                                                <button className="p-1 text-gray-400 hover:text-[#16284F] rounded-full transition-colors cursor-pointer">
                                                    <DotsThreeVertical size={24} weight="bold" />
                                                </button>

                                                <div className="absolute z-50 right-0 top-full mt-0 hidden w-32 flex-col rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl group-hover/menu:flex animate-in fade-in zoom-in-95 duration-200">
                                                    <button onClick={() => { setEditingId(announcement.announcementId); setInputValue(announcement.message); }} className="cursor-pointer flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#16284F]">
                                                        <PencilSimple size={16} weight="bold" /> Edit
                                                    </button>
                                                    <button onClick={() => { setSelectedDeleteId(announcement.announcementId); setDeleteModalOpen(true); }} className="cursor-pointer flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600">
                                                        <Trash size={16} weight="bold" /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}

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
                                        {announcement.updatedAt &&
                                            new Date(announcement.updatedAt).getTime() > new Date(announcement.createdAt).getTime() + 1000 && (
                                                <div className="flex justify-end mt-1">
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        Edited
                                                    </span>
                                                </div>
                                            )}
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

            {canPost && (
                <form onSubmit={handleSend} className="mt-2 pb-2 px-1">
                    <div className="flex items-center gap-4">
                        <motion.div initial={false} animate={{ scale: inputValue.trim() && !isPosting ? 1.01 : 1 }} className="relative flex-1">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isPosting}
                                maxLength={1000}
                                placeholder={editingId ? "Edit announcement..." : "Type here........"}
                                className="w-full rounded-full bg-[#E5E5E5] py-3.5 pl-6 pr-14 text-sm font-medium text-[#282828] placeholder-[#6F6F6F] border-2 border-transparent focus:border-[#16284F]/20 focus:bg-white focus:shadow-lg outline-none transition-all duration-300 disabled:opacity-70"
                            />

                            {editingId && !isPosting && (
                                <button type="button" onClick={() => { setEditingId(null); setInputValue(""); }} className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-red-500 font-bold hover:underline cursor-pointer">
                                    Cancel
                                </button>
                            )}

                            <div className="absolute right-2 top-1/2 -translate-y-1/2  overflow-hidden rounded-full">
                                <motion.button
                                    type="submit"
                                    disabled={!inputValue.trim() || isPosting}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9, rotate: -10 }}
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: inputValue.trim() ? 0 : 50, opacity: inputValue.trim() ? 1 : 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="flex h-10 w-10 items-center justify-center bg-[#16284F] text-white shadow-lg disabled:bg-gray-400 cursor-pointer"
                                >
                                    {isPosting ? (
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    ) : (
                                        <PaperPlaneRightIcon size={22} weight="fill" className="ml-0.5" />
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                        <div className="w-12 shrink-0" />
                    </div>
                    <div className="flex justify-end px-4 mt-1 pl-6 pr-17">
                        <span className={`text-[10px] ${inputValue.length >= 1000 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            {inputValue.length}/1000
                        </span>
                    </div>
                </form>
            )}

            <ConfirmDeleteModal
                open={deleteModalOpen}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                title="Delete"
                name="this announcement"
                actionType="remove"
            />
        </div>
    );
}