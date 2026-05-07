import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { CaretLeft, User, UsersThree } from "@phosphor-icons/react";
import React, { useState } from "react";
import CardComponent from "./cards";
import { pendingRequests } from "../data";
import PendingApprovalsTable, {
  RequestData,
} from "./tables/pendingApprovalsTable";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import RequestDetail from "./requestDetails";
import WipOverlay from "@/app/utils/WipOverlay";

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
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(
    null
  );

  if (selectedRequest) {
    return (
      <RequestDetail
        selectedRequest={selectedRequest}
        onBack={() => setSelectedRequest(null)}
      />
    );
  }

  return (
    <div className="bg-red-00 overflow-hidden flex flex-col ml-1.5 md:ml-2 lg:ml-3 lg:mt-2 w-[92.5vw] landscape:w-[95.5vw] md:w-[98%] landscape:md:w-[98%] lg:w-full min-h-screen pb-7 landscape:pb-7 md:pb-0 lg:pb-0">
      <div className="mb-6 flex justify-between items-center">
        <div className="w-50% flex-0.5">
          <div
            className="flex items-center gap-2 group w-fit cursor-pointer pt-2 md:pt-0 lg:pt-0"
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
        <div className="hidden md:block lg:block w-38">
          <CourseScheduleCard isVisibile={false} fullWidth={true} />
        </div>
      </div>
      <div className="relative">
        <WipOverlay fullHeight={true} />
        <div className="bg-blue-00 overflow-x-auto custom-scrollbar flex gap-4 w-full h-full mb-3 pb-1">
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

        <PendingApprovalsTable
          requests={pendingRequests}
          onViewClick={(data) => setSelectedRequest(data)}
        />
      </div>
    </div>
  );
};

export default PendingApprovals;
