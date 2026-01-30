"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/app/utils/context/UserContext";
import { CardProps } from "@/app/(screens)/(student)/academics/components/subjectCard";

type StudentProfile = {
  studentId: number;
  department: string;
  degree: string;
  year: string;
  semester: string;
  collegeBranchId: number;
  collegeEducationId: number;
  collegeId: number;
};

type FetchResult = {
  profile: StudentProfile;
  subjects: CardProps[];
} | null;

type StudentContextType = {
  studentProfile: StudentProfile | null;
  subjects: CardProps[];
  loading: boolean;
  refreshData: () => Promise<void>;
};

const fetchStudentAcademicData = async (
  userId: number,
): Promise<FetchResult> => {
  try {
    // ---------------------------------------------------------
    // STEP 1: Fetch Student Basic Details
    // ---------------------------------------------------------
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select(
        `
        studentId,
        collegeBranchId,
        collegeEducationId,
        collegeId,
        college_branch ( collegeBranchCode ),
        college_education ( collegeEducationType )
      `,
      )
      .eq("userId", userId)
      .single();

    if (studentError || !studentData) {
      console.error("Student Fetch Error:", studentError);
      return null;
    }

    // ---------------------------------------------------------
    // STEP 1.5: Fetch Current Academic History
    // ---------------------------------------------------------
    const { data: historyData, error: historyError } = await supabase
      .from("student_academic_history")
      .select(
        `
        collegeAcademicYearId,
        collegeSemesterId,
        college_academic_year ( collegeAcademicYear ),
        college_semester ( collegeSemester )
      `,
      )
      .eq("studentId", studentData.studentId)
      .eq("isCurrent", true)
      .maybeSingle();

    const currentYearId = historyData?.collegeAcademicYearId;
    const currentSemesterId = historyData?.collegeSemesterId;

    const yearObj = Array.isArray(historyData?.college_academic_year)
      ? historyData?.college_academic_year[0]
      : historyData?.college_academic_year;
    const semObj = Array.isArray(historyData?.college_semester)
      ? historyData?.college_semester[0]
      : historyData?.college_semester;

    const currentYearStr = yearObj?.collegeAcademicYear || "N/A";
    const currentSemStr = semObj?.collegeSemester
      ? `Sem ${semObj.collegeSemester}`
      : "N/A";

    // ---------------------------------------------------------
    // Prepare Profile Object
    // ---------------------------------------------------------
    const branchData = studentData.college_branch as any;
    const educationData = studentData.college_education as any;

    const branchCode = Array.isArray(branchData)
      ? branchData[0]?.collegeBranchCode
      : branchData?.collegeBranchCode;
    const educationType = Array.isArray(educationData)
      ? educationData[0]?.collegeEducationType
      : educationData?.collegeEducationType;

    const profile: StudentProfile = {
      studentId: studentData.studentId,
      department: branchCode || "N/A",
      degree: educationType || "N/A",
      year: currentYearStr,
      semester: currentSemStr,
      collegeBranchId: studentData.collegeBranchId,
      collegeEducationId: studentData.collegeEducationId,
      collegeId: studentData.collegeId,
    };

    if (!currentYearId || !currentSemesterId) {
      return { profile, subjects: [] };
    }

    // ---------------------------------------------------------
    // STEP 2: Fetch Subjects
    // ---------------------------------------------------------
    const { data: subjectData, error: subjectError } = await supabase
      .from("college_subjects")
      .select(
        `
        *,
        college_semester ( collegeSemester ),
        college_academic_year ( collegeAcademicYear ),
        college_subject_units (
          *,
          college_subject_unit_topics ( * )  
        )
      `,
      )
      .eq("collegeBranchId", profile.collegeBranchId)
      .eq("collegeEducationId", profile.collegeEducationId)
      .eq("collegeAcademicYearId", currentYearId)
      .eq("collegeSemesterId", currentSemesterId)
      .eq("isActive", true);

    if (subjectError) {
      console.error("Subject Fetch Error:", subjectError);
      return { profile, subjects: [] };
    }

    // ---------------------------------------------------------
    // STEP 3: Manual Faculty Fetch
    // ---------------------------------------------------------
    const facultyIds = new Set<number>();
    subjectData.forEach((sub: any) => {
      if (sub.college_subject_units) {
        sub.college_subject_units.forEach((unit: any) => {
          if (unit.createdBy) facultyIds.add(unit.createdBy);
        });
      }
    });

    const facultyMap: Record<number, { fullName: string; gender: string }> = {};

    if (facultyIds.size > 0) {
      const { data: facultyData } = await supabase
        .from("faculty")
        .select("facultyId, fullName, gender")
        .in("facultyId", Array.from(facultyIds));

      if (facultyData) {
        facultyData.forEach((f: any) => {
          facultyMap[f.facultyId] = { fullName: f.fullName, gender: f.gender };
        });
      }
    }

    const mappedSubjects: CardProps[] = (subjectData || []).map(
      (subject: any) => {
        const units = subject.college_subject_units || [];

        units.sort(
          (a: any, b: any) => (a.unitNumber || 0) - (b.unitNumber || 0),
        );

        const totalUnits = units.length;

        let subjectTotalTopics = 0;
        let subjectCompletedTopics = 0;

        let nextLessonName: string | null = null;
        let hasFoundNext = false;
        let hasAnyTopics = false;

        const avgPercentage =
          totalUnits > 0
            ? Math.round(
                units.reduce(
                  (acc: number, curr: any) =>
                    acc + (curr.completionPercentage || 0),
                  0,
                ) / totalUnits,
              )
            : 0;

        // -- Date Logic --
        const formatDate = (date: Date) => {
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          const yyyy = date.getFullYear();
          return `${mm}-${dd}-${yyyy}`;
        };

        const startDates = units
          .map((u: any) => new Date(u.startDate).getTime())
          .filter((d: number) => !isNaN(d));

        const endDates = units
          .map((u: any) => new Date(u.endDate).getTime())
          .filter((d: number) => !isNaN(d));

        const fromDate = startDates.length
          ? formatDate(new Date(Math.min(...startDates)))
          : "TBD";

        const toDate = endDates.length
          ? formatDate(new Date(Math.max(...endDates)))
          : "TBD";

        const unitsData = units.map((u: any) => {
          const rawTopics = u.college_subject_unit_topics || [];

          const activeTopics = rawTopics.filter(
            (t: any) => t.isActive !== false,
          );

          activeTopics.sort(
            (a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0),
          );

          if (activeTopics.length > 0) hasAnyTopics = true;

          const formattedTopics = activeTopics.map((t: any) => {
            subjectTotalTopics++;
            if (t.isCompleted) {
              subjectCompletedTopics++;
            } else if (!hasFoundNext) {
              nextLessonName = t.topicTitle;
              hasFoundNext = true;
            }

            return {
              topicId: t.collegeSubjectUnitTopicId,
              name: t.topicTitle,
              isCompleted: !!t.isCompleted,
              displayOrder: t.displayOrder || 0,
            };
          });

          return {
            id: u.collegeSubjectUnitId,
            unitLabel: `Unit - ${u.unitNumber}`,
            title: u.unitTitle,
            color:
              u.unitNumber % 3 === 0
                ? "blue"
                : u.unitNumber % 2 === 0
                  ? "orange"
                  : "purple",
            dateRange: `${fromDate} - ${toDate}`,
            percentage: u.completionPercentage,
            topics: formattedTopics,
          };
        });

        const finalNextLesson = hasFoundNext
          ? nextLessonName!
          : hasAnyTopics
            ? "Completed"
            : "No Classes";

        const firstUnit = units[0];
        const lecturerInfo = firstUnit ? facultyMap[firstUnit.createdBy] : null;
        const lecturerName = lecturerInfo?.fullName || "Not Assigned";
        const profileIcon =
          lecturerInfo?.gender === "Female" ? "/lec-1.png" : "/lec-2.png";

        return {
          profileIcon,
          subjectTitle: subject.subjectName,
          subjectCredits: subject.credits,
          lecturer: lecturerName,
          units: totalUnits,
          topicsCovered: subjectCompletedTopics,
          topicsTotal: subjectTotalTopics,
          nextLesson: finalNextLesson,
          fromDate,
          toDate,
          percentage: avgPercentage,
          semester: subject.college_semester?.collegeSemester,
          academicYear: subject.college_academic_year?.collegeAcademicYear,
          unitsData,
        };
      },
    );

    return { profile, subjects: mappedSubjects };
  } catch (error) {
    console.error("Error in fetchStudentAcademicData:", error);
    return null;
  }
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const { userId, loading: userLoading } = useUser();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null,
  );
  const [subjects, setSubjects] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);

    const data = await fetchStudentAcademicData(userId);

    if (data) {
      setStudentProfile(data.profile);
      setSubjects(data.subjects);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userLoading && userId) {
      loadData();
    } else if (!userLoading && !userId) {
      setLoading(false);
    }
  }, [userId, userLoading]);

  return (
    <StudentContext.Provider
      value={{ studentProfile, subjects, loading, refreshData: loadData }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
};
