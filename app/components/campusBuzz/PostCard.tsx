"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Pencil,
  Send,
  X,
  Link,
  Check,
  Loader2,
} from "lucide-react";

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
import { sendUniversalNotifications } from "@/lib/helpers/notifications/notificationAPI";
import { useTranslations } from "next-intl";

const getAvatarStyle = (userId: number) => ({
  backgroundColor: `hsl(${(userId * 137.508) % 360}, 65%, 45%)`,
  color: "white",
});

const getInitials = (name?: string) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

const formatTimeAgo = (dateString: string, t: any) => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 1000,
  );
  if (seconds < 60) return t("Just now");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("{count}m ago", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("{count}h ago", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("{count}d ago", { count: days });
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

const extractProfileUrl = (userObj: any) => {
  if (!userObj?.user_profile) return null;
  return Array.isArray(userObj.user_profile)
    ? userObj.user_profile[0]?.profileUrl
    : userObj.user_profile.profileUrl;
};

const UserAvatar = ({
  userId,
  name,
  photoUrl,
  className,
}: {
  userId: number;
  name?: string;
  photoUrl?: string | null;
  className?: string;
}) => {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name || "User"}
        className={`object-cover rounded-full border border-gray-100 ${className}`}
      />
    );
  }
  return (
    <div
      className={`rounded-full flex-shrink-0 flex items-center justify-center font-bold shadow-inner ${className}`}
      style={getAvatarStyle(userId)}
    >
      {getInitials(name)}
    </div>
  );
};

const CommentSkeleton = () => (
  <div className="flex gap-2.5 animate-pulse mt-1">
    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mt-0.5"></div>
    <div className="flex flex-col gap-1.5 w-full max-w-[70%]">
      <div className="bg-[#f0f2f5] rounded-2xl rounded-tl-none h-14 w-full"></div>
      <div className="h-3 w-20 bg-gray-200 rounded mt-0.5 ml-2"></div>
    </div>
  </div>
);

