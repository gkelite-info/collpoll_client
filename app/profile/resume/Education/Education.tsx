"use client";

import { useState, useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";
import EducationForm from "./EducationForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


export type EducationType =
    | "primary"
    | "secondary"
    | "undergraduate"
    | "phd";

const EDUCATION_ORDER: EducationType[] = [
    "primary",
    "secondary",
    "undergraduate",
    "phd",
];

export default function EducationSection() {
    const [addedForms, setAddedForms] = useState<EducationType[]>(["primary"]);
    const [open, setOpen] = useState(false);
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false);

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const primarySaveRef = useRef<any>(null);
    const secondarySaveRef = useRef<any>(null);
    const undergraduateSaveRef = useRef<any>(null);
    const phdSaveRef = useRef<any>(null);


    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                open &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleAdd = (type: EducationType) => {
        if (!addedForms.includes(type)) {
            setAddedForms((prev) => [...prev, type]);
        }
        setOpen(false);
    };


    const removeSection = (type: EducationType) => {
        setAddedForms(prev => prev.filter(item => item !== type));
    };


    const handleSubmitAll = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            if (addedForms.includes("primary") && primarySaveRef.current)
                await primarySaveRef.current();

            if (addedForms.includes("secondary") && secondarySaveRef.current)
                await secondarySaveRef.current();

            if (addedForms.includes("undergraduate") && undergraduateSaveRef.current)
                await undergraduateSaveRef.current();

            if (addedForms.includes("phd") && phdSaveRef.current)
                await phdSaveRef.current();

            toast.success("Education form submitted successfully");

            // router.push('/profile?key-skills');
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[#282828]">Education</h2>

                <div className="flex gap-3 relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen((p) => !p)}
                        className="flex items-center cursor-pointer gap-2 bg-[#43C17A] text-white px-4 py-1.5 rounded-md text-sm"
                    >
                        Add +
                        <CaretDown size={14} />
                    </button>

                    {open && (
                        <div className="absolute right-20 top-9 w-60 bg-white border border-[#CCCCCC] rounded-md shadow z-10 overflow-hidden text-[#282828]">
                            <DropdownItem
                                label="Secondary Education"
                                disabled={addedForms.includes("secondary")}
                                onClick={() => handleAdd("secondary")}
                            />
                            <DropdownItem
                                label="Undergraduate Degree"
                                disabled={addedForms.includes("undergraduate")}
                                onClick={() => handleAdd("undergraduate")}
                            />
                            <DropdownItem
                                label="PhD"
                                disabled={addedForms.includes("phd")}
                                onClick={() => handleAdd("phd")}
                            />
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/profile?key-skills')}
                        className="bg-[#43C17A] cursor-pointer text-white px-5 py-1.5 rounded-md text-sm">
                        Next
                    </button>
                </div>
            </div>

            <div className="space-y-8  rounded-xl p-6 w-[85%] mx-auto">
                {EDUCATION_ORDER.map(
                    (type) =>
                        addedForms.includes(type) && (
                            <EducationForm
                                key={type}
                                type={type}
                                onSaveRef={
                                    type === "primary"
                                        ? primarySaveRef
                                        : type === "secondary"
                                            ? secondarySaveRef
                                            : type === "undergraduate"
                                                ? undergraduateSaveRef
                                                : phdSaveRef
                                }
                                onRemove={() => removeSection(type)}
                            />

                        )
                )}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSubmitAll}
                        disabled={isSubmitting}
                        className={`px-6 py-2 rounded-md text-sm text-white 
            ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"}`}
                    >
                        {isSubmitting ? "Saving..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DropdownItem({
    label,
    onClick,
    disabled,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full text-left px-4 py-2 text-sm ${disabled
                ? "text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
                }`}
        >
            {label}
        </button>
    );
}

