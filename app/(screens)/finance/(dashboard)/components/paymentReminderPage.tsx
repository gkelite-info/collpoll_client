"use client";

import FeeStats from "../[studentId]/components/feeStats";
import {
  Alarm,
  CaretLeft,
  MagnifyingGlass,
  UsersThree,
  CaretDown,
} from "@phosphor-icons/react";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TableComponent from "@/app/utils/table/table";

import ScheduleReminderModal from "../modals/ScheduleReminderModal";
import { SendFeeReminderModal } from "../modals/sendFeeReminderModal";

const stats = [
  {
    label: "Total students with dues",
    value: "420",
    bg: "bg-[#E2DAFF]",
    iconColor: "text-[#6C20CA]",
    icon: UsersThree,
  },
  {
    label: "Reminders Sent (This Month)",
    value: "1200",
    bg: "bg-[#E6FBEA]",
    iconColor: "text-[#43C17A]",
    icon: UsersThree,
  },
  {
    label: " Scheduled Reminders",
    value: "35",
    bg: "bg-[#FFEDDA]",
    iconColor: "text-[#FFBB70]",
    icon: Alarm,
  },
  {
    label: "Overdue >30 Days",
    value: "50",
    bg: "bg-[#CEE6FF]",
    iconColor: "text-[#60AEFF]",
    icon: Calendar,
  },
];

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

