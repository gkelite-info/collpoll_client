"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import InternshipForm from "./internshipForm";

export default function Internships() {
  const [forms, setForms] = useState([{ id: 1, submitted: false }]);

  const handleAdd = () => {
    const last = forms[forms.length - 1];

    if (!last.submitted) {
      // toast.error(
      //   "Please submit the current internship before adding a new one."
      // );
      alert("Please submit the current internship before adding a new one.")
      return;
    }

    setForms((prev) => [
      ...prev,
      { id: Date.now(), submitted: false },
    ]);
  };

  return (
    <div className="mt-3">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-medium text-[#282828]">
            Internships
          </h2>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              type="button"
              className="inline-flex cursor-pointer items-center gap-2 bg-[#43C17A] hover:bg-emerald-600 text-white text-sm font-medium px-3 py-1.5 rounded"
            >
              Add <Plus size={14} />
            </button>

            <button
              type="button"
              className="inline-flex items-center cursor-pointer bg-[#43C17A] hover:bg-emerald-600 text-white text-sm font-medium px-3 py-1.5 rounded"
            >
              Next
            </button>
          </div>
        </div>
        {forms.map((f, index) => (
          <div key={f.id}>
            <h3 className="mt-6 text-lg font-semibold text-[#282828] -mb-1">
              Internship {index + 1}
            </h3>

            <InternshipForm
              onSubmitted={() =>
                setForms((prev) =>
                  prev.map((x, i) =>
                    i === index ? { ...x, submitted: true } : x
                  )
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
