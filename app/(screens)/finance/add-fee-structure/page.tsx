"use client";


import FeeStructureCard from "./compounents/FeeStructureCard";
import AddFeeHeader from "./compounents/Header";


export default function AddFeeStructurePage() {
  return (
    <main className="flex w-full min-h-screen pb-4">
      
          {/* Right Content Area */}
      <div className="flex-1 p-6 space-y-6">
        
        {/* Header */}
        <AddFeeHeader />

        {/* Fee Summary Card */}
        <FeeStructureCard />

      </div>

    </main>
  );
}
