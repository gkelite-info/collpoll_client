"use client";

import {
  BellSimple,
  CaretDown,
  CircleNotch,
  EnvelopeSimple,
  MagnifyingGlass,
  Megaphone,
  Newspaper,
} from "@phosphor-icons/react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import NotificationsModal from "../modals/NotificationsModal";
import NewsModal from "../modals/NewsModal";
import EmailModal from "../modals/EmailModal";
import AnnouncementModal from "../campusBuzz/AnnouncementModal";
import DailyNewsModal from "../modals/DailyNewsModal";
import ProfileWrapper from "@/app/profile/ProfileWrapper";
import { useUser } from "@/app/utils/context/UserContext";
import { getUnreadNotificationCount } from "@/lib/helpers/notifications/getUnreadNotificationCount";
import { supabase } from "@/lib/supabaseClient";
import { getUnreadEmailCount } from "@/lib/helpers/notifications/emailsAPI";
import { useRouter, useSearchParams } from "next/navigation";
import ProfileShimmer from "./ProfileShimmer";
import { AnimatePresence, motion } from "framer-motion";
import { getSearchRoutesByRole } from "@/lib/config/searchRoutes";

function HeaderContent() {
  const [openProfile, setOpenProfile] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [dailyMode, setDailyMode] = useState<"article" | "pdf">("article");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [unreadEmailCount, setUnreadEmailCount] = useState<number>(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [emailInitialView, setEmailInitialView] = useState<{ tab?: "all" | "inbox" | "sent"; compose?: boolean }>({});
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const {
    fullName,
    role,
    collegeEducationType,
    collegeBranchCode,
    email: currentUserEmail,
    userId,
    profilePhoto,
    parentId,
    identifierId,
    loading
  } = useUser();

  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightedPostId = searchParams.get("post");

  const availableRoutes = useMemo(() => getSearchRoutesByRole(role), [role]);

  // const filteredSuggestions = useMemo(() => {
  //   if (!searchValue.trim()) return [];
  //   const query = searchValue.toLowerCase();
  //   return availableRoutes.filter((route) =>
  //     route.label.toLowerCase().includes(query) ||
  //     route.keywords?.some((kw) => kw.toLowerCase().includes(query))
  //   );
  // }, [searchValue, availableRoutes]);

  const filteredSuggestions = useMemo(() => {
    if (!searchValue.trim()) return [];
    const query = searchValue.toLowerCase().trim();

    const scoredRoutes = availableRoutes.map((route) => {
      let score = 0;
      const labelLower = route.label.toLowerCase();

      if (labelLower.startsWith(query)) { score = 100 }
      else if (labelLower.includes(query)) { score = 50 }
      else if (route.keywords?.some((kw) => kw.toLowerCase().startsWith(query))) { score = 30 }
      else if (route.keywords?.some((kw) => kw.toLowerCase().includes(query))) { score = 10 }

      return { ...route, score };
    }).filter((route) => route.score > 0);

    return scoredRoutes.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.label.localeCompare(b.label);
    });
  }, [searchValue, availableRoutes]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchFocused || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
      handleSuggestionClick(filteredSuggestions[targetIndex].path);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  // const handleSuggestionClick = (path: string) => {
  //   router.push(path);
  //   setSearchValue("");
  //   // setIsSearchFocused(false);
  //   setSelectedIndex(-1);
  // };

  const handleSuggestionClick = (path: string) => {
    if (path.startsWith("action:")) {
      // const actionType = path.split(":")[1];
      const [_, actionType, subAction] = path.split(":");
      switch (actionType) {
        case "notifications":
          setIsNotificationsOpen(true);
          break;
        case "news":
          setIsNewsOpen(true);
          break;
        // case "email":
        //   setIsEmailOpen(true);
        //   break;
        case "email":
          if (subAction === "compose") {
            setEmailInitialView({ compose: true, tab: "all" });
          } else if (subAction === "inbox" || subAction === "sent") {
            setEmailInitialView({ compose: false, tab: subAction as "inbox" | "sent" });
          } else {
            setEmailInitialView({ compose: false, tab: "all" });
          }
          setIsEmailOpen(true);
          break;
        case "announcement":
          setIsAnnouncementOpen(true);
          break;
      }
    } else {
      router.push(path);
    }

    setSearchValue("");
    setSelectedIndex(-1);
  };

  function openPDFModal(article: any) {
    setSelectedArticle(article);
    setIsNewsOpen(false);

    setTimeout(() => {
      setIsDailyModalOpen(true);
    }, 150);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setSearchValue(value);
    setIsSearchFocused(true);
  };

  useEffect(() => {
    if (highlightedPostId) {
      setIsAnnouncementOpen(true);
    }
  }, [highlightedPostId]);

  useEffect(() => {
    if (!userId || !currentUserEmail) return;

    async function fetchNotificationCount() {
      const count = await getUnreadNotificationCount(userId!);
      setUnreadCount(count);
    }

    async function fetchEmailCount() {
      const count = await getUnreadEmailCount(userId!, currentUserEmail!);
      setUnreadEmailCount(count);
    }

    fetchNotificationCount();
    fetchEmailCount();

    const notificationChannel = supabase
      .channel("custom-notification-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          const record = (payload.new as any) || (payload.old as any);

          if (record && Number(record.userId) === Number(userId)) {
            setTimeout(() => fetchNotificationCount(), 100);
          }
        },
      )
      .subscribe();

    const emailChannel = supabase
      .channel("custom-email-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "email_queue",
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          setTimeout(() => fetchEmailCount(), 100);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(emailChannel);
    };
  }, [userId]);

  useEffect(() => {
    const handler = () => setOpenProfile(true);
    document.addEventListener("open-profile", handler);
    return () => document.removeEventListener("open-profile", handler);
  }, []);

  return (
    <>
      <div className="h-full w-full flex justify-between gap-1 p-2">
        {/* <div className="w-[59%] flex justify-end items-center">
          <div className="relative lg:w-[80%] lg:h-[60%]">
            <input
              type="text"
              value={searchValue}
              onChange={handleChange}
              placeholder="What do you want to find?"
              className="rounded-full w-full h-full bg-[#EAEAEA] text-[#282828] lg:text-sm pl-5 pr-10 focus:outline-none"
            />
            <MagnifyingGlass
              size={20}
              weight="bold"
              color="#43C17A"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            />
          </div>
        </div> */}

        <div className="w-[59%] flex justify-end items-center">
          <div ref={searchContainerRef} className="relative lg:w-[80%] lg:h-[60%]">
            <input
              type="text"
              disabled={loading || !role}
              value={searchValue}
              onChange={handleChange}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleKeyDown}
              // placeholder="What do you want to find?"
              placeholder={
                loading ? "Loading modules..." : "What do you want to find?"
              }
              // className="rounded-full w-full h-full bg-[#EAEAEA] text-[#282828] lg:text-sm pl-5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#43C17A]/40 transition-all shadow-inner"
              className={`rounded-full w-full h-full lg:text-sm pl-5 pr-10 focus:outline-none transition-all shadow-inner ${loading || !role
                ? "bg-[#EAEAEA]/60 text-gray-400 cursor-not-allowed"
                : "bg-[#EAEAEA] text-[#282828] focus:ring-2 focus:ring-[#43C17A]/40"
                }`}
            />
            {loading ? (
              <CircleNotch
                size={20}
                weight="bold"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin pointer-events-none"
              />
            ) : (
              <MagnifyingGlass
                size={20}
                weight="bold"
                color="#43C17A"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              />
            )}

            <AnimatePresence>
              {!loading && role && isSearchFocused && searchValue.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-[120%] z-100 mt-1 w-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl overflow-hidden py-2"
                >
                  {filteredSuggestions.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {filteredSuggestions.map((item, index) => {
                        const isSelected = selectedIndex === index;
                        return (
                          <div
                            key={item.path}
                            onClick={() => handleSuggestionClick(item.path)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`px-4 py-3 mx-2 my-1 rounded-xl text-sm cursor-pointer transition-all flex items-center justify-between group ${isSelected
                              ? "bg-[#43C17A] text-white shadow-md"
                              : "text-gray-700 hover:bg-[#43C17A]/10"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <MagnifyingGlass
                                size={16}
                                weight="bold"
                                className={`transition-colors ${isSelected ? "text-white" : "text-[#43C17A]"}`}
                              />
                              {/* <span className="font-semibold">{item.label}</span> */}
                              <div className="flex flex-col leading-tight">
                                <span className="font-semibold">{item.label}</span>
                                {/* 🟢 NEW: Render subLabel if it exists to show inner page context */}
                                {item.subLabel && (
                                  <span className={`text-[11px] opacity-80 ${isSelected ? "text-white" : "text-gray-500"}`}>
                                    {item.subLabel}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Category Badge for better UI hierarchy */}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase transition-colors ${isSelected
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-400 group-hover:bg-[#43C17A]/20 group-hover:text-[#43C17A]"
                              }`}>
                              {item.category}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-6 py-10 text-center flex flex-col items-center justify-center gap-3">
                      <div className="bg-[#43C17A]/10 p-4 rounded-full mb-1">
                        <MagnifyingGlass size={32} className="text-[#43C17A]" weight="duotone" />
                      </div>
                      <p className="text-[15px] text-gray-700 font-medium">
                        No matches found for "<span className="font-bold text-black">{searchValue}</span>"
                      </p>
                      <p className="text-xs text-gray-400 max-w-[250px]">
                        Try checking for typos or searching with different keywords like 'fees', 'grades', or 'schedule'.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="w-[40%] flex justify-between ">
          <div className="w-[40%] h-[100%] flex items-center justify-center gap-3">
            <button onClick={() => setIsNewsOpen(true)} className="relative">
              <Newspaper size={21} color="#282828" className="cursor-pointer" />
            </button>

            <button
              //  onClick={() => setIsEmailOpen(true)}
              onClick={() => {
                setEmailInitialView({ compose: false, tab: "all" });
                setIsEmailOpen(true);
              }}
              className="relative">
              <EnvelopeSimple
                size={21}
                color="#282828"
                className="cursor-pointer"
              />
              {unreadEmailCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 border border-white rounded-full">
                  {unreadEmailCount > 99 ? "99+" : unreadEmailCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative"
            >
              <BellSimple
                size={21}
                color="#282828"
                className="cursor-pointer"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 border border-white rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsAnnouncementOpen(true)}
              className="relative"
            >
              <Megaphone size={20} color="#282828" className="cursor-pointer" />
            </button>
          </div>
          {loading ? (
            <ProfileShimmer />
          ) : (
            <div
              className="w-[60%] flex items-center bg-[#43C17A] cursor-pointer rounded-l-full py-1.5"
              onClick={() => setOpenProfile(true)}
            >
              <div className="w-[25%] flex items-center justify-center">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="profile"
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* FIX: Removed 'gap-2' and added 'gap-0.5' to keep lines tight so they don't touch the bottom */}
              <div className="w-[75%] flex flex-col justify-center px-2 gap-[2px] text-[#282828] font-semibold min-w-0">

                <div className="flex items-center justify-between w-full">
                  <p className="text-sm text-[#ffffff] truncate leading-none" title={fullName || ""}>
                    {fullName}
                  </p>
                  <CaretDown
                    size={20}
                    weight="bold"
                    color="#ffffff"
                    className="cursor-pointer shrink-0"
                  />
                </div>

                {/* FIX: leading-[1.2] tightly packs the stacked text specifically for PlacementOfficer */}
                <div className={`w-full text-[#E5E5E5] ${role === "PlacementOfficer"
                  ? "flex flex-col items-start text-[11px] leading-[1.2]"
                  : "flex items-center justify-between text-xs"
                  }`}>
                  {role === "Student" && (
                    <>
                      <p className="truncate">
                        {collegeEducationType && collegeBranchCode
                          ? `${collegeEducationType} ${collegeBranchCode}`
                          : "—"}
                      </p>
                      <p className="whitespace-nowrap shrink-0">
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {role === "Finance" && (
                    <>
                      <p className="truncate">{role}</p>
                      <p className="whitespace-nowrap shrink-0">
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {role === "Faculty" && (
                    <>
                      <p className="truncate">{role}</p>
                      <p className="whitespace-nowrap shrink-0">
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {role === "Admin" && (
                    <>
                      <p className="truncate">{role}</p>
                      <p className="whitespace-nowrap shrink-0">
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {role === "CollegeAdmin" && (
                    <>
                      <p className="truncate">{role}</p>
                      <p className="whitespace-nowrap shrink-0">
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {role === "Parent" && (
                    <>
                      <p className="truncate">{role}</p>
                      <p className="whitespace-nowrap shrink-0">
                        ID - <span>{identifierId || parentId}</span>
                      </p>
                    </>
                  )}
                  {role === "CollegeHr" && (
                    <>
                      <p className="truncate">{role}</p>
                      <p className="whitespace-nowrap shrink-0">
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}

                  {role === "PlacementOfficer" && (
                    <>
                      <p className="truncate w-full" title={role}>{role}</p>
                      <p className="whitespace-nowrap shrink-0 text-white/90">
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}

                  {["SuperAdmin"].includes(role as string) && (
                    <p className="truncate">{role}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* {loading ? <ProfileShimmer /> :
            <div
              className="w-[60%] max-h-[90%] flex bg-[#43C17A] cursor-pointer rounded-l-full"
              onClick={() => setOpenProfile(true)}
            >
              <div className="w-[25%] h-full bg-green-00 flex items-center justify-center">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="profile"
                    className="w-13 h-13 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="bg-pink-00 w-[75%] flex flex-col items-start justify-center gap-2 px-2 text-[#282828] font-semibold">
                <div className="flex items-center justify-between w-full bg-gray-00">
                  <p className="text-sm text-[#ffffff]">{fullName}</p>
                  <CaretDown
                    size={20}
                    weight="bold"
                    color="#ffffff"
                    className="cursor-pointer"
                  />
                </div>
                <div className="bg-red-00 flex items-center justify-between text-[#E5E5E5] w-full text-xs">
                  {role === "Student" && (
                    <>
                      <p>
                        {collegeEducationType && collegeBranchCode
                          ? `${collegeEducationType} ${collegeBranchCode}`
                          : "—"}
                      </p>
                      <p>
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {role === "Finance" && (
                    <>
                      <p>{role}</p>
                      <p>
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {role === "Faculty" && (
                    <>
                      <p>{role}</p>
                      <p>
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {role === "Admin" && (
                    <>
                      <p>{role}</p>
                      <p>
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {role === "CollegeAdmin" && (
                    <>
                      <p>{role}</p>
                      <p>
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {role === "Parent" && (
                    <>
                      <p>{role}</p>
                      <p>
                        ID - <span>{identifierId || parentId}</span>
                      </p>
                    </>
                  )}
                  {role === "CollegeHr" && (
                    <>
                      <p>{role}</p>
                      <p>
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                   {role === "PlacementOfficer" && (
                    <>
                      <p>{role}</p>
                      <p>
                        ID - <span>{identifierId}</span>
                      </p>
                    </>
                  )}
                  {["SuperAdmin"].includes(role as string) && <p>{role}</p>}
                </div>
              </div>
            </div>
          } */}
        </div>
      </div>

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <NewsModal
        isOpen={isNewsOpen}
        onClose={() => setIsNewsOpen(false)}
        onOpenPDF={openPDFModal}
      />
      <EmailModal
        initialView={emailInitialView}
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
      />

      <AnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
        highlightedPostId={highlightedPostId ? Number(highlightedPostId) : null}
      />

      <DailyNewsModal
        isOpen={isDailyModalOpen}
        article={selectedArticle}
        onClose={() => setIsDailyModalOpen(false)}
      />
      <ProfileWrapper
        openProfile={openProfile}
        onCloseProfile={() => setOpenProfile(false)}
      />
    </>
  );
}

export default function Header() {
  return (
    <Suspense>
      <HeaderContent />
    </Suspense>
  );
}