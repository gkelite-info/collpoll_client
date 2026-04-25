"use client";

import { useSearchParams } from "next/navigation";

import ClubHeader from "./components/ClubHeader";
import TabNavigation from "./components/TabNavigation";
import RequestsList from "./components/RequestsList";
import ClubInfo from "./components/ClubInfo";
import Announcements from "./components/Announcements";
import { useUser } from "@/app/utils/context/UserContext";
import { useEffect, useState } from "react";
import { getFacultyClubDetailsAPI } from "@/lib/helpers/clubActivity/facultyClubAPI";
import toast from "react-hot-toast";
import RequestsListShimmer from "./shimmers/RequestsListShimmer";
import Image from "next/image";

export default function FacultyClubsClient() {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "requests";
    const currentFilter = searchParams.get("filter") || "all";

    const { facultyId, collegeId } = useUser();
    const [clubData, setClubData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentViewDate, setCurrentViewDate] = useState("Today");

    useEffect(() => {
        if (!facultyId) return;
        const loadClubData = async () => {
            try {
                setIsLoading(true);
                const data = await getFacultyClubDetailsAPI(parseInt(String(facultyId), 10));
                setClubData(data);
                console.log("club data check faculty side", data)
            } catch (error) {
                toast.error("Failed to fetch club information.");
            } finally {
                setIsLoading(false);
            }
        };

        loadClubData();
    }, [facultyId]);

    if (!isLoading && !clubData) {
        return (
            <div className="flex flex-col items-center justify-center pt-32 pb-10 gap-3 min-h-[60vh]">
                <Image src="/no-club.png" alt="" height={150} width={150} className="object-cover" />
                <div className="text-center">
                    <h2 className="text-xl font-bold text-[#16284F] mb-2">No Club Assigned</h2>
                    <p className="text-gray-500 font-medium text-center">
                        You are not currently assigned as a Responsible Faculty or Mentor for any active clubs.
                    </p>
                </div>
            </div>
        );
    }

    const facultyRole = clubData?.role || "mentor";

    return (
        <>
            {!isLoading && <ClubHeader />}
            <main className="mt-4 rounded-2xl bg-white p-6 shadow-sm min-h-[50vh]">
                {!isLoading &&
                    <div className="flex justify-center mb-8">
                        <TabNavigation currentTab={currentTab} />
                    </div>
                }

                <>
                    {currentTab === "requests" ? (
                        <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                            <ClubInfo info={clubData} isLoading={isLoading} />
                            {isLoading && <RequestsListShimmer />}

                            {!isLoading && clubData && (
                                <RequestsList
                                    clubId={clubData.id}
                                    currentFilter={currentFilter}
                                />
                            )}
                        </div>
                    ) : (
                        // <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                        //     <Announcements />
                        // </div>

                        <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">

                            {!isLoading && clubData && (
                                <div className="relative mb-8 flex items-center justify-center">
                                    <div className="absolute w-full border-t border-[#959595]"></div>
                                    <span className="relative bg-white px-6 text-xs font-bold text-[#3B3B3B]">
                                        {currentViewDate}
                                    </span>
                                </div>
                            )}

                            {!isLoading && clubData && (
                                <Announcements
                                    clubId={parseInt(clubData.id)}
                                    collegeId={collegeId!}
                                    facultyId={parseInt(String(facultyId), 10)}
                                    userRole={facultyRole}
                                    onDateChange={setCurrentViewDate}
                                />
                            )}
                        </div>
                    )}
                </>

            </main>
        </>
    );
}