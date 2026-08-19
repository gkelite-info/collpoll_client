import AnalyticsFacultyInfo from "./AnalyticsFacultyInfo";
import {
  AnalyticsFacultyProfile,
  AttendanceRecord,
  ChartDataPoint,
} from "../types";
import AttendancePerformanceChart from "../charts/AttendancePerformanceChart";
import AttendanceTable from "../tables/attendanceTable";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { getAttendanceData } from "@/lib/helpers/myAttendance/getAttendanceData";
import { getAttendanceYearlyStats } from "@/lib/helpers/myAttendance/getAttendanceYearlyStats";
import AttendanceTableShimmer from "../shimmers/AttendanceTableShimmer";
import AttendancePerformanceChartShimmer from "../shimmers/AttendancePerformanceChartShimmer";
import AnalyticsFacultyInfoShimmer from "../shimmers/AnalyticsFacultyInfoShimmer";
import { getAttendanceMonthlyStats } from "@/lib/helpers/myAttendance/getAttendanceMonthlyStats";
import { getFacultyAssignedSubjects } from "@/lib/helpers/faculty/getFacultyAssignedSubjects";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useInstitutionTerminology } from "@/app/utils/hooks/useInstitutionTerminology";

type AnalyticsSubjectOption = {
  id: number;
  name: string;
  academicYearIds: number[];
};

type AssignedSubjectRow = {
  collegeAcademicYearId: number;
  college_subjects:
  | { collegeSubjectId: number; subjectName: string }
  | Array<{ collegeSubjectId: number; subjectName: string }>
  | null;
};

const mockProfile: AnalyticsFacultyProfile = {
  name: "",
  department: "",
  employeeId: "",
  experience: "6 years",
  leavesTaken: 0,
  workingDays: 0,
};

