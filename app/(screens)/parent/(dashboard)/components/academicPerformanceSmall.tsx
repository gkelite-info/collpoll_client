"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { FaChevronRight } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { getStudentAcademicPerformance } from "@/lib/helpers/student/AcademicPerformance/calculations";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function AcademicPerformanceSmall({
  studentId,
}: {
  studentId: number | null;
}) {
  const router = useRouter();
  const t = useTranslations("Dashboard.parent"); // Hook
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const performance = await getStudentAcademicPerformance(studentId);
        setData(performance);
      } catch (error) {
        toast.error(t("Failed to load performance"));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-3 w-[66%] h-[220px] shadow-md flex items-center justify-center">
        <p className="text-gray-500 animate-pulse text-xs">
          {t("Calculating performance")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-3 w-[66%] h-[220px] shadow-md">
      <div className="bg-red-00 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#282828]">
          {t("Academic Performance")}
        </h3>
        <FaChevronRight
          size={18}
          className="text-black cursor-pointer"
          onClick={() => router.push("/parent/student-progress")}
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

            <XAxis dataKey="subject" tick={{ fontSize: 9 }} interval={0} />

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
                content={({ x, y, width, height, value }: any) => {
                  const adjustedY =
                    value === 0 ? y - 12 : value < 15 ? y + 2 : y + 12;
                  return (
                    <g>
                      <circle
                        cx={x + width / 2}
                        cy={adjustedY}
                        r={10}
                        fill="#E8F6E2"
                      />
                      <text
                        x={x + width / 2}
                        y={adjustedY + 4}
                        textAnchor="middle"
                        fill="#7CD24C"
                        fontSize={8}
                        fontWeight="bold"
                      >
                        {value}%
                      </text>
                    </g>
                  );
                }}
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
