"use client";

import {
  ArrowLeft,
  CalendarBlank,
  CaretRight,
  CheckCircleIcon,
  FilePdf,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { CardProps } from "./subjectCards";
import LessonCard from "./lessonCard";
import { getUnitsWithTopics } from "@/lib/helpers/faculty/getUnitsWithTopics";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { getStudentCountForAcademics } from "@/lib/helpers/profile/getStudentCountForAcademics";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

type FilterBannerProps = {
  filterBannerDetails: CardProps;
};
function FilterBanner({ filterBannerDetails }: FilterBannerProps) {
  const { subjectTitle, semester, year } = filterBannerDetails;

  return (
    <div className="mb-4 flex flex-col gap-4">
      <div className="flex flex-wrap gap-8">

        {/* SUBJECT */}
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Subject :</p>
          <p className="px-4 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            {subjectTitle}
          </p>
        </div>

        {/* SEMESTER */}
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Semester :</p>
          <p className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            {semester}
          </p>
        </div>

        {/* YEAR */}
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Year :</p>
          <p className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            {year}
          </p>
        </div>

      </div>
    </div>
  );

  // function FilterBanner(filterBannerDetails: FilterBannerProps) {
  //   return (
  //     <div className="bg-blue-00 mb-4 flex flex-col gap-4">
  //       <div className="w-full flex flex-wrap gap-8">
  //         <div className="flex items-center gap-2">
  //           <p className="text-[#525252] text-sm">Subject :</p>
  //           <p className="px-4 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
  //             {filterBannerDetails.filterBannerDetails.subjectTitle}
  //           </p>
  //         </div>

  //         <div className="flex items-center gap-2">
  //           <p className="text-[#525252] text-sm">Semester :</p>

  //           <p className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium appearance-none  focus:outline-none">
  //             II
  //           </p>
  //         </div>

  //         <div className="flex items-center gap-2">
  //           <p className="text-[#525252] text-sm">Year :</p>

  //           <div className="flex items-center justify-center px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
  //             <p>2nd Year</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
}

type SubjectDetailsCardProps = {
  details: CardProps;
  onBack: () => void;
};


export type TopicItem = {
  title: string;
  date: string;
  isCompleted: boolean;
};

export type LessonData = {
  lessonNumber: number;
  lessonTitle: string;
  topics: TopicItem[];
};

export type UiTopic = {
  id: number;
  title: string;
  isCompleted: boolean;
};


export type UnitTopic = {
  id: number;
  title: string;
  isCompleted: boolean;
};

export type Unit = {
  id: number; // collegeSubjectUnitId
  unitNumber: number;
  unitLabel: string;
  title: string;
  startDate?: string;
  endDate?: string;
  dateRange: string;
  percentage: number; // completionPercentage
  topics: UnitTopic[];
  lessons: LessonData[];
  color: "purple" | "orange" | "blue";
};



// export type Unit = {
//   id: number;
//   unitLabel: string;
//   title: string;
//   color: "purple" | "orange" | "blue";
//   dateRange: string;
//   percentage: number;
//   topics: UnitTopic[];
//   lessons: LessonData[];
// };

export async function getFacultySubjects(params: {
  collegeId: number;
  facultyId: number;
}) {
  console.log("🟡 getFacultySubjects called with:", params);


  const { collegeId } = params;

  /* ----------------------------
   * 1️⃣ Fetch Subjects
   * ---------------------------- */
  const { data: subjects, error: subjectErr } = await supabase
    .from("college_subjects")
    .select(`
    collegeSubjectId,
    subjectName,

    collegeEducationId,
    collegeBranchId,
    collegeAcademicYearId,
    collegeSemesterId,

    collegeId
  `)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (subjectErr) {
    console.error("❌ Subjects fetch failed:", subjectErr);
    throw subjectErr;
  }

  console.log(
    "📚 SUBJECTS FROM DB:",
    (subjects ?? []).map(s => ({
      id: s.collegeSubjectId,
      name: s.subjectName,
      edu: s.collegeEducationId,
      branch: s.collegeBranchId,
      year: s.collegeAcademicYearId,
      sem: s.collegeSemesterId,
    }))
  );

  const { data: units, error: unitErr } = await supabase
    .from("college_subject_units")

    .select(`
  collegeSubjectUnitId,
  collegeSubjectId,
  unitNumber,
  unitTitle,
  completionPercentage,
    startDate,
    endDate
`)

    .eq("collegeId", collegeId)
    .eq("isActive", true);

  if (unitErr) {
    console.error("❌ Units fetch failed:", unitErr);
    throw unitErr;
  }

  console.log("🧩 Units fetched:", units);

  const { data: topics, error: topicErr } = await supabase
    .from("college_subject_unit_topics")
    .select(`
  collegeSubjectUnitId,
  topicTitle,
  isCompleted,
  displayOrder,
  collegeSubjectId
`)

    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .order("displayOrder", { ascending: true });

  if (topicErr) {
    console.error("❌ Topics fetch failed:", topicErr);
    throw topicErr;
  }


  const topicsBySubject = new Map<number, typeof topics>();

  for (const t of topics ?? []) {
    const arr = topicsBySubject.get(t.collegeSubjectId) ?? [];
    arr.push(t);
    topicsBySubject.set(t.collegeSubjectId, arr);
  }


  /* ----------------------------
   * 3️⃣ Aggregate per Subject
   * ---------------------------- */
  const result: CardProps[] = await Promise.all(
    subjects.map(async (s) => {
      const subjectUnits = units.filter(
        (u) => u.collegeSubjectId === s.collegeSubjectId
      );

      const unitsCount = subjectUnits.length;
      const subjectTopics = topicsBySubject.get(s.collegeSubjectId) ?? [];

      const topicsCovered =
        subjectTopics.filter(t => t.isCompleted === true).length;


      let nextLesson = "-";

      // 1️⃣ Sort units in order (Unit-1 → Unit-2 → Unit-3)
      const sortedUnits = [...subjectUnits].sort(
        (a, b) => a.unitNumber - b.unitNumber
      );

      // 2️⃣ Loop units sequentially
      for (const unit of sortedUnits) {
        const unitTopics = subjectTopics
          .filter(t => t.collegeSubjectUnitId === unit.collegeSubjectUnitId)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        // 3️⃣ First incomplete topic in that unit
        const firstIncompleteTopic = unitTopics.find(
          t => t.isCompleted === false
        );

        if (firstIncompleteTopic) {
          nextLesson = firstIncompleteTopic.topicTitle;
          break; // 🔥 THIS enables Unit-2 auto-activation
        }
      }

      // Optional fallback
      if (nextLesson === "-") {
        nextLesson = "Completed";
      }

      // 📅 Calculate Subject Start & End Date from Units
      const subjectUnitDates = subjectUnits
        .filter(u => u.startDate && u.endDate);

      const fromDate =
        subjectUnitDates.length > 0
          ? new Date(
            Math.min(
              ...subjectUnitDates.map(u => new Date(u.startDate).getTime())
            )
          ).toLocaleDateString("en-GB")
          : "-";

      const toDate =
        subjectUnitDates.length > 0
          ? new Date(
            Math.max(
              ...subjectUnitDates.map(u => new Date(u.endDate).getTime())
            )
          ).toLocaleDateString("en-GB")
          : "-";


      // // 1️⃣ Sort units by unitNumber
      // const sortedUnits = [...subjectUnits].sort(
      //   (a, b) => a.unitNumber - b.unitNumber
      // );

      // // 2️⃣ Find first unit that is NOT completed
      // const firstIncompleteUnit = sortedUnits.find(
      //   (u) => (u.completionPercentage ?? 0) < 100
      // );

      // // 3️⃣ Find next lesson from THAT unit only
      // const nextLesson = firstIncompleteUnit
      //   ? subjectTopics
      //     .filter(
      //       (t) =>
      //         t.collegeSubjectUnitId ===
      //         firstIncompleteUnit.collegeSubjectUnitId &&
      //         t.isCompleted === false
      //     )
      //     .sort((a, b) => a.displayOrder - b.displayOrder)[0]?.topicTitle ?? "-"
      //   : "Completed";


      const subjectPercentage =
        subjectUnits.length === 0
          ? 0
          : Math.round(
            subjectUnits.reduce(
              (sum, u) => sum + (u.completionPercentage ?? 0),
              0
            ) / subjectUnits.length
          );

      console.log("➡️ Fetching student count for subject:", {
        collegeId,
        collegeAcademicYearId: s.collegeAcademicYearId,
        collegeSemesterId: s.collegeSemesterId,
        collegeSubjectId: s.collegeSubjectId,
      });


      const students = await getStudentCountForAcademics({
        collegeId: collegeId,
        collegeAcademicYearId: s.collegeAcademicYearId,
        collegeSemesterId: s.collegeSemesterId,
      });



      console.log("⬅️ Student count received:", students);

      return {
        collegeId,

        collegeEducationId: s.collegeEducationId,
        collegeBranchId: s.collegeBranchId,
        collegeAcademicYearId: s.collegeAcademicYearId,
        collegeSemesterId: s.collegeSemesterId,

        collegeSubjectId: s.collegeSubjectId,
        subjectTitle: s.subjectName,
        semester: `Sem ${s.collegeSemesterId}`,
        year: `Year ${s.collegeAcademicYearId}`,


        units: unitsCount,
        topicsCovered,
        topicsTotal: subjectTopics.length,
        nextLesson,
        students,
        percentage: subjectPercentage,
        fromDate,
        toDate,
      };
    })
  );

  // const result: CardProps[] = subjects.map((s) => {
  //   const subjectUnits = units.filter(
  //     (u) => u.collegeSubjectId === s.collegeSubjectId
  //   );

  //   const unitsCount = subjectUnits.length;

  //   const subjectTopics = topicsBySubject.get(s.collegeSubjectId) ?? [];

  //   const topicsCovered =
  //     subjectTopics.filter(t => t.isCompleted === true).length;

  //   // ✅ SAFE: do not mutate subjectUnits
  //   const firstIncompleteUnit = [...subjectUnits]
  //     .sort((a, b) => a.unitNumber - b.unitNumber)
  //     .find(u => (u.completionPercentage ?? 0) < 100);

  //   const nextLesson = firstIncompleteUnit
  //     ? subjectTopics
  //       .filter(
  //         t =>
  //           t.collegeSubjectUnitId ===
  //           firstIncompleteUnit.collegeSubjectUnitId &&
  //           t.isCompleted === false
  //       )
  //       .sort((a, b) => a.displayOrder - b.displayOrder)[0]?.topicTitle ?? "-"
  //     : "-";

  //   return {
  //     collegeId,
  //     collegeSubjectId: s.collegeSubjectId,
  //     subjectTitle: s.subjectName,
  //     semester: `Sem ${s.collegeSemesterId}`,
  //     year: `Year ${s.collegeAcademicYearId}`,
  //     units: unitsCount,
  //     topicsCovered,
  //     topicsTotal: subjectTopics.length,
  //     nextLesson,
  //     students: 0,
  //     fromDate: "",
  //     toDate: "",
  //   };
  // });


  console.log("✅ Final My Classes cards:", result);

  return result;
}


const colorMap = {
  purple: {
    cardBg: "bg-[#E9E3FFF5]",
    dot: "bg-[#A66BFF]",
    title: "text-[#3B2A91]",
    accent: "text-[#7E5DFF]",
    fadeStart: "rgba(126,93,255,0.25)",
    solidEnd: "#7E5DFF",
  },
  orange: {
    cardBg: "bg-[#FFEDDA]",
    dot: "bg-[#FFAE4C]",
    title: "text-[#A35300]",
    accent: "text-[#FF8A2A]",
    fadeStart: "rgba(255,138,42,0.25)",
    solidEnd: "#FF8A2A",
  },
  blue: {
    cardBg: "bg-[#CEE6FF]",
    dot: "bg-[#68A4FF]",
    title: "text-[#22518F]",
    accent: "text-[#4C8DFF]",
    fadeStart: "rgba(76,141,255,0.25)",
    solidEnd: "#4C8DFF",
  },
} as const;

type UnitCardProps = {
  unit: Unit;
  onMarkComplete: (
    unitId: number,
    topics: UnitTopic[],
    percentage: number
  ) => void;
  setHasChanges: (value: boolean) => void;
};



function UnitCard({ unit, onMarkComplete, setHasChanges }: UnitCardProps) {
  const colors = colorMap[unit.color];
  const [selectedUnitLessons, setSelectedUnitLessons] = useState<
    LessonData[] | null
  >(null);
  const [isMarkAsLoading, setIsMarkAsLoading] = useState<boolean>(false);

  // const [topics, setTopics] = useState<UnitTopic[]>(unit.topics);
  const [localTopics, setLocalTopics] = useState<UnitTopic[]>(unit.topics);

  useEffect(() => {
    setLocalTopics(unit.topics);
  }, [unit.topics]);

  useEffect(() => {
    console.log("✅ UNIT TOPICS", localTopics);
  }, [localTopics]);



  if (selectedUnitLessons) {
    return (
      <div className="w-full px-8 bg-[#F5F5F7] min-h-screen pt-6">
        {/* <LessonCard
          lesson={selectedUnitLessons}
          onBack={() => setSelectedUnitLessons(null)}
        /> */}
      </div>
    );
  }


  // const toggleTopic = (index: number) => {
  //   setTopics((prev) =>
  //     prev.map((t, i) =>
  //       i === index ? { ...t, isCompleted: !t.isCompleted } : t
  //     )
  //   );
  // };


  const completedCount = localTopics.filter(t => t.isCompleted).length;
  const percentage =
    localTopics.length === 0
      ? 0
      : Math.round((completedCount / localTopics.length) * 100);


  // const completedCount = topics.filter(t => t.isCompleted).length;
  // const totalCount = topics.length;

  // const percentage =
  //   totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);


  return (
    <div className={`rounded-xl px-4 py-3 ${colors.cardBg} w-full`}>
      {/* <div className="flex items-center gap-2 mb-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
        <div
          className={`font-semibold text-md flex w-full justify-between items-center text-[${colors.solidEnd}]`}
        >
          {unit.unitLabel}
          <button onClick={() => setSelectedUnitLessons(unit.lessons)}>
            <CaretRight size={24} color="#282828" />
          </button>
        </div>
      </div> */}

      <div className="bg-white rounded-2xl shadow-md p-4 h-full flex flex-col">
        <h3
          className={`text-base md:text-lg font-semibold mb-3 ${colors.title}`}
        >
          {unit.title}
        </h3>

        <div className="flex items-center justify-between text-xs md:text-sm mb-2">
          <div className="flex items-center gap-2 text-[#6C6C6C]">
            <CalendarBlank size={16} className={colors.accent} />
            <span>{unit.dateRange}</span>
          </div>
          <span className="font-semibold text-[#333333]">{percentage}%</span>
        </div>

        <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(to right, ${colors.fadeStart}, ${colors.solidEnd})`,
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-white rounded-full shadow transition-all duration-700"
            style={{ left: `calc(${percentage}% - 7px)` }}
          />
        </div>

        <ul className="flex-1 space-y-2 text-xs md:text-sm text-[#3F3F3F] overflow-y-auto pr-1">
          {localTopics.map((topic, idx) => (
            <li
              key={topic.id}
              className="flex items-center gap-2"
            >
              <button
                onClick={async () => {
                  try {
                    setIsMarkAsLoading(true);

                    const updatedValue = !topic.isCompleted;

                    // 1️⃣ Update topic immediately
                    const { error: topicError } = await supabase
                      .from("college_subject_unit_topics")
                      .update({
                        isCompleted: updatedValue,
                        updatedAt: new Date().toISOString(),
                      })
                      .eq("collegeSubjectUnitTopicId", topic.id);

                    if (topicError) throw topicError;

                    // 2️⃣ Update local state
                    const updatedTopics = localTopics.map(t =>
                      t.id === topic.id
                        ? { ...t, isCompleted: updatedValue }
                        : t
                    );

                    setLocalTopics(updatedTopics);

                    // 3️⃣ Calculate new percentage
                    const completedCount =
                      updatedTopics.filter(t => t.isCompleted).length;

                    const newPercentage =
                      updatedTopics.length === 0
                        ? 0
                        : Math.round((completedCount / updatedTopics.length) * 100);

                    // 4️⃣ Update unit percentage in DB
                    const { error: unitError } = await supabase
                      .from("college_subject_units")
                      .update({
                        completionPercentage: newPercentage,
                        updatedAt: new Date().toISOString(),
                      })
                      .eq("collegeSubjectUnitId", unit.id);

                    if (unitError) throw unitError;

                    toast.success("Updated");

                  } catch (err: any) {
                    toast.error(err.message || "Update failed");
                  } finally {
                    setIsMarkAsLoading(false);
                  }
                }}
              >
                <CheckCircleIcon
                  size={16}
                  weight="fill"
                  className={
                    topic.isCompleted ? colors.accent : "text-gray-300"
                  }
                />
              </button>

              <span className={topic.isCompleted ? "" : "text-gray-400"}>
                {topic.title}
              </span>
            </li>
          ))}

          {/* {unit.topics.map((topic, idx) => (
            <li key={idx} className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <CheckCircleIcon
                  size={16}
                  className={`${colors.accent} flex-shrink-0 mt-[2px]`}
                  weight="fill"
                />
                <span>{topic}</span>
              </div>
              <div
                className={`${colors.cardBg} rounded-full h-6 w-6 flex items-center justify-center`}
              >
                <FilePdf
                  size={16}
                  className={`${colors.accent} flex-shrink-0 mt-[2px]`}
                  weight="duotone"
                />
              </div>
            </li>
          ))} */}
        </ul>
        {/* ✅ MARK AS COMPLETE */}
        <div className="mt-4 flex justify-end">
          <button
            disabled={isMarkAsLoading}
            className={`border px-4 py-1.5 rounded-lg text-sm transition
    ${isMarkAsLoading
                ? "border-[#43C17A] text-[#43C17A] opacity-50 cursor-not-allowed"
                : "border-[#43C17A] text-[#43C17A] hover:bg-[#43C17A]/10"
              }`}
          >
            {isMarkAsLoading ? "Saving..." : "Save Progress"}
          </button>

          {/* <button
            onClick={() =>
              onMarkComplete(unit.id, topics, percentage)
            }
            // onClick={() => onMarkComplete(unit.id)}
            className="border border-[#43C17A] text-[#43C17A] px-4 py-1.5 rounded-lg text-sm hover:bg-[#43C17A]/10 cursor cursor-pointer"
          >
            Mark As Complete
          </button> */}
        </div>
      </div>
    </div>
  );
}

export function SubjectDetailsCard({
  details,
  onBack,
}: SubjectDetailsCardProps) {

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false);
   const [hasChanges, setHasChanges] = useState(false);
  const [loadingUnitId, setLoadingUnitId] = useState<number | null>(null);

  useEffect(() => {
    if (!details.collegeId || !details.collegeSubjectId) {
      return;
    }

    loadUnits();
  }, [details.collegeId, details.collegeSubjectId]);

  async function loadUnits() {
    try {
      setLoading(true);

      const data = await getUnitsWithTopics({
        collegeId: details.collegeId,
        collegeSubjectId: details.collegeSubjectId, // ✅ FIX
      });

      setUnits(
        data.map((u: any) => ({
          id: u.id, // collegeSubjectUnitId

          unitNumber: Number(
            u.unitLabel.replace("Unit - ", "")
          ),
          unitLabel: u.unitLabel,
          title: u.title,
          dateRange: u.dateRange,
          percentage: u.percentage ?? 0,
          color: u.color,
          lessons: [],

          // ✅ topics are already correct — DO NOT remap
          topics: u.topics,
        }))
      );

    } catch (err) {
      console.error("Failed to load units", err);
      toast.error("Failed to load units")
    } finally {
      setLoading(false);
    }
  }

  const handleMarkComplete = async (
    unitId: number,
    topics: UnitTopic[],
    percentage: number
  ) => {
    try {
      setLoadingUnitId(unitId);
      /* -----------------------------
       * 1️⃣ Save topics
       * ----------------------------- */
      for (const topic of topics) {
        const { error: topicError } = await supabase
          .from("college_subject_unit_topics")
          .update({
            isCompleted: topic.isCompleted,
            updatedAt: new Date().toISOString(),
          })
          .eq("collegeSubjectUnitTopicId", topic.id);

        if (topicError) {
          throw new Error(topicError.message);
        }
      }

      /* -----------------------------
       * 2️⃣ Save unit percentage
       * ----------------------------- */
      const { error: unitError } = await supabase
        .from("college_subject_units")
        .update({
          completionPercentage: percentage,
          updatedAt: new Date().toISOString(),
        })
        .eq("collegeSubjectUnitId", unitId);

      if (unitError) {
        throw new Error(unitError.message);
      }

      /* -----------------------------
       * 3️⃣ Sync UI
       * ----------------------------- */
      setUnits(prev =>
        prev.map(u =>
          u.id === unitId ? { ...u, topics, percentage } : u
        )
      );

      toast.success("Progress saved ✅");
      setHasChanges(false);

    } catch (err: any) {
      console.error("❌ Mark complete failed:", err);
      toast.error(err?.message || "Failed to save progress");
    } finally {
      setLoadingUnitId(null);
    }
  };

  // const handleMarkComplete = async (
  //   unitId: number,
  //   topics: UnitTopic[],
  //   percentage: number
  // ) => {
  //   // 1️⃣ Save percentage
  //   const { error } = await supabase
  //     .from("college_subject_units")
  //     .update({
  //       completionPercentage: percentage,
  //       updatedAt: new Date().toISOString(),
  //     })
  //     .eq("collegeSubjectUnitId", unitId);

  //   if (error) {
  //     toast.error("Failed to save unit progress");
  //     return;
  //   }

  //   // 2️⃣ Sync local state
  //   setUnits(prev =>
  //     prev.map(u =>
  //       u.id === unitId ? { ...u, topics, percentage } : u
  //     )
  //   );

  //   setHasChanges(true);
  //   toast.success("Progress saved ✅");
  // };

  const saveProgress = async () => {
    setIsSaveLoading(true)
    try {
      for (const unit of units) {
        // 1️⃣ Save topics
        for (const topic of unit.topics) {
          await supabase
            .from("college_subject_unit_topics")
            .update({
              isCompleted: topic.isCompleted,
              updatedAt: new Date().toISOString(),
            })
            .eq("collegeSubjectUnitTopicId", topic.id);
        }

        // 2️⃣ Save unit percentage
        await supabase
          .from("college_subject_units")
          .update({
            completionPercentage: unit.percentage,
            updatedAt: new Date().toISOString(),
          })
          .eq("collegeSubjectUnitId", unit.id);
      }

      toast.success("Saved successfully 💾");
      setHasChanges(false);
      onBack();
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaveLoading(false)
    }
  };

  // const saveProgress = async () => {
  //   console.log("💾 Saving all units progress", units);

  //   for (const unit of units) {
  //     await supabase
  //       .from("college_subject_units")
  //       .update({
  //         completionPercentage: unit.percentage,
  //         completedTopics: unit.topics.filter(t => t.isCompleted).length,
  //       })
  //       .eq("collegeSubjectUnitId", unit.id);
  //   }

  //   try {
  //     console.log("✅ All units saved");
  //     toast.success("Saved successfully 💾");

  //     setHasChanges(false);
  //     onBack();
  //   } catch (err) {
  //     toast.error("Failed to save changes");
  //   }

  // };


  return (
    <div className="w-full px-4 bg-[#F5F5F7] min-h-screen">
      <button
        onClick={onBack}
        className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[#7153E1] hover:text-[#5436c8] font-medium transition"
      >
        <ArrowLeft size={18} weight="bold" />
        Go Back
      </button>
      <div className="flex justify-between items-start mb-4">
        <FilterBanner filterBannerDetails={details} />

        {/* ✅ SAVE BUTTON */}
        {/* <button
          onClick={saveProgress}
          disabled={!hasChanges || isSaveLoading}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition
    ${hasChanges
              ? "bg-[#43C17A] text-white hover:bg-[#3aad6c]"
              : "bg-[#43C17A] text-white opacity-50 cursor-not-allowed"
            }`}
        >
          {isSaveLoading ? "Saving.." : "Save"}
        </button> */}


      </div>

      <div className="flex gap-6 overflow-x-auto">
        {loading
          ? <div className="flex justify-center w-full">
            <Loader />
          </div> :
          units.length > 0 ?
            units.map((unit) => (
              <div
                key={`unit-${unit.id}`}
                className="min-w-[300px] shrink-0"
              >
                <UnitCard
                  unit={unit}
                  onMarkComplete={handleMarkComplete}
                  setHasChanges={setHasChanges}
                />

              </div>
            ))
            : <div className="text-black text-center">No units available.</div>
        }
      </div>

    </div>
  );
}