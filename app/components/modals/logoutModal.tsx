"use client";

export default function ConfirmLogoutModal({
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
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                        <svg
                            className="h-6 w-6 text-orange-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-6l-3-3m3 3l-3 3m3-3H9"
                            />
                        </svg>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">
                        Confirm Logout
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                        Are you sure you want to log out? You will need to sign in again
                        to access your account.
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        className="flex-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors duration-200"
                        onClick={onCancel}
                    >
                        Stay Logged In
                    </button>

                    <button
                        className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm shadow-orange-200 transition-colors duration-200"
                        onClick={onConfirm}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
