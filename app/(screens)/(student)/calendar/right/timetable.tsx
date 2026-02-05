"use client";
import { fetchStudentContext } from "@/app/utils/context/studentContextAPI";
import { fetchStudentTimetableByDate }
    from "@/lib/helpers/profile/calender/fetchStudentTimetable";
import { supabase } from "@/lib/supabaseClient";


import { FilePdf } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const formatTimeToAMPM = (time24: string) => {
    const [h, m] = time24.split(":");
    let hour = Number(h);

    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${m} ${period}`;
};

export const Loader = () => (
    <div className="flex justify-center items-center h-[300px]">
        <div className="w-10 h-10 border-4 border-[#E8EAED] border-t-[#16284F] rounded-full animate-spin"></div>
    </div>
);

export default function CalendarTimeTable() {

    const [todayDate, setTodayDate] = useState("");
    const [todayDay, setTodayDay] = useState("");
    const [timetable, setTimetable] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);
    const [degree, setDegree] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [department, setDepartment] = useState<string>("");



    useEffect(() => {
        console.log("🟢 Header date useEffect triggered");

        const now = new Date();

        const formattedDate = String(now.getDate()).padStart(2, "0");

        const formattedDay = now
            .toLocaleString("en-US", { weekday: "short" })
            .replace(".", "");

        console.log("📅 Header date:", formattedDate, formattedDay);

        setTodayDate(formattedDate);
        setTodayDay(formattedDay);
    }, []);




    useEffect(() => {
        const loadTimetable = async () => {
            try {
                setLoading(true);

                // 1️⃣ Today date (YYYY-MM-DD)
                const today = new Date();
                const formattedDate =
                    today.getFullYear() +
                    "-" +
                    String(today.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(today.getDate()).padStart(2, "0");

                console.log("📅 Query date:", formattedDate);

                // 2️⃣ Get auth user
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    throw new Error("No auth user");
                }

                // 3️⃣ Map auth user → internal userId
                const { data: userRow, error: userErr } = await supabase
                    .from("users")
                    .select("userId")
                    .eq("auth_id", user.id)
                    .single();

                if (userErr || !userRow) {
                    throw new Error("Internal user not found");
                }

                // 4️⃣ Fetch student context
                const studentContext = await fetchStudentContext(userRow.userId);

                console.log("📌 Student context:", studentContext);

                // 5️⃣ Fetch timetable for this student + date
                const data = await fetchStudentTimetableByDate({
                    date: formattedDate,
                    collegeEducationId: studentContext.collegeEducationId,
                    collegeBranchId: studentContext.collegeBranchId,
                    collegeAcademicYearId: studentContext.collegeAcademicYearId,
                    collegeSemesterId: studentContext.collegeSemesterId,
                    collegeSectionId: studentContext.collegeSectionsId,
                });

                console.log("📚 Timetable rows:", data);

                // 6️⃣ Shape data for UI
                setTimetable(
                    data.map((item: any) => ({
                        start: formatTimeToAMPM(item.fromTime), // ✅
                        end: formatTimeToAMPM(item.toTime),     // ✅
                        title: item.eventTitle,     // Subject
                        topic: item.eventTopic,     // Topic
                        room: item.roomNo,
                        faculty: item.facultyName,
                        img: "/ai.png",
                    }))
                );
            } catch (err) {
                console.error("❌ Failed to load timetable", err);
                setTimetable([]);
            } finally {
                setLoading(false);
            }
        };

        loadTimetable();
    }, []);

    // const timeTableData = [
    //     {
    //         start: "09:00 AM",
    //         end: "10:00 AM",
    //         img: "/ds.png",
    //         title: "Data Structures",
    //         topic: "Stack Implementation using arrays",
    //         room: "C-102",
    //         faculty: "Dr. Priya",
    //     },
    //     {
    //         start: "10:00 AM",
    //         end: "11:00 AM",
    //         img: "/os.png",
    //         title: "Operating Systems",
    //         topic: "Loops & Iterations",
    //         room: "B-210",
    //         faculty: "Mr. Ramesh",
    //     },
    //     {
    //         start: "11:00 AM",
    //         end: "12:00 PM",
    //         img: "/wt.png",
    //         title: "Web Technologies",
    //         topic: "Search Algorithms",
    //         room: "Lab-1",
    //         faculty: "Dr. Kavitha",
    //     },
    //     {
    //         start: "01:00 PM",
    //         end: "02:00 PM",
    //         img: "/ai.png",
    //         title: "Artificial Intelligence",
    //         topic: "SQL Joins",
    //         room: "C-108",
    //         faculty: "Mrs. Anitha",
    //     },
    //     {
    //         start: "02:00 PM",
    //         end: "03:00 PM",
    //         img: "/development.png",
    //         title: "Web Development",
    //         topic: "React Components",
    //         room: "Lab-3",
    //         faculty: "Mr. Suresh",
    //     },
    //     {
    //         start: "03:00 PM",
    //         end: "04:00 PM",
    //         img: "/cn.png",
    //         title: "Computer Networks",
    //         topic: "TCP/IP Model",
    //         room: "C-205",
    //         faculty: "Dr. Meera",
    //     },
    // ];




    return (
        <>
            <div className="bg-white h-[606px] w-[647px] rounded-lg p-4 shadow-md flex flex-col overflow-y-auto">
                <div className="bg-red-00">
                    <div className="flex bg-[#E8EAED] w-[191px] h-[54px] rounded-md shadow-md">
                        <div className="bg-[#16284F] w-[45px] h-[54px] rounded-l-md flex flex-col items-center justify-center">
                            <p className="text-md font-black text-[#EFEFEF]">{todayDate}</p>
                            <p className="text-xs text-[#FFFFFF] font-light">{todayDay}</p>
                        </div>
                        <div className="flex items-center justify-center w-[146px] bg-green-00 rounded-r-md">
                            <p className="text-[#16284F] font-medium text-lg">Timetable</p>
                        </div>
                    </div>

                    <div className="bg-red-00 mt-5 flex flex-col gap-4">
                        {loading ? (
                            <Loader />
                        ) : (

                            timetable.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-indigo-00 h-[102px] w-full flex justify-between"
                                >
                                    <div className="bg-yellow-00 w-[88px] flex flex-col items-center justify-center">
                                        <p className="text-[#282828] text-xs">{item.start}</p>
                                        <span className="text-[#282828]">-</span>
                                        <p className="text-[#282828] text-xs">{item.end}</p>
                                    </div>

                                    <div className="bg-[#16284F] w-[527px] rounded-xl flex justify-end">
                                        <div className="w-[98%] h-full bg-[#E8E9ED] gap-3 rounded-r-lg flex items-center px-2">
                                            <div className="h-[84px] w-[84px] rounded-lg bg-yellow-600 flex items-center justify-center">
                                                <img src={item.img} />
                                            </div>

                                            <div className="bg-green-00 h-[84px] w-[408px] gap-2 flex items-center justify-between">
                                                <div className="flex flex-col justify-center gap-1 bg-blue-00 h-full w-[90%] overflow-x-auto">
                                                    <p className="text-[#282828] font-medium">{item.title}</p>

                                                    <p className="text-[#282828] font-medium text-sm">
                                                        Topic:
                                                        <span className="text-[#282828] font-regular text-xs ml-1">
                                                            {item.topic}
                                                        </span>
                                                    </p>

                                                    <div className="flex gap-2">
                                                        <p className="text-[#282828] font-medium text-sm">
                                                            Room:
                                                            <span className="text-[#282828] font-regular text-xs ml-1">
                                                                {item.room}
                                                            </span>
                                                            .
                                                        </p>

                                                        <p className="text-[#282828] font-medium text-sm">
                                                            Faculty:
                                                            <span className="text-[#282828] font-regular text-xs ml-1">
                                                                {item.faculty}
                                                            </span>
                                                            .
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-[#16284F] rounded-full h-[40px] w-[40px] flex items-center justify-center cursor-pointer">
                                                    <FilePdf size={23} className="cursor-pointer text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                        }
                    </div>
                </div>
            </div>
        </>
    );
}
// function fetchStudentTimetableByDate(arg0: { date: string; degree: string; year: string; department: string; }) {
//     throw new Error("Function not implemented.");
// }

