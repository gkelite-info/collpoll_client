import React from "react";

import UpcomingEvents from "./UpcomingEvents";
import StatCardsGrid from "./statCardsGrid";
import CollegeOverviewTable from "../tables/CollegeOverviewTable";
import TotalUsersCompare from "../charts/TotalUsersCompare";

import {
  MOCK_COLLEGE_TABLE,
  MOCK_EVENTS,
  MOCK_REGISTRATIONS,
  MOCK_STAT_CARDS,
} from "../data";

const GridDashMain: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
        <StatCardsGrid cards={MOCK_STAT_CARDS} />

        <CollegeOverviewTable data={MOCK_COLLEGE_TABLE} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TotalUsersCompare data={MOCK_REGISTRATIONS} />
          <UpcomingEvents events={MOCK_EVENTS} />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #888;
          border-radius: 10px;
          border: 2px solid #f1f1f1;
        }
      `,
        }}
      />
    </div>
  );
};

export default GridDashMain;
