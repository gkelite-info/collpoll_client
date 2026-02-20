// "use client";

// import { CaretLeft, CaretRight } from "@phosphor-icons/react";
// import EventCard from "./eventCard";

// /* ---------------- STATIC TIME SLOTS ---------------- */

// const TIME_SLOTS = [
//   "08:00 AM",
//   "09:00 AM",
//   "10:00 AM",
//   "11:00 AM",
//   "12:00 PM",
//   "01:00 PM",
//   "02:00 PM",
//   "03:00 PM",
//   "04:00 PM",
//   "05:00 PM",
//   "06:00 PM",
//   "07:00 PM",
//   "08:00 PM",
//   "09:00 PM",
// ];

// /* ---------------- STATIC WEEK ---------------- */

// const weekDays = [
//   { day: "MON", date: 18, fullDate: "2026-02-18" },
//   { day: "TUE", date: 19, fullDate: "2026-02-19" },
//   { day: "WED", date: 20, fullDate: "2026-02-20" },
//   { day: "THU", date: 21, fullDate: "2026-02-21" },
//   { day: "FRI", date: 22, fullDate: "2026-02-22" },
//   { day: "SAT", date: 23, fullDate: "2026-02-23" },
// ];

// /* ---------------- STATIC EVENTS ---------------- */

// const events = [
//   {
//     id: "1",
//     calendarEventId: 1,
//     title: "Budget Meeting",
//     type: "meeting",
//     day: "MON",
//     startTime: "2026-02-18T09:00:00",
//     endTime: "2026-02-18T10:00:00",
//     branch: "CSE",
//     year: "3rd Year",
//     section: "A",
//   },
//   {
//     id: "2",
//     calendarEventId: 2,
//     title: "Fee Collection Review",
//     type: "exam",
//     day: "TUE",
//     startTime: "2026-02-19T11:00:00",
//     endTime: "2026-02-19T12:30:00",
//     branch: "ECE",
//     year: "2nd Year",
//     section: "B",
//   },
//   {
//     id: "3",
//     calendarEventId: 3,
//     title: "Audit Discussion",
//     type: "class",
//     day: "WED",
//     startTime: "2026-02-20T14:00:00",
//     endTime: "2026-02-20T15:00:00",
//     branch: "MECH",
//     year: "1st Year",
//     section: "A",
//   },
// ];

// /* ---------------- SIMPLE POSITION CALCULATION ---------------- */

// interface CalendarGridProps {
//   onEditRequest: (event: any) => void;
// }

// const getEventStyle = (event: any) => {
//   const start = new Date(event.startTime);
//   const end = new Date(event.endTime);

//   const startOfDay = new Date(start);
//   startOfDay.setHours(8, 0, 0, 0);

//   const durationMinutes =
//     (end.getTime() - start.getTime()) / (1000 * 60);

//   const minutesFromStart =
//     (start.getTime() - startOfDay.getTime()) / (1000 * 60);

//   const PIXELS_PER_MIN = 2;

//   return {
//     top: `${minutesFromStart * PIXELS_PER_MIN}px`,
//     height: `${durationMinutes * PIXELS_PER_MIN}px`,
//   };
// };

// const CalendarGrid: React.FC<CalendarGridProps> = ({ onEditRequest }) => {
//   return (
//     <div className="bg-white rounded-r-[20px] rounded-b-[20px] shadow-sm overflow-y-auto flex flex-col relative -mt-2 h-[400px] 2xl:h-[700px]">

//       {/* HEADER */}
//       <div className="flex border-b border-gray-400">
//         <div className="w-20 min-w-[80px] border-r border-gray-400 p-2 flex items-center justify-center gap-1 bg-white z-10">
//           <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
//             <CaretLeft size={16} weight="bold" />
//           </button>
//           <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
//             <CaretRight size={16} weight="bold" />
//           </button>
//         </div>

//         <div className="flex-1 grid grid-cols-6">
//           {weekDays.map((day) => (
//             <div
//               key={day.fullDate}
//               className="text-center py-2.5 border-r border-gray-400 last:border-r-0"
//             >
//               <div className="flex items-center justify-center space-x-1">
//                 <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
//                   {day.day}
//                 </div>
//                 <div className="text-sm font-bold text-gray-700">
//                   {day.date}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto custom-scrollbar relative">
//         <div className="flex min-h-[720px]">
//           <div className="w-20 min-w-20 bg-white border-r border-gray-300 shrink-0 select-none">
//             {TIME_SLOTS.map((time) => (
//               <div
//                 key={time}
//                 className="h-[120px] text-[11px] font-medium text-gray-400 text-center pt-3 border-b border-dashed border-gray-100"
//               >
//                 {time}
//               </div>
//             ))}
//           </div>
//           <div className="flex-1 grid grid-cols-6 relative">
//             <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
//               {TIME_SLOTS.map((_, i) => (
//                 <div
//                   key={i}
//                   className="h-[120px] w-full border-b border-[#C6C6C69E]"
//                 />
//               ))}
//             </div>

