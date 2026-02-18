"use client";

import { useState } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CalendarToolbar from "./components/calenderToolbar";
import CalendarGrid from "./components/CalendarGrid";
import { getWeekDays } from "../../faculty/calendar/utils";
import CalendarHeader from "./components/calenderHeader";
import AddEventModal from "./modal/AddEventModal";

export default function FinanceCalendarPage() {
  const [activeTab, setActiveTab] = useState("All Scheduled");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);


  const weekDays = getWeekDays(currentDate);
  const TIME_SLOTS = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const events = [
    {
      id: 1,
      title: "Quarterly Audit Review",
      type: "analysis", // Matches FINANCE_STYLES key
      startTime: `${weekDays[0].fullDate}T08:00:00`,
      endTime: `${weekDays[0].fullDate}T09:30:00`,
      client: "Global Corp Inc.",
      region: "North America",
      ticker: "GCI",
    },
    {
      id: 2,
      title: "Client Portfolio Strategy",
      type: "meeting",
      startTime: `${weekDays[1].fullDate}T08:30:00`,
      endTime: `${weekDays[1].fullDate}T10:00:00`,
      client: "Sarah Jenkins",
      region: "UK/Europe",
      ticker: "SJP",
    },
    {
      id: 3,
      title: "Equity Research: Tech Sector",
      type: "portfolio",
      startTime: `${weekDays[2].fullDate}T10:00:00`,
      endTime: `${weekDays[2].fullDate}T12:00:00`,
      client: "Internal Research",
      region: "APAC",
      ticker: "NVDA",
    },
    {
      id: 4,
      title: "Market Closing Summary",
      type: "market_close",
      startTime: `${weekDays[0].fullDate}T15:00:00`,
      endTime: `${weekDays[0].fullDate}T16:00:00`,
      client: "Public Report",
      region: "Global",
      ticker: "SPY",
    },
    {
      id: 5,
      title: "Risk Assessment Workshop",
      type: "analysis",
      startTime: `${weekDays[3].fullDate}T09:00:00`,
      endTime: `${weekDays[3].fullDate}T11:00:00`,
      client: "Risk Dept",
      region: "EMEA",
      ticker: "VIX",
    },
  ];

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  return (
    <main className="p-4">
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-xl font-semibold">Calendar & Events</h1>
          <p className="text-black text-sm">
            Stay Organized And On Track With Your Personalised Calendar
          </p>
        </div>

        <CourseScheduleCard style="w-[320px]" />
      </section>
      <div className="flex justify-between items-center">
        <CalendarToolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <CalendarHeader
          onAddClick={() => setIsModalOpen(true)}
        />

        <AddEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

      </div>
      <div className=" bg-white  shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <CalendarGrid
          onEditRequest={() => {
            setIsModalOpen(true);
          }}
        />
      </div>
    </main>
  );
}