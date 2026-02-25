"use client";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import FeeYearDonut from "./components/FeeYearDonut";
import { CaretDown, CaretLeftIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { fetchCollegeBranches } from "@/lib/helpers/admin/collegeBranchAPI";
import FullPageShimmer from "./components/FeeCollectionFullShimmer";
import getBranchYearWiseFinanceSummaryV2 from "@/lib/helpers/finance/dashboard/getBranchYearWisesummary";


const shimmerClass = "relative overflow-hidden bg-gray-200 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

function FeeCollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchType = searchParams.get("branchType");
  const range = searchParams.get("range");
  const branchId = searchParams.get("branchId");
  const educationType = searchParams.get("educationType");
  const educationId = searchParams.get("educationId");
  const { collegeId, collegeEducationId, loading: contextLoading } = useFinanceManager();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>(branchType || "");
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [financeData, setFinanceData] = useState<any>(null);

  const hasInitializedBranch = useRef(false);

  useEffect(() => {
    const getBranches = async () => {
      if (!contextLoading && collegeId && collegeEducationId) {
        try {
          const data = await fetchCollegeBranches(collegeId, collegeEducationId);
          setBranches(data);
          if (!hasInitializedBranch.current && data.length > 0) {
            const initialBranch = branchType || data[0].collegeBranchCode;
            setSelectedBranch(initialBranch);
            hasInitializedBranch.current = true;
          }
        } catch (err) {
          console.error("Failed to fetch branches:", err);
        } finally {
          setIsLoadingBranches(false);
        }
      }
    };
    getBranches();
  }, [collegeId, collegeEducationId, contextLoading, branchType]);

  useEffect(() => {
    const fetchFinance = async () => {
      if (!collegeId || !collegeEducationId || !branchId) {
        console.log("⛔ Skipping finance fetch - Missing Params", {
          collegeId,
          collegeEducationId,
          branchId,
        });
        return;
      }

      console.log("🚀 Fetching Finance Data with:", {
        collegeId,
        collegeEducationId,
        branchId,
        selectedYear: searchParams.get("selectedYear"),
      });

      setIsFetchingData(true);

      try {
        const data = await getBranchYearWiseFinanceSummaryV2({
          collegeId,
          collegeEducationId,
          collegeBranchId: Number(branchId),
          selectedYear: searchParams.get("selectedYear") || "",
        });

        console.log("✅ Finance Data Received:", data);

        setFinanceData(data);
      } catch (err) {
        console.error("❌ Finance fetch error:", err);
      } finally {
        setIsFetchingData(false);
        console.log("🏁 Finance Fetch Completed");
      }
    };

    fetchFinance();
  }, [collegeId, collegeEducationId, branchId]);

  if (isLoadingBranches || contextLoading) {
    return <FullPageShimmer selectedBranch={selectedBranch} />;
  }

  function formatCurrency(value: number = 0) {
    if (value >= 10000000)
      return `${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000)
      return `${(value / 100000).toFixed(2)} L`;
    return value.toLocaleString();
  }

  const handleBranchChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newBranchCode = e.target.value;

    console.log("🔁 Branch changed:", newBranchCode);

    setSelectedBranch(newBranchCode);

    const selected = branches.find(
      (b) => b.collegeBranchCode === newBranchCode
    );

    if (!selected) return;

    // Update URL properly so finance useEffect runs
    router.push(
      `/finance?view=feeCollection&educationType=${educationType}&educationId=${educationId}&branchType=${selected.collegeBranchCode}&branchId=${selected.collegeBranchId}&selectedYear=${searchParams.get("selectedYear")}`
    );
  };

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
              onChange={handleBranchChange}
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
          {isFetchingData ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className={`h-[70px] rounded-lg shadow-sm ${shimmerClass}`} />
            ))
          ) : (
            <>
              <SummaryCard
                value={formatCurrency(financeData?.totalExpected)}
                label="Expected Fee"
              />
              <SummaryCard
                value={formatCurrency(financeData?.totalCollected)}
                label="Collected Fee"
              />
              <SummaryCard
                value={formatCurrency(financeData?.totalPending)}
                label="Pending Fee"
              />
              <SummaryCard
                value={`${financeData?.totalCollectionPercentage || 0}%`}
                label="Collection %"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-4">
        {isFetchingData ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className={`h-[350px] rounded-lg shadow-sm ${shimmerClass}`} />
          ))
        ) : (
          <>

            {financeData?.years?.map((year: any) => (
              <FeeYearDonut
                key={year.academicYearId}
                title={`${selectedBranch} - ${year.academicYear}`}
                percentage={year.collectionPercentage}
                expected={formatCurrency(year.expected)}
                collected={formatCurrency(year.collected)}
                pending={formatCurrency(year.pending)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#EBFFF4] rounded-lg px-6 py-2 flex flex-col justify-center shadow-sm">
      <p className="text-[#43C17A] font-semibold text-lg">{value}</p>
      <p className="text-sm text-gray-700 mt-1">{label}</p>
    </div>
  );
}



export default function FeeCollection() {
  return (
    <Suspense fallback={<div className="p-2"><FullPageShimmer selectedBranch="" /></div>}>
      <FeeCollectionPage />
    </Suspense>
  );
}
