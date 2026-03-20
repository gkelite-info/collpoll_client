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
  Loader2,
  MoreHorizontal,
  Trash2,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { createPortal } from "react-dom";
import { MegaphoneIcon } from "@phosphor-icons/react";
import { Plus } from "lucide-react";
import AddPostModal from "./AddPostModal";
import { useUser } from "@/app/utils/context/UserContext";

// --- IMPORT YOUR HELPERS ---
import {
  fetchCampusBuzzFeed,
  deactivateCampusBuzzPost,
} from "@/lib/helpers/campusBuzz/campusBuzzAPI";
import {
  checkCampusBuzzPostLiked,
  fetchCampusBuzzPostLikeCount,
  toggleCampusBuzzPostLike,
} from "@/lib/helpers/campusBuzz/campusBuzzPostLikesAPI";
import {
  fetchCampusBuzzPostCommentCount,
  fetchCampusBuzzPostComments,
  addCampusBuzzPostComment,
  updateCampusBuzzPostComment,
  deleteCampusBuzzPostComment,
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

// --- UX HELPERS ---
const getAvatarStyle = (userId: number) => {
  const hue = (userId * 137.508) % 360;
  return { backgroundColor: `hsl(${hue}, 65%, 45%)`, color: "white" };
};

const getInitials = (name?: string) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

const formatTimeAgo = (dateString: string) => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 1000,
  );
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const RoleFlair = ({ role }: { role?: string }) => {
  if (!role) return null;
  const isStaff = [
    "Faculty",
    "Admin",
    "CollegeAdmin",
    "CollegeHr",
    "SuperAdmin",
  ].includes(role);
  return (
    <span
      className={`text-[10px] px-2 py-[2px] rounded-full font-medium ${isStaff ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-gray-100 text-gray-600 border border-gray-200"}`}
    >
      {role}
    </span>
  );
};

const PostSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-32 bg-gray-200 rounded"></div>
        <div className="h-2 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
    <div className="h-3 w-5/6 bg-gray-200 rounded mb-4"></div>
    <div className="w-full h-[220px] bg-gray-200 rounded-xl"></div>
  </div>
);

type Props = {
  isOpen: boolean;
  onClose: () => void;
  highlightedPostId?: number | null;
};

type InteractionState = {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  commentsActive: boolean;
  sharedActive: boolean;
  menuOpen: boolean;
};

const tabs = [
  "All",
  "Achievements",
  "Announcements",
  "Clubs & Activities",
] as const;

