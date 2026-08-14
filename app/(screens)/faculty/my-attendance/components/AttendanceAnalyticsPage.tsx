import AnalyticsFacultyInfo from "./AnalyticsFacultyInfo";
import {
  AnalyticsFacultyProfile,
  AttendanceRecord,
  ChartDataPoint,
} from "../types";
import AttendancePerformanceChart from "../charts/AttendancePerformanceChart";
import AttendanceTable from "../tables/attendanceTable";

import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
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
  const { collegeAcademicYears, collegeAcademicYear } = useFaculty();
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
      setInfoLoading(false)
    }
  }, [facultyId, collegeBranchCode, fullName, collegeEducationType, collegeAcademicYear, workingDays, leavesTaken]);

  useEffect(() => {
    if (!userId) return;
    setTableLoading(true)
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
        setTotalItems(0)
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
      {initialLoad
        ? <AttendanceTableShimmer />
        :
        <AttendanceTable
          loading={tableLoading}
          title="Daily Attendance Record"
          records={records}
          month={[
            "JAN", "FEB", "MAR", "APR",
            "MAY", "JUN", "JUL", "AUG",
            "SEP", "OCT", "NOV", "DEC"
          ][selectedMonth - 1]}
          year={String(selectedYear)}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          academicYears={collegeAcademicYears.map((item) => ({
            id: item.collegeAcademicYearId,
            name: item.collegeAcademicYear,
          }))}
          selectedAcademicYearId={selectedAcademicYearId}
          onAcademicYearChange={(academicYearId) => {
            setSelectedAcademicYearId(academicYearId);
            setSelectedSubjectId(null);
            setCurrentPage(1);
          }}
          subjects={subjects.filter(
            (subject) =>
              !selectedAcademicYearId || subject.academicYearIds.includes(selectedAcademicYearId),
          )}
          selectedSubjectId={selectedSubjectId}
          onSubjectChange={(subjectId) => {
            setSelectedSubjectId(subjectId);
            setCurrentPage(1);
          }}
          onMonthYearChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
            setCurrentPage(1);
          }}
        />
      }
    </div>
  );
};

export default AttendanceAnalyticsPage;
