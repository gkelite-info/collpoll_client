"use client";

import { useState } from "react";
import { List } from "@phosphor-icons/react";
import WellbeingRight from "../components/WellbeingRight";

import Image from "next/image";
import ExecutiveProfileCard from "./components/ExecutiveProfileCard";
import ContributionSection from "./components/ContributionSection";
import ResolvedIssuesList from "./components/ResolvedIssuesList";

export default function PerformancePage() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [executivesList, setExecutivesList] = useState([
    { id: 1, name: "Naveen Kumar", staffId: "ID-274292", image: "https://i.pravatar.cc/150?img=11", active: true },
    { id: 2, name: "Habeeba Nazeer", staffId: "ID-274292", image: "https://i.pravatar.cc/150?img=47", active: false },
    { id: 3, name: "Sachin Dantala", staffId: "ID-274292", image: "https://i.pravatar.cc/150?img=12", active: false },
    { id: 4, name: "Manav Rajput", staffId: "ID-274292", image: "https://i.pravatar.cc/150?img=33", active: false },
    { id: 5, name: "Zoha Sadaf", staffId: "ID-274292", image: "https://i.pravatar.cc/150?img=5", active: false },
  ]);

  const handleSelectExecutive = (id: number) => {
    setExecutivesList((prev) =>
      prev.map((exec) => ({ ...exec, active: exec.id === id }))
    );
    setIsMobileDrawerOpen(false);
  };

  const executivesSidebar = (
    <div className="bg-white rounded-[16px] -mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col shrink-0">
      <h3 className="text-[18px] font-bold text-[#16284F] ">Executives</h3>
      <div className="flex flex-col gap-2">
        {executivesList.map((exec) => (
          <div
            key={exec.id}
            onClick={() => handleSelectExecutive(exec.id)}
            className={`flex items-center gap-3 p-3 rounded-[12px] cursor-pointer transition-all shadow-sm ${exec.active
                ? "bg-[#E8F8EF] border border-[#D3F1E0]"
                : "bg-white hover:bg-gray-50 border border-gray-100"
              }`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-200">
              <Image
                src={exec.image}
                alt={exec.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-[14px] font-bold text-[#16284F] truncate">{exec.name}</p>
              <p className="text-[12px] font-bold text-gray-500 mt-0.5">{exec.staffId}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="flex w-full overflow-x-hidden relative">
      <div className="w-full lg:w-[68%] p-4 md:p-6 lg:p-2 flex flex-col gap-6 lg:h-[130vh] pb-6">
        <div className="flex items-center justify-between mt-2 shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#282828] md:text-lg font-bold leading-tight">
              Performance
            </h1>
            <p className="text-[#282828] text-[13px] md:text-sm font-medium">
              Monitor and track performance of well-being executives
            </p>
          </div>

          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-[#16284F] hover:bg-gray-50 active:scale-95 transition-all"
          >
            <List size={24} weight="bold" />
          </button>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
          <ExecutiveProfileCard />
          <ContributionSection />
          <ResolvedIssuesList />
        </div>

      </div>

      <WellbeingRight
        button={false}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
        hideDefaultMobileContent={true}
      >
        {executivesSidebar}
      </WellbeingRight>

    </main>
  );
}