"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { CheckCircle, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchResumePersonalDetails } from "@/lib/helpers/student/Resume/Resumepersonaldetailsapi";
import { useUser } from "../utils/context/UserContext";

type StepItem = {
    id: number;
    title: string;
    query: string;
};

const STEP_DATA: StepItem[] = [
    { id: 1,  title: "Personal Details",      query: "personal-details" },
    { id: 2,  title: "Education",             query: "education" },
    { id: 3,  title: "Key Skills",            query: "key-skills" },
    { id: 4,  title: "Languages",             query: "languages" },
    { id: 5,  title: "Internships",           query: "internships" },
    { id: 6,  title: "Projects",              query: "projects" },
    { id: 7,  title: "Accomplishments",       query: "accomplishments" },
    { id: 8,  title: "Competitive Exams",     query: "competitive-exams" },
    { id: 9,  title: "Employment",            query: "employment" },
    { id: 10, title: "Academic Achievements", query: "academic-achievements" },
    { id: 11, title: "Profile Summary",       query: "profile-summary" },
];

export default function ResumeSteps() {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [workStatus, setWorkStatus] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const stepRefs = useRef<HTMLDivElement[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { studentId } = useUser();

    useEffect(() => {
        const activeIndex = currentStep - 1;
        const activeNode = stepRefs.current[activeIndex];
        const containerNode = containerRef.current;

        if (!activeNode || !containerNode) return;
        const cRect = containerNode.getBoundingClientRect();
        const nRect = activeNode.getBoundingClientRect();
        const offset = nRect.left - cRect.left - cRect.width / 2 + nRect.width / 2;
        containerNode.scrollBy({ left: offset, behavior: "smooth" });
    }, [currentStep]);

    useEffect(() => {
        const stepQuery = searchParams.get("resume");
        const newIndex = filteredSteps.findIndex((s) => s.query === stepQuery);

        if (newIndex !== -1) {
            setCurrentStep(newIndex + 1);
        } else if (stepQuery === null && !searchParams.toString()) {
            setCurrentStep(1);
        }
    }, [searchParams.toString()]);

    useEffect(() => {
        const loadData = async () => {
            const res = await fetchResumePersonalDetails(studentId!);
            if (res?.success && res?.data) {
                setWorkStatus(res.data.workStatus);
            }
        };
        loadData();
    }, [studentId]);

    const filteredSteps = useMemo(() => {
        if (!workStatus) return STEP_DATA;
        if (workStatus.toLowerCase() === "fresher") {
            return STEP_DATA.filter(step => step.query !== "employment");
        }
        return STEP_DATA;
    }, [workStatus]);

    stepRefs.current = stepRefs.current.slice(0, filteredSteps.length);
    const addRef = (el: HTMLDivElement | null, index: number) => {
        if (!el) return;
        stepRefs.current[index] = el;
    };

    const handlePrev = () => {
        const prevIndex = currentStep - 2;
        if (prevIndex < 0) return;
        const prevStep = filteredSteps[prevIndex];
        setCurrentStep(prevIndex + 1);
        router.push(`/profile?resume=${prevStep.query}&Step=${prevIndex + 1}`, { scroll: false });
    };

    const handleNext = () => {
        const nextIndex = currentStep;
        if (nextIndex >= filteredSteps.length) return;
        const nextStep = filteredSteps[nextIndex];
        setCurrentStep(nextIndex + 1);
        router.push(`/profile?resume=${nextStep.query}&Step=${nextIndex + 1}`, { scroll: false });
    };

    return (
        <div className="w-full p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center gap-2">

                {/* Left Arrow */}
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-[#C0C0C0] transition-colors
                        ${currentStep === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"}`}
                >
                    <CaretLeft size={14} className="text-[#525252]" />
                </button>

                {/* Scrollable steps */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-x-auto no-scrollbar py-1"
                    style={{ WebkitOverflowScrolling: "touch" }}
                >
                    <div className="flex items-center gap-1 px-2 min-w-max">
                        {filteredSteps.map((step, index) => {
                            const isCompleted = index + 1 < currentStep;
                            const isActive = index + 1 === currentStep;

                            return (
                                <div
                                    key={step.id}
                                    ref={(el) => addRef(el, index)}
                                    onClick={() => {
                                        setCurrentStep(index + 1);
                                        router.push(`/profile?resume=${step.query}&Step=${index + 1}`, {
                                            scroll: false,
                                        });
                                    }}
                                    className="flex items-center justify-center cursor-pointer relative select-none"
                                >
                                    <div
                                        className={`flex flex-col items-center transition-all ${isActive ? "scale-110" : ""}`}
                                    >
                                        <div>
                                            {isCompleted ? (
                                                <CheckCircle size={40} weight="fill" className="text-[#74CB64] rounded-full" />
                                            ) : (
                                                <div className="rounded-full border text-xs border-[#878787] text-[#878787] h-7 w-7 flex justify-center items-center">
                                                    {index + 1}
                                                </div>
                                            )}
                                        </div>

                                        <span
                                            className={`text-xs mt-2 w-20 text-center text-nowrap ${isActive ? "text-[#74CB64] font-medium" : "text-[#878787]"}`}
                                        >
                                            {step.title}
                                        </span>
                                    </div>

                                    {index !== filteredSteps.length - 1 && (
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

                {/* Right Arrow */}
                <button
                    onClick={handleNext}
                    disabled={currentStep === filteredSteps.length}
                    className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-[#C0C0C0] transition-colors
                        ${currentStep === filteredSteps.length ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"}`}
                >
                    <CaretRight size={14} className="text-[#525252]" />
                </button>

            </div>
        </div>
    );
}