"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FeeStructureCard from "./components/FeeStructureCard";
import AddFeeHeader from "./components/Header";
import CreateFee from "./create-fee";
import FeePageSkeleton from "./FeePageSkeleton";

function FeeContent() {
  const searchParams = useSearchParams();
  const fee = searchParams.get("fee");

  if (fee === "create-fee") {
    return <CreateFee />;
  }

  return (
    <>
      <AddFeeHeader button={true} />
      <FeeStructureCard />
    </>
  );
}

export default function AddFeeStructurePage() {
  return (
    <main className="flex w-full min-h-screen pb-4">
<<<<<<< Updated upstream
      <div className="flex-1 p-2 pr-0 space-y-6">
        <Suspense fallback={<FeePageSkeleton />}>
          <FeeContent />
        </Suspense>
=======
      <div className="flex-1 p-6 space-y-6">
        <AddFeeHeader />
        <FeeStructureCard />
>>>>>>> Stashed changes
      </div>
    </main>
  );
}
