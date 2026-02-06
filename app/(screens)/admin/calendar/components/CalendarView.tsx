"use client"

import { useEffect, useState } from "react"
import CourseScheduleCard from "@/app/utils/CourseScheduleCard"
import CalendarGrid from "./calenderGrid"
import CalendarHeader from "./calendarHeader"
import CalendarToolbar from "./calenderToolbar"
import AddEventModal from "./addEventModal"
import { CalendarEvent } from "../types"
import { combineDateAndTime, getWeekDays, hasTimeConflict } from "../utils"
import ConfirmConflictModal from "./ConfirmConflictModal";
import { CaretLeft } from "@phosphor-icons/react"
import ConfirmDeleteModal from "./ConfirmDeleteModal"
import toast from "react-hot-toast";
// import { updateCalendarEvent, upsertCalendarEventAdmin } from "@/lib/helpers/calendar/calendarEvent";
import { fetchCollegeDegrees } from "@/lib/helpers/admin/academicSetupAPI";
import { fetchCalendarEvents } from "@/lib/helpers/calendar/calendarEventAPI";
import { fetchCalendarEventSections } from "@/lib/helpers/calendar/calendarEventSectionsAPI";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";
import { useUser } from "@/app/utils/context/UserContext"

import {
    saveCalendarEvent,
    deleteCalendarEvent,
} from "@/lib/helpers/calendar/calendarEventAPI";

import {
    deleteCalendarEventSections,
    saveCalendarEventSections,
} from "@/lib/helpers/calendar/calendarEventSectionsAPI";
import EventDetailsModal from "@/app/(screens)/faculty/calendar/modal/EventDetailsModal"

interface Props {
    faculty: {
        name: string
        id: string
        branch: string
        year?: string
    }
    onBack: () => void
}

