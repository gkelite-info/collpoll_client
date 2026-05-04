"use client";

import { getStudentAcademicPerformance } from "@/lib/helpers/student/AcademicPerformance/calculations";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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

type AcademicPerformanceDatum = {
  subject: string;
  value: number;
  full: number;
};

type LabelContentProps = {
  x?: number | string | null;
  y?: number | string | null;
  width?: number | string | null;
  value?: number | string | null;
};

const toNumber = (value: number | string | null | undefined) =>
  typeof value === "number" ? value : Number(value ?? 0);

export default function AcademicPerformance({
  studentId,
  data: externalData,
}: {
  studentId: number | null;
  data?: AcademicPerformanceDatum[];
}) {
  const [data, setData] = useState<AcademicPerformanceDatum[]>(
    externalData ?? [],
  );
  const [loading, setLoading] = useState(!externalData);

  const t = useTranslations("Dashboard.student");

  useEffect(() => {
    if (externalData) {
      setData(externalData);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const performance = await getStudentAcademicPerformance(studentId);
        setData(performance);
      } catch {
        toast.error("Failed to load performance");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studentId, externalData]);

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg bg-white shadow-md">
        <p className="animate-pulse text-gray-500">
          {t("Calculating performance")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-full w-full max-w-6xl overflow-hidden rounded-lg bg-white px-2 pt-5 shadow-md">
      <h2 className="mb-6 ml-3 text-xl font-semibold text-[#282828]">
        {t("Academic Performance")}
      </h2>

      <div className="h-80 w-full bg-green-00">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 40, right: 30, left: 0, bottom: 0 }}
            barGap={-50}
            barCategoryGap={0}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8E089" />
                <stop offset="100%" stopColor="#9ACC7D" />
              </linearGradient>
            </defs>

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#888" }}
              tickFormatter={(value) => `${value}%`}
            />

            <XAxis
              dataKey="subject"
              tick={{ fontSize: 8.5, fill: "#000" }}
              interval={0}
              angle={0}
              textAnchor="middle"
              height={60}
            />

            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "1px solid #ccc",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              labelStyle={{
                color: "#000000",
                fontWeight: 600,
              }}
              itemStyle={{
                color: "#000000",
                fontSize: 13,
              }}
            />

            <Bar
              dataKey="full"
              barSize={50}
              fill="rgba(233, 245, 230, 0.7)"
              radius={[10, 10, 10, 10]}
            />

            <Bar dataKey="value" barSize={50} radius={[10, 10, 10, 10]}>
              <LabelList
                dataKey="value"
                content={(props) => {
                  const { x, y, width, value } = props as LabelContentProps;
                  const labelX = toNumber(x);
                  const labelY = toNumber(y);
                  const labelWidth = toNumber(width);
                  const labelValue = toNumber(value);
                  const adjustedY =
                    labelValue === 0
                      ? labelY - 12
                      : labelValue < 15
                        ? labelY + 2
                        : labelY + 12;

                  return (
                    <g>
                      <circle
                        cx={labelX + labelWidth / 2}
                        cy={adjustedY}
                        r={11.5}
                        fill="#E8F6E2"
                      />
                      <text
                        x={labelX + labelWidth / 2}
                        y={adjustedY + 4}
                        textAnchor="middle"
                        fill="#7CD24C"
                        fontSize={8}
                        fontWeight="bold"
                      >
                        {labelValue}%
                      </text>
                    </g>
                  );
                }}
              />

              {data.map((_, index) => (
                <Cell key={index} fill="url(#barGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
