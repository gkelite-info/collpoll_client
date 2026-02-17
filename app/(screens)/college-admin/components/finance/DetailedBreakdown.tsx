"use client";

import { useRouter } from "next/navigation";
import TableComponent from "@/app/utils/table/table";
import { CaretRight } from "@phosphor-icons/react";

export default function DetailedBreakdown() {
  const router = useRouter();

  const handleRowClick = (educationType: string) => {
    router.push(
      `/college-admin/institution-management?tab=finance&view=education&type=${educationType}`
    );
  };

  const columns = [
    { title: "Education Type", key: "education" },
    { title: "Branches", key: "branches" },
    { title: "Expected Fee", key: "expected" },
    { title: "Collected", key: "collected" },
    { title: "Pending", key: "pending" },
    { title: "", key: "action" },
  ];

  const data = [
    {
      education: "B Tech",
      branches: "CSE,MECH,ECE",
      expected: "85 L",
      collected: "80 L",
      pending: "5 L",
      action: (
        <div
          onClick={() => handleRowClick("B Tech")}
          className="flex justify-end text-[#9CA3AF] cursor-pointer"
        >
          <CaretRight size={18} />
        </div>
      ),
    },
    {
      education: "Degree",
      branches: "B.com",
      expected: "1.25 Cr",
      collected: "1.22 Cr",
      pending: "3 L",
      action: (
        <div
          onClick={() => handleRowClick("Degree")}
          className="flex justify-end text-[#9CA3AF] cursor-pointer"
        >
          <CaretRight size={18} />
        </div>
      ),
    },
    {
      education: "Polytechnic",
      branches: "Civil",
      expected: "65 L",
      collected: "58 L",
      pending: "7 L",
      action: (
        <div
          onClick={() => handleRowClick("Polytechnic")}
          className="flex justify-end text-[#9CA3AF] cursor-pointer"
        >
          <CaretRight size={18} />
        </div>
      ),
    },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-[15px] font-semibold text-[#282828] mb-4">
        Detailed Breakdown
      </h3>

      <div className=" rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
        <TableComponent columns={columns} tableData={data} height="auto" />
      </div>
    </div>
  );
}
