import AttendanceTable from "../tables/attendanceTable";
import { AttendanceRecord, AttendanceStats, FacultyProfile } from "../types";
import AttendanceStatusCard from "./attendanceStatusCard";
import FacultyInfoCard from "./facultyInfoCard";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/app/utils/context/UserContext";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import FacultyInfoCardShimmer from "../shimmers/FacultyInfoCardShimmer";
import AttendanceStatusCardShimmer from "../shimmers/AttendanceStatusCardShimmer";
import AttendanceTableShimmer from "../shimmers/AttendanceTableShimmer";
import { getAttendanceData } from "@/lib/helpers/myAttendance/getAttendanceData";
import { getAttendanceMonthlyStats } from "@/lib/helpers/myAttendance/getAttendanceMonthlyStats";
import { getFacultyAssignedSubjects } from "@/lib/helpers/faculty/getFacultyAssignedSubjects";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useInstitutionTerminology } from "@/app/utils/hooks/useInstitutionTerminology";

type SubjectOption = {
  id: number;
  name: string;
  academicYearIds: number[];
};

type AssignedSubjectRow = {
  college_subjects:
  | { collegeSubjectId: number; subjectName: string }
  | Array<{ collegeSubjectId: number; subjectName: string }>
  | null;
  collegeAcademicYearId: number;
};

const mockProfile: FacultyProfile = {
  name: "Harsha Sharma",
  image: "/harshasharma.png",
  facultyId: null,
  branch: "CSE",
  mobile: "9876432134",
  email: "harshasharma@gmail.com",
  joiningDate: "12 July 2019",
  experience: "6 years",
};

const mockStats: AttendanceStats = {
  todayStatus: null,
  totalWorkingDays: 18,
  leavesTaken: 2,
  remainingLeaves: 10,
};

export const formatDate = (isoDate?: string | null) => {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const parseRowDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
};

