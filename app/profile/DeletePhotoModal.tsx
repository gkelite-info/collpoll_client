"use client";
import { Warning } from "@phosphor-icons/react";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export const DeletePhotoModal = ({ isOpen, onClose, onConfirm, isLoading }: DeleteModalProps) => {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-red-50 p-3 rounded-full">
                        <Warning size={40} className="text-red-500" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Profile Photo</h3>
                <p className="text-gray-600 mb-8">Are you sure you want to remove your profile photo?</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 cursor-pointer py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        No, Keep it.
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 cursor-pointer py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Deleting..." : "Yes, Delete !"}
                    </button>
                </div>
            </div>
        </div>
    );
};