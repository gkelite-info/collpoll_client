"use client";

interface Props {
  open: boolean;
  onClose: () => void;
  conflictDetails: {
    title: string;
    role: string;
    fromTime?: string;
    toTime?: string;
  } | null;
  isConfirming?: boolean;
  onConfirm?: () => void;
}

const formatToAMPM = (time?: string) => {
  if (!time) return "";
  const [hourValue, minute = "00"] = time.split(":");
  let hour = Number(hourValue);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
};

export default function ConflictErrorModal({
  open,
  onClose,
  conflictDetails,
  isConfirming = false,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-10000 bg-black/50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
          Schedule Conflict
        </h3>

        <p className="text-sm text-[#525252] mb-4">
          You already have a meeting scheduled during this time slot.
          <br />
          Please choose a different time, or schedule anyway if this meeting is urgent.
        </p>

        {conflictDetails && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-5">
            <p className="text-xs text-red-800 font-semibold mb-1 uppercase tracking-wider">Conflicting Meeting</p>
            <p className="text-sm text-red-900 mb-0.5"><strong>Title:</strong> {conflictDetails.title}</p>
            <p className="text-sm text-red-900"><strong>Role:</strong> {conflictDetails.role}</p>
            {conflictDetails.fromTime && conflictDetails.toTime && (
              <p className="text-sm text-red-900 mt-0.5">
                <strong>Time:</strong> {formatToAMPM(conflictDetails.fromTime)} - {formatToAMPM(conflictDetails.toTime)}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="px-6 py-2 cursor-pointer text-sm rounded-lg bg-gray-100 text-[#282828] hover:bg-gray-200 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            Change Time
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={isConfirming}
              className="px-6 py-2 cursor-pointer text-sm rounded-lg bg-[#14234B] text-white hover:bg-[#0f1b3a] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConfirming ? "Scheduling..." : "Schedule Anyway"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
