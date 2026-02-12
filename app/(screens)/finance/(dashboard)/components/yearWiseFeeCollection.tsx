"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Tooltip,
} from "recharts";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, FunnelSimple } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";

const RightAlignedLabel = (props: any) => {
  const { y, height, value, viewBox } = props;

  return (
    <text
      x={viewBox.x + viewBox.width + 20}
      y={y + height / 2}
      textAnchor="end"
      dominantBaseline="middle"
      fill="#333"
      fontSize={13}
      fontWeight={500}
    >
      {value}
    </text>
  );
};

export default function YearWiseFeeCollection() {
  const breadcrumb = "CSE → Year-wise Fee Collection";

  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("Semester 1");
  const [academicYear, setAcademicYear] = useState("2026");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const leftChart = [
    { year: "4th yr", collected: 120000, pending: 20000, label: "4-1" },
    { year: "3rd yr", collected: 100000, pending: 15000, label: "3-1" },
    { year: "2nd yr", collected: 115000, pending: 10000, label: "2-1" },
    { year: "1st yr", collected: 110000, pending: 15000, label: "1-1" },
  ];

  const rightChart = [
    { year: "4th yr", collected: 100000, pending: 20000, label: "4-2" },
    { year: "3rd yr", collected: 115000, pending: 10000, label: "3-2" },
    { year: "2nd yr", collected: 90000, pending: 15000, label: "2-2" },
    { year: "1st yr", collected: 120000, pending: 10000, label: "1-2" },
  ];

  const formatAmount = (value: number | string | undefined) => {
    if (typeof value !== "number") return "";
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    return `${(value / 100000).toFixed(1)}L`;
  };

  const initialData = [
    {
      studentName: "Priya Sharma",
      rollNo: "22CSE101",
      department: "CSE",
      year: "3rd Year",
      semester: "Sem 3",
      paidAmount: 30000,
      pendingAmount: 30000,
    },
    {
      studentName: "Rahul Mehta",
      rollNo: "22EEE099",
      department: "CSE",
      year: "3rd Year",
      semester: "Sem 3",
      paidAmount: 60000,
      pendingAmount: 0,
    },
    {
      studentName: "Neha Patel",
      rollNo: "22ME051",
      department: "CSE",
      year: "3rd Year",
      semester: "Sem 3",
      paidAmount: 0,
      pendingAmount: 30000,
    },
  ];

  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Roll No.", key: "rollNo" },
    { title: "Department", key: "department" },
    { title: "Year", key: "year" },
    { title: "Semester", key: "semester" },
    { title: "Paid Amount", key: "paidAmount" },
    { title: "Pending Amount", key: "pendingAmount" },
    { title: "Status", key: "status" },
    { title: "Action", key: "action" },
  ];

  const router = useRouter();

  const processedData = useMemo(() => {
    let data = initialData.filter(
      (item) =>
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        item.rollNo.toLowerCase().includes(search.toLowerCase()),
    );

    data.sort((a, b) => {
      const totalA = a.paidAmount + a.pendingAmount;
      const totalB = b.paidAmount + b.pendingAmount;

      return sortOrder === "asc" ? totalA - totalB : totalB - totalA;
    });

    return data.map((item) => {
      let status: "paid" | "pending" | "partial" = "paid";

      if (item.pendingAmount > 0 && item.paidAmount > 0) status = "partial";
      else if (item.pendingAmount > 0 && item.paidAmount === 0)
        status = "pending";

      return {
        ...item,
        paidAmount: `₹ ${item.paidAmount.toLocaleString()}`,
        pendingAmount: `₹ ${item.pendingAmount.toLocaleString()}`,
        status: (
          <div className="flex items-center gap-2 justify-center">
            <span
              className={`h-3 w-3 rounded-full ${
                status === "paid"
                  ? "bg-green-600"
                  : status === "pending"
                    ? "bg-red-600"
                    : "bg-yellow-500"
              }`}
            />
            <span
              className={
                status === "paid"
                  ? "text-green-600"
                  : status === "pending"
                    ? "text-red-600"
                    : "text-yellow-600"
              }
            >
              {status === "paid"
                ? "Paid"
                : status === "pending"
                  ? "Pending"
                  : "Partial"}
            </span>
          </div>
        ),
        action: (
          <span
            onClick={() => router.push(`/finance/${item.rollNo}`)}
            className="text-[#22A55D] cursor-pointer hover:underline"
          >
            View Details
          </span>
        ),
      };
    });
  }, [search, sortOrder]);

  return (
    <div className="p-6 space-y-6 overflow-x-hidden">
      <h2 className="text-lg font-semibold text-[#43C17A] mb-2">
        {breadcrumb}
      </h2>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg -mb-2 text-[#282828]">
          Fee Collection Trends
        </h3>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-[#282828]">Academic Year</span>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded-full outline-none"
            >
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>
          </div>

          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2 text-[#5A5A5A]">
              <span className="w-3 h-3 bg-[#43C17A] rounded-xs" />
              Collected
            </div>
            <div className="flex items-center gap-2 text-[#5A5A5A]">
              <span className="w-3 h-3 bg-[#B9E6CD] rounded-xs" />
              Pending
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { data: leftChart, colors: ["#43C17A", "#B9E6CD"] },
          { data: rightChart, colors: ["#6C5DD3", "#C7BFFF"] },
        ].map((chart, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md py-4 -px-2">
            <div className="h-90">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chart.data}
                  layout="vertical"
                  barCategoryGap="20%"
                  margin={{ right: 40, left: 15, bottom: 15 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={formatAmount}
                    axisLine={false}
                    tickLine={false}
                    tick={{ dx: 10 }}
                    tickMargin={0}
                  />
                  <YAxis
                    dataKey="year"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <Tooltip
                    formatter={(value) =>
                      typeof value === "number"
                        ? `₹ ${value.toLocaleString()}`
                        : value
                    }
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Bar dataKey="collected" stackId="a" fill={chart.colors[0]} />
                  <Bar dataKey="pending" stackId="a" fill={chart.colors[1]}>
                    {/* <LabelList
                        dataKey="label"
                        position="right"
                        offset={10}
                      /> */}
                    <LabelList
                      dataKey="label"
                      content={<RightAlignedLabel />}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-[#282828]">
          Students Overview
        </h3>

        <div className="flex justify-between items-center">
          <div className="flex items-center bg-[#EAEAEA] rounded-full px-4 py-2 w-[40%]">
            <input
              placeholder="Search by Student Name / Roll No."
              className="bg-transparent outline-none text-sm w-full text-[#282828]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <MagnifyingGlass size={20} className="text-[#22A55D]" />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="bg-[#43C17A1F] text-[#00A94A] cursor-pointer px-3 py-1 rounded-md outline-none"
            >
              <option>Semester 1</option>
              <option>Semester 2</option>
            </select>

            <div
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="bg-[#43C17A1F] cursor-pointer rounded-full p-2"
            >
              <FunnelSimple size={18} className="text-[#00A94A]" />
            </div>
          </div>
        </div>

        <TableComponent
          columns={columns}
          tableData={processedData}
          height="60vh"
        />
      </div>
    </div>
  );
}
