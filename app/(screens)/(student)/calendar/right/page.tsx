"use client";
import CalendarTimeTable from "./timetable";

interface CalendarRightProps {
    selectedDate: string;
    extraInfo: {
        quizzes: number;
        assignments: number;
        discussions: number;
    };
}

export default function CalendarRight({ selectedDate, extraInfo }: any) {

    const quiz = extraInfo.quizzes?.[0];
    const discussion = extraInfo.discussions?.[0];

    return (
        <>
            <div className="bg-blue-00 h-[100%] flex flex-col justify-start lg:gap-4">
                <CalendarTimeTable selectedDate={selectedDate} height="lg:h-[580px]" />

                <div className="bg-white grid grid-cols-3 lg:gap-3 rounded-lg shadow-lg p-3">
                    <div className="bg-pink-100 border border-pink-400 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                        <span className="lg:text-3xl font-black text-black">{extraInfo?.quizzes || 0}</span>
                        <span className="lg:text-lg font-bold text-pink-700">Active <br /> Quizzes</span>
                    </div>
                    <div className="bg-blue-100 border border-blue-400 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                        <span className="lg:text-3xl font-black text-black">{extraInfo?.assignments || 0}</span>
                        <span className="lg:text-lg font-bold text-blue-700">Active <br /> Assignments</span>
                    </div>
                    <div className="bg-purple-100 border border-purple-400 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                        <span className="lg:text-3xl font-black text-black">{extraInfo?.discussions || 0}</span>
                        <span className="lg:text-lg font-bold text-purple-700">Active <br /> Discussions</span>
                    </div>
                </div>
            </div>
        </>
    );
}
