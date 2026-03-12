"use client";

interface ConflictDetails {
  title: string;
  role: string;
}

interface ConflictErrorModalProps {
  open: boolean;
  onClose: () => void;
  conflictDetails: ConflictDetails | null;
}

export default function ConflictErrorModal({
  open,
  onClose,
  conflictDetails,
}: ConflictErrorModalProps) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">

        {/* Title */}
        <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
          Schedule Conflict
        </h3>

        {/* Description */}
        <p className="text-sm text-[#525252] mb-5">
          You already have a meeting scheduled during this time slot.
          <br />
          Please choose a different time to avoid overlaps.
        </p>

        {/* Conflict Details */}
        {conflictDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">

            <p className="text-xs font-semibold uppercase tracking-wider text-red-700 mb-2">
              Conflicting Meeting
            </p>

            <p className="text-sm text-red-900">
              <span className="font-semibold">Title:</span>{" "}
              {conflictDetails.title}
            </p>

            <p className="text-sm text-red-900">
              <span className="font-semibold">Role:</span>{" "}
              {conflictDetails.role}
            </p>

          </div>
        )}

        {/* Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[#14234B] text-white text-sm hover:bg-[#0f1b3a] transition-colors cursor-pointer"
          >
            OK
          </button>
        </div>

      </div>
    </div>
  );
}