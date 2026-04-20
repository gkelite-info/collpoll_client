"use client";

import { useState, useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";
import EducationForm from "./EducationForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import {
    resumeMastersEducationAPI,
    resumePhdEducationAPI,
    resumePrimaryEducationAPI,
    resumeSecondaryEducationAPI,
    resumeUndergraduateEducationAPI,
} from "@/lib/helpers/student/Resume/Resumeeducationapi";

export type EducationType =
    | "primary"
    | "secondary"
    | "undergraduate"
    | "masters"
    | "phd";

const EDUCATION_ORDER: EducationType[] = [
    "primary",
    "secondary",
    "undergraduate",
    "masters",
    "phd",
];

// Human-readable labels for toast messages
const EDUCATION_LABELS: Record<EducationType, string> = {
    primary: "Primary Education",
    secondary: "Secondary Education",
    undergraduate: "Undergraduate Degree",
    masters: "Masters Degree",
    phd: "PhD",
};

export default function EducationSection() {
    const [addedForms, setAddedForms] = useState<EducationType[] | null>(null);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { studentId } = useUser();
    const [isSaving, setIsSaving] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const primarySaveRef = useRef<any>(null);
    const secondarySaveRef = useRef<any>(null);
    const undergraduateSaveRef = useRef<any>(null);
    const mastersSaveRef = useRef<any>(null);
    const phdSaveRef = useRef<any>(null);

    // Track whether each section already has a saved record (for insert vs update toast)
    const savedIds = useRef<Partial<Record<EducationType, number | null>>>({});
    const handleRecordSaved = (type: EducationType, id: number) => {
        savedIds.current[type] = id;

    };

    useEffect(() => {
        if (!studentId) return;

        (async () => {
            const [primary, secondary, undergraduate, masters, phd] = await Promise.all([
                resumePrimaryEducationAPI.fetch(studentId),
                resumeSecondaryEducationAPI.fetch(studentId),
                resumeUndergraduateEducationAPI.fetch(studentId),
                resumeMastersEducationAPI.fetch(studentId),
                resumePhdEducationAPI.fetch(studentId),
            ]);

            const detected: EducationType[] = ["primary"];
            if (secondary.success && secondary.data) detected.push("secondary");
            if (undergraduate.success && undergraduate.data) detected.push("undergraduate");
            if (masters.success && masters.data) detected.push("masters");
            if (phd.success && phd.data) detected.push("phd");
            if (primary.success && !primary.data && detected.length === 0) detected.push("primary");

            setAddedForms(detected);
        })().catch(() => {
            toast.error("Failed to load education details");
            setAddedForms(["primary"]);
        });
    }, [studentId]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (open && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleAdd = (type: EducationType) => {
        if (!(addedForms ?? []).includes(type)) {
            setAddedForms((prev) => [...(prev ?? []), type]);
            // Toast: "Secondary Education selected" etc.
            toast.success(`${EDUCATION_LABELS[type]} selected`);
        }
        setOpen(false);
    };

    const removeSection = (type: EducationType) => {
        setAddedForms((prev) => (prev ?? []).filter((item) => item !== type));
    };

    const saveAllEducation = async (): Promise<boolean> => {
        if (!addedForms || addedForms.length === 0) return false;

        const hadRecord: Partial<Record<EducationType, boolean>> = {};
        for (const type of addedForms) {
            hadRecord[type] = !!(savedIds.current[type]);
        }

        try {
            if (addedForms.includes("primary") && primarySaveRef.current) await primarySaveRef.current();
            if (addedForms.includes("secondary") && secondarySaveRef.current) await secondarySaveRef.current();
            if (addedForms.includes("undergraduate") && undergraduateSaveRef.current) await undergraduateSaveRef.current();
            if (addedForms.includes("masters") && mastersSaveRef.current) await mastersSaveRef.current();
            if (addedForms.includes("phd") && phdSaveRef.current) await phdSaveRef.current();

            const allUpdated = addedForms.every((type) => hadRecord[type]);
            toast.success(allUpdated ? "Education updated successfully" : "Education saved successfully");
            return true;
        } catch (err) {
            console.error(err);
            const msg = (err as Error)?.message ?? "";
            if (msg.endsWith("_save_failed")) {
                toast.error("Failed to save. Please try again.");
            }
            return false;
        }
    };

    const handleSubmitAll = async () => {
        if (isSaving || isNavigating) return;
        setIsSaving(true);
        try {
            await saveAllEducation();
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while saving education.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleNext = async () => {
        if (isSaving || isNavigating) return;
        setIsNavigating(true);
        try {
            const success = await saveAllEducation();
            if (success) {
                router.push("/profile?resume=key-skills&Step=3");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while saving education.");
        } finally {
            setIsNavigating(false);
        }
    };

    if (addedForms === null) {
        return (
            <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-5 w-24 rounded bg-gray-200" />
                    <div className="h-8 w-20 rounded-md bg-gray-200" />
                </div>
                <div className="space-y-4 rounded-xl p-6 w-[85%] mx-auto">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-1 w-[85%]">
                            <div className="h-3 w-28 rounded bg-gray-200" />
                            <div className="h-10 w-full rounded-md bg-gray-100" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

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
                                label="Primary Education"
                        disabled={addedForms.includes("primary")}
                                onClick={() => handleAdd("primary")}
                            />
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
                                label="Masters Degree"
                        disabled={addedForms.includes("masters")}
                                onClick={() => handleAdd("masters")}
                            />
                            <DropdownItem
                                label="PhD"
                        disabled={addedForms.includes("phd")}
                                onClick={() => handleAdd("phd")}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-8 rounded-xl p-6 w-[85%] mx-auto">
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
                                                : type === "masters"
                                                    ? mastersSaveRef
                                                    : phdSaveRef
                                }
                                onRemove={() => removeSection(type)}
                                onRecordSaved={(id) => handleRecordSaved(type, id)}  // ← add this line
                            />
                        )
                )}

                <div className="flex justify-end mt-6 gap-3">
                    <button
                        onClick={handleSubmitAll}
                        disabled={isSaving || isNavigating}
                        className={`px-6 py-2 rounded-md text-sm text-white ${(isSaving || isNavigating) ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"
                            }`}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={isSaving || isNavigating}
                        className={`bg-[#43C17A] text-white px-5 py-1.5 rounded-md text-sm ${(isSaving || isNavigating) ? "bg-gray-400 cursor-not-allowed" : "cursor-pointer"
                            }`}
                    >
                        {isNavigating ? "Saving..." : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DropdownItem({
    label, onClick, disabled,
}: {
    label: string; onClick: () => void; disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full text-left px-4 py-2 text-sm ${disabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
        >
            {label}
        </button>
    );
}
