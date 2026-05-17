"use client";
import WellbeingRight from "../components/WellbeingRight";
import CategoryCard from "./components/CategoryCard";

export default function CategoriesPage() {
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
      
      <div className="w-full lg:w-[68%] xl:w-[70%] p-4 md:p-6 lg:p-2 lg:pb-4 flex flex-col lg:h-screen lg:overflow-y-auto custom-scrollbar">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-start">
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
      
      <WellbeingRight />
    </main>
  );
}