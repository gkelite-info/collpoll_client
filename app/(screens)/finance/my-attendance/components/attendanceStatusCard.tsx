import { CheckSquare } from "@phosphor-icons/react";
import { AttendanceStats } from "../types";

interface Props {
  stats: AttendanceStats;
}

const AttendanceStatusCard: React.FC<Props> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl p-4 w-[30%] shadow-sm flex flex-col gap-4 border border-gray-100/50 text-[12.5px]">
      <div>
        <p className="text-[#282828] font-medium">Attendance Status (Today)</p>
        <div className="flex items-center gap-1.5 text-gray-700 text-[13px] mt-1">
          <CheckSquare size={16} weight="fill" className={stats.todayStatus === "Not Marked" ? "text-gray-400" : "text-[#43C17A]"} />
          <span>{stats.todayStatus}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[#282828] font-medium">Total Working Days</p>
          <p className="text-[#525252] font-semibold">{stats.totalWorkingDays}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[#282828] font-medium">Leaves Taken</p>
          <p className="text-[#525252] font-semibold">{stats.leavesTaken}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[#282828] font-medium">Remaining Leaves</p>
          <p className="text-[#525252] font-semibold">{stats.remainingLeaves}</p>
        </div>
        {stats.lopDays !== undefined && (
          <div className="flex items-center justify-between pt-1 border-t border-red-100">
            <p className="text-red-500 font-medium">LOP Days</p>
            <p className="text-red-500 font-semibold">{stats.lopDays}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceStatusCard;
