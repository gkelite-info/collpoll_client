"use client"

import { useState } from "react"
import AssignmentCard from "./components/card";

export default function AssignmentsLeft() {

    const [activeView, setActiveView] = useState<"active" | "previous">("active");

    const activeAssignments = [
        {
            image: "/ds.jpg",
            title: "Data Structures",
            description: "Array Operations & Complexity",
            fromDate: "03/01/2025",
            toDate: "03/01/2025",
            professor: "Prof. Sharma",
            videoLink: "https://youtube.com",
            assignmentTitle: "E-Commerce Website Prototype"
        },
        {
            image: "/os.jpg",
            title: "Operating Systems",
            description: "Process Scheduling & Deadlocks",
            fromDate: "03/01/2025",
            toDate: "03/01/2025",
            professor: "Prof. Rohit",
            videoLink: "https://youtube.com",
        },
        {
            image: "/wt.jpg",
            title: "Web Technologies Lab",
            description: "Responsive Design Using HTML, CSS, JS",
            fromDate: "05/01/2025",
            toDate: "05/01/2025",
            professor: "Prof. Mehta",
            videoLink: "https://youtube.com",
        },
        {
            image: "/dbms.jpg",
            title: "DBMS",
            description: "Normalization & SQL Queries",
            fromDate: "07/01/2025",
            toDate: "07/01/2025",
            professor: "Prof. Rao",
            videoLink: "https://youtube.com",
        },

    ];

    const previousAssignments = [
        {
            image: "/wt.jpg",
            title: "Web Technologies Lab",
            description: "Responsive Design Using HTML, CSS, JS",
            fromDate: "05/01/2025",
            toDate: "05/01/2025",
            professor: "Prof. Mehta",
            videoLink: "https://youtube.com",
            marksScored: 88,
            marksTotal: 100
        },
        {
            image: "/ds.jpg",
            title: "Data Structures",
            description: "Array Operations & Complexity",
            fromDate: "03/01/2025",
            toDate: "03/01/2025",
            professor: "Prof. Sharma",
            videoLink: "https://youtube.com",
            marksScored: 90,
            marksTotal: 100
        },
        {
            image: "/os.jpg",
            title: "Operating Systems",
            description: "Process Scheduling & Deadlocks",
            fromDate: "03/01/2025",
            toDate: "03/01/2025",
            professor: "Prof. Rohit",
            videoLink: "https://youtube.com",
            marksScored: 50,
            marksTotal: 100
        },
        {
            image: "/dbms.jpg",
            title: "DBMS",
            description: "Normalization & SQL Queries",
            fromDate: "07/01/2025",
            toDate: "07/01/2025",
            professor: "Prof. Rao",
            videoLink: "https://youtube.com",
            marksScored: 82,
            marksTotal: 100
        },
    ];

    return (
        <>
            <div className="w-[68%] p-2 flex flex-col">
                <div className="mb-4">
                    <h1 className="text-[#282828] font-bold text-2xl mb-1">Assignments</h1>
                    <p className="text-[#282828]">View, Track, and Submit Your Work With Ease</p>
                </div>

                <div className="w-full flex flex-col">
                    <div className="flex gap-4 pb-1">
                        <h5
                            className={`
                                text-xs cursor-pointer pb-1
                                ${activeView === "active"
                                    ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]"
                                    : "text-[#282828]"
                                }
                            `}
                            onClick={() => setActiveView("active")}
                        >
                            Active Assignments
                        </h5>

                        <h5
                            className={`
                                text-xs cursor-pointer pb-1
                                ${activeView === "previous"
                                    ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]"
                                    : "text-[#282828]"
                                }
                            `}
                            onClick={() => setActiveView("previous")}
                        >
                            Previous Assignments
                        </h5>

                    </div>

                    <div className="mt-4">
                        {activeView === "active" && (
                            <AssignmentCard
                                cardProp={activeAssignments}
                                activeView={activeView}
                            />
                        )}

                        {activeView === "previous" && (
                            <div className="text-sm text-[#282828]">
                                <AssignmentCard
                                    cardProp={previousAssignments}
                                    activeView="previous"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
