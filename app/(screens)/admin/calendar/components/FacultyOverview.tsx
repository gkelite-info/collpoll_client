"use client"
import { useState } from "react"
import CourseScheduleCard from "@/app/utils/CourseScheduleCard"
import FacultyCard from "./FacultyCard"

const FACULTY_LIST = [
    {
        id: "89273648",
        name: "Dr. Meena Reddy",
        department: "ECE",
        subjects: "Data Structures, Microprocessors",
        year: "2",
        lastUpdate: "Nov 15/09/2025",
        image: "/meenareddy.png",
    },
    {
        id: "FAC1089",
        name: "Prof. Harsha Sharma",
        department: "CSE",
        subjects: "Algorithms, DBMS",
        year: "3",
        lastUpdate: "Nov 15/09/2025",
        image: "/harshasharma.png",
    },
    {
        id: "89273649",
        name: "Dr. Kavya Patel",
        department: "Mechanical",
        subjects: "Thermodynamics, Machines",
        year: "2",
        lastUpdate: "Nov 15/09/2025",
        image: "/kavyapatel.png",
    },
    {
        id: "89273650",
        name: "Mr. Rahul Deshmukh",
        department: "Civil",
        subjects: "Structural Engineering",
        year: "4",
        lastUpdate: "Nov 15/09/2025",
        image: "/rahul.png",
    },
    {
        id: "FAC2099",
        name: "Dr. Sneha Iyer",
        department: "IT",
        subjects: "Web Development, Cloud",
        year: "1",
        lastUpdate: "Nov 15/09/2025",
        image: "/sneha.png",
    },
    {
        id: "89273651",
        name: "Prof. Aditya Menon",
        department: "CSE",
        subjects: "AI, Machine Learning",
        year: "4",
        lastUpdate: "Nov 15/09/2025",
        image: "/adityamenon.png",
    },
]

interface Props {
    onSelect: (faculty: any) => void
}

export default function FacultyOverview({ onSelect }: Props) {
    const [department, setDepartment] = useState("All")
    const [subject, setSubject] = useState("All")
    const [year, setYear] = useState("All")

    const filteredFaculty = FACULTY_LIST.filter((faculty) => {
        const matchDepartment =
            department === "All" || faculty.department === department

        const matchSubject =
            subject === "All" ||
            faculty.subjects.toLowerCase().includes(subject.toLowerCase())

        const matchYear = year === "All" || faculty.year === year

        return matchDepartment && matchSubject && matchYear
    })
    return (
        <main>
            <section className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-[#1F2937]">
                        Calendar Overview
                    </h1>
                    <p className="text-sm text-gray-500">
                        Select a Faculty, Department, or Course Calendar to view or manage schedules.
                    </p>
                </div>
                <div className="flex items-center justify-center">
                    <CourseScheduleCard style="w-[320px] mt-4" isVisibile={false} />
                </div>
            </section>

            <section className="bg-white rounded-xl p-4 flex gap-4 mb-6">
                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Faculty</label>
                    <select className="w-full mt-1 outline-none cursor-pointer border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 text-sm">
                        <option>All</option>
                    </select>
                </div>

                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Department</label>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full mt-1 outline-none cursor-pointer border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="IT">IT</option>
                    </select>
                </div>

                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Subject</label>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full mt-1 outline-none cursor-pointer border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>
                        <option value="AI">AI</option>
                        <option value="DBMS">DBMS</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Thermodynamics">Thermodynamics</option>
                        <option value="Data Structures">Data Structures</option>
                    </select>
                </div>

                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Year</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full mt-1 outline-none cursor-pointer text-[#282828] border border-[#CCCCCC] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                    </select>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredFaculty.map((faculty) => (
                    <FacultyCard
                        key={faculty.id}
                        faculty={faculty}
                        onSelect={onSelect}
                    />
                ))}
            </section>
        </main>
    )
}
