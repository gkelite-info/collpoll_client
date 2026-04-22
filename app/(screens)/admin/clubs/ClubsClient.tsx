"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TabNavigation from "./components/TabNavigation";
import ClubsList from "./components/ClubsList";
import AddEditClubForm from "./components/AddEditClubForm";
import { encryptId } from "@/app/utils/encryption";
import { Suspense } from "react";
import ViewClubDetails from "./components/ViewClubDetails";
import { Loader } from "../../(student)/calendar/right/timetable";


function ClubsClientContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const activeTab = searchParams.get("tab") || "view";
    const editId = searchParams.get("edit");
    const viewClubId = searchParams.get("viewClubId");

    const handleTabChange = (tab: "add" | "view") => {
        router.push(`/admin/clubs?tab=${tab}`);
    };

    const handleEditClub = (clubId: string) => {
        const encryptedId = encryptId(clubId);
        router.push(`/admin/clubs?tab=add&edit=${encryptedId}`);
    };

    const handleViewClub = (clubId: string) => {
        const encryptedId = encryptId(clubId);
        router.push(`/admin/clubs?tab=view&viewClubId=${encryptedId}&status=active&group=members`);
    };

    // const isViewingList = activeTab === "view" && !editId;
    const isViewingDetails = !!viewClubId;
    const isViewingList = activeTab === "view" && !editId && !isViewingDetails;

    return (
        <div className="flex flex-col items-center w-full">
            {!isViewingDetails && (
                <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
            )}
            {/* <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8 relative"> */}
            <div className={`w-full relative ${isViewingDetails ? "mt-4" : "bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8"}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        // key={isViewingList ? "list" : "form"}
                        key={isViewingDetails ? "details" : isViewingList ? "list" : "form"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* {isViewingList ? (
                            <ClubsList onEdit={handleEditClub} />
                        ) : (
                            <AddEditClubForm editId={editId} />
                        )} */}

                        {isViewingDetails ? (
                            <ViewClubDetails clubId={viewClubId} />
                        ) : isViewingList ? (
                            <ClubsList onEdit={handleEditClub} onView={handleViewClub} />
                        ) : (
                            <AddEditClubForm editId={editId} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function ClubsClient() {
    return (
        <Suspense fallback={<div className="text-center p-10 text-gray-500"><Loader /></div>}>
            <ClubsClientContent />
        </Suspense>
    );
}