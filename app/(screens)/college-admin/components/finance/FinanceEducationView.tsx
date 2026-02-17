"use client";

import { useSearchParams } from "next/navigation";
import CardComponent from "@/app/utils/card";
import { CaretDown, CaretRight, CurrencyDollarSimple, Student } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import FinanceEducationCharts from "./FinanceEducationCharts";
import { useRouter } from "next/navigation";


export default function FinanceEducationView() {
  const sp = useSearchParams();
  const router = useRouter();

  const educationType = sp.get("type") ?? "B Tech";
  const selectedBranch = "CSE";
  const selectedAcademicYear = "2026";

  const columns = [
    { title: "Branch", key: "branch" },
    { title: "Expected", key: "expected" },
    { title: "Collected", key: "collected" },
    { title: "Pending", key: "pending" },
    { title: "Collection %", key: "collection" },
    { title: "", key: "action" },
  ];

  const tableData = [
    { branch: "CSE", year: "1st Year", expected: "45 L", collected: "42 L", pending: "3 L", collection: "93%",  action: (
      <div
        className="flex justify-end cursor-pointer"
        onClick={() =>
          router.push(
            `/college-admin/institution-management?tab=finance&view=students&type=${educationType}&branch=CSE`
          )
        }
      >
        <CaretRight
          size={16}
          weight="bold"
          className="text-[#9CA3AF] hover:text-[#1E7745] transition"
        />
      </div>
    ), },
    { branch: "CSE", year: "1st Year", expected: "45 L", collected: "42 L", pending: "3 L", collection: "93%",   action: (
      <div
        className="flex justify-end cursor-pointer"
        onClick={() =>
          router.push(
 `/college-admin/institution-management?tab=finance&view=students&type=${educationType}&branch=CSE`
          )
        }
      >
        <CaretRight
          size={16}
          weight="bold"
          className="text-[#9CA3AF] hover:text-[#1E7745] transition"
        />
      </div>
    ), },
    { branch: "CSE", year: "2nd Year", expected: "45 L", collected: "42 L", pending: "3 L", collection: "93%", action: (
      <div
        className="flex justify-end cursor-pointer"
        onClick={() =>
          router.push(
            `/college-admin/institution-management?tab=finance&view=students&type=${educationType}&branch=CSE`
          )
        }
      >
        <CaretRight
          size={16}
          weight="bold"
          className="text-[#9CA3AF] hover:text-[#1E7745] transition"
        />
      </div>
    ), },
    { branch: "CSE", year: "3rd Year", expected: "45 L", collected: "42 L", pending: "3 L", collection: "93%", action: (
      <div
        className="flex justify-end cursor-pointer"
        onClick={() =>
          router.push(
            `/college-admin/institution-management?tab=finance&view=students&type=${educationType}&branch=CSE`
          )
        }
      >
        <CaretRight
          size={16}
          weight="bold"
          className="text-[#9CA3AF] hover:text-[#1E7745] transition"
        />
      </div>
    ), },
    { branch: "CSE", year: "4th Year", expected: "45 L", collected: "42 L", pending: "3 L", collection: "93%",  action: (
      <div
        className="flex justify-end cursor-pointer"
        onClick={() =>
          router.push(
            `/college-admin/institution-management?tab=finance&view=students&type=${educationType}&branch=CSE`
          )
        }
      >
        <CaretRight
          size={16}
          weight="bold"
          className="text-[#9CA3AF] hover:text-[#1E7745] transition"
        />
      </div>
    ), },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 mb-4 text-base font-regular text-[#6B7280]">
        <div className="flex items-center gap-2">
          <span>Education Type :</span>
          <span className="bg-[#43C17A1C] text-[#1E7745] px-3 py-1 rounded-full">
            {educationType}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>Branch :</span>
          <span className="bg-[#43C17A1C] text-[#43C17A;] px-3 py-1 rounded-full flex items-center gap-1">
            {selectedBranch}
            <CaretDown size={14} weight="bold" />
          </span>

        </div>

        <div className="flex items-center gap-2">
          <span>Academic Year :</span>
          <span className="bg-[#43C17A1C] text-[#43C17A;] px-3 py-1 rounded-full flex items-center gap-1">
            {selectedAcademicYear}
            <CaretDown size={14} weight="bold" />
          </span>
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        <CardComponent
          style="bg-[#E2DAFF] w-[183px] h-[127px] rounded-[8px]"
          icon={<CurrencyDollarSimple size={18} weight="fill" />}
          value={educationType}
          label="Education Type"
          iconBgColor="#FFFFFF"
          iconColor="#7B61FF"
        />

        <CardComponent
          style="bg-[#FFEDDA] w-[183px] h-[127px] rounded-[8px]"
          icon={<CurrencyDollarSimple size={18} weight="fill" />}
          value="4.8 Cr"
          label="Total Expected"
          iconBgColor="#FFFFFF"
          iconColor="#F59E0B"
        />

        <CardComponent
          style="bg-[#E6FBEA] w-[183px] h-[127px] rounded-[8px] shadow-[0_3.79px_7.39px_rgba(0,0,0,0.05)]"
          icon={<CurrencyDollarSimple size={18} weight="fill" />}
          value="4.3 Cr"
          label="Collected"
          iconBgColor="#FFFFFF"
          iconColor="#22C55E"
        />

        <CardComponent
          style="bg-[#CEE6FF] w-[183px] h-[127px] rounded-[8px] shadow-[0_3.79px_7.39px_rgba(0,0,0,0.05)]"
          icon={<CurrencyDollarSimple size={18} weight="fill" />}
          value="₹0.5 Cr"
          label="Pending"
          iconBgColor="#FFFFFF"
          iconColor="#3B82F6"
        />

        <CardComponent
          style="bg-[#FFEDDA] w-[183px] h-[127px] rounded-[8px] shadow-[0_3.79px_7.39px_rgba(0,0,0,0.05)]"
          icon={<Student size={18} weight="fill" />}
          value="4,200"
          label="Total Students"
          iconBgColor="#FFFFFF"
          iconColor="#F59E0B"
        />
      </div>
      <FinanceEducationCharts />
      <div className="mt-4  rounded-lg overflow-hidden">
        <TableComponent columns={columns} tableData={tableData} height="auto" />
      </div>
    </div>
  );
}
