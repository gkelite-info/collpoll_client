"use client";

import { WarningCircle } from "@phosphor-icons/react";
import type { FinanceCalendarConflict } from "@/lib/helpers/finance/calendar/financeCalendarSectionsAPI";

type ConfirmConflictModalProps = {
  open: boolean;
  message: string;
  conflicts?: FinanceCalendarConflict[];
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmConflictModal({
  open,
  message,
  conflicts = [],
  isConfirming = false,
  onCancel,
  onConfirm,
}: ConfirmConflictModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <WarningCircle size={36} className="text-red-600" weight="fill" />
        </div>

        <h2 className="mb-2 text-xl font-bold text-gray-800">
          Schedule Conflict
        </h2>

        <p className="mb-5 text-sm leading-6 text-gray-500">{message}</p>

        {conflicts.length > 0 ? (
          <div className="mb-6 max-h-72 space-y-3 overflow-y-auto rounded-lg border border-red-100 bg-red-50 p-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Conflicting Events
            </p>

            {conflicts.map((conflict, index) => (
              <div
                key={`${conflict.sourceRole}-${conflict.eventTitle}-${conflict.section}-${index}`}
                className="rounded-lg border border-red-100 bg-white p-3"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-red-950">
                      {conflict.eventTitle}
                    </p>
                    <p className="text-xs text-red-700">
                      {[conflict.sourceRole, conflict.sourceType, conflict.eventTopic]
                        .filter(Boolean)
                        .join(" - ")}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    {conflict.fromTime.slice(0, 5)} -{" "}
                    {conflict.toTime.slice(0, 5)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-red-900">
                  <ConflictField label="Role" value={conflict.sourceRole} />
                  <ConflictField label="Type" value={conflict.sourceType} />
                  <ConflictField label="Education" value={conflict.educationType} />
                  <ConflictField label="Branch" value={conflict.branch} />
                  <ConflictField label="Year" value={conflict.academicYear} />
                  <ConflictField label="Semester" value={conflict.semester} />
                  <ConflictField label="Section" value={conflict.section} />
                  <ConflictField label="Date" value={conflict.date} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Existing Event
            </p>
            <p className="mt-1 text-sm text-red-900">
              This slot already has an active calendar event. You can change the
              time or save this event anyway.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={isConfirming}
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Change Time
          </button>
          <button
            type="button"
            disabled={isConfirming}
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
          >
            {isConfirming ? "Saving..." : "Save Anyway"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ConflictField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
      {label}
    </p>
    <p className="font-medium text-red-950">{value || "-"}</p>
  </div>
);
