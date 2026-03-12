"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UsersThree, User, Clock } from "@phosphor-icons/react";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Loader } from "../../(student)/calendar/right/timetable";

const columns = [
  { title: "Name", key: "name" },
  { title: "Check-In", key: "checkIn" },
  { title: "Check-Out", key: "checkOut" },
  { title: "Total Hours", key: "totalHours" },
  { title: "Status", key: "status" },
  { title: "Classes Taken", key: "classesTaken" },
  { title: "Late By", key: "lateBy" },
  { title: "Early Out", key: "earlyOut" },
  { title: "Attendance %", key: "attendance" },
];

const getStatusBadge = (status: string) => {
  let colorClass = "text-gray-500";
  if (status === "Present") colorClass = "text-[#22C55E]";
  if (status === "Late") colorClass = "text-[#EAB308]";
  if (status === "Absent") colorClass = "text-[#EF4444]";

  return <span className={`${colorClass} font-semibold`}>{status}</span>;
};

const ALL_DATA = {
  total: [
    {
      name: "Dr. Meera Sharma",
      checkIn: "09:04 AM",
      checkOut: "05:12 PM",
      totalHours: "8h 08m",
      status: getStatusBadge("Present"),
      classesTaken: "04",
      lateBy: "04m",
      earlyOut: "-",
      attendance: "95%",
    },
    {
      name: "Mr. Rahul Menon",
      checkIn: "09:15 AM",
      checkOut: "04:59 PM",
      totalHours: "7h 38m",
      status: getStatusBadge("Late"),
      classesTaken: "05",
      lateBy: "18m",
      earlyOut: "-",
      attendance: "89%",
    },
    {
      name: "Ms. Divya Rao",
      checkIn: "-",
      checkOut: "-",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "78%",
    },
    {
      name: "Dr. Arun Kumar",
      checkIn: "08:50 AM",
      checkOut: "05:05 PM",
      totalHours: "8h 15m",
      status: getStatusBadge("Present"),
      classesTaken: "06",
      lateBy: "-",
      earlyOut: "-",
      attendance: "98%",
    },
    {
      name: "Mrs. Anita Desai",
      checkIn: "On Leave",
      checkOut: "On Leave",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "90%",
    },
    {
      name: "Mr. Kunal Verma",
      checkIn: "09:25 AM",
      checkOut: "05:10 PM",
      totalHours: "7h 45m",
      status: getStatusBadge("Late"),
      classesTaken: "04",
      lateBy: "25m",
      earlyOut: "-",
      attendance: "85%",
    },
    {
      name: "Dr. Smitha Patil",
      checkIn: "09:00 AM",
      checkOut: "04:30 PM",
      totalHours: "7h 30m",
      status: getStatusBadge("Present"),
      classesTaken: "03",
      lateBy: "-",
      earlyOut: "30m",
      attendance: "92%",
    },
    {
      name: "Mr. John Doe",
      checkIn: "08:55 AM",
      checkOut: "05:00 PM",
      totalHours: "8h 05m",
      status: getStatusBadge("Present"),
      classesTaken: "05",
      lateBy: "-",
      earlyOut: "-",
      attendance: "98%",
    },
    {
      name: "Dr. Vikram Singh",
      checkIn: "-",
      checkOut: "-",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "80%",
    },
    {
      name: "Ms. Neha Gupta",
      checkIn: "09:10 AM",
      checkOut: "05:00 PM",
      totalHours: "7h 50m",
      status: getStatusBadge("Late"),
      classesTaken: "04",
      lateBy: "10m",
      earlyOut: "-",
      attendance: "88%",
    },
  ],
  present: [
    {
      name: "Dr. Meera Sharma",
      checkIn: "09:04 AM",
      checkOut: "05:12 PM",
      totalHours: "8h 08m",
      status: getStatusBadge("Present"),
      classesTaken: "04",
      lateBy: "04m",
      earlyOut: "-",
      attendance: "95%",
    },
    {
      name: "Dr. Arun Kumar",
      checkIn: "08:50 AM",
      checkOut: "05:05 PM",
      totalHours: "8h 15m",
      status: getStatusBadge("Present"),
      classesTaken: "06",
      lateBy: "-",
      earlyOut: "-",
      attendance: "98%",
    },
    {
      name: "Dr. Smitha Patil",
      checkIn: "09:00 AM",
      checkOut: "04:30 PM",
      totalHours: "7h 30m",
      status: getStatusBadge("Present"),
      classesTaken: "03",
      lateBy: "-",
      earlyOut: "30m",
      attendance: "92%",
    },
    {
      name: "Mr. John Doe",
      checkIn: "08:55 AM",
      checkOut: "05:00 PM",
      totalHours: "8h 05m",
      status: getStatusBadge("Present"),
      classesTaken: "05",
      lateBy: "-",
      earlyOut: "-",
      attendance: "98%",
    },
    {
      name: "Dr. Kavita Reddy",
      checkIn: "08:58 AM",
      checkOut: "05:15 PM",
      totalHours: "8h 17m",
      status: getStatusBadge("Present"),
      classesTaken: "04",
      lateBy: "-",
      earlyOut: "-",
      attendance: "96%",
    },
    {
      name: "Mr. Sanjay Dutt",
      checkIn: "09:02 AM",
      checkOut: "05:05 PM",
      totalHours: "8h 03m",
      status: getStatusBadge("Present"),
      classesTaken: "05",
      lateBy: "02m",
      earlyOut: "-",
      attendance: "94%",
    },
  ],
  absent: [
    {
      name: "Ms. Divya Rao",
      checkIn: "-",
      checkOut: "-",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "78%",
    },
    {
      name: "Dr. Vikram Singh",
      checkIn: "-",
      checkOut: "-",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "80%",
    },
    {
      name: "Mr. Akash Bansal",
      checkIn: "-",
      checkOut: "-",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "75%",
    },
    {
      name: "Dr. Priya Sharma",
      checkIn: "-",
      checkOut: "-",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "82%",
    },
    {
      name: "Mrs. Sunita Verma",
      checkIn: "-",
      checkOut: "-",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "79%",
    },
  ],
  late: [
    {
      name: "Mr. Rahul Menon",
      checkIn: "09:15 AM",
      checkOut: "04:59 PM",
      totalHours: "7h 38m",
      status: getStatusBadge("Late"),
      classesTaken: "05",
      lateBy: "18m",
      earlyOut: "-",
      attendance: "89%",
    },
    {
      name: "Mr. Kunal Verma",
      checkIn: "09:25 AM",
      checkOut: "05:10 PM",
      totalHours: "7h 45m",
      status: getStatusBadge("Late"),
      classesTaken: "04",
      lateBy: "25m",
      earlyOut: "-",
      attendance: "85%",
    },
    {
      name: "Ms. Neha Gupta",
      checkIn: "09:10 AM",
      checkOut: "05:00 PM",
      totalHours: "7h 50m",
      status: getStatusBadge("Late"),
      classesTaken: "04",
      lateBy: "10m",
      earlyOut: "-",
      attendance: "88%",
    },
    {
      name: "Dr. Rajesh Iyer",
      checkIn: "09:30 AM",
      checkOut: "05:20 PM",
      totalHours: "7h 50m",
      status: getStatusBadge("Late"),
      classesTaken: "03",
      lateBy: "30m",
      earlyOut: "-",
      attendance: "86%",
    },
    {
      name: "Mrs. Meena Kumari",
      checkIn: "09:12 AM",
      checkOut: "05:00 PM",
      totalHours: "7h 48m",
      status: getStatusBadge("Late"),
      classesTaken: "05",
      lateBy: "12m",
      earlyOut: "-",
      attendance: "87%",
    },
  ],
  leave: [
    {
      name: "Mrs. Anita Desai",
      checkIn: "On Leave",
      checkOut: "On Leave",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "90%",
    },
    {
      name: "Mr. Harish Rao",
      checkIn: "On Leave",
      checkOut: "On Leave",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "92%",
    },
    {
      name: "Dr. Amit Patel",
      checkIn: "On Leave",
      checkOut: "On Leave",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "95%",
    },
    {
      name: "Ms. Shruti Hassan",
      checkIn: "On Leave",
      checkOut: "On Leave",
      totalHours: "-",
      status: getStatusBadge("Absent"),
      classesTaken: "-",
      lateBy: "-",
      earlyOut: "-",
      attendance: "88%",
    },
  ],
};

