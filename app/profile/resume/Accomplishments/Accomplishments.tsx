"use client";

import { useState } from "react";
import CertificationsForm from "./CertificationsForm";
import AwardsForm from "./AwardsForm";
import ClubsForm from "./ClubsForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type TabType = "certifications" | "awards" | "clubs";


export default function Accomplishments() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("certifications");
    const [submittedForms, setSubmittedForms] = useState<Record<TabType, boolean[]>>({
        certifications: [false],
        awards: [false],
        clubs: [false],
    });

    const [formCount, setFormCount] = useState<Record<TabType, number>>({
        certifications: 1,
        awards: 1,
        clubs: 1,
    });

    const handleAdd = () => {
        const lastIndex = formCount[activeTab] - 1;

        if (!submittedForms[activeTab][lastIndex]) {
            toast.error("Please submit the latest form before adding a new one.");
            return;
        }

        setFormCount((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab] + 1,
        }));

        setSubmittedForms((prev) => ({
            ...prev,
            [activeTab]: [...prev[activeTab], false],
        }));
    };

    const markSubmitted = (tab: TabType, index: number) => {
        setSubmittedForms((prev) => {
            const updated = [...prev[tab]];
            updated[index] = true;
            return { ...prev, [tab]: updated };
        });
    };

    return (
        <div className="bg-white rounded-xl p-6 w-full mt-3 mb-5 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-center text-[#282828]">
                    Accomplishments
                </h2>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium"
                    >
                        Add +
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/profile?competitive-exams')}
                        className="bg-[#43C17A] cursor-pointer text-white px-6 py-1.5 rounded-md text-sm font-medium"
                    >
                        Next
                    </button>
                </div>
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

            {activeTab === "certifications" &&
                Array.from({ length: formCount.certifications }).map((_, i) => (
                    <CertificationsForm
                        key={i}
                        index={i}
                        studentId={1}
                        onRemove={() => { }}
                    />
                ))
            }


            {activeTab === "awards" &&
                Array.from({ length: formCount.awards }).map((_, i) => (
                    <AwardsForm
                        key={i}
                        index={i}
                        studentId={1}
                        onSubmit={() => markSubmitted("awards", i)}
                    />
                ))}

            {activeTab === "clubs" &&
                Array.from({ length: formCount.clubs }).map((_, i) => (
                    <ClubsForm
                        key={i}
                        index={i}
                        studentId={1}
                        onSubmit={() => markSubmitted("clubs", i)}
                    />
                ))}
        </div>
    );
}