const FilterDropdown = ({ label, value, options, onChange }: Props) => {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="text-sm font-medium text-[#282828]">{label}</span>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            appearance-none
            bg-[#E8F7EE]
            text-[#22C55E]
            border border-[#C7EED8]
            rounded-full
            pl-3 pr-8 py-[4px]
            text-sm font-medium
            outline-none
            cursor-pointer
          "
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
          className="
            pointer-events-none
            absolute right-2 top-1/2 -translate-y-1/2
            text-[#22C55E]
          "
        />
      </div>
    </div>
  );
};

const FilterBar = () => {
  const [filters, setFilters] = useState({
    educationType: "B-Tech",
    branch: "CSE",
    year: "1st",
    sem: "3",
    duePeriod: "All",
  });

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-shrink-0">
        <input
          placeholder="Search by Student Name / Roll No."
          className="
            w-[320px]
            h-[44px]
            bg-[#e8e8e8]
            rounded-full
            px-5 pr-12
            text-sm
            outline-none
            border border-transparent
            focus:border-[#22C55E]
          "
        />

        <MagnifyingGlass
          size={18}
          weight="bold"
          className="
            absolute right-4 top-1/2 -translate-y-1/2
            text-[#22C55E]
          "
        />
      </div>

      <div className="overflow-x-auto">
        <div className="flex items-center gap-4 flex-nowrap min-w-max pr-2">
          <FilterDropdown
            label="Educational Type"
            value={filters.educationType}
            options={["B-Tech", "M-Tech", "BCA", "MCA"]}
            onChange={(v) => setFilters({ ...filters, educationType: v })}
          />

          <FilterDropdown
            label="Branch"
            value={filters.branch}
            options={["CSE", "ECE", "ME", "CE"]}
            onChange={(v) => setFilters({ ...filters, branch: v })}
          />

          <FilterDropdown
            label="Year"
            value={filters.year}
            options={["1st", "2nd", "3rd", "4th"]}
            onChange={(v) => setFilters({ ...filters, year: v })}
          />

          <FilterDropdown
            label="Sem"
            value={filters.sem}
            options={["1", "2", "3", "4", "5", "6", "7", "8"]}
            onChange={(v) => setFilters({ ...filters, sem: v })}
          />

          <FilterDropdown
            label="Due Period"
            value={filters.duePeriod}
            options={["All", "Today", "This Week", "This Month"]}
            onChange={(v) => setFilters({ ...filters, duePeriod: v })}
          />
        </div>
      </div>
    </div>
  );
};

const PaymentReminder = () => {
  const router = useRouter();

  // State to track which modal is currently active
  const [modalState, setModalState] = useState<
    "none" | "student" | "faculty" | "schedule"
  >("none");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const students = [
    {
      name: "Priya Sharma",
      regNo: "22CSE101",
      branch: "CSE",
      year: "3rd yr",
      semester: "3rd",
      feeDue: "₹10,000",
      daysOverdue: "15",
      status: "Not Sent",
    },
    {
      name: "Rahul Mehta",
      regNo: "22CSE101",
      branch: "CSE",
      year: "3rd yr",
      semester: "3rd",
      feeDue: "₹10,000",
      daysOverdue: "15",
      status: "Scheduled",
    },
    {
      name: "Neha Patel",
      regNo: "22CSE101",
      branch: "CSE",
      year: "3rd yr",
      semester: "3rd",
      feeDue: "₹10,000",
      daysOverdue: "15",
      status: "Sent",
    },
    {
      name: "Priya Sharma",
      regNo: "22CSE101",
      branch: "CSE",
      year: "3rd yr",
      semester: "3rd",
      feeDue: "₹10,000",
      daysOverdue: "15",
      status: "Not Sent",
    },
    {
      name: "Rahul Mehta",
      regNo: "22CSE101",
      branch: "CSE",
      year: "3rd yr",
      semester: "3rd",
      feeDue: "₹10,000",
      daysOverdue: "15",
      status: "Scheduled",
    },
    {
      name: "Neha Patel",
      regNo: "22CSE101",
      branch: "CSE",
      year: "3rd yr",
      semester: "3rd",
      feeDue: "₹10,000",
      daysOverdue: "15",
      status: "Sent",
    },
  ];

  const handleSelectAll = () => {
    if (selectedRows.length === students.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(students.map((_, i) => i));
    }
  };

  const handleRowSelect = (index: number) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
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

  const tableData = students.map((student, index) => ({
    checkbox: (
      <input
        type="checkbox"
        checked={selectedRows.includes(index)}
        onChange={() => handleRowSelect(index)}
        className="w-4 h-4 cursor-pointer"
      />
    ),
    name: student.name,
    regNo: student.regNo,
    branch: student.branch,
    year: student.year,
    semester: student.semester,
    feeDue: student.feeDue,
    daysOverdue: student.daysOverdue,
    status: student.status,
    action: (
      <span
        className="text-[#22A55D] cursor-pointer hover:underline"
        onClick={() => setModalState("student")}
      >
        View
      </span>
    ),
  }));

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

      <FilterBar />
      <FeeStats stats={stats} />

      {/* recipients header */}
      <div className="flex items-center justify-between w-full mt-6">
        <div className="flex items-center gap-4">
          <span className="text-[18px] font-semibold text-[#282828]">
            Recipients
          </span>

          <button
            onClick={handleSelectAll}
            className="
              bg-[#5BB98C]
              hover:bg-[#4da57a]
              text-white
              text-sm
              font-medium
              px-4
              py-1.5
              rounded-lg
              transition-colors
            "
          >
            Select All
          </button>

          {/* Student Send Reminder */}
          <button
            className="
              bg-[#1E2F57] cursor-pointer
              hover:bg-[#162447]
              text-white
              text-sm
              font-medium
              px-5
              py-1.5
              rounded-lg
            "
            onClick={() => setModalState("student")}
          >
            Send Reminder
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-semibold text-[#282828]">
              Faculty
            </span>

            <img
              src="/faculty.png"
              alt="Faculty Avatar"
              className="w-7 h-7 rounded-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />

            <span className="text-[15px] font-medium text-[#5F6368]">
              Anil Josh
            </span>

            {/* Faculty Send Reminder */}
            <button
              className="
              bg-[#1E2F57] cursor-pointer
              hover:bg-[#162447]
              text-white
              text-sm
              font-medium
              px-5
              py-1.5
              rounded-lg
            "
              onClick={() => setModalState("faculty")}
            >
              Send Reminder
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <TableComponent columns={tableColumns} tableData={tableData} />
      </div>

      {/* Dynamic Reminder Modal (Student or Faculty Variant) */}
      <SendFeeReminderModal
        isOpen={modalState === "student" || modalState === "faculty"}
        variant={modalState === "faculty" ? "faculty" : "student"}
        onClose={() => setModalState("none")}
        onScheduleClick={() => setModalState("schedule")}
      />

      {/* Schedule Reminder Modal */}
      <ScheduleReminderModal
        isOpen={modalState === "schedule"}
        onClose={() => setModalState("none")}
      />
    </div>
  );
};

export default PaymentReminder;
