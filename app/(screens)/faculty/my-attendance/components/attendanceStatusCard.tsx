import React from "react";
import { CheckSquare } from "@phosphor-icons/react";
import { AttendanceStats } from "../types";

interface Props {
  stats: AttendanceStats;
}

const AttendanceStatusCard: React.FC<Props> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl p-4 w-[30%] shadow-sm flex flex-col justify-between border border-gray-100/50 text-[12.5px]">
      <div>
        <p className="text-[#282828] font-medium">Attendance Status (Today)</p>
        <div className="flex items-center gap-1.5 text-gray-700 text-[13px] mb-2">
          <CheckSquare size={16} weight="fill" className="text-[#43C17A]" />
          <span>{stats.todayStatus}</span>
        </div>
      </div>

      <div>
        <p className="text-[#282828] font-medium mb-0.5">Total Working Days</p>
        <p className="text-[#525252]">{stats.totalWorkingDays}</p>
      </div>

      <div>
        <p className="text-[#282828] font-medium mb-0.5">Leaves Taken</p>
        <p className="text-[#525252]">{stats.leavesTaken}</p>
      </div>

      <div>
        <p className="text-[#282828] font-medium mb-0.5">Remaining Leaves</p>
        <p className="text-[#525252]">{stats.remainingLeaves}</p>
      </div>
    </div>
  );
};

export default AttendanceStatusCard;
