import { Suspense } from 'react'
import SubjectAttendanceDetailsClient from './SubjectAttendanceDetailsClient'

export default function SubjectAttendanceDetailsPage() {
  return (
    <Suspense fallback={<div className='h-screen flex items-center justify-center'>Loading attendance details...</div>}>
      <SubjectAttendanceDetailsClient />
    </Suspense>
  )
}
