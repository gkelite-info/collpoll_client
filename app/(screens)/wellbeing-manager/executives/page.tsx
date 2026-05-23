"use client";

import { useMemo, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import WellbeingRight from "../components/WellbeingRight";
import AssignExecutiveModal from "../components/AssignExecutiveModal";
import { Pagination } from "../../admin/academic-setup/components/pagination";
import ExecutiveCard from "./components/ExecutiveCard";

type ExecutiveCategory =
  | "Infrastructure"
  | "Safety"
  | "Sports"
  | "Events"
  | "Medical";

type Executive = {
  id: number;
  name: string;
  email: string;
  category: ExecutiveCategory;
  image: string;
};

const tabs: Array<"All" | ExecutiveCategory> = [
  "All",
  "Infrastructure",
  "Safety",
  "Sports",
  "Events",
  "Medical",
];

const executives: Executive[] = [
  { id: 1, name: "Shreya Patel", email: "shreyapatel@gmail.com", category: "Infrastructure", image: "https://i.pravatar.cc/160?img=47" },
  { id: 2, name: "Ankitha Sharma", email: "ankithasharma@gmail.com", category: "Safety", image: "https://i.pravatar.cc/160?img=45" },
  { id: 3, name: "Rahul Sharma", email: "rahulsharma@gmail.com", category: "Sports", image: "https://i.pravatar.cc/160?img=11" },
  { id: 4, name: "Priya Sharma", email: "priyasharma@gmail.com", category: "Medical", image: "https://i.pravatar.cc/160?img=5" },
  { id: 5, name: "Shreya Patel", email: "shreyapatel@gmail.com", category: "Infrastructure", image: "https://i.pravatar.cc/160?img=32" },
  { id: 6, name: "Ankitha Sharma", email: "ankithasharma@gmail.com", category: "Safety", image: "https://i.pravatar.cc/160?img=49" },
  { id: 7, name: "Ankitha Sharma", email: "ankithasharma@gmail.com", category: "Sports", image: "https://i.pravatar.cc/160?img=23" },
  { id: 8, name: "Priya Sharma", email: "priyasharma@gmail.com", category: "Events", image: "https://i.pravatar.cc/160?img=26" },
  { id: 9, name: "Rahul Patel", email: "rahulpatel@gmail.com", category: "Medical", image: "https://i.pravatar.cc/160?img=12" },
  { id: 10, name: "Rohan Mehta", email: "rohanmehta@gmail.com", category: "Infrastructure", image: "https://i.pravatar.cc/160?img=13" },
  { id: 11, name: "Kavya Nair", email: "kavyanair@gmail.com", category: "Safety", image: "https://i.pravatar.cc/160?img=44" },
  { id: 12, name: "Aarav Singh", email: "aaravsingh@gmail.com", category: "Sports", image: "https://i.pravatar.cc/160?img=15" },
  { id: 13, name: "Meera Iyer", email: "meeraiyer@gmail.com", category: "Events", image: "https://i.pravatar.cc/160?img=48" },
  { id: 14, name: "Nikhil Rao", email: "nikhilrao@gmail.com", category: "Medical", image: "https://i.pravatar.cc/160?img=16" },
  { id: 15, name: "Sneha Kapoor", email: "snehakapoor@gmail.com", category: "Infrastructure", image: "https://i.pravatar.cc/160?img=25" },
  { id: 16, name: "Aditya Menon", email: "adityamenon@gmail.com", category: "Safety", image: "https://i.pravatar.cc/160?img=17" },
  { id: 17, name: "Ishita Sen", email: "ishitasen@gmail.com", category: "Events", image: "https://i.pravatar.cc/160?img=29" },
  { id: 18, name: "Kabir Khan", email: "kabirkhan@gmail.com", category: "Sports", image: "https://i.pravatar.cc/160?img=18" },
];

const itemsPerPage = 9;

export default function ExecutivesPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const filteredExecutives = useMemo(() => {
    return activeTab === "All"
      ? executives
      : executives.filter((executive) => executive.category === activeTab);
  }, [activeTab]);

  const visibleExecutives = filteredExecutives.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleTabChange = (tab: (typeof tabs)[number]) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row">
      <section className="flex w-full flex-col p-2 lg:h-full lg:w-[68%] lg:py-5">
        <div className="sticky top-0 z-20 mb-4 grid grid-cols-1 gap-3 bg-[#F4F4F4] py-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start lg:static lg:block lg:py-0">
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-[repeat(3,minmax(120px,1fr))] lg:flex lg:flex-wrap lg:overflow-visible lg:pb-0 custom-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`h-[40px] min-w-0 cursor-pointer rounded-[6px] px-3 text-[13px] font-bold transition-colors sm:h-[42px] lg:h-[32px] lg:min-w-[104px] lg:px-4 ${
                    isActive
                      ? "bg-[#16284F] text-white"
                      : "bg-[#DEDFE3] text-[#16284F] hover:bg-[#D3D5DB]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex h-[44px] w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#43C17A] px-5 text-sm font-bold text-white shadow-[0_2px_10px_rgba(67,193,122,0.25)] transition-all hover:bg-[#34A362] active:scale-95 md:w-[190px] lg:hidden"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-3 border-[#EFEFEF] text-[#EFEFEF]">
              <Plus size={12} weight="bold" />
            </span>
            <span>Add Executive</span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-visible rounded-[5px] ">
          <div className="grid auto-rows-max grid-cols-1 items-start gap-4 overflow-visible pb-0.5 pr-1 sm:grid-cols-2 lg:overflow-y-auto lg:custom-scrollbar xl:grid-cols-3">
            {visibleExecutives.map((executive) => (
              <ExecutiveCard
                key={executive.id}
                name={executive.name}
                email={executive.email}
                category={executive.category}
                image={executive.image}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredExecutives.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            roundedBottom="rounded-b-md"
          />
        </div>
      </section>

      <WellbeingRight
        button
        headerActionLabel="Add Executive"
        onHeaderActionClick={() => setIsAssignModalOpen(true)}
      />

      <AssignExecutiveModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </main>
  );
}
