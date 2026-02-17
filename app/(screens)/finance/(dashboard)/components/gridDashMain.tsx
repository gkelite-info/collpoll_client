import {
  Calendar,
  CalendarCheck,
  CaretDown,
  CaretRight,
  CaretRightIcon,
  CurrencyInr,
  UsersThree,
} from "@phosphor-icons/react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SendFeeReminderModal } from "../modals/sendFeeReminderModal";
import { useRouter, useSearchParams } from "next/navigation";
import YearWiseFeeCollection from "./yearWiseFeeCollection";
import BranchWiseCollection from "./branchWiseCollection";
import { PaymentSuccessModal } from "../modals/paymentSuccessModal";

// --- Types & Data ---

interface Data {
  years: {
    year: string;
    total: string;
    sem1: string;
    sem2: string;
  }[];
  collection: { label: string; val: string }[];
  trend: { name: string; value: number }[];
  insights: { label: string; val: string; icon: any }[];
}

const data: Data = {
  years: [
    {
      year: "1st Year",
      total: "24,20,000",
      sem1: "12,40,0000",
      sem2: "11,80,0000",
    },
    {
      year: "2nd Year",
      total: "24,20,000",
      sem1: "12,40,0000",
      sem2: "11,80,0000",
    },
    {
      year: "3rd Year",
      total: "24,20,000",
      sem1: "12,40,0000",
      sem2: "11,80,0000",
    },
    {
      year: "4th Year",
      total: "24,20,000",
      sem1: "12,40,0000",
      sem2: "11,80,0000",
    },
  ],
  collection: [
    { label: "1st Year", val: "24.2 L" },
    { label: "2nd Year", val: "26.8 L" },
    { label: "3rd Year", val: "25.4 L" },
    { label: "4th Year", val: "25.4 L" },
  ],
  trend: [
    { name: "1st Year", value: 25.2 },
    { name: "2nd Year", value: 30.2 },
    { name: "3rd Year", value: 25.0 },
    { name: "4th Year", value: 25.0 },
  ],
  insights: [
    { label: "This Week", val: "3.2L", icon: CalendarCheck },
    { label: "last Week", val: "4.8L", icon: Calendar },
    { label: "This Month", val: "14.6L", icon: Calendar },
    { label: "This Year", val: "1.03 Cr", icon: Calendar },
  ],
};

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-lg shadow-sm p-3 border border-gray-100 ${className}`}
  >
    {children}
  </div>
);

const Header = () => (
  <div className="flex justify-between items-center mb-3 px-1">
    <h1 className="text-[#1e293b] text-base font-bold">B Tech - CSE - 2026</h1>
    <div className="flex gap-3 text-[10px] font-semibold text-gray-500">
      <Dropdown label="Education Type" value="B Tech" />
      <Dropdown label="Branch" value="CSE" />
      <Dropdown label="Year" value="2026" />
    </div>
  </div>
);

const Dropdown = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-xs">{label}</span>
    <div className="bg-green-50 text-[#43C17A] px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-green-100">
      {value} <CaretDown weight="bold" />
    </div>
  </div>
);

const TopStat = ({
  icon: Icon,
  val,
  label,
  theme,
  onClick,
}: {
  icon: any;
  val: string;
  label: string;
  theme: "purple" | "blue";
  onClick?: () => void;
}) => {
  const isP = theme === "purple";

  return (
    <div
      onClick={onClick}
      className={`
        ${isP ? "bg-[#6d28d9] text-white" : "bg-[#dbeafe] text-[#1e40af]"}
        p-3 rounded-lg flex flex-col justify-between h-full min-h-[90px]
        ${onClick ? "cursor-pointer hover:opacity-90 transition" : ""}
      `}
    >
      <div
        className={`w-7 h-7 rounded ${isP ? "bg-white/20" : "bg-white"
          } flex items-center justify-center mb-2`}
      >
        <Icon
          size={16}
          weight="fill"
          className={isP ? "text-white" : "text-[#2563eb]"}
        />
      </div>

      <div>
        <div className="text-lg font-bold leading-tight">{val}</div>
        <div
          className={`text-[10px] font-medium ${isP ? "text-purple-200" : "text-blue-800/70"
            }`}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

type YearData = {
  year: string;
  total: string;
  sem1: string;
  sem2: string;
};

const YearCard = ({ data }: { data: YearData }) => (
  <Card className="h-full flex flex-col justify-center gap-2">
    <div className="flex justify-between items-center">
      <div className="font-medium text-gray-800 text-sm">{data.year}</div>

      <div className="text-right">
        <span className="text-[8px] text-[#282828] uppercase font-semibold mr-2">
          Total
        </span>

        <span className="bg-[#1e293b] text-white px-1.5 py-0.5 rounded-full text-[9px] font-medium">
          ₹{data.total}
        </span>
      </div>
    </div>

    <div className="flex gap-2">
      <SemBox label="Sem 1" val={data.sem1} />
      <SemBox label="Sem 2" val={data.sem2} />
    </div>
  </Card>
);

const SemBox = ({ label, val }: { label: string; val: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "semwise");
    params.set("semester", label);
    router.push(`?${params.toString()}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[#E5F6EC] py-1.5 px-2 rounded flex-1 cursor-pointer"
    >
      <div className="text-xs  text-[#282828]">{label}</div>
      <div className="text-xs font-bold text-[#43C17A]">₹ {val}</div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFeeCollection = () => {
    router.push('/finance/fee-collection');
    return
  }

  return (
    <div className="min-h-screenflex justify-center font-sans text-gray-900">
      <div className="w-full">
        <Header />

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 flex flex-col gap-3">
            <div className="h-[95px]">
              <TopStat
                icon={UsersThree}
                val="2,450"
                label="Overall Students"
                theme="purple"
                onClick={() =>
                  router.push("/finance/finance-analytics/students")
                }
              />
            </div>
            <div className="h-[95px]">
              <TopStat
                icon={CurrencyInr}
                val="24,00,000"
                label="Overall Finance"
                theme="blue"
              />
            </div>
          </div>

          <div className="col-span-9 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-3">
              <div className="h-[95px]">
                <YearCard data={data.years[0]} />
              </div>
              <div className="h-[95px]">
                <YearCard data={data.years[2]} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-[95px]">
                <YearCard data={data.years[1]} />
              </div>
              <div className="h-[95px]">
                <YearCard data={data.years[3]} />
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <Card className="h-[220px] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ fontSize: 11, fontWeight: "700", color: "#282828" }}>
                  Fee Collection by year
                </h3>
                <CaretRightIcon size={16} weight="bold" className="cursor-pointer" onClick={handleFeeCollection} />
              </div>
              <div className="flex-1 space-y-2">
                {data.collection.map((d, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[10px]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="font-medium text-gray-600">
                        {d.label}
                      </span>
                    </div>
                    <span className="font-bold text-green-600 font-mono">
                      ₹{d.val}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-[#E5F6EC] px-2 py-1.5 rounded mt-2 flex justify-between items-center">
                <span className="font-bold text-gray-700 text-[10px]">
                  Total
                </span>
                <p className="bg-[#1e293b] text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                  ₹ 24,20,000
                </p>
              </div>
            </Card>
          </div>

          {/* Trend Chart (Span 6) */}
          <div className="col-span-5">
            <Card className="h-[220px] flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-xs font-bold text-gray-800 mb-2">
                  Collection Trend Overview
                </h3>
                <CaretRight
                  size={20}
                  className="cursor-pointer"
                  onClick={() => router.push("/finance/finance-analytics")}
                />
              </div>

              <div className="flex-1 w-full text-[9px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.trend}
                    margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                    barSize={28}
                  >
                    <defs>
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#43C17A" />
                        <stop offset="100%" stopColor="#205B3A" />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                      dy={5}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 9 }}
                      tickFormatter={(v) => `${v}L`}
                      ticks={[0, 10, 20, 30]}
                      domain={[0, 35]}
                    />

                    <ReferenceLine
                      y={30}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />

                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        fontSize: "10px",
                        padding: "4px",
                        borderRadius: "4px",
                      }}
                      formatter={(val) => [`₹ ${val}L`, ""]}
                    />

                    <Bar
                      dataKey="value"
                      fill="url(#barGradient)"
                      radius={[3, 3, 0, 0]}
                    >
                      <LabelList
                        dataKey="value"
                        position="top"
                        fill="#64748b"
                        fontSize={9}
                        formatter={(v: any) => `${v}L`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="col-span-4">
            <Card className="h-[220px]">
              <h3 className="text-xs font-bold text-gray-800 mb-3">
                Quick Insights
              </h3>
              <div className="space-y-2">
                {data.insights.map((d, i) => (
                  <div
                    key={i}
                    className="bg-[#E5F6EC] p-2 rounded flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#609872] flex items-center justify-center text-white">
                        <d.icon weight="fill" size={10} />
                      </div>
                      <span className="font-semibold text-gray-700 text-xs">
                        {d.label}
                      </span>
                    </div>
                    <span className="font-bold text-[#43C17A] text-xs">
                      ₹ {d.val}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="col-span-3">
            <div className="bg-[#E5F6EC] p-3 rounded-lg border border-green-50 h-[120px] flex flex-col justify-center">
              <h4 className="font-bold text-gray-800 text-xs mb-1">
                Overall Pending
              </h4>
              <p className="text-[10px] text-[#282828] mb-3 leading-3 w-3/4">
                Total unpaid fees across all students
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-[#43C17A]">₹</span>
                <span className="text-2xl font-bold text-[#43C17A]">8.2 L</span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-[#E5F6EC] p-3 rounded-lg border border-green-50 h-[120px] flex flex-col justify-center">
              <h4 className="font-bold text-gray-800 text-xs mb-1">
                Current Semester
              </h4>
              <p className="text-[10px] text-[#282828] mb-3 leading-3 w-3/4">
                Students yet to complete payment
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#43C17A]">320</span>
                <span className="text-[10px] font-bold text-[#43C17A]">
                  Students
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-6">
            <Card className="h-[120px] flex flex-col items-center justify-center text-center py-2">
              <h3 className="text-xs font-bold text-gray-800 mb-1">
                Payment Reminder
              </h3>
              <p className="text-[#43C17A] text-[10px] font-medium mb-3">
                Send automated payment alerts to pending students & parents
              </p>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("view", "PaymentReminder");
                  router.push(`?${params.toString()}`);
                }}
                className="bg-[#1e293b] cursor-pointer text-white px-5 py-2 rounded-full font-bold text-[10px] hover:bg-[#334155] transition-colors shadow-sm"
              >
                Send Reminder
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
