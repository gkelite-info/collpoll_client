"use client";

import React, { useState, useMemo } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import EventCard from "./eventCard"; // Adjust this import path as needed
import { useRouter } from "next/navigation";
import EventDetailsModal from "../modal/EventDetailsModal";

// --- CONSTANTS ---
const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM",
];

type CalendarGridProps = {
  events: any[];
  activeTab: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDeleteRequest: (event: any) => void;
  onEditRequest: (event: any) => void;
  onEventClick: (event: any) => void;
};

// --- HELPERS ---
const getWeekDays = (baseDate: Date) => {
  const days = [];
  const startOfWeek = new Date(baseDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  for (let i = 0; i < 6; i++) {
    const nextDay = new Date(startOfWeek);
    nextDay.setDate(startOfWeek.getDate() + i);
    days.push({
      day: nextDay.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: nextDay.getDate().toString(),
      fullDate: nextDay.toISOString().split("T")[0],
    });
  }
  return days;
};

// Calculates the vertical position based on 120px per hour (starting at 8 AM)
const getEventPosition = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const startHours = start.getHours() + start.getMinutes() / 60;
  const endHours = end.getHours() + end.getMinutes() / 60;

  const top = (startHours - 8) * 120; // 8 is our starting hour
  const height = (endHours - startHours) * 120;

  return { top: `${top}px`, height: `${height}px` };
};

const CalendarGrid = ({
  events,
  activeTab,
  onPrevWeek,
  onNextWeek,
  onDeleteRequest,
  onEditRequest,
  onEventClick,
}: CalendarGridProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const router = useRouter();

  // Static data mapped to current week for demonstration
  const MOCK_EVENTS = [
    {
      id: "1",
      type: "class",
      title: "Principles of Design",
      startTime: `${weekDays[0].fullDate}T09:00:00`,
      endTime: `${weekDays[0].fullDate}T10:30:00`,
      branch: "Design",
      year: "2nd Year",
      section: "Sec-A",
    },
    {
      id: "2",
      type: "meeting",
      title: "Faculty Sync",
      startTime: `${weekDays[2].fullDate}T11:00:00`,
      endTime: `${weekDays[2].fullDate}T12:00:00`,
      branch: "Staff",
      year: "N/A",
      section: "Room 302",
    },
  ];

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-r-[20px] rounded-b-[20px] shadow-sm overflow-hidden flex flex-col relative -mt-2 h-[500px] 2xl:h-[700px] border border-gray-200">

        {/* HEADER */}
        <div className="flex border-b border-gray-400 bg-white sticky top-0 z-30">
          <div className="w-20 min-w-[80px] border-r border-gray-400 p-2 flex items-center justify-center gap-1 bg-white">
            <button onClick={handlePrevWeek} className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors cursor-pointer">
              <CaretLeft size={16} weight="bold" />
            </button>
            <button onClick={handleNextWeek} className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors cursor-pointer">
              <CaretRight size={16} weight="bold" />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-6">
            {weekDays.map((day) => (
              <div key={day.fullDate} className="text-center py-2.5 border-r border-gray-400 last:border-r-0">
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{day.day}</span>
                  <span className="text-sm font-bold text-gray-700">{day.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRID BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="flex min-h-[1680px]">

            {/* TIME COLUMN */}
            <div className="w-20 min-w-20 bg-white border-r border-gray-300 shrink-0 select-none">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="h-[120px] text-[11px] font-medium text-gray-400 text-center pt-3 border-b border-dashed border-gray-100">
                  {time}
                </div>
              ))}
            </div>

            {/* DAY COLUMNS */}
            <div className="flex-1 grid grid-cols-6 relative">

              {/* Horizontal Grid Lines */}
              <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
                {TIME_SLOTS.map((_, i) => (
                  <div key={i} className="h-[120px] w-full border-b border-[#C6C6C69E]" />
                ))}
              </div>

              {/* Event Rendering */}
              {weekDays.map((dayObj) => (
                <div key={dayObj.fullDate} className="relative h-full border-r border-[#C6C6C69E] last:border-r-0 z-10 px-1">
                  {MOCK_EVENTS.filter(e => e.startTime.startsWith(dayObj.fullDate)).map((event) => {
                    const position = getEventPosition(event.startTime, event.endTime);
                    return (
                      <div
                        key={event.id}
                        className="absolute w-[96%] left-[2%]"
                        style={{ top: position.top, height: position.height }}
                      >
                        <EventCard
                          event={event}
                          onDelete={() =>
                            router.push(`/calendar/delete-event/${event.id}`)
                          }
                          onEdit={() => handleEdit(event)}   // 🔥 Modal instead of routing
                          onClick={() =>
                            router.push(`/calendar/event-details/${event.id}`)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <EventDetailsModal
        open={isModalOpen}
        event={selectedEvent}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default CalendarGrid;