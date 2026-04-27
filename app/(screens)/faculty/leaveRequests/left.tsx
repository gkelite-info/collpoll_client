"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import {
  Users,
  User,
  MagnifyingGlass,
  CalendarIcon,
  PencilSimple,
  Paperclip,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import toast from "react-hot-toast";

import { Pagination } from "@/app/(screens)/faculty/assignments/components/pagination";

import { useUser } from "@/app/utils/context/UserContext";
import { getFacultyIdByUserId } from "@/lib/helpers/faculty/facultyAPI";
import {
  fetchFacultyLeaves,
  fetchStudentLeavesForFaculty,
  submitFacultyLeaveRequest,
  updateStudentLeaveStatus,
  fetchStudentLeaveCounts,
  fetchFacultyLeaveCounts,
} from "@/lib/helpers/faculty/leave request/facultyLeaveAPI";
import FacultyRequestLeaveModal from "./modal/RequestLeaveModal";
import { Loader } from "../../(student)/calendar/right/timetable";
import { ConfirmStatusModal } from "./modal/ConfirmStatusModal";

const STUDENT_COLUMNS = [
  { title: "S.No", key: "sNo" },
  { title: "Roll No.", key: "rollNo" },
  { title: "Photo", key: "photo" },
  { title: "Name", key: "name" },
  { title: "Branch", key: "branch" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Attachments", key: "attachments" },
  { title: "Action", key: "action" },
];

const MY_LEAVES_COLUMNS = [
  { title: "S.No", key: "sNo" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Status", key: "statusBadge" },
];

function FacultyLeavesContent() {
  const { userId } = useUser();
  const [facultyId, setFacultyId] = useState<number | null>(null);

  const [mainTab, setMainTab] = useState<"students" | "my_leaves">("students");
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

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    leaveId: number | null;
    action: "Approved" | "Rejected" | null;
  }>({ isOpen: false, leaveId: null, action: null });
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!userId) return;
    getFacultyIdByUserId(userId)
      .then((id) => setFacultyId(id))
      .catch(() => toast.error("Faculty context not found"));
  }, [userId]);

  const loadData = async () => {
    if (!facultyId) return;
    setIsLoading(true);
    try {
      if (mainTab === "students") {
        const [tableRes, countRes] = await Promise.all([
          fetchStudentLeavesForFaculty(
            facultyId,
            page,
            itemsPerPage,
            activeTab,
            debouncedSearch,
          ),
          fetchStudentLeaveCounts(facultyId),
        ]);
        setTableData(tableRes.data);
        setTotalItems(tableRes.totalCount);
        setCounts(countRes);
      } else {
        const [tableRes, countRes] = await Promise.all([
          fetchFacultyLeaves(
            facultyId,
            page,
            itemsPerPage,
            activeTab,
            debouncedSearch,
          ),
          fetchFacultyLeaveCounts(facultyId),
        ]);
        setTableData(tableRes.data);
        setTotalItems(tableRes.totalCount);
        setCounts(countRes);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setEditingRows(new Set());
  }, [mainTab, facultyId, activeTab, debouncedSearch, page]);

  const handleTabChange = (tabId: any) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const executeStatusChange = async () => {
    const { leaveId, action } = confirmModal;
    if (!leaveId || !action) return;

    setTableData((prev) =>
      prev.map((l) =>
        l.id === leaveId ? { ...l, status: action.toLowerCase() } : l,
      ),
    );

    setEditingRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(leaveId);
      return newSet;
    });

    setConfirmModal({ isOpen: false, leaveId: null, action: null });

    try {
      await updateStudentLeaveStatus(leaveId, action);
      toast.success(`Leave ${action}!`);
      if (facultyId) {
        const newCounts = await fetchStudentLeaveCounts(facultyId);
        setCounts(newCounts);
      }
    } catch (err) {
      toast.error(`Failed to ${action.toLowerCase()} leave`);
      loadData();
    }
  };

  const handleMyLeaveSubmit = async (formData: any) => {
    if (!facultyId) return;
    try {
      await submitFacultyLeaveRequest(facultyId, formData);
      toast.success("Leave request submitted successfully!");
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to submit request. Please try again.");
    }
  };

  const finalTableData = useMemo(() => {
    return tableData.map((item, index) => {
      const baseObj = {
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
      };

      if (mainTab === "students") {
        const isEditing = editingRows.has(item.id);
        return {
          ...baseObj,
          rollNo: (
            <>
              <span className="text-[#43C17A] font-bold">ID</span> -{" "}
              {item.rollNo}
            </>
          ),
          photo: (
            <img
              src={item.photo}
              alt="student"
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
          ),
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
          name: (
            <span className="font-medium whitespace-nowrap">{item.name}</span>
          ),
          branch: item.branch,
          action:
            item.status === "pending" || isEditing ? (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      leaveId: item.id,
                      action: "Approved",
                    })
                  }
                  className="bg-[#E7F8EE] hover:bg-[#d0f0de] text-[#43C17A] px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      leaveId: item.id,
                      action: "Rejected",
                    })
                  }
                  className="bg-[#FFE5E5] hover:bg-[#ffd1d1] text-[#FF4B4B] px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-xs font-bold ${item.status === "approved" ? "text-[#43C17A]" : "text-[#FF4B4B]"}`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
                <button
                  onClick={() =>
                    setEditingRows((prev) => new Set(prev).add(item.id))
                  }
                  className="text-gray-400 hover:text-[#16284F] transition-colors p-1 cursor-pointer"
                  title="Change Status"
                >
                  <PencilSimple size={16} weight="bold" />
                </button>
              </div>
            ),
        };
      } else {
        return {
          ...baseObj,
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
        };
      }
    });
  }, [tableData, mainTab, editingRows, page]);

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
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span
                onClick={() => setMainTab("students")}
                className={`cursor-pointer transition-colors ${mainTab === "students" ? "text-[#43C17A]" : "text-[#282828] hover:text-gray-500"}`}
              >
                Student Leave Requests
              </span>
              <span className="text-[#282828]">/</span>
              <span
                onClick={() => setMainTab("my_leaves")}
                className={`cursor-pointer transition-colors ${mainTab === "my_leaves" ? "text-[#43C17A]" : "text-[#282828] hover:text-gray-500"}`}
              >
                My Leave Request
              </span>
            </div>
            <p className="text-[#525252] text-sm font-medium">
              {mainTab === "students"
                ? "Review, Approve, and Manage Student Leave Applications Effortlessly"
                : "Submit leave applications and view approval updates from HR/Admin."}
            </p>
          </div>

          {mainTab === "my_leaves" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#16284F] text-white font-bold text-sm px-6 py-3 rounded-lg shadow-sm hover:bg-[#102040] transition-colors cursor-pointer"
            >
              Request Leave
            </button>
          )}
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
            columns={
              mainTab === "students" ? STUDENT_COLUMNS : MY_LEAVES_COLUMNS
            }
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

        <FacultyRequestLeaveModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleMyLeaveSubmit}
        />

        <ConfirmStatusModal
          isOpen={confirmModal.isOpen}
          action={confirmModal.action}
          onClose={() =>
            setConfirmModal({ isOpen: false, leaveId: null, action: null })
          }
          onConfirm={executeStatusChange}
        />
      </div>
    </>
  );
}

export default function FacultyLeavesLeft() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full py-10">
          <Loader />
        </div>
      }
    >
      <FacultyLeavesContent />
    </Suspense>
  );
}
