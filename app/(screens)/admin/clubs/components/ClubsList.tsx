"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import ClubsListShimmer from "../shimmers/ClubsListShimmer";
import toast from "react-hot-toast";
import { getAllClubsAPI } from "@/lib/helpers/clubActivity/adminClubsAPI";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { Pagination } from "../../academic-setup/components/pagination";
import { Avatar } from "@/app/utils/Avatar";

interface ClubsListProps {
    onEdit: (id: string) => void;
    onView: (id: string) => void;
}

export default function ClubsList({ onEdit, onView }: ClubsListProps) {
    const { collegeId } = useUser();
    const [clubs, setClubs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 15;

    useEffect(() => {
        if (!collegeId) return;

        const fetchClubs = async () => {
            try {
                setIsLoading(true);
                const response = await getAllClubsAPI(parseInt(collegeId.toString(), 10), currentPage, ITEMS_PER_PAGE);
                setClubs(response.data);
                setTotalItems(response.total);
            } catch (error) {
                toast.error("Failed to load clubs.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchClubs();
    }, [collegeId, currentPage]);

    if (isLoading) {
        return <ClubsListShimmer />;
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
            {totalItems > 0 && (
                <div className="w-full mt-auto">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}
        </div>
    );
}