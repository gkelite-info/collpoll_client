"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import MeetingCard from "./components/MeetingCard";
import CreateMeetingModal from "./components/CreateMeetingModal";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import ConfirmDeleteModal from "../../admin/calendar/components/ConfirmDeleteModal";

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

const staticMeetings: Meeting[] = [
  {
    id: "fm-meet-1",
    financeMeetingId: 101,
    financeMeetingSectionsId: null,
    title: "Fee Collection Review",
    timeRange: "09:00:00 - 10:00:00",
    educationType: "B.Tech",
    branch: "CSE",
    date: "18 May 2026",
    description: "Review pending dues and payment follow-ups for the week.",
    participants: 18,
    year: "2nd Year",
    section: "A",
    tags: "Finance",
    category: "Parent",
    type: "upcoming",
    meetingLink: "https://meet.google.com/static-finance-review",
    hostName: "Anuv Shetty",
    hostImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
    subject: "Fee Review",
  },
  {
    id: "fm-meet-2",
    financeMeetingId: 102,
    financeMeetingSectionsId: 202,
    title: "Student Payment Discussion",
    timeRange: "11:30:00 - 12:15:00",
    educationType: "Degree",
    branch: "EEE",
    date: "19 May 2026",
    description: "Discuss installment requests and fee concession cases.",
    participants: 24,
    year: "1st Year",
    section: "B",
    tags: "Student",
    category: "Student",
    type: "upcoming",
    meetingLink: "https://meet.google.com/static-student-payment",
    hostName: "Miyav",
    hostImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    subject: "Payments",
  },
  {
    id: "fm-meet-3",
    financeMeetingId: 103,
    financeMeetingSectionsId: null,
    title: "Faculty Reimbursement Sync",
    timeRange: "14:00:00 - 15:00:00",
    educationType: "MBA",
    branch: "Finance",
    date: "20 May 2026",
    description: "Coordinate reimbursement approvals and document gaps.",
    participants: 12,
    year: "All",
    section: "All",
    tags: "Faculty",
    category: "Faculty",
    type: "upcoming",
    meetingLink: "https://meet.google.com/static-faculty-sync",
    hostName: "Stephen Jones",
    hostImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    subject: "Reimbursement",
  },
  {
    id: "fm-meet-4",
    financeMeetingId: 104,
    financeMeetingSectionsId: null,
    title: "Admin Budget Planning",
    timeRange: "10:00:00 - 11:00:00",
    educationType: "All",
    branch: "Admin",
    date: "15 May 2026",
    description: "Monthly administrative budget planning and approvals.",
    participants: 8,
    year: "All",
    section: "All",
    tags: "Admin",
    category: "Admin",
    type: "previous",
    meetingLink: "https://meet.google.com/static-admin-budget",
    hostName: "Admin Team",
    hostImage: null,
    subject: "Budget",
  },
  {
    id: "fm-meet-5",
    financeMeetingId: 105,
    financeMeetingSectionsId: 205,
    title: "Parent Fee Clarification",
    timeRange: "16:00:00 - 16:45:00",
    educationType: "Inter",
    branch: "MPC",
    date: "14 May 2026",
    description: "Clarify term fee structure and due dates for parents.",
    participants: 30,
    year: "1st Year",
    section: "C",
    tags: "Parent",
    category: "Parent",
    type: "previous",
    meetingLink: "https://meet.google.com/static-parent-fee",
    hostName: "Finance Desk",
    hostImage: null,
    subject: "Fee Structure",
  },
];

function MeetingListContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentType = (searchParams.get("type") as MeetingType) || "upcoming";
  const currentCategory =
    (searchParams.get("category") as MeetingCategory) || "Parent";
  const itemsPerPage = 4;

  const updateFilter = (key: string, value: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filteredMeetings = useMemo(
    () =>
      staticMeetings.filter(
        (meeting) =>
          meeting.type === currentType && meeting.category === currentCategory,
      ),
    [currentCategory, currentType],
  );

  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / itemsPerPage));
  const paginatedMeetings = filteredMeetings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

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
          {paginatedMeetings.length > 0 ? (
            paginatedMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                data={meeting}
                onDelete={(item) => {
                  setMeetingToDelete(item);
                  setDeleteModalOpen(true);
                }}
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
              className="rounded-md bg-gray-200 p-2 text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((item) => (
              <button
                key={item}
                onClick={() => setPage(item)}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  page === item
                    ? "bg-[#16284F] text-white"
                    : "bg-gray-200 text-gray-700"
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
              className="rounded-md bg-gray-200 p-2 text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
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
        editingMeetingId={editingMeetingId}
        editingSectionId={editingSectionId}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        isDeleting={false}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMeetingToDelete(null);
        }}
        onConfirm={() => {
          setDeleteModalOpen(false);
          setMeetingToDelete(null);
        }}
        name={meetingToDelete?.title || "meeting"}
      />
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#282828]">Loading...</div>}>
      <MeetingListContent />
    </Suspense>
  );
}
