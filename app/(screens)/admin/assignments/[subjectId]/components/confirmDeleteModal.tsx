"use client";

export default function ConfirmDeleteModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full transform transition-all border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Deletion
          </h3>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Are you sure you want to delete this? This action cannot be undone
            and will permanently remove the Assignment data.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors duration-200"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm shadow-red-200 transition-colors duration-200"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
