"use client"
import { useEffect, useState } from "react"
import CourseScheduleCard from "@/app/utils/CourseScheduleCard"
import FacultyCard from "./FacultyCard"
import { fetchFilteredFaculties } from "@/lib/helpers/admin/calender/fetchFacultyCalendar"
import { useUser } from "@/app/utils/context/UserContext"
import { fetchAcademicYears, fetchBranches, fetchSemesters, fetchSubjects, fetchAdminEducationTypes } from "@/lib/helpers/admin/academics/academicDropdowns"
import toast from "react-hot-toast"
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable"
import { useAdmin } from "@/app/utils/context/admin/useAdmin"
import FacultyCardSkeleton from "./FacultyCardSkeleton"
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
interface Props {
    onSelect: (faculty: any) => void
}

interface FacultyUI {
    id: string;
    employeeId: string;
    name: string;
    gender: "Male" | "Female";
    branch: string;
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
    const [branches, setBranches] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [semesterId, setSemesterId] = useState<number | null>(null);
    const [semesters, setSemesters] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 9;

    const { collegeId, adminId, collegeEducationId, collegeEducationType, loading: contextLoading } = useAdmin();
    const [educationTypes, setEducationTypes] = useState<any[]>([]);
    const [isFetchingEduTypes, setIsFetchingEduTypes] = useState(true);

    useEffect(() => {
        if (!adminId) return;
        setIsFetchingEduTypes(true);
        fetchAdminEducationTypes(adminId)
            .then(res => {
                if (res.length > 0) {
                    setEducationTypes(res);
                } else if (collegeEducationId && collegeEducationType) {
                    setEducationTypes([{
                        collegeEducationId,
                        collegeEducationType
                    }]);
                }
            })
            .catch(() => toast.error("Failed to load education types"))
            .finally(() => setIsFetchingEduTypes(false));
    }, [adminId, collegeEducationId, collegeEducationType]);

    useEffect(() => {
        if (collegeEducationId) {
            setEducationId(collegeEducationId);
        }
    }, [collegeEducationId]);

    const selectedEducation = educationTypes.find(e => e.collegeEducationId === educationId);
    const isSchool = isSchoolEducation(selectedEducation?.collegeEducationType);
    const isInter = selectedEducation?.collegeEducationType === "Inter";

    useEffect(() => {
        if (!collegeId || !educationId) return;

        fetchBranches(collegeId, educationId)
            .then(setBranches)
            .catch(() => toast.error("Failed to load branches"));
    }, [collegeId, educationId]);


    useEffect(() => {
        if (!collegeId || !educationId || (!isSchool && !branchId)) return;
        fetchAcademicYears(collegeId, educationId, isSchool ? null : branchId)
            .then(setAcademicYears)
            .catch(() => toast.error("Failed to load academic years"));
    }, [collegeId, educationId, branchId, isSchool]);

    useEffect(() => {
        if (!collegeId || !educationId || !academicYearId || isSchool) return;

        fetchSemesters(collegeId, educationId, academicYearId)
            .then(setSemesters)
            .catch(() => toast.error("Failed to load semesters"));
    }, [collegeId, educationId, academicYearId, isSchool]);

    useEffect(() => {
        if (
            !collegeId ||
            !educationId ||
            (!isSchool && !branchId) ||
            !academicYearId ||
            (!semesterId && !isInter && !isSchool)
        ) return;

        fetchSubjects(collegeId, educationId, isSchool ? null : branchId, academicYearId, isSchool ? null : semesterId)
            .then(setSubjects)
            .catch(() => toast.error("Failed to load subjects"));
    }, [collegeId, educationId, branchId, academicYearId, semesterId, isSchool, isInter]);

