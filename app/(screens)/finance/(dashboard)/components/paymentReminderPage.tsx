"use client";

import FeeStats from "../[studentId]/components/feeStats";
import {
  Alarm,
  CaretLeft,
  MagnifyingGlass,
  UsersThree,
  CaretDown,
  ClockCounterClockwise,
  ListChecks,
  CircleNotch,
} from "@phosphor-icons/react";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import TableComponent from "@/app/utils/table/table";
import { ScheduleReminderModal } from "../modals/ScheduleReminderModal";
import { SendFeeReminderModal } from "../modals/sendFeeReminderModal";
import ReminderHistory from "./ReminderHistory";
import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchPaymentReminderStats,
  fetchReminderFilterOptions,
  fetchStudentsWithDues,
} from "@/lib/helpers/finance/dashboard/reminders/financeReminders";

const FilterShimmer = () => (
  <div className="flex items-center gap-4 mb-6 animate-pulse w-full">
    <div className="w-[320px] h-[44px] bg-gray-200 rounded-full flex-shrink-0"></div>
    <div className="flex items-center gap-4 overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col gap-1.5 mt-1">
          <div className="w-20 h-3 bg-gray-200 rounded"></div>
          <div className="w-[100px] h-[28px] bg-gray-200 rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
);

const StatCardShimmer = () => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between min-w-[220px] flex-1 animate-pulse h-[104px]">
    <div className="flex flex-col gap-2.5">
      <div className="h-3.5 bg-gray-200 rounded w-32"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
  </div>
);

export const TableShimmer = () => (
  <div className="w-full border border-gray-200 rounded-lg overflow-hidden animate-pulse bg-white">
    <div className="bg-gray-100 h-12 w-full border-b border-gray-200"></div>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="flex h-[60px] items-center px-6 border-b border-gray-100 gap-6"
      >
        <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/12"></div>
      </div>
    ))}
  </div>
);

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

const FilterDropdown = ({ label, value, options, onChange }: Props) => (
  <div className="flex flex-col gap-1 flex-shrink-0">
    <span className="text-[13px] font-semibold text-gray-500">{label}</span>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#E8F7EE] text-[#22C55E] border border-[#C7EED8] rounded-full pl-3 pr-8 py-[4px] text-sm font-medium outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#22C55E]"
      />
    </div>
  </div>
);

