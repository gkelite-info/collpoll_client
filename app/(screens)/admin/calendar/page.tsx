"use client"

import { useState } from "react"
import FacultyOverview from "./components/FacultyOverview"
import CalendarView from "./components/CalendarView"

export default function Page() {
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null)

  return (
    <div className="p-4 bg-[#f3f4f6] min-h-screen">
      {!selectedFaculty ? (
        <FacultyOverview onSelect={setSelectedFaculty} />
      ) : (
        <CalendarView
          faculty={selectedFaculty}
          onBack={() => setSelectedFaculty(null)}
        />
      )}
    </div>
  )
}
