"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { CardsSkeleton } from "./shimmer/cardsSkeleton";

import { useRouter, useSearchParams } from "next/navigation";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import {
  CaretLeft,
  ChartLineDown,
  Check,
  Prohibit,
  UserCircle,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import CardComponent, { CardProps } from "./components/stuAttendanceCard";
import StuAttendanceTable from "./components/stuAttendanceTable";
import {
  getClassDetails,
  UpcomingLesson,
} from "@/lib/helpers/faculty/attendance/getClasses";
import toast, { Toaster } from "react-hot-toast";
import {
  getStudentsForClass,
  saveAttendance,
  UIStudent,
  ClassOption,
  SectionOption,
  getFacultyClasses,
  getClassSections,
} from "@/lib/helpers/faculty/attendance/attendanceActions";
import AttendanceSkeleton from "./shimmer/attendanceSkeleton";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { Loader } from "../../(student)/calendar/right/timetable";
import { useAttendanceRealtime, recalculateAttendancePercentage } from "@/lib/helpers/faculty/attendance/liveAttendanceAPI";

function AttendanceContent() {
  const searchParams = useSearchParams();
  const urlClassId = searchParams.get("classId");
  const router = useRouter();
  const { facultyId, loading: contextLoading } = useFaculty();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const urlDate = searchParams.get("date");
  const urlType = searchParams.get("type") as "Single" | "Bulk" | null;
  const urlCId = searchParams.get("cId");
  const urlSId = searchParams.get("sId");
  const urlSort = searchParams.get("sort");

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(urlDate ? new Date(urlDate) : new Date());
  const [selectedCalendarType, setSelectedCalendarType] = useState<"Single" | "Bulk">(urlType || "Single");
  const [selectedClassId, setSelectedClassId] = useState<string>(urlCId || "");
  const [selectedSectionId, setSelectedSectionId] = useState<string>(urlSId || "");
  
  // Update state when URL changes (for Back button navigation)
  useEffect(() => {
    if (urlDate) setSelectedCalendarDate(new Date(urlDate));
    if (urlType) setSelectedCalendarType(urlType);
    if (urlCId !== null) setSelectedClassId(urlCId);
    if (urlSId !== null) setSelectedSectionId(urlSId);
  }, [urlDate, urlType, urlCId, urlSId]);

  const [draftEdits, setDraftEdits] = useState<Record<string, { attendance: string, reason: string }>>({});
  
  const [isEditing, setIsEditing] = useState(false);
  const [isCancellingMode, setIsCancellingMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [saving, setSaving] = useState(false);

  const activeClassId = urlClassId || selectedClassId;
  const isTopicMode = !!urlClassId;

  const isBulk = activeClassId ? activeClassId.startsWith("bulk-") : false;
  const eventId = activeClassId ? parseInt(isBulk ? activeClassId.split("-")[1] : activeClassId.split("-")[0]) : null;

  const today = new Date();
  const isCurrentDate = 
    selectedCalendarDate.getDate() === today.getDate() &&
    selectedCalendarDate.getMonth() === today.getMonth() &&
    selectedCalendarDate.getFullYear() === today.getFullYear();

  // Query for classes
  const dateStr = `${selectedCalendarDate.getFullYear()}-${String(selectedCalendarDate.getMonth() + 1).padStart(2, "0")}-${String(selectedCalendarDate.getDate()).padStart(2, "0")}`;
  
  const { data: classOptionsRaw = [], isLoading: classesLoading, isFetching: classesFetching } = useQuery({
    queryKey: ["facultyClasses", facultyId, dateStr],
    queryFn: () => getFacultyClasses(facultyId!, dateStr),
    enabled: !!facultyId && !urlClassId,
    placeholderData: keepPreviousData,
  });

  const classOptions = classOptionsRaw.filter(c => selectedCalendarType === "Bulk" ? c.id.startsWith("bulk-") : !c.id.startsWith("bulk-"));

  // Query for sections
  const { data: sectionOptions = [], isLoading: sectionsLoading, isFetching: sectionsFetching } = useQuery({
    queryKey: ["classSections", activeClassId],
    queryFn: () => getClassSections(activeClassId),
    enabled: !!activeClassId && !urlClassId,
    placeholderData: keepPreviousData,
  });

  // Query for class details
  const { data: classData, isFetching: classDataFetching } = useQuery({
    queryKey: ["classDetails", activeClassId],
    queryFn: () => getClassDetails(activeClassId),
    enabled: !!activeClassId,
    placeholderData: keepPreviousData,
  });

  // Query for students list (server handles sorting and pagination)
  const sortFilter = urlSort || "All";
  const { data: allStudentsRaw = { data: [], total: 0 }, isLoading: studentsLoading, isFetching: studentsFetching } = useQuery({
    queryKey: ["studentsForClass", activeClassId, selectedSectionId, sortFilter, page, itemsPerPage],
    queryFn: () => getStudentsForClass(activeClassId, selectedSectionId, sortFilter, page, itemsPerPage),
    enabled: !!activeClassId && (!!selectedSectionId || sectionOptions.length === 0 || !!urlClassId),
    placeholderData: keepPreviousData,
  });

  // Server-side pagination mapping
  const totalItems = allStudentsRaw.total;
  const paginatedStudents = allStudentsRaw.data;

  // Handle auto-selecting class and section
  useEffect(() => {
    if (urlClassId) {
      setSelectedClassId(urlClassId);
      setIsEditing(true);
      return;
    }
    


    if (classOptions.length > 0 && !classOptions.some(c => c.id === selectedClassId)) {
      setSelectedClassId(classOptions[0].id);
      setPage(1);
      setDraftEdits({});
    } else if (classOptions.length === 0) {
      setSelectedClassId("");
    }
  }, [classOptions, classOptionsRaw, selectedClassId, urlClassId, selectedCalendarType]);

  useEffect(() => {
    if (urlClassId) return;
    if (sectionOptions.length > 0 && !sectionOptions.some(s => s.id === selectedSectionId)) {
      setSelectedSectionId(sectionOptions[0].id);
      setPage(1);
      setDraftEdits({});
    }
  }, [sectionOptions, selectedSectionId, urlClassId]);

  // Handle Realtime Updates
  useAttendanceRealtime(
    eventId,
    isBulk,
    (payload) => {
      const newRecord = payload.new;
      if (newRecord && newRecord.studentId) {
        let matchedStudentName = "";
        let status = "Not Marked";

        setDraftEdits((prev) => {
          const newDrafts = { ...prev };
          const sId = String(newRecord.studentId);
          
          const upperStatus = newRecord.status?.toUpperCase();
          if (upperStatus === "PRESENT") status = "Present";
          else if (upperStatus === "LATE") status = "Late";
          else if (upperStatus === "ABSENT") status = "Absent";

          if (!prev[sId] || prev[sId].attendance !== status) {
            newDrafts[sId] = { ...prev[sId], attendance: status, reason: newRecord.reason || "" };
            // Optional: Find name for toast
            const student = allStudentsRaw?.data?.find((s: any) => s.id === sId);
            if (student) matchedStudentName = student.name;
          }
          return newDrafts;
        });

        if (matchedStudentName) {
          setTimeout(() => {
            toast.success(`${matchedStudentName} was marked ${status}!`, { id: `bio-${newRecord.studentId}` });
          }, 0);
        }
      }
    }
  );

  // Derived students list merging query data with drafts (using paginated slice)
  const studentsList = !activeClassId ? [] : paginatedStudents.map((s) => {
    const draft = draftEdits[s.id];
    return draft ? { ...s, attendance: draft.attendance as any, reason: draft.reason } : s;
  });

  const handleSetStudents = (updater: UIStudent[] | ((prev: UIStudent[]) => UIStudent[])) => {
    setDraftEdits((prevDrafts) => {
      const currentList = studentsList;
      const nextList = typeof updater === "function" ? updater(currentList) : updater;
      
      const newDrafts = { ...prevDrafts };
      nextList.forEach((s) => {
        newDrafts[s.id] = { attendance: s.attendance, reason: s.reason };
      });
      return newDrafts;
    });
  };

  const confirmClassCancel = () => {
    if (!cancelReason.trim()) {
      toast.error("Enter a reason");
      return;
    }
    handleSetStudents((prev) => 
      prev.map((s) => ({
        ...s,
        attendance: "Class Cancel" as any,
        reason: cancelReason,
      }))
    );
    setIsCancellingMode(false);
    toast("Marked as Cancelled. Click Save.", { icon: "⚠️" });
  };

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (
    type: "class" | "section" | "calendarType" | "sort",
    value: string,
  ) => {
    if (type === "calendarType") {
      setSelectedCalendarType(value as "Single" | "Bulk");
      setSelectedClassId("");
      setSelectedSectionId("");
      updateUrlParams({ type: value, cId: "", sId: "" });
    } else if (type === "class") {
      setSelectedClassId(value);
      setSelectedSectionId("");
      updateUrlParams({ cId: value, sId: "" });
    } else if (type === "section") {
      setSelectedSectionId(value);
      updateUrlParams({ sId: value });
    } else if (type === "sort") {
      setPage(1);
      updateUrlParams({ sort: value });
      return;
    }
    setPage(1);
    setDraftEdits({});
    setIsEditing(false);
  };

  const handleSaveAttendance = async () => {
    if (!activeClassId) return;
    
    // Validate current page unmarked students
    const unmarked = studentsList.filter((s) => s.attendance === "Not Marked");
    if (unmarked.length > 0) {
      toast.error(`Mark ${unmarked.length} students on this page first.`);
      return;
    }
    
    setSaving(true);
    try {
      // We only need to save the edited students, or we can save all students from the current page.
      // Saving all known drafts ensures everything is synced.
      const payload = Object.entries(draftEdits).map(([id, draft]) => ({
        studentId: id,
        facultyId: facultyId!,
        status: draft.attendance,
        reason: draft.reason,
      }));

      // If user hasn't made any edits, just return
      if (payload.length === 0) {
        toast.success("No changes to save!");
        setIsEditing(false);
        return;
      }

      const result = await saveAttendance(activeClassId, payload);
      if (!result.success) throw new Error(result.error);
      
      queryClient.invalidateQueries({ queryKey: ["studentsForClass"] });
      
      toast.success("Saved!");
      setIsEditing(false);
      setDraftEdits({}); // Clear drafts after saving

      if (urlClassId) setTimeout(() => router.push("/faculty"), 2000);
    } catch (error: any) {
      let errorMsg = "An unexpected error occurred while saving attendance.";
      if (error.message) {
        if (error.message.includes("unique constraint") || error.message.includes("duplicate key")) {
          errorMsg = "Attendance for this class has already been recorded and cannot be duplicated.";
        } else {
          errorMsg = error.message;
        }
      }
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.push("/faculty");

  const topicName = classData?.description || "Select a Class";

  const classTime = activeClassId && classData && classData.fromTime && classData.toTime
    ? `${classData.fromTime} - ${classData.toTime}`
    : "-- : --";
    
  const attendanceStats = studentsList.reduce(
    (acc, s) => {
      if (s.attendance === "Present") acc.present++;
      if (s.attendance === "Absent") acc.absent++;
      if (s.attendance === "Leave") acc.leave++;
      return acc;
    },
    { present: 0, absent: 0, leave: 0 },
  );

  const baseCardData: CardProps[] = [
    {
      value: String(studentsList.length),
      label: "Total Students",
      bgColor: "bg-[#FFEDDA]",
      icon: <UsersThree />,
      iconBgColor: "bg-[#FFBB70]",
      iconColor: "text-white",
    },
    {
      value: String(attendanceStats.present),
      label: "Total Students Present",
      bgColor: "bg-[#E6FBEA]",
      icon: <UsersThree />,
      iconBgColor: "bg-[#43C17A]",
      iconColor: "text-white",
    },
    {
      value: String(attendanceStats.absent),
      label: "Total Students Absent",
      bgColor: "bg-[#FFE0E0]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FF2020]",
      iconColor: "text-white",
    },
    {
      value: String(attendanceStats.leave),
      label: "Total Students on Leave",
      bgColor: "bg-[#CEE6FF]",
      icon: <ChartLineDown />,
      iconBgColor: "bg-[#60AEFF]",
      iconColor: "text-white",
    },
  ];

  // Initial Full Page Shimmer
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isInitialLoad = contextLoading || !mounted;
  
  if (isInitialLoad) {
    return <AttendanceSkeleton />;
  }

  return (
    <main className="px-3 md:px-4 py-4 min-h-screen w-full overflow-x-hidden">
      <Toaster position="top-right" />

      <section className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div className="flex w-full md:w-fit justify-between min-w-0">
          <div className="flex w-full min-w-0">
            {urlClassId && (
              <CaretLeft
                size={20}
                weight="bold"
                onClick={handleCancel}
                className="text-[#2D3748] cursor-pointer mt-1.5 hover:-translate-x-1 transition-transform mr-1 shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate w-full">
                  Attendance
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#282828] mt-1 truncate w-full">
                Track, verify, and manage attendance.
              </p>
            </div>
          </div>
        </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <div className="bg-[#1E2952] text-white px-4 py-3 sm:py-4 rounded-lg shadow-sm text-sm font-medium whitespace-nowrap flex items-center min-h-[48px] sm:min-h-[54px]">
              {!activeClassId && (classesLoading || classesFetching) ? (
                <div className="h-4 w-32 bg-white/20 animate-pulse rounded"></div>
              ) : !activeClassId ? (
                <span>No Classes Found</span>
              ) : (
                <>
                  Class Time : 
                  {classDataFetching ? (
                    <div className="ml-2 h-4 w-28 bg-white/20 animate-pulse rounded"></div>
                  ) : (
                    <span className="text-gray-200 ml-1">{classTime}</span>
                  )}
                </>
              )}
            </div>
            <CourseScheduleCard
              style="w-full sm:w-[320px] max-md:hidden shrink-0"
              department={`${activeClassId ? classData?.department?.map((item: any) => item.name).join(", ") || "" : ""}`}
              year={String(activeClassId ? classData?.year || "" : "")}
              degree={activeClassId ? classData?.degree || "" : ""}
              isLoading={classesLoading || classesFetching || classDataFetching}
            />
          </div>
      </section>

      <section className="flex flex-col lg:flex-row items-stretch gap-4 w-full max-md:mb-[-15px]">
        {(classesFetching || studentsFetching) && !studentsLoading && !classesLoading ? (
          <div className="lg:flex-[2.5] w-full min-w-0">
            <CardsSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:flex-[2.5] gap-3 sm:gap-4 w-full min-w-0">
            {baseCardData.map((item, index) => (
              <div key={index} className="flex-1 min-w-0">
                <CardComponent {...item} />
              </div>
            ))}
          </div>
        )}
        <div className="hidden lg:block lg:flex-[1] shrink-0 min-w-0">
          <WorkWeekCalendar
            activeDate={selectedCalendarDate}
            onDateSelect={(date) => {
              setSelectedCalendarDate(date);
              setPage(1);
              setDraftEdits({});
              
              const localDate = new Date(date);
              localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
              updateUrlParams({ date: localDate.toISOString().split("T")[0], cId: "", sId: "" });
            }}
            style="h-full bg-white rounded-xl shadow-sm"
          />
        </div>
      </section>

      <section className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-4 min-h-[50px] gap-3 w-full min-w-0">
        {urlClassId ? (
          <div className="text-base sm:text-lg font-bold text-gray-800 truncate min-w-0 flex-1 pr-2">
            <span className="text-[#43C17A]">Topic : </span>
            <span className="truncate">{topicName}</span>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        {isEditing &&
          (urlClassId || selectedClassId) &&
          (!isCancellingMode ? (
            <button
              onClick={() => {
                setCancelReason("");
                setIsCancellingMode(true);
              }}
              className="flex items-center justify-center gap-2 bg-[#FFBB70] text-white cursor-pointer hover:bg-[#FFBB70]/90 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-red-100 transition-colors w-full sm:w-max shrink-0"
            >
              <Prohibit size={16} weight="bold" />
              Mark Class Cancel
            </button>
          ) : (
            <div className="flex text-black items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300 w-full sm:w-auto overflow-x-auto pb-1 shrink-0">
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason..."
                className="border border-gray-300 rounded-lg px-3 py-1.5 sm:py-2 text-sm w-40 sm:w-64 focus:outline-none focus:border-red-400 flex-shrink-0"
                autoFocus
              />
              <button
                onClick={confirmClassCancel}
                className="bg-green-500 text-white cursor-pointer p-1.5 sm:p-2 rounded-lg flex-shrink-0"
              >
                <Check size={18} weight="bold" />
              </button>
              <button
                onClick={() => setIsCancellingMode(false)}
                className="bg-gray-200 text-gray-600 p-1.5 sm:p-2 cursor-pointer rounded-lg flex-shrink-0"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
          ))}
      </section>

      <section className="w-full min-w-0">
        {classesLoading || urlClassId || classOptionsRaw.length > 0 || sectionOptions.length > 0 ? (
          <StuAttendanceTable
            loadingData={classesLoading || classesFetching || sectionsFetching || studentsFetching}
            students={studentsList}
            setStudents={handleSetStudents}
            handleSaveAttendance={handleSaveAttendance}
            saving={saving}
            isTopicMode={isTopicMode}
            classes={classOptions}
            sections={sectionOptions}
            selectedClass={selectedClassId}
            selectedSection={selectedSectionId}
            onFilterChange={urlClassId ? undefined : handleFilterChange}
            loadingFilters={studentsFetching || sectionsLoading}
            isEditing={isEditing}
            onEditClick={() => setIsEditing(true)}
            isCurrentDate={isCurrentDate}
            sortStatus={urlSort || "All"}
            onSortChange={(val) => handleFilterChange("sort", val)}
            calendarType={selectedCalendarType}
            page={page}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        ) : (
          <div className="flex justify-center items-center py-16 text-gray-500 font-medium">
            No scheduled or accepted classes found for this date.
          </div>
        )}
      </section>
    </main>
  );
}
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          <Loader />
        </div>
      }
    >
      <AttendanceContent />
    </Suspense>
  );
}
