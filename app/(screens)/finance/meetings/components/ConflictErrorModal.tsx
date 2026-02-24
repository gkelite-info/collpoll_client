"use client";

interface Props {
  open: boolean;
  onClose: () => void;
  conflictDetails: { title: string; role: string } | null; 
}

export default function ConflictErrorModal({ open, onClose, conflictDetails }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-[#1F2937] mb-2">
          Schedule Conflict
        </h3>

        <p className="text-sm text-[#525252] mb-4">
          You already have a meeting scheduled during this time slot.
          <br />
          Please choose a different time to avoid overlaps.
        </p>

        {conflictDetails && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-5">
            <p className="text-xs text-red-800 font-semibold mb-1 uppercase tracking-wider">Conflicting Meeting</p>
            <p className="text-sm text-red-900 mb-0.5"><strong>Title:</strong> {conflictDetails.title}</p>
            <p className="text-sm text-red-900"><strong>Role:</strong> {conflictDetails.role}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 cursor-pointer text-sm rounded-lg bg-[#14234B] text-white hover:bg-[#0f1b3a] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}