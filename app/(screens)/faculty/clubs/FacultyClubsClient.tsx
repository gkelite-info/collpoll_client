"use client";

import { useSearchParams } from "next/navigation";

import {
    requestsData,
} from "./components/mock-data";

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

export default function FacultyClubsClient() {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "requests";
    const currentFilter = searchParams.get("filter") || "all";

    const { facultyId } = useUser();
    const [clubData, setClubData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const filteredRequests = requestsData.filter((req) => {
        if (currentFilter === "all") return true;
        return req.status === currentFilter;
    });

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
            <div className="flex flex-col items-center justify-center pt-32 pb-10 min-h-[60vh]">
                <div className="bg-[#FB8000]/10 p-8 h-30 w-30 flex items-center justify-center rounded-full mb-4">
                    <span className="text-4xl rounded-full">📭</span>
                </div>
                <h2 className="text-xl font-bold text-[#16284F] mb-2">No Club Assigned</h2>
                <p className="text-gray-500 font-medium text-center">
                    You are not currently assigned as a Responsible Faculty or Mentor for any active clubs.
                </p>
            </div>
        );
    }

    return (
        <>
            {!isLoading &&
                <ClubHeader />
            }
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
                        <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                            <Announcements />
                        </div>
                    )}
                </>

            </main>
        </>
    );
}