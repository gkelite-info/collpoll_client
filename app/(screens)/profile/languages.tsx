"use client";

import { useEffect, useRef, useState } from "react";
import { CaretDown, X } from "@phosphor-icons/react";

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

export default function Languages() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<string[]>(["Telugu", "Hindi", "English", "Kannada"]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

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

    const filtered = ALL_LANGUAGES.filter(
        (l) => l.toLowerCase().includes(query.toLowerCase()) && !selected.includes(l)
    );

    const toggleSelect = (lang: string) => {
        if (selected.includes(lang)) return;
        setSelected((s) => [...s, lang]);
        setQuery("");
        setOpen(false);
        inputRef.current?.focus();
    };

    const remove = (lang: string) => {
        setSelected((s) => s.filter((x) => x !== lang));
    };

    return (
        <div className="mt-3 h-full">
            <div className="bg-white rounded-lg shadow-sm p-6 h-[95%]">
                <h3 className="text-xl font-semibold text-[#282828] lowercase">languages</h3>

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
                                            className="inline-flex items-center justify-center w-5 h-5 text-[#525252] hover:text-red-600"
                                            aria-label={`Remove ${lang}`}
                                        >
                                            <X size={14} weight="bold" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
