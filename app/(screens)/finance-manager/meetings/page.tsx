"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import MeetingCard from "./components/MeetingCard";
import CreateMeetingModal from "./components/CreateMeetingModal";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import ConfirmDeleteModal from "../../admin/calendar/components/ConfirmDeleteModal";
import { Loader } from "../../(student)/calendar/right/timetable";
import MeetingCardShimmer from "@/app/utils/shimmers/MeetingCardShimmer";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import {
  deactivateFinanceMeeting,
  fetchFinanceMeetings,
} from "@/lib/helpers/finance/meetings/meetingsAPI";
import { deleteFinanceMeetingSection } from "@/lib/helpers/finance/meetings/meetingsSectionsAPI";

type MeetingType = "upcoming" | "previous";
type MeetingCategory = "Parent" | "Student" | "Faculty" | "Admin";

export interface Meeting {
  id: string;
  financeMeetingId: number;
  financeMeetingSectionsId: number | null;
  title: string;
  timeRange: string;
  educationType: string;
  branch: string;
  date: string;
  description: string;
  participants: number;
  year: string;
  section: string;
  tags: string;
  category: MeetingCategory;
  type: MeetingType;
  meetingLink: string;
  hostName?: string;
  hostImage?: string | null;
  subject?: string;
}

const formatMeetingDate = (dateStr: string) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function MeetingListContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentType = (searchParams.get("type") as MeetingType) || "upcoming";
  const currentCategory =
    (searchParams.get("category") as MeetingCategory) || "Parent";
  const { financeManagerId } = useFinanceManager();
  const itemsPerPage = 10;

  const updateFilter = (key: string, value: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const loadMeetings = useCallback(async () => {
    if (!financeManagerId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const now = new Date();
      const currentDate = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

      const res = await fetchFinanceMeetings({
        createdBy: financeManagerId,
        role: currentCategory,
        type: currentType,
        page,
        limit: itemsPerPage,
        currentDate,
        currentTime,
      });

      setMeetings(
        res.data.map((meeting: Meeting) => ({
          ...meeting,
          date: formatMeetingDate(meeting.date),
        })),
      );
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error(`Failed to fetch ${currentCategory} in ${currentType}.`);
    } finally {
      setIsLoading(false);
    }
  }, [currentCategory, currentType, financeManagerId, page]);

  useEffect(() => {
    setPage(1);
  }, [currentType, currentCategory]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const typeTabs = [
    { id: "upcoming", label: "Upcoming Meetings" },
    { id: "previous", label: "Previous Meetings" },
  ];

  const categoryTabs = [
    { id: "Parent", label: "Parent Meetings" },
    { id: "Student", label: "Student Meetings" },
    { id: "Faculty", label: "Faculty Meetings" },
    { id: "Admin", label: "Admin Meetings" },
  ];

  const handleDeleteClick = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;
    setIsDeleting(true);
    try {
      if (meetingToDelete.financeMeetingSectionsId) {
        await deleteFinanceMeetingSection(
          meetingToDelete.financeMeetingSectionsId,
        );
      } else {
        await deactivateFinanceMeeting(meetingToDelete.financeMeetingId);
      }

      toast.success("Meeting deleted successfully");
      setDeleteModalOpen(false);
      setMeetingToDelete(null);
      await loadMeetings();
    } catch {
      toast.error("Failed to delete meeting");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (
    financeMeetingId: number,
    financeMeetingSectionsId: number | null,
  ) => {
    setEditingMeetingId(financeMeetingId);
    setEditingSectionId(financeMeetingSectionsId);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden font-sans text-slate-800">
      <div className="z-10 shrink-0 p-2">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#282828]">Meetings</h1>
            <p className="mt-1 text-sm text-[#282828]">
              View and join meetings or schedule meetings
            </p>
          </div>
          <div className="w-[320px]">
            <CourseScheduleCard isVisibile={false} />
          </div>
        </div>

        <div className="relative mb-4 flex">
          <div className="mx-auto inline-flex gap-2 self-center rounded-full bg-white/80 p-2">
            {typeTabs.map((tab) => {
              const isActive = currentType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => updateFilter("type", tab.id)}
                  className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-[#E9E9E9]" : "text-[#414141]"
                  }`}
                >
                  {tab.label}
                  {isActive ? (
                    <motion.div
                      layoutId="type-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-[#43C17A] shadow-sm"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  ) : (
                    <div className="absolute inset-0 -z-10 rounded-full bg-[#DEDEDE] shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute -right-1 flex cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-4 py-2 text-sm font-medium text-[#E9E9E9]"
          >
            Create Meeting
          </button>
        </div>

        <div className="mb-2 flex flex-wrap justify-center gap-3">
          <div className="relative inline-flex gap-2 rounded-full bg-white/80 p-2">
            {categoryTabs.map((tab) => {
              const isActive = currentCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => updateFilter("category", tab.id)}
                  className={`relative z-10 cursor-pointer rounded-full px-6 py-1 text-sm font-semibold transition-colors ${
                    isActive ? "text-[#E9E9E9]" : "text-[#414141]"
                  }`}
                >
                  {tab.label}
                  {isActive ? (
                    <motion.div
                      layoutId="category-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-[#16284F] shadow-sm"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  ) : (
                    <div className="absolute inset-0 -z-10 rounded-full bg-[#DEDEDE] shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 pt-2">
        <div className="grid grid-cols-1 gap-3 pb-6 md:grid-cols-2">
          {isLoading ? (
            <MeetingCardShimmer
              role="Finance"
              category={currentCategory}
              type={currentType}
              count={8}
            />
          ) : meetings.length > 0 ? (
            meetings.map((meeting, index) => (
              <MeetingCard
                key={meeting.id || `meeting-card-${index}`}
                data={meeting}
                onDelete={handleDeleteClick}
                role="Finance"
                category={currentCategory}
                onEdit={handleEditClick}
              />
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-white py-30 text-center text-gray-500">
              <p className="text-lg">
                No meetings found for {currentCategory} in {currentType}.
              </p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center overflow-x-auto pb-4">
          <div className="flex min-w-max items-center gap-2 px-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className={`flex items-center justify-center rounded-md p-2 transition-colors ${
                page === 1
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((item) => (
              <button
                key={item}
                onClick={() => setPage(item)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  page === item
                    ? "bg-[#16284F] text-white"
                    : "cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {item}
              </button>
            ))}
            <button
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page === totalPages}
              className={`flex items-center justify-center rounded-md p-2 transition-colors ${
                page === totalPages
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      <CreateMeetingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMeetingId(null);
          setEditingSectionId(null);
        }}
        onSuccess={loadMeetings}
        editingMeetingId={editingMeetingId}
        editingSectionId={editingSectionId}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        isDeleting={isDeleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMeetingToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        name="meeting"
      />
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <Suspense fallback={<div><Loader /></div>}>
      <MeetingListContent />
    </Suspense>
  );
}
