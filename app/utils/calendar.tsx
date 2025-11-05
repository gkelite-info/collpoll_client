"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

export default function CalendarHeader() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthName = currentDate.toLocaleString("default", { month: "long" })
  const year = currentDate.getFullYear()

  const handlePrevMonth = () => {
    const prev = new Date(currentDate)
    prev.setMonth(prev.getMonth() - 1)
    setCurrentDate(prev)
  }

  const handleNextMonth = () => {
    const next = new Date(currentDate)
    next.setMonth(next.getMonth() + 1)
    setCurrentDate(next)
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 h-32 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {monthName} {year}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Days row */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {days.map((day, index) => {
          const currentDay = new Date()
          const currentDayName = currentDay
            .toLocaleDateString("en-US", { weekday: "short" })
            .toUpperCase()
          const isToday = currentDayName === day

          return (
            <div
              key={index}
              className={`text-sm font-medium py-2 rounded-md ${
                isToday
                  ? "bg-[#60AEFF] text-white"
                  : "text-gray-700 bg-gray-100"
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
