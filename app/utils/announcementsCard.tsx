"use client";

import { CalendarIcon, PencilSimple, Plus, PlusCircleIcon, Trash, X } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AddAnnouncementModal from "../components/modals/AddAnnouncementModal";
import {
  deactivateCollegeAnnouncement,
  fetchAnnouncementDetails,
} from "@/lib/helpers/announcements/announcementAPI";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useUser } from "@/app/utils/context/UserContext";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { fetchCollegeAnnouncements, fetchCalendarAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

type AnnounceCard = {
  collegeAnnouncementId?: number;
  image: string;
  imgHeight: string;
  title: string;
  professor: string;
  date?: string;
  formattedDate?: string;
  createdAt?: string;
  time?: string;
  cardBg: string;
  imageBg: string;
  type?: string;
  targetRoles?: string[];
};

type AnnouncementDetails = {
  creatorImage: string;
  creatorName: string;
  creatorRole: string;
  formattedDate?: string;
  date?: string;
  targetRoles?: string[];
};

type CalendarAnnouncementRow = {
  collegeAnnouncementId: number;
  announcementTitle: string;
  date: string;
  type: string;
  createdBy: number;
  createdByRole: string;
  createdAt: string;
};

type AnnouncementsCardProps = {
  announceCard?: AnnounceCard[];
  height?: string;
  currentView?: "my" | "others";
  enableInfiniteScroll?: boolean;
  isLoading?: boolean;
  onAddClick?: () => void;
  onViewChange?: (view: "my" | "others") => void;
  refreshAnnouncements?: () => Promise<void>;
  readOnly?: boolean;
  className?: string;
  selectedDate?: string | null;
  onDateChange?: (date: string | null) => void;
};

const AnnouncementListShimmer = () => (
  <div className="flex flex-col gap-2">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="lg:h-[70.5px] bg-gray-50 border border-gray-100 rounded-lg flex items-center p-2 gap-1"
      >
        <div className="h-[58px] w-[58px] bg-gray-200 rounded-md animate-pulse flex-shrink-0" />
        <div className="h-full w-[78%] rounded-md flex flex-col flex-1 min-w-0 justify-center space-y-2 px-1">
          <div className="h-3.5 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="flex justify-between">
            <div className="h-2.5 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-2.5 bg-gray-200 rounded w-1/4 animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const AnnouncementDetailsShimmer = () => (
  <div className="flex flex-col gap-5 animate-pulse mt-2">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-3 mt-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

const formatRole = (role: string, isSchool?: boolean) => {
  let formatted = role
    ?.replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
    
  if (isSchool) {
    formatted = formatted?.replace(/College/g, "School");
  }
  return formatted;
};

function ViewAnnouncementModal({
  basicData,
  onClose,
  isSchool
}: {
  basicData: AnnounceCard;
  onClose: () => void;
  isSchool?: boolean;
}) {
  const { data: fullData, isLoading, isError } = useQuery({
    queryKey: ["announcementDetails", basicData.collegeAnnouncementId],
    queryFn: async () => {
      if (!basicData.collegeAnnouncementId) throw new Error("No ID");
      return await fetchAnnouncementDetails(basicData.collegeAnnouncementId);
    },
    enabled: !!basicData.collegeAnnouncementId,
  });

  const t = useTranslations("Dashboard");

  const formattedType = basicData.type
    ? basicData.type.charAt(0).toUpperCase() + basicData.type.slice(1)
    : "Announcement";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
        >
          <X size={20} weight="bold" />
        </button>

        <div className="flex items-center gap-4 mb-4 pr-6">
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ backgroundColor: basicData.imageBg || "#D3F1E0" }}
          >
            <img
              src={basicData.image || "/default.jpg"}
              alt={basicData.title}
              className="h-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#282828] leading-tight">
              {basicData.title}
            </h2>
            <span className="text-xs font-bold text-[#43C17A] uppercase mt-1 tracking-wider">
              {formattedType}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[175px]">
          {isLoading ? (
            <AnnouncementDetailsShimmer />
          ) : isError || !fullData ? (
            <div className="text-center text-gray-400 py-8 text-sm">
              {t("Failed to load details")}
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-sm text-[#454545]">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <img
                  src={fullData.creatorImage}
                  alt={fullData.creatorName}
                  className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-[#282828] text-[15px]">
                    {fullData.creatorName}
                  </span>
                  <span className="font-semibold text-gray-500 text-xs">
                    {formatRole(fullData.creatorRole, isSchool)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="font-semibold text-gray-700 flex-shrink-0">
                  Date:
                </span>
                <span className="font-medium text-right">
                  {fullData.formattedDate || fullData.date}
                </span>
              </div>

              {fullData.targetRoles && fullData.targetRoles.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  <span className="font-semibold text-gray-700">
                    Targeted Roles:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {fullData.targetRoles.map((r: string) => (
                      <span
                        key={r}
                        className="bg-white border border-gray-200 text-[#43C17A] px-2.5 py-1 rounded-md text-xs font-bold shadow-sm"
                      >
                        {formatRole(r, isSchool)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsCard({
  announceCard = [],
  height,
  currentView,
  enableInfiniteScroll = false,
  isLoading = false,
  onAddClick,
  onViewChange,
  refreshAnnouncements,
  readOnly,
  className,
  selectedDate: propSelectedDate,
  onDateChange: propOnDateChange,
}: AnnouncementsCardProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const t = useTranslations("Dashboard.student");
  const isFinanceDashboard = pathname.startsWith("/finance");
  const isCollegeAdminDashboard = pathname.startsWith("/college-admin");
  const isAdminDashboard = pathname.startsWith("/admin");
  const isStudentDashboard = pathname.includes("stu_dashboard");
  const isParentDashboard = pathname.includes("parent");
  const isFacultyDashboard = pathname.startsWith("/faculty");
  const isHrDashboard = pathname.startsWith("/hr");
  const isPlacementDashboard = pathname.startsWith("/placement");
  const isWellbeingManagerDashboard = pathname.startsWith("/wellbeing-manager")
  const isWellbeingExecutiveDashboard = pathname.startsWith("/wellbeing-executive")

  const isReadOnlyUser = readOnly ?? (isStudentDashboard || isParentDashboard);
  const canManageAnnouncements =
    !isReadOnlyUser &&
    (isFinanceDashboard ||
      isCollegeAdminDashboard ||
      isAdminDashboard ||
      isFacultyDashboard ||
      isHrDashboard ||
      isPlacementDashboard ||
      isWellbeingManagerDashboard ||
      isWellbeingExecutiveDashboard
    );

  const [localView, setLocalView] = useState<"others" | "my">("others");
  const activeView = currentView || localView;

  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<AnnounceCard | null>(null);

  const [viewingAnnouncement, setViewingAnnouncement] = useState<AnnounceCard | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { userId, collegeId, role: userRole, collegeEducationType } = useUser();
  const isSchool = isSchoolEducation(collegeEducationType);
  
  const [internalSelectedDate, setInternalSelectedDate] = useState<string | null>(null);
  const selectedDate = propSelectedDate !== undefined ? propSelectedDate : internalSelectedDate;
  
  const setSelectedDate = (date: string | null) => {
    setInternalSelectedDate(date);
    if (propOnDateChange) {
      propOnDateChange(date);
    }
  };

  const [calendarAnnouncementsRaw, setCalendarAnnouncementsRaw] = useState<AnnounceCard[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { ref: loadMoreRef, inView } = useInView();

  const {
    data: infiniteAnnouncementsData,
    fetchNextPage: fetchNextAnnouncements,
    hasNextPage: hasNextAnnouncements,
    isFetchingNextPage: isFetchingNextAnnouncements,
    isPending: isInfiniteAnnouncementsPending,
  } = useInfiniteQuery({
    queryKey: ["announcementsInfinite", collegeId, userId, userRole, activeView, selectedDate, refreshTrigger],
    queryFn: async ({ pageParam = 1 }) => {
      if (!collegeId || !userId || !userRole) return { data: [], totalPages: 0 };
      
      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role: userRole,
        view: activeView,
        selectedDate,
        page: pageParam,
        limit: 10,
      });

      const typeIcons: Record<string, string> = {
        class: "/class.png", exam: "/exam.png", meeting: "/meeting.png",
        holiday: "/calendar-3d.png", event: "/event.png", notice: "/clip.png",
        result: "/result.jpg", timetable: "/timetable.png", placement: "/placement.png",
        emergency: "/emergency.png", finance: "/finance.jpg", other: "/others.png",
      };

      const formatRole = (role: string, isSchool?: boolean) => {
        let formatted = role?.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
        if (isSchool) { formatted = formatted?.replace(/College/g, "School"); }
        return formatted;
      };

      const formatted = res.data.map((item: any) => ({
        collegeAnnouncementId: item.collegeAnnouncementId,
        title: item.title,
        date: item.date,
        createdAt: item.createdAt,
        type: item.type,
        targetRoles: item.targetRoles,
        image: typeIcons[item.type] || "/clip.png",
        imgHeight: "h-10", cardBg: "#E8F8EF", imageBg: "#D3F1E0",
        professor: activeView === "my"
            ? `For ${item.targetRoles?.map((r: string) => formatRole(r, isSchool)).join(", ")}`
            : `By ${formatRole(item.createdByRole, isSchool)}`,
      }));

      return { data: formatted, totalPages: res.totalPages };
    },
    getNextPageParam: (lastPage, allPages) => lastPage.totalPages > allPages.length ? allPages.length + 1 : undefined,
    enabled: enableInfiniteScroll && !!collegeId && !!userId && !!userRole,
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextAnnouncements && !isFetchingNextAnnouncements) {
      fetchNextAnnouncements();
    }
  }, [inView, hasNextAnnouncements, isFetchingNextAnnouncements, fetchNextAnnouncements]);

  const infiniteAnnouncements = infiniteAnnouncementsData?.pages.flatMap(p => p.data) || [];

  const formatDateToDMY = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const { data: calendarAnnouncements = [], isLoading: isCalendarLoading, refetch: refetchCalendarAnnouncements } = useQuery({
    queryKey: ["calendarAnnouncements", collegeId, userId, userRole, activeView, selectedDate, refreshTrigger],
    queryFn: async () => {
      if (!selectedDate || !collegeId || !userId || !userRole) {
        return [];
      }

      return fetchCalendarAnnouncements({
        collegeId,
        userId,
        userRole,
        activeView,
        selectedDate,
        isSchool,
      });
    },
    enabled: !!selectedDate && !!collegeId && !!userId && !!userRole,
    staleTime: 5 * 60 * 1000,
  });

  const announcementsToShow: AnnounceCard[] = enableInfiniteScroll 
    ? infiniteAnnouncements 
    : (selectedDate ? calendarAnnouncements : announceCard);
    
  const isAnnouncementsLoading = isLoading || (enableInfiniteScroll 
    ? isInfiniteAnnouncementsPending 
    : (selectedDate ? isCalendarLoading : false));

  const formatRelativeTime = (createdAt?: string) => {
    if (!createdAt) return "";
    const created = new Date(createdAt);
    if (isNaN(created.getTime())) return "";
    const diff = Math.floor((Date.now() - created.getTime()) / 1000);

    if (diff < 10) return t("Just now");
    if (diff < 60) return t("{count} sec ago", { count: diff });
    const mins = Math.floor(diff / 60);
    if (mins < 60)
      return mins === 1
        ? t("{count} min ago", { count: mins })
        : t("{count} mins ago", { count: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)
      return hrs === 1
        ? t("{count} hr ago", { count: hrs })
        : t("{count} hrs ago", { count: hrs });
    const days = Math.floor(hrs / 24);
    return days === 1
      ? t("{count} day ago", { count: days })
      : t("{count} days ago", { count: days });
  };

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((v) => v + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleTabChange = (v: "my" | "others") => {
    setLocalView(v);
    onViewChange?.(v);
  };

  const handleCardClick = (card: AnnounceCard) => {
    setViewingAnnouncement(card);
  };

  const handleDelete = (announcementId: number) => {
    setDeleteId(announcementId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await deactivateCollegeAnnouncement(deleteId);
      if (!res.success) {
        toast.error(t("Failed to delete announcement"));
        return;
      }
      toast.success(t("Announcement deleted successfully"));
      setDeleteId(null);
      await refreshAnnouncements?.();
      queryClient.invalidateQueries({ queryKey: ["announcementsInfinite"] });
      queryClient.invalidateQueries({ queryKey: ["calendarAnnouncements"] });
      if (selectedDate) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t("Something went wrong"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`bg-white rounded-md flex flex-col p-2 shadow-md ${className || "mt-5 h-full"}`}>
      {viewingAnnouncement && (
        <ViewAnnouncementModal
          basicData={viewingAnnouncement}
          isSchool={isSchool}
          onClose={() => setViewingAnnouncement(null)}
        />
      )}

      <div className="flex flex-col mb-3 px-1">
        <div className="flex items-center justify-between">
          <h4 className="text-[#282828] font-semibold">{t("Announcements")}</h4>

          <div className="flex items-center gap-2">
            {!isReadOnlyUser && canManageAnnouncements && activeView === "my" && (
              <PlusCircleIcon 
                size={22} 
                weight="fill"
                className="text-[#43C17A] cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  setEditData(null);
                  setOpenModal(true);
                }}
              />
            )}
            <button 
              type="button" 
              onClick={(e) => { try { e.currentTarget.querySelector('input')?.showPicker(); } catch(err) {} }} 
              className="relative cursor-pointer w-6 h-6 flex items-center justify-center bg-transparent border-none p-0 outline-none hover:opacity-80 transition-opacity"
            >
              <CalendarIcon size={22} weight="fill" className="text-indigo-500 cursor-pointer" />
              <input
                type="date"
                className="absolute inset-0 opacity-0 pointer-events-none"
                onChange={(e) => setSelectedDate(e.target.value || null)}
                value={selectedDate || ""}
              />
            </button>
          </div>
        </div>

        {!isReadOnlyUser && canManageAnnouncements && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-semibold mt-2 lg:mt-2">
              <button
                onClick={() => handleTabChange("others")}
                className={`px-3 py-1 min-w-[80px] text-center text-sm rounded-sm transition-all duration-200 cursor-pointer ${activeView === "others"
                  ? "bg-[#43C17A] text-white shadow-sm"
                  : "text-gray-400 hover:text-[#16284F]"
                  }`}
              >
                {t("Shared")}
              </button>

              <span className="px-1 text-gray-400">/</span>

              <button
                onClick={() => handleTabChange("my")}
                className={`px-3 py-1 min-w-[80px] text-center text-sm rounded-sm transition-all duration-200 cursor-pointer ${activeView === "my"
                  ? "bg-[#43C17A] text-white shadow-sm"
                  : "text-gray-400 hover:text-[#16284F]"
                  }`}
              >
                {t("Personal")}
              </button>
            </div>
          </div>
        )}
      </div>
      {selectedDate && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-md py-1.5 px-3 mb-3 text-xs text-indigo-800 mx-1">
          <span className="font-medium flex items-center gap-1 flex-row flex-1 overflow-hidden">
            <span className="truncate">Showing announcements for:</span> 
            <span className="font-bold whitespace-nowrap">{formatDateToDMY(selectedDate)}</span>
          </span>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer shrink-0 ml-2 p-1"
            title="Clear Filter"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      )}

      <div
        className="flex min-h-[300px] flex-1 flex-col gap-2 overflow-y-auto text-center custom-scrollbar pr-1"
        style={height ? { maxHeight: height } : undefined}
      >
        {isAnnouncementsLoading ? (
          <AnnouncementListShimmer />
        ) : announcementsToShow.length === 0 ? (
          isReadOnlyUser ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm font-medium">
                {t("You don't have any announcements today")}
              </p>
            </div>
          ) : activeView === "my" ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm font-medium">{t("No announcements yet")}</p>
              <p className="text-xs mt-1">{t("Click + to create one")}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm font-medium">
                {t("You don't have any announcements today")}
              </p>
            </div>
          )
        ) : (
          announcementsToShow.map((card: AnnounceCard, index: number) => (
            <div
              key={index}
              onClick={() => handleCardClick(card)}
              className={`lg:h-[70.5px] flex items-center rounded-lg p-2 gap-1 cursor-pointer hover:shadow-sm transition-shadow`}
              style={{ backgroundColor: card.cardBg || "#E8F8EF" }}
            >
              <div
                className="h-[58px] w-[58px] rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.imageBg || "#D3F1E0" }}
              >
                <img
                  src={card.image || "/default.jpg"}
                  alt={card.title}
                  className={card.imgHeight}
                />
              </div>

              <div className="h-full w-[78%] rounded-md flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between h-[60%] px-1">
                  <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <p className="text-[13px] font-semibold text-[#282828]">
                      {card.title}
                    </p>
                  </div>

                  {!isReadOnlyUser && activeView === "my" && (
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenModal(false);
                          setTimeout(() => {
                            setEditData(card);
                            setOpenModal(true);
                          }, 0);
                        }}
                        className="p-1 rounded-full hover:bg-[#DFF3E9] cursor-pointer transition-colors"
                      >
                        <PencilSimple size={18} color="#16284F" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!card.collegeAnnouncementId) return;
                          handleDelete(card.collegeAnnouncementId);
                        }}
                        className="p-1 rounded-full hover:bg-red-100 cursor-pointer transition-colors"
                      >
                        <Trash size={18} color="#EF4444" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-1 text-[11px] text-[#454545]">
                  <div className="flex gap-2 overflow-x-auto whitespace-nowrap max-w-[70%] scrollbar-hide">
                    <span className="shrink-0">{card.professor}</span>
                    <span className="shrink-0">{formatDate(card.date)}</span>
                  </div>
                  <span className="text-[#6B7280] shrink-0 ml-2">
                    {formatRelativeTime(card.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        {enableInfiniteScroll && isFetchingNextAnnouncements && (
          <div className="mt-2">
            <AnnouncementListShimmer />
          </div>
        )}
        {enableInfiniteScroll && <div ref={loadMoreRef} className="h-1" />}
      </div>

      <AddAnnouncementModal
        key={editData?.collegeAnnouncementId || "new"}
        open={openModal}
        editData={editData}
        onClose={async () => {
          setOpenModal(false);
          setEditData(null);
          await refreshAnnouncements?.();
          queryClient.invalidateQueries({ queryKey: ["announcementsInfinite"] });
          queryClient.invalidateQueries({ queryKey: ["calendarAnnouncements"] });
          if (selectedDate) {
            setRefreshTrigger((prev) => prev + 1);
          }
        }}
      />

      <ConfirmDeleteModal
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete"
        name="announcement"
        customDescription={t("Are you sure you want to delete this announcement?")}
        isDeleting={isDeleting}
      />
    </div>
  );
}