const PaymentReminder = () => {
  const router = useRouter();
  const { collegeId } = useUser();
  const activeCollegeId = collegeId || 1;

  // --- UI States ---
  const [activeTab, setActiveTab] = useState<"dues" | "history">("dues");
  const [modalState, setModalState] = useState<
    "none" | "student" | "faculty" | "schedule"
  >("none");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState({
    educationType: "All",
    branch: "All",
    year: "All",
    sem: "All",
    duePeriod: "All",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    educationTypes: ["All"],
    branches: ["All"],
    sems: ["All"],
  });
  const [availableYears, setAvailableYears] = useState<string[]>(["All"]);

  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalDues: 0,
    remindersSent: 0,
    scheduled: 0,
    overdue30: 0,
  });

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsStatsLoading(true);
      const options = await fetchReminderFilterOptions(activeCollegeId);
      setDropdownOptions(options);

      const statsData = await fetchPaymentReminderStats(activeCollegeId);
      setDashboardStats(statsData);
      setIsStatsLoading(false);
    };
    initializeDashboard();
  }, [activeCollegeId]);

  useEffect(() => {
    const loadFilteredStudents = async () => {
      const payload = { ...filters, searchTerm: debouncedSearch };

      const result = await fetchStudentsWithDues(activeCollegeId, payload);
      setStudentsData(result.data);
      setAvailableYears(result.availableYears);
      setSelectedRows([]);
      setIsTableLoading(false);
    };

    loadFilteredStudents();
  }, [filters, debouncedSearch, activeCollegeId]);

  const handleFilterChange = (key: string, value: string) => {
    setIsTableLoading(true);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTableLoading(true);
    setSearchTerm(e.target.value);
  };

  const stats = [
    {
      label: "Total students with dues",
      value: dashboardStats.totalDues.toString(),
      bg: "bg-[#E2DAFF]",
      iconColor: "text-[#6C20CA]",
      icon: UsersThree,
    },
    {
      label: "Reminders Sent (This Month)",
      value: dashboardStats.remindersSent.toString(),
      bg: "bg-[#E6FBEA]",
      iconColor: "text-[#43C17A]",
      icon: UsersThree,
    },
    {
      label: "Scheduled Reminders",
      value: dashboardStats.scheduled.toString(),
      bg: "bg-[#FFEDDA]",
      iconColor: "text-[#FFBB70]",
      icon: Alarm,
    },
    {
      label: "Overdue >30 Days",
      value: dashboardStats.overdue30.toString(),
      bg: "bg-[#CEE6FF]",
      iconColor: "text-[#60AEFF]",
      icon: Calendar,
    },
  ];

  const handleSelectAll = () => {
    if (selectedRows.length === studentsData.length) setSelectedRows([]);
    else setSelectedRows(studentsData.map((_, i) => i));
  };

  const handleRowSelect = (index: number) => {
    if (selectedRows.includes(index))
      setSelectedRows(selectedRows.filter((i) => i !== index));
    else setSelectedRows([...selectedRows, index]);
  };

  const tableColumns = [
    { title: "", key: "checkbox" },
    { title: "Student Name", key: "name" },
    { title: "Register No.", key: "regNo" },
    { title: "Branch", key: "branch" },
    { title: "Year", key: "year" },
    { title: "Semester", key: "semester" },
    { title: "Fee Due", key: "feeDue" },
    { title: "Days Overdue", key: "daysOverdue" },
    { title: "Status", key: "status" },
    { title: "Action", key: "action" },
  ];

  const tableData = studentsData.map((student, index) => ({
    checkbox: (
      <input
        type="checkbox"
        checked={selectedRows.includes(index)}
        onChange={() => handleRowSelect(index)}
        className="w-4 h-4 cursor-pointer"
      />
    ),
    name: student.name,
    regNo: student.studentId,
    branch: student.branch,
    year: student.year,
    semester: student.semester,
    feeDue: (
      <span className="font-semibold text-gray-800">
        {student.formattedFeeDue}
      </span>
    ),
    daysOverdue:
      student.daysOverdue > 0 ? (
        <span className="text-red-500 font-medium">
          {student.daysOverdue} days
        </span>
      ) : (
        "0 days"
      ),
    // Beautiful dynamic status badges
    status: (
      <span
        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
          student.status === "Sent"
            ? "bg-[#E6FBEA] text-[#43C17A]"
            : student.status === "Scheduled"
              ? "bg-[#FFEDDA] text-[#FFBB70]"
              : student.status === "Failed"
                ? "bg-[#FFE5E5] text-[#FF4D4D]"
                : "bg-gray-100 text-gray-500"
        }`}
      >
        {student.status}
      </span>
    ),
    action: (
      <span
        className="text-[#22A55D] cursor-pointer font-medium hover:underline"
        onClick={() => {
          setSelectedRows([index]);
          setModalState("student");
        }}
      >
        View
      </span>
    ),
  }));

  const selectedStudentIds = selectedRows.map(
    (index) => studentsData[index].studentId,
  );

  return (
    <div className="text-black p-4">
      <div className="flex items-center gap-1 mb-4">
        <CaretLeft
          onClick={() => router.push("/finance")}
          size={23}
          className="cursor-pointer"
        />
        <p className="font-medium text-[#282828] text-lg">Payment Reminder</p>
      </div>

      {activeTab === "dues" &&
        (isStatsLoading ? (
          <FilterShimmer />
        ) : (
          <div className="flex items-end gap-4 mb-6">
            <div className="relative flex-shrink-0">
              <input
                placeholder="Search by Student Name / Roll No."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-[320px] h-[44px] bg-[#e8e8e8] rounded-full px-5 pr-12 text-sm outline-none border border-transparent focus:border-[#22C55E]"
              />
              <MagnifyingGlass
                size={18}
                weight="bold"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#22C55E]"
              />
            </div>
            <div className="overflow-x-auto scrollbar-hide pb-1">
              <div className="flex items-center gap-4 flex-nowrap min-w-max pr-2">
                <FilterDropdown
                  label="Education"
                  value={filters.educationType}
                  options={dropdownOptions.educationTypes}
                  onChange={(v) => handleFilterChange("educationType", v)}
                />
                <FilterDropdown
                  label="Branch"
                  value={filters.branch}
                  options={dropdownOptions.branches}
                  onChange={(v) => handleFilterChange("branch", v)}
                />
                <FilterDropdown
                  label="Year"
                  value={filters.year}
                  options={availableYears}
                  onChange={(v) => handleFilterChange("year", v)}
                />
                <FilterDropdown
                  label="Semester"
                  value={filters.sem}
                  options={dropdownOptions.sems}
                  onChange={(v) => handleFilterChange("sem", v)}
                />
                <FilterDropdown
                  label="Due Period"
                  value={filters.duePeriod}
                  options={["All", "Today", "This Week", "This Month"]}
                  onChange={(v) => handleFilterChange("duePeriod", v)}
                />
              </div>
            </div>
          </div>
        ))}

      {/* STATS CARDS OR SHIMMER */}
      {isStatsLoading ? (
        <div className="flex gap-4 mb-6 w-full overflow-hidden">
          <StatCardShimmer />
          <StatCardShimmer />
          <StatCardShimmer />
          <StatCardShimmer />
        </div>
      ) : (
        <FeeStats stats={stats} />
      )}

      <div className="flex items-center justify-between w-full mt-8 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("dues")}
            className={`flex items-center gap-2 pb-3 -mb-[13px] border-b-2 transition-colors cursor-pointer text-[17px] font-semibold ${
              activeTab === "dues"
                ? "border-[#43C17A] text-[#282828]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <ListChecks
              size={22}
              weight={activeTab === "dues" ? "fill" : "regular"}
            />{" "}
            Active Dues
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 pb-3 -mb-[13px] border-b-2 transition-colors cursor-pointer text-[17px] font-semibold ${
              activeTab === "history"
                ? "border-[#43C17A] text-[#282828]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <ClockCounterClockwise
              size={22}
              weight={activeTab === "history" ? "fill" : "regular"}
            />{" "}
            History & Scheduled
          </button>
        </div>

        {activeTab === "dues" && !isTableLoading && studentsData.length > 0 && (
          <div className="flex items-center gap-8 animate-fade-in">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="bg-[#5BB98C] hover:bg-[#4da57a] text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {selectedRows.length === studentsData.length &&
                studentsData.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <button
                disabled={selectedRows.length === 0}
                className="bg-[#1E2F57] cursor-pointer hover:bg-[#162447] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-1.5 rounded-lg transition-colors"
                onClick={() => setModalState("student")}
              >
                Send Reminder
              </button>
            </div>
            <div className="flex items-center gap-4 border-l border-gray-300 pl-8">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold text-[#282828]">
                  Faculty
                </span>
                <img
                  src="/faculty.png"
                  alt="Faculty Avatar"
                  className="w-7 h-7 rounded-full object-cover shadow-sm"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <button
                  disabled={selectedRows.length === 0}
                  className="bg-[#1E2F57] ml-2 cursor-pointer hover:bg-[#162447] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-1.5 rounded-lg transition-colors"
                  onClick={() => setModalState("faculty")}
                >
                  Notify Faculty
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeTab === "dues" ? (
        <div className="mt-4 overflow-x-auto min-h-[300px]">
          {isTableLoading ? (
            <TableShimmer />
          ) : studentsData.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ListChecks
                  size={32}
                  className="text-gray-300"
                  weight="duotone"
                />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">
                All clear!
              </h3>
              <p className="text-gray-500 font-medium">
                No pending dues found for the selected filters.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <TableComponent columns={tableColumns} tableData={tableData} />
            </div>
          )}
        </div>
      ) : (
        <ReminderHistory collegeId={activeCollegeId} />
      )}

      {/* Modals */}
      <SendFeeReminderModal
        isOpen={modalState === "student" || modalState === "faculty"}
        variant={modalState === "faculty" ? "faculty" : "student"}
        collegeId={activeCollegeId}
        selectedStudentIds={selectedStudentIds}
        onClose={() => setModalState("none")}
        onScheduleClick={() => setModalState("schedule")}
      />

      <ScheduleReminderModal
        isOpen={modalState === "schedule"}
        variant={modalState === "faculty" ? "faculty" : "student"}
        collegeId={activeCollegeId}
        selectedStudentIds={selectedStudentIds}
        onClose={() => setModalState("none")}
      />
    </div>
  );
};

export default PaymentReminder;
