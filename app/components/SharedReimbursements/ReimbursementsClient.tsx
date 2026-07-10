"use client";

import { useState } from "react";
import ReimbursementDetailsModal from "./components/ReimbursementDetailsModal";
import ReimbursementsList from "./components/ReimbursementsList";
import SubmitReimbursement from "./components/SubmitReimbursement";

export default function ReimbursementsClient() {
  const [mode, setMode] = useState<"list" | "form">("list");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (mode === "form") {
    return <SubmitReimbursement onBack={() => setMode("list")} />;
  }

  return (
    <>
      <ReimbursementsList
        onCreate={() => setMode("form")}
        onViewDetails={() => setIsDetailsOpen(true)}
      />

      {isDetailsOpen && (
        <ReimbursementDetailsModal onClose={() => setIsDetailsOpen(false)} />
      )}
    </>
  );
}
