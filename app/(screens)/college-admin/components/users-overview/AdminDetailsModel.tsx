"use client";

import { X } from "@phosphor-icons/react";

interface AdminModalProps {
    admin: any;
    onClose: () => void;
}

export default function AdminModal({ admin, onClose }: AdminModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={onClose}
            style={{ backgroundColor: "#0D0D0D9E" }}
        >
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-[#282828]">Admin Details</h2>
                    <button
                        onClick={onClose}
                        className=" text-gray-600 cursor-pointer transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex gap-3 mb-4 items-center">
                    <div className="w-15 h-15 rounded-full overflow-hidden mb-2">
                        <img
                            src="https://randomuser.me/api/portraits/women/44.jpg"
                            alt="Admin"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm text-[#494949]">Full Name</p>
                        <p className="text-lg font-medium text-[#43C17A]">{admin.name}</p>
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <DetailRow label="Admin ID" value={admin.id} />
                    <DetailRow label="Email" value={admin.email} />
                    <DetailRow label="Phone Number" value={admin.phone} />
                    <DetailRow label="Gender" value={admin.gender} />
                    <DetailRow label="Educational Type" value={admin.education} />
                    <DetailRow label="Branches" value={admin.branch} />
                    <DetailRow label="Faculty" value={admin.faculty} />
                    <DetailRow label="Students" value={admin.student} />
                    <DetailRow label="Parents" value={admin.parent} />
                    <DetailRow label="Finance" value={admin.finance} />
                    <DetailRow label="Placement" value={admin.placement} />
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="grid grid-cols-12">
            <span className="text-[#494949] col-span-4 text-sm">{label} :</span>
            <span className="text-[#282828] col-span-6 font-semibold text-sm">{value}</span>
        </div>
    );
}