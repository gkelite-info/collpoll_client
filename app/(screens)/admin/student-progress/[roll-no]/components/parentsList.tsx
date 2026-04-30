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
    <div className="h-full w-full rounded-[20px] bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-xl font-bold text-[#333333]">
        Parent&apos;s Information
      </h3>

      {parents.length ? (
        <div className="flex flex-col gap-4">
          {parents.map((parent) => (
            <div
              key={`${parent.name}-${parent.relation}`}
              className="flex items-center justify-between rounded-full bg-[#E8F6E2] p-3"
            >
              <div className="flex items-center gap-4">
                <img
                  src={parent.avatar}
                  alt={parent.name}
                  className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm"
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
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#A1D683] text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <ChatCircleDots size={34} weight="fill" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[220px] items-center justify-center rounded-[20px] border border-dashed border-[#D6DADF] bg-[#FAFBFC] px-6 text-center">
          <p className="max-w-xs text-base font-medium text-[#8A8F98]">
            Parent registration not done for this student.
          </p>
        </div>
      )}
    </div>
  );
}