const AttendancePage = () => {

  const { facultyId, email, collegeBranchCode, profilePhoto, mobile, fullName, dateOfJoining,
    professionalExperienceYears, collegeEducationType, userId, identifierId } = useUser()
  const { collegeAcademicYears, collegeAcademicYear, sections } = useFaculty();
  const { isSchool: isSchoolTerminology } = useInstitutionTerminology();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);

  const [filterEducationTypeId, setFilterEducationTypeId] = useState("");
  const [filterBranchId, setFilterBranchId] = useState("");
  const [filterSectionId, setFilterSectionId] = useState("");

  const itemsPerPage = 15;

  const availableEducationTypes = useMemo(() => {
    const typesMap = new Map();
    sections?.forEach((s) => {
      if (s.collegeEducationId && s.faculty_edu_type) {
        typesMap.set(s.collegeEducationId, {
          id: String(s.collegeEducationId),
          name: s.faculty_edu_type.collegeEducationType,
        });
      }
    });
    return Array.from(typesMap.values());
  }, [sections]);

  const isSchool = useMemo(() => {
    if (!filterEducationTypeId) {
      if (isSchoolTerminology) return true;
      if (availableEducationTypes.length > 0) {
        return availableEducationTypes.every((e) => isSchoolEducation(e.name));
      }
      return isSchoolEducation(collegeEducationType);
    }
    const selectedEdu = availableEducationTypes.find((e) => e.id === filterEducationTypeId);
    return selectedEdu ? isSchoolEducation(selectedEdu.name) : isSchoolTerminology;
  }, [filterEducationTypeId, availableEducationTypes, isSchoolTerminology, collegeEducationType]);

  useEffect(() => {
    if (availableEducationTypes.length === 1 && !filterEducationTypeId) {
      setFilterEducationTypeId(String(availableEducationTypes[0].id));
    }
  }, [availableEducationTypes, filterEducationTypeId]);

  const availableBranches = useMemo(() => {
    if (isSchool) return [];
    if (!filterEducationTypeId) return [];
    const branchesMap = new Map();
    sections?.forEach((s) => {
      if (String(s.collegeEducationId) === filterEducationTypeId && s.collegeBranchId && s.college_branch) {
        branchesMap.set(s.collegeBranchId, {
          id: String(s.collegeBranchId),
          name: s.college_branch.collegeBranchCode,
        });
      }
    });
    return Array.from(branchesMap.values());
  }, [filterEducationTypeId, isSchool, sections]);

  const availableYears = useMemo(() => {
    const targetEduId = filterEducationTypeId || (availableEducationTypes.length === 1 ? String(availableEducationTypes[0].id) : "");
    if (!targetEduId && availableEducationTypes.length > 1) return [];
    const yearsMap = new Map();
    sections?.forEach((s: any) => {
      if (
        (!targetEduId || String(s.collegeEducationId) === targetEduId) &&
        (isSchool || !filterBranchId || String(s.collegeBranchId) === filterBranchId)
      ) {
        yearsMap.set(s.collegeAcademicYearId, {
          id: s.collegeAcademicYearId,
          name: s.college_academic_year?.collegeAcademicYear || `Year ${s.collegeAcademicYearId}`,
        });
      }
    });
    return Array.from(yearsMap.values());
  }, [filterEducationTypeId, filterBranchId, isSchool, availableEducationTypes, sections]);

  const { data: subjectsData = [] } = useQuery({
    queryKey: ["facultyAssignedSubjects", facultyId],
    queryFn: async () => {
      const rows = await getFacultyAssignedSubjects({ facultyId: facultyId! });
      const uniqueSubjects = new Map<number, SubjectOption>();
      (rows as AssignedSubjectRow[]).forEach((row) => {
        const subject = Array.isArray(row.college_subjects)
          ? row.college_subjects[0]
          : row.college_subjects;
        if (subject?.collegeSubjectId && subject?.subjectName) {
          const existing = uniqueSubjects.get(subject.collegeSubjectId);
          if (existing) {
            if (!existing.academicYearIds.includes(row.collegeAcademicYearId)) {
              existing.academicYearIds.push(row.collegeAcademicYearId);
            }
          } else {
            uniqueSubjects.set(subject.collegeSubjectId, {
              id: subject.collegeSubjectId,
              name: subject.subjectName,
              academicYearIds: [row.collegeAcademicYearId],
            });
          }
        }
      });
      return Array.from(uniqueSubjects.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    },
    enabled: !!facultyId,
  });

  const availableSubjects = useMemo(() => {
    if (!selectedAcademicYearId) return [];
    const targetEduId = filterEducationTypeId || (availableEducationTypes.length === 1 ? String(availableEducationTypes[0].id) : "");
    const subjectsMap = new Map();
    sections?.forEach((s: any) => {
      if (
        (!targetEduId || String(s.collegeEducationId) === targetEduId) &&
        (isSchool || !filterBranchId || String(s.collegeBranchId) === filterBranchId) &&
        s.collegeAcademicYearId === selectedAcademicYearId &&
        s.collegeSubjectId && s.faculty_subject
      ) {
        subjectsMap.set(s.collegeSubjectId, {
          id: s.collegeSubjectId,
          name: s.faculty_subject.subjectName,
        });
      }
    });
    return Array.from(subjectsMap.values());
  }, [filterEducationTypeId, filterBranchId, selectedAcademicYearId, isSchool, availableEducationTypes, sections]);

  const availableSections = useMemo(() => {
    if (!selectedSubjectId) return [];
    const targetEduId = filterEducationTypeId || (availableEducationTypes.length === 1 ? String(availableEducationTypes[0].id) : "");
    const sectionsMap = new Map();
    sections?.forEach((s: any) => {
      if (
        (!targetEduId || String(s.collegeEducationId) === targetEduId) &&
        (isSchool || !filterBranchId || String(s.collegeBranchId) === filterBranchId) &&
        s.collegeAcademicYearId === selectedAcademicYearId &&
        s.collegeSubjectId === selectedSubjectId &&
        s.collegeSectionsId
      ) {
        sectionsMap.set(s.collegeSectionsId, {
          id: String(s.collegeSectionsId),
          name: s.college_sections?.collegeSections || `Section ${s.collegeSectionsId}`,
        });
      }
    });
    return Array.from(sectionsMap.values());
  }, [filterEducationTypeId, filterBranchId, selectedAcademicYearId, selectedSubjectId, isSchool, availableEducationTypes, sections]);

  const { data: rawStatsData, isLoading: statsLoading } = useQuery({
    queryKey: ["attendanceMonthlyStats", userId, selectedMonth, selectedYear],
    queryFn: async () => {
      const [statsRes, recordsRes] = await Promise.all([
        getAttendanceMonthlyStats({
          userId: userId!,
          month: selectedMonth,
          year: selectedYear
        }),
        getAttendanceData({
          userId: userId!,
          month: selectedMonth,
          year: selectedYear,
          page: 1,
          limit: 31
        })
      ]);
      return {
        allMonthRecords: recordsRes.records,
        rawStats: {
          todayStatus: statsRes.todayStatus,
          totalWorkingDays: statsRes.totalWorkingDays,
          leavesTaken: statsRes.leavesTaken,
          remainingLeaves: statsRes.remainingLeaves,
          lopDays: statsRes.lopDays,
          expectedWorkingDays: statsRes.expectedWorkingDays,
          presentDays: statsRes.presentDays
        }
      };
    },
    enabled: !!userId,
  });

  const stats = useMemo(() => {
    if (!rawStatsData?.rawStats) return null;
    const { rawStats, allMonthRecords } = rawStatsData;

    if (!dateOfJoining) return rawStats;

    const joiningDateObj = new Date(dateOfJoining);
    joiningDateObj.setHours(0, 0, 0, 0);

    const selectedMonthStart = new Date(selectedYear, selectedMonth - 1, 1);
    const selectedMonthEnd = new Date(selectedYear, selectedMonth, 0);

    if (selectedMonthEnd < joiningDateObj) {
      return {
        todayStatus: "—",
        totalWorkingDays: 0,
        leavesTaken: 0,
        remainingLeaves: rawStats.remainingLeaves,
        lopDays: 0,
        expectedWorkingDays: 0,
        presentDays: 0
      };
    }

    if (
      selectedYear === joiningDateObj.getFullYear() &&
      selectedMonth - 1 === joiningDateObj.getMonth()
    ) {
      let preJoiningAbsentCount = 0;
      allMonthRecords.forEach((row) => {
        const rowDateObj = parseRowDate(row.date);
        if (rowDateObj) {
          rowDateObj.setHours(0, 0, 0, 0);
          if (rowDateObj < joiningDateObj) {
            const status = row.status?.toUpperCase();
            if (status === "ABSENT" || !status || status === "—") {
              preJoiningAbsentCount++;
            }
          }
        }
      });

      return {
        ...rawStats,
        lopDays: Math.max(0, (rawStats.lopDays ?? 0) - preJoiningAbsentCount)
      };
    }

    return rawStats;
  }, [rawStatsData, dateOfJoining, selectedMonth, selectedYear]);

  const { data: tableData, isLoading: tableLoading } = useQuery({
    queryKey: [
      "attendanceRecords",
      userId,
      selectedMonth,
      selectedYear,
      currentPage,
      itemsPerPage,
      selectedSubjectId,
      selectedAcademicYearId,
    ],
    queryFn: async () => {
      const res = await getAttendanceData({
        userId: userId!,
        month: selectedMonth,
        year: selectedYear,
        page: currentPage,
        limit: itemsPerPage,
        subjectId: selectedSubjectId ?? undefined,
        academicYearId: selectedAcademicYearId ?? undefined,
      });
      return {
        records: res.records,
        totalItems: res.total,
      };
    },
    enabled: !!userId,
  });

  const records = tableData?.records ?? [];
  const totalItems = tableData?.totalItems ?? 0;

  const profile = useMemo(() => {
    if (!facultyId || !identifierId) return null;
    return {
      ...mockProfile,
      name: fullName!,
      mobile: mobile!,
      facultyId: identifierId!,
      branch: collegeBranchCode ?? mockProfile.branch,
      email: email ?? mockProfile.email,
      joiningDate: formatDate(dateOfJoining),
      image: profilePhoto ?? "",
      experience: professionalExperienceYears ? `${professionalExperienceYears} ${Number(professionalExperienceYears) > 1 ? 'years' : 'year'} ` : "—"
    };
  }, [facultyId, identifierId, collegeBranchCode, email, profilePhoto, fullName, dateOfJoining, mobile, professionalExperienceYears]);

  const infoLoading = !profile;


  return (
    <div className="flex flex-col h-full max-md:px-2">
      <div className="flex max-md:flex-col gap-4 mb-4 w-full">
        {infoLoading || !profile
          ? <FacultyInfoCardShimmer />
          :
          <FacultyInfoCard
            profile={{ ...profile, collegeEducationType }}
            loading={false}
            academicYear={collegeAcademicYear}
            sections={sections}
            isSchool={isSchool}
          />
        }
        {(statsLoading || !stats) ? <AttendanceStatusCardShimmer /> : <AttendanceStatusCard stats={stats} />}
      </div>
      <div className="flex flex-col flex-1 h-full min-h-[400px]">
        {tableLoading || !records
          ? <AttendanceTableShimmer />
          : <AttendanceTable
            title="Attendance Table"
            records={records}
            month={
              [
                "JAN", "FEB", "MAR", "APR",
                "MAY", "JUN", "JUL", "AUG",
                "SEP", "OCT", "NOV", "DEC"
              ][selectedMonth - 1]
            }
            year={String(selectedYear)}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onMonthYearChange={(month, year) => {
              setSelectedMonth(month);
              setSelectedYear(year);
              setCurrentPage(1);
            }}
            loading={tableLoading}
            renderFilters={
              <>
                <CustomDropdown
                  label=""
                  options={availableEducationTypes.map(t => ({ label: t.name, value: t.id }))}
                  value={filterEducationTypeId}
                  onChange={(v) => {
                    setFilterEducationTypeId(String(v));
                    setFilterBranchId("");
                    setSelectedAcademicYearId(null);
                    setSelectedSubjectId(null);
                    setFilterSectionId("");
                    setCurrentPage(1);
                  }}
                  placeholder="Education Type"
                  theme="green"
                  widthClassName="w-[140px] shrink-0"
                />

                {!isSchool && (
                  <CustomDropdown
                    label=""
                    options={availableBranches.map(b => ({ label: b.name, value: b.id }))}
                    value={filterBranchId}
                    onChange={(v) => {
                      setFilterBranchId(String(v));
                      setSelectedAcademicYearId(null);
                      setSelectedSubjectId(null);
                      setFilterSectionId("");
                      setCurrentPage(1);
                    }}
                    placeholder="Branch"
                    theme="green"
                    disabled={!filterEducationTypeId}
                    widthClassName="w-[140px] shrink-0"
                  />
                )}

                <CustomDropdown
                  label=""
                  options={availableYears.map(y => ({ label: y.name, value: String(y.id) }))}
                  value={selectedAcademicYearId ? String(selectedAcademicYearId) : ""}
                  onChange={(v) => {
                    setSelectedAcademicYearId(Number(v));
                    setSelectedSubjectId(null);
                    setFilterSectionId("");
                    setCurrentPage(1);
                  }}
                  placeholder="Year"
                  theme="green"
                  disabled={(!filterEducationTypeId && availableEducationTypes.length > 1) || (!isSchool && !filterBranchId)}
                  widthClassName="w-[140px] shrink-0"
                />

                <CustomDropdown
                  label=""
                  options={availableSubjects.map(s => ({ label: s.name, value: String(s.id) }))}
                  value={selectedSubjectId ? String(selectedSubjectId) : ""}
                  onChange={(v) => {
                    setSelectedSubjectId(Number(v));
                    setFilterSectionId("");
                    setCurrentPage(1);
                  }}
                  placeholder="Subject"
                  theme="green"
                  disabled={!selectedAcademicYearId}
                  widthClassName="w-[140px] shrink-0"
                />

                <CustomDropdown
                  label=""
                  options={availableSections.map(s => ({ label: s.name, value: s.id }))}
                  value={filterSectionId}
                  onChange={(v) => {
                    setFilterSectionId(String(v));
                    setCurrentPage(1);
                  }}
                  placeholder="Section"
                  theme="green"
                  disabled={!selectedSubjectId}
                  widthClassName="w-[140px] shrink-0"
                />
              </>
            }
          />
        }
      </div>
    </div>
  );
};

export default AttendancePage;
