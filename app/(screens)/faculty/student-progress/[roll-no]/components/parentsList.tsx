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
    <div className="h-full w-full rounded-2xl md:rounded-[20px] bg-white p-4 md:p-6 shadow-sm">
      <h3 className="mb-4 md:mb-6 text-[16px] md:text-xl font-bold text-[#333333]">
        Parent&apos;s Information
      </h3>

      {parents.length ? (
        <div className="flex flex-col gap-3 md:gap-4">
          {parents.map((parent) => (
            <div
              key={`${parent.name}-${parent.relation}`}
              className="flex items-center justify-between rounded-full bg-[#E8F6E2] p-2 md:p-3"
            >
              <div className="flex items-center gap-3 md:gap-4 min-w-0 pr-2">
                <img
                  src={parent.avatar}
                  alt={parent.name}
                  className="h-10 w-10 md:h-14 md:w-14 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                />
                <div className="flex flex-col min-w-0">
                  <p className="truncate text-sm md:text-base font-bold text-[#333333]">
                    {parent.name}
                  </p>
                  <p className="truncate text-[11px] md:text-sm font-medium text-[#666666]">
                    {parent.relation}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onChatOpen(parent)}
                className="flex h-10 w-10 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full bg-[#A1D683] text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <ChatCircleDots
                  size={24}
                  className="md:w-[34px] md:h-[34px]"
                  weight="fill"
                />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[160px] md:min-h-[220px] items-center justify-center rounded-[20px] border border-dashed border-[#D6DADF] bg-[#FAFBFC] px-4 md:px-6 text-center mt-2">
          <p className="max-w-xs text-[13px] md:text-base font-medium text-[#8A8F98]">
            Parent registration not done for this student.
          </p>
        </div>
      )}
    </div>
  );
}
