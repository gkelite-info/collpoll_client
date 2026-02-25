"use client";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import FeeYearDonut from "./components/FeeYearDonut";
import { CaretDown, CaretLeftIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { fetchCollegeBranches } from "@/lib/helpers/admin/collegeBranchAPI";

function FeeCollectionPage() {
  const router = useRouter();
  const { collegeId, collegeEducationId, loading: contextLoading } = useFinanceManager();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("CSE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBranches = async () => {
      if (!contextLoading && collegeId && collegeEducationId) {
        try {
          const data = await fetchCollegeBranches(collegeId, collegeEducationId);
          setBranches(data);
          if (data.length > 0) {
            setSelectedBranch(data[0].collegeBranchCode);
          }
        } catch (err) {
          console.error("Failed to fetch branches:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    getBranches();
  }, [collegeId, collegeEducationId, contextLoading]);

  const searchParams = useSearchParams();
  const range = searchParams.get("range");

  if (loading || contextLoading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="p-2 bg-[#F3F4F6] min-h-screen">
      <div className="flex items-center gap-2 lg:mb-3">
        <CaretLeftIcon size={20} weight="bold" className="cursor-pointer text-black active:scale-90" onClick={router.back} />
        <h1 className="text-xl font-semibold text-[#282828] mb-0">
          Fee Collection by Year
        </h1>
      </div>
      <div className="flex flex-wrap gap-1 items-stretch">
        <div className="bg-white rounded-lg shadow-sm p-2 flex items-center">
          <div className="relative bg-[#1F2F56] text-white min-w-[130px] px-3 py-2 rounded-md flex items-center justify-between text-2xl font-semibold">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
              {branches.map((b) => (
                <option key={b.collegeBranchId} value={b.collegeBranchCode} className="text-black text-base">
                  {b.collegeBranchCode}
                </option>
              ))}
            </select>
            <span>{selectedBranch}</span>
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
      <div className="grid md:grid-cols-2 gap-3 mt-4">
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

export default function FeeCollection() {
  return (
    <Suspense fallback={<div className="p-2"><Loader /></div>}>
      <FeeCollectionPage />
    </Suspense>
  );
}
