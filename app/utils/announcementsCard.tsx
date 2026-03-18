"use client";

import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AddAnnouncementModal from "../components/modals/AddAnnouncementModal";
import { deactivateCollegeAnnouncement } from "@/lib/helpers/announcements/announcementAPI";
import toast from "react-hot-toast";

type AnnounceCard = {
  collegeAnnouncementId?: number;
  image: string;
  imgHeight: string;
  title: string;
  professor: string;
  date?: string;
  createdAt?: string;
  time?: string;
  cardBg: string;
  imageBg: string;
  type?: string;
  targetRole?: string;
};

type AnnouncementsCardProps = {
  announceCard: AnnounceCard[];
  height?: string;
  onAddClick?: () => void;
  onViewChange?: (view: "my" | "others") => void;
  onEditAnnouncement?: (announcement: AnnounceCard) => void;
  refreshAnnouncements?: () => Promise<void>;
};

export default function AnnouncementsCard({
  announceCard,
  height,
  onAddClick,
  onViewChange,
  onEditAnnouncement,
  refreshAnnouncements
}: AnnouncementsCardProps) {
  const pathname = usePathname();
  const isFinanceDashboard = pathname.startsWith("/finance");
  const isCollegeAdminDashboard = pathname.startsWith("/college-admin");
  const isAdminDashboard = pathname.startsWith("/admin");
  const isStudentDashboard = pathname.includes("stu_dashboard");
  const isParentDashboard = pathname.includes("parent");
  const isFacultyDashboard = pathname.startsWith("/faculty");
  const isHrDashboard = pathname.startsWith("/hr");
  const isReadOnlyUser = isStudentDashboard || isParentDashboard;
  const canManageAnnouncements = !isReadOnlyUser && (isFinanceDashboard || isCollegeAdminDashboard || isAdminDashboard || isFacultyDashboard || isHrDashboard);

  const [activeView, setActiveView] = useState<"my" | "others">(isReadOnlyUser ? "others" : "my");
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

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
    <div className="bg-white rounded-md flex flex-col mt-5 p-2 shadow-md h-fit">
      <div className="flex flex-col mb-3 px-1">
        <div className="flex items-center justify-between">
          <h4 className="text-[#282828] font-semibold">
            Announcements
          </h4>

          {!isReadOnlyUser && canManageAnnouncements && !isReadOnlyUser && activeView === "my" && (
            <button
              onClick={() => {
                setEditData(null);
                setOpenModal(true);
              }}
              className="bg-[#43C17A] text-white w-7 h-7 flex items-center justify-center rounded-full cursor-pointer"
            >
              <Plus size={14} weight="bold" />
            </button>
          )}

        </div>

        {!isReadOnlyUser && canManageAnnouncements && (
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-1 text-sm font-semibold">

              <button
                onClick={() => {
                  setActiveView("my");
                  onViewChange?.("my");
                }}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${activeView === "my"
                  ? "bg-[#43C17A] text-white shadow-sm"
                  : "text-gray-400 hover:text-[#16284F]"
                  }`}
              >
                Personal
              </button>

              <span className="px-1 text-gray-400">/</span>

              <button
                onClick={() => {
                  setActiveView("others");
                  onViewChange?.("others");
                }}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${activeView === "others"
                  ? "bg-[#43C17A] text-white shadow-sm"
                  : "text-gray-400 hover:text-[#16284F]"
                  }`}
              >
                Shared
              </button>

            </div>
          </div>
        )}
      </div>

      {/* </div> */}
      <div className={`flex flex-col gap-2 overflow-y-auto max-h-[${height}]`}>
        {announceCard.length === 0 ? (

          isReadOnlyUser ? (

            // ✅ STUDENT / PARENT
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm font-medium">
                You don't have any announcements today
              </p>
            </div>

          ) : activeView === "my" ? (

            // ✅ ADMIN / FINANCE / COLLEGE ADMIN (MY)
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm font-medium">No announcements yet</p>
              <p className="text-xs mt-1">Click + to create one</p>
            </div>

          ) : (

            // ✅ ADMIN / FINANCE (SHARED)
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm font-medium">
                You don't have any announcements today
              </p>
            </div>

          )

        ) : (
          announceCard.map((card, index) => (
            <div
              key={index}
              className={`lg:h-[70.5px] flex items-center rounded-lg p-2 gap-1`}
              style={{ backgroundColor: card.cardBg || "#E8F8EF" }}
            >
              <div
                className="h-[58px] w-[58px] rounded-md flex items-center justify-center"
                style={{ backgroundColor: card.imageBg || "#D3F1E0" }}
              >
                <img
                  src={card.image || "/default.jpg"}
                  alt={card.title}
                  className={card.imgHeight}
                />
              </div>

              <div className="h-full w-[78%] rounded-md flex flex-col">

                <div className="flex items-center justify-between h-[60%] px-1">

                  {/* Title (fixed width + horizontal scroll) */}
                  <div className="max-w-[210px] overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <p className="text-[13px] font-semibold text-[#282828]">
                      {card.title}
                    </p>
                  </div>

                  {/* Show icons ONLY for My Announcements */}
                  {!isReadOnlyUser && activeView === "my" && (
                    <div className="flex items-center gap-2 ml-2">

                      <button
                        onClick={() => {
                          setOpenModal(false); // force reset
                          setTimeout(() => {
                            setEditData(card);
                            setOpenModal(true);
                          }, 0);
                        }}
                        className="p-1 rounded-full hover:bg-[#DFF3E9] cursor-pointer"
                      >
                        <PencilSimple size={18} color="#16284F" />
                      </button>

                      <button
                        onClick={() => {
                          if (!card.collegeAnnouncementId) return;
                          handleDelete(card.collegeAnnouncementId);
                        }}
                        className="p-1 rounded-full hover:bg-red-100 cursor-pointer"
                      >
                        <Trash size={18} color="#EF4444" />
                      </button>
                    </div>
                  )}

                </div>

                {/* Role + Date + Time */}
                <div className="flex items-center justify-between px-1 text-[11px] text-[#454545]">

                  {/* LEFT → Roles + Date (scrollable) */}
                  <div className="flex gap-2 overflow-x-auto whitespace-nowrap max-w-[70%] scrollbar-hide">

                    <span className="shrink-0">
                      {card.professor}
                    </span>

                    <span className="shrink-0">
                      {formatDate(card.date)}
                    </span>

                  </div>

                  {/* RIGHT → Time (fixed) */}
                  <span className="text-[#6B7280] shrink-0 ml-2">
                    {formatRelativeTime(card.createdAt)}
                  </span>

                </div>
              </div>
            </div>
          )
          ))}
      </div>
      <AddAnnouncementModal
        key={editData?.collegeAnnouncementId || "new"}
        open={openModal}
        editData={editData}
        onClose={() => {
          setOpenModal(false);
          setEditData(null);
        }}
      />
    </div>

  );
}
