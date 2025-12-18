export interface TopPerformer {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

interface TopPerformersProps {
  performers: TopPerformer[];
  className?: string;
}

const PerformerRow = ({ performer }: { performer: TopPerformer }) => {
  return (
    <div className="flex items-center py-3 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 mr-3 border border-gray-100">
        <img
          src={performer.avatar}
          alt={performer.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-24 sm:w-32 shrink-0">
        <h4
          className="text-[13px] font-medium text-gray-800 leading-tight truncate pr-2"
          title={performer.name}
        >
          {performer.name}
        </h4>
      </div>

      <div className="flex items-center min-w-[135px] mr-3">
        <div className="h-2.5 w-full bg-[#16284F] rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 left-0 h-full bg-[#43C17A] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${performer.score}%` }}
          />
        </div>
      </div>

      <div className="w-10 text-right shrink-0">
        <span className="text-[14px] font-bold text-gray-700">
          {performer.score}%
        </span>
      </div>
    </div>
  );
};

export default function TopFivePerformers({ performers }: TopPerformersProps) {
  return (
    <div className={`w-full bg-white p-5 rounded-xl font-sans shadow-sm`}>
      <h2 className="text-[18px] font-bold text-gray-900 mb-1">
        Top 5 Performers
      </h2>

      <div className="flex flex-col mt-2">
        {performers.map((performer) => (
          <PerformerRow key={performer.id} performer={performer} />
        ))}
      </div>
    </div>
  );
}
