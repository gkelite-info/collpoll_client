"use client";

import React, { useState } from "react";
import { CaretLeft } from "@phosphor-icons/react";
import FacultyView from "./facultyView";
import ActiveAutomationsTable from "./tables/activeAutomationsTable";

const sampleRequests = [
  {
    id: "1",
    name: "Fee Reminder Bot",
    type: "Data Sync",
    trigger: "Every 6 hrs",
    status: "Running",
    lastRun: "25 Nov, 10:00 AM",
    nextRun: "25 Nov, 4:00 PM",
  },
  {
    id: "2",
    name: "Attendance Notifier",
    type: "Notification",
    trigger: "Daily 7 AM",
    status: "Running",
    lastRun: "25 Nov, 7:00 AM",
    nextRun: "26 Nov, 7:00 AM",
  },
  {
    id: "3",
    name: "Backup Scheduler",
    type: "Backup",
    trigger: "Every Sunday",
    status: "Paused",
    lastRun: "25 Nov, 10:00 AM",
    nextRun: "1 Dec, 12:00 AM",
  },
  {
    id: "4",
    name: "Fee Reminder Bot",
    type: "Notification",
    trigger: "Monthly",
    status: "Running",
    lastRun: "25 Nov, 7:00 AM",
    nextRun: "1 Dec, 12:00 AM",
  },
  {
    id: "5",
    name: "Student Sync Job",
    type: "Data Sync",
    trigger: "Every 12 hrs",
    status: "Running",
    lastRun: "25 Nov, 10:00 AM",
    nextRun: "25 Nov, 4:00 PM",
  },
  {
    id: "6",
    name: "Attendance Notifier",
    type: "Notification",
    trigger: "Every 6 hrs",
    status: "Running",
    lastRun: "25 Nov, 7:00 AM",
    nextRun: "26 Nov, 7:00 AM",
  },
  {
    id: "7",
    name: "Leave Approval Flow",
    type: "Workflow",
    trigger: "Daily 7 AM",
    status: "Running",
    lastRun: "25 Nov, 7:00 AM",
    nextRun: "1 Dec, 12:00 AM",
  },
  {
    id: "8",
    name: "Fee Reminder Bot",
    type: "Data Sync",
    trigger: "Every Sunday",
    status: "Running",
    lastRun: "25 Nov, 10:00 AM",
    nextRun: "25 Nov, 4:00 PM",
  },
  {
    id: "9",
    name: "Notification Dispatcher",
    type: "Notification",
    trigger: "Monthly",
    status: "Running",
    lastRun: "25 Nov, 7:00 AM",
    nextRun: "26 Nov, 7:00 AM",
  },
  {
    id: "10",
    name: "Exam Result Archiver",
    type: "Backup",
    trigger: "Every 12 hrs",
    status: "Running",
    lastRun: "1 Nov, 12:00 AM",
    nextRun: "26 Nov, 7:00 AM",
  },
];

interface TotalAutomationsProps {
  onBack: () => void;
}

const ActiveAutomations: React.FC<TotalAutomationsProps> = ({ onBack }) => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const handleRowClick = (id: string) => {
    console.log("Automation ID:", id);
  };

  if (selectedDept) {
    return (
      <FacultyView
        departmentId={2} // Placeholder ID for now
        departmentName={selectedDept}
        onBack={() => setSelectedDept(null)}
      />
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="mb-5">
        <div className="flex items-center gap-2 group w-fit">
          <CaretLeft
            onClick={onBack}
            size={24}
            weight="bold"
            className="text-[#2D3748] cursor-pointer group-hover:-translate-x-1 transition-transform"
          />
          <h1 className="text-2xl font-medium text-[#282828]">
            Active Automations
          </h1>
        </div>
        <p className="text-[#282828] mt-2 ml-8 text-sm">
          Monitor and manage your system’s background tasks.
        </p>
      </div>

      <article className="">
        <ActiveAutomationsTable
          data={sampleRequests}
          onRowClick={handleRowClick}
        />
      </article>
    </div>
  );
};

export default ActiveAutomations;
