import { PieChart, Pie, Cell } from "recharts";
import { useId } from "react";

type TinyDonutProps = {
    percentage: number;
    width: number;
    height: number;
    radialStart: string;
    radialEnd: string;
    remainingColor: string;
};

export default function TinyDonut({
    percentage,
    width,
    height,
    radialStart,
    radialEnd,
    remainingColor,
}: TinyDonutProps) {
    const size = Math.min(width, height);
    const innerRadius = size * 0.35;
    const outerRadius = size * 0.48;

    const gradientId = useId();

    const data = [
        { name: "filled", value: percentage },
        { name: "remaining", value: 100 - percentage },
    ];

    return (
        <div
            style={{ width, height }}
            className="flex items-center justify-center relative"
        >
            <PieChart width={width} height={height}>
                <defs>
                    <radialGradient id={gradientId} cx="50%" cy="50%" r="65%">
                        <stop offset="0%" stopColor={radialStart} />
                        <stop offset="100%" stopColor={radialEnd} />
                    </radialGradient>
                </defs>

                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    cornerRadius={9999}
                >
                    <Cell fill={`url(#${gradientId})`} style={{ transition: "all 0.4s ease" }} />
                    <Cell fill={remainingColor} />
                </Pie>
            </PieChart>

            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className="font-semibold text-gray-900"
                    style={{ fontSize: size * 0.22 }}
                >
                    {percentage}%
                </span>
            </div>
        </div>
    );
}
