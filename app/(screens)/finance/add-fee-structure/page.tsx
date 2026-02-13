'use client'
import { useSearchParams } from "next/navigation";
import FeeStructureCard from "./components/FeeStructureCard";
import AddFeeHeader from "./components/Header";
import CreateFee from "./create-fee";


export default function AddFeeStructurePage() {

  const searchParams = useSearchParams();
  const fee = searchParams.get("fee");

  return (
    <main className="flex w-full min-h-screen pb-4">
      <div className="flex-1 p-2 pr-0 space-y-6">
        {fee === "create-fee" ? (
          <CreateFee />
        ) : (
          <>
            <AddFeeHeader
              button={true}
            />
            <FeeStructureCard />
          </>
        )}
      </div>
    </main>
  );
}
