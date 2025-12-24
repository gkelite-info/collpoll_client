"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, } from "recharts";
import { FaChevronRight } from "react-icons/fa6";

export default function AcademicPerformanceSmall() {
    const data = [
        { subject: "Java", value: 70, full: 100 },
        { subject: "DS", value: 50, full: 100 },
        { subject: "DBMS", value: 80, full: 100 },
        { subject: "OS", value: 35, full: 100 },
        { subject: "SE", value: 80, full: 100 },
        { subject: "Web", value: 60, full: 100 },
    ];

    return (
        <div className="bg-white rounded-lg p-3 w-[66%] h-[220px] shadow-md">
            <div className="bg-red-00 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#282828]">
                    Academic Performance
                </h3>
                <FaChevronRight
                    size={18}
                    className="text-black cursor-pointer"
                />
            </div>

            <div className="w-full h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 10, left: -4, bottom: 0 }}
                        barGap={-25}
                        barCategoryGap={10}
                    >
                        <defs>
                            <linearGradient id="smallBarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#A8E089" />
                                <stop offset="100%" stopColor="#9ACC7D" />
                            </linearGradient>
                        </defs>

                        <YAxis
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                            tick={{ fontSize: 9, fill: "#888" }}
                            width={35}
                        />

                        <XAxis
                            dataKey="subject"
                            tick={{ fontSize: 9 }}
                            interval={0}
                        />

                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px",
                                color: "#111827",
                            }}
                            labelStyle={{
                                color: "#111827",
                                fontWeight: 600,
                                fontSize: 12,
                            }}
                            itemStyle={{
                                color: "#111827",
                                fontSize: 12,
                            }}
                        />


                        <Bar
                            dataKey="full"
                            barSize={25}
                            fill="#E9F5E6"
                            radius={[6, 6, 6, 6]}
                        />

                        <Bar dataKey="value" barSize={25} radius={[6, 6, 6, 6]}>
                            <LabelList
                                dataKey="value"
                                content={({ x, y, width, value }: any) => (
                                    <g>
                                        <circle
                                            cx={x + width / 2}
                                            cy={y + 14}
                                            r={10}
                                            fill="#E8F6E2"
                                        />
                                        <text
                                            x={x + width / 2}
                                            y={y + 18}
                                            textAnchor="middle"
                                            fill="#7CD24C"
                                            fontSize={8}
                                            fontWeight="bold"
                                        >
                                            {value}%
                                        </text>
                                    </g>
                                )}
                            />

                            {data.map((_, i) => (
                                <Cell key={i} fill="url(#smallBarGradient)" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
