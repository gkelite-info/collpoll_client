"use client";
import { useState } from "react";
import ProfileDrawer from "./ProfileDrawer";
import TermsModal from "./TermsAndConditions";
import ProfileQuickMenu from "./ProfileQuickMenu";
import { useRouter } from "next/navigation";

export default function ProfileWrapper({
    openProfile,
    onCloseProfile,
}: {
    openProfile: boolean;
    onCloseProfile: () => void;
}) {
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
    const router = useRouter()

    const closeAllAndNavigate = (url: string) => {
        setIsTermsOpen(false);
        setIsQuickMenuOpen(false);
        onCloseProfile();
        router.push(url);
    };

    return (
        <>
            <ProfileDrawer
                open={openProfile && !isTermsOpen && !isQuickMenuOpen}
                onClose={onCloseProfile}
                onOpenTerms={() => {
                    setIsTermsOpen(true);
                }}
                onOpenQuickMenu={() => {
                    setIsQuickMenuOpen(true);
                }}
            />

            <TermsModal
                open={isTermsOpen}
                onClose={() => {
                    setIsTermsOpen(false);
                }}
            />

            <ProfileQuickMenu
                open={isQuickMenuOpen}
                onClose={() => setIsQuickMenuOpen(false)}
                onProfileClick={() => closeAllAndNavigate("/profile")}
                onResumeClick={() => closeAllAndNavigate("/resume")}
            />
        </>
    );
}
