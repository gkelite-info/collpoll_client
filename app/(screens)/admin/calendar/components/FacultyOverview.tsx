"use client"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import FacultyCard from "./FacultyCard"
import { fetchAcademicYears, fetchBranches, fetchSemesters, fetchSubjects, fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns"
import toast from "react-hot-toast"
import { useAdmin } from "@/app/utils/context/admin/useAdmin"
import FacultyCardSkeleton from "./FacultyCardSkeleton"
import { fetchFilteredFaculties } from "@/lib/helpers/admin/calender/fetchFacultyCalendar";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { FilterDropdown } from "../../academics/components/filterDropdown";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const [educationId, setEducationId] = useState<number | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [subjectId, setSubjectId] = useState<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [branches, setBranches] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [subjects, setSubjects] = useState<any[]>([]);
    const [semesterId, setSemesterId] = useState<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [semesters, setSemesters] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const { collegeId, adminId, collegeEducationId, collegeEducationType, loading: contextLoading } = useAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [educationTypes, setEducationTypes] = useState<any[]>([]);
    const [isFetchingEduTypes, setIsFetchingEduTypes] = useState(true);

    useEffect(() => {
        if (!collegeId) return;
        setIsFetchingEduTypes(true);
        fetchEducations(collegeId)
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
    }, [collegeId, collegeEducationId, collegeEducationType]);

    useEffect(() => {
        if (collegeEducationId) {
            setEducationId(collegeEducationId);
        }
    }, [collegeEducationId]);

    const selectedEducation = educationTypes.find(e => e.collegeEducationId === educationId);
    
    const currentEducationType = selectedEducation?.collegeEducationType ?? collegeEducationType;
    const isSchool = isSchoolEducation(currentEducationType);
    const isInter = currentEducationType === "Inter";

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


    const { data: facultyData, isLoading: loading } = useQuery({
        queryKey: [
            "calendar-faculty",
            collegeId,
            educationId,
            isSchool ? null : branchId,
            academicYearId,
            subjectId,
            currentPage
        ],
        queryFn: async () => {
            if (!collegeId) return { data: [], total: 0 };
            return await fetchFilteredFaculties({
                collegeId,
                collegeEducationId: educationId ?? undefined,
                collegeBranchId: isSchool ? undefined : (branchId ?? undefined),
                collegeAcademicYearId: academicYearId ?? undefined,
                collegeSubjectId: subjectId ?? undefined,
                page: currentPage,
                limit: itemsPerPage
            });
        },
        enabled: !!collegeId,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    const facultyList = facultyData?.data || [];
    const totalCount = facultyData?.total || 0;
    const paginatedFaculty = facultyList;

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
                            <FilterDropdown
                                label="Education Type"
                                value={educationId?.toString() ?? "All"}
                                placeholder="Select Education"
                                options={["All", ...educationTypes.map((et) => et.collegeEducationId.toString())]}
                                onChange={(val) => {
                                    if (val === "All") {
                                        setEducationId(null);
                                    } else {
                                        setEducationId(Number(val));
                                    }
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
                                displayModifier={(val) => {
                                    if (val === "All") return "All";
                                    return educationTypes.find((et) => et.collegeEducationId.toString() === val)?.collegeEducationType || val;
                                }}
                            />
                        </div>

                        {!isSchool && (
                            <div className="flex-1">
                                <FilterDropdown
                                    label={isInter ? "Group" : "Branch"}
                                    value={branchId?.toString() ?? "All"}
                                    disabled={!educationId}
                                    placeholder="Select Branch"
                                    options={["All", ...branches.map((b) => b.collegeBranchId.toString())]}
                                    onChange={(val) => {
                                        if (val === "All") {
                                            setBranchId(null);
                                        } else {
                                            setBranchId(Number(val));
                                        }
                                        setAcademicYearId(null);
                                        setSubjectId(null);
                                        setAcademicYears([]);
                                        setSubjects([]);
                                        setCurrentPage(1);
                                    }}
                                    displayModifier={(val) => {
                                        if (val === "All") return "All";
                                        return branches.find((b) => b.collegeBranchId.toString() === val)?.collegeBranchCode || val;
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex-1">
                            <FilterDropdown
                                label={isSchool ? "Class" : "Year"}
                                value={academicYearId?.toString() ?? "All"}
                                disabled={!isSchool && !branchId}
                                placeholder="Select Year"
                                options={["All", ...academicYears.map((y) => y.collegeAcademicYearId.toString())]}
                                onChange={(val) => {
                                    if (val === "All") {
                                        setAcademicYearId(null);
                                    } else {
                                        setAcademicYearId(Number(val));
                                    }
                                    setSubjectId(null);
                                    setSubjects([]);
                                    setSemesters([]);
                                    setCurrentPage(1);
                                }}
                                displayModifier={(val) => {
                                    if (val === "All") return "All";
                                    return academicYears.find((y) => y.collegeAcademicYearId.toString() === val)?.collegeAcademicYear || val;
                                }}
                            />
                        </div>


                {!isInter && !isSchool && (
                    <div className="flex-1">
                        <FilterDropdown
                            label="Semester"
                            value={semesterId?.toString() ?? "All"}
                            disabled={!academicYearId}
                            placeholder="Select Semester"
                            options={["All", ...semesters.map((s) => s.collegeSemesterId.toString())]}
                            onChange={(val) => {
                                if (val === "All") {
                                    setSemesterId(null);
                                } else {
                                    setSemesterId(Number(val));
                                }
                                setSubjectId(null);
                                setSubjects([]);
                                setCurrentPage(1);
                            }}
                            displayModifier={(val) => {
                                if (val === "All") return "All";
                                return semesters.find((s) => s.collegeSemesterId.toString() === val)?.collegeSemester || val;
                            }}
                        />
                    </div>
                )}

                <div className="flex-1">
                    <FilterDropdown
                        label="Subject"
                        value={subjectId?.toString() ?? "All"}
                        disabled={isSchool ? !academicYearId : (isInter ? !academicYearId : !semesterId)}
                        placeholder="Select Subject"
                        options={["All", ...subjects.map((s) => s.collegeSubjectId.toString())]}
                        onChange={(val) => {
                            if (val === "All") {
                                setSubjectId(null);
                            } else {
                                setSubjectId(Number(val));
                            }
                        }}
                        displayModifier={(val) => {
                            if (val === "All") return "All";
                            return subjects.find((s) => s.collegeSubjectId.toString() === val)?.subjectName || val;
                        }}
                    />
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
