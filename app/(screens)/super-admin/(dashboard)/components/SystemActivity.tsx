import React from "react";

export interface ActivityItem {
  title: string;
  desc: string;
  time: string;
  [key: string]: any;
}

interface SystemActivityProps {
  activities?: ActivityItem[];
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    title: "Mallareddy Engg College",
    desc: "12 new students registered",
    time: "2 mins ago",
  },
  {
    title: "VNR Vignana Jyothi College",
    desc: "3 new faculty members joined",
    time: "2 mins ago",
  },
  {
    title: "Gokaraju Rangaraju Institute",
    desc: "8 users activated",
    time: "2 mins ago",
  },
  {
    title: "KMIT College",
    desc: "3 user accounts deactivated",
    time: "2 mins ago",
  },
  {
    title: "KMIT College",
    desc: "3 user accounts deactivated",
    time: "2 mins ago",
  },
];

const SystemActivity: React.FC<SystemActivityProps> = ({
  activities = DEFAULT_ACTIVITIES,
}) => {
  return (
    <div className="bg-[#fffdfd] rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[18px] font-bold text-[#2d2d2d]">
          System Activity Feed
        </h2>
        <button className="text-[12px] text-[#3aa460] font-bold hover:text-[#2d844d] transition-colors">
          View
        </button>
      </div>

      <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
        {activities.map((activity, idx) => (
          <div
            key={idx}
            className="flex flex-col group cursor-default border-l-2 border-transparent hover:border-[#3aa460] pl-2 transition-all"
          >
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-[13px] font-bold text-[#1f2937] truncate">
                {activity.title}
              </span>
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-tighter whitespace-nowrap">
                {activity.time}
              </span>
            </div>
            <span className="text-[12px] text-[#6b7280] leading-tight mt-0.5">
              {activity.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemActivity;
