"use client";
import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FeeStructureCard from "./components/FeeStructureCard";
import AddFeeHeader from "./components/Header";
import CreateFee from "./create-fee";
import FeePageSkeleton from "./FeePageSkeleton";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import { fetchAllFeeStructures } from "@/lib/helpers/finance/feeStructure/academicFee/collegeFeeStructureAPI";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { supabase } from "@/lib/supabaseClient";

function FeeContent() {
  const searchParams = useSearchParams();
  const fee = searchParams.get("fee");
  const { collegeId, collegeEducationId, collegeName, loading: fmLoading } = useFinanceManager();

  const [loading, setLoading] = useState(true);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  const groupedStructures = useMemo(() => {
    const groups: Record<number, any[]> = {};

    sessions.forEach((session) => {
      const bId = session.collegeBranchId;
      if (!bId) return;

      const branchCode = session.college_branch?.collegeBranchCode || "Unknown Branch";

      const existingStruct = feeStructures.find(
        (fs) => fs.sessionId === session.collegeSessionId
      );

      const mergedObj = {
        feeStructureId: existingStruct?.feeStructureId || null,
        collegeId: session.collegeId,
        collegeEducationId: session.collegeEducationId,
        collegeBranchId: bId,
        collegeSessionId: session.collegeSessionId,
        branchId: bId,
        branchName: branchCode,
        sessionName: session.sessionName,
        totalAmount: existingStruct ? existingStruct.totalAmount : (session.totalFeeAmount || 0),
        components: existingStruct ? existingStruct.components : [],
        dueDate: existingStruct ? existingStruct.dueDate : null,
        lateFeePerDay: existingStruct ? existingStruct.lateFeePerDay : 0,
        remarks: existingStruct ? existingStruct.remarks : "",
        isActive: existingStruct ? existingStruct.isActive : true,
      };

      if (!groups[bId]) {
        groups[bId] = [];
      }
      groups[bId].push(mergedObj);
    });

    return Object.values(groups);
  }, [feeStructures, sessions]);

  useEffect(() => {
    const loadData = async () => {
      if (fmLoading || !collegeId) return;
      try {
        setLoading(true);
        const data = await fetchAllFeeStructures(collegeId, collegeEducationId || undefined);
        setFeeStructures(data);

        if (collegeEducationId) {
          const { data: sessionData, error: sessionErr } = await supabase
            .from("college_session")
            .select(`
              collegeSessionId,
              collegeId,
              collegeEducationId,
              collegeBranchId,
              sessionName,
              totalFeeAmount,
              college_branch ( collegeBranchId, collegeBranchCode )
            `)
            .eq("collegeId", collegeId)
            .eq("collegeEducationId", collegeEducationId)
            .eq("is_deleted", false);

          if (sessionErr) throw sessionErr;
          setSessions(sessionData || []);
        } else {
          setSessions([]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load fee structures");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [collegeId, collegeEducationId, fmLoading, fee]);

  const availableYears = useMemo(() => {
    const years = new Set(feeStructures.map((f) => f.academicYear));
    return ["All", ...Array.from(years)];
  }, [feeStructures]);

  const handleDeleteSuccess = (deletedId: number) => {
    setFeeStructures((prev) =>
      prev.filter((s) => s.feeStructureId !== deletedId),
    );
  };

  if (fee === "create-fee") {
    return <CreateFee />;
  }

  if (loading) return <FeePageSkeleton />;

  return (
    <>
      <AddFeeHeader button={true} />

      {feeStructures.length > 0 && (
        <div className="flex justify-end mb-4">
          <div className="relative group">
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"></div>
          </div>
        </div>
      )}

      {groupedStructures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <p className="text-lg font-medium">No fee structures found</p>
          <p className="text-sm mt-1">Create a new fee structure to see it here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedStructures.map((group, index) => (
            <FeeStructureCard
              key={group?.[0]?.feeStructureId || index}
              structures={group}
              collegeName={collegeName || undefined}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ))}
        </div>
      )}
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
