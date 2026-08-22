"use client";

import { ChatCircleDots } from "@phosphor-icons/react";
import { Avatar } from "@/app/utils/Avatar";

export interface Parent {
  name: string;
  relation: string;
  avatar: string;
  parentId: number;
  userId: number;
}

interface ParentsListProps {
  parents: Parent[];
  onChatOpen: (parent: Parent) => void;
}

export default function ParentsList({ parents, onChatOpen }: ParentsListProps) {
  return (
    <div className="h-full w-full rounded-2xl bg-white p-4 shadow-sm md:rounded-[20px] md:p-6">
      <h3 className="mb-4 text-base font-bold text-[#333333] md:mb-6 md:text-xl">
        Parent&apos;s Information
      </h3>

      {parents.length ? (
        <div className="flex flex-col gap-3 md:gap-4">
          {parents.map((parent) => (
            <div
              key={`${parent.name}-${parent.relation}`}
              className="flex items-center justify-between rounded-full bg-[#E8F6E2] p-2 md:p-3"
            >
              <div className="flex min-w-0 items-center gap-3 pr-2 md:gap-4">
                <div className="shrink-0 scale-[0.72] md:scale-100">
                  <Avatar src={parent.avatar} alt={parent.name} size={56} />
                </div>

                <div className="flex min-w-0 flex-col">
                  <p className="truncate text-sm font-bold text-[#333333] md:text-base">
                    {parent.name}
                  </p>
                  <p className="truncate text-[11px] font-medium text-[#666666] md:text-sm">
                    {parent.relation}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onChatOpen(parent)}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#A1D683] text-white shadow-sm transition-transform hover:scale-105 active:scale-95 md:h-14 md:w-14"
              >
                <ChatCircleDots size={24} weight="fill" className="md:h-[34px] md:w-[34px]" />
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