export default function AnnouncementModal({
  isOpen,
  onClose,
  highlightedPostId,
}: Props) {
  const { collegeId, userId, fullName } = useUser();

  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [interactions, setInteractions] = useState<
    Record<number, InteractionState>
  >({});
  const [postComments, setPostComments] = useState<Record<number, any[]>>({});
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    postId: number;
    commentId: number;
    userName: string;
  } | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [editPostData, setEditPostData] = useState<any>(null);
  const [copiedLinkPostId, setCopiedLinkPostId] = useState<number | null>(null);

  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    type: "post" | "comment";
    parentPostId?: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeCommentMenuId, setActiveCommentMenuId] = useState<number | null>(
    null,
  );
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPosts = async (
    pageNumber = 0,
    isRefresh = false,
    searchQuery = "",
  ) => {
    if (!collegeId || !userId) return;
    isRefresh ? setIsLoading(true) : setIsLoadingMore(true);

    try {
      const data = await fetchCampusBuzzFeed(
        collegeId,
        pageNumber,
        POSTS_PER_PAGE,
        searchQuery,
      );
      if (data.length < POSTS_PER_PAGE) setHasMore(false);
      else setHasMore(true);

      let sortedData = isRefresh ? data : [...posts, ...data];

      if (highlightedPostId && isRefresh && !searchQuery) {
        sortedData = [...sortedData].sort((a, b) => {
          if (a.campusBuzzPostId === highlightedPostId) return -1;
          if (b.campusBuzzPostId === highlightedPostId) return 1;
          return 0;
        });
      }

      setPosts(sortedData);

      const newInteractions: Record<number, InteractionState> = isRefresh
        ? {}
        : { ...interactions };

      await Promise.all(
        data.map(async (post: any) => {
          const pId = post.campusBuzzPostId;
          if (!newInteractions[pId]) {
            const [likeCount, userLikedStatus, commentCount, shareCount] =
              await Promise.all([
                fetchCampusBuzzPostLikeCount(pId),
                checkCampusBuzzPostLiked(pId, userId),
                fetchCampusBuzzPostCommentCount(pId),
                fetchCampusBuzzPostShareCount(pId),
              ]);
            newInteractions[pId] = {
              likeCount,
              liked: userLikedStatus?.liked || false,
              commentCount,
              shareCount,
              commentsActive: !!(highlightedPostId === pId),
              sharedActive: false,
              menuOpen: false,
            };
          }
        }),
      );
      setInteractions(newInteractions);

      if (highlightedPostId && isRefresh && !searchQuery) {
        handleToggleComments(highlightedPostId, true);
      }
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPage(0);
      loadPosts(0, true, debouncedSearch);
    }
  }, [isOpen, collegeId, userId, highlightedPostId, debouncedSearch]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, false, debouncedSearch);
  };

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

    const currentState = interactions[postId];
    if (!currentState) return;

    const isCurrentlyLiked = currentState.liked;
    const newLikeCount = isCurrentlyLiked
      ? Math.max(0, currentState.likeCount - 1)
      : currentState.likeCount + 1;

    // Optimistic Update
    setInteractions((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        liked: !isCurrentlyLiked,
        likeCount: newLikeCount,
      },
    }));

    try {
      const response = await toggleCampusBuzzPostLike(postId, userId);
      if (!response || !response.success)
        throw new Error("Like toggle failed on backend");
    } catch (err) {
      // Revert if failed
      setInteractions((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          liked: isCurrentlyLiked,
          likeCount: currentState.likeCount,
        },
      }));
    }
  };

  const handleToggleComments = async (postId: number, forceOpen = false) => {
    const willBeActive = forceOpen
      ? true
      : !interactions[postId]?.commentsActive;
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
      const payload = {
        campusBuzzPostId: postId,
        comment: newCommentText,
        parentCommentId:
          replyingTo?.postId === postId ? replyingTo.commentId : null,
      };
      const res = await addCampusBuzzPostComment(payload, userId);
      if (res.success) {
        const updatedComments = await fetchCampusBuzzPostComments(postId);
        setPostComments((prev) => ({ ...prev, [postId]: updatedComments }));
        setNewCommentText("");
        setReplyingTo(null);
        setInteractions((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            commentCount: prev[postId].commentCount + 1,
          },
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditCommentSubmit = async (postId: number, commentId: number) => {
    if (!editingCommentText.trim()) return;
    const res = await updateCampusBuzzPostComment(
      commentId,
      editingCommentText,
    );
    if (res.success) {
      setPostComments((prev) => ({
        ...prev,
        [postId]: prev[postId].map((c) =>
          c.campusBuzzPostCommentId === commentId
            ? { ...c, comment: editingCommentText }
            : c,
        ),
      }));
      setEditingCommentId(null);
    }
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

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (itemToDelete.type === "post") {
        const res = await deactivateCampusBuzzPost(itemToDelete.id);
        if (res.success) {
          setPosts((prev) =>
            prev.filter((p) => p.campusBuzzPostId !== itemToDelete.id),
          );
        }
      } else if (itemToDelete.type === "comment") {
        const res = await deleteCampusBuzzPostComment(itemToDelete.id);
        if (res.success && itemToDelete.parentPostId) {
          setPostComments((prev) => ({
            ...prev,
            [itemToDelete.parentPostId!]: prev[
              itemToDelete.parentPostId!
            ].filter((c) => c.campusBuzzPostCommentId !== itemToDelete.id),
          }));
          setInteractions((prev) => ({
            ...prev,
            [itemToDelete.parentPostId!]: {
              ...prev[itemToDelete.parentPostId!],
              commentCount: Math.max(
                0,
                prev[itemToDelete.parentPostId!].commentCount - 1,
              ),
            },
          }));
        }
      }
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <>
            <motion.div
              onClick={onClose}
              className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[2px] cursor-pointer"
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
              {/* Header */}
              <div className="px-[20px] pt-[20px] shrink-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 cursor-default">
                    <MegaphoneIcon size={32} weight="fill" color="#43C17A" />
                    <h2 className="text-[22px] font-roboto font-semibold text-[#282828] leading-none">
                      Campus Buzz
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    {!isAddPostOpen && (
                      <button
                        onClick={() => {
                          setEditPostData(null);
                          setIsAddPostOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-[6px] rounded-full bg-[rgba(67,193,122,0.12)] text-[#43C17A] text-[16px] font-medium transition-colors hover:bg-[rgba(67,193,122,0.2)] cursor-pointer"
                      >
                        <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        <span>Add Post</span>
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-[#6B7280]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-[16px] px-[20px]">
                <div
                  className="flex items-center justify-between w-full h-[45px] px-6 rounded-full bg-[#ECECEC] focus-within:ring-2 focus-within:ring-[#43C17A]/20 transition-all cursor-text"
                  onClick={() =>
                    document.getElementById("buzz-search")?.focus()
                  }
                >
                  <input
                    id="buzz-search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search posts or announcements..."
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
                      className={`cursor-pointer px-5 h-[32px] rounded-[48px] text-[14px] font-roboto font-medium flex items-center justify-center whitespace-nowrap transition-colors ${
                        activeTab === tab
                          ? "bg-[#43C17A] text-white"
                          : "bg-[#EAF7F1] text-[#43C17A] hover:bg-[#d8f1e3]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 px-[20px] overflow-y-auto space-y-6 pb-6 pt-4 custom-scrollbar">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <PostSkeleton key={i} />
                  ))
                ) : filteredPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                    <MegaphoneIcon size={48} opacity={0.3} />
                    <p>
                      {debouncedSearch
                        ? "No matching posts found."
                        : "No posts found. Be the first to share!"}
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredPosts.map((item) => {
                      const postId = item.campusBuzzPostId;
                      const state = interactions[postId] || {
                        liked: false,
                        likeCount: 0,
                        commentCount: 0,
                        shareCount: 0,
                        commentsActive: false,
                        sharedActive: false,
                        menuOpen: false,
                      };
                      const tagArray = Array.isArray(item.tags)
                        ? item.tags
                        : typeof item.tags === "string"
                          ? item.tags.split(",").map((t: string) => t.trim())
                          : [];

                      const commentsList = postComments[postId] || [];
                      const parentComments = commentsList.filter(
                        (c) => !c.parentCommentId,
                      );

                      return (
                        <div
                          key={postId}
                          className={`relative bg-white rounded-xl border p-4 shadow-sm transition-colors ${
                            highlightedPostId === postId && !debouncedSearch
                              ? "border-[#43C17A] bg-[#fafffb]"
                              : "border-gray-100"
                          }`}
                        >
                          {/* AUTHOR HEADER & POST 3-DOT MENU */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner"
                                style={getAvatarStyle(item.createdBy)}
                              >
                                {getInitials(item.users?.fullName)}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="text-[15px] font-semibold text-[#282828] leading-tight">
                                    {item.users?.fullName || "Campus Member"}
                                  </span>
                                  <RoleFlair role={item.users?.role} />
                                </div>
                                <span className="text-[12px] text-gray-400">
                                  {formatTimeAgo(item.createdAt)}
                                </span>
                              </div>
                            </div>

                            {item.createdBy === userId && (
                              <div className="relative z-10">
                                <button
                                  onClick={() =>
                                    setInteractions((prev) => ({
                                      ...prev,
                                      [postId]: {
                                        ...prev[postId],
                                        menuOpen: true,
                                      },
                                    }))
                                  }
                                  className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
                                >
                                  <MoreHorizontal
                                    size={20}
                                    className="text-gray-500"
                                  />
                                </button>

                                <AnimatePresence>
                                  {state.menuOpen && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setInteractions((prev) => ({
                                            ...prev,
                                            [postId]: {
                                              ...prev[postId],
                                              menuOpen: false,
                                            },
                                          }));
                                        }}
                                      />
                                      <motion.div
                                        initial={{
                                          opacity: 0,
                                          y: -5,
                                          scale: 0.95,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{
                                          opacity: 0,
                                          y: -5,
                                          scale: 0.95,
                                        }}
                                        className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden"
                                      >
                                        <button
                                          onClick={() => {
                                            setInteractions((prev) => ({
                                              ...prev,
                                              [postId]: {
                                                ...prev[postId],
                                                menuOpen: false,
                                              },
                                            }));
                                            setEditPostData(item);
                                            setIsAddPostOpen(true);
                                          }}
                                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer font-medium"
                                        >
                                          <Pencil size={16} /> Edit Post
                                        </button>
                                        <button
                                          onClick={() => {
                                            setInteractions((prev) => ({
                                              ...prev,
                                              [postId]: {
                                                ...prev[postId],
                                                menuOpen: false,
                                              },
                                            }));
                                            setItemToDelete({
                                              id: postId,
                                              type: "post",
                                            });
                                          }}
                                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                                        >
                                          <Trash2 size={16} /> Delete Post
                                        </button>
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
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

                          {/* ACTION BAR */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 select-none">
                            <div className="flex items-center gap-6">
                              <button
                                onClick={() => handleToggleLike(postId)}
                                className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
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
                                className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
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

                            <div className="relative">
                              <button
                                onClick={() =>
                                  setInteractions((prev) => ({
                                    ...prev,
                                    [postId]: {
                                      ...prev[postId],
                                      sharedActive: true,
                                    },
                                  }))
                                }
                                className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer z-10"
                              >
                                <Share2 size={18} className="text-gray-500" />
                                <span className="text-[14px] font-medium text-gray-600">
                                  {state.shareCount > 0
                                    ? `${state.shareCount} Shares`
                                    : "Share"}
                                </span>
                              </button>

                              <AnimatePresence>
                                {state.sharedActive && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setInteractions((prev) => ({
                                          ...prev,
                                          [postId]: {
                                            ...prev[postId],
                                            sharedActive: false,
                                          },
                                        }));
                                      }}
                                    />
                                    <motion.div
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0.8, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute right-0 bottom-full mb-2 z-20 w-[220px]"
                                    >
                                      <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 p-2">
                                        <button
                                          onClick={() =>
                                            handleShareAction(
                                              postId,
                                              "copy-link",
                                            )
                                          }
                                          className="cursor-pointer w-full flex items-center justify-between p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
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
                                            handleShareAction(
                                              postId,
                                              "whatsapp",
                                            )
                                          }
                                          className="cursor-pointer w-full flex items-center gap-2 p-3 text-sm text-gray-700 hover:bg-[#EAF7F1] hover:text-[#43C17A] rounded-lg transition-colors font-medium mt-1"
                                        >
                                          <Share2 size={16} /> Share to WhatsApp
                                        </button>
                                      </div>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          <AnimatePresence>
                            {state.commentsActive && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-3"
                              >
                                <div className="flex flex-col gap-4 border-t border-gray-50 pt-3">
                                  {replyingTo?.postId === postId && (
                                    <div className="flex items-center justify-between bg-gray-100 text-gray-600 text-[12px] px-3 py-1.5 rounded-md mx-1">
                                      <span>
                                        Replying to{" "}
                                        <strong className="text-gray-800">
                                          {replyingTo?.userName ||
                                            "Campus Member"}
                                        </strong>
                                      </span>
                                      <button
                                        onClick={() => setReplyingTo(null)}
                                        className="cursor-pointer hover:bg-gray-200 p-1 rounded-full transition-colors"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-inner"
                                      style={getAvatarStyle(userId!)}
                                    >
                                      {getInitials(fullName!)}
                                    </div>
                                    <input
                                      type="text"
                                      placeholder={
                                        replyingTo?.postId === postId
                                          ? "Write a reply..."
                                          : "Write a comment..."
                                      }
                                      value={newCommentText}
                                      onChange={(e) =>
                                        setNewCommentText(e.target.value)
                                      }
                                      onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        handleSubmitComment(postId)
                                      }
                                      className="flex-1 h-9 px-4 rounded-full bg-gray-100 border-none outline-none text-[14px] focus:ring-2 focus:ring-[#43C17A]/20 transition-all placeholder:text-gray-400"
                                    />
                                    <button
                                      onClick={() =>
                                        handleSubmitComment(postId)
                                      }
                                      disabled={
                                        isSubmittingComment ||
                                        !newCommentText.trim()
                                      }
                                      className="p-2 bg-[#43C17A] text-white rounded-full hover:bg-[#3ba869] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                                    >
                                      <Send size={14} />
                                    </button>
                                  </div>

                                  <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pb-2">
                                    {postComments[postId] === undefined ? (
                                      <div className="text-center text-xs text-gray-400 py-4 flex items-center justify-center gap-2">
                                        <Loader2
                                          size={14}
                                          className="animate-spin"
                                        />{" "}
                                        Loading...
                                      </div>
                                    ) : parentComments.length === 0 ? (
                                      <div className="text-center text-xs text-gray-400 py-2">
                                        No comments yet.
                                      </div>
                                    ) : (
                                      parentComments.map((comment: any) => {
                                        const replies = commentsList.filter(
                                          (c) =>
                                            c.parentCommentId ===
                                            comment.campusBuzzPostCommentId,
                                        );

                                        const renderComment = (
                                          c: any,
                                          isReply = false,
                                        ) => (
                                          <div
                                            key={c.campusBuzzPostCommentId}
                                            className={`flex gap-2.5 relative ${isReply ? "mt-3" : ""}`}
                                          >
                                            <div
                                              className={`rounded-full flex-shrink-0 flex items-center justify-center font-bold shadow-inner mt-0.5 ${
                                                isReply
                                                  ? "w-6 h-6 text-[9px]"
                                                  : "w-8 h-8 text-[11px]"
                                              }`}
                                              style={getAvatarStyle(
                                                c.commentedBy,
                                              )}
                                            >
                                              {getInitials(c.users?.fullName)}
                                            </div>

                                            <div className="flex flex-col items-start w-full">
                                              <div className="flex items-center justify-between w-full max-w-[85%] gap-2 relative z-0">
                                                {editingCommentId ===
                                                c.campusBuzzPostCommentId ? (
                                                  <div className="flex flex-col gap-2 w-full bg-white border border-gray-200 p-2 rounded-xl shadow-sm">
                                                    <input
                                                      type="text"
                                                      value={editingCommentText}
                                                      onChange={(e) =>
                                                        setEditingCommentText(
                                                          e.target.value,
                                                        )
                                                      }
                                                      onKeyDown={(e) =>
                                                        e.key === "Enter" &&
                                                        handleEditCommentSubmit(
                                                          postId,
                                                          c.campusBuzzPostCommentId,
                                                        )
                                                      }
                                                      className="w-full text-[14px] bg-gray-50 border-none rounded-md px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#43C17A]"
                                                      autoFocus
                                                    />
                                                    <div className="flex items-center gap-2 self-end">
                                                      <button
                                                        onClick={() =>
                                                          setEditingCommentId(
                                                            null,
                                                          )
                                                        }
                                                        className="text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer font-medium"
                                                      >
                                                        Cancel
                                                      </button>
                                                      <button
                                                        onClick={() =>
                                                          handleEditCommentSubmit(
                                                            postId,
                                                            c.campusBuzzPostCommentId,
                                                          )
                                                        }
                                                        className="text-[11px] bg-[#43C17A] text-white px-2.5 py-1 rounded cursor-pointer hover:bg-[#3ba869] font-medium"
                                                      >
                                                        Save
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div className="relative group/bubble flex flex-col bg-[#f0f2f5] px-3.5 py-2.5 rounded-2xl rounded-tl-none w-fit min-w-[140px] pr-8">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                      <span
                                                        className={`font-semibold text-[#282828] leading-tight ${isReply ? "text-[12px]" : "text-[13px]"}`}
                                                      >
                                                        {c.users?.fullName ||
                                                          "Campus Member"}
                                                      </span>
                                                      <RoleFlair
                                                        role={c.users?.role}
                                                      />
                                                    </div>
                                                    <span
                                                      className={`text-[#1c1e21] leading-snug ${isReply ? "text-[13px]" : "text-[14px]"}`}
                                                    >
                                                      {c.comment}
                                                    </span>

                                                    {c.commentedBy === userId &&
                                                      editingCommentId !==
                                                        c.campusBuzzPostCommentId && (
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                                                          <button
                                                            onClick={() =>
                                                              setActiveCommentMenuId(
                                                                c.campusBuzzPostCommentId,
                                                              )
                                                            }
                                                            className="p-1 hover:bg-gray-200 rounded-full cursor-pointer text-gray-500 transition-colors"
                                                          >
                                                            <MoreHorizontal
                                                              size={14}
                                                            />
                                                          </button>
                                                          {activeCommentMenuId ===
                                                            c.campusBuzzPostCommentId && (
                                                            <>
                                                              <div
                                                                className="fixed inset-0 z-10 cursor-default"
                                                                onClick={(
                                                                  e,
                                                                ) => {
                                                                  e.stopPropagation();
                                                                  setActiveCommentMenuId(
                                                                    null,
                                                                  );
                                                                }}
                                                              />
                                                              <div className="absolute left-full top-0 ml-1 w-28 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                                                                <button
                                                                  onClick={() => {
                                                                    setEditingCommentId(
                                                                      c.campusBuzzPostCommentId,
                                                                    );
                                                                    setEditingCommentText(
                                                                      c.comment,
                                                                    );
                                                                    setActiveCommentMenuId(
                                                                      null,
                                                                    );
                                                                  }}
                                                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer font-medium"
                                                                >
                                                                  <Pencil
                                                                    size={12}
                                                                  />{" "}
                                                                  Edit
                                                                </button>
                                                                <button
                                                                  onClick={() => {
                                                                    setItemToDelete(
                                                                      {
                                                                        id: c.campusBuzzPostCommentId,
                                                                        type: "comment",
                                                                        parentPostId:
                                                                          postId,
                                                                      },
                                                                    );
                                                                    setActiveCommentMenuId(
                                                                      null,
                                                                    );
                                                                  }}
                                                                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                                                                >
                                                                  <Trash2
                                                                    size={12}
                                                                  />{" "}
                                                                  Delete
                                                                </button>
                                                              </div>
                                                            </>
                                                          )}
                                                        </div>
                                                      )}
                                                  </div>
                                                )}
                                              </div>

                                              {editingCommentId !==
                                                c.campusBuzzPostCommentId && (
                                                <div className="flex items-center gap-3 px-2 mt-1 text-[11px] text-gray-500 font-medium">
                                                  <span>
                                                    {formatTimeAgo(c.createdAt)}
                                                  </span>
                                                  {!isReply && (
                                                    <button
                                                      onClick={() =>
                                                        setReplyingTo({
                                                          postId,
                                                          commentId:
                                                            c.campusBuzzPostCommentId,
                                                          userName:
                                                            c.users?.fullName ||
                                                            "Campus Member",
                                                        })
                                                      }
                                                      className="hover:text-gray-800 transition-colors cursor-pointer font-semibold"
                                                    >
                                                      Reply
                                                    </button>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );

                                        return (
                                          <div
                                            key={
                                              comment.campusBuzzPostCommentId
                                            }
                                            className="flex flex-col gap-1"
                                          >
                                            {renderComment(comment, false)}
                                            {replies.length > 0 && (
                                              <div className="flex flex-col pl-4 ml-4 border-l-2 border-gray-100 mt-1">
                                                {replies.map((reply) =>
                                                  renderComment(reply, true),
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {hasMore && (
                      <div className="flex justify-center pt-2 pb-4">
                        <button
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="cursor-pointer px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />{" "}
                              Loading...
                            </>
                          ) : (
                            "Load More Posts"
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            <AnimatePresence>
              {itemToDelete !== null && (
                <Portal>
                  <motion.div
                    className="fixed inset-0 z-[3000] bg-black/40 backdrop-blur-sm flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl flex flex-col items-center text-center"
                    >
                      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-[#282828] mb-2">
                        Delete{" "}
                        {itemToDelete.type === "post" ? "Post" : "Comment"}?
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        This action cannot be undone. Are you sure you want to
                        permanently remove this {itemToDelete.type}?
                      </p>

                      <div className="flex w-full gap-3">
                        <button
                          onClick={() => setItemToDelete(null)}
                          disabled={isDeleting}
                          className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDelete}
                          disabled={isDeleting}
                          className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </Portal>
              )}
            </AnimatePresence>

            <AddPostModal
              isOpen={isAddPostOpen}
              onClose={() => {
                setIsAddPostOpen(false);
                setEditPostData(null);
              }}
              onSuccess={() => {
                loadPosts(0, true, debouncedSearch);
                setEditPostData(null);
              }}
              editData={editPostData}
            />
          </>
        </Portal>
      )}
    </AnimatePresence>
  );
}
