"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import ClubsListShimmer from "../shimmers/ClubsListShimmer";
import toast from "react-hot-toast";
import { getAllClubsAPI } from "@/lib/helpers/clubActivity/adminClubsAPI";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/app/utils/context/UserContext";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { Pagination } from "../../academic-setup/components/pagination";
import { Avatar } from "@/app/utils/Avatar";

interface ClubsListProps {
    onEdit: (id: string) => void;
    onView: (id: string) => void;
}

export default function ClubsList({ onEdit, onView }: ClubsListProps) {
    const { collegeId, loading: userLoading } = useUser();
    const { loading: adminLoading } = useAdmin();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-clubs', collegeId, currentPage, ITEMS_PER_PAGE],
        queryFn: async () => {
            if (!collegeId) throw new Error("No college ID");
            return await getAllClubsAPI(parseInt(collegeId.toString(), 10), currentPage, ITEMS_PER_PAGE);
        },
        enabled: !!collegeId,
    });

    const clubs = data?.data || [];
    const totalItems = data?.total || 0;

    if (isLoading || userLoading || adminLoading) {
        return <ClubsListShimmer />;
    }

    if (isError) {
        toast.error("Failed to load clubs.");
    }

    if (clubs.length === 0) {
        return (
            <div className="flex flex-col items-center pt-20 w-full min-h-[65vh]">
                <p className="text-gray-500 font-medium text-lg">No clubs found. Create one to get started!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-[80vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-24 pt-20 min-h-[80vh] content-start flex-1 mb-16">
                {clubs.map((club) => {
                    return <div key={club.id} className="bg-[#FB800024] rounded-xl flex flex-col items-center px-5 pb-5 pt-[65px] relative h-full">
                        <div className="absolute -top-[55px] w-[150px] h-[150px] rounded-full bg-white border-4 border-white flex items-center justify-center shadow-sm overflow-hidden">
                            <Avatar
                                src={club.logo}
                                alt={club.name}
                                size={150}
                            />
                        </div>
                        <h3 className="text-[#282828] font-bold text-lg mb-4 text-center mt-10">{club.name}</h3>
                        <div className="flex flex-col md:flex-row gap-3 w-full mb-5 mt-auto">
                            <div className="flex-1 bg-[#43C17A2E] text-[#43C17A] text-sm py-2 rounded-md text-center font-bold">
                                Active Users : {club.active}
                            </div>
                            <div className="flex-1 bg-[#FF2A2A2E] text-[#FF2A2A] text-sm py-2 rounded-md text-center font-bold">
                                Inactive Users : {club.inactive}
                            </div>
                        </div>

                        <div className="flex w-full gap-3 mt-auto">
                            <button
                                onClick={() => onView(club.id)}
                                className="flex-1 bg-[#16284F] cursor-pointer text-white h-[45px] rounded-lg text-base font-semibold flex items-center justify-center shadow-sm"
                            >
                                View
                            </button>

                            <button
                                onClick={() => onEdit(club.id)}
                                className={`w-[45px] h-[45px] shrink-0 rounded-full flex items-center justify-center transition-colors shadow-sm ${"bg-[#43C17A] text-white cursor-pointer"
                                    }`}
                            >
                                <PencilSimpleIcon size={20} weight="fill" />
                            </button>
                        </div>
                    </div>
                })}
            </div>
            <div className="w-full mt-auto">
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={(page) => setCurrentPage(page)}
                    alwaysShow={true}
                />
            </div>
        </div>
    );
}