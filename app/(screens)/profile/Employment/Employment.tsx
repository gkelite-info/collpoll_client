"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import EmploymentForm from "./EmploymentForm";
import { useRouter } from "next/navigation";


export default function Employment() {
  const [formCount, setFormCount] = useState(1);
  const [submittedForms, setSubmittedForms] = useState<boolean[]>([false]);
  const router = useRouter()
  const handleAdd = () => {
    const lastIndex = formCount - 1;

    if (!submittedForms[lastIndex]) {
      toast.error("Please submit the latest employment before adding a new one.");
      return;
    }

    setFormCount((p) => p + 1);
    setSubmittedForms((p) => [...p, false]);
  };

  const markSubmitted = (index: number) => {
    setSubmittedForms((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full min-h-screen mt-2 mb-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-[#282828]">Employment</h2>

        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium"
          >
            Add +
          </button>
          <button
            onClick={() => router.push('/profile?academic-achievements')}
            className="bg-[#43C17A] cursor-pointer text-white px-6 py-1.5 rounded-md text-sm font-medium">
            Next
          </button>
        </div>
      </div>

      {Array.from({ length: formCount }).map((_, i) => (
        <EmploymentForm
          key={i}
          index={i}
          onSubmit={() => markSubmitted(i)}
        />
      ))}
    </div>
  );
}
