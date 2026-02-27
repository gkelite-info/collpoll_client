import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import {
  CaretRight,
  Laptop,
  Plus,
  DotsThreeVertical,
} from "@phosphor-icons/react";

const TopHiringCompanies = () => {
  return (
    <div className="bg-white rounded-[12px] p-4 shadow-sm border border-gray-100/50">
      <h2 className="text-[15px] font-bold text-[#1F2937] mb-3">
        Top Hiring Companies
      </h2>
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-[#E8F5EE] rounded-md h-[48px] flex items-center justify-center p-1.5">
          <div className="bg-[#0C121D] w-full h-full rounded flex flex-col items-center justify-center leading-none">
            <span className="text-[#FF2A2A] font-bold text-[14px] tracking-tighter">
              tcs
            </span>
            <span className="text-white text-[4px] mt-[1px] opacity-70">
              TATA CONSULTANCY
            </span>
          </div>
        </div>
        <div className="bg-[#E8F5EE] rounded-md h-[48px] flex items-center justify-center p-1.5">
          <div className="bg-white w-full h-full rounded flex items-center justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-[2px] border-dotted border-blue-500/80"></div>
              <span className="text-[#1D2B4A] font-bold text-[10px] tracking-tight">
                wipro
              </span>
            </div>
          </div>
        </div>
        <div className="bg-[#E8F5EE] rounded-md h-[48px] flex items-center justify-center p-1.5">
          <div className="bg-[#007CC3] w-full h-full rounded flex items-center justify-center">
            <span className="text-white font-bold text-[11px] tracking-wide">
              Infosys
            </span>
          </div>
        </div>
        <div className="bg-[#E8F5EE] rounded-md h-[48px] flex items-center justify-center p-1.5">
          <div className="bg-white w-full h-full rounded flex items-center justify-center">
            <span className="text-black font-bold text-[10px] tracking-tight">
              accenture<span className="text-purple-600 font-black">{">"}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BranchPlacementChart = () => {
  const data = [
    { name: "CSE", value: 100 },
    { name: "EEE", value: 75 },
    { name: "ECE", value: 92 },
    { name: "MECH", value: 78 },
    { name: "IT", value: 95 },
  ];

  return (
    <div className="bg-white rounded-[12px] p-4 shadow-sm border border-gray-100/50">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[15px] font-bold text-[#1F2937]">
          Branch-wise Placement Status
        </h2>
        <CaretRight size={16} className="text-gray-500" />
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            barSize={24}
          >
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38A169" stopOpacity={1} />
                <stop offset="100%" stopColor="#22543D" stopOpacity={1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4B5563", fontSize: 10, fontWeight: 500 }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4B5563", fontSize: 10 }}
              ticks={[0, 15, 30, 45, 60, 75, 90, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Bar
              dataKey="value"
              fill="url(#greenGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const PlacementGrowthChart = () => {
  const chartData = [
    {
      branch: "CSE",
      color: "#050A10",
      bars: [
        { year: "2026", value: 100 },
        { year: "2025", value: 70 },
      ],
    },
    {
      branch: "EEE",
      color: "#162444",
      bars: [
        { year: "2026", value: 80 },
        { year: "2025", value: 90 },
      ],
    },
    {
      branch: "ECE",
      color: "#1E305A",
      bars: [
        { year: "2026", value: 100 },
        { year: "2025", value: 72 },
      ],
    },
    {
      branch: "MECH",
      color: "#56647E",
      bars: [
        { year: "2026", value: 90 },
        { year: "2025", value: 83 },
      ],
    },
    {
      branch: "IT",
      color: "#929CAF",
      bars: [
        { year: "2026", value: 100 },
        { year: "2025", value: 74 },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-[12px] p-4 shadow-sm border border-gray-100/50 flex flex-col w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-bold text-[#1F2937]">
            Placement Growth Trend
          </h2>
          <span className="text-[11px] font-semibold text-[#1E305A]">
            (This Year VS Last Year)
          </span>
        </div>
        <CaretRight size={16} className="text-gray-900" />
      </div>

      <div className="flex flex-col gap-3 flex-grow mb-4">
        {chartData.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1">
            {group.bars.map((bar, barIdx) => (
              <div key={barIdx} className="flex items-center w-full">
                <span className="w-10 text-[11px] font-medium text-gray-800">
                  {bar.year}
                </span>

                <div className="flex-1 h-[18px] flex">
                  <div
                    className="h-full rounded-r-[3px] flex items-center justify-end px-1.5"
                    style={{
                      width: `${bar.value}%`,
                      backgroundColor: group.color,
                    }}
                  >
                    <span className="text-white text-[10px] font-semibold tracking-wide">
                      {bar.value}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center px-1 mt-auto">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            {/* Reduced dot size slightly */}
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[11px] font-bold text-gray-800">
              {item.branch}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PrePlacementTalks = () => {
  return (
    <div className="bg-white rounded-[12px] shadow-sm border border-gray-100/50 flex flex-col gap-3 p-3">
      <div className="border border-green-100 rounded-lg overflow-hidden">
        <div className="bg-[#E2F5E9] text-[#22C55E] px-3 py-1.5 flex items-center gap-2 font-medium text-[12px] border-b-[1.5px] border-dotted border-[#86EFAC]">
          <Laptop size={14} weight="fill" /> 8:00 AM - 9:00 AM
        </div>
        <div className="p-3 bg-white">
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-[#22C55E] font-medium text-[14px]">
              TCS Pre-Placement Talk
            </h3>
            <span className="bg-[#22C55E] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
              CSE
            </span>
          </div>

          {/* Compacted vertical list gaps */}
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Education Type :", value: "B.Tech" },
              { label: "Date :", value: "20 Feb 2026" },
              { label: "Total Participants:", value: "20" },
              { label: "Year :", value: "2nd Year" },
              { label: "Section:", value: "A" },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px]">
                <span className="text-gray-500 w-[110px]">{row.label}</span>
                <span className="bg-[#F1F5F9] px-2 py-0.5 rounded-full font-medium text-gray-600 text-[10px]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end">
            <button className="bg-[#1D2B4A] text-white px-4 py-1.5 rounded-full text-[11px] font-semibold hover:bg-[#15213d] transition-colors">
              Join Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UpcomingClasses = () => {
  const classes = [
    {
      title: "B.Tech CSE – Year 4",
      desc: "Session on creating professional resumes and optimizing LinkedIn for recruiters.",
      time: "9:00 Am",
    },
    {
      title: "B.Tech CSE – Year 3",
      desc: "Conducting mock GD rounds and evaluating communication, confidence, and reasoning skills.",
      time: "9:00 Am",
    },
    {
      title: "B.Tech CSE – Year 4",
      desc: "Meeting to align upcoming drive schedule and finalize student eligibility lists.",
      time: "9:00 Am",
    },
  ];

  return (
    <div className="bg-white rounded-[12px] p-4 shadow-sm border border-gray-100/50 flex-grow">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[15px] font-bold text-[#1F2937]">
          Upcoming Classes
        </h2>
        <div className="flex items-center gap-2">
          <button className="bg-[#F1F5F9] p-1 rounded-full text-[#1D2B4A] hover:bg-gray-200 transition-colors">
            <Plus size={14} weight="bold" />
          </button>
          <button className="text-[#1D2B4A] hover:text-gray-600 transition-colors">
            <DotsThreeVertical size={20} weight="bold" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {classes.map((cls, idx) => (
          <div
            key={idx}
            className="bg-[#F1F5F9] rounded-r-md border-l-[3px] border-[#1D2B4A] p-3 relative"
          >
            <h3 className="font-bold text-[#1D2B4A] text-[13px]">
              {cls.title}
            </h3>
            <p className="text-[#64748B] text-[11px] mt-1 leading-[1.35] w-[85%]">
              {cls.desc}
            </p>
            <div className="absolute bottom-2 right-3 text-[#34D399] text-[10px] font-semibold">
              {cls.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function DashboardMain() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-4 bg-[#F3F4F6]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <TopHiringCompanies />
          <BranchPlacementChart />
          <PrePlacementTalks />
        </div>

        <div className="flex flex-col gap-4 h-full">
          <PlacementGrowthChart />
          <UpcomingClasses />
        </div>
      </div>
    </div>
  );
}

import DashboardStats from "./statCards";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 flex flex-col">
      <DashboardStats />

      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg px-3 mt-4">
        <div className="flex items-center gap-4 w-full">
          <div className="flex-shrink-0 w-[68px] h-[68px] bg-[#DEEFE5] rounded-[10px] flex items-center justify-center">
            <img
              src="/calendar-3d.png"
              alt="3D Calendar icon"
              className="w-11 h-11 object-contain drop-shadow-sm"
            />
          </div>

          <p className="text-sm py-4 font-medium text-[#1D2B4A] leading-[1.6] m-0">
            Upcoming Placement Alert – TCS and Infosys drives are happening next
            week. 124 shortlisted students are set to attend the recruitment
            rounds. Please be prepared and check your schedule for details.
          </p>
        </div>
      </div>
      <DashboardMain />
    </div>
  );
}
