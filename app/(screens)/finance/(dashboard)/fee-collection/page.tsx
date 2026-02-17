"use client";

import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import FeeYearDonut from "./components/FeeYearDonut";
import { CaretDown } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FeeCollectionPage() {
  const searchParams = useSearchParams();
  const range = searchParams.get("range");
  console.log("page rendering.")


  return (
    <div className="p-6 bg-[#F3F4F6] min-h-screen">
      <h1 className="text-xl font-semibold text-[#282828] mb-6">
        Fee Collection By Year
      </h1>
      <div className="flex flex-wrap gap-2 items-stretch">
        <div className="bg-white rounded-lg shadow-sm p-2 flex items-center">
          <div className="bg-[#1F2F56] text-white w-[130px] px-2 h-full rounded-md flex items-center justify-between text-2xl font-semibold">
            CSE
            <CaretDown size={20} weight="bold" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
          <SummaryCard value="1.60 Cr" label="Expected Fee" />
          <SummaryCard value="1.52 Cr" label="Collected Fee" />
          <SummaryCard value="0.08 Cr" label="Pending Fee" />
          <SummaryCard value="95%" label="Collection %" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <FeeYearDonut title="CSE - 1st Year" percentage={97} />
        <FeeYearDonut title="CSE - 2nd Year" percentage={75} />
        <FeeYearDonut title="CSE - 3rd Year" percentage={87} />
        <FeeYearDonut title="CSE - 4th Year" percentage={95} />
      </div>

    </div>
  );
}

function SummaryCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="bg-[#EBFFF4] rounded-lg px-6 py-2 flex flex-col justify-center shadow-sm">
      <p className="text-[#43C17A] font-semibold text-lg">
        {value}
      </p>
      <p className="text-sm text-gray-700 mt-1">
        {label}
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6"><Loader /></div>}>
      <FeeCollectionPage />
    </Suspense>
  );
}
