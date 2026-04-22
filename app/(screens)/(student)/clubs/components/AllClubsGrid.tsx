"use client";
import StudentClubsListShimmer from "../shimmers/StudentClubsListShimmer";
import toast from "react-hot-toast";
import { getAllClubsAPI } from "@/lib/helpers/clubActivity/adminClubsAPI";
import { joinClubAPI, getStudentClubStatusAPI } from "@/lib/helpers/clubActivity/studentClubAPI";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { Avatar } from "@/app/utils/Avatar";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useRouter } from "next/navigation";

export default function AllClubsGrid() {
    const { collegeId, studentId } = useUser();
    const [clubs, setClubs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 15;

    const [joiningClubId, setJoiningClubId] = useState<string | null>(null);
    const [activeClubId, setActiveClubId] = useState<string | null>(null);
    const [activeClubStatus, setActiveClubStatus] = useState<string | null>(null);
    const router = useRouter()

    useEffect(() => {
        if (!collegeId || !studentId) return

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const clubsPromise = getAllClubsAPI(parseInt(collegeId.toString(), 10), currentPage, ITEMS_PER_PAGE);
                let statusPromise = Promise.resolve({ requestedClubId: null, status: null });
                if (studentId) {
                    statusPromise = getStudentClubStatusAPI(parseInt(studentId.toString(), 10));
                }
                const [response, statusRes] = await Promise.all([clubsPromise, statusPromise]);
                setClubs(response.data);
                setTotalItems(response.total);

                if (statusRes.requestedClubId) {
                    setActiveClubId(statusRes.requestedClubId);
                    setActiveClubStatus(statusRes.status);
                } else {
                    setActiveClubId(null);
                    setActiveClubStatus(null);
                }
            } catch (error) {
                // toast.error("Failed to load clubs or status."); {toast two times coming when api failed}
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [collegeId, currentPage, studentId]);

    const handleJoinClick = async (clubId: string) => {
        if (!studentId) {
            toast.error("Student ID is missing. Cannot send request.");
            return;
        }
        setJoiningClubId(clubId);
        try {
            await joinClubAPI(parseInt(clubId, 10), parseInt(studentId.toString(), 10));
            toast.success("Join request sent successfully!");
            setActiveClubId(clubId);
            setActiveClubStatus("pending");

        } catch (error: any) {
            toast.error(error.message || "Failed to send request. Please try again.");
        } finally {
            setJoiningClubId(null);
        }
    };

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
                    const isAlreadyInAClub = activeClubStatus === "accepted";
                    const isPendingForAClub = activeClubStatus === "pending";
                    const isThisClubTheActiveOne = activeClubId === club.id.toString();
                    const isCurrentlyJoining = joiningClubId === club.id.toString();

                    const isButtonDisabled =
                        joiningClubId !== null ||
                        isPendingForAClub ||
                        (isAlreadyInAClub && !isThisClubTheActiveOne);

                    let buttonText = "Join Club";
                    if (isCurrentlyJoining) buttonText = "Sending Request...";
                    else if (isThisClubTheActiveOne && isPendingForAClub) buttonText = "Pending";
                    else if (isThisClubTheActiveOne && isAlreadyInAClub) buttonText = "View Club";

                    let buttonClass = "bg-[#16284F] text-white hover:bg-[#0f1b35] active:scale-95 cursor-pointer";
                    if (isThisClubTheActiveOne && isPendingForAClub) {
                        buttonClass = "bg-[#FB8000] text-white cursor-not-allowed";
                    } else if (isThisClubTheActiveOne && isAlreadyInAClub) {
                        buttonClass = "bg-[#43C17A] text-white hover:bg-[#35a164] active:scale-95 cursor-pointer";
                    } else if (isButtonDisabled) {
                        buttonClass = "bg-gray-300 text-gray-500 cursor-not-allowed";
                    }

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
                                // onClick={() => handleJoinClick(club.id.toString())}
                                onClick={() => {
                                    if (isThisClubTheActiveOne && isAlreadyInAClub) {
                                        router.push("/clubs?tab=myclub");
                                    } else {
                                        handleJoinClick(club.id.toString());
                                    }
                                }}
                                disabled={isButtonDisabled}
                                className={`w-full py-3 rounded-xl text-base font-bold transition-all shadow-lg ${buttonClass}`}
                            >
                                {buttonText}
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