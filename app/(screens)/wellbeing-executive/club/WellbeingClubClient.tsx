"use client";

import { useSearchParams } from "next/navigation";
import ClubHeader from "../../faculty/clubs/components/ClubHeader";
import TabNavigation from "../../faculty/clubs/components/TabNavigation";
import ClubInfo from "../../faculty/clubs/components/ClubInfo";

import { useEffect, useState } from "react";
import RequestsListShimmer from "../../faculty/clubs/shimmers/RequestsListShimmer";
import { clubInfo } from "./components/mock-data";
import RequestsList from "./components/RequestsList";
import Announcements from "./components/Announcements";

export default function WellbeingClubClient() {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "requests";
    const currentFilter = searchParams.get("filter") || "all";

    const [isLoading, setIsLoading] = useState(true);
    const [currentViewDate, setCurrentViewDate] = useState("Today");

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {!isLoading && <ClubHeader isVisible={false}/>}
            <main className="mt-4 rounded-2xl bg-white p-6 shadow-sm min-h-[50vh]">
                {!isLoading &&
                    <div className="flex justify-center mb-8">
                        <TabNavigation currentTab={currentTab} />
                    </div>
                }

                <>
                    {currentTab === "requests" ? (
                        <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                            <ClubInfo info={clubInfo} isLoading={isLoading} />
                            {isLoading && <RequestsListShimmer />}

                            {!isLoading && (
                                <RequestsList
                                    currentFilter={currentFilter}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                            {!isLoading && (
                                <div className="relative mb-8 flex items-center justify-center">
                                    <div className="absolute w-full border-t border-[#959595]"></div>
                                    <span className="relative bg-white px-6 text-xs font-bold text-[#3B3B3B]">
                                        {currentViewDate}
                                    </span>
                                </div>
                            )}

                            {!isLoading && (
                                <Announcements
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
