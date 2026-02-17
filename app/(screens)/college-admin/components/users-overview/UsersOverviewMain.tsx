"use client";

import { useRouter, useSearchParams } from "next/navigation";
import CardComponent from "@/app/utils/card";
import { UsersThree } from "@phosphor-icons/react";
import StudentsScreen from "./StudentsScreen";
import AdminsScreen from "./AdminsScreen";
import { Suspense } from "react";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import ParentsScreen from "./ParentScreen";
import FacultyScreen from "./FacultyScreen";
import FinanceScreen from "./FinanceScreen";
import PlacementScreen from "./PlacementScreen";
import DonutCard from "./Donut";

const educationDistribution = [
  {
    title: "B.Tech",
    total: 4620,
    data: [
      { role: "Admins", value: 20 },
      { role: "Students", value: 3000 },
      { role: "Parents", value: 3000 },
      { role: "Faculty", value: 210 },
      { role: "Finance", value: 48 },
      { role: "Placement", value: 48 },
    ],
  },
  {
    title: "Polytechnic",
    total: 1200,
    data: [
      { role: "Admins", value: 20 },
      { role: "Students", value: 1050 },
      { role: "Parents", value: 1050 },
      { role: "Faculty", value: 85 },
      { role: "Finance", value: 18 },
      { role: "Placement", value: 15 },
    ],
  },
  {
    title: "Degree",
    total: 900,
    data: [
      { role: "Admins", value: 10 },
      { role: "Students", value: 700 },
      { role: "Parents", value: 700 },
      { role: "Faculty", value: 62 },
      { role: "Finance", value: 12 },
      { role: "Placement", value: 10 },
    ],
  },
  {
    title: "Degree",
    total: 900,
    data: [
      { role: "Admins", value: 10 },
      { role: "Students", value: 700 },
      { role: "Parents", value: 700 },
      { role: "Faculty", value: 62 },
      { role: "Finance", value: 12 },
      { role: "Placement", value: 10 },
    ],
  },
  {
    title: "Degree",
    total: 900,
    data: [
      { role: "Admins", value: 10 },
      { role: "Students", value: 700 },
      { role: "Parents", value: 700 },
      { role: "Faculty", value: 62 },
      { role: "Finance", value: 12 },
      { role: "Placement", value: 10 },
    ],
  },
];

function UsersOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "admins";

  const cards = [
    {
      key: "admins",
      label: "Admins",
      value: "12",
      light: "bg-[#DED5FF]",
      dark: "bg-[#7557E3]",
      iconColor: "#7557E3",
    },
    {
      key: "students",
      label: "Students",
      value: "4,620",
      light: "bg-[#FFEDDA]",
      dark: "bg-[#FFCB92]",
      iconColor: "#FFCB92",
    },
    {
      key: "parents",
      label: "Parents",
      value: "480",
      light: "bg-[#E6FBEA]",
      dark: "bg-[#66CC93]",
      iconColor: "#43C17A",
    },
    {
      key: "faculty",
      label: "Faculty",
      value: "320",
      light: "bg-[#CEE6FF]",
      dark: "bg-[#60AEFF]",
      iconColor: "#60AEFF",
    },
    {
      key: "finance",
      label: "Finance Manager",
      value: "48",
      light: "bg-[#FFF0E1]",
      dark: "bg-[#FF7D00]",
      iconColor: "#FF7D00",
    },
    {
      key: "placement",
      label: "Placement Manager",
      value: "48",
      light: "bg-[#FBE1FF]",
      dark: "bg-[#E646FF]",
      iconColor: "#E646FF",
    },
  ];

  const renderScreen = () => {
    switch (type) {
      case "students": return <StudentsScreen />;
      case "parents": return <ParentsScreen />;
      case "faculty": return <FacultyScreen />;
      case "finance": return <FinanceScreen />;
      case "placement": return <PlacementScreen />;
      default: return <AdminsScreen />;
    }
  };

  return (
    <div className="space-y-6 overflow-hidden">

      <h2 className="text-lg font-semibold">
        Total Users : <span className="text-green-600">5480</span>
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-2">
        {cards.map((card, index) => {
          const isActive = type === card.key;

          return (
            <div
              key={card.key}
              onClick={() =>
                router.push(`?tab=users-overview&type=${card.key}`)
              }
              className="cursor-pointer"
            >
              <CardComponent
                key={index}
                icon={
                  <UsersThree
                    size={20}
                    color={card.iconColor}
                    weight="fill"
                  />
                }
                style={isActive ? card.dark : card.light}
                value={card.value}
                label={card.label}
              />
            </div>
          );
        })}
      </div>

      {type !== "admins" &&
        <div>
          <h3 className="text-md font-bold text-gray-700 mb-4">User Distribution by Education Type</h3>
          <div style={{ height: "45vh", overflowX: "auto", overflowY: "hidden", display: "flex", columnGap: 15 }}>
            {educationDistribution.map((item, index) => (
              <DonutCard key={index} {...item} />
            ))}
          </div>
        </div>
      }
      {renderScreen()}
    </div>
  );
}

export default function UsersOverviewMain() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><Loader /></div>}>
      <UsersOverview />
    </Suspense>
  );
}
