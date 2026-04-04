"use client";
import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { fetchStudentTimetableByDate } from "@/lib/helpers/profile/calender/fetchStudentTimetable";
import { supabase } from "@/lib/supabaseClient";
import { FilePdf } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import TimetableCardShimmer from "./TimetableCardShimmer";

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
    const [loading, setLoading] = useState(true);
    const { collegeEducationType } = useStudent();

    useEffect(() => {
        const now = new Date();
        const formattedDate = String(now.getDate()).padStart(2, "0");

        const formattedDay = now
            .toLocaleString("en-US", { weekday: "short" })
            .replace(".", "");

        setTodayDate(formattedDate);
        setTodayDay(formattedDay);
    }, []);

    useEffect(() => {
        const loadTimetable = async () => {
            try {
                setLoading(true);

                const today = new Date();
                const formattedDate =
                    today.getFullYear() +
                    "-" +
                    String(today.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(today.getDate()).padStart(2, "0");

                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    throw new Error("No auth user");
                }

                const { data: userRow, error: userErr } = await supabase
                    .from("users")
                    .select("userId")
                    .eq("auth_id", user.id)
                    .single();

                if (userErr || !userRow) {
                    throw new Error("Internal user not found");
                }
                const studentContext = await fetchStudentContext(userRow.userId);

                const isInter = collegeEducationType === "Inter";

                const data = await fetchStudentTimetableByDate({
                    date: formattedDate,
                    collegeEducationId: studentContext.collegeEducationId,
                    collegeBranchId: studentContext.collegeBranchId,
                    collegeAcademicYearId: studentContext.collegeAcademicYearId,
                    collegeSemesterId: studentContext.collegeSemesterId,
                    collegeSectionId: studentContext.collegeSectionsId,
                    isInter: isInter
                });

                setTimetable(
                    data.map((item: any) => ({
                        start: formatTimeToAMPM(item.fromTime),
                        end: formatTimeToAMPM(item.toTime),
                        title: item.eventTitle,
                        topic: item.eventTopic,
                        room: item.roomNo,
                        faculty: item.facultyName,
                        img: "/stu_class.png",
                        isCancelled: item.isCancelled
                    }))
                );
            } catch (err) {
                console.error("Failed to load timetable", err);
                setTimetable([]);
            } finally {
                setLoading(false);
            }
        };

        loadTimetable();
    }, []);


    return (
        <>
            <div className="bg-white lg:h-[784px] lg:w-[98%] rounded-lg lg:p-4 shadow-md flex flex-col overflow-y-auto">
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
                            <TimetableCardShimmer count={6} />
                        ) : (
                            timetable.length === 0 ? <div className="flex items-center justify-center bg-pink-00 h-[50vh]"><p className="text-center text-[#282828]">No classes yet..</p></div> :
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
                                                <div className="h-[84px] w-[84px] rounded-lg bg-yellow-00 flex items-center justify-center">
                                                    <img src={item.img} alt=""/>
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

                                                            {item.isCancelled && (
                                                                <p className="text-red-500 text-xs font-semibold">
                                                                    Class Cancel
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* <div className="bg-[#16284F] rounded-full h-[40px] w-[40px] flex items-center justify-center cursor-pointer">
                                                        <FilePdf size={23} className="cursor-pointer text-white" />
                                                    </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div >
        </>
    );
}
