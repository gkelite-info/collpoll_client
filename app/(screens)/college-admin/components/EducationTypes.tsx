"use client";

const data = [
  {
    name: "B.Tech",
    managedBy: "Shravani",
    duration: "4 Years",
    semesters: 8,
    branches: 4,
    faculty: 210,
    students: 2850,
  },
  {
    name: "MBA",
    managedBy: "Arjun",
    duration: "2 Years",
    semesters: 4,
    branches: 2,
    faculty: 65,
    students: 720,
  },
  {
    name: "MCA",
    managedBy: "Harsha",
    duration: "4 Years",
    semesters: 8,
    branches: 4,
    faculty: 210,
    students: 2850,
  },
  {
    name: "BBA",
    managedBy: "Deeksha",
    duration: "4 Years",
    semesters: 8,
    branches: 4,
    faculty: 210,
    students: 2850,
  },
  {
    name: "B.Tech",
    managedBy: "Shravani",
    duration: "4 Years",
    semesters: 8,
    branches: 4,
    faculty: 210,
    students: 2850,
  },
  {
    name: "MBA",
    managedBy: "Arjun",
    duration: "2 Years",
    semesters: 4,
    branches: 2,
    faculty: 65,
    students: 720,
  },
];

export default function EducationTypesGrid() {
  return (
    <div className="grid grid-cols-2 gap-5">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-5 shadow-sm border-[#EAEAEA] hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-1">
            <div className="flex flex-col gap-1">
              <h3 className="text-[#282828] font-semibold text-[16px]">
                {item.name}
              </h3>
              <p className="text-[14px] text-[#43C17A]">
                Managed by {item.managedBy}
              </p>
            </div>

            <span className="text-[14px] font-medium px-4 py-1 rounded-full"
              style={{
                backgroundColor: "#43C17A40",
                color: "#1E7745"
              }}>
              Active
            </span>

          </div>

          <div className="text-[14px] text-[#5C5C5C] space-y-2">
            <div className="flex justify-between text-sm font-medium text-[#282828]">
              <span>Duration :</span>
              <span className="font-semibold text-[#1F2F56]">
                {item.duration}
              </span>
            </div>

            <div className="flex justify-between text-sm text-[#282828]">
              <span>Semesters:</span>
              <span>{item.semesters}</span>
            </div>

            <div className="flex justify-between text-sm text-[#282828]">
              <span>Branches:</span>
              <span>{item.branches}</span>
            </div>

            <div className="flex justify-between text-sm text-[#282828]">
              <span>Faculty:</span>
              <span>{item.faculty}</span>
            </div>

            <div className="flex justify-between text-sm text-[#282828] ">
              <span>Students:</span>
              <span>{item.students}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
