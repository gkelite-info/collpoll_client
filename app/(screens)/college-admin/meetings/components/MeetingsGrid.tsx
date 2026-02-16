"use client";

import { Laptop } from "@phosphor-icons/react";

const data = [
  {
    title: "Fee Planning Q1",
    educationType: "B.Tech",
    admin: "Shravani - (B.Tech)",
    date: "20 Feb 2026",
    time: "8:00 AM - 9:00 AM",
  },
  {
    title: "Academic Prep",
    educationType: "B.Tech",
    admin: "Shravani - (B.Tech)",
    date: "20 Feb 2026",
    time: "8:00 AM - 9:00 AM",
  },
  {
    title: "Placement Drive Planning",
    educationType: "B.Tech",
    admin: "Shravani - (B.Tech)",
    date: "20 Feb 2026",
    time: "8:00 AM - 9:00 AM",
  },
  {
    title: "Fee Planning Q1",
    educationType: "B.Tech",
    admin: "Shravani - (B.Tech)",
    date: "20 Feb 2026",
    time: "8:00 AM - 9:00 AM",
  },
];

export default function MeetingsGrid() {
  return (
    <div className="mt-5 overflow-x-auto">

      <div className="grid grid-cols-2 gap-6 min-w-[900px]">

        {data.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >           
            <div className="bg-[#E6F4EC] px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#43C17A] flex items-center justify-center">
                <Laptop size={20} color="white" weight="fill" />
              </div>
              <span className="text-[#11934A] text-lg font-medium">
                {item.time}
              </span>
            </div>  
            <div className="border-t-2 border-dashed border-[#43C17A]" />       
            <div className="p-5">
              <h3 className="text-[#43C17A] text-xl font-semibold mb-4">
                {item.title}
              </h3>
              <div className="space-y-3 text-[#282828]">
                <div className="flex items-center gap-2">
                  <span className=" text-lg font-regular">Education Type :</span>
                  <span className="bg-[#E3E7ED] text-[#1F2F56] px-3 py-1 rounded-full text-sm">
                    {item.educationType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-regular">Admin :</span>
                  <span className="bg-[#E3E7ED] text-[#1F2F56] px-3 py-1 rounded-full text-sm">
                    {item.admin}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-regular">Date :</span>
                    <span className="bg-[#E3E7ED] text-[#1F2F56] px-3 py-1 rounded-full text-sm">
                      {item.date}
                    </span>
                  </div>
                  <button className="bg-[#1F2F56] text-white px-4 py-1 rounded-full text-sm font-medium hover:opacity-90 transition">
                    Join Meeting
                  </button>
                </div>

              </div>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
