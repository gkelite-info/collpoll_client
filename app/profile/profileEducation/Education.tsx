"use client";

import { useState, useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";
import EducationForm from "./EducationForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import {
  phdEducationAPI,
  primaryEducationAPI,
  secondaryEducationAPI,
  undergraduateEducationAPI,
} from "@/lib/helpers/profile/educationAPI";

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

export default function ProfileEducationSection() {
  const [addedForms,   setAddedForms]   = useState<EducationType[] | null>(null);
  const [open,         setOpen]         = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router     = useRouter();
  const { userId } = useUser();

  const dropdownRef          = useRef<HTMLDivElement | null>(null);
  const primarySaveRef       = useRef<(() => Promise<void>) | null>(null);
  const secondarySaveRef     = useRef<(() => Promise<void>) | null>(null);
  const undergraduateSaveRef = useRef<(() => Promise<void>) | null>(null);
  const phdSaveRef           = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [primary, secondary, undergraduate, phd] = await Promise.all([
        primaryEducationAPI.fetch(userId),
        secondaryEducationAPI.fetch(userId),
        undergraduateEducationAPI.fetch(userId),
        phdEducationAPI.fetch(userId),
      ]);

      const detected: EducationType[] = ["primary"];

      if (secondary.success    && secondary.data)     detected.push("secondary");
      if (undergraduate.success && undergraduate.data) detected.push("undergraduate");
      if (phd.success           && phd.data)           detected.push("phd");

      setAddedForms(detected);
    })();
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (open && dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleAdd = (type: EducationType) => {
    if (!addedForms?.includes(type))
      setAddedForms((prev) => [...(prev ?? []), type]);
    setOpen(false);
  };

  const removeSection = (type: EducationType) => {
    if (type === "primary") return;
    setAddedForms((prev) => (prev ?? []).filter((t) => t !== type));
  };

  const handleSubmitAll = async () => {
    if (isSubmitting || !addedForms) return;
    setIsSubmitting(true);
    try {
      if (addedForms.includes("primary")       && primarySaveRef.current)
        await primarySaveRef.current();
      if (addedForms.includes("secondary")     && secondarySaveRef.current)
        await secondarySaveRef.current();
      if (addedForms.includes("undergraduate") && undergraduateSaveRef.current)
        await undergraduateSaveRef.current();
      if (addedForms.includes("phd")           && phdSaveRef.current)
        await phdSaveRef.current();

      toast.success("Education saved successfully");
    } catch (err: any) {
      const isValidationError = err?.message &&
        !err.message.endsWith("_save_failed");

      if (!isValidationError) {
        toast.error("Failed to save education. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (addedForms === null) {
    return <EducationPageShimmer />;
  }

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow space-y-6">
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
            onClick={() => router.push("/profile?profile=key-skills&Step=3")}
            className="bg-[#43C17A] cursor-pointer text-white px-5 py-1.5 rounded-md text-sm"
          >
            Next
          </button>
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
                  type === "primary"        ? primarySaveRef
                  : type === "secondary"    ? secondarySaveRef
                  : type === "undergraduate"? undergraduateSaveRef
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
            className={`px-6 py-2 rounded-md text-sm text-white ${
              isSubmitting ? "opacity-50 bg-[#43C17A]  cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}


function EducationPageShimmer() {
  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-5 w-24 rounded bg-gray-200" />
        <div className="flex gap-3">
          <div className="h-8 w-20 rounded-md bg-gray-200" />
          <div className="h-8 w-16 rounded-md bg-gray-200" />
        </div>
      </div>
      <div className="space-y-4 rounded-xl p-6 w-[85%] mx-auto">
        <div className="flex justify-between items-center w-[85%] mb-3">
          <div className="h-4 w-36 rounded bg-gray-200" />
          <div className="w-5 h-5 rounded-full bg-gray-200" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1 w-[85%]">
            <div className="h-3 w-28 rounded bg-gray-200" />
            <div className="h-9 w-full rounded-md bg-gray-100" />
          </div>
        ))}
        <div className="flex justify-end mt-6">
          <div className="h-9 w-24 rounded-md bg-gray-200" />
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
      className={`w-full text-left px-4 py-2 text-sm ${
        disabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}