"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Link,
  Check,
} from "lucide-react";
import { createPortal } from "react-dom";
import { MegaphoneIcon } from "@phosphor-icons/react";
import { Plus } from "lucide-react";
import AddPostModal from "./AddPostModal";
import { useUser } from "@/app/utils/context/UserContext";

import { fetchCampusBuzzFeed } from "@/lib/helpers/campusBuzz/campusBuzzAPI";
import {
  checkCampusBuzzPostLiked,
  fetchCampusBuzzPostLikeCount,
  toggleCampusBuzzPostLike,
} from "@/lib/helpers/campusBuzz/campusBuzzPostLikesAPI";
import {
  fetchCampusBuzzPostCommentCount,
  fetchCampusBuzzPostComments,
  addCampusBuzzPostComment,
} from "@/lib/helpers/campusBuzz/campusBuzzPostCommentsAPI";
import {
  fetchCampusBuzzPostShareCount,
  shareCampusBuzzPost,
} from "@/lib/helpers/campusBuzz/campusBuzzPostSharesAPI";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  highlightedPostId?: number | null;
};

const tabs = [
  "All",
  "Achievements",
  "Announcements",
  "Clubs & Activities",
] as const;

type InteractionState = {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  commentsActive: boolean;
  sharedActive: boolean;
};

const getAvatarStyle = (userId: number) => {
  const hue = (userId * 137.508) % 360;
  return { backgroundColor: `hsl(${hue}, 65%, 45%)`, color: "white" };
};

