"use client";

import { useRef, useEffect, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";

type StepItem = {
    id: number;
    title: string;
    query: string;
};

const STEP_DATA: StepItem[] = [
    { id: 1, title: "Personal Details", query: "personal-details" },
    { id: 2, title: "Education", query: "education" },
    { id: 3, title: "Key Skills", query: "key-skills" },
    { id: 4, title: "Languages", query: "languages" },
    { id: 5, title: "Internships", query: "internships" },
    { id: 6, title: "Projects", query: "projects" },
    { id: 7, title: "Profile Summary", query: "profile-summary" },
    { id: 8, title: "Accomplishments", query: "accomplishments" },
    { id: 9, title: "Competitive Exams", query: "competitive-exams" },
    { id: 10, title: "Employment", query: "employment" },
    { id: 11, title: "Academic Achievements", query: "academic-achievements" },
];

export default function ProfileSteps() {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const stepRefs = useRef<HTMLDivElement[]>([]);
    stepRefs.current = stepRefs.current.slice(0, STEP_DATA.length);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const activeIndex = STEP_DATA.findIndex((s) => s.id === currentStep);
        const activeNode = stepRefs.current[activeIndex];
        const containerNode = containerRef.current;

        if (!activeNode || !containerNode) return;
        const cRect = containerNode.getBoundingClientRect();
        const nRect = activeNode.getBoundingClientRect();
        const offset = nRect.left - cRect.left - cRect.width / 2 + nRect.width / 2;
        containerNode.scrollBy({ left: offset, behavior: "smooth" });
    }, [currentStep]);

    useEffect(() => {
        const query = searchParams.toString().replace("=", "");
        const matchedStep = STEP_DATA.find((s) => s.query === query);

        if (matchedStep) {
            setCurrentStep(matchedStep.id);
        } else {
            router.replace("/profile?personal-details", { scroll: false });
            setCurrentStep(1);
        }
    }, [searchParams, router]);

    const addRef = (el: HTMLDivElement | null, index: number) => {
        if (!el) return;
        stepRefs.current[index] = el;
    };

    return (
        <div className="w-full p-4 bg-white rounded-xl shadow-sm">
            <div
                ref={containerRef}
                className="w-full overflow-x-auto no-scrollbar py-1"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                <div className="flex items-center gap-1 px-2 min-w-max">
                    {STEP_DATA.map((step, index) => {
                        const isCompleted = step.id < currentStep;
                        const isActive = step.id === currentStep;

                        return (
                            <div
                                key={step.id}
                                ref={(el) => addRef(el, index)}
                                onClick={() => {
                                    setCurrentStep(step.id);
                                    router.push(`/profile?${step.query}`, {
                                        scroll: false,
                                    });
                                }}
                                className="flex items-center justify-center cursor-pointer relative select-none"
                            >
                                <div
                                    className={`flex flex-col items-center transition-all ${isActive ? "scale-110" : ""
                                        }`}
                                >
                                    <div

                                    >
                                        {isCompleted ? (
                                            <CheckCircle size={40} weight="fill" className="text-[#74CB64] rounded-full" />
                                        ) : (
                                            <div className="rounded-full border text-xs border-[#878787] text-[#878787] h-7 w-7 flex justify-center items-center">
                                                {step.id}
                                            </div>
                                        )}
                                    </div>

                                    <span
                                        className={`text-xs mt-2 w-20 text-center text-nowrap ${isActive ? "text-[#74CB64] font-medium" : "text-[#878787]"
                                            }`}
                                    >
                                        {step.title}
                                    </span>
                                </div>

                                {index !== STEP_DATA.length - 1 && (
                                    <div className="w-16 h-0.5 mx-2 relative mt-3">
                                        <div className="absolute -inset-5 border-t-2 border-dashed border-[#878787]" />
                                        {isCompleted && <div className="absolute -inset-5 border-t-2 border-dashed border-[#74CB64]" />}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* <div className="mt-4 flex items-center gap-3">
                <button
                    onClick={() =>
                        setCurrentStep((s) => Math.max(1, STEP_DATA.find((x) => x.id === s - 1)?.id ?? 1))
                    }
                    className="px-3 py-2 bg-gray-100 border rounded-md text-sm"
                >
                    Prev
                </button>

                <button
                    onClick={() =>
                        setCurrentStep((s) => Math.min(STEP_DATA[STEP_DATA.length - 1].id, s + 1))
                    }
                    className="px-3 py-2 bg-emerald-500 text-white rounded-md text-sm"
                >
                    Next
                </button>

                <div className="ml-3 text-sm text-gray-600">
                    Step <span className="font-medium">{currentStep}</span> of {STEP_DATA.length}
                </div>
            </div> */}
        </div>
    );
}
