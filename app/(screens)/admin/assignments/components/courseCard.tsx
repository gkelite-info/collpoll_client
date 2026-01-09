"use client";

import React from "react";
import { useRouter } from "next/navigation";

export interface CourseCardData {
  id: number;
  subject: string;
  instructorName: string;
  instructorId: string;
  avatarUrl: string;
  activeAssignments: number;
  pendingSubmissions: number;
  issuesRaised: number;
}

const StatRow: React.FC<{ label: string; count: number }> = ({
  label,
  count,
}) => (
  <div className="flex justify-between items-center py-0.5">
    <span className="text-[#282828] text-sm">{label}</span>
    <span className="flex items-center justify-center w-6 h-6 bg-[#DFF4E8] text-[#59D991] rounded-full text-[11px] font-bold">
      {count}
    </span>
  </div>
);

const CourseCard: React.FC<CourseCardData> = ({
  id,
  subject,
  instructorName,
  instructorId,
  avatarUrl,
  activeAssignments,
  pendingSubmissions,
  issuesRaised,
}) => {
  const router = useRouter();

  const handleViewAssignments = () => {
    router.push(`/admin/assignments/${id}`);
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-[320px] p-4 flex flex-col">
      <div className="text-center mb-3">
        <h3 className="text-[#43C17A] font-bold text-lg tracking-tight uppercase">
          {subject}
        </h3>
        <div className="h-[0.8px] rounded-full bg-[#ACABAB] mx-2 mt-2" />
      </div>

      <div className="flex items-center mb-3 px-1">
        <div className="w-12 h-12 mr-3 flex-shrink-0">
          <img
            src={avatarUrl}
            alt={instructorName}
            className="w-full h-full rounded-full object-cover shadow-sm"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-[#282828] font-bold text-base leading-tight">
            {instructorName}
          </p>
          <p className="text-[#525252] text-xs font-medium">
            ID - {instructorId}
          </p>
        </div>
      </div>

      <div className="space-y-1 mb-4 px-1">
        <StatRow label="Active Assignments" count={activeAssignments} />
        <StatRow label="Pending Submissions" count={pendingSubmissions} />
        <StatRow label="Issues Raised" count={issuesRaised} />
      </div>

      <button
        // onClick={handleViewAssignments}
        className=" w-full bg-[#16284F] hover:bg-[#1b3878] text-white py-1.5 rounded-full transition-colors duration-200 text-md cursor-pointer"
      >
        View Assignments
      </button>
    </div>
  );
};

export default CourseCard;
