"use client";

export default function SupportAdmins() {
  const data = [
    {
      name: "Shravani",
      email: "shravani@college.in",
      education: "B.Tech",
      branches: 4,
      faculty: 210,
      students: 2850,
    },
    {
      name: "Arjun",
      email: "arjun@college.in",
      education: "BBA",
      branches: 4,
      faculty: 210,
      students: 2850,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border p-4 space-y-2"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[#282828] font-semibold">
                {item.name}
              </h3>
              <p className="text-sm text-[#43C17A]">
                {item.email}
              </p>
            </div>

            <span className="bg-[#43C17A26] text-[#43C17A] px-3 py-1 rounded-full text-xs">
              Active
            </span>
          </div>

          <div className="text-sm text-[#5C5C5C] space-y-1">
            <p><span className="font-medium">Education Type:</span> {item.education}</p>
            <p>Branches: {item.branches}</p>
            <p>Faculty: {item.faculty}</p>
            <p>Students: {item.students}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