//             {weekDays.map((dayObj) => (
//               <div
//                 key={dayObj.fullDate}
//                 className="relative h-full border-r border-[#C6C6C69E] last:border-r-0 z-10"
//               >
//                 {events
//                   .filter((e) =>
//                     e.startTime.startsWith(dayObj.fullDate)
//                   )
//                   .map((event) => {
//                     const position = getEventStyle(event);

//                     return (
//                       <div
//                         key={event.id}
//                         style={{
//                           top: position.top,
//                           height: position.height,
//                           width: "100%",
//                           left: "0%",
//                         }}
//                         className="absolute px-1"
//                       >
//                         <EventCard
//                           event={event}
//                           onEdit={() => onEditRequest(event)}
//                           onDelete={() => console.log("Delete")}
//                           onClick={() => console.log("View")}
//                         />
//                       </div>
//                     );
//                   })}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CalendarGrid;

"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import EventCard from "./eventCard";

/* ---------------- STATIC TIME SLOTS ---------------- */

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
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

/* ---------------- SIMPLE POSITION CALCULATION ---------------- */

// Added events and weekDays to the props
interface CalendarGridProps {
  onEditRequest: (event: any) => void;
  events: any[];
  weekDays: any[];
}

const getEventStyle = (event: any) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  const startOfDay = new Date(start);
  startOfDay.setHours(8, 0, 0, 0);

  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

  const minutesFromStart =
    (start.getTime() - startOfDay.getTime()) / (1000 * 60);

  const PIXELS_PER_MIN = 2;

  return {
    top: `${minutesFromStart * PIXELS_PER_MIN}px`,
    height: `${durationMinutes * PIXELS_PER_MIN}px`,
  };
};

// Destructure the new props
const CalendarGrid: React.FC<CalendarGridProps> = ({
  onEditRequest,
  events,
  weekDays,
}) => {
  return (
    <div className="bg-white rounded-r-[20px] rounded-b-[20px] shadow-sm overflow-y-auto flex flex-col relative -mt-2 h-[400px] 2xl:h-[700px]">
      {/* HEADER */}
      <div className="flex border-b border-gray-400">
        <div className="w-20 min-w-[80px] border-r border-gray-400 p-2 flex items-center justify-center gap-1 bg-white z-10">
          <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <CaretLeft size={16} weight="bold" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <CaretRight size={16} weight="bold" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-6">
          {weekDays.map((day) => (
            <div
              key={day.fullDate}
              className="text-center py-2.5 border-r border-gray-400 last:border-r-0"
            >
              <div className="flex items-center justify-center space-x-1">
                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  {day.day}
                </div>
                <div className="text-sm font-bold text-gray-700">
                  {day.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="flex min-h-[720px]">
          <div className="w-20 min-w-20 bg-white border-r border-gray-300 shrink-0 select-none">
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className="h-[120px] text-[11px] font-medium text-gray-400 text-center pt-3 border-b border-dashed border-gray-100"
              >
                {time}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-6 relative">
            <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
              {TIME_SLOTS.map((_, i) => (
                <div
                  key={i}
                  className="h-[120px] w-full border-b border-[#C6C6C69E]"
                />
              ))}
            </div>

            {weekDays.map((dayObj) => (
              <div
                key={dayObj.fullDate}
                className="relative h-full border-r border-[#C6C6C69E] last:border-r-0 z-10"
              >
                {events
                  .filter((e) => e.startTime.startsWith(dayObj.fullDate))
                  .map((event) => {
                    const position = getEventStyle(event);

                    return (
                      <div
                        key={event.id}
                        style={{
                          top: position.top,
                          height: position.height,
                          width: "100%",
                          left: "0%",
                        }}
                        className="absolute px-1"
                      >
                        <EventCard
                          event={event}
                          onEdit={() => onEditRequest(event)}
                          onDelete={() => console.log("Delete")}
                          onClick={() => console.log("View")}
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
  );
};

export default CalendarGrid;
