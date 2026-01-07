"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { CaretLeft, User, UsersThree } from "@phosphor-icons/react";
import React, { useState } from "react";
import CardComponent from "./cards";
import FacultyView from "./facultyView";
import UserRequestsTable from "./tables/pendingUserRegistTable";
import { UptimeDataPoint } from "./uptimeChart";

interface TotalUsersProps {
  onBack: () => void;

  onViewDetails?: (dept: string) => void;
}

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

const mockData: UptimeDataPoint[] = [
  { date: "1 Nov", value: 58 },
  { date: "2 Nov", value: 78 },
  { date: "3 Nov", value: 66 },
  { date: "4 Nov", value: 74 },
  { date: "5 Nov", value: 71 },
  { date: "6 Nov", value: 64 },
  { date: "7 Nov", value: 63 },
  { date: "8 Nov", value: 72 },
  { date: "9 Nov", value: 72 },
];

const PendingUserRegistration: React.FC<TotalUsersProps> = ({ onBack }) => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

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
              Pending User Registrations
            </h1>
          </div>
          <p className="text-[#282828] mt-1 ml-7 text-sm opacity-70">
            Review and approve new user requests.
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

      <UserRequestsTable />
    </div>
  );
};

export default PendingUserRegistration;
