"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { Loader } from "../calendar/right/timetable";
import {
  Users,
  User,
  MagnifyingGlass,
  CalendarIcon,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import RequestLeaveModal from "./modal/RequestLeaveModal";
import toast from "react-hot-toast";

import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchStudentLeaves,
  submitLeaveRequest,
} from "@/lib/helpers/student/leave request/studentLeaveAPI";

const COLUMNS = [
  { title: "S.No", key: "sNo" },
  { title: "From - To", key: "dateRange" },
  { title: "Days", key: "days" },
  { title: "Leave Type", key: "leaveType" },
  { title: "Description", key: "description" },
];

function LeaveLeftContent() {
  const { userId } = useUser();
  const [studentId, setStudentId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<
    "all" | "approved" | "pending" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dbLeaves, setDbLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const loadLeaves = async () => {
    if (!studentId) return;
    setIsLoading(true);
    try {
      const data = await fetchStudentLeaves(studentId);
      setDbLeaves(data);
    } catch (err) {
      toast.error("Failed to load leave history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [studentId]);

  const handleLeaveSubmit = async (formData: any) => {
    if (!studentId) return;
    try {
      await submitLeaveRequest(studentId, formData);
      toast.success("Leave request submitted successfully!");
      setIsModalOpen(false);
      loadLeaves();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit request. Please try again.");
    }
  };

  const counts = useMemo(() => {
    return {
      all: dbLeaves.length,
      approved: dbLeaves.filter((l) => l.status === "approved").length,
      pending: dbLeaves.filter((l) => l.status === "pending").length,
      rejected: dbLeaves.filter((l) => l.status === "rejected").length,
    };
  }, [dbLeaves]);

  const filteredData = useMemo(() => {
    let data = dbLeaves;
    if (activeTab !== "all") {
      data = data.filter((item) => item.status === activeTab);
    }
    if (searchQuery.trim()) {
      data = data.filter(
        (item) =>
          item.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return data.map((item, index) => ({
      sNo: String(index + 1).padStart(2, "0"),
      dateRange: `${item.fromDate} - ${item.toDate}`,
      days: item.days,
      leaveType: item.leaveType,
      description: (
        <span
          className="truncate max-w-[200px] inline-block"
          title={item.description}
        >
          {item.description}
        </span>
      ),
    }));
  }, [dbLeaves, activeTab, searchQuery]);

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
    <div className="flex flex-col p-6 w-full max-w-[68%] mx-auto min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#282828] font-bold text-2xl">Leave Requests</h1>
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
              style={`w-full transition-all duration-300 ${isActive ? card.activeColor : card.inactiveColor}`}
              icon={card.icon}
              value={card.value}
              label={card.label}
              iconBgColor={isActive ? card.iconBgActive : card.iconBgInactive}
              iconColor="#FFFFFF"
              textSize={isActive ? "text-white" : "text-[#282828]"}
              onClick={() => setActiveTab(card.id as any)}
            />
          );
        })}
      </div>

      <div className="flex justify-between items-center  rounded-xl px-4 py-3 ">
        <div className="relative w-full max-w-[300px] flex items-center  ">
          <MagnifyingGlass
            size={20}
            className="absolute left-3 text-[#43C17A] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-[#282828] outline-none focus:border-[#43C17A] placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 bg-[#DAE9E1] px-4 py-1.5 rounded-md  ">
          <CalendarIcon size={18} className="text-[#43C17A]" weight="fill" />
          <span className="text-[#43C17A] font-bold text-sm tracking-wide cursor-pointer">
            {new Date().toLocaleDateString("en-GB")}
          </span>
        </div>
      </div>

      <div className="-mt-2">
        <TableComponent
          columns={COLUMNS}
          tableData={filteredData}
          height="60vh"
          isLoading={isLoading}
        />
      </div>

      <RequestLeaveModal
        isOpen={isModalOpen}
        studentId={studentId}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLeaveSubmit}
      />
    </div>
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
