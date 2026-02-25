'use client'
import { Calendar } from "@phosphor-icons/react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

type chartProps = {
    month: string;
    value: number;
}

type attendanceProp = {
    percentage: number;
    data?: chartProps[];
}


export default function AttendanceCard({ percentage, data }: attendanceProp) {
    return (
        <>
            <div className="bg-white h-[200px] w-[32%] rounded-lg p-2 flex flex-col gap-2 shadow-md">
                <div className="bg-pink-00 w-full h-[20%] flex items-center justify-between">
                    <div className="bg-[#EAECFC] rounded-lg p-1">
                        <Calendar size={22} weight="fill" color="#604DDC" />
                    </div>
                    <h4 className="text-lg font-medium text-[#282828]">Attendance</h4>
                    <div className="rounded-full lg:h-8 lg:w-8 bg-[#E9E7FA] flex items-center justify-center">
                        <p className="text-[#604DDC] text-xs font-semibold">{percentage}%</p>
                    </div>
                </div>
                <div className="bg-yellow-00 w-full h-[80%]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip
                                labelStyle={{ color: "black", fontWeight:"600" }}
                                itemStyle={{ color: "#282828" }}
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            />
                            <Bar
                                dataKey="value"
                                barSize={18}
                                radius={[5, 5, 0, 0]}
                                fill="#A2D884"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    )
}