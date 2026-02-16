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
        <div className="grid grid-cols-2 gap-4">
            {data.map((item, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg p-4 shadow-sm border-[#EAEAEA]"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-[#282828] font-semibold text-lg">
                                {item.name}
                            </h3>
                            <p className="text-sm text-[#43C17A]">
                                {item.email}
                            </p>
                        </div>

                        <span style={{color:"#1E7745", background:"#43C17A40"}} className="text-xs font-medium px-3 py-0.5 rounded-full">
                            Active
                        </span>
                    </div>

                    <div className="text-[13px] text-[#5C5C5C] space-y-2">
                        <div className="flex justify-between">
                            <span className="text-[#282828] text-sm font-medium">Education Type :</span>
                            <span className="font-semibold text-[#282828] text-sm">
                                {item.educationType}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-[#282828] text-sm">Branches:</span>
                            <span className="text-[#282828] text-sm">{item.branches}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-[#282828] text-sm">Faculty:</span>
                            <span className="text-[#282828] text-sm">{item.faculty}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-[#282828] text-sm">Students:</span>
                            <span className="text-[#282828] text-sm">{item.students}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-[#282828] text-sm">Created on:</span>
                            <span className="text-[#282828] text-sm">{item.createdOn}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
