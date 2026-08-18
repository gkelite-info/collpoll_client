"use client";

import { Suspense, useEffect, useState, useMemo, useRef } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

import { useUser } from "@/app/utils/context/UserContext";
import { getFacultyIdByUserId } from "@/lib/helpers/faculty/facultyAPI";
import {
  fetchFacultyLeaves,
  fetchStudentLeavesForFaculty,
  submitFacultyLeaveRequest,
  updateStudentLeaveStatus,
  fetchStudentLeaveCounts,
  fetchFacultyLeaveCounts,
  fetchFacultyTaggedLeaves,
  fetchFacultyTaggedLeaveCounts,
} from "@/lib/helpers/faculty/leave request/facultyLeaveAPI";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import FacultyRequestLeaveModal from "./modal/RequestLeaveModal";
import { Loader } from "../../(student)/calendar/right/timetable";
import { ConfirmStatusModal } from "./modal/ConfirmStatusModal";
import FacultyLeaveDetailsModal from "./modal/facultyLeaveStatusModal";
import { Avatar } from "@/app/utils/Avatar";
import EmployeeLeaveDetailsModal from "@/app/(screens)/finance-manager/leave-request/components/LeaveRequestDetailsModal";
import type { FinanceLeaveRequest } from "@/app/(screens)/finance-manager/leave-request/data";
import { LeaveCardsShimmer, LeavePageShimmer } from "@/app/components/shimmers/LeaveRequestsShimmer";

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
  { title: "Details", key: "details" },
];