const AttendanceAnalyticsPage = () => {
  const { userId, collegeBranchCode, fullName, facultyId, collegeEducationType, professionalExperienceYears, identifierId } = useUser();
  const { collegeAcademicYears, collegeAcademicYear, sections } = useFaculty();
  const { isSchool } = useInstitutionTerminology();
  const [profile, setProfile] = useState<AnalyticsFacultyProfile | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [subjects, setSubjects] = useState<AnalyticsSubjectOption[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const [filterEducationTypeId, setFilterEducationTypeId] = useState("");
  const [filterBranchId, setFilterBranchId] = useState("");
  const [filterSectionId, setFilterSectionId] = useState("");

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

  const isSchoolEdu = useMemo(() => {
    if (!filterEducationTypeId) {
      if (isSchool) return true;
      if (availableEducationTypes.length > 0) {
        return availableEducationTypes.every((e) => isSchoolEducation(e.name));
      }
      return isSchoolEducation(collegeEducationType);
    }
    const selectedEdu = availableEducationTypes.find((e) => e.id === filterEducationTypeId);
    return selectedEdu ? isSchoolEducation(selectedEdu.name) : isSchool;
  }, [filterEducationTypeId, availableEducationTypes, isSchool, collegeEducationType]);

  useEffect(() => {
    if (availableEducationTypes.length === 1 && !filterEducationTypeId) {
      setFilterEducationTypeId(String(availableEducationTypes[0].id));
    }
  }, [availableEducationTypes, filterEducationTypeId]);

  const availableBranches = useMemo(() => {
    if (isSchoolEdu) return [];
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
  }, [filterEducationTypeId, isSchoolEdu, sections]);

  const availableYears = useMemo(() => {
    const targetEduId = filterEducationTypeId || (availableEducationTypes.length === 1 ? String(availableEducationTypes[0].id) : "");
    if (!targetEduId && availableEducationTypes.length > 1) return [];
    const yearsMap = new Map();
    sections?.forEach((s: any) => {
      if (
        (!targetEduId || String(s.collegeEducationId) === targetEduId) &&
        (isSchoolEdu || !filterBranchId || String(s.collegeBranchId) === filterBranchId)
      ) {
        yearsMap.set(s.collegeAcademicYearId, {
          id: s.collegeAcademicYearId,
          name: s.college_academic_year?.collegeAcademicYear || `Year ${s.collegeAcademicYearId}`,
        });
      }
    });
    return Array.from(yearsMap.values());
  }, [filterEducationTypeId, filterBranchId, isSchoolEdu, availableEducationTypes, sections]);

  const availableSubjects = useMemo(() => {
    if (!selectedAcademicYearId) return [];
    const targetEduId = filterEducationTypeId || (availableEducationTypes.length === 1 ? String(availableEducationTypes[0].id) : "");
    const subjectsMap = new Map();
    sections?.forEach((s: any) => {
      if (
        (!targetEduId || String(s.collegeEducationId) === targetEduId) &&
        (isSchoolEdu || !filterBranchId || String(s.collegeBranchId) === filterBranchId) &&
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
  }, [filterEducationTypeId, filterBranchId, selectedAcademicYearId, isSchoolEdu, availableEducationTypes, sections]);

  const availableSections = useMemo(() => {
    if (!selectedSubjectId) return [];
    const targetEduId = filterEducationTypeId || (availableEducationTypes.length === 1 ? String(availableEducationTypes[0].id) : "");
    const sectionsMap = new Map();
    sections?.forEach((s: any) => {
      if (
        (!targetEduId || String(s.collegeEducationId) === targetEduId) &&
        (isSchoolEdu || !filterBranchId || String(s.collegeBranchId) === filterBranchId) &&
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
  }, [filterEducationTypeId, filterBranchId, selectedAcademicYearId, selectedSubjectId, isSchoolEdu, availableEducationTypes, sections]);

  const attendanceQueryKey = `${currentPage}:${selectedAcademicYearId ?? "all"}:${selectedSubjectId ?? "all"}`;

  const [tableLoading, setTableLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [workingDays, setWorkingDays] = useState(0);
  const [workingDaysLoading, setWorkingDaysLoading] = useState(true);
  const [leavesTaken, setLeavesTaken] = useState(0);
  const itemsPerPage = 15;

  useEffect(() => {
    if (!facultyId) return;
    getFacultyAssignedSubjects({ facultyId })
      .then((rows) => {
        const uniqueSubjects = new Map<number, AnalyticsSubjectOption>();
        (rows as AssignedSubjectRow[]).forEach((row) => {
          const subject = Array.isArray(row.college_subjects)
            ? row.college_subjects[0]
            : row.college_subjects;
          if (!subject?.collegeSubjectId || !subject.subjectName) return;
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
        });
        setSubjects(Array.from(uniqueSubjects.values()).sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => setSubjects([]));
  }, [facultyId]);

  useEffect(() => {
    if (!userId) return;

    const fetchWorkingDays = async () => {
      setWorkingDaysLoading(true);
      try {
        const res = await getAttendanceMonthlyStats({
          userId,
          month: selectedMonth,
          year: selectedYear
        });

        setWorkingDays(res.totalWorkingDays);
        setLeavesTaken(res.leavesTaken || 0);
      } catch (err) {
        setWorkingDays(0);
        setLeavesTaken(0);
      } finally {
        setWorkingDaysLoading(false);
      }
    };

    fetchWorkingDays();
  }, [userId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!facultyId || !fullName || !identifierId) return;
    setInfoLoading(true);
    try {
      const updatedProfile: AnalyticsFacultyProfile = {
        ...mockProfile,
        name: fullName,
        department: collegeBranchCode || "",
        employeeId: identifierId,
        collegeEducationType: collegeEducationType || "",
        academicYear: collegeAcademicYear,
        experience: professionalExperienceYears ? `${professionalExperienceYears} ${Number(professionalExperienceYears) > 1 ? 'years' : 'year'} ` : "—",
        workingDays,
        leavesTaken
      };
      setProfile(updatedProfile);
    } finally {
      setInfoLoading(false);
    }
  }, [facultyId, collegeBranchCode, fullName, collegeEducationType, collegeAcademicYear, workingDays, leavesTaken]);

  useEffect(() => {
    if (!userId) return;
    setTableLoading(true);
    getAttendanceData({
      userId,
      month: selectedMonth,
      year: selectedYear,
      page: currentPage,
      limit: itemsPerPage,
      academicYearId: selectedAcademicYearId ?? undefined,
      subjectId: selectedSubjectId ?? undefined,
    })
      .then(res => {
        setRecords(res.records);
        setTotalItems(res.total);
      }).catch(() => {
        setRecords([]);
        setTotalItems(0);
      }).finally(() => {
        setTableLoading(false);
        setInitialLoad(false);
      });
  }, [userId, selectedMonth, selectedYear, attendanceQueryKey]);

  useEffect(() => {
    if (!userId) return;
    setChartLoading(true);
    getAttendanceYearlyStats(
      userId,
      selectedYear
    )
      .then(setChartData)
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false));
  }, [userId, selectedYear]);

  return (
    <div className="flex flex-col w-full max-md:px-2">
      <div className="p-1 w-full">
        {infoLoading || workingDaysLoading || !profile ? (
          <AnalyticsFacultyInfoShimmer />
        ) : (
          <AnalyticsFacultyInfo profile={profile} isSchool={isSchool} />
        )}
      </div>
      {chartLoading ?
        <AttendancePerformanceChartShimmer />
        :
        <AttendancePerformanceChart data={chartData} />
      }
      <div className="flex flex-col flex-1 h-full min-h-[400px]">
        {tableLoading || !records
          ? <AttendanceTableShimmer />
          : <AttendanceTable
            title="Attendance Details"
            loading={tableLoading}
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

                {!isSchoolEdu && (
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
                  disabled={(!filterEducationTypeId && availableEducationTypes.length > 1) || (!isSchoolEdu && !filterBranchId)}
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

export default AttendanceAnalyticsPage;

