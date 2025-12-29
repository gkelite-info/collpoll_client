// "use client";

// import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
// import { useState } from "react";
// import { CALENDAR_EVENTS } from "./calenderData";
// import AddEventModal from "./components/addEventModal";
// import CalendarHeader from "./components/calendarHeader";
// import CalendarGrid from "./components/calenderGrid";
// import CalendarToolbar from "./components/calenderToolbar";
// import { CalendarEvent } from "./types";
// import { combineDateAndTime, getWeekDays } from "./utils";

// export default function Page() {
//   const [activeTab, setActiveTab] = useState("All");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);

//   const [currentDate, setCurrentDate] = useState(new Date());

//   const weekDays = getWeekDays(currentDate);

//   const handleNextWeek = () => {
//     const next = new Date(currentDate);
//     next.setDate(next.getDate() + 7);
//     setCurrentDate(next);
//   };

//   const handlePrevWeek = () => {
//     const prev = new Date(currentDate);
//     prev.setDate(prev.getDate() - 7);
//     setCurrentDate(prev);
//   };

//   const handleSaveEvent = (data: any) => {
//     const startISO = combineDateAndTime(data.date, data.startTime);
//     const endISO = combineDateAndTime(data.date, data.endTime);

//     const newEvent: CalendarEvent = {
//       id: Math.random().toString(36).substr(2, 9),
//       title: data.title,
//       type: data.type,
//       day: new Date(data.date)
//         .toLocaleDateString("en-US", { weekday: "short" })
//         .toUpperCase(),
//       startTime: startISO,
//       endTime: endISO,
//     };

//     setEvents([...events, newEvent]);

//     setCurrentDate(new Date(data.date));
//   };

//   return (
//     <main className="p-4">
//       <section className="flex justify-between items-center mb-4">
//         <div className="flex items-start justify-center">
//           <div>
//             <div className="flex">
//               <h1 className="text-black text-xl font-semibold">
//                 Calendar & Events
//               </h1>
//             </div>
//             <p className="text-black text-sm">
//               Stay Organized And On Track With Your Personalised Calendar
//             </p>
//           </div>
//         </div>

//         <article className="flex justify-end w-[32%]">
//           <CourseScheduleCard style="w-[320px]"/>
//         </article>
//       </section>
//       <div className="flex justify-between">
//         <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
//         <CalendarHeader onAddClick={() => setIsModalOpen(true)} />
//       </div>

//       <div className="w-full min-h-screen bg-[#f3f4f6] text-gray-800">
//         <CalendarGrid
//           events={events}
//           weekDays={weekDays}
//           onPrevWeek={handlePrevWeek}
//           onNextWeek={handleNextWeek}
//           activeTab={activeTab}
//         />

//         <AddEventModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           onSave={handleSaveEvent}
//         />
//       </div>
//     </main>
//   );
// }

"use client"

import { useState } from "react"
import FacultyOverview from "./components/FacultyOverview"
import CalendarView from "./components/CalendarView"

export default function Page() {
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null)

  return (
    <div className="p-4 bg-[#f3f4f6] min-h-screen">
      {!selectedFaculty ? (
        <FacultyOverview onSelect={setSelectedFaculty} />
      ) : (
        <CalendarView
          faculty={selectedFaculty}
          onBack={() => setSelectedFaculty(null)}
        />
      )}
    </div>
  )
}
