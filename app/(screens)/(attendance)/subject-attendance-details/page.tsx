"use client";

import CardComponent from "@/app/utils/card";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TableComponent from "@/app/utils/table/table";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { CaretLeft, Chalkboard, FilePdf, Percent } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CardItem {
  id: number;
  icon: React.ReactNode;
  value: string | number;
  label: string;
  style?: string;
  iconBgColor?: string;
  iconColor?: string;
  underlineValue?: boolean;
  totalPercentage?: string | number;
}

const StatusBadge = ({ status }: { status: string }) => {
  let bg = "";
  let color = "";

  switch (status) {
    case "Present":
      bg = "#43C17A3D";
      color = "#00A652";
      break;
    case "Absent":
      bg = "#FFE0E0";
      color = "#FF2020";
      break;
    case "Late":
      bg = "#FFEDDA";
      color = "#FFBB70";
      break;
    default:
      bg = "#E5E5E5";
      color = "#525252";
  }
  return (
    <div className="flex justify-center w-full">
      <div
        className="w-[90px] h-[28px] flex items-center justify-center rounded-lg text-sm font-medium"
        style={{ backgroundColor: bg, color: color }}
      >
        {status}
      </div>
    </div>
  );
};

export default function SubjectAttendanceDetails() {
  const [activeView, setActiveView] = useState<"table" | "present" | "absent">(
    "table"
  );

  const router = useRouter()

  const cards: CardItem[] = [
    {
      id: 1,
      icon: <Chalkboard size={30} weight="fill" />,
      value: "32",
      label: "Total Classes",
      style: "bg-[#E2DAFF] w-[182px]",
      iconBgColor: "#714EF2",
      iconColor: "#EFEFEF",
    },
    {
      id: 2,
      icon: <Chalkboard size={30} weight="fill" />,
      value: "28",
      label: "Attended",
      style: "bg-[#FFEDDA] w-[182px]",
      iconBgColor: "#FFBC72",
      iconColor: "#EFEFEF",
    },
    {
      id: 3,
      icon: <Chalkboard size={30} weight="fill" />,
      value: "1",
      label: "Leave",
      style: "bg-[#FFE6E6] w-[182px]",
      iconBgColor: "#F62D2D",
      iconColor: "#EFEFEF",
    },
    {
      id: 4,
      icon: <Percent size={30} weight="fill" />,
      value: "87%",
      label: "Attendance",
      style: "bg-[#CEE6FF] w-[182px]",
      iconBgColor: "#60AEFF",
      iconColor: "#EFEFEF",
    },
  ];

  const detailCard = [
    {
      subject: "Data Structures",
      faculty: "Prof. Sindhu Sharma",
      attendance: "Classes Held: 32 | Attended: 28 | Missed: 3 | %: 87%",
    },
  ];

  const columns = [
    { title: "Date", key: "date" },
    { title: "Time", key: "time" },
    { title: "Status", key: "status" },
    { title: "Reason", key: "reason" },
    { title: "Notes", key: "notes" },
  ];

  const tableData = [
    {
      date: "22/10/2025",
      time: "01:00 PM - 04:00 PM",
      status: <StatusBadge status="Present" />,
      reason: "-",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
    },
    {
      date: "20/10/2025",
      time: "01:00 PM - 04:00 PM",
      status: <StatusBadge status="Present" />,
      reason: "-",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
    },
    {
      date: "18/10/2025",
      time: "01:00 PM - 04:00 PM",
      status: <StatusBadge status="Absent" />,
      reason: "Sick Leave",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
    },
  ];

  const present = [
    { title: "Date", key: "date" },
    { title: "Time", key: "time" },
    { title: "Status", key: "status" },
    { title: "Reason", key: "reason" },
    { title: "Notes", key: "notes" },
  ];

  const presentTableData = [
    {
      date: "22/10/2025",
      time: "01:00 PM - 04:00 PM",
      status: <StatusBadge status="Present" />,
      reason: "-",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
    },
    {
      date: "20/10/2025",
      time: "01:00 PM - 04:00 PM",
      status: <StatusBadge status="Present" />,
      reason: "-",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
    },
    {
      date: "18/10/2025",
      time: "01:00 PM - 04:00 PM",
      status: <StatusBadge status="Present" />,
      reason: "-",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
    },
    {
      date: "17/10/2025",
      time: "01:00 PM - 04:00 PM",
      status: <StatusBadge status="Present" />,
      reason: "-",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
    },
    {
      date: "16/10/2025",
      time: "01:00 PM - 04:00 PM",
      status: <StatusBadge status="Present" />,
      reason: "-",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
    },
  ];

  const absent = [
    { title: "Date", key: "date" },
    { title: "Time", key: "time" },
    { title: "Status", key: "status" },
    { title: "Reason", key: "reason" },
    { title: "Notes", key: "notes" },
  ];

  const absentTableData = [
    {
      date: "22/10/2025",
      time: "01:00 PM - 04:00 PM",
      status: <StatusBadge status="Absent" />,
      reason: "Sick Leave",
      notes: (
        <div className="w-full flex justify-center">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EDFC] cursor-pointer">
            <FilePdf size={20} color="#7557E3" />
          </div>
        </div>
      ),
    },
  ];

  const handleBack = () => {
    router.push("/attendance?tab=subject-attendance")
  }

  return (
    <div className="flex flex-col pb-3">
      <div className="flex justify-between items-center">
        <div className="flex flex-col w-[50%]">
          <div className="flex gap-0 items-center">
            <button onClick={handleBack} className="cursor-pointer">
              <CaretLeft size={23} className="cursor-pointer -ml-1.5" />
            </button>
            <h1 className="text-[#282828] font-bold text-2xl mb-1">Attendance</h1>
          </div>
          <p className="text-[#282828]">
            Track, Manage, and Maintain Your Attendance Effortlessly
          </p>
        </div>

        <div className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </div>
      </div>

      <div className="w-full h-[170px] mt-4 flex items-start gap-3">
        {cards.map((card, index) => {
          return (
            <div
              key={index}
              onClick={() => {
                if (index === 0) setActiveView("table");
                if (index === 1) setActiveView("present");
                if (index === 2) setActiveView("absent");
              }}
            >
              <CardComponent
                style={card.style}
                icon={card.icon}
                value={card.value}
                label={card.label}
                iconBgColor={card.iconBgColor}
                iconColor={card.iconColor}
                underlineValue={card.underlineValue}
                totalPercentage={card.totalPercentage}
              />
            </div>
          );
        })}
        <WorkWeekCalendar style="w-[345px] mt-0" />
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="w-full flex flex-col items-start">
          <h4 className="text-[#282828] font-medium">Subject Detail View</h4>
          {detailCard.map((item, index) => (
            <div
              className="bg-blue-00 w-full mt-2 flex items-center"
              key={index}
            >
              <div className="flex items-center gap-1">
                <h5 className="text-[#525252] text-sm">Subject :</h5>
                <div className="rounded-full px-3 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
                  <p className="text-sm text-[#43C17A] font-medium">
                    {item.subject}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-6">
                <h5 className="text-[#525252] text-sm">Faculty :</h5>
                <div className="rounded-full px-3 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
                  <p className="text-sm text-[#43C17A] font-medium">
                    {item.faculty}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-6">
                <h5 className="text-[#525252] text-sm">Attendance :</h5>
                <div className="rounded-full px-3 h-[25px] flex items-center justify-center bg-[#DCEAE2]">
                  <p className="text-sm text-[#43C17A] font-medium">
                    {item.attendance}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 w-[85%]">
          {activeView === "table" && (
            <TableComponent columns={columns} tableData={tableData} />
          )}

          {activeView === "present" && (
            <TableComponent columns={present} tableData={presentTableData} />
          )}

          {activeView === "absent" && (
            <TableComponent columns={absent} tableData={absentTableData} />
          )}
        </div>
      </div>
    </div>
  );
}
