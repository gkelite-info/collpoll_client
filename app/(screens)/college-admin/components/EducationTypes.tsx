"use client";

export default function EducationTypes() {
  const data = [
    { name: "B.Tech", duration: "4 Years", branches: 4 },
    { name: "MBA", duration: "2 Years", branches: 2 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border p-4"
        >
          <div className="flex justify-between">
            <h3 className="font-semibold">{item.name}</h3>
            <span className="bg-[#43C17A26] text-[#43C17A] px-3 py-1 rounded-full text-xs">
              Active
            </span>
          </div>

          <p className="text-sm mt-2">Duration: {item.duration}</p>
          <p className="text-sm">Branches: {item.branches}</p>
        </div>
      ))}
    </div>
  );
}
