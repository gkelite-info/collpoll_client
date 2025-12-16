"use client";

import { useState } from "react";
import CertificationsForm from "./CertificationsForm";
import AwardsForm from "./AwardsForm";
import ClubsForm from "./ClubsForm";

type TabType = "certifications" | "awards" | "clubs";

export default function Accomplishments() {
    const [activeTab, setActiveTab] = useState<TabType>("certifications");

    return (
        <div className="bg-white rounded-xl p-6 w-full mt-3 mb-5 h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-center text-[#282828]">
                    Accomplishments
                </h2>
                <button
                    type="button"
                    className="bg-[#43C17A] cursor-pointer text-white px-6 py-1.5 rounded-md text-sm font-medium"
                >
                    Next
                </button>
            </div>

            <div className="flex justify-between gap-5  mb-6">
                {[
                    { key: "certifications", label: "Certifications" },
                    { key: "awards", label: "Awards" },
                    { key: "clubs", label: "Club & Committees" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as TabType)}
                        className={`pb-2 cursor-pointer text-sm font-medium w-full text-center
                                ${activeTab === tab.key
                                ? "text-[#74CB64] border-b-2 border-[#74CB64]"
                                : "border-[#AEAEAE] border-b-2 text-[#282828]"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "certifications" && <CertificationsForm />}
            {activeTab === "awards" && <AwardsForm />}
            {activeTab === "clubs" && <ClubsForm />}
        </div>
    );
}