"use client";

const data = [
    {
        name: "Shravani",
        email: "shravani@college.in",
        educationType: "B.Tech",
        branches: 4,
        faculty: 210,
        students: 2850,
        createdOn: "1/13/2026",
    },
    {
        name: "Arjun",
        email: "arjun@college.in",
        educationType: "BBA",
        branches: 4,
        faculty: 210,
        students: 2850,
        createdOn: "1/13/2026",
    },
    {
        name: "Deeksha",
        email: "deeksha@college.in",
        educationType: "MBA",
        branches: 4,
        faculty: 210,
        students: 2850,
        createdOn: "1/13/2026",
    },
    {
        name: "Harsha",
        email: "harsha@college.in",
        educationType: "MCA",
        branches: 4,
        faculty: 210,
        students: 2850,
        createdOn: "1/13/2026",
    },
    {
        name: "Deeksha",
        email: "deeksha@college.in",
        educationType: "MBA",
        branches: 4,
        faculty: 210,
        students: 2850,
        createdOn: "1/13/2026",
    },
    {
        name: "Harsha",
        email: "harsha@college.in",
        educationType: "MCA",
        branches: 4,
        faculty: 210,
        students: 2850,
        createdOn: "1/13/2026",
    },
    {
        name: "Deeksha",
        email: "deeksha@college.in",
        educationType: "MBA",
        branches: 4,
        faculty: 210,
        students: 2850,
        createdOn: "1/13/2026",
    },
    {
        name: "Harsha",
        email: "harsha@college.in",
        educationType: "MCA",
        branches: 4,
        faculty: 210,
        students: 2850,
        createdOn: "1/13/2026",
    },
    {
        name: "Deeksha",
        email: "deeksha@college.in",
        educationType: "MBA",
        branches: 4,
        faculty: 210,
        students: 2850,
        createdOn: "1/13/2026",
    },
    {
        name: "Harsha",
        email: "harsha@college.in",
        educationType: "MCA",
        branches: 4,
        faculty: 210,
        students: 2850,
        createdOn: "1/13/2026",
    },
];

export default function SupportAdmins() {
    return (
        <div className="grid grid-cols-2 gap-5">
            {data.map((item, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl p-5 shadow-sm border-[#EAEAEA] hover:shadow-md transition"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="text-[#282828] font-semibold text-[15px]">
                                {item.name}
                            </h3>
                            <p className="text-[13px] text-[#43C17A]">
                                {item.email}
                            </p>
                        </div>

                        <span className="bg-[#43C17A26] text-[#43C17A] text-[11px] font-medium px-3 py-1 rounded-full">
                            Active
                        </span>
                    </div>

                    <div className="text-[13px] text-[#5C5C5C] space-y-1">
                        <div className="flex justify-between">
                            <span>Education Type :</span>
                            <span className="font-medium text-[#282828]">
                                {item.educationType}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Branches:</span>
                            <span>{item.branches}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Faculty:</span>
                            <span>{item.faculty}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Students:</span>
                            <span>{item.students}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Created on:</span>
                            <span>{item.createdOn}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
