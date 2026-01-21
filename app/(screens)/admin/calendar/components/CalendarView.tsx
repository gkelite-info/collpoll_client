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
import { deleteCalendarEvent, fetchCalendarEventById, fetchCalendarEventsByFaculty, updateCalendarEventAdmin, upsertCalendarEventAdmin } from "@/lib/helpers/calendar/calendarEvent";
import { fetchCollegeDegrees } from "@/lib/helpers/admin/academicSetupAPI";

interface Props {
    faculty: {
        name: string
        id: string
        department: string
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
            const res = await fetchCalendarEventsByFaculty(Number(faculty.id));

            if (!res.success) {
                toast.error("Failed to load calendar events");
                return;
            }

            const formatted: CalendarEvent[] = (res.events ?? []).map((e: any) => ({
                id: String(e.calendarEventId),
                title: e.eventTitle,
                type: e.type,
                day: new Date(e.date)
                    .toLocaleDateString("en-US", { weekday: "short" })
                    .toUpperCase(),
                startTime: combineDateAndTime(e.date, e.fromTime),
                endTime: combineDateAndTime(e.date, e.toTime),
                rawFormData: {
                    title: e.eventTitle,
                    topic: e.eventTopic,
                    roomNo: e.roomNo,
                    degree: e.degree,
                    departments: (e.department ?? []).map((d: any) => ({
                        uuid: d.uuid,
                        name: d.name,
                    })),
                    sections: (e.section ?? []).map((s: any) => ({
                        uuid: s.uuid,
                        name: s.name,
                    })),
                    year: e.year,
                    semester: (e.semester ?? []).map((s: any) => ({
                        uuid: s.uuid,
                        name: s.name,
                    })),
                    type: e.type,
                    date: e.date,
                    startTime: e.fromTime,
                    endTime: e.toTime,
                },
            }));

            setEvents(formatted);
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
        const res = await fetchCalendarEventsByFaculty(Number(faculty.id));

        if (!res.success || !res.events) return false;

        return res.events.some((e: any) => {
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
    };

    const handleSaveEvent = async (data: any) => {
        try {
            setIsSaving(true);
            const start = combineDateAndTime(data.date, data.startTime);
            const end = combineDateAndTime(data.date, data.endTime);
            setEventForm(data);


            const conflict = await hasDbConflict(
                data.date,
                data.startTime,
                data.endTime,
                editingEventId ? Number(editingEventId) : undefined
            );

            if (conflict) {
                setPendingEvent(data);
                setShowConflictModal(true);
                setIsModalOpen(false);
                return;
            }


            const payload = {
                facultyId: Number(faculty.id),
                eventTitle: data.title,
                eventTopic: data.topic?.trim(),
                type: data.type,
                date: data.date,
                roomNo: data.roomNo?.trim(),
                fromTime: data.startTime,
                toTime: data.endTime,
                degree: data.degree,
                department: data.departments,
                //year: data.year?.toString() ?? "",
                year: data.year ?? null,
                semester: data.semester?.map((s: any) => ({
                    uuid: s.uuid ?? crypto.randomUUID(),
                    name: s.name,
                })),
                section: data.sections,
            };

            if (editingEventId) {
                const updateres = await updateCalendarEventAdmin(Number(editingEventId), payload);

                if (!updateres.success) {
                    toast.error(updateres.error || "Failed to update event");
                    return;
                }
                await loadEvents();
                setIsModalOpen(false);
                setEventForm(null);
                setEditingEventId(null);
                toast.success("Event updated successfully.");
                return;
            }

            const res = await upsertCalendarEventAdmin(payload);

            if (!res.success) {
                toast.error(res.error || "Failed to save event");
                return;
            }
            await loadEvents();
            setIsModalOpen(false);
            setEventForm(null);
            setPendingEvent(null);
            setEditingEventId(null);
            toast.success("Event saved successfully.");
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditEvent = async (event: CalendarEvent) => {
        const res = await fetchCalendarEventById(Number(event.id));

        if (!res.success) {
            toast.error("Failed to load event");
            return;
        }

        const e = res.event;

        setEditingEventId(e.calendarEventId);

        setEventForm({
            title: e.eventTitle,
            topic: e.eventTopic,
            roomNo: e.roomNo,
            degree: e.degree,
            departments: (e.department ?? []).map((d: any) => ({
                uuid: d.uuid,
                name: d.name,
            })),
            sections: (e.section ?? []).map((s: any) => ({
                uuid: s.uuid,
                name: s.name,
            })),
            year: e.year,
            semester: (e.semester ?? []).map((s: any) => ({
                uuid: s.uuid,
                name: s.name,
            })),
            type: e.type,
            date: e.date,
            startTime: e.fromTime,
            endTime: e.toTime,
        });
        setFormMode("edit");
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

    // const confirmAddEvent = async () => {
    //     if (!pendingEvent) return;
    //     setShowConflictModal(false);
    //     await saveEventDirectly(pendingEvent);
    //     setPendingEvent(null);
    // };

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
                year: pendingEvent.year ?? null,
                semester: pendingEvent.semester,
                section: pendingEvent.sections,
            };

            if (editingEventId) {
                await updateCalendarEventAdmin(Number(editingEventId), payload);
                toast.success("Event updated despite conflict.");
            } else {
                await upsertCalendarEventAdmin(payload);
                toast.success("Event created despite conflict.");
            }

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



    const handleDeleteEvent = async (eventId: string) => {
        try {
            setIsDeleting(true);
            const res = await deleteCalendarEvent(Number(eventId));
            if (!res.success) {
                toast.error("Failed to delete event.");
                return false;
            }

            await loadEvents();
            toast.success("Event deleted successfully.");
            return true;
        } catch (error) {
            toast.error("Failed to delete event.");
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


    // const saveEventDirectly = async (data: any) => {
    //     try {
    //         setIsSaving(true);
    //         const payload = {
    //             facultyId: Number(faculty.id),
    //             eventTitle: data.title,
    //             eventTopic: data.topic?.trim(),
    //             type: data.type,
    //             date: data.date,
    //             roomNo: data.roomNo?.trim(),
    //             fromTime: data.startTime,
    //             toTime: data.endTime,
    //             degree: data.degree,
    //             department: data.departments,
    //             year: data.year ?? null,
    //             semester: data.semester,
    //             section: data.sections,
    //         };

    //         await upsertCalendarEventAdmin(payload);
    //         await loadEvents();

    //         setIsModalOpen(false);
    //         setEventForm(null);
    //         toast.success("Event saved successfully.");
    //     } catch (err) {
    //         toast.error("Failed to save event");
    //     }
    //     finally {
    //         setIsSaving(false);
    //     }
    // };



    return (
        <main>
            <section className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-semibold text-black flex items-center">
                        <CaretLeft size={23} onClick={onBack} className="cursor-pointer -ml-1.5" />  Calendar & Events
                    </h1>
                    <p className="text-sm text-[#282828] mt-1">
                        Viewing Calendar for {faculty.name} ({faculty.department}) – ID {faculty.id}
                    </p>
                </div>

                <CourseScheduleCard style="w-[320px]" department={faculty.department} year={faculty.year} />
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
                />
            )}

            <AddEventModal
                isOpen={isModalOpen}
                value={eventForm}
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
                    const success = await handleDeleteEvent(eventToDelete.id);
                    if (success) {
                        setEventToDelete(null);
                    }
                }}
            />

        </main>
    )
}
