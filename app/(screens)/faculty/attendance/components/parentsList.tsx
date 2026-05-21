import { ChatCircleDots } from "@phosphor-icons/react";

export interface Parent {
  name: string;
  role: string;
  photo: string;
}

interface ParentsListProps {
  parents: Parent[];
}

export function ParentsList({ parents }: ParentsListProps) {
  return (
    <div className="w-full rounded-2xl bg-white p-4 md:p-6 shadow-sm">
      <h3 className="mb-4 text-base md:text-lg font-bold text-[#333333]">
        Parent&apos;s
      </h3>

      <div className="flex flex-col gap-3">
        {parents.map((parent) => (
          <div
            key={parent.name}
            className="flex items-center justify-between rounded-full bg-[#E8F6E2] p-3 md:p-5 md:pr-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={parent.photo}
                alt={parent.name}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-white object-cover shadow-sm shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <p className="text-[13px] md:text-md font-bold text-[#333333] truncate">
                  {parent.name}
                </p>
                <p className="text-[10px] md:text-[11px] font-medium text-[#666666] truncate">
                  {parent.role}
                </p>
              </div>
            </div>
            <button className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-[#A1D683] text-white transition-transform hover:scale-105 active:scale-95">
              <ChatCircleDots size={20} weight="fill" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
