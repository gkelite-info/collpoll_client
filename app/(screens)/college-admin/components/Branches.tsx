"use client";

const data = [
  {
    name: "Computer Science & Engineering",
    subTitle: "B.Tech | CSE",
    faculty: 45,
    students: 820,
    supportAdmin: 4,
  },
  {
    name: "Electronics & Communication",
    subTitle: "B.Tech | ECE",
    faculty: 38,
    students: 640,
    supportAdmin: 4,
  },
  {
    name: "Mechanical Engineering",
    subTitle: "B.Tech | MECH",
    faculty: 45,
    students: 820,
    supportAdmin: 4,
  },
  {
    name: "Civil Engineering",
    subTitle: "Civil Engineering",
    faculty: 38,
    students: 640,
    supportAdmin: 4,
  },
  {
    name: "Electrical Engineering",
    subTitle: "Polytechnic | EEE",
    faculty: 38,
    students: 640,
    supportAdmin: 4,
  },
  {
    name: "Electrical Engineering",
    subTitle: "Polytechnic | EEE",
    faculty: 38,
    students: 640,
    supportAdmin: 4,
  },
];

export default function BranchesGrid() {
  return (
    <div className="grid grid-cols-2 gap-5">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-4 shadow-sm border-[#EAEAEA] hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-1">
            <div className="flex flex-col gap-1">
              <h3 className="text-[#282828] font-semibold text-[16px]">
                {item.name}
              </h3>
              <p className="text-[13px] text-[#43C17A]">
                {item.subTitle}
              </p>
            </div>

            <span
              className="text-[12px] font-medium px-3 py-1 rounded-full"
              style={{
                backgroundColor: "#43C17A40",
                color: "#1E7745",
              }}
            >
              Active
            </span>
          </div>

          <div className="text-[13px] text-[#5C5C5C] space-y-1">
            <div className="flex justify-between text-sm text-[#282828]">
              <span>Faculty :</span>
              <span>{item.faculty}</span>
            </div>

            <div className="flex justify-between text-sm text-[#282828]">
              <span>Students :</span>
              <span>{item.students}</span>

            </div>

            <div className="flex justify-between text-sm text-[#282828]">
              <span>Support Admin :</span>
              <span>{item.supportAdmin}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
