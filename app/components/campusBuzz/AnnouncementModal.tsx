"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { MegaphoneIcon } from "@phosphor-icons/react";
import { Plus } from "lucide-react";
import { useUser } from "@/app/utils/context/UserContext";

import AddPostModal from "./AddPostModal";
import PostCard from "./PostCard";
import {
  fetchCampusBuzzFeed,
  deactivateCampusBuzzPost,
} from "@/lib/helpers/campusBuzz/campusBuzzAPI";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

const tabs = [
  "All",
  "Achievements",
  "Announcements",
  "Clubs & Activities",
] as const;

// --- RESTORED SHIMMER SKELETON ---
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

export default function AnnouncementModal({
  isOpen,
  onClose,
  highlightedPostId,
}: any) {
  const { collegeId, userId, fullName, profilePhoto } = useUser();

  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [editPostData, setEditPostData] = useState<any>(null);

  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPosts = async (pageNumber = 0, isRefresh = false) => {
    if (!collegeId) return;
    isRefresh ? setIsLoading(true) : setIsLoadingMore(true);

    try {
      const data = await fetchCampusBuzzFeed(
        collegeId,
        pageNumber,
        POSTS_PER_PAGE,
        debouncedSearch,
      );

      if (data.length < POSTS_PER_PAGE) setHasMore(false);
      else setHasMore(true);

      let sortedData = isRefresh ? data : [...posts, ...data];

      if (highlightedPostId && isRefresh && !debouncedSearch) {
        sortedData = [...sortedData].sort((a, b) => {
          if (a.campusBuzzPostId === highlightedPostId) return -1;
          if (b.campusBuzzPostId === highlightedPostId) return 1;
          return 0;
        });
      }
      setPosts(sortedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPage(0);
      loadPosts(0, true);
    }
  }, [isOpen, debouncedSearch, collegeId, highlightedPostId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, false);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeletingPost(true);
    try {
      const res = await deactivateCampusBuzzPost(postToDelete);
      if (res.success)
        setPosts((prev) =>
          prev.filter((p) => p.campusBuzzPostId !== postToDelete),
        );
      setPostToDelete(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingPost(false);
    }
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
              className="fixed z-[1000] top-[80px] left-[745px] w-[500px] h-[80vh] bg-white translate-x-6 rounded-xl shadow-xl flex flex-col"
            >
              <div className="px-[20px] pt-[20px] shrink-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 cursor-default">
                    <MegaphoneIcon size={32} weight="fill" color="#43C17A" />
                    <h2 className="text-[22px] font-roboto font-semibold text-[#282828] leading-none">
                      Campus Buzz
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setEditPostData(null);
                        setIsAddPostOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-[6px] rounded-full bg-[rgba(67,193,122,0.12)] text-[#43C17A] text-[16px] font-medium transition-colors hover:bg-[rgba(67,193,122,0.2)] cursor-pointer"
                    >
                      <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />{" "}
                      <span>Add Post</span>
                    </button>
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
                      className={`cursor-pointer px-5 h-[32px] rounded-[48px] text-[14px] font-roboto font-medium flex items-center justify-center whitespace-nowrap transition-colors ${activeTab === tab ? "bg-[#43C17A] text-white" : "bg-[#EAF7F1] text-[#43C17A] hover:bg-[#d8f1e3]"}`}
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
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.campusBuzzPostId}
                        post={post}
                        userId={userId}
                        fullName={fullName}
                        currentUserPhoto={profilePhoto}
                        debouncedSearch={debouncedSearch}
                        isHighlighted={
                          highlightedPostId === post.campusBuzzPostId
                        }
                        onEditPost={(p: any) => {
                          setEditPostData(p);
                          setIsAddPostOpen(true);
                        }}
                        onDeletePost={(id: number) => setPostToDelete(id)}
                      />
                    ))}
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

            <DeleteConfirmModal
              isOpen={postToDelete !== null}
              type="post"
              isDeleting={isDeletingPost}
              onCancel={() => setPostToDelete(null)}
              onConfirm={confirmDeletePost}
            />

            <AddPostModal
              isOpen={isAddPostOpen}
              onClose={() => setIsAddPostOpen(false)}
              editData={editPostData}
              onSuccess={() => loadPosts(0, true)}
            />
          </>
        </Portal>
      )}
    </AnimatePresence>
  );
}
