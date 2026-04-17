"use client";

import { useSearchParams } from "next/navigation";

import {
    clubInfo,
    requestsData,
} from "./components/mock-data";

import ClubHeader from "./components/ClubHeader";
import TabNavigation from "./components/TabNavigation";
import RequestsList from "./components/RequestsList";
import ClubInfo from "./components/ClubInfo";
import Announcements from "./components/Announcements";

export default function FacultyClubsClient() {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "requests";
    const currentFilter = searchParams.get("filter") || "all";
    const filteredRequests = requestsData.filter((req) => {
        if (currentFilter === "all") return true;
        return req.status === currentFilter;
    });

    return (
        <>
            <ClubHeader />
            <main className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex justify-center mb-8">
                    <TabNavigation currentTab={currentTab} />
                </div>
                {currentTab === "requests" ? (
                    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                        <ClubInfo info={clubInfo} />
                        <RequestsList
                            requests={filteredRequests}
                            currentFilter={currentFilter}
                        />
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                        <Announcements />
                    </div>
                )}
            </main>
        </>
    );
}