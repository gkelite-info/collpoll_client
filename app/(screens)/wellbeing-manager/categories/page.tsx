"use client";
import { useState } from "react";
import WellbeingRight from "../components/WellbeingRight";
import CategoryCard from "./components/CategoryCard";
import { CaretDown, Plus } from "@phosphor-icons/react";
import CreateCategoryModal from "../components/CreateCategoryModal";

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = [
    {
      title: "Medical",
      executivesAssigned: 2,
      executives: [
        { id: 1, name: "Rahul Sharma", staffId: "ID-28939", role: "Medical Executive", image: "https://i.pravatar.cc/150?img=11" },
        { id: 2, name: "Shreya Patel", staffId: "ID-28939", role: "Medical Executive", image: "https://i.pravatar.cc/150?img=47" },
        { id: 3, name: "Sameer Rathod", staffId: "ID-28939", role: "Medical Executive", image: "https://i.pravatar.cc/150?img=12" },
      ]
    },
    {
      title: "Infrastructure",
      executivesAssigned: 2,
      executives: [
        { id: 1, name: "Rahul Sharma", staffId: "ID-28939", role: "Infrastructure", image: "https://i.pravatar.cc/150?img=11" },
        { id: 2, name: "Shreya Patel", staffId: "ID-28939", role: "Infrastructure", image: "https://i.pravatar.cc/150?img=47" },
        { id: 3, name: "Sameer Rathod", staffId: "ID-28939", role: "Infrastructure", image: "https://i.pravatar.cc/150?img=12" },
      ]
    },
    {
      title: "Event",
      executivesAssigned: 2,
      executives: [
        { id: 1, name: "Rahul Sharma", staffId: "ID-28939", role: "Event Executive", image: "https://i.pravatar.cc/150?img=11" },
        { id: 2, name: "Shreya Patel", staffId: "ID-28939", role: "Event Executive", image: "https://i.pravatar.cc/150?img=47" },
        { id: 3, name: "Sameer Rathod", staffId: "ID-28939", role: "Event Executive", image: "https://i.pravatar.cc/150?img=12" },
      ]
    },
    {
      title: "Sports",
      executivesAssigned: 2,
      executives: [
        { id: 1, name: "Rahul Sharma", staffId: "ID-28939", role: "Sports Executive", image: "https://i.pravatar.cc/150?img=11" },
        { id: 2, name: "Shreya Patel", staffId: "ID-28939", role: "Sports Executive", image: "https://i.pravatar.cc/150?img=47" },
        { id: 3, name: "Sameer Rathod", staffId: "ID-28939", role: "Sports Executive", image: "https://i.pravatar.cc/150?img=12" },
      ]
    },
    {
      title: "Safety",
      executivesAssigned: 2,
      executives: [
        { id: 1, name: "Rahul Sharma", staffId: "ID-28939", role: "Safety Executive", image: "https://i.pravatar.cc/150?img=11" },
        { id: 2, name: "Shreya Patel", staffId: "ID-28939", role: "Safety Executive", image: "https://i.pravatar.cc/150?img=47" },
        { id: 3, name: "Sameer Rathod", staffId: "ID-28939", role: "Safety Executive", image: "https://i.pravatar.cc/150?img=12" },
      ]
    }
  ];

  return (
    <main className="flex flex-col lg:flex-row w-full min-h-screen overflow-x-hidden">

      <div className="w-full lg:w-[68%] p-4 md:p-6 lg:p-2 lg:pb-4 flex flex-col lg:h-screen">
        <div className="mb-4 mt-4 flex flex-col gap-4 justify-between">
          <div className="relative inline-flex items-center">
            <select className="cursor-pointer appearance-none bg-[#16284F] text-[#ffffff] py-1.5 pl-3 pr-8 rounded-md outline-none text-[13px] md:text-sm font-medium h-[34px]">
              <option value="">College</option>
              <option value="engineering">Engineering</option>
              <option value="medical">Medical</option>
              <option value="arts">Arts</option>
            </select>
            <CaretDown size={14} weight="bold" color="#ffffff" className="absolute right-2.5 pointer-events-none" />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex lg:hidden cursor-pointer px-4 items-center justify-center gap-2 bg-[#43C17A] hover:bg-[#34A362] text-white py-2 -mt-1 rounded-full text-sm font-bold transition-all shadow-[0_2px_10px_rgba(67,193,122,0.25)] active:scale-95 group"
          >
            <div className="flex items-center justify-center border-3 border-[#EFEFEF] text-[#EFEFEF] rounded-full p-[2px] group-hover:rotate-90 transition-transform duration-300">
              <Plus size={12} weight="bold" />
            </div>
            Create Category
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-start lg:overflow-y-auto custom-scrollbar pr-1">
          {categories.map((cat, idx) => (
            <CategoryCard
              key={idx}
              title={cat.title}
              executivesAssigned={cat.executivesAssigned}
              executives={cat.executives}
              onAddExecutive={() => console.log(`Add to ${cat.title}`)}
              onDelete={() => console.log(`Delete ${cat.title}`)}
            />
          ))}
        </div>

      </div>

      <WellbeingRight
        button={true}
        headerActionLabel="Create Category"
        onHeaderActionClick={() => setIsModalOpen(true)}
      />

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}