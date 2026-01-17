"use client"
import { useEffect, useState } from "react"
import CourseScheduleCard from "@/app/utils/CourseScheduleCard"
import FacultyCard from "./FacultyCard"
import { fetchFacultyCalendar } from "@/lib/helpers/admin/calender/fetchFacultyCalendar"

// const FACULTY_LIST = [
//     {
//         id: "89273648",
//         name: "Dr. Meena Reddy",
//         department: "ECE",
//         subjects: "Data Structures, Microprocessors",
//         year: "2",
//         lastUpdate: "Nov 15/09/2025",
//         image: "/meenareddy.png",
//     },
//     {
//         id: "FAC1089",
//         name: "Prof. Harsha Sharma",
//         department: "CSE",
//         subjects: "Algorithms, DBMS",
//         year: "3",
//         lastUpdate: "Nov 15/09/2025",
//         image: "/harshasharma.png",
//     },
//     {
//         id: "89273649",
//         name: "Dr. Kavya Patel",
//         department: "Mechanical",
//         subjects: "Thermodynamics, Machines",
//         year: "2",
//         lastUpdate: "Nov 15/09/2025",
//         image: "/kavyapatel.png",
//     },
//     {
//         id: "89273650",
//         name: "Mr. Rahul Deshmukh",
//         department: "Civil",
//         subjects: "Structural Engineering",
//         year: "4",
//         lastUpdate: "Nov 15/09/2025",
//         image: "/rahul.png",
//     },
//     {
//         id: "FAC2099",
//         name: "Dr. Sneha Iyer",
//         department: "IT",
//         subjects: "Web Development, Cloud",
//         year: "1",
//         lastUpdate: "Nov 15/09/2025",
//         image: "/sneha.png",
//     },
//     {
//         id: "89273651",
//         name: "Prof. Aditya Menon",
//         department: "CSE",
//         subjects: "AI, Machine Learning",
//         year: "4",
//         lastUpdate: "Nov 15/09/2025",
//         image: "/adityamenon.png",
//     },
// ]



interface Props {
    onSelect: (faculty: any) => void
}

interface FacultyUI {
    id: string;
    name: string;
    department: string;
    subjects: string;
    year?: string;
    lastUpdate: string;
    image: string;
}


export default function FacultyOverview({ onSelect }: Props) {
    const [department, setDepartment] = useState("All")
    const [subject, setSubject] = useState("All")
    const [year, setYear] = useState("All")
    const [facultyList, setFacultyList] = useState<FacultyUI[]>([]);
    const [loading, setLoading] = useState(false);

    // ✅ derive dynamic filter options from facultyList
    const departmentOptions = Array.from(
        new Set(
            facultyList
                .flatMap(f => f.department.split(","))
                .map(d => d.trim())
        )
    );

    const subjectOptions = Array.from(
        new Set(
            facultyList
                .flatMap(f => f.subjects.split(","))
                .map(s => s.trim())
        )
    );

    const formatYearLabel = (y: string | number) => {
        const n = Number(y);
        if (n === 1) return "1st Year";
        if (n === 2) return "2nd Year";
        if (n === 3) return "3rd Year";
        return `${n}th Year`;
    };

    const yearOptions: number[] = Array.from(
        new Set(
            facultyList
                .map(f => Number(f.year))
                .filter(y => y >= 1 && y <= 4) // ✅ IMPORTANT
        )
    ).sort((a, b) => a - b);




    // const yearOptions = Array.from(
    //     new Set(facultyList.map(f => f.year).filter(Boolean))
    // );


    // const [department, setDepartment] = useState("All");
    // const [subject, setSubject] = useState("All");
    // const [year, setYear] = useState("All");

    // const filteredFaculty = FACULTY_LIST.filter((faculty) => {
    //     const matchDepartment =
    //         department === "All" || faculty.department === department

    //     const matchSubject =
    //         subject === "All" ||
    //         faculty.subjects.toLowerCase().includes(subject.toLowerCase())

    //     const matchYear = year === "All" || faculty.year === year

    //     return matchDepartment && matchSubject && matchYear
    // })

    // ✅ reset Year when Department changes
    useEffect(() => {
        setYear("All");
    }, [department]);

    // ✅ reset Year when Subject changes
    useEffect(() => {
        setYear("All");
    }, [subject]);


    useEffect(() => {
        const loadFaculty = async () => {
            setLoading(true);

            const data = await fetchFacultyCalendar({
                department: department === "All" ? undefined : department,
                subject: subject === "All" ? undefined : subject,
                year: year === "All" ? undefined : Number(year),
            });

            setFacultyList(data);
            setLoading(false);
        };

        loadFaculty();
    }, [department, subject, year]);

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
                        {/* <option value="All">All</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="IT">IT</option> */}
                        <option value="All">All</option>
                        {departmentOptions.map(dep => (
                            <option key={dep} value={dep}>
                                {dep}
                            </option>
                        ))}

                    </select>
                </div>

                {/* <div className="flex-1">
                    <label className="text-xs text-[#282828]">Subject</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full mt-1 outline-none cursor-pointer text-[#282828] border border-[#CCCCCC] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>

                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                Year {y}
                            </option>
                        ))}
                    </select>

                </div> */}

                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Subject</label>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full mt-1 outline-none cursor-pointer border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>

                        {subjectOptions.map((s: string) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>


                {/* <div className="flex-1">
                    <label className="text-xs text-[#282828]">Year</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full mt-1 outline-none cursor-pointer text-[#282828] border border-[#CCCCCC] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>

                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {formatYearLabel(y)}
                            </option>
                        ))}
                    </select>

                </div> */}

                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Year</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full mt-1 outline-none cursor-pointer text-[#282828] border border-[#CCCCCC] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>

                </div>

            </section>

            {loading ? (
                <div className="flex items-center justify-center min-h-[60vh] w-full -mt-20">
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            ) : (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {facultyList.length === 0 && (
                        <p className="text-sm text-gray-500">No faculty found</p>
                    )}

                    {facultyList.map((faculty) => (
                        <FacultyCard
                            key={faculty.id}
                            faculty={faculty}
                            onSelect={onSelect}
                        />
                    ))}
                </section>
            )}


            {/* <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredFaculty.map((faculty) => (
                    <FacultyCard
                        key={faculty.id}
                        faculty={faculty}
                        onSelect={onSelect}
                    />
                ))}
            </section> */}
        </main>
    )
}
