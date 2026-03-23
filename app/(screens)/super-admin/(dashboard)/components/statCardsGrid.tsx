import React from "react";
import { StatCardData } from "../data";

interface StatCardsGridProps {
  cards: StatCardData[];
}

const StatCardsGrid: React.FC<StatCardsGridProps> = ({ cards }) => {
  const cardWidth = `${100 / cards.length}%`;

  return (
    <div className="flex gap-2 w-full">
      {cards.map((stat, idx) => (
        <div
          key={idx}
          style={{ width: cardWidth }}
          className={`flex flex-col justify-between px-3 py-4 rounded-xl ${stat.bgColor} min-w-0`}
        >
          <div className="flex items-center gap-2">
            <div className={`${stat.iconBg} p-1.5 rounded-md text-white`}>
              <stat.icon size={16} strokeWidth={2.5} />
            </div>
            <span className={`text-base font-medium ${stat.textColor}`}>
              {stat.value}
            </span>
          </div>

          <span
            className={`text-[11px] mt-2 font-medium ${stat.textColor} opacity-90 truncate`}
          >
            {stat.title}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatCardsGrid;
