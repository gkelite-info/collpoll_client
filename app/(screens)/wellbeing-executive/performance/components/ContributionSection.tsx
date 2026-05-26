import type { Executive } from "../types";

export default function ContributionSection({
  executive,
}: {
  executive: Executive;
}) {
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (executive.contribution / 100) * circumference;

  return (
    <section className="shrink-0">
      <h2 className="mb-3 text-[16px] font-bold text-[#282828]">
        Contribution :{" "}
        <span className="text-[#43C17A]">{executive.category}</span>
      </h2>
      <div className="flex flex-col items-center gap-6 rounded-lg bg-white p-5 shadow-sm sm:flex-row">
        <div className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#CBDAC9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#437E66"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-[22px] font-extrabold text-[#16284F]">
              {executive.resolvedIssues}
            </p>
            <p className="text-[9px] font-bold text-[#16284F]">
              Issues Resolved
            </p>
          </div>
        </div>

        <div className="w-full flex-1">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-[30px] font-extrabold text-[#282828]">
              {executive.totalIssues}
            </span>
            <span className="text-[12px] font-bold text-[#16284F]">
              Total Issues
            </span>
          </div>
          <div className="mb-3 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-[#437E66]"
              style={{ width: `${executive.contribution}%` }}
            />
          </div>
          <div className="flex justify-between text-[12px] font-bold">
            <span className="text-gray-500">Issues Resolved</span>
            <span className="text-[#16284F]">
              Contribution Share{" "}
              <span className="text-[#282828]">{executive.contribution}%</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
