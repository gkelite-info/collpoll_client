"use client";

import { EnvelopeSimple, Phone, ListDashes, CalendarBlank, CaretDown, CalendarCheckIcon, CalendarDotsIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";

export default function ExecutiveProfileCard() {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [monthIdx, setMonthIdx] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-5 md:p-6 flex flex-col shrink-0">

      {/* <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-[72px] h-[72px] md:w-[84px] md:h-[84px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-100 shadow-sm relative">
            <Image
              src="https://i.pravatar.cc/150?img=11"
              alt="Naveen Kumar"
              fill
              sizes="(max-width: 768px) 72px, 84px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
              <h2 className="text-[18px] md:text-[20px] font-bold text-[#282828] truncate">Naveen Kumar</h2>
              <span className="text-[12px] md:text-[13px] font-bold text-[#282828] whitespace-nowrap">ID - 274292</span>
            </div>
            <p className="text-[13px] md:text-[14px] font-bold text-[#43C17A] mb-2 truncate">Infrastructure Executive</p>
            <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-bold">
              <div className="bg-[#43C17A26] rounded-full p-1">
                <Phone size={16} color="#43C17A" weight="fill" />
              </div>
              <span className="truncate text-[#16284F]">+91 90847 46247</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:items-end gap-3 w-full lg:w-auto bg-gray-50 lg:bg-transparent p-4 lg:p-0 rounded-[12px] lg:rounded-none border border-gray-100 lg:border-none">
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
            <span className="text-[#282828]">Performance -</span>
            <span className="text-[#43C17A]">Actively Contributing</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] font-bold text-gray-600 lg:bg-gray-50 lg:px-3 lg:py-1.5 lg:rounded-lg lg:border lg:border-gray-100 w-full lg:w-auto">
            <div className="bg-[#43C17A26] rounded-full p-1">
              <EnvelopeSimple size={16} color="#43C17A" weight="fill" />
            </div>
            <span className="truncate text-[#16284F]">Email - naveenkumar@gmail.com</span>
          </div>
          <button className="bg-[#43C17A] text-white text-[12px] font-bold px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 w-fit hover:bg-[#34A362] transition-colors shadow-sm lg:mt-1">
            <ListDashes size={14} weight="bold" /> January
          </button>
        </div>
      </div> */}

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-[72px] h-[72px] md:w-[84px] md:h-[84px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-100 shadow-sm relative">
            <Image
              src="https://i.pravatar.cc/150?img=11"
              alt="Naveen Kumar"
              fill
              sizes="(max-width: 768px) 72px, 84px"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-between h-[72px] md:h-[84px] py-0.5 min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-[18px] md:text-[20px] font-bold text-[#282828] truncate leading-none">Naveen Kumar</h2>
              <span className="text-[12px] md:text-[13px] font-bold text-[#282828] whitespace-nowrap">ID - 274292</span>
            </div>
            <p className="text-[13px] md:text-[14px] font-bold text-[#43C17A] truncate">Infrastructure Executive</p>
            <div className="flex items-center gap-2 text-[12px] md:text-[13px] font-bold">
              <div className="bg-[#43C17A26] rounded-full p-1 flex-shrink-0">
                <Phone size={14} color="#43C17A" weight="fill" />
              </div>
              <span className="truncate text-[#16284F]">+91 90847 46247</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:items-end justify-between h-auto lg:h-[72px] lg:md:h-[84px] py-0.5 w-full lg:w-auto bg-gray-50 lg:bg-transparent p-4 lg:p-0 rounded-[12px] lg:rounded-none border border-gray-100 lg:border-none gap-3 lg:gap-0 mt-2 lg:mt-0">
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
            <span className="text-[#282828]">Performance -</span>
            <span className="text-[#43C17A]">Actively Contributing</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#16284F]">
            <div className="bg-[#43C17A26] rounded-full p-1 flex-shrink-0">
              <EnvelopeSimple size={14} color="#43C17A" weight="fill" />
            </div>
            <span className="truncate">Email - naveenkumar@gmail.com</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-[#43C17A] cursor-pointer text-white text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5 w-fit hover:bg-[#34A362] transition-colors shadow-sm"
            >
              <span className="bg-[#EFEFEF] p-1 rounded-full text-[#43C17A]">
                <CalendarDotsIcon size={14} weight="fill" />
              </span> {months[monthIdx]} <CaretDown size={12} weight="bold" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-10 py-1 max-h-[180px] overflow-y-auto custom-scrollbar">
                {months.map((month, idx) => (
                  <button
                    key={month}
                    onClick={() => {
                      setMonthIdx(idx);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full cursor-pointer text-left px-4 py-2 text-[12px] font-bold transition-colors ${idx === monthIdx
                      ? "bg-[#E8F8EF] text-[#43C17A]"
                      : "text-[#16284F] hover:bg-gray-50"
                      }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-[#E2DAFF] rounded-[12px] p-4 flex flex-col justify-between h-[90px] shadow-sm border border-black/5 hover:shadow-md transition-shadow">
          <span className="text-[24px] md:text-[26px] font-extrabold text-[#3801FF] leading-none">52</span>
          <span className="text-[12px] md:text-[13px] font-bold text-[#16284F]">Total Issues Handled</span>
        </div>
        <div className="bg-[#FFEDDA] rounded-[12px] p-4 flex flex-col justify-between h-[90px] shadow-sm border border-black/5 hover:shadow-md transition-shadow">
          <span className="text-[24px] md:text-[26px] font-extrabold text-[#EEB373] leading-none">44</span>
          <span className="text-[12px] md:text-[13px] font-bold text-[#16284F]">Issues Resolved</span>
        </div>
        <div className="bg-[#E6FFF1] rounded-[12px] p-4 flex flex-col justify-between h-[90px] shadow-sm border border-black/5 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
          <span className="text-[24px] md:text-[26px] font-extrabold text-[#43C17A] leading-none">34%</span>
          <span className="text-[12px] md:text-[13px] font-bold text-[#16284F]">Performance %</span>
        </div>
      </div>

    </div>
  );
}