export function ConfirmStatusModal({
  isOpen,
  action,
  onClose,
  onConfirm,
}: any) {
  if (!isOpen) return null;
  const isApprove = action === "Approved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-3">
        <h3 className="text-lg font-bold text-gray-800">
          Confirm {isApprove ? "Approval" : "Rejection"}
        </h3>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          Are you sure you want to {isApprove ? "approve" : "reject"} this leave
          request?
        </p>
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors cursor-pointer ${
              isApprove
                ? "bg-[#43C17A] hover:bg-[#3ba869]"
                : "bg-[#FF4B4B] hover:bg-[#e64343]"
            }`}
          >
            Yes, {action}
          </button>
        </div>
      </div>
    </div>
  );
}
