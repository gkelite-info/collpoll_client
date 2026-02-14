"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Admins", value: 12 },
  { name: "Students", value: 4620 },
  { name: "Parents", value: 480 },
];

const COLORS = ["#6C20CA", "#43C17A", "#FFBB70"];

export default function UsersPieChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" outerRadius={70}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
