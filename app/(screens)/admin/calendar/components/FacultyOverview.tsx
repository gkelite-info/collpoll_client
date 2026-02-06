"use client"
import { use, useEffect, useState } from "react"
import CourseScheduleCard from "@/app/utils/CourseScheduleCard"
import FacultyCard from "./FacultyCard"
import { fetchFilteredFaculties } from "@/lib/helpers/admin/calender/fetchFacultyCalendar"
import { useUser } from "@/app/utils/context/UserContext"
import { fetchAcademicYears, fetchBranches, fetchEducations, fetchSemesters, fetchSubjects } from "@/lib/helpers/admin/academics/academicDropdowns"
import toast from "react-hot-toast"
// import { fetchFacultyCalendar } from "@/lib/helpers/admin/calender/fetchFacultyCalendar"
interface Props {
    onSelect: (faculty: any) => void
}

interface FacultyUI {
    id: string;
    name: string;
    gender: "Male" | "Female";
    branch  : string;
    subjects: string;
    lastUpdate: string;
    image: string;
    year?: string;
}

export default function FacultyOverview({ onSelect }: Props) {
    const [facultyList, setFacultyList] = useState<FacultyUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [educationId, setEducationId] = useState<number | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [subjectId, setSubjectId] = useState<number | null>(null);
    const [educations, setEducations] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [semesterId, setSemesterId] = useState<number | null>(null);
    const [semesters, setSemesters] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const { collegeId } = useUser();

    const getEducationTypes = async (collegeId: number) => {
        try {
            const res = await fetchEducations(collegeId);
            setEducations(res);
        } catch (error) {
            toast.error("Failed to fetch education types.");
        }
    }

    useEffect(() => {
        if (collegeId) {
            getEducationTypes(collegeId);
        }
    }, [collegeId]);

    useEffect(() => {
        if (!collegeId || !educationId) return;

        fetchBranches(collegeId, educationId)
            .then(setBranches)
            .catch(() => toast.error("Failed to load branches"));
    }, [collegeId, educationId]);


    useEffect(() => {
        if (!collegeId || !educationId || !branchId) return;

        fetchAcademicYears(collegeId, educationId, branchId)
            .then(setAcademicYears)
            .catch(() => toast.error("Failed to load academic years"));
    }, [collegeId, educationId, branchId]);

    useEffect(() => {
        if (!collegeId || !educationId || !academicYearId) return;

        fetchSemesters(collegeId, educationId, academicYearId)
            .then(setSemesters)
            .catch(() => toast.error("Failed to load semesters"));
    }, [collegeId, educationId, academicYearId]);

    useEffect(() => {
        if (
            !collegeId ||
            !educationId ||
            !branchId ||
            !academicYearId ||
            !semesterId
        ) return;

        fetchSubjects(collegeId, educationId, branchId, academicYearId, semesterId)
            .then(setSubjects)
            .catch(() => toast.error("Failed to load subjects"));
    }, [collegeId, educationId, branchId, academicYearId, semesterId]);

    const loadFaculty = async () => {
        if (!collegeId) return
        setLoading(true);
        try {
            const data = await fetchFilteredFaculties({
                collegeId,
                collegeEducationId: educationId ?? undefined,
                collegeBranchId: branchId ?? undefined,
                collegeAcademicYearId: academicYearId ?? undefined,
                collegeSubjectId: subjectId ?? undefined,
            });

            // const enriched: FacultyUI[] = data.map(f => ({
            //     ...f,
            //     year:
            //         academicYears.find(y => y.collegeAcademicYearId === academicYearId)
            //             ?.collegeAcademicYear ?? "—",
            // }));

            setFacultyList(data);

            // setFacultyList(enriched);
        } catch (error) {
            toast.error("Failed to load faculty data.");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(facultyList.length / itemsPerPage);

    const paginatedFaculty = facultyList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        loadFaculty();
    }, [collegeId, educationId, branchId, academicYearId, subjectId]);

    useEffect(() => {
        setCurrentPage(1);
    }, [educationId, branchId, academicYearId, semesterId, subjectId]);


    return (
        <main>
            <section className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-[#1F2937]">
                        Calendar Overview
                    </h1>
                    <p className="text-sm text-gray-500">
                        Select a Faculty, Branch, or Course Calendar to view or manage schedules.
                    </p>
                </div>
                <div className="flex items-center justify-center">
                    <CourseScheduleCard style="w-[320px] mt-4" isVisibile={false} />
                </div>
            </section>

            <section className="bg-white rounded-xl p-4 flex gap-4 mb-6">
                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Education Type</label>
                    <select
                        value={educationId ?? "All"}
                        onChange={(e) => {
                            const val = e.target.value;
                            setEducationId(val === "All" ? null : Number(val));
                            setBranchId(null);
                            setAcademicYearId(null);
                            setSubjectId(null);
                            setBranches([]);
                            setAcademicYears([]);
                            setSubjects([]);
                        }}
                        className="w-full mt-1 outline-none cursor-pointer border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>
                        {educations.map((e) => (
                            <option
                                key={e.collegeEducationId}
                                value={e.collegeEducationId}
                            >
                                {e.collegeEducationType}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Branch</label>
                    <select
                        disabled={!educationId}
                        value={branchId ?? "All"}
                        onChange={(e) => {
                            const val = e.target.value;
                            setBranchId(val === "All" ? null : Number(val));
                            setAcademicYearId(null);
                            setSubjectId(null);
                            setAcademicYears([]);
                            setSubjects([]);
                        }}
                        className="w-full mt-1 outline-none cursor-pointer border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>
                        {branches.length === 0 && educationId && (
                            <option disabled>No data available</option>
                        )}
                        {branches.map((b) => (
                            <option
                                key={b.collegeBranchId}
                                value={b.collegeBranchId}
                            >
                                {b.collegeBranchCode}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Year</label>
                    <select
                        disabled={!branchId}
                        value={academicYearId ?? "All"}
                        onChange={(e) => {
                            const val = e.target.value;
                            setAcademicYearId(val === "All" ? null : Number(val));
                            setSubjectId(null);
                            setSubjects([]);
                            setSemesters([]);
                            setSubjects([]);
                        }}
                        className="w-full mt-1 outline-none cursor-pointer border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>
                        {academicYears.length === 0 && branchId && (
                            <option disabled>No data available</option>
                        )}
                        {academicYears.map((y) => (
                            <option
                                key={y.collegeAcademicYearId}
                                value={y.collegeAcademicYearId}
                            >
                                {y.collegeAcademicYear}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Semester</label>
                    <select
                        disabled={!academicYearId}
                        value={semesterId ?? "All"}
                        onChange={(e) => {
                            setSemesterId(e.target.value === "All" ? null : Number(e.target.value))
                            setSubjectId(null)
                            setSubjects([]);
                        }}
                        className="w-full mt-1 outline-none cursor-pointer border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>
                        {semesters.length === 0 && academicYearId && (
                            <option disabled>No data available</option>
                        )}
                        {semesters.map(s => (
                            <option key={s.collegeSemesterId} value={s.collegeSemesterId}>
                                {s.collegeSemester}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Subject</label>
                    <select
                        disabled={!semesterId}
                        value={subjectId ?? "All"}
                        onChange={(e) =>
                            setSubjectId(e.target.value === "All" ? null : Number(e.target.value))
                        }
                        className="w-full mt-1 outline-none cursor-pointer text-[#282828] border border-[#CCCCCC] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>
                        {subjects.length === 0 && semesterId && (
                            <option disabled>No data available</option>
                        )}
                        {subjects.map(s => (
                            <option key={s.collegeSubjectId} value={s.collegeSubjectId}>
                                {s.subjectName}
                            </option>
                        ))}
                    </select>

                </div>
            </section>

            {loading && (
                <div className="flex items-center justify-center min-h-[60vh] w-full -mt-20">
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            )}

            {!loading && facultyList.length === 0 && (
                <div className="flex items-center justify-center min-h-[60vh] w-full -mt-20">
                    <p className="text-sm text-gray-500 flex items-center justify-center">
                        No faculty found
                    </p>
                </div>
            )}

            {!loading && facultyList.length > 0 && (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {paginatedFaculty.map((faculty) => (
                        <FacultyCard
                            key={faculty.id}
                            faculty={faculty}
                            onSelect={onSelect}
                        />
                    ))}

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 mb-4 col-span-full">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border bg-white"
                            >
                                ‹
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold ${currentPage === i + 1
                                        ? "bg-[#16284F] text-white"
                                        : "bg-white border"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border bg-white"
                            >
                                ›
                            </button>
                        </div>
                    )}
                </section>
            )}

        </main >
    )
}
