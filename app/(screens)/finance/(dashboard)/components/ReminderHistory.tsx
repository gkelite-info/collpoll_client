"use client";

import React, { useEffect, useState } from "react";
import TableComponent from "@/app/utils/table/table";
import { ClockCounterClockwise } from "@phosphor-icons/react";
import { fetchReminderJobsHistory } from "@/lib/helpers/finance/dashboard/reminders/financeReminders";
import { TableShimmer } from "./paymentReminderPage";

export default function ReminderHistory({ collegeId }: { collegeId: number }) {
  const [historyData, setHistoryData] = useState<any[]>([]);
  // Initialize loading to true
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      const data = await fetchReminderJobsHistory(collegeId);
      setHistoryData(data);
      setIsLoading(false);
    };

    if (collegeId) {
      loadHistory();
    }
  }, [collegeId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E6FBEA] text-[#43C17A]">
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFEDDA] text-[#FFBB70]">
            Scheduled
          </span>
        );
      case "failed":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFE5E5] text-[#FF4D4D]">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  const tableColumns = [
    { title: "Job ID", key: "jobId" },
    { title: "Target Variant", key: "variant" },
    { title: "Recipients", key: "targets" },
    { title: "Channels", key: "channels" },
    { title: "Student Count", key: "studentCount" },
    { title: "Scheduled For", key: "runAt" },
    { title: "Status", key: "status" },
  ];

  const tableData = historyData.map((job) => {
    const dateObj = new Date(job.runAt);
    const formattedDate = dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      jobId: <span className="text-gray-500 font-medium">#{job.jobId}</span>,
      variant: (
        <span className="capitalize font-semibold text-[#282828]">
          {job.variant}
        </span>
      ),
      targets: <span className="text-gray-600">{job.targets}</span>,
      channels: <span className="text-gray-600">{job.channels}</span>,
      studentCount: (
        <span className="font-bold text-[#43C17A] bg-[#E6FBEA] px-2 py-0.5 rounded">
          {job.studentCount}
        </span>
      ),
      runAt: (
        <div className="flex flex-col">
          <span className="text-[#282828] font-medium">{formattedDate}</span>
          <span className="text-gray-500 text-xs">{formattedTime}</span>
        </div>
      ),
      status: getStatusBadge(job.status),
    };
  });

  if (isLoading) {
    return (
      <div className="mt-4">
        <TableShimmer />
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center animate-fade-in mt-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <ClockCounterClockwise
            size={32}
            className="text-gray-300"
            weight="duotone"
          />
        </div>
        <h3 className="text-gray-900 font-bold text-lg mb-1">
          No history found
        </h3>
        <p className="text-gray-500 font-medium">
          You haven't sent or scheduled any reminders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto animate-fade-in">
      <TableComponent columns={tableColumns} tableData={tableData} />
    </div>
  );
}
