"use client";

import { useEffect, useRef, useState } from "react";

export default function ConfirmDeleteModal({
    open,
    title,
    description,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onCancel();
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, onCancel]);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div
                ref={modalRef}
                className="bg-white rounded-lg w-full max-w-sm p-5"
            >
                <h3 className="text-base font-semibold text-[#282828] mb-2">
                    {title}
                </h3>

                {description && (
                    <p className="text-sm text-[#525252] mb-4">{description}</p>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-1.5 cursor-pointer rounded-md text-sm border border-[#CCCCCC] text-[#525252]"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="px-4 py-1.5 cursor-pointer rounded-md text-sm bg-red-500 text-white"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
