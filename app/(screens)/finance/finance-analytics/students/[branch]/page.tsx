"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  DownloadSimple,
  MagnifyingGlass,
  CaretLeftIcon,
  CurrencyDollarSimpleIcon,
  BuildingApartmentIcon,
  CaretDown,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { downloadCSV } from "@/app/utils/downloadCSV";

const cardsData = [
  {
    style: "bg-[#E2DAFF]",
    icon: <CurrencyDollarSimpleIcon size={24} color="#6C20CA" weight="fill" />,
    value: "12.5 Cr",
    label: "Total Fee Expected",
  },
  {
    style: "bg-[#E6FBEA]",
    icon: <CurrencyDollarSimpleIcon size={24} color="#43C17A" weight="fill" />,
    value: "10.8 Cr",
    label: "Total Collected",
  },
  {
    style: "bg-[#FFE2E2]",
    icon: <CurrencyDollarSimpleIcon size={24} color="#FF0000" weight="fill" />,
    value: "1.2 Cr",
    label: "Pending Students",
  },
  {
    style: "bg-[#CEE6FF]",
    icon: <BuildingApartmentIcon size={24} color="#60AEFF" weight="fill" />,
    value: "86.4%",
    label: "Pending Students",
  },
];

const initialData = [
  {
    branch: "CSE",
    expected: "₹ 15.0 Cr",
    collected: "₹ 13.0 Cr",
    pending: "₹ 2.0 Cr",
    percent: "86%",
  },
  {
    branch: "EEE",
    expected: "₹ 12.0 Cr",
    collected: "₹ 10.0 Cr",
    pending: "₹ 2.0 Cr",
    percent: "83%",
  },
  {
    branch: "IT",
    expected: "₹ 9.0 Cr",
    collected: "₹ 7.0 Cr",
    pending: "₹ 2.0 Cr",
    percent: "78%",
  },
  {
    branch: "ME",
    expected: "₹ 13.0 Cr",
    collected: "₹ 10.0 Cr",
    pending: "₹ 3.0 Cr",
    percent: "77%",
  },
  {
    branch: "CIVIL",
    expected: "₹ 6.0 Cr",
    collected: "₹ 5.0 Cr",
    pending: "₹ 1.0 Cr",
    percent: "83%",
  },
  {
    branch: "ECE",
    expected: "₹ 11.0 Cr",
    collected: "₹ 9.0 Cr",
    pending: "₹ 2.0 Cr",
    percent: "82%",
  },
];

export default function BranchFinanceSummary() {
  const router = useRouter();
  const params = useParams();
  const branchParam = (params?.branch as string)?.toUpperCase();
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const branchOptions = ["All", "CSE", "EEE", "IT", "ME", "CIVIL", "ECE"];
  const yearOptions = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];
  const semesterOptions = [
    "All",
    "Sem 1",
    "Sem 2",
    "Sem 3",
    "Sem 4",
    "Sem 5",
    "Sem 6",
    "Sem 7",
    "Sem 8",
  ];
  const statusOptions = ["All", "paid", "pending", "partial"];

  const filteredData = useMemo(() => {
    return initialData
      .filter((item) =>
        item.branch.toLowerCase().includes(search.toLowerCase()),
      )
      .map((item) => ({
        ...item,
        action: (
          <span
            className="text-[#22A55D] cursor-pointer hover:underline text-sm font-medium"
            onClick={() =>
              router.push(
                `/finance/finance-analytics/students/${branchParam}/${item.branch}`,
              )
            }
          >
            View
          </span>
        ),
      }));
  }, [search, branchParam, router]);

  const handleDownload = () => {
    downloadCSV(initialData, `${branchParam}-finance-summary`);
  };

  const columns = [
    { title: "Branch", key: "branch" },
    { title: "Expected", key: "expected" },
    { title: "Collected", key: "collected" },
    { title: "Pending", key: "pending" },
    { title: "Collection %", key: "percent" },
    { title: "Action", key: "action" },
  ];

  return (
    <div className="p-2 min-h-screen space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <CaretLeftIcon
            size={24}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
          <h2 className="text-2xl font-semibold text-[#282828]">
            Total Finance
          </h2>
        </div>

        <button
          onClick={handleDownload}
          className="bg-[#16284F] text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
        >
          Download Report
          <DownloadSimple size={18} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cardsData.map((card, index) => (
          <CardComponent
            key={index}
            style={card.style}
            icon={card.icon}
            value={card.value}
            label={card.label}
          />
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center bg-[#EAEAEA] rounded-full px-4 py-2 w-[300px] flex-shrink-0">
          <input
            placeholder="Search by Student Name / Roll No."
            className="bg-transparent outline-none text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlass size={24} className="text-[#22A55D]" />
        </div>
        <div className="overflow-x-auto w-full">
          <div className="flex items-center gap-6 min-w-max">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#282828] font-semibold">
                Education Type
              </span>
              <input
                value="B-Tech"
                disabled
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-[#43C17A26] text-center text-[#43C17A] outline-none w-[80px] cursor-not-allowed px-3 py-1 rounded-full text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#282828] font-semibold">
                Branch
              </span>

              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                >
                  {branchOptions.map((o) => (
                    <option key={o} value={o} className="text-left">
                      {o}
                    </option>
                  ))}
                </select>

                <CaretDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#282828] font-semibold">
                  Year
                </span>
                <div className="relative">
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                  >
                    {yearOptions.map((o) => (
                      <option key={o} value={o} className="text-left">
                        {o}
                      </option>
                    ))}
                  </select>

                  <CaretDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#282828] font-semibold">
                  Sem
                </span>
                <div className="relative">
                  <select
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                  >
                    {semesterOptions.map((o) => (
                      <option key={o} value={o} className="text-left">
                        {o}
                      </option>
                    ))}
                  </select>

                  <CaretDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[#282828] font-semibold">
                Status
              </span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                >
                  {statusOptions.map((o) => (
                    <option key={o} value={o} className="text-left">
                      {o}
                    </option>
                  ))}
                </select>

                <CaretDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-2">
        <h3 className="font-semibold text-lg text-[#282828] mb-4">
          Branch-Wise Finance Summary
        </h3>

        <TableComponent
          columns={columns}
          tableData={filteredData}
          height="55vh"
        />
      </div>
    </div>
  );
}
