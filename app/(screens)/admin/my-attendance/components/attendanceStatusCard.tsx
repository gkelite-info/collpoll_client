import { FC } from "react";
import { CheckSquare } from "@phosphor-icons/react";
import { AttendanceStats } from "../types";

interface Props {
  stats: AttendanceStats;
}

export const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-[#22C55E] text-white",
  ABSENT: "bg-[#EF4444] text-white",
  LEAVE: "bg-[#60AEFF] text-white",
  LATE: "bg-[#FFBE61] text-white",
};

export const STATUS_COLORS: Record<string, string> = {
  PRESENT: "text-[#22C55E]",
  ABSENT: "text-[#EF4444]",
  LEAVE: "text-[#60AEFF]",
  LATE: "text-[#FFBE61]",
};

const AttendanceStatusCard: FC<Props> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl overflow-auto p-4 w-[30%] shadow-sm flex flex-col justify-between border border-gray-100/50 text-[12.5px]">
      <div>
        <p className="text-[#282828] font-medium">Attendance Status (Today)</p>
        <div className="flex items-center gap-1.5 text-gray-700 text-[13px] mb-2">
          <CheckSquare
            size={16}
            weight="fill"
            className={
              STATUS_COLORS[
              stats.todayStatus?.toUpperCase?.() || "Not marked"
              ] || "text-gray-400"
            }
          />
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
