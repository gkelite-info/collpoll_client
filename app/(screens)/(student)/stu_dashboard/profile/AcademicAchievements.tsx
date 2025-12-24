"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const DEFAULT_ACHIEVEMENTS = [
    "College Topper",
    "Department Topper",
    "Top in Class",
    "Top 10 in Class",
    "Gold Medalist",
    "Received Scholarship",
    "All Rounder",
];

export default function AcademicAchievements() {
    const [achievements, setAchievements] = useState<string[]>(
        DEFAULT_ACHIEVEMENTS
    );
    const [selected, setSelected] = useState<string[]>([]);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherValue, setOtherValue] = useState("");

    const toggle = (item: string) => {
        setSelected((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item]
        );
    };

    const addOtherAchievement = () => {
        const value = otherValue.trim();
        if (!value) {
            toast.error('Please enter an achievement before adding.')
            return;
        }

        if (!achievements.includes(value)) {
            setAchievements((prev) => [...prev, value]);
            setSelected((prev) => [...prev, value]);
        }

        setOtherValue("");
        setShowOtherInput(false);
    };

    const cancelOtherAchievement = () => {
        setOtherValue("");
        setShowOtherInput(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addOtherAchievement();
        }
    };

    const handleSubmit = () => {
        if (selected.length === 0) {
            toast.error("Please select at least one academic achievement.");
            return;
        }

        toast.success(
            `Successfully saved ${selected.length} academic achievement${selected.length > 1 ? "s" : ""
            }.`
        );
        console.log("Selected Achievements:", selected);
    };

    return (
        <div className="bg-white rounded-xl p-6 w-full min-h-[80vh] mt-2 mb-5">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-[#282828]">
                    Academic Achievements
                </h2>
            </div>

            <div className="max-w-lg mx-auto">
                <p className="text-sm font-medium text-[#282828] mb-4">
                    Received During B.A
                </p>

                <div className="space-y-3">
                    {achievements.map((item) => {
                        const checked = selected.includes(item);

                        return (
                            <div
                                key={item}
                                onClick={() => toggle(item)}
                                className="flex items-center gap-3 h-11 px-3 border border-[#D9D9D9] rounded-md cursor-pointer"
                            >
                                <div
                                    className={`w-5 h-5 rounded-sm border flex items-center justify-center
                                            ${checked
                                            ? "bg-[#22C55E] border-[#22C55E]"
                                            : "border-[#CCCCCC]"
                                        }`}
                                >
                                    {checked && (
                                        <svg
                                            width="12"
                                            height="10"
                                            viewBox="0 0 12 10"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M1 5L4.5 8.5L11 1"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>

                                <span className="text-sm text-[#525252]">{item}</span>
                            </div>
                        );
                    })}
                    {!showOtherInput && (
                        <div
                            onClick={() => setShowOtherInput(true)}
                            className="flex items-center gap-3 h-11 px-3 border border-[#D9D9D9] rounded-md cursor-pointer"
                        >
                            <span className="text-lg text-[#4F4F4F]">+</span>
                            <span className="text-sm text-[#4F4F4F]">Other</span>
                        </div>
                    )}
                    {showOtherInput && (
                        <div className="flex gap-2 items-center">
                            <input
                                autoFocus
                                value={otherValue}
                                onChange={(e) => setOtherValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter achievement"
                                className="flex-1 h-11 px-3 border border-[#D9D9D9] rounded-md text-sm text-[#525252] focus:outline-none"
                            />
                            <button
                                onClick={addOtherAchievement}
                                className="px-4 h-11 cursor-pointer bg-[#43C17A] text-white text-sm font-medium rounded-md"
                            >
                                Add
                            </button>
                            <button
                                onClick={cancelOtherAchievement}
                                className="px-4 h-11 border border-[#CCCCCC] text-[#525252] text-sm font-medium rounded-md cursor-pointer hover:bg-[#F5F5F5]"
                            >
                                Cancel
                            </button>

                        </div>
                    )}
                </div>
                <div className="mt-8">
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-[#43C17A] text-white text-sm font-medium h-11 rounded-md cursor-pointer"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
