"use client"
import Calendar from "@/app/utils/calendar"
import CardComponent from "@/app/utils/card"
import CourseScheduleCard from "@/app/utils/CourseScheduleCard"
import AttendanceInsight from "@/app/utils/insightChart"
import SemesterAttendanceCard from "@/app/utils/seminsterAttendanceCard"
import Table from "@/app/utils/table"
import { Chalkboard, FilePdf, User, UsersThree } from "@phosphor-icons/react"

interface TableRow {
  Subject: string
  "Today's Status": string
  "Class Attendance": string
  "Percentage %": string
  Notes: React.ReactNode
}

interface CardItem {
  id: number
  icon: React.ReactNode
  value: string | number
  label: string
  style?: string
  iconBgColor?: string
  iconColor?: string
  underlineValue?: boolean
}

const columns = [
  "Subject",
  "Today's Status",
  "Class Attendance",
  "Percentage %",
  "Notes",
]

const data: TableRow[] = [
  {
    Subject: "Data Structures",
    "Today's Status": "Present",
    "Class Attendance": "08/10",
    "Percentage %": "80%",
    Notes: <FilePdf size={32} />,
  },
  {
    Subject: "OOPs using C++",
    "Today's Status": "Present",
    "Class Attendance": "07/10",
    "Percentage %": "70%",
    Notes: <FilePdf size={32} />,
  },
  {
    Subject: "Discreate Mathematics",
    "Today's Status": "Present",
    "Class Attendance": "08/10",
    "Percentage %": "80%",
    Notes: <FilePdf size={32} />,
  },
  {
    Subject: "Computer Organization",
    "Today's Status": "Present",
    "Class Attendance": "06/10",
    "Percentage %": "60%",
    Notes: <FilePdf size={32} />,
  },
  {
    Subject: "Digital Logical Design",
    "Today's Status": "Absent",
    "Class Attendance": "09/10",
    "Percentage %": "90%",
    Notes: <FilePdf size={32} />,
  },
  {
    Subject: "Environmental Science",
    "Today's Status": "Late",
    "Class Attendance": "08/10",
    "Percentage %": "80%",
    Notes: <FilePdf size={32} />,
  },
  {
    Subject: "Data Structure Lab",
    "Today's Status": "Present",
    "Class Attendance": "06/10",
    "Percentage %": "60%",
    Notes: <FilePdf size={32} />,
  },
  {
    Subject: "OOPs Lab",
    "Today's Status": "Absent",
    "Class Attendance": "09/10",
    "Percentage %": "90%",
    Notes: <FilePdf size={32} />,
  },
  {
    Subject: "Digital Logic Lab",
    "Today's Status": "Late",
    "Class Attendance": "08/10",
    "Percentage %": "80%",
    Notes: <FilePdf size={32} />,
  },
]

const cards: CardItem[] = [
  {
    id: 1,
    icon: <UsersThree size={32} />,
    value: "8/10",
    label: "Total Classes",
    style: "bg-[#FFEDDA] w-44",
    iconBgColor: "#FFBB70",
    iconColor: "#EFEFEF",
  },
  {
    id: 2,
    icon: <Chalkboard size={32} weight="fill" />,
    value: "220/250",
    label: "Class Notes",
    style: "bg-[#CEE6FF] w-44",
    iconBgColor: "#7764FF",
    iconColor: "#EFEFEF",
    //underlineValue: true,
  },
]

export default function Attendance() {
  return (
    <div className="bg-[#EFEFEF] flex w-full h-fit p-3">
      <div className="flex flex-col w-[68%] gap-2">
        <div className="mb-5">
          <h1 className="text-[#282828] font-bold text-2xl mb-2">Attendance</h1>
          <p className="text-[#282828]">
            Track, Manage, and Maintain Your Attendance Effortlessly
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          {cards.map((card) => (
            <CardComponent
              key={card.id}
              style={card.style}
              icon={card.icon}
              value={card.value}
              label={card.label}
              iconBgColor={card.iconBgColor}
              iconColor={card.iconColor}
              underlineValue={card.underlineValue}
            />
          ))}
          <SemesterAttendanceCard
            presentPercent={80}
            absentPercent={15}
            latePercent={5}
            overallPercent={85}
          />
        </div>

        <div>
          <Table columns={columns} data={data} />
        </div>
      </div>

      <div className="w-[32%] flex flex-col gap-2 p-3">
        <div className="mb-5">
          <CourseScheduleCard />
        </div>
        <div className="mt-2">
          <Calendar />
        </div>
        <div className="mt-5">
          <AttendanceInsight weeklyData={[80, 70, 90, 50, 30, 85, 62]} />
        </div>
      </div>
    </div>
  )
}
