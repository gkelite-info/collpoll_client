"use client"

import { useState } from "react"
import CourseScheduleCard from "@/app/utils/CourseScheduleCard"
import CalendarGrid from "./calenderGrid"
import CalendarHeader from "./calendarHeader"
import CalendarToolbar from "./calenderToolbar"
import AddEventModal from "./addEventModal"
import { CALENDAR_EVENTS } from "../calenderData"
import { CalendarEvent } from "../types"
import { combineDateAndTime, getWeekDays, hasTimeConflict } from "../utils"
import ConfirmConflictModal from "./ConfirmConflictModal";
import { CaretLeft } from "@phosphor-icons/react"
import ConfirmDeleteModal from "./ConfirmDeleteModal"

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
    const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [pendingEvent, setPendingEvent] = useState<CalendarEvent | null>(null);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
    const [eventForm, setEventForm] = useState<any | null>(null);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    const weekDays = getWeekDays(currentDate)

    const handleSaveEvent = (data: any) => {
        const start = combineDateAndTime(data.date, data.startTime);
        const end = combineDateAndTime(data.date, data.endTime);

        if (editingEventId) {
            setEvents((prev) =>
                prev.map((e) =>
                    e.id === editingEventId
                        ? {
                            ...e,
                            title: data.title,
                            type: data.type,
                            startTime: start,
                            endTime: end,
                            day: new Date(data.date)
                                .toLocaleDateString("en-US", { weekday: "short" })
                                .toUpperCase(),
                            rawFormData: data,
                        }
                        : e
                )
            );

            setEditingEventId(null);
            setEventForm(null);
            setIsModalOpen(false);
            return;
        }

        const newEvent: CalendarEvent = {
            id: crypto.randomUUID(),
            title: data.title,
            type: data.type,
            day: new Date(data.date)
                .toLocaleDateString("en-US", { weekday: "short" })
                .toUpperCase(),
            startTime: start,
            endTime: end,
            rawFormData: data,
        };

        const sameDayEvents = events.filter((e) =>
            e.startTime.startsWith(data.date)
        );
        setEventForm(data);

        if (hasTimeConflict(sameDayEvents, start, end)) {
            setPendingEvent(newEvent);
            setShowConflictModal(true);
            setIsModalOpen(false);
            return;
        }

        setEvents((prev) => [...prev, newEvent])
        setEventForm(null);
        setIsModalOpen(false);
    };

    const handleEditEvent = (event: CalendarEvent) => {
  setEditingEventId(event.id);

  const startDate = event.startTime.split("T")[0];
  const startTime = event.startTime.split("T")[1].slice(0, 5);
  const endTime = event.endTime.split("T")[1].slice(0, 5);

  setEventForm({
    title: event.title,
    topic: event.rawFormData?.topic ?? "",
    roomNo: event.rawFormData?.roomNo ?? "",
    departments: event.rawFormData?.departments ?? [],
    sections: event.rawFormData?.sections ?? [],
    year: event.rawFormData?.year ?? null,
    semester: event.rawFormData?.semester ?? "",
    type: event.type,
    date: startDate,
    startTime,
    endTime,
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

    const confirmAddEvent = () => {
        if (pendingEvent) {
            setEvents((prev) => [...prev, pendingEvent]);
        }

        setPendingEvent(null)
        setShowConflictModal(false);
    };




    const handleDeleteEvent = (eventId: string) => {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
    };


    const handleConflictCancel = () => {
        setPendingEvent(null);
        setShowConflictModal(false);
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
                    setIsModalOpen(true);
                }}
                />
            </div>

            <CalendarGrid
                events={events}
                weekDays={weekDays}
                activeTab={activeTab}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onDeleteRequest={setEventToDelete}
                onEditRequest={handleEditEvent}
            />

            <AddEventModal
                isOpen={isModalOpen}
                value={eventForm}
                onClose={closeAddEventModal}
                onSave={handleSaveEvent}
            />

            <ConfirmConflictModal
                open={showConflictModal}
                onConfirm={confirmAddEvent}
                onCancel={handleConflictCancel}
            />

            <ConfirmDeleteModal
                open={!!eventToDelete}
                onCancel={() => setEventToDelete(null)}
                onConfirm={() => {
                    if (eventToDelete) {
                        handleDeleteEvent(eventToDelete.id);
                    }
                    setEventToDelete(null);
                }}
            />

        </main>
    )
}
