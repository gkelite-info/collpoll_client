"use client";

import FeeCollectionPanel from "./FeeCollectionPanel";
import PendingAlertsPanel from "./PendingAlertsPanel";

export default function FinanceBottomSection() {
  return (
    <section className="mt-2 grid grid-cols-1 items-stretch gap-2 lg:grid-cols-2">
      <FeeCollectionPanel />
      <PendingAlertsPanel />
    </section>
  );
}
