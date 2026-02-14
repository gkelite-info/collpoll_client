"use client";

export default function Branches() {
  const data = [
    { name: "Computer Science", faculty: 45, students: 820 },
    { name: "Mechanical", faculty: 38, students: 640 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border p-4"
        >
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm mt-2">Faculty: {item.faculty}</p>
          <p className="text-sm">Students: {item.students}</p>
        </div>
      ))}
    </div>
  );
}
