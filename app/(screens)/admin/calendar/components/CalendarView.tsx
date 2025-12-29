"use client"

import { useState } from "react"
import CourseScheduleCard from "@/app/utils/CourseScheduleCard"
import CalendarGrid from "./calenderGrid"
import CalendarHeader from "./calendarHeader"
import CalendarToolbar from "./calenderToolbar"
import AddEventModal from "./addEventModal"
import { CALENDAR_EVENTS } from "../calenderData"
import { CalendarEvent } from "../types"
import { combineDateAndTime, getWeekDays } from "../utils"
import { CaretLeft } from "@phosphor-icons/react"

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

    const weekDays = getWeekDays(currentDate)

    const handleSaveEvent = (data: any) => {
        const newEvent: CalendarEvent = {
            id: crypto.randomUUID(),
            title: data.title,
            type: data.type,
            day: new Date(data.date)
                .toLocaleDateString("en-US", { weekday: "short" })
                .toUpperCase(),
            startTime: combineDateAndTime(data.date, data.startTime),
            endTime: combineDateAndTime(data.date, data.endTime),
        }

        setEvents((prev) => [...prev, newEvent])
    }

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


    return (
        <main>
            <section className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-semibold text-black flex items-center">
                        <CaretLeft size={23} onClick={onBack} className="cursor-pointer -ml-1.5"/>  Calendar & Events
                    </h1>
                    <p className="text-sm text-[#282828] mt-1">
                        Viewing Calendar for {faculty.name} ({faculty.department}) – ID {faculty.id}
                    </p>
                </div>

                <CourseScheduleCard style="w-[320px]" department={faculty.department} year={faculty.year}/>
            </section>

            <div className="flex justify-between mb-2">
                <CalendarToolbar activeTab={activeTab} setActiveTab={setActiveTab} />
                <CalendarHeader onAddClick={() => setIsModalOpen(true)} />
            </div>

            <CalendarGrid
                events={events}
                weekDays={weekDays}
                activeTab={activeTab}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
            />

            <AddEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
            />
        </main>
    )
}
