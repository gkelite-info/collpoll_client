"use client";
import StudentClubsListShimmer from "../shimmers/StudentClubsListShimmer";
import toast from "react-hot-toast";
import { getAllClubsAPI } from "@/lib/helpers/clubActivity/adminClubsAPI";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { Avatar } from "@/app/utils/Avatar";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useRouter } from "next/navigation";
import { encryptId } from "@/app/utils/encryption";


export default function AllClubsGrid() {
    const { collegeId } = useUser();
    const [clubs, setClubs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 15;
    const router = useRouter();

    useEffect(() => {
        if (!collegeId) return

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await getAllClubsAPI(
                    parseInt(collegeId.toString(), 10),
                    currentPage,
                    ITEMS_PER_PAGE
                );
                setClubs(response.data);
                setTotalItems(response.total);

            } catch (error) {
                toast.error("Failed to load clubs.", { id: "fetch-clubs-error" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [collegeId, currentPage]);


    if (isLoading) {
        return <StudentClubsListShimmer />;
    }

    if (clubs.length === 0) {
        return (
            <div className="flex flex-col items-center pt-20 w-full min-h-[65vh]">
                <p className="text-gray-500 font-medium text-lg">No clubs found at the moment.</p>
            </div>
        );
    }
    return (
        <div className="flex flex-col w-full min-h-[80vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-24 pt-16 content-start animate-in fade-in duration-500">
                {clubs.map((club) => {
                    return (
                        <div key={club.id} className="bg-[#FB8000]/10 rounded-2xl flex flex-col items-center px-5 pb-5 pt-[70px] relative">
                            <div className="absolute -top-[60px] w-[140px] h-[140px] rounded-full bg-white border-4 border-white flex items-center justify-center shadow-md overflow-hidden">
                                <Avatar
                                    src={club.logo}
                                    alt={club.name}
                                    size={150}
                                />
                            </div>

                            <h3 className="text-[#282828] font-bold text-lg mb-4 text-center mt-8">{club.name}</h3>

                            <div className="flex gap-3 w-full mb-6 mx-auto">
                                <div className="flex-1 bg-[#43C17A]/20 text-[#43C17A] text-[12px] py-2 rounded-md text-center font-bold">
                                    Active Users: {club.active || 0}
                                </div>
                                <div className="flex-1 bg-[#FF2A2A]/20 text-[#FF2A2A] text-[12px] py-2 rounded-md text-center font-bold">
                                    Inactive Users: {club.inactive || 0}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const encryptedId = encryptId(club.id);
                                    const encryptedActive = encryptId(club.active || 0);
                                    const encryptedInactive = encryptId(club.inactive || 0);
                                    router.push(`?clubId=${encryptedId}&act=${encryptedActive}&inact=${encryptedInactive}`);
                                }}
                                className="w-full cursor-pointer text-[#ffffff] bg-[#43C17A] py-3 rounded-xl text-base font-bold transition-all shadow-lg"
                            >
                                View Club
                            </button>
                        </div>
                    );
                })}
            </div>
            {totalItems > 0 && (
                <div className="w-full mt-auto pt-8">
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