const card = [
  {
    image: "/clip.png",
    imgHeight: "h-10",
    title: "Submit internal marks for all subjects before 25 Oct 2025.",
    professor: "By Justin Orom",
    time: "Just now",
    cardBg: "#E8F8EF",
    imageBg: "#D3F1E0",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/clip.png",
    imgHeight: "h-10",
    title: "Submit internal marks for all subjects before 25 Oct 2025.",
    professor: "By Justin Orom",
    time: "Just now",
    cardBg: "#E8F8EF",
    imageBg: "#D3F1E0",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/clip.png",
    imgHeight: "h-10",
    title: "Submit internal marks for all subjects before 25 Oct 2025.",
    professor: "By Justin Orom",
    time: "Just now",
    cardBg: "#E8F8EF",
    imageBg: "#D3F1E0",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
  {
    image: "/class.png",
    imgHeight: "h-10",
    title: "Upload your mini project abstracts by 12 Nov 2025.",
    professor: "By John",
    time: "12 mins ago.",
    cardBg: "#EEEDFF",
    imageBg: "#E3E1FF",
  },
];

function FacultyAttendanceDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "total";
  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const cardsConfig = [
    {
      id: "total",
      label: "Total Staff",
      value: 18,
      icon: <UsersThree size={22} weight="fill" />,
      colors: {
        activeBg: "bg-[#6C20CA]",
        inactiveBg: "bg-[#E2DAFF]",
        activeIconHex: "#6C20CA",
      },
    },
    {
      id: "present",
      label: "Present Today",
      value: 15,
      icon: <User size={22} weight="fill" />,
      colors: {
        activeBg: "bg-[#43C17A]",
        inactiveBg: "bg-[#E6FBEA]",
        activeIconHex: "#43C17A",
      },
    },
    {
      id: "absent",
      label: "Absent Today",
      value: 2,
      icon: <User size={22} weight="fill" />,
      colors: {
        activeBg: "bg-[#FF0000]",
        inactiveBg: "bg-[#FFE0E0]",
        activeIconHex: "#FF0000",
      },
    },
    {
      id: "late",
      label: "Late Check-ins",
      value: 1,
      icon: <Clock size={22} weight="fill" />,
      colors: {
        activeBg: "bg-[#60AEFF]",
        inactiveBg: "bg-[#CEE6FF]",
        activeIconHex: "#60AEFF",
      },
    },
    {
      id: "leave",
      label: "On Leave",
      value: 2,
      icon: <User size={22} weight="fill" />,
      colors: {
        activeBg: "bg-[#FFBE61]",
        inactiveBg: "bg-[#FFEDDA]",
        activeIconHex: "#FFBE61",
      },
    },
  ];

  const currentTableData = useMemo(() => {
    return ALL_DATA[activeTab as keyof typeof ALL_DATA] || ALL_DATA.total;
  }, [activeTab]);

  return (
    <div className="text-[#282828] p-2 w-full h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col justify-start">
          <h1 className="text-xl font-bold text-[#282828]">
            Faculty Attendance Management
          </h1>
          <p className="text-sm text-[#282828] mt-1">
            Stay Organized and On Track with Your Personalized Calendar
          </p>
        </div>
        <div className="w-[320px]">
          <CourseScheduleCard isVisibile={false} />
        </div>
      </div>

      <div className="w-full flex gap-5">
        <div className="w-[68%] flex flex-col gap-6">
          <div className="flex gap-3 w-full">
            {cardsConfig.map((card) => {
              const isActive = activeTab === card.id;
              return (
                <div key={card.id} className="flex-1">
                  <CardComponent
                    style={`${isActive ? card.colors.activeBg : card.colors.inactiveBg} w-full shadow-none`}
                    isActive={isActive}
                    icon={card.icon}
                    value={String(card.value).padStart(2, "0")}
                    label={card.label}
                    iconBgColor={"#FFFFFF"}
                    iconColor={card.colors.activeIconHex}
                    onClick={() => handleTabChange(card.id)}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex flex-col flex-1 w-full">
            <h2 className="text-sm font-bold text-[#282828] mb-2">
              Daily Attendance Records
            </h2>
            <TableComponent
              columns={columns}
              tableData={currentTableData}
              height="55vh"
            />
          </div>
        </div>

        <div className="w-[32%] flex flex-col -gap-1 -mt-5 pb-4">
          <WorkWeekCalendar />
          <AnnouncementsCard announceCard={card} height="80vh" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-gray-500 font-medium">
          <Loader />
        </div>
      }
    >
      <FacultyAttendanceDashboard />
    </Suspense>
  );
}
