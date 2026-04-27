"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { Loader } from "../calendar/right/timetable";
import {
  Users,
  User,
  MagnifyingGlass,
  CalendarIcon,
  Paperclip,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import RequestLeaveModal from "./modal/RequestLeaveModal";
import toast from "react-hot-toast";

import { Pagination } from "@/app/(screens)/faculty/assignments/components/pagination";

import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchStudentLeaves,
  submitLeaveRequest,
  fetchStudentLeaveCounts,
} from "@/lib/helpers/student/leave request/studentLeaveAPI";

// 🟢 NEW: Added Attachments column
const COLUMNS = [
  { title: "S.No", key: "sNo" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Attachments", key: "attachments" },
  { title: "Status", key: "statusBadge" },
];

function LeaveLeftContent() {
  const { userId } = useUser();
  const [studentId, setStudentId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<
    "all" | "approved" | "pending" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("students")
      .select("studentId")
      .eq("userId", userId)
      .single()
      .then(({ data }) => {
        if (data?.studentId) setStudentId(data.studentId);
      });
  }, [userId]);

  const loadData = async () => {
    if (!studentId) return;
    setIsLoading(true);
    try {
      const [tableRes, countRes] = await Promise.all([
        fetchStudentLeaves(
          studentId,
          page,
          itemsPerPage,
          activeTab,
          debouncedSearch,
        ),
        fetchStudentLeaveCounts(studentId),
      ]);
      setTableData(tableRes.data);
      setTotalItems(tableRes.totalCount);
      setCounts(countRes);
    } catch (err) {
      toast.error("Failed to load leave history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId, activeTab, debouncedSearch, page]);

  const handleTabChange = (tabId: any) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const handleLeaveSubmit = async (formData: any) => {
    if (!studentId) return;
    try {
      await submitLeaveRequest(studentId, formData);
      toast.success("Leave request submitted successfully!");
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to submit request. Please try again.");
    }
  };

  const finalTableData = useMemo(() => {
    return tableData.map((item, index) => ({
      sNo: String((page - 1) * itemsPerPage + index + 1).padStart(2, "0"),
      dateRange: `${item.fromDate} - ${item.toDate}`,
      days: item.days,
      leaveType: item.leaveType,
      description: (
        <span
          className="truncate max-w-[200px] md:max-w-[300px] inline-block text-sm"
          title={item.description}
        >
          {item.description}
        </span>
      ),
      // 🟢 NEW: Attachments UI Mapping
      attachments:
        item.attachments && item.attachments.length > 0 ? (
          <div className="flex items-center justify-center gap-1 overflow-x-auto custom-scrollbar pb-1 max-w-[120px]">
            {item.attachments.map((url: string, idx: number) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 flex-shrink-0 text-blue-600 hover:bg-blue-100 bg-blue-50 px-2 py-0.5 rounded text-xs font-medium border border-blue-100 transition-colors"
                title="View Attachment"
              >
                <Paperclip size={12} /> {idx + 1}
              </a>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        ),
      statusBadge: (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            item.status === "approved"
              ? "bg-[#E7F8EE] text-[#43C17A]"
              : item.status === "rejected"
                ? "bg-[#FFE5E5] text-[#FF4B4B]"
                : "bg-[#FFF4EB] text-[#FFB874]"
          }`}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    }));
  }, [tableData, page]);

  const cards = [
    {
      id: "all",
      label: "Total Requests",
      value: String(counts.all).padStart(2, "0"),
      icon: <Users size={24} weight="fill" />,
      activeColor: "bg-[#5C98FF]",
      inactiveColor: "bg-[#EBF2FF]",
      iconBgActive: "rgba(255,255,255,0.2)",
      iconBgInactive: "#5C98FF",
    },
    {
      id: "approved",
      label: "Approved",
      value: String(counts.approved).padStart(2, "0"),
      icon: <User size={24} weight="fill" />,
      activeColor: "bg-[#48C37C]",
      inactiveColor: "bg-[#E7F8EE]",
      iconBgActive: "rgba(255,255,255,0.2)",
      iconBgInactive: "#48C37C",
    },
    {
      id: "pending",
      label: "Pending",
      value: String(counts.pending).padStart(2, "0"),
      icon: <User size={24} weight="fill" />,
      activeColor: "bg-[#FFB874]",
      inactiveColor: "bg-[#FFF4EB]",
      iconBgActive: "rgba(255,255,255,0.2)",
      iconBgInactive: "#FFB874",
    },
    {
      id: "rejected",
      label: "Rejected",
      value: String(counts.rejected).padStart(2, "0"),
      icon: <User size={24} weight="fill" />,
      activeColor: "bg-[#FF4242]",
      inactiveColor: "bg-[#FFE5E5]",
      iconBgActive: "rgba(255,255,255,0.2)",
      iconBgInactive: "#FF4242",
    },
  ] as const;

  return (
    <>
      <style>{`
        .table-container-wrapper > div > div > div.overflow-auto {
          overflow-x: auto !important;
          overflow-y: auto !important;
        }
        .table-container-wrapper > div > div > div.overflow-auto::-webkit-scrollbar {
          height: 10px !important;
          width: 8px !important;
          display: block !important;
        }
        .table-container-wrapper > div > div > div.overflow-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .table-container-wrapper > div > div > div.overflow-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
          border: 2px solid #f1f5f9;
        }
        .table-container-wrapper > div > div > div.overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .table-container-wrapper table {
          min-width: 1100px !important;
        }
      `}</style>

      <div className="flex flex-col p-6 w-full max-w-[68%] mx-auto min-h-screen">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#282828] font-bold text-2xl">
              Leave Requests
            </h1>
            <p className="text-[#525252] text-sm font-medium">
              Submit leave applications and view approval updates from your
              faculty.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#16284F] text-white font-bold text-sm px-6 py-4 rounded-lg shadow-sm hover:bg-[#102040] transition-colors cursor-pointer"
          >
            Request Leave
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {cards.map((card) => {
            const isActive = activeTab === card.id;
            return (
              <CardComponent
                key={card.id}
                isActive={isActive}
                style={`w-full cursor-pointer transition-all duration-300 ${isActive ? card.activeColor : card.inactiveColor}`}
                icon={card.icon}
                value={card.value}
                label={card.label}
                iconBgColor={isActive ? card.iconBgActive : card.iconBgInactive}
                iconColor="#FFFFFF"
                textSize={isActive ? "text-white" : "text-[#282828]"}
                onClick={() => handleTabChange(card.id)}
              />
            );
          })}
        </div>

        <div className="flex justify-between items-center rounded-xl px-4 py-3 ">
          <div className="relative w-full max-w-[300px] flex items-center ">
            <MagnifyingGlass
              size={20}
              className="absolute left-3 text-[#43C17A] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#DAE9E1] px-4 py-1.5 rounded-md ">
            <CalendarIcon size={18} className="text-[#43C17A]" weight="fill" />
            <span className="text-[#43C17A] font-bold text-sm tracking-wide cursor-pointer">
              {new Date().toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>

        <div className="-mt-2 w-full table-container-wrapper">
          <TableComponent
            columns={COLUMNS}
            tableData={finalTableData}
            height="55vh"
            isLoading={isLoading}
          />
        </div>

        {!isLoading && totalItems > itemsPerPage && (
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
            />
          </div>
        )}

        <RequestLeaveModal
          isOpen={isModalOpen}
          studentId={studentId}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleLeaveSubmit}
        />
      </div>
    </>
  );
}

export default function LeavesLeft() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full py-10">
          <Loader />
        </div>
      }
    >
      <LeaveLeftContent />
    </Suspense>
  );
}