const getInitials = (name?: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export default function AnnouncementModal({
  isOpen,
  onClose,
  highlightedPostId,
}: Props) {
  const { collegeId, userId, fullName } = useUser();

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");

  const [interactions, setInteractions] = useState<
    Record<number, InteractionState>
  >({});
  const [postComments, setPostComments] = useState<Record<number, any[]>>({});
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [copiedLinkPostId, setCopiedLinkPostId] = useState<number | null>(null);

  const loadPosts = async () => {
    if (!collegeId || !userId) return;
    setIsLoading(true);
    try {
      const data = await fetchCampusBuzzFeed(collegeId);

      let sortedData = data;
      if (highlightedPostId) {
        sortedData = [...data].sort((a, b) => {
          if (a.campusBuzzPostId === highlightedPostId) return -1;
          if (b.campusBuzzPostId === highlightedPostId) return 1;
          return 0;
        });
      }

      setPosts(sortedData);
      const newInteractions: Record<number, InteractionState> = {};

      await Promise.all(
        data.map(async (post: any) => {
          const pId = post.campusBuzzPostId;

          const [likeCount, userLikedStatus, commentCount, shareCount] =
            await Promise.all([
              fetchCampusBuzzPostLikeCount(pId),
              checkCampusBuzzPostLiked(pId, userId),
              fetchCampusBuzzPostCommentCount(pId),
              fetchCampusBuzzPostShareCount(pId),
            ]);

          newInteractions[pId] = {
            likeCount,
            liked: userLikedStatus.liked,
            commentCount,
            shareCount,
            commentsActive: false,
            sharedActive: false,
          };
        }),
      );

      setInteractions(newInteractions);
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadPosts();
  }, [isOpen, collegeId, userId]);

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "All") return true;
    if (activeTab === "Achievements" && post.category === "achievements")
      return true;
    if (activeTab === "Announcements" && post.category === "announcements")
      return true;
    if (
      activeTab === "Clubs & Activities" &&
      post.category === "clubactivities"
    )
      return true;
    return false;
  });

  // --- ACTIONS ---
  const handleToggleLike = async (postId: number) => {
    if (!userId) return;
    const isCurrentlyLiked = interactions[postId].liked;

    setInteractions((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        liked: !isCurrentlyLiked,
        likeCount: isCurrentlyLiked
          ? prev[postId].likeCount - 1
          : prev[postId].likeCount + 1,
      },
    }));

    const response = await toggleCampusBuzzPostLike(postId, userId);
    if (!response.success) {
      setInteractions((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          liked: isCurrentlyLiked,
          likeCount: isCurrentlyLiked
            ? prev[postId].likeCount + 1
            : prev[postId].likeCount - 1,
        },
      }));
    }
  };

  const handleToggleComments = async (postId: number) => {
    const willBeActive = !interactions[postId].commentsActive;

    setInteractions((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], commentsActive: willBeActive },
    }));

    if (willBeActive && !postComments[postId]) {
      const comments = await fetchCampusBuzzPostComments(postId);
      setPostComments((prev) => ({ ...prev, [postId]: comments }));
    }
  };

  const handleSubmitComment = async (postId: number) => {
    if (!userId || !newCommentText.trim()) return;
    setIsSubmittingComment(true);

    try {
      const res = await addCampusBuzzPostComment(
        { campusBuzzPostId: postId, comment: newCommentText },
        userId,
      );
      if (res.success) {
        const updatedComments = await fetchCampusBuzzPostComments(postId);
        setPostComments((prev) => ({ ...prev, [postId]: updatedComments }));
        setNewCommentText("");

        setInteractions((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            commentCount: prev[postId].commentCount + 1,
          },
        }));
      }
    } catch (error) {
      console.error("Error adding comment", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleToggleShareMenu = (postId: number) => {
    setInteractions((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], sharedActive: !prev[postId].sharedActive },
    }));
  };

  const handleShareAction = async (postId: number, platform: string) => {
    if (!userId) return;

    const postUrl = `${window.location.origin}${window.location.pathname}?post=${postId}`;

    if (platform === "copy-link") {
      navigator.clipboard.writeText(postUrl);
      setCopiedLinkPostId(postId);
      setTimeout(() => setCopiedLinkPostId(null), 2000);
    } else if (platform === "whatsapp") {
      window.open(
        `https://api.whatsapp.com/send?text=Check out this update on Campus Buzz: ${encodeURIComponent(postUrl)}`,
        "_blank",
      );
    }

    await shareCampusBuzzPost(
      { campusBuzzPostId: postId, sharedTo: platform },
      userId,
    );

    setInteractions((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        sharedActive: false,
        shareCount: prev[postId].shareCount + 1,
      },
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <>
            <motion.div
              onClick={onClose}
              className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed z-[1000] top-[80px] left-[745px] w-[500px] h-[80vh] bg-white translate-x-6 rounded-xl shadow-xl overflow-hidden flex flex-col"
            >
              <div className="px-[20px] pt-[20px] shrink-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <MegaphoneIcon size={32} weight="fill" color="#43C17A" />
                    <h2 className="text-[22px] font-roboto font-semibold text-[#282828] leading-none">
                      Campus Buzz
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    {!isAddPostOpen && (
                      <button
                        onClick={() => setIsAddPostOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-[6px] rounded-full bg-[rgba(67,193,122,0.12)] text-[#43C17A] text-[16px] font-medium transition-colors hover:bg-[rgba(67,193,122,0.2)]"
                      >
                        <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        <span>Add Post</span>
                      </button>
                    )}
                    <button onClick={onClose}>
                      <X className="w-6 h-6 text-[#6B7280] hover:text-black transition-colors" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-[16px] px-[20px]">
                <div className="flex items-center justify-between w-full h-[45px] px-6 rounded-full bg-[#ECECEC]">
                  <input
                    placeholder="Search updates..."
                    className="w-full bg-transparent outline-none text-[16px] font-roboto text-[#282828] placeholder:text-gray-500"
                  />
                  <Search className="w-[20px] h-[24px] text-[#43C17A]" />
                </div>
              </div>

              <div className="mt-4 px-[20px] shrink-0 border-b pb-3">
                <div className="flex gap-3 overflow-x-auto scrollbar-none">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 h-[32px] rounded-[48px] text-[14px] font-roboto font-medium flex items-center justify-center whitespace-nowrap transition-colors ${
                        activeTab === tab
                          ? "bg-[#43C17A] text-white"
                          : "bg-[#EAF7F1] text-[#43C17A]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* FEED */}
              <div className="flex-1 px-[20px] overflow-y-auto space-y-8 pb-6 pt-4 custom-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    Loading feed...
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                    <MegaphoneIcon size={48} opacity={0.3} />
                    <p>No posts found. Be the first to share!</p>
                  </div>
                ) : (
                  filteredPosts.map((item) => {
                    const postId = item.campusBuzzPostId;
                    const state = interactions[postId] || {
                      liked: false,
                      likeCount: 0,
                      commentCount: 0,
                      shareCount: 0,
                      commentsActive: false,
                      sharedActive: false,
                    };

                    const tagArray = Array.isArray(item.tags)
                      ? item.tags
                      : typeof item.tags === "string"
                        ? item.tags.split(",").map((t: string) => t.trim())
                        : [];

                    const authorName = item.users?.fullName || "Campus Member";
                    const authorId = item.createdBy;

                    return (
                      <div
                        key={postId}
                        className="relative bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner"
                            style={getAvatarStyle(authorId)}
                          >
                            {getInitials(authorName)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-[#282828] leading-tight">
                              {authorName}
                            </span>
                            <span className="text-[12px] text-gray-400">
                              {new Date(item.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-[17px] font-roboto font-semibold text-[#282828]">
                          {item.title}
                        </h3>
                        <p className="text-[15px] font-roboto text-gray-700 mt-[4px] leading-relaxed">
                          {item.description}
                        </p>

                        {tagArray.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-3">
                            {tagArray.map((tag: string, i: number) => (
                              <span
                                key={i}
                                className="text-[12px] text-[#43C17A] bg-[#EAF7F1] px-2 py-1 rounded-md font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full max-h-[280px] object-cover rounded-xl mt-[12px] border border-gray-100"
                          />
                        )}

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 select-none">
                          <div className="flex items-center gap-6">
                            <button
                              onClick={() => handleToggleLike(postId)}
                              className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors"
                            >
                              <motion.div
                                initial={{ scale: 1 }}
                                animate={{ scale: state.liked ? 1.3 : 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Heart
                                  size={20}
                                  className={
                                    state.liked
                                      ? "text-red-500 fill-red-500"
                                      : "text-gray-500"
                                  }
                                />
                              </motion.div>
                              <span
                                className={`text-[14px] font-medium ${state.liked ? "text-red-500" : "text-gray-600"}`}
                              >
                                {state.likeCount}
                              </span>
                            </button>

                            <button
                              onClick={() => handleToggleComments(postId)}
                              className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors"
                            >
                              <MessageCircle
                                size={20}
                                className={
                                  state.commentsActive
                                    ? "text-[#43C17A] fill-[#43C17A]"
                                    : "text-gray-500"
                                }
                              />
                              <span
                                className={`text-[14px] font-medium ${state.commentsActive ? "text-[#43C17A]" : "text-gray-600"}`}
                              >
                                {state.commentCount}
                              </span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleToggleShareMenu(postId)}
                            className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors"
                          >
                            <Share2 size={18} className="text-gray-500" />
                            <span className="text-[14px] font-medium text-gray-600">
                              Share
                            </span>
                          </button>
                        </div>

                        <AnimatePresence>
                          {state.commentsActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-3"
                            >
                              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-inner"
                                    style={getAvatarStyle(userId!)}
                                  >
                                    {getInitials(fullName!)}
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={newCommentText}
                                    onChange={(e) =>
                                      setNewCommentText(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                      e.key === "Enter" &&
                                      handleSubmitComment(postId)
                                    }
                                    className="flex-1 h-9 px-4 rounded-full border border-gray-200 outline-none text-[14px] focus:border-[#43C17A] transition-colors bg-white shadow-sm"
                                  />
                                  <button
                                    onClick={() => handleSubmitComment(postId)}
                                    disabled={
                                      isSubmittingComment ||
                                      !newCommentText.trim()
                                    }
                                    className="p-2 bg-[#43C17A] text-white rounded-full hover:bg-[#3ba869] disabled:opacity-50 transition-colors shadow-sm"
                                  >
                                    <Send size={14} />
                                  </button>
                                </div>

                                <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto custom-scrollbar">
                                  {postComments[postId] === undefined ? (
                                    <div className="text-center text-xs text-gray-400 py-2">
                                      Loading...
                                    </div>
                                  ) : postComments[postId].length === 0 ? (
                                    <div className="text-center text-xs text-gray-400 py-2">
                                      No comments yet.
                                    </div>
                                  ) : (
                                    postComments[postId].map((comment: any) => (
                                      <div
                                        key={comment.campusBuzzPostCommentId}
                                        className="flex gap-2"
                                      >
                                        <div
                                          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[10px] shadow-inner mt-1"
                                          style={getAvatarStyle(
                                            comment.commentedBy,
                                          )}
                                        >
                                          {getInitials(comment.users?.fullName)}
                                        </div>
                                        <div className="flex flex-col bg-white px-3 py-2 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm">
                                          <span className="font-semibold text-[#282828] text-[13px]">
                                            {comment.users?.fullName ||
                                              "Campus Member"}
                                          </span>
                                          <span className="text-gray-700 text-[14px] leading-snug mt-0.5">
                                            {comment.comment}
                                          </span>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {state.sharedActive && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-4 bottom-14 z-[2100]"
                            >
                              <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 p-2 w-[220px]">
                                <button
                                  onClick={() =>
                                    handleShareAction(postId, "copy-link")
                                  }
                                  className="w-full flex items-center justify-between p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <Link size={16} /> Copy Link
                                  </span>
                                  {copiedLinkPostId === postId && (
                                    <Check
                                      size={16}
                                      className="text-[#43C17A]"
                                    />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleShareAction(postId, "whatsapp")
                                  }
                                  className="w-full flex items-center gap-2 p-3 text-sm text-gray-700 hover:bg-[#EAF7F1] hover:text-[#43C17A] rounded-lg transition-colors"
                                >
                                  <Share2 size={16} /> Share to WhatsApp
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>

            <AddPostModal
              isOpen={isAddPostOpen}
              onClose={() => setIsAddPostOpen(false)}
              onSuccess={loadPosts}
            />
          </>
        </Portal>
      )}
    </AnimatePresence>
  );
}