export default function CalendarView({ faculty, onBack }: Props) {
    const [activeTab, setActiveTab] = useState("All")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [pendingEvent, setPendingEvent] = useState<any | null>(null);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
    const [eventForm, setEventForm] = useState<any | null>(null);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [degreeOptions, setDegreeOptions] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const { collegeId } = useUser()

    const weekDays = getWeekDays(currentDate)

    useEffect(() => {
        loadEvents();
        loadDegrees()
    }, [faculty.id]);

    const loadDegrees = async () => {
        try {
            const data = await fetchCollegeDegrees();
            setDegreeOptions(data);
        } catch {
            toast.error("Failed to load degrees");
        }
    };

    const loadEvents = async () => {
        setIsLoadingEvents(true);

        try {
            const rows = await fetchCalendarEvents({
                facultyId: Number(faculty.id),
            });

            if (!rows || rows.length === 0) {
                setEvents([]);
                return;
            }

            const firstEventSections = await fetchCalendarEventSections(
                rows[0].calendarEventId
            );

            if (!firstEventSections || firstEventSections.length === 0) {
                setEvents([]);
                return;
            }

            const educationId = firstEventSections[0].collegeEducationId;
            const branchId = firstEventSections[0].collegeBranchId;
            const academicYearId = firstEventSections[0].collegeAcademicYearId;

            const branches = await fetchAcademicDropdowns({
                type: "branch",
                collegeId: collegeId!,
                educationId,
            });

            const academicYears = await fetchAcademicDropdowns({
                type: "academicYear",
                collegeId: collegeId!,
                educationId,
                branchId,
            });

            const sections = await fetchAcademicDropdowns({
                type: "section",
                collegeId: collegeId!,
                educationId,
                branchId,
                academicYearId,
            });

            /* 🔹 4. BUILD MAPS */
            const branchMap = new Map<number, string>(
                branches.map((b: any) => [
                    b.collegeBranchId,
                    b.collegeBranchCode,
                ])
            );

            const yearMap = new Map<number, string>(
                academicYears.map((y: any) => [
                    y.collegeAcademicYearId,
                    y.collegeAcademicYear,
                ])
            );

            const sectionMapName = new Map<number, string>(
                sections.map((s: any) => [
                    s.collegeSectionsId,
                    s.collegeSections,
                ])
            );

            const sectionMap = new Map<number, number[]>();

            await Promise.all(
                rows.map(async (row: any) => {
                    const secRows = await fetchCalendarEventSections(row.calendarEventId);
                    sectionMap.set(
                        row.calendarEventId,
                        (secRows ?? []).map((s: any) => s.collegeSectionId)
                    );
                })
            );

            const expanded: CalendarEvent[] = [];

            rows.forEach((row: any) => {
                const startTime = `${row.date}T${row.fromTime}`;
                const endTime = `${row.date}T${row.toTime}`;

                const sectionIds = sectionMap.get(row.calendarEventId) ?? [];

                sectionIds.forEach((sectionId) => {
                    expanded.push({
                        id: `${row.calendarEventId}-${sectionId}`,
                        calendarEventId: row.calendarEventId,

                        subjectName: row.college_subjects?.subjectName ?? "-",
                        subjectKey: row.college_subjects?.subjectKey ?? "",

                        title:
                            row.type === "meeting"
                                ? "Meeting"
                                : row.college_subject_unit_topics?.topicTitle ?? "",

                        type: row.type,

                        day: new Date(row.date)
                            .toLocaleDateString("en-US", { weekday: "short" })
                            .toUpperCase(),

                        startTime,
                        endTime,

                        branch: branchMap.get(branchId) ?? "",
                        year: yearMap.get(academicYearId) ?? "",
                        section: sectionMapName.get(sectionId) ?? "",

                        rawFormData: {
                            //subjectId: row.subjectId,
                            subjectId: row.college_subjects?.collegeSubjectId ?? null,
                            topicId: row.eventTopic,
                            roomNo: row.roomNo,
                        },
                    });
                });
            });

            setEvents(expanded);
        } catch (err) {
            console.error("ADMIN LOAD EVENTS FAILED", err);
            toast.error("Failed to load calendar events");
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const hasDbConflict = async (
        date: string,
        startTime: string,
        endTime: string,
        ignoreEventId?: number
    ): Promise<boolean> => {
        try {
            const rows = await fetchCalendarEvents({
                facultyId: Number(faculty.id),
            });

            if (!rows || rows.length === 0) return false;

            return rows.some((e: any) => {
                if (ignoreEventId && e.calendarEventId === ignoreEventId) {
                    return false;
                }

                if (e.date !== date) return false;

                const dbStart = combineDateAndTime(e.date, e.fromTime);
                const dbEnd = combineDateAndTime(e.date, e.toTime);

                return hasTimeConflict(
                    [{ startTime: dbStart, endTime: dbEnd } as CalendarEvent],
                    combineDateAndTime(date, startTime),
                    combineDateAndTime(date, endTime)
                );
            });
        } catch (err) {
            console.error("ADMIN CONFLICT CHECK FAILED", err);
            return false;
        }
    };

    const handleSaveEvent = async (data: any) => {
        try {
            setIsSaving(true);
            const conflict = await hasDbConflict(
                data.date,
                data.fromTime,
                data.toTime,
                editingEventId ? Number(editingEventId) : undefined
            );

            if (conflict) {
                setPendingEvent(data);
                setShowConflictModal(true);
                setIsModalOpen(false);
                return;
            }

            const eventRes = await saveCalendarEvent({
                calendarEventId: editingEventId
                    ? Number(editingEventId)
                    : undefined,

                facultyId: Number(data.facultyId),

                subjectId: data.type === "meeting" ? null : data.subjectId ?? null,
                eventTopic: data.type === "meeting" ? null : data.eventTopic ?? null,
                type: data.type,

                date: data.date,
                roomNo: data.roomNo,
                fromTime: data.fromTime,
                toTime: data.toTime,

                meetingLink: data.meetingLink ?? null,
            });

            if (!eventRes.success) {
                toast.error("Failed to save event");
                return;
            }

            const calendarEventId = eventRes.calendarEventId;
            if (editingEventId) {
                await deleteCalendarEventSections(Number(editingEventId));
            }

            await saveCalendarEventSections(calendarEventId, {
                collegeEducationId: data.educationId,
                collegeBranchId: data.branchId,
                collegeAcademicYearId: data.academicYearId,
                collegeSemesterId: data.semester,
                sectionIds: data.sections.map(
                    (s: any) => s.collegeSectionId
                ),
            });

            toast.success(
                editingEventId ? "Event updated successfully" : "Event created successfully"
            );

            setIsModalOpen(false);
            setEditingEventId(null);
            setEventForm(null);
            setFormMode("create");

            await loadEvents();
        } catch (err) {
            console.error("ADMIN SAVE EVENT FAILED", err);
            toast.error("Failed to save event");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditEvent = async (event: CalendarEvent) => {
        if (!event.calendarEventId) return;
        setEditingEventId(String(event.calendarEventId));
        setFormMode("edit");

        const sectionRows = await fetchCalendarEventSections(event.calendarEventId);

        const sectionNameMap = new Map<number, string>();
        events.forEach(ev => {
            if (ev.calendarEventId === event.calendarEventId && ev.section) {
                const secId = Number(ev.id.split("-")[1]);
                sectionNameMap.set(secId, ev.section);
            }
        });

        setEventForm({
            calendarEventId: event.calendarEventId,
            facultyId: faculty.id,

            date: event.startTime.split("T")[0],
            startTime: event.startTime.split("T")[1].slice(0, 5),
            endTime: event.endTime.split("T")[1].slice(0, 5),

            type: event.type,
            roomNo: event.rawFormData?.roomNo ?? "",

            subjectId: event.rawFormData?.subjectId ?? null,
            topicId: event.rawFormData?.topicId ?? null,

            sections: sectionRows.map((s: any) => ({
                collegeSectionsId: s.collegeSectionId,
                collegeSections: sectionNameMap.get(s.collegeSectionId) ?? "",
            })),
        });

        setIsModalOpen(true);
    };

    const handleNextWeek = () => {
        const next = new Date(currentDate)
        next.setDate(next.getDate() + 7)
        setCurrentDate(next)
    }

    const handlePrevWeek = () => {
        const prev = new Date(currentDate)
        prev.setDate(prev.getDate() - 7)
        setCurrentDate(prev)
    }

    const confirmAddEvent = async () => {
        if (!pendingEvent) return;

        setShowConflictModal(false);
        setIsSaving(true);

        try {
            const payload = {
                facultyId: Number(faculty.id),
                eventTitle: pendingEvent.title,
                eventTopic: String(pendingEvent.topic ?? ""),
                type: pendingEvent.type as "class" | "meeting" | "exam" | "quiz",
                date: pendingEvent.date,
                roomNo: pendingEvent.roomNo?.trim(),
                fromTime: pendingEvent.startTime,
                toTime: pendingEvent.endTime,
                degree: pendingEvent.degree,
                department: pendingEvent.departments,
                // year: pendingEvent.year ?? null,
                year: String(pendingEvent.year ?? ""),
                semester: pendingEvent.semester,
                section: pendingEvent.sections,
            };

            const eventRes = await saveCalendarEvent({
                calendarEventId: editingEventId
                    ? Number(editingEventId)
                    : undefined,

                facultyId: Number(faculty.id),

                subjectId: pendingEvent.type === "meeting"
                    ? null
                    : pendingEvent.subjectId ?? null,

                eventTopic: pendingEvent.type === "meeting"
                    ? null
                    : pendingEvent.eventTopic ?? null,

                type: pendingEvent.type,
                date: pendingEvent.date,
                roomNo: pendingEvent.roomNo,
                fromTime: pendingEvent.fromTime,
                toTime: pendingEvent.toTime,
                meetingLink: pendingEvent.meetingLink ?? null,
            });

            if (!eventRes.success) {
                toast.error("Failed to save event");
                return;
            }

            const calendarEventId = eventRes.calendarEventId;

            if (editingEventId) {
                await deleteCalendarEventSections(Number(editingEventId));
            }

            await saveCalendarEventSections(calendarEventId, {
                collegeEducationId: pendingEvent.educationId,
                collegeBranchId: pendingEvent.branchId,
                collegeAcademicYearId: pendingEvent.academicYearId,
                collegeSemesterId: pendingEvent.semester,
                sectionIds: pendingEvent.sections.map(
                    (s: any) => s.collegeSectionId
                ),
            });

            toast.success("Event saved despite conflict ⚠️");

            await loadEvents();
            setEditingEventId(null);
            setEventForm(null);
            setFormMode("create");
            setIsModalOpen(false);
            setPendingEvent(null);
        } catch (err) {
            toast.error("Failed to save event");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteEvent = async (event: CalendarEvent) => {
        if (!event.calendarEventId) return false;
        try {
            setIsDeleting(true);
            await deleteCalendarEventSections(event.calendarEventId);
            const res = await deleteCalendarEvent(event.calendarEventId);
            if (!res.success) {
                toast.error("Failed to delete event.");
                return false;
            }
            await loadEvents();
            toast.success("Event deleted successfully.");
            return true;
        } catch (err) {
            console.error("ADMIN DELETE FAILED", err);
            toast.error("Failed to delete event.");
            setIsDeleting(false);
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    const handleConflictCancel = () => {
        setShowConflictModal(false);
        setFormMode("create");
        setIsModalOpen(true);
    };

    const closeAddEventModal = () => {
        setIsModalOpen(false)
        setEventForm(null);
    };

    return (
        <main>
            <section className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-semibold text-black flex items-center">
                        <CaretLeft size={23} onClick={onBack} className="cursor-pointer -ml-1.5" />  Calendar & Events
                    </h1>
                    <p className="text-sm text-[#282828] mt-1">
                        Viewing Calendar for {faculty.name} ({faculty.branch}) – ID {faculty.id}
                    </p>
                </div>
                <CourseScheduleCard style="w-[320px]" department={faculty.branch} year={faculty.year} />
            </section>

            <div className="flex justify-between mb-2">
                <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
                <CalendarHeader onAddClick={() => {
                    setEditingEventId(null);
                    setEventForm(null);
                    setFormMode("create");
                    setIsModalOpen(true);
                }}
                />
            </div>

            {isLoadingEvents ? (
                <div className="flex justify-center items-center h-[300px]">
                    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <CalendarGrid
                    events={events}
                    weekDays={weekDays}
                    activeTab={activeTab}
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                    onDeleteRequest={setEventToDelete}
                    onEditRequest={handleEditEvent}
                    onEventClick={(event) => {
                        setSelectedEvent(event);
                        setShowDetails(true);
                    }}
                />
            )}

            <AddEventModal
                isOpen={isModalOpen}
                //value={eventForm}
                value={{ ...eventForm, facultyId: faculty.id }}
                onClose={closeAddEventModal}
                onSave={handleSaveEvent}
                degreeOptions={degreeOptions}
                isSaving={isSaving}
                mode={formMode}
            />

            <ConfirmConflictModal
                open={showConflictModal}
                onConfirm={confirmAddEvent}
                onCancel={handleConflictCancel}
            />

            <ConfirmDeleteModal
                open={!!eventToDelete}
                isDeleting={isDeleting}
                onCancel={() => {
                    if (isDeleting) return;
                    setEventToDelete(null);
                }}
                onConfirm={async () => {
                    if (!eventToDelete) return;
                    const success = await handleDeleteEvent(eventToDelete);
                    if (success) {
                        setEventToDelete(null);
                    }
                }}
            />

            <EventDetailsModal
                open={showDetails}
                event={selectedEvent}
                onClose={() => {
                    setShowDetails(false);
                    setSelectedEvent(null);
                }}
            />
        </main>
    )
}
