"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TabNavigation from "./components/TabNavigation";
import ClubsList from "./components/ClubsList";
import AddEditClubForm from "./components/AddEditClubForm";


export default function ClubsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const activeTab = searchParams.get("tab") || "add";
    const editId = searchParams.get("edit");

    const handleTabChange = (tab: "add" | "view") => {
        router.push(`/admin/clubs?tab=${tab}`);
    };

    const handleEditClub = (clubId: string) => {
        router.push(`/admin/clubs?tab=add&edit=${clubId}`);
    };

    const isViewingList = activeTab === "view" && !editId;

    return (
        <div className="flex flex-col items-center w-full">
            <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isViewingList ? "list" : "form"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isViewingList ? (
                            <ClubsList onEdit={handleEditClub} />
                        ) : (
                            <AddEditClubForm editId={editId} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}