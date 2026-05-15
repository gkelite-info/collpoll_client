"use client";

import { Warning } from "@phosphor-icons/react";
import { pendingAlerts } from "./data";

export default function PendingAlertsPanel() {
  return (
    <div className="flex h-[360px] flex-col rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-md font-semibold text-[#282828]">Pending Alerts</h2>
      <div className="custom-scrollbar mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {pendingAlerts.map((alert) => (
          <div key={alert} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Warning
                size={18}
                weight="fill"
                className="mt-0.5 shrink-0 text-[#FFB020]"
              />
              <p className="text-sm leading-relaxed text-[#282828]">
                {alert}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-[#282828]">
              2mins ago
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