    const loadFaculty = async () => {
        if (!collegeId || !educationId) return;
        setLoading(true);
        try {
            const { data, total } = await fetchFilteredFaculties({
                collegeId,
                collegeEducationId: educationId,
                collegeBranchId: isSchool ? undefined : (branchId ?? undefined),
                collegeAcademicYearId: academicYearId ?? undefined,
                collegeSubjectId: subjectId ?? undefined,
                page: currentPage,
                limit: itemsPerPage
            });

            setFacultyList(data);
            setTotalCount(total);
        } catch (error) {
            toast.error("Failed to load faculty data.");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const paginatedFaculty = facultyList

    useEffect(() => {
        if (educationId) {
            loadFaculty();
        }
    }, [collegeId, educationId, branchId, academicYearId, semesterId, subjectId, currentPage]);



    return (
        <main>
            <section className="bg-white rounded-xl p-4 flex gap-4 mb-6">
                {contextLoading || isFetchingEduTypes ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex-1">
                            <div className="h-3 w-16 bg-gray-200 rounded mb-2 animate-pulse" />
                            <div className="h-[38px] w-full bg-gray-200 rounded-md animate-pulse" />
                        </div>
                    ))
                ) : (
                    <>
                        <div className="flex-1">
                            <label className="text-xs text-[#282828]">Education Type</label>
                    <select
                        value={educationId ?? ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            setEducationId(val ? Number(val) : null);
                            setBranchId(null);
                            setAcademicYearId(null);
                            setSemesterId(null);
                            setSubjectId(null);
                            setBranches([]);
                            setAcademicYears([]);
                            setSemesters([]);
                            setSubjects([]);
                            setCurrentPage(1);
                        }}
                        className="w-full mt-1 outline-none cursor-pointer border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 text-sm"
                    >
                        {educationTypes.length === 0 && (
                            <option disabled>No data available</option>
                        )}
                        {educationTypes.map((et) => (
                            <option
                                key={et.collegeEducationId}
                                value={et.collegeEducationId}
                            >
                                {et.collegeEducationType}
                            </option>
                        ))}
                    </select>
                </div>

                {!isSchool && (
                    <div className="flex-1">
                        <label className="text-xs text-[#282828]">{isInter ? "Group" : "Branch"}</label>
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
                                setCurrentPage(1);
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
                )}

                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Year</label>
                    <select
                        disabled={!isSchool && !branchId}
                        value={academicYearId ?? "All"}
                        onChange={(e) => {
                            const val = e.target.value;
                            setAcademicYearId(val === "All" ? null : Number(val));
                            setSubjectId(null);
                            setSubjects([]);
                            setSemesters([]);
                            setCurrentPage(1);
                        }}
                        className="w-full mt-1 outline-none cursor-pointer border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 text-sm"
                    >
                        <option value="All">All</option>
                        {academicYears.length === 0 && (isSchool || branchId) && (
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


                {!isInter && !isSchool && (
                    <div className="flex-1">
                        <label className="text-xs text-[#282828]">Semester</label>
                        <select
                            disabled={!academicYearId}
                            value={semesterId ?? "All"}
                            onChange={(e) => {
                                setSemesterId(e.target.value === "All" ? null : Number(e.target.value))
                                setSubjectId(null)
                                setSubjects([]);
                                setCurrentPage(1);
                            }}
                            className={`w-full mt-1 outline-none border border-[#CCCCCC] rounded-md px-3 py-2 text-sm ${!academicYearId ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-[#282828] cursor-pointer"}`}
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
                )}

                <div className="flex-1">
                    <label className="text-xs text-[#282828]">Subject</label>
                    <select
                        disabled={isSchool ? !academicYearId : (isInter ? !academicYearId : !semesterId)}
                        value={subjectId ?? "All"}
                        onChange={(e) =>
                            setSubjectId(e.target.value === "All" ? null : Number(e.target.value))
                        }
                        className={`w-full mt-1 outline-none border border-[#CCCCCC] rounded-md px-3 py-2 text-sm ${(isSchool ? !academicYearId : (isInter ? !academicYearId : !semesterId)) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-[#282828] cursor-pointer"}`}
                    >
                        <option value="All">All</option>
                        {subjects.length === 0 && (isSchool ? academicYearId : (isInter ? academicYearId : semesterId)) && (
                            <option disabled>No data available</option>
                        )}
                        {subjects.map(s => (
                            <option key={s.collegeSubjectId} value={s.collegeSubjectId}>
                                {s.subjectName}
                            </option>
                        ))}
                    </select>
                </div>
                </>
                )}
            </section>

            {!loading && facultyList.length === 0 && (
                <div className="flex items-center justify-center min-h-[60vh] w-full -mt-20">
                    <p className="text-sm text-gray-500 flex items-center justify-center">
                        No faculty found
                    </p>
                </div>
            )}

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading && (
                    [...Array(15)].map((_, index) => (
                        <FacultyCardSkeleton key={index} />
                    ))
                )}
                {!loading && facultyList.length > 0 &&
                    paginatedFaculty.map((faculty) => (
                        <FacultyCard
                            key={faculty.id}
                            faculty={faculty}
                            onSelect={onSelect}
                            isSchool={isSchool}
                        />
                    ))
                }
            </section>

            <div className="flex justify-center items-center mt-4 mb-2 w-full rounded-lg shadow-sm">
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalCount}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    alwaysShow={true}
                    roundedBottom="rounded-lg"
                />
            </div>

        </main >
    )
}
