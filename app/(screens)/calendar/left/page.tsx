"use client";

import { CaretCircleRight } from "@phosphor-icons/react";

function getWeekDays() {
  const today = new Date();
  const day = today.getDay();

  const monday = new Date(today);
  const diffToMonday = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    days.push({
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      dateNum: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    });
  }

  return days;
}

export default function CalendarLeft() {
  const week = getWeekDays();

  const weekContent = [
    {
      items: [
        { label: "Classes", count: 3 },
        { label: "Club Activity", count: 1 },
      ],
      focus: "AI Lab Practice",
      tip: "Revise Unit 2 today!",
    },
    {
      items: [
        { label: "Workshop", count: 1 },
        { label: "Assignments", count: 2 },
      ],
      focus: "Python Loops",
      tip: "Solve 5 loop problems.",
    },
    {
      items: [
        { label: "Classes", count: 2 },
        { label: "Submission", count: 1 },
      ],
      focus: "Math Optimization",
      tip: "Watch formula recap.",
    },
    {
      items: [
        { label: "Event", count: 1 },
        { label: "Assignments", count: 1 },
      ],
      focus: "DSA Patterns",
      tip: "Practice 3 patterns.",
    },
    {
      items: [
        { label: "Classes", count: 3 },
        { label: "Workshop", count: 1 },
      ],
      focus: "React Basics",
      tip: "Build a small UI.",
    },
    {
      items: [
        { label: "Club Activity", count: 1 },
        { label: "Event", count: 1 },
      ],
      focus: "Mini Project Planning",
      tip: "Draft module layout.",
    },
    {
      items: [
        { label: "Sunday Reset", count: 1 },
        { label: "Relax", count: 1 },
      ],
      focus: "Sunday Reset",
      tip: "Relax & recharge.",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-3 flex flex-col shadow-md">
      <h4 className="text-[#282828] font-medium">Weekly Calendar Overview</h4>

      <div className="flex flex-col">
        {week.map((item, index) => {
          const isActive = item.isToday;
          const content = weekContent[index];

          return (
            <div
              key={index}
              className={`flex p-3 h-[97px] rounded-md mt-2 gap-2 ${
                isActive
                  ? "bg-[#43C17A]"
                  : "bg-[#FFFFFF] border border-[#D4D4D4]"
              }`}
            >
              <div
                className={`flex flex-col items-center justify-center gap-0.5 h-[73.1px] w-[73.1px] rounded-md ${
                  isActive ? "bg-[#FFFFFF]" : "bg-[#D3F1E0]"
                }`}
              >
                <p
                  className={`text-xs font-semibold ${
                    isActive ? "text-[#43C17A]" : "text-[#282828]"
                  }`}
                >
                  {item.dayName}
                </p>

                <p
                  className={`text-lg font-bold ${
                    isActive ? "text-[#43C17A]" : "text-[#282828]"
                  }`}
                >
                  {item.dateNum}
                </p>
              </div>

              <div className="w-[80%] rounded-md flex justify-between items-center">
                <div className="flex flex-col w-[90%] p-1 h-[100%] rounded-l-md">
                  <p
                    className={`text-[13px] ${
                      isActive ? "text-white" : "text-[#282828]"
                    }`}
                  >
                    📘 {content.items[0].count} {content.items[0].label} · 🧾{" "}
                    {content.items[1].count} {content.items[1].label}
                  </p>

                  <p
                    className={`text-[13px] ${
                      isActive ? "text-white" : "text-[#282828]"
                    }`}
                  >
                    🎯 Focus Area: {content.focus}
                  </p>

                  <p
                    className={`text-[13px] ${
                      isActive ? "text-white" : "text-[#282828]"
                    }`}
                  >
                    🪄 Tip: {content.tip}
                  </p>
                </div>

                <div className="w-[10%] flex justify-start">
                  <CaretCircleRight
                    size={25}
                    weight="fill"
                    className={`cursor-pointer ${
                      isActive ? "text-white" : "text-[#43C17A]"
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
