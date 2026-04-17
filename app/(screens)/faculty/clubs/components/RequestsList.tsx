'use client'
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const USERS = [
    { id: "1", name: "Rohith Sharma", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: "2", name: "Ayaan Reddy", avatar: "https://i.pravatar.cc/150?u=2" },
    { id: "3", name: "Ananya Sharma", avatar: "https://i.pravatar.cc/150?u=3" },
    { id: "4", name: "Sharmila Reddy", avatar: "https://i.pravatar.cc/150?u=4" },
    { id: "5", name: "Aarav Rathod", avatar: "https://i.pravatar.cc/150?u=5" },
    { id: "6", name: "Poojith Goud", avatar: "https://i.pravatar.cc/150?u=6" },
    { id: "7", name: "Vikram Patel", avatar: "https://i.pravatar.cc/150?u=7" },
    { id: "8", name: "Sneha Kapoor", avatar: "https://i.pravatar.cc/150?u=8" },
    { id: "9", name: "Rahul Verma", avatar: "https://i.pravatar.cc/150?u=9" },
    { id: "10", name: "Meera Iyer", avatar: "https://i.pravatar.cc/150?u=10" },
    { id: "11", name: "Karthik Nair", avatar: "https://i.pravatar.cc/150?u=11" },
    { id: "12", name: "Divya Menon", avatar: "https://i.pravatar.cc/150?u=12" },
    { id: "13", name: "Arjun Singh", avatar: "https://i.pravatar.cc/150?u=13" },
    { id: "14", name: "Priya Sharma", avatar: "https://i.pravatar.cc/150?u=14" },
    { id: "15", name: "Nikhil Reddy", avatar: "https://i.pravatar.cc/150?u=15" },
];

export default function RequestsList({ requests, currentFilter }: { requests: any[], currentFilter: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Handlers for modal actions
    const handleRemoveClick = (req: any) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    const handleCancelDelete = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);

        // Simulate an API call delay here (replace with your actual database/Supabase logic)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // You would typically call a prop function here to update the parent component's state
        // e.g., onRemoveRequest(selectedRequest.id);

        setIsDeleting(false);
        setIsModalOpen(false);
        setSelectedRequest(null);
    };
    return (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-[#ffffff] shadow-2xl p-6">
            <div className="mb-6 flex gap-3">
                {["all", "pending", "accepted"].map((filter) => (
                    <Link
                        key={filter}
                        href={`?tab=requests&filter=${filter}`}
                        className={`rounded-full px-6 py-2 text-sm font-semibold capitalize transition-all ${currentFilter === filter
                            ? "bg-[#16284F] text-white"
                            : "bg-[#E7E7E7] text-[#000000]"
                            }`}
                    >
                        {filter}
                    </Link>
                ))}
            </div>

            <h3 className="mb-4 text-sm font-semibold text-gray-500">
                {requests.length} {currentFilter === 'all' ? 'Total' : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Requests
            </h3>

            <div className="flex flex-col gap-4">
                {requests.map((req, index) => (
                    <div key={req.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <Image
                                src={USERS[index].avatar}
                                alt={USERS[index].name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                            />{/* Avatar placeholder */}
                            <div>
                                <h4 className="font-bold text-gray-900">{req.name}</h4>
                                <p className="text-xs text-gray-500">{req.details}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {req.status === "pending" ? (
                                <>
                                    <button
                                        onClick={() => handleRemoveClick(req)}
                                        className="rounded-md bg-[#FF2A2A] cursor-pointer px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600">
                                        Reject
                                    </button>
                                    <button className="rounded-md bg-[#43C17A] cursor-pointer px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500">
                                        Accept
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleRemoveClick(req)}
                                    className="rounded-md bg-[#16284F] cursor-pointer px-5 py-2 text-sm font-semibold text-white">
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmDeleteModal
                open={isModalOpen}
                name={selectedRequest?.name}
                isDeleting={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
}