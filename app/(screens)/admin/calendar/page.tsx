"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import FacultyOverview from "./components/FacultyOverview"
import CalendarView from "./components/CalendarView"
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable"
import { fetchFilteredFaculties } from "@/lib/helpers/admin/calender/fetchFacultyCalendar"
import { useUser } from "@/app/utils/context/UserContext"
import { useAdmin } from "@/app/utils/context/admin/useAdmin"
import toast from "react-hot-toast"
import { decryptId, encryptId } from "@/app/utils/encryption"

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlParamId = searchParams.get("facultyId")
  const facultyId = urlParamId ? decryptId(urlParamId) : null
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null)
  const { collegeId } = useUser()
  const { collegeEducationId } = useAdmin()

  useEffect(() => {
    if (urlParamId && !facultyId) {
      toast.error("Invalid calendar link")
      router.push("/admin/calendar")
      return
    }

    if (!facultyId) {
      setSelectedFaculty(null)
      return
    }

    const loadFaculty = async () => {
      if (!collegeId || !collegeEducationId) return

      try {
        const { data } = await fetchFilteredFaculties({
          collegeId,
          collegeEducationId,
        })

        const faculty = data.find((f: any) => f.id === facultyId)
        if (faculty) {
          setSelectedFaculty(faculty)
        } else {
          toast.error("Faculty not found")
          router.push("/admin/calendar")
        }
      } catch (error) {
        toast.error("Failed to load faculty data")
        router.push("/admin/calendar")
      }
    }

    loadFaculty()
  }, [facultyId, collegeId, collegeEducationId, router])

  if (facultyId && !selectedFaculty) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f3f4f6]">
        <Loader />
      </div>
    )
  }

  return (
    <div className="p-4 bg-[#f3f4f6] min-h-screen">
      {selectedFaculty ? (
        <CalendarView
          faculty={selectedFaculty}
          onBack={() => router.push("/admin/calendar")}
        />
      ) : (
        <FacultyOverview onSelect={(faculty) => router.push(`/admin/calendar?facultyId=${encryptId(faculty.id)}`)} />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f3f4f6]">
          <Loader />
        </div>
      }
    >
      <PageContent />
    </Suspense>
  )
}
