"use client";

import FinanceDashLeft from "./components/left";
import FinanceDashRight from "./components/right";
<<<<<<< Updated upstream
import { useSearchParams } from "next/navigation";
import BranchWiseCollection from "./components/branchWiseCollection";
import YearWiseFeeCollection from "./components/yearWiseFeeCollection";
import { Suspense } from "react";
import PaymentReminder from "./components/paymentReminderPage";

export function DashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  if (view === "branchWiseCollection") {
    return (
      <div className="w-full p-2">
        <BranchWiseCollection />
      </div>
    );
  }

  if (view === "yearWiseCollection") {
    return <YearWiseFeeCollection />;
  }

  if (view === "PaymentReminder") {
    return <PaymentReminder />;
  }

=======
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";

export default function DashboardPage() {

  const { financeManagerId, userId, loading } = useFinanceManager();

  if (loading) {
    return null;
  }

  console.log("What is finance mana", financeManagerId, userId);

>>>>>>> Stashed changes
  return (
    <main className="flex w-full min-h-screen pb-4">
      <FinanceDashLeft />
      <FinanceDashRight />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