const MY_LEAVES_COLUMNS = [
  { title: "S.No", key: "sNo" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Status", key: "statusBadge" },
  { title: "Details", key: "details" },
];

const TAGGED_LEAVES_COLUMNS = [
  { title: "S.No", key: "sNo" },
  { title: "Employee ID", key: "employeeId" },
  { title: "Photo", key: "photo" },
  { title: "Name", key: "name" },
  { title: "Role", key: "role" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
  { title: "Status", key: "statusBadge" },
  { title: "Details", key: "details" },
];

const LEAVE_VIEW_TABS = [
  {
    id: "students",
    label: "Student Leave Requests",
  },
  {
    id: "my_leaves",
    label: "My Leave Request",
  },
  {
    id: "tagged",
    label: "Tagged Leave Requests",
  },
] as const;

type LeaveStatusTab = "all" | "approved" | "pending" | "rejected";

type FacultyLeaveFormData = {
  leaveType: string;
  startDate: string;
  endDate: string;
  description: string;
};

type FacultyLeaveTableRow = {
  id: number;
  employeeLeaveRequestId?: number;
  employeeId?: string;
  fromDate: string;
  toDate: string;
  days: string;
  leaveType: string;
  description: string;
  status: string;
  rollNo?: string;
  photo?: string | null;
  name?: string;
  role?: string;
  requestedDate?: string;
  branch?: string;
  semester?: string;
  year?: string;
  section?: string;
  attachments?: string[];
};

function FacultyLeavesContent() {
  const { userId, collegeEducationType, facultyId } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabQuery = searchParams.get("tab");
  const initialMainTab = ["students", "my_leaves", "tagged"].includes(tabQuery as string)
    ? (tabQuery as "students" | "my_leaves" | "tagged")
    : "students";

  const [mainTab, setMainTab] = useState<
    "students" | "my_leaves" | "tagged"
  >(initialMainTab);
  const [activeTab, setActiveTab] = useState<LeaveStatusTab>("all");

  const [searchQuery, setSearchQuery] = useState("");
  
  const isSchool = isSchoolEducation(collegeEducationType);
  const isInter = collegeEducationType?.toUpperCase().includes("INTER");

  const dynamicStudentColumns = useMemo(() => {
    return STUDENT_COLUMNS.flatMap((col) => {
      if (col.key === "branch") {
        if (isSchool) {
          return [
            { title: "Year", key: "year" },
            { title: "Section", key: "section" }
          ];
        }
        if (isInter) {
          return [
            { title: "Group", key: "branch" },
            { title: "Year", key: "year" },
            { title: "Section", key: "section" }
          ];
        }
        
        return [
          { title: "Branch", key: "branch" },
          { title: "Year", key: "year" },
          { title: "Sem", key: "semester" },
          { title: "Section", key: "section" }
        ];
      }
      return [col];
    }).filter(Boolean) as typeof STUDENT_COLUMNS;
  }, [isSchool, isInter]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [debouncedFilterDate, setDebouncedFilterDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const [isFirstLoad, setIsFirstLoad] = useState(() => {
    // If we already have cache, it's not the first load (e.g. returning to tab)
    const hasCache = queryClient.getQueryData(["facultyLeaves", facultyId, mainTab, activeTab, debouncedSearch, debouncedFilterDate, page]);
    return !hasCache;
  });



  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    leaveId: number | null;
    action: "Approved" | "Rejected" | null;
  }>({ isOpen: false, leaveId: null, action: null });
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [selectedLeaveData, setSelectedLeaveData] =
    useState<FacultyLeaveTableRow | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmployeeLeave, setSelectedEmployeeLeave] =
    useState<FinanceLeaveRequest | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setDebouncedFilterDate(filterDate);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterDate]);

  // facultyId is directly available from context

  const { data: countsData = { all: 0, approved: 0, pending: 0, rejected: 0 }, isLoading: isCountsLoading } = useQuery({
    queryKey: ["facultyLeaveCounts", facultyId, mainTab],
    queryFn: async () => {
      if (!facultyId) return { all: 0, approved: 0, pending: 0, rejected: 0 };
      if (mainTab === "students") return fetchStudentLeaveCounts(facultyId);
      if (mainTab === "tagged") return fetchFacultyTaggedLeaveCounts(facultyId);
      return fetchFacultyLeaveCounts(facultyId);
    },
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: leavesData = { data: [], totalCount: 0 }, isLoading } = useQuery({
    queryKey: ["facultyLeaves", facultyId, mainTab, activeTab, debouncedSearch, debouncedFilterDate, page],
    queryFn: async () => {
      if (!facultyId) return { data: [], totalCount: 0 };
      if (mainTab === "students") {
        return fetchStudentLeavesForFaculty(facultyId, page, itemsPerPage, activeTab, debouncedSearch, debouncedFilterDate);
      } else if (mainTab === "tagged") {
        return fetchFacultyTaggedLeaves(facultyId, page, itemsPerPage, activeTab, debouncedSearch, debouncedFilterDate);
      } else {
        return fetchFacultyLeaves(facultyId, page, itemsPerPage, activeTab, debouncedSearch, debouncedFilterDate);
      }
    },
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const tableData = leavesData.data as FacultyLeaveTableRow[];
  const totalItems = leavesData.totalCount;
  const counts = countsData;

  const handleTabChange = (tabId: LeaveStatusTab) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ leaveId, action }: { leaveId: number; action: "Approved" | "Rejected" }) => {
      return updateStudentLeaveStatus(leaveId, action);
    },
    onSuccess: (data, variables) => {
      toast.success(`Leave ${variables.action}!`, { id: "status-update-success" });
      queryClient.invalidateQueries({ queryKey: ["facultyLeaveCounts"] });
      queryClient.invalidateQueries({ queryKey: ["facultyLeaves"] });
    },
    onError: (error, variables) => {
      toast.error(`Failed to ${variables.action.toLowerCase()} leave. Please try again later.`, { id: "status-update-error" });
    },
  });

  const submitLeaveMutation = useMutation({
    mutationFn: async (formData: FacultyLeaveFormData) => {
      if (!facultyId) throw new Error("Faculty ID missing");
      return submitFacultyLeaveRequest(facultyId, formData);
    },
    onSuccess: () => {
      toast.success("Leave request submitted successfully!", { id: "submit-leave-success" });
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["facultyLeaveCounts"] });
      queryClient.invalidateQueries({ queryKey: ["facultyLeaves"] });
    },
    onError: () => {
      toast.error("Failed to submit request. Please try again later.", { id: "submit-leave-error" });
    }
  });

  const executeStatusChange = async () => {
    const { leaveId, action } = confirmModal;
    if (!leaveId || !action) return;

    try {
      await updateStatusMutation.mutateAsync({ leaveId, action });
      setEditingRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(leaveId);
        return newSet;
      });
      setConfirmModal({ isOpen: false, leaveId: null, action: null });
    } catch (e) {
      // Error is handled by onError in useMutation
    }
  };

  const handleMyLeaveSubmit = async (formData: FacultyLeaveFormData) => {
    await submitLeaveMutation.mutateAsync(formData);
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
            // <img
            //   src={item.photo}
            //   alt="student"
            //   className="w-8 h-8 rounded-full object-cover border border-gray-200"
            // />

            <Avatar
              src={item.photo}
              size={32}
              alt="student"
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
          year: item.year,
          semester: item.semester,
          section: item.section,
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
          details: (
            <button
              onClick={() => {
                setSelectedLeaveData(item);
                setIsDetailsModalOpen(true);
              }}
              className="text-blue-600 font-bold text-xs hover:underline cursor-pointer"
            >
              View Details
            </button>
          ),
        };
      } else if (mainTab === "tagged") {
        return {
          ...baseObj,
          employeeId: (
            <>
              <span className="text-[#43C17A] font-bold">ID</span> -{" "}
              {item.employeeId}
            </>
          ),
          photo: <Avatar src={item.photo} size={32} alt={item.name ?? "Employee"} />,
          name: (
            <span className="font-medium whitespace-nowrap">
              {item.name ?? "Employee"}
            </span>
          ),
          role: item.role,
          statusBadge: (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "approved"
                ? "bg-[#E7F8EE] text-[#43C17A]"
                : item.status === "rejected"
                  ? "bg-[#FFE5E5] text-[#FF4B4B]"
                  : "bg-[#FFF4EB] text-[#FFB874]"
                }`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          ),
          details: (
            <button
              type="button"
              onClick={() =>
                setSelectedEmployeeLeave({
                  employeeLeaveRequestId: item.employeeLeaveRequestId,
                  serialNo: String(
                    (page - 1) * itemsPerPage + index + 1,
                  ).padStart(2, "0"),
                  employeeId: item.employeeId ?? "",
                  name: item.name ?? "Employee",
                  role: item.role ?? "Employee",
                  photo: item.photo ?? "",
                  requestedDate: item.requestedDate ?? "",
                  dateRange: `${item.fromDate} - ${item.toDate}`,
                  days: item.days,
                  leaveType: item.leaveType,
                  description: item.description,
                  status: item.status as FinanceLeaveRequest["status"],
                  chat: [],
                })
              }
              className="cursor-pointer text-xs font-bold text-blue-600 hover:underline"
            >
              View Details
            </button>
          ),
        };
      } else {
        return {
          ...baseObj,
          statusBadge: (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "approved"
                ? "bg-[#E7F8EE] text-[#43C17A]"
                : item.status === "rejected"
                  ? "bg-[#FFE5E5] text-[#FF4B4B]"
                  : "bg-[#FFF4EB] text-[#FFB874]"
                }`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          ),
          details: (
            <button
              type="button"
              onClick={() =>
                setSelectedEmployeeLeave({
                  employeeLeaveRequestId: item.employeeLeaveRequestId,
                  serialNo: String(
                    (page - 1) * itemsPerPage + index + 1,
                  ).padStart(2, "0"),
                  employeeId: item.employeeId ?? "",
                  name: item.name ?? "Faculty",
                  role: item.role ?? "Faculty",
                  photo: item.photo ?? "",
                  requestedDate: item.requestedDate ?? "",
                  dateRange: `${item.fromDate} - ${item.toDate}`,
                  days: item.days,
                  leaveType: item.leaveType,
                  description: item.description,
                  status: item.status as FinanceLeaveRequest["status"],
                  chat: [],
                })
              }
              className="cursor-pointer text-xs font-bold text-blue-600 hover:underline"
            >
              View Details
            </button>
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

  useEffect(() => {
    if (!isLoading && !isCountsLoading && facultyId) {
      setIsFirstLoad(false);
    }
  }, [isLoading, isCountsLoading, facultyId]);

  if (!userId || !facultyId || isFirstLoad) {
    return <LeavePageShimmer />;
  }

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

      <div className="flex min-h-screen w-full max-w-full flex-col p-2">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="flex flex-col gap-1">
            <div className="flex max-w-full items-center gap-1.5 overflow-hidden whitespace-nowrap text-[15px] font-bold leading-tight md:max-w-[calc(100vw-720px)] lg:text-[17px] xl:max-w-full">
              {LEAVE_VIEW_TABS.map((tab, index) => (
                <span key={tab.id} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-[#282828]">/</span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMainTab(tab.id);
                      setPage(1);
                      setEditingRows(new Set());
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("tab", tab.id);
                      router.replace(`?${params.toString()}`, { scroll: false });
                    }}
                    className={`cursor-pointer text-left transition-colors ${mainTab === tab.id
                      ? "text-[#43C17A]"
                      : "text-[#282828] hover:text-gray-500"
                      }`}
                  >
                    {tab.label}
                  </button>
                </span>
              ))}
            </div>
            <p className="text-[#525252] text-sm font-medium">
              {mainTab === "students"
                ? "Review, Approve, and Manage Student Leave Applications Effortlessly"
                : mainTab === "tagged"
                  ? "Review leave requests where you are tagged and join the group chat."
                  : "Submit leave applications and view approval updates from HR."}
            </p>
          </div>

          {mainTab === "my_leaves" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-[#16284F] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#102040] cursor-pointer"
            >
              Request Leave
            </button>
          )}
        </div>

        {isCountsLoading ? (
          <LeaveCardsShimmer />
        ) : (
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
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
        )}

        <div className="flex flex-col items-center justify-between gap-2 py-3 sm:flex-row">
          <div className="relative flex w-full max-w-full items-center sm:max-w-[300px]">
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

          <div 
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex items-center gap-2 bg-[#DAE9E1] px-4 py-1.5 rounded-md relative cursor-pointer group hover:bg-[#C2DECE] transition-colors"
          >
            <CalendarIcon size={18} className="text-[#43C17A] pointer-events-none" weight="fill" />
            <input
              ref={dateInputRef}
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full pointer-events-none"
            />
            <span className="text-[#43C17A] font-bold text-sm tracking-wide pointer-events-none">
              {filterDate ? new Date(filterDate).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}
            </span>
            {filterDate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterDate("");
                }}
                className="ml-2 cursor-pointer text-[#43C17A] hover:text-[#2d8f58] transition-colors z-10"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="-mt-2 w-full table-container-wrapper">
          <TableComponent
            columns={
              mainTab === "students"
                ? dynamicStudentColumns
                : mainTab === "tagged"
                  ? TAGGED_LEAVES_COLUMNS
                  : MY_LEAVES_COLUMNS
            }
            tableData={finalTableData}
            height="55vh"
            isLoading={isLoading}
          />
        </div>

        <div className="mt-2">
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            alwaysShow={true}
            roundedBottom="rounded-xl"
          />
        </div>

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
          isLoading={updateStatusMutation.isPending}
        />
      </div>
      <FacultyLeaveDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        leaveData={selectedLeaveData}
        currentFacultyId={facultyId!}
      />
      <EmployeeLeaveDetailsModal
        request={selectedEmployeeLeave}
        onClose={() => setSelectedEmployeeLeave(null)}
      />
    </>
  );
}

export default function FacultyLeavesLeft() {
  return (
    <Suspense fallback={<LeavePageShimmer />}>
      <FacultyLeavesContent />
    </Suspense>
  );
}
