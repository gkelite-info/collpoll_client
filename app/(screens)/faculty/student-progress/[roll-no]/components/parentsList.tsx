"use client";

import { ChatCircleDots } from "@phosphor-icons/react";

export interface Parent {
  name: string;
  relation: string;
  avatar: string;
}

interface ParentsListProps {
  parents: Parent[];
  onChatOpen: (parent: Parent) => void;
}

export default function ParentsList({ parents, onChatOpen }: ParentsListProps) {
  return (
    <div className="w-full rounded-[20px] bg-white p-6 shadow-sm h-full">
      <h3 className="mb-6 text-xl font-bold text-[#333333]">
        Parent’s Information
      </h3>

      <div className="flex flex-col gap-4">
        {parents.map((parent) => (
          <div
            key={parent.name}
            className="flex items-center justify-between rounded-full bg-[#E8F6E2] p-3"
          >
            <div className="flex items-center gap-4">
              <img
                src={parent.avatar}
                alt={parent.name}
                className="h-14 w-14 rounded-full object-cover shadow-sm border-2 border-white"
              />

              <div className="flex flex-col">
                <p className="text-base font-bold text-[#333333]">
                  {parent.name}
                </p>
                <p className="text-sm font-medium text-[#666666]">
                  {parent.relation}
                </p>
              </div>
            </div>

            <button
              onClick={() => onChatOpen(parent)}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#A1D683] text-white transition-transform hover:scale-105 active:scale-95 shadow-sm"
            >
              <ChatCircleDots size={34} weight="fill" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
