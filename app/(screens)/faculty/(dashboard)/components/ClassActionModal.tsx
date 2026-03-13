import { UpcomingLesson } from "@/lib/helpers/faculty/attendance/getClasses";
import { X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: UpcomingLesson | null;
  onAccept: (id: string) => void;
  onCancelClass: (id: string, reason: string) => void;
}

export const ClassActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  lesson,
  onAccept,
  onCancelClass,
}) => {
  const [step, setStep] = useState<
    "initial" | "confirm_accept" | "cancel_reason"
  >("initial");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep("initial");
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen || !lesson) return null;

  const isAccepted = lesson.sessionStatus === "Accepted";
  const isCancelled = lesson.sessionStatus === "Cancel";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-black">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {step === "initial" && "Add Upcoming Class"}
            {step === "confirm_accept" && "Confirm Acceptance"}
            {step === "cancel_reason" && "Cancel Class"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {step === "initial" && (
          <>
            <div className="px-5 py-4 space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Class Title
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
                  {`${lesson.degree} - Year ${lesson.year} - Section ${lesson.section ?? "N/A"} ${lesson.title}`}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Topic
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
                  {lesson.description || "No topic specified"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Class Date
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
                  {lesson.date || "NULL"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Class Time
                </label>
                <div className="flex gap-3">
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
                    {lesson.fromTime || "NULL"}
                  </div>
                  <p className="pt-1.5">to</p>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
                    {lesson.toTime || "NULL"}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Classroom
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
                  {lesson.roomNo || "NULL"}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 flex gap-3">
              <button
                onClick={() => {
                  if (!isAccepted) setStep("confirm_accept");
                }}
                disabled={isAccepted}
                className={`flex-1 font-medium py-2.5 rounded-md text-sm transition-colors ${
                  isAccepted
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "cursor-pointer bg-[#3FC27B] hover:bg-[#36a86a] text-white"
                }`}
              >
                {isAccepted ? "Accepted" : "Accept"}
              </button>
              <button
                onClick={() => {
                  if (!isCancelled) setStep("cancel_reason");
                }}
                disabled={isCancelled}
                className={`flex-1 font-medium py-2.5 rounded-md text-sm transition-colors ${
                  isCancelled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "cursor-pointer bg-[#FF3B3B] hover:bg-[#e63535] text-white"
                }`}
              >
                {isCancelled ? "Cancelled" : "Cancel Class"}
              </button>
            </div>
          </>
        )}

        {step === "confirm_accept" && (
          <>
            <div className="px-5 py-8 text-center">
              <p className="text-gray-800 font-medium">
                Are you sure you want to accept this class?
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This will officially mark the class as accepted.
              </p>
            </div>
            <div className="px-5 py-4 flex gap-3">
              <button
                onClick={() => onAccept(lesson.id)}
                className="flex-1 cursor-pointer bg-[#3FC27B] hover:bg-[#36a86a] text-white font-medium py-2.5 rounded-md text-sm transition-colors"
              >
                Yes, Accept
              </button>
              <button
                onClick={() => setStep("initial")}
                className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 rounded-md text-sm transition-colors"
              >
                Back
              </button>
            </div>
          </>
        )}

        {step === "cancel_reason" && (
          <>
            <div className="px-5 py-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Reason for Cancellation
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-red-400"
                rows={3}
                placeholder="Enter a reason (Required)..."
                autoFocus
              />
            </div>
            <div className="px-5 py-4 flex gap-3">
              <button
                onClick={() => {
                  if (!reason.trim())
                    return toast.error("Please enter a reason.");
                  onCancelClass(lesson.id, reason);
                }}
                className="flex-1 cursor-pointer bg-[#FF3B3B] hover:bg-[#e63535] text-white font-medium py-2.5 rounded-md text-sm transition-colors"
              >
                Confirm Cancel
              </button>
              <button
                onClick={() => setStep("initial")}
                className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 rounded-md text-sm transition-colors"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
