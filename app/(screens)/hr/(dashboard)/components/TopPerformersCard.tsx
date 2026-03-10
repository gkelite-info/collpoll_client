import React from "react";

export interface Performer {
  rank: number;
  name: string;
  attendance: string;
  score: number;
  classes: string;
}

interface Props {
  performers: Performer[];
}

export default function TopPerformersCard({ performers }: Props) {
  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 w-full text-[13px]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-600 font-semibold border-b border-gray-100">
            <th className="pb-3 px-2 font-semibold">Rank</th>
            <th className="pb-3 px-2 font-semibold">Name</th>
            <th className="pb-3 px-2 font-semibold">Attendance %</th>
            <th className="pb-3 px-2 font-semibold">Teaching Score</th>
            <th className="pb-3 px-2 font-semibold">Classes Taken</th>
          </tr>
        </thead>
        <tbody>
          {performers.map((p, idx) => (
            <tr
              key={idx}
              className="text-[#282828] border-b border-gray-50 last:border-none"
            >
              <td className="py-2.5 px-2 font-medium flex items-center gap-1.5">
                <span>{getMedal(p.rank)}</span> {p.rank}
              </td>
              <td className="py-2.5 px-2">{p.name}</td>
              <td className="py-2.5 px-2">{p.attendance}</td>
              <td className="py-2.5 px-2">{p.score}</td>
              <td className="py-2.5 px-2">{p.classes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
