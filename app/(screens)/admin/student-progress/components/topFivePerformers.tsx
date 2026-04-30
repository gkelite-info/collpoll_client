export interface TopPerformer {
  id: string;
  name: string;
  avatar?: string | null;
  score: number;
}

interface TopPerformersProps {
  performers: TopPerformer[];
  className?: string;
}

const PerformerRow = ({ performer }: { performer: TopPerformer }) => {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)_minmax(120px,1fr)_56px] items-center gap-3 border-b border-gray-50 py-3 last:border-0">
      <div className="mr-3 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-100">
        {performer.avatar ? (
          <img
            src={performer.avatar}
            alt={performer.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#E5E7EB] text-xs font-semibold text-[#6B7280]">
            {performer.name.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
        <h4
          className="inline-block pr-2 text-[13px] font-medium leading-tight text-gray-800"
          title={performer.name}
        >
          {performer.name}
        </h4>
      </div>

      <div className="flex min-w-0 items-center">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#16284F]">
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-[#43C17A] transition-all duration-500 ease-out"
            style={{ width: `${performer.score}%` }}
          />
        </div>
      </div>

      <div className="w-14 shrink-0 text-right">
        <span className="text-[14px] font-bold text-gray-700">
          {performer.score}%
        </span>
      </div>
    </div>
  );
};

export default function TopFivePerformers({ performers }: TopPerformersProps) {
  const visiblePerformers = performers
    .filter((performer) => performer.score > 0)
    .slice(0, 5);

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white p-5 font-sans shadow-sm">
      <h2 className="mb-1 text-[18px] font-bold text-gray-900">
        Top 5 Performers
      </h2>

      <div className="mt-2 flex flex-col">
        {visiblePerformers.length ? (
          visiblePerformers.map((performer) => (
            <PerformerRow key={performer.id} performer={performer} />
          ))
        ) : (
          <div className="py-8 text-sm text-[#6B7280]">
            No performer data available.
          </div>
        )}
      </div>
    </div>
  );
}
