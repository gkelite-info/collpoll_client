"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CaretDown, Funnel } from "@phosphor-icons/react";
import FeeStructureCard from "./components/FeeStructureCard";
import AddFeeHeader from "./components/Header";
import CreateFee from "./create-fee";
import FeePageSkeleton from "./FeePageSkeleton";
import { useUser } from "@/app/utils/context/UserContext";
import { getFinanceCollegeStructure } from "@/lib/helpers/finance/financeManagerContextAPI";
import { fetchAllFeeStructures } from "@/lib/helpers/finance/feeStructure/collegeFeeComponentsAPI";
import toast from "react-hot-toast";

function FeeContent() {
  const searchParams = useSearchParams();
  const fee = searchParams.get("fee");
  const { userId } = useUser();

  const [loading, setLoading] = useState(true);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [collegeDetails, setCollegeDetails] = useState<any>(null);

  // Filtering State

  // Group structures by Branch ID
  const groupedStructures = useMemo(() => {
    const groups: Record<number, any[]> = {};

    feeStructures.forEach((struct) => {
      const bId = struct.branchId;
      if (!groups[bId]) {
        groups[bId] = [];
      }
      groups[bId].push(struct);
    });

    // Convert to array for mapping
    return Object.values(groups);
  }, [feeStructures]);

  // 1. Load Data
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const collegeData = await getFinanceCollegeStructure(userId);
        setCollegeDetails(collegeData);

        if (collegeData.collegeId) {
          const data = await fetchAllFeeStructures(collegeData.collegeId);
          setFeeStructures(data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load fee structures");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId, fee]);

  // 2. Extract Unique Years for Dropdown
  const availableYears = useMemo(() => {
    const years = new Set(feeStructures.map((f) => f.academicYear));
    return ["All", ...Array.from(years)];
  }, [feeStructures]);

  // --- RENDER ---

  if (fee === "create-fee") {
    return <CreateFee />;
  }

  if (loading) return <FeePageSkeleton />;

  return (
    <>
      <AddFeeHeader button={true} />

      {/* FILTER BAR */}
      {feeStructures.length > 0 && (
        <div className="flex justify-end mb-4">
          <div className="relative group">
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"></div>
          </div>
        </div>
      )}

      {/* CARDS LIST */}

      <div className="space-y-6">
        {groupedStructures.map((group) => (
          <FeeStructureCard
            key={group[0].branchId}
            structures={group}
            collegeName={collegeDetails?.collegeName}
          />
        ))}
      </div>
    </>
  );
}

export default function AddFeeStructurePage() {
  return (
    <main className="flex w-full min-h-screen pb-4">
      <div className="flex-1 p-2 pr-0 space-y-6">
        <Suspense fallback={<FeePageSkeleton />}>
          <FeeContent />
        </Suspense>
      </div>
    </main>
  );
}
