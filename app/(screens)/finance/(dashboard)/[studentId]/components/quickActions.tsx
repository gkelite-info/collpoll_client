"use client";

import React from "react";
import { EnvelopeSimple, DownloadSimple, Plus } from "@phosphor-icons/react";

const QuickActions = () => {
  const actions = [
    {
      label: "Send Email",
      icon: EnvelopeSimple,
      onClick: () => console.log("Email clicked"),
    },
    {
      label: "Download Statement",
      icon: DownloadSimple,
      onClick: () => console.log("Download clicked"),
    },
    {
      label: "Add Note",
      icon: Plus,
      onClick: () => console.log("Note clicked"),
    },
  ];

  return (
    <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 h-full flex flex-col">
      <h3 className="text-[#282828] font-bold text-[15px] mb-4">
        Quick Actions
      </h3>

      <div className="flex flex-col gap-3 ">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-full bg-[#E5FDF4] flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-colors">
              <action.icon weight="bold" size={14} />
            </div>

            <span className="text-[#10B981] font-bold text-[13px] group-hover:text-[#059669] transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
