"use client";

import { useEffect, useRef, useState } from "react";
import { CaretDown, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    getUserLanguages,
    upsertUserLanguages,
} from "@/lib/helpers/profile/profileLanguages";
import ProfileLanguagesShimmer from "./shimmers/ProfileLanguagesShimmer";
import { useUser } from "../utils/context/UserContext";

const ALL_LANGUAGES = [
    "English",
    "Hindi",
    "Telugu",
    "Kannada",
    "Tamil",
    "Malayalam",
    "Marathi",
    "Bengali",
    "Punjabi",
    "Gujarati",
];

const toPascalCase = (str: string) =>
    str
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

const toPascalCaseLive = (str: string) =>
    str
        .split(" ")
        .map((word) => {
            if (!word) return "";
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");

export default function ProfileLanguages() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherValue, setOtherValue] = useState("");
    const { userId } = useUser()
    const router = useRouter();

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        getUserLanguages(userId)
            .then((langs) => {
                setSelected(langs);
            })
            .catch(() => toast.error("Failed to load languages"))
            .finally(() => setLoading(false));
    }, []);

    const filtered = ALL_LANGUAGES.filter(
        (l) => l.toLowerCase().includes(query.trim().toLowerCase()) && !selected.includes(l)
    );

    const toggleSelect = (lang: string) => {
        if (selected.includes(lang)) return;
        setSelected((s) => [...s, lang]);
        setQuery("");
        if (inputRef.current) inputRef.current.value = "";
        setOpen(false);
        inputRef.current?.focus();
    };

    const remove = (lang: string) => {
        setSelected((s) => s.filter((x) => x !== lang));
    };

    const saveLanguages = async () => {
        if (isSubmitting || !userId) return;
        if (selected.length === 0) {
            toast.error("Select at least one language");
            return;
        }
        try {
            setIsSubmitting(true);
            await upsertUserLanguages(userId, selected);
            toast.success("Languages saved successfully!");
        } catch {
            toast.error("Something went wrong!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const addOtherLanguage = () => {
        const trimmed = otherValue.trim();
        if (!trimmed) {
            toast.error("Please enter a language");
            return;
        }
        const formatted = toPascalCase(trimmed);
        if (!selected.includes(formatted)) {
            setSelected((prev) => [...prev, formatted]);
        }
        setOtherValue("");
        setShowOtherInput(false);
    };

    const handleOtherKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addOtherLanguage();
        }
    };

    if (loading) return <ProfileLanguagesShimmer />;

    return (
        <div className="mt-3 h-full">
            <div className="bg-white rounded-lg shadow-sm p-6 h-[95%]">
                <div className="flex justify-between">
                    <h3 className="text-xl font-semibold text-[#282828] lowercase">languages</h3>
                    <button
                        onClick={() => router.push("/profile?profile=profile-summary&Step=6")}
                        className="bg-[#43C17A] cursor-pointer text-white px-5 py-1.5 rounded-md text-sm">
                        Next
                    </button>
                </div>

                <div className="mt-6 max-w-xl flex flex-col mx-auto">
                    <div ref={containerRef} className="relative">
                        <div className="w-full flex items-center justify-between border border-[#CCCCCC] rounded px-3 py-2 text-left focus-within:outline-none">
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    if (!open) setOpen(true);
                                }}
                                onFocus={() => setOpen(true)}
                                className="flex-1 text-[#525252] text-sm outline-none bg-transparent"
                                placeholder="Select Language"
                                aria-label="Select Language"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen((v) => !v);
                                    setTimeout(() => inputRef.current?.focus(), 10);
                                }}
                                className="ml-2"
                                aria-haspopup="listbox"
                                aria-expanded={open}
                            >
                                <CaretDown size={18} className="text-[#525252]" />
                            </button>
                        </div>

                        <div
                            className={`absolute left-0 right-0 mt-1 z-50 bg-white border border-[#C0C0C0] rounded shadow-sm max-h-56 overflow-auto ${open ? "block" : "hidden"
                                }`}
                        >
                            <ul role="listbox" tabIndex={-1} className="p-2 space-y-1">
                                {filtered.length === 0 ? (
                                    <li className="text-sm text-[#525252] px-2 py-2">No languages found</li>
                                ) : (
                                    filtered.map((lang) => (
                                        <li
                                            key={lang}
                                            onClick={() => toggleSelect(lang)}
                                            className="cursor-pointer px-3 py-2 text-[#525252] rounded hover:bg-emerald-50 text-sm flex items-center justify-between"
                                            role="option"
                                            aria-selected={false}
                                        >
                                            <span>{lang}</span>
                                            <span className="text-xs">Add</span>
                                        </li>
                                    ))
                                )}

                                {!showOtherInput && (
                                    <div
                                        onClick={() => setShowOtherInput(true)}
                                        className="mt-2 px-3 hover:bg-emerald-50 py-2 cursor-pointer text-sm text-[#43C17A]"
                                    >
                                        + Other
                                    </div>
                                )}

                                {showOtherInput && (
                                    <div className="flex gap-2 mt-2">
                                        <input
                                            autoFocus
                                            value={otherValue}
                                            onChange={(e) => setOtherValue(toPascalCaseLive(e.target.value))}
                                            onKeyDown={handleOtherKey}
                                            placeholder="Enter language"
                                            className="flex-1 border border-[#CCCCCC] focus:outline-none ml-3 rounded px-3 py-2 text-sm"
                                        />
                                        <button
                                            onClick={addOtherLanguage}
                                            className="px-4 bg-[#43C17A] focus:outline-none cursor-pointer text-white rounded text-sm"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => {
                                                setOtherValue("");
                                                setShowOtherInput(false);
                                            }}
                                            className="px-4 cursor-pointer focus:outline-none border rounded text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-4 border border-[#C0C0C0] rounded px-3 py-3 min-h-12">
                        <div className="flex flex-wrap gap-2">
                            {selected.length === 0 ? (
                                <div className="text-sm text-gray-400 italic">No languages selected.</div>
                            ) : (
                                selected.map((lang) => (
                                    <div
                                        key={lang}
                                        className="flex items-center gap-2 bg-white border rounded-full px-3 py-1 text-sm text-[#525252]"
                                    >
                                        <span>{lang}</span>
                                        <button
                                            onClick={() => remove(lang)}
                                            className="inline-flex cursor-pointer items-center justify-center w-5 h-5 text-[#525252] hover:text-red-600"
                                            aria-label={`Remove ${lang}`}
                                        >
                                            <X size={14} weight="bold" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={saveLanguages}
                            disabled={isSubmitting}
                            className={`px-6 py-2 rounded-md text-sm text-white 
                            ${isSubmitting ? "bg-[#43C17A]/50 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"}`}
                        >
                            {isSubmitting ? "Saving..." : "Submit"}
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}
