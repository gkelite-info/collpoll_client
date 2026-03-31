"use client";

import {
  BellSimple,
  CaretDown,
  EnvelopeSimple,
  MagnifyingGlass,
  Megaphone,
  Newspaper,
} from "@phosphor-icons/react";
import { Suspense, useEffect, useState } from "react";
import NotificationsModal from "../modals/NotificationsModal";
import NewsModal from "../modals/NewsModal";
import EmailModal from "../modals/EmailModal";
import AnnouncementModal from "../modals/AnnouncementModal";
import DailyNewsModal from "../modals/DailyNewsModal";
import ProfileWrapper from "@/app/profile/ProfileWrapper";
import { useUser } from "@/app/utils/context/UserContext";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import { useParent } from "@/app/utils/context/parent/useParent";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import { getUnreadNotificationCount } from "@/lib/helpers/notifications/getUnreadNotificationCount";
import { supabase } from "@/lib/supabaseClient";
import { getUnreadEmailCount } from "@/lib/helpers/notifications/emailsAPI";
import { useSearchParams } from "next/navigation";

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

  const {
    fullName,
    role,
    collegeEducationType,
    collegeBranchCode,
    studentId,
    facultyId,
    adminId,
    email: currentUserEmail,
    userId,
    profilePhoto,
  } = useUser();

  const { financeManagerId } = useFinanceManager();
  const { collegeAdminId } = useCollegeAdmin();
  const { collegeHrId } = useCollegeHr();
  const { parentId } = useParent();

  const searchParams = useSearchParams();
  const highlightedPostId = searchParams.get("post");

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
        <div className="w-[59%] flex justify-end items-center">
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
        </div>

        <div className="w-[40%] flex justify-between">
          <div className="w-[40%] h-[100%] flex items-center justify-center gap-3">
            <button onClick={() => setIsNewsOpen(true)} className="relative">
              <Newspaper size={21} color="#282828" className="cursor-pointer" />
            </button>

            <button onClick={() => setIsEmailOpen(true)} className="relative">
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

          <div
            className="w-[60%] h-full flex bg-[#43C17A] cursor-pointer rounded-l-full"
            onClick={() => setOpenProfile(true)}
          >
            <div className="w-[25%] h-full bg-green-00 flex items-center justify-center">
              {/* <div className="bg-black w-13 h-13 border-2 rounded-full flex items-center justify-center text-white">
                V
              </div> */}
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
                      ID - <span>{studentId}</span>
                    </p>
                  </>
                )}
                {role === "Finance" && (
                  <>
                    <p>{role}</p>
                    <p>
                      ID - <span>{financeManagerId}</span>
                    </p>
                  </>
                )}
                {role === "Faculty" && (
                  <>
                    <p>{role}</p>
                    <p>
                      ID - <span>{facultyId}</span>
                    </p>
                  </>
                )}
                {role === "Admin" && (
                  <>
                    <p>{role}</p>
                    <p>
                      ID - <span>{adminId}</span>
                    </p>
                  </>
                )}
                {role === "CollegeAdmin" && (
                  <>
                    <p>{role}</p>
                    <p>
                      ID - <span>{collegeAdminId}</span>
                    </p>
                  </>
                )}
                {role === "Parent" && (
                  <>
                    <p>{role}</p>
                    <p>
                      ID - <span>{parentId}</span>
                    </p>
                  </>
                )}
                {role === "CollegeHr" && (
                  <>
                    <p>{role}</p>
                    <p>
                      ID - <span>{collegeHrId}</span>
                    </p>
                  </>
                )}
                {["SuperAdmin"].includes(role as string) && <p>{role}</p>}
              </div>
            </div>
          </div>
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
      <EmailModal isOpen={isEmailOpen} onClose={() => setIsEmailOpen(false)} />

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
