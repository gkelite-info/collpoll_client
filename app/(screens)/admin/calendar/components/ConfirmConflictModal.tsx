"use client";

export interface ConflictingSection {
  facultyName: string;
  subjectName: string;
  sectionName: string;
  fromTime: string;
  toTime: string;
}

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  conflictDetails?: ConflictingSection[];
}

export default function ConfirmConflictModal({
  open,
  onConfirm,
  onCancel,
  conflictDetails,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">

        <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
          Schedule Conflict
        </h3>

        <p className="text-sm text-[#525252] mb-5">
          A class is already scheduled for this section during this time slot.
          <br />
          Do you still want to add this event anyway?
        </p>

        {conflictDetails && conflictDetails.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 space-y-3 max-h-60 overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Conflicting Schedule
            </p>
            {conflictDetails.map((c, i) => (
              <div
                key={i}
                className="border-t border-red-100 pt-3 first:border-t-0 first:pt-0"
              >
                <p className="text-sm text-red-900">
                  <span className="font-semibold">Faculty:</span> {c.facultyName}
                </p>
                <p className="text-sm text-red-900">
                  <span className="font-semibold">Subject:</span> {c.subjectName}
                </p>
                <p className="text-sm text-red-900">
                  <span className="font-semibold">Section:</span> {c.sectionName}
                </p>
                <p className="text-sm text-red-900">
                  <span className="font-semibold">Time:</span> {c.fromTime} – {c.toTime}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 cursor-pointer text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 cursor-pointer rounded-lg bg-[#14234B] text-white text-sm hover:bg-[#0f1b3a] transition-colors"
          >
            Confirm Anyway
          </button>
        </div>

      </div>
    </div>
  );
}