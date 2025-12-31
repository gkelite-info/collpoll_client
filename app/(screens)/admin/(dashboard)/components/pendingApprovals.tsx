import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { CaretLeft, User, UsersThree } from "@phosphor-icons/react";
import React from "react";
import CardComponent from "./cards";
import { pendingRequests } from "../data";
import PendingApprovalsTable from "./pendingApprovalsTable";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

const cardData = [
  {
    id: "1",
    style: "bg-[#CEE6FF]",
    icon: <UsersThree size={23} weight="fill" color="#EFEFEF" />,
    iconBgColor: "#60AEFF",
    value: "15",
    label: "Total Requests",
  },
  {
    id: "2",
    style: "bg-[#E6FBEA]",
    icon: <User size={23} weight="fill" color="#EFEFEF" />,
    iconBgColor: "#43C17A",
    value: "08",
    label: "Approved",
  },
  {
    id: "3",
    style: "bg-[#FFEDDA] ",
    icon: <User size={23} weight="fill" color="#EFEFEF" />,
    iconBgColor: "#FFBB70",
    value: "02",
    label: "Pending",
  },
  {
    id: "4",
    style: "bg-[#FFE0E0]",
    icon: <User size={23} weight="fill" color="#EFEFEF" />,
    iconBgColor: "#FF2020",
    value: "05",
    label: "Rejected",
  },
];

interface PendingApprovalsProps {
  onBack: () => void;
}

const PendingApprovals: React.FC<PendingApprovalsProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col m-4 ">
      <div className="mb-6 flex justify-between items-center">
        <div className="w-50% flex-0.5">
          <div
            className="flex items-center gap-2 group w-fit cursor-pointer"
            onClick={onBack}
          >
            <CaretLeft
              size={20}
              weight="bold"
              className="text-[#2D3748] group-hover:-translate-x-1 transition-transform"
            />
            <h1 className="text-xl font-bold text-[#282828]">
              Pending Approvals
            </h1>
          </div>
          <p className="text-[#282828] mt-1 ml-7 text-sm opacity-70">
            Review and manage pending user registration requests
          </p>
        </div>
        <div className="w-38">
          <CourseScheduleCard isVisibile={false} fullWidth={true} />
        </div>
      </div>
      <div className="flex gap-4 w-full h-full mb-3">
        {cardData.map((item, index) => (
          <CardComponent
            key={index}
            style={`${item.style} w-[156px] h-[156px]`}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            value={item.value}
            label={item.label}
          />
        ))}
        <div>
          <WorkWeekCalendar style="h-full w-[350px]" />
        </div>
      </div>
      <PendingApprovalsTable requests={pendingRequests} />
    </div>
  );
};

export default PendingApprovals;
