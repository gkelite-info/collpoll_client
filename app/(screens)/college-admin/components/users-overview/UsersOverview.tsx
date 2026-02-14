"use client";

import UsersPieChart from "./UsersPieChart";

export default function UsersOverview() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-6">
      <h2 className="font-semibold text-lg">
        Users Overview
      </h2>

      <UsersPieChart />
    </div>
  );
}
