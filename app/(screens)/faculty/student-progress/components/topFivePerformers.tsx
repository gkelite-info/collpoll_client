import { Avatar } from "@/app/utils/Avatar";

export interface TopPerformer {
  id: string;
  name: string;
  avatar?: string | null;
  score: number;
}

interface TopPerformersProps {
  performers: TopPerformer[];
}

const PerformerRow = ({ performer }: { performer: TopPerformer }) => {
  return (
    <div className="flex items-center gap-2 md:gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="h-8 w-8 md:h-10 md:w-10 shrink-0 overflow-hidden rounded-full border border-gray-100">
        <Avatar src={performer.avatar} size={40} alt={performer.name} />
      </div>

      <div className="min-w-0 flex-1">
        <h4
          className="truncate text-[12px] md:text-[14px] font-medium leading-tight text-gray-800"
          title={performer.name}
        >
          {performer.name}
        </h4>
      </div>

      <div className="flex items-center w-[80px] md:w-[120px] shrink-0">
        <div className="h-2 md:h-2.5 w-full bg-[#16284F] rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 left-0 h-full bg-[#43C17A] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${performer.score}%` }}
          />
        </div>
      </div>

      <div className="w-10 md:w-12 text-right shrink-0">
        <span className="text-[12px] md:text-[14px] font-bold text-gray-700">
          {performer.score}%
        </span>
      </div>
    </div>
  );
};

export default function TopFivePerformers({ performers }: TopPerformersProps) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-xl bg-white p-4 lg:p-5 font-sans shadow-sm">
      <h2 className="text-[15px] md:text-[18px] font-bold text-gray-900 mb-1">
        Top 5 Performers
      </h2>

      <div className="flex flex-col mt-2 flex-1">
        {performers.length ? (
          performers.map((performer) => (
            <PerformerRow key={performer.id} performer={performer} />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center py-8 text-sm text-[#6B7280]">
            No performer data available.
          </div>
        )}
      </div>
    </div>
  );
}
