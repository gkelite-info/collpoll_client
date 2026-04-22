"use client";

import {
  PencilSimple,
  Plus,
  Trash,
  X,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AddAnnouncementModal from "../components/modals/AddAnnouncementModal";
import {
  deactivateCollegeAnnouncement,
  fetchAnnouncementDetails,
} from "@/lib/helpers/announcements/announcementAPI";
import toast from "react-hot-toast";

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

type AnnouncementsCardProps = {
  announceCard: AnnounceCard[];
  height?: string;
  currentView?: "my" | "others";
  isLoading?: boolean;
  onAddClick?: () => void;
  onViewChange?: (view: "my" | "others") => void;
  onEditAnnouncement?: (announcement: AnnounceCard) => void;
  refreshAnnouncements?: () => Promise<void>;
  readOnly?: boolean;
};

const AnnouncementListShimmer = () => (
  <div className="flex flex-col gap-2">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-[70.5px] bg-gray-50 rounded-lg flex items-center p-2 gap-2 border border-gray-100"
      >
        <div className="h-[58px] w-[58px] bg-gray-200 rounded-md animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2 px-1">
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

// 🟢 NEW: Shimmer for the modal content
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

function ViewAnnouncementModal({
  basicData,
  fullData,
  isLoading,
  onClose,
}: {
  basicData: AnnounceCard;
  fullData: AnnouncementDetails | null;
  isLoading: boolean;
  onClose: () => void;
}) {
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
              {basicData.type}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[150px]">
          {isLoading ? (
            <AnnouncementDetailsShimmer />
          ) : fullData ? (
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
                    {fullData.creatorRole}
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
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8 text-sm">
              Failed to load details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsCard({
  announceCard,
  height,
  currentView,
  isLoading = false,
  onAddClick,
  onViewChange,
  onEditAnnouncement,
  refreshAnnouncements,
  readOnly,
}: AnnouncementsCardProps) {
  const pathname = usePathname();
  const isFinanceDashboard = pathname.startsWith("/finance");
  const isCollegeAdminDashboard = pathname.startsWith("/college-admin");
  const isAdminDashboard = pathname.startsWith("/admin");
  const isStudentDashboard = pathname.includes("stu_dashboard");
  const isParentDashboard = pathname.includes("parent");
  const isFacultyDashboard = pathname.startsWith("/faculty");
  const isHrDashboard = pathname.startsWith("/hr");
  const isPlacementDashboard = pathname.startsWith("/placement");

  const isReadOnlyUser = readOnly ?? (isStudentDashboard || isParentDashboard);
  const canManageAnnouncements =
    !isReadOnlyUser &&
    (isFinanceDashboard ||
      isCollegeAdminDashboard ||
      isAdminDashboard ||
      isFacultyDashboard ||
      isHrDashboard ||
      isPlacementDashboard);

  const [localView, setLocalView] = useState<"others" | "my">("others");
  const activeView = currentView || localView;

  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<AnnounceCard | null>(null);

  // 🟢 States for fetching full details dynamically on click
  const [viewingAnnouncement, setViewingAnnouncement] =
    useState<AnnounceCard | null>(null);
  const [fullDetailsData, setFullDetailsData] =
    useState<AnnouncementDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const formatRelativeTime = (createdAt?: string) => {
    if (!createdAt) return "";
    const created = new Date(createdAt);
    if (isNaN(created.getTime())) return "";
    const diff = Math.floor((Date.now() - created.getTime()) / 1000);

    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff} sec ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
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

  const handleCardClick = async (card: AnnounceCard) => {
    setViewingAnnouncement(card);
    setIsLoadingDetails(true);
    try {
      if (card.collegeAnnouncementId) {
        const details = await fetchAnnouncementDetails(
          card.collegeAnnouncementId,
        );
        setFullDetailsData(details);
      }
    } catch (error) {
      toast.error("Failed to load details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleDelete = (announcementId: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">
          Are you sure you want to delete this announcement?
        </span>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await deactivateCollegeAnnouncement(announcementId);
                if (!res.success) {
                  toast.error("Failed to delete announcement");
                  return;
                }
                toast.success("Announcement deleted successfully");
                await refreshAnnouncements?.();
              } catch (error) {
                console.error("Delete error:", error);
                toast.error("Something went wrong");
              }
            }}
            className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-md flex flex-col mt-5 p-2 shadow-md h-full">
      {viewingAnnouncement && (
        <ViewAnnouncementModal
          basicData={viewingAnnouncement}
          fullData={fullDetailsData}
          isLoading={isLoadingDetails}
          onClose={() => {
            setViewingAnnouncement(null);
            setFullDetailsData(null);
          }}
        />
      )}

      <div className="flex flex-col mb-3 px-1">
        <div className="flex items-center justify-between">
          <h4 className="text-[#282828] font-semibold">Announcements</h4>

          {!isReadOnlyUser && canManageAnnouncements && activeView === "my" && (
            <button
              onClick={() => {
                setEditData(null);
                setOpenModal(true);
              }}
              className="bg-[#43C17A] text-white w-7 h-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-[#34a362] transition-colors"
            >
              <Plus size={14} weight="bold" />
            </button>
          )}
        </div>

        {!isReadOnlyUser && canManageAnnouncements && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-semibold lg:mt-2">
              <button
                onClick={() => handleTabChange("others")}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 cursor-pointer ${
                  activeView === "others"
                    ? "bg-[#43C17A] text-white shadow-sm"
                    : "text-gray-400 hover:text-[#16284F]"
                }`}
              >
                Shared
              </button>

              <span className="px-1 text-gray-400">/</span>

              <button
                onClick={() => handleTabChange("my")}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 cursor-pointer ${
                  activeView === "my"
                    ? "bg-[#43C17A] text-white shadow-sm"
                    : "text-gray-400 hover:text-[#16284F]"
                }`}
              >
                Personal
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`flex flex-col gap-2 overflow-y-auto max-h-[${height}]`}>
        {isLoading ? (
          <AnnouncementListShimmer />
        ) : announceCard.length === 0 ? (
          isReadOnlyUser ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm font-medium">
                You don&apos;t have any announcements today
              </p>
            </div>
          ) : activeView === "my" ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm font-medium">No announcements yet</p>
              <p className="text-xs mt-1">Click + to create one</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm font-medium">
                You don&apos;t have any announcements today
              </p>
            </div>
          )
        ) : (
          announceCard.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card)} // 🟢 Click to view details
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
      </div>

      <AddAnnouncementModal
        key={editData?.collegeAnnouncementId || "new"}
        open={openModal}
        editData={editData}
        onClose={async () => {
          setOpenModal(false);
          setEditData(null);
          await refreshAnnouncements?.();
        }}
      />
    </div>
  );
}