export default function PostCard({
  post,
  userId,
  fullName,
  currentUserPhoto,
  isHighlighted,
  debouncedSearch,
  onEditPost,
  onDeletePost,
}: any) {
  const pId = post.campusBuzzPostId;
  const tagArray = Array.isArray(post.tags)
    ? post.tags
    : typeof post.tags === "string"
      ? post.tags.split(",").map((t: string) => t.trim())
      : [];
  const postAuthorPhoto = extractProfileUrl(post.users);
  const t = useTranslations("CampusBuzz"); // Hook

  const [state, setState] = useState({
    liked: false,
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    commentsActive: isHighlighted,
    sharedActive: false,
    menuOpen: false,
  });
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    commentId: number;
    userName: string;
  } | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeCommentMenuId, setActiveCommentMenuId] = useState<number | null>(
    null,
  );
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  useEffect(() => {
    Promise.all([
      fetchCampusBuzzPostLikeCount(pId),
      checkCampusBuzzPostLiked(pId, userId),
      fetchCampusBuzzPostCommentCount(pId),
      fetchCampusBuzzPostShareCount(pId),
    ]).then(([lCount, uLiked, cCount, sCount]) => {
      setState((s) => ({
        ...s,
        likeCount: lCount,
        liked: uLiked?.liked || false,
        commentCount: cCount,
        shareCount: sCount,
      }));
    });
    if (isHighlighted) loadComments();
  }, [pId, userId, isHighlighted]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const data = await fetchCampusBuzzPostComments(pId);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleToggleLike = async () => {
    if (!userId) return;
    const isCurrentlyLiked = state.liked;

    setState((s) => ({
      ...s,
      liked: !isCurrentlyLiked,
      likeCount: isCurrentlyLiked
        ? Math.max(0, s.likeCount - 1)
        : s.likeCount + 1,
    }));

    try {
      const res = await toggleCampusBuzzPostLike(pId, userId);
      if (res.success && !isCurrentlyLiked && post.createdBy !== userId) {
        await sendUniversalNotifications({
          userIds: [post.createdBy],
          title: "New Like on Campus Buzz",
          message: `${fullName} liked your post.`,
          type: "Announcement",
          referenceId: pId,
        });
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        liked: isCurrentlyLiked,
        likeCount: isCurrentlyLiked
          ? s.likeCount + 1
          : Math.max(0, s.likeCount - 1),
      }));
    }
  };

  const handleToggleComments = async () => {
    const willBeActive = !state.commentsActive;
    setState((s) => ({ ...s, commentsActive: willBeActive }));
    if (willBeActive && comments.length === 0) {
      loadComments();
    }
  };

  const handleSubmitComment = async () => {
    if (!userId || !newCommentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      const res = await addCampusBuzzPostComment(
        {
          campusBuzzPostId: pId,
          comment: newCommentText,
          parentCommentId: replyingTo?.commentId || null,
        },
        userId,
      );
      if (res.success) {
        await loadComments();
        setState((s) => ({ ...s, commentCount: s.commentCount + 1 }));
        setNewCommentText("");
        setReplyingTo(null);

        if (post.createdBy !== userId) {
          await sendUniversalNotifications({
            userIds: [post.createdBy],
            title: "New Comment",
            message: `${fullName} commented: "${newCommentText.substring(0, 30)}..."`,
            type: "Announcement",
            referenceId: pId,
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditCommentSubmit = async (commentId: number) => {
    if (!editingCommentText.trim()) return;
    const res = await updateCampusBuzzPostComment(
      commentId,
      editingCommentText,
    );
    if (res.success) {
      setComments((prev) =>
        prev.map((c) =>
          c.campusBuzzPostCommentId === commentId
            ? { ...c, comment: editingCommentText }
            : c,
        ),
      );
      setEditingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const res = await deleteCampusBuzzPostComment(commentId);
    if (res.success) {
      setComments((prev) =>
        prev.filter((c) => c.campusBuzzPostCommentId !== commentId),
      );
      setState((s) => ({
        ...s,
        commentCount: Math.max(0, s.commentCount - 1),
      }));
    }
  };

  const handleShareAction = async (platform: string) => {
    const postUrl = `${window.location.origin}${window.location.pathname}?post=${pId}`;
    if (platform === "copy-link") {
      navigator.clipboard.writeText(postUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (platform === "whatsapp") {
      window.open(
        `https://api.whatsapp.com/send?text=Check out this update on Campus Buzz: ${encodeURIComponent(postUrl)}`,
        "_blank",
      );
    }
    const res = await shareCampusBuzzPost(
      { campusBuzzPostId: pId, sharedTo: platform },
      userId,
    );
    if (res.isNewShare)
      setState((s) => ({ ...s, shareCount: s.shareCount + 1 }));
    setState((s) => ({ ...s, sharedActive: false }));
  };

  const parentComments = comments.filter((c) => !c.parentCommentId);

  return (
    <div
      className={`relative bg-white rounded-xl border p-4 shadow-sm transition-colors ${isHighlighted && !debouncedSearch ? "border-[#43C17A] bg-[#fafffb]" : "border-gray-100"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            userId={post.createdBy}
            name={post.users?.fullName}
            photoUrl={postAuthorPhoto}
            className="w-10 h-10 text-sm"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-[#282828] leading-tight">
                {post.users?.fullName || t("Campus Member")}
              </span>
              <RoleFlair role={post.users?.role} />
            </div>
            <span className="text-[12px] text-gray-400">
              {formatTimeAgo(post.createdAt, t)}
            </span>
          </div>
        </div>

        {post.createdBy === userId && (
          <div className="relative z-10">
            <button
              onClick={() => setState((s) => ({ ...s, menuOpen: true }))}
              className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
            >
              <MoreHorizontal size={20} className="text-gray-500" />
            </button>
            <AnimatePresence>
              {state.menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setState((s) => ({ ...s, menuOpen: false }));
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setState((s) => ({ ...s, menuOpen: false }));
                        onEditPost(post);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Pencil size={16} /> {t("Edit Post")}
                    </button>
                    <button
                      onClick={() => {
                        setState((s) => ({ ...s, menuOpen: false }));
                        onDeletePost(pId);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Trash2 size={16} /> {t("Delete Post")}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <h3 className="text-[17px] font-roboto font-semibold text-[#282828]">
        {post.title}
      </h3>
      <p className="text-[15px] font-roboto text-gray-700 mt-[4px] leading-relaxed">
        {post.description}
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

      {post.imageUrl && (
        <div className="mt-3 relative w-full h-[280px] bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <Loader2 className="text-gray-400 animate-spin" size={24} />
            </div>
          )}
          <img
            src={post.imageUrl}
            alt={post.title}
            onLoad={() => setImageLoaded(true)}
            className={`max-h-full w-full object-contain transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 select-none">
        <div className="flex items-center gap-6">
          <button
            onClick={handleToggleLike}
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
                  state.liked ? "text-red-500 fill-red-500" : "text-gray-500"
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
            onClick={handleToggleComments}
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
            onClick={() => setState((s) => ({ ...s, sharedActive: true }))}
            className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer z-10"
          >
            <Share2 size={18} className="text-gray-500" />
            <span className="text-[14px] font-medium text-gray-600">
              {state.shareCount > 0
                ? t("{count} Shares", { count: state.shareCount })
                : t("Share")}
            </span>
          </button>
          <AnimatePresence>
            {state.sharedActive && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setState((s) => ({ ...s, sharedActive: false }));
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
                      onClick={() => handleShareAction("copy-link")}
                      className="cursor-pointer w-full flex items-center justify-between p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <Link size={16} /> {t("Copy Link")}
                      </span>
                      {copiedLink && (
                        <Check size={16} className="text-[#43C17A]" />
                      )}
                    </button>
                    <button
                      onClick={() => handleShareAction("whatsapp")}
                      className="cursor-pointer w-full flex items-center gap-2 p-3 text-sm text-gray-700 hover:bg-[#EAF7F1] hover:text-[#43C17A] rounded-lg transition-colors font-medium mt-1"
                    >
                      <Share2 size={16} /> {t("Share to WhatsApp")}
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
              {replyingTo && (
                <div className="flex items-center justify-between bg-gray-100 text-gray-600 text-[12px] px-3 py-1.5 rounded-md mx-1">
                  <span>
                    {t("Replying to")}{" "}
                    <strong className="text-gray-800">
                      {replyingTo.userName}
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
                <UserAvatar
                  userId={userId!}
                  name={fullName!}
                  photoUrl={currentUserPhoto}
                  className="w-8 h-8 text-xs"
                />
                <input
                  type="text"
                  placeholder={
                    replyingTo ? t("Write a reply") : t("Write a comment")
                  }
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                  className="flex-1 h-9 px-4 text-[#282828] rounded-full bg-gray-100 border-none outline-none text-[14px] focus:ring-2 focus:ring-[#43C17A]/20 transition-all placeholder:text-gray-400"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !newCommentText.trim()}
                  className="p-2 bg-[#43C17A] text-white rounded-full hover:bg-[#3ba869] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pb-2">
                {isLoadingComments ? (
                  <>
                    <CommentSkeleton />
                    <CommentSkeleton />
                  </>
                ) : parentComments.length === 0 ? (
                  <div className="text-center text-xs text-gray-400 py-2">
                    {t("No comments yet")}
                  </div>
                ) : (
                  parentComments.map((comment: any) => {
                    const replies = comments.filter(
                      (c) =>
                        c.parentCommentId === comment.campusBuzzPostCommentId,
                    );

                    const renderComment = (c: any, isReply = false) => {
                      const cAuthorPhoto = extractProfileUrl(c.users);

                      return (
                        <div
                          key={c.campusBuzzPostCommentId}
                          className={`flex gap-2.5 relative ${isReply ? "mt-3" : ""}`}
                        >
                          <UserAvatar
                            userId={c.commentedBy}
                            name={c.users?.fullName}
                            photoUrl={cAuthorPhoto}
                            className={
                              isReply
                                ? "w-6 h-6 text-[9px] mt-0.5"
                                : "w-8 h-8 text-[11px] mt-0.5"
                            }
                          />

                          <div className="flex flex-col items-start w-full">
                            <div className="flex items-center justify-between w-full max-w-[85%] gap-2 relative z-0">
                              {editingCommentId ===
                              c.campusBuzzPostCommentId ? (
                                <div className="flex flex-col gap-2 w-full bg-white border border-gray-200 p-2 rounded-xl shadow-sm">
                                  <input
                                    type="text"
                                    value={editingCommentText}
                                    onChange={(e) =>
                                      setEditingCommentText(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                      e.key === "Enter" &&
                                      handleEditCommentSubmit(
                                        c.campusBuzzPostCommentId,
                                      )
                                    }
                                    className="w-full text-[14px] bg-gray-50 border-none rounded-md px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#43C17A]"
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-2 self-end">
                                    <button
                                      onClick={() => setEditingCommentId(null)}
                                      className="text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer font-medium"
                                    >
                                      {t("Cancel")}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleEditCommentSubmit(
                                          c.campusBuzzPostCommentId,
                                        )
                                      }
                                      className="text-[11px] bg-[#43C17A] text-white px-2.5 py-1 rounded cursor-pointer hover:bg-[#3ba869] font-medium"
                                    >
                                      {t("Save")}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative group/bubble flex flex-col bg-[#f0f2f5] px-3.5 py-2.5 rounded-2xl rounded-tl-none w-fit min-w-[140px] pr-8">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span
                                      className={`font-semibold text-[#282828] leading-tight ${isReply ? "text-[12px]" : "text-[13px]"}`}
                                    >
                                      {c.users?.fullName || t("Campus Member")}
                                    </span>
                                    <RoleFlair role={c.users?.role} />
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
                                          <MoreHorizontal size={14} />
                                        </button>
                                        {activeCommentMenuId ===
                                          c.campusBuzzPostCommentId && (
                                          <>
                                            <div
                                              className="fixed inset-0 z-10 cursor-default"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveCommentMenuId(null);
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
                                                  setActiveCommentMenuId(null);
                                                }}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer font-medium"
                                              >
                                                <Pencil size={12} /> {t("Edit")}
                                              </button>
                                              <button
                                                onClick={() => {
                                                  handleDeleteComment(
                                                    c.campusBuzzPostCommentId,
                                                  );
                                                  setActiveCommentMenuId(null);
                                                }}
                                                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                                              >
                                                <Trash2 size={12} />{" "}
                                                {t("Delete")}
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>

                            {editingCommentId !== c.campusBuzzPostCommentId && (
                              <div className="flex items-center gap-3 px-2 mt-1 text-[11px] text-gray-500 font-medium">
                                <span>{formatTimeAgo(c.createdAt, t)}</span>
                                {!isReply && (
                                  <button
                                    onClick={() =>
                                      setReplyingTo({
                                        commentId: c.campusBuzzPostCommentId,
                                        userName:
                                          c.users?.fullName ||
                                          t("Campus Member"),
                                      })
                                    }
                                    className="hover:text-gray-800 transition-colors cursor-pointer font-semibold"
                                  >
                                    {t("Reply")}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div
                        key={comment.campusBuzzPostCommentId}
                        className="flex flex-col gap-1"
                      >
                        {renderComment(comment, false)}
                        {replies.length > 0 && (
                          <div className="flex flex-col pl-4 ml-4 border-l-2 border-gray-100 mt-1">
                            {replies.map((reply) => renderComment(reply, true))}
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
}
