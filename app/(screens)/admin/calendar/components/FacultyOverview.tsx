"use client"
import { useEffect, useCallback, useState } from "react"
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
import { useRouter, useSearchParams, usePathname } from "next/navigation";

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
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const rawEduId = searchParams.get("educationId");
    const educationId = rawEduId === "all" ? null : (rawEduId ? Number(rawEduId) : null);
    const branchId = searchParams.get("branchId") ? Number(searchParams.get("branchId")) : null;
    const academicYearId = searchParams.get("academicYearId") ? Number(searchParams.get("academicYearId")) : null;
    const semesterId = searchParams.get("semesterId") ? Number(searchParams.get("semesterId")) : null;
    const subjectId = searchParams.get("subjectId") ? Number(searchParams.get("subjectId")) : null;
    const currentPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

    const itemsPerPage = 9;

    const { collegeId, adminId, collegeEducationId, collegeEducationType, loading: contextLoading } = useAdmin();

    const [localParams, setLocalParams] = useState<Record<string, string | null>>({
        educationId: searchParams.get("educationId"),
        branchId: searchParams.get("branchId"),
        academicYearId: searchParams.get("academicYearId"),
        semesterId: searchParams.get("semesterId"),
        subjectId: searchParams.get("subjectId")
    });

    useEffect(() => {
        setLocalParams({
            educationId: searchParams.get("educationId"),
            branchId: searchParams.get("branchId"),
            academicYearId: searchParams.get("academicYearId"),
            semesterId: searchParams.get("semesterId"),
            subjectId: searchParams.get("subjectId")
        });
    }, [searchParams]);

    const updateQueryParams = useCallback((paramsToUpdate: Record<string, string | null>) => {
        setLocalParams(prev => ({ ...prev, ...paramsToUpdate }));
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        Object.entries(paramsToUpdate).forEach(([key, value]) => {
            if (value === null) {
                current.delete(key);
            } else {
                current.set(key, value);
            }
        });
        router.push(`${pathname}?${current.toString()}`, { scroll: false });
    }, [pathname, router, searchParams]);

    useEffect(() => {
        if (collegeEducationId && !rawEduId) {
            updateQueryParams({ educationId: collegeEducationId.toString() });
        }
    }, [collegeEducationId, rawEduId, updateQueryParams]);

    const { data: educationTypes = [], isLoading: isFetchingEduTypes } = useQuery({
        queryKey: ["educationTypes", collegeId],
        queryFn: async () => {
            if (!collegeId) return [];
            try {
                const res = await fetchEducations(collegeId);
                if (res.length > 0) return res;
                if (collegeEducationId && collegeEducationType) {
                    return [{
                        collegeEducationId,
                        collegeEducationType
                    }];
                }
                return [];
            } catch (err) {
                toast.error("Failed to load education types");
                return [];
            }
        },
        enabled: !!collegeId,
        staleTime: 10 * 60 * 1000,
    });

    const selectedEducation = educationTypes.find((e: any) => e.collegeEducationId === educationId);
    const currentEducationType = selectedEducation?.collegeEducationType ?? collegeEducationType;
    const isSchool = isSchoolEducation(currentEducationType);
    const isInter = currentEducationType === "Inter";

    const { data: branches = [] } = useQuery({
        queryKey: ["branches", collegeId, educationId],
        queryFn: async () => {
            if (!collegeId || !educationId) return [];
            try {
                return await fetchBranches(collegeId, educationId);
            } catch (err) {
                toast.error("Failed to load branches");
                return [];
            }
        },
        enabled: !!collegeId && !!educationId,
        staleTime: 10 * 60 * 1000,
    });

    const { data: academicYears = [] } = useQuery({
        queryKey: ["academicYears", collegeId, educationId, branchId, isSchool],
        queryFn: async () => {
            if (!collegeId || !educationId || (!isSchool && !branchId)) return [];
            try {
                return await fetchAcademicYears(collegeId, educationId, isSchool ? null : branchId);
            } catch (err) {
                toast.error("Failed to load academic years");
                return [];
            }
        },
        enabled: !!collegeId && !!educationId && (isSchool || !!branchId),
        staleTime: 10 * 60 * 1000,
    });

    const { data: semesters = [] } = useQuery({
        queryKey: ["semesters", collegeId, educationId, academicYearId, isSchool],
        queryFn: async () => {
            if (!collegeId || !educationId || !academicYearId || isSchool) return [];
            try {
                return await fetchSemesters(collegeId, educationId, academicYearId);
            } catch (err) {
                toast.error("Failed to load semesters");
                return [];
            }
        },
        enabled: !!collegeId && !!educationId && !!academicYearId && !isSchool,
        staleTime: 10 * 60 * 1000,
    });

    const { data: subjects = [] } = useQuery({
        queryKey: ["subjects", collegeId, educationId, branchId, academicYearId, semesterId, isSchool, isInter],
        queryFn: async () => {
            if (
                !collegeId ||
                !educationId ||
                (!isSchool && !branchId) ||
                !academicYearId ||
                (!semesterId && !isInter && !isSchool)
            ) return [];
            try {
                return await fetchSubjects(collegeId, educationId, isSchool ? null : branchId, academicYearId, isSchool ? null : semesterId);
            } catch (err) {
                toast.error("Failed to load subjects");
                return [];
            }
        },
        enabled: !!collegeId && !!educationId && !!academicYearId && (isSchool || !!branchId) && (isSchool || isInter || !!semesterId),
        staleTime: 10 * 60 * 1000,
    });

    const { data: facultyData, isLoading, isFetching } = useQuery({
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

    const loading = isLoading || isFetching || contextLoading || isFetchingEduTypes;
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
                                value={localParams.educationId === "all" ? "All" : (localParams.educationId ?? "All")}
                                placeholder="Select Education"
                                options={["All", ...educationTypes.map((et: any) => et.collegeEducationId.toString())]}
                                onChange={(val) => {
                                    if (val === "All") {
                                        updateQueryParams({
                                            educationId: "all",
                                            branchId: null,
                                            academicYearId: null,
                                            semesterId: null,
                                            subjectId: null,
                                            page: "1"
                                        });
                                    } else {
                                        updateQueryParams({
                                            educationId: val,
                                            branchId: null,
                                            academicYearId: null,
                                            semesterId: null,
                                            subjectId: null,
                                            page: "1"
                                        });
                                    }
                                }}
                                displayModifier={(val) => {
                                    if (val === "All") return "All";
                                    return educationTypes.find((et: any) => et.collegeEducationId.toString() === val)?.collegeEducationType || val;
                                }}
                            />
                        </div>

                        {!isSchool && (
                            <div className="flex-1">
                                <FilterDropdown
                                    label={isInter ? "Group" : "Branch"}
                                    value={localParams.branchId ?? "All"}
                                    disabled={!educationId}
                                    placeholder="Select Branch"
                                    options={["All", ...branches.map((b: any) => b.collegeBranchId.toString())]}
                                    onChange={(val) => {
                                        if (val === "All") {
                                            updateQueryParams({
                                                branchId: null,
                                                academicYearId: null,
                                                subjectId: null,
                                                page: "1"
                                            });
                                        } else {
                                            updateQueryParams({
                                                branchId: val,
                                                academicYearId: null,
                                                subjectId: null,
                                                page: "1"
                                            });
                                        }
                                    }}
                                    displayModifier={(val) => {
                                        if (val === "All") return "All";
                                        return branches.find((b: any) => b.collegeBranchId.toString() === val)?.collegeBranchCode || val;
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex-1">
                            <FilterDropdown
                                label={isSchool ? "Class" : "Year"}
                                value={localParams.academicYearId ?? "All"}
                                disabled={!educationId || (!isSchool && !branchId)}
                                placeholder="Select Year"
                                options={["All", ...academicYears.map((y: any) => y.collegeAcademicYearId.toString())]}
                                onChange={(val) => {
                                    if (val === "All") {
                                        updateQueryParams({
                                            academicYearId: null,
                                            subjectId: null,
                                            semesterId: null,
                                            page: "1"
                                        });
                                    } else {
                                        updateQueryParams({
                                            academicYearId: val,
                                            subjectId: null,
                                            semesterId: null,
                                            page: "1"
                                        });
                                    }
                                }}
                                displayModifier={(val) => {
                                    if (val === "All") return "All";
                                    return academicYears.find((y: any) => y.collegeAcademicYearId.toString() === val)?.collegeAcademicYear || val;
                                }}
                            />
                        </div>


                {!isInter && !isSchool && (
                    <div className="flex-1">
                        <FilterDropdown
                            label="Semester"
                            value={localParams.semesterId ?? "All"}
                            disabled={!academicYearId}
                            placeholder="Select Semester"
                            options={["All", ...semesters.map((s: any) => s.collegeSemesterId.toString())]}
                            onChange={(val) => {
                                if (val === "All") {
                                    updateQueryParams({
                                        semesterId: null,
                                        subjectId: null,
                                        page: "1"
                                    });
                                } else {
                                    updateQueryParams({
                                        semesterId: val,
                                        subjectId: null,
                                        page: "1"
                                    });
                                }
                            }}
                            displayModifier={(val) => {
                                if (val === "All") return "All";
                                return semesters.find((s: any) => s.collegeSemesterId.toString() === val)?.collegeSemester || val;
                            }}
                        />
                    </div>
                )}

                <div className="flex-1">
                    <FilterDropdown
                        label="Subject"
                        value={localParams.subjectId ?? "All"}
                        disabled={isSchool ? !academicYearId : (isInter ? !academicYearId : !semesterId)}
                        placeholder="Select Subject"
                        options={["All", ...subjects.map((s: any) => s.collegeSubjectId.toString())]}
                        onChange={(val) => {
                            if (val === "All") {
                                updateQueryParams({ subjectId: null, page: "1" });
                            } else {
                                updateQueryParams({ subjectId: val, page: "1" });
                            }
                        }}
                        displayModifier={(val) => {
                            if (val === "All") return "All";
                            return subjects.find((s: any) => s.collegeSubjectId.toString() === val)?.subjectName || val;
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
                    onPageChange={(page) => updateQueryParams({ page: page.toString() })}
                    alwaysShow={true}
                    roundedBottom="rounded-lg"
                />
            </div>

        </main >
    )
}

