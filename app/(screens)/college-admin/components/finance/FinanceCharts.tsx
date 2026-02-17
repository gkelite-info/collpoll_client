"use client";

import { useMemo } from "react";
import { AgCharts } from "ag-charts-react";
import {
    ModuleRegistry,
    AllCommunityModule,
} from "ag-charts-community";
import type {
    AgCartesianChartOptions,
    AgPolarChartOptions,
} from "ag-charts-community";
import { CaretDown } from "@phosphor-icons/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const COLORS = {
    green: "#22C55E",
    purple: "#7C3AED",
    blue: "#60A5FA",
};

const FeeCollectionDonut = () => {
    const options = useMemo<AgPolarChartOptions>(() => ({
        data: [
            { type: "B.Tech", value: 4.8 },
            { type: "Degree", value: 2.8 },
            { type: "Polytechnic", value: 2.4 },
        ],
        background: { fill: "transparent" },
        padding: { top: 30, bottom: 10, left: 30, right: 30 },

        series: [
            {
                type: "donut",
                angleKey: "value",
                legendItemKey: "type",
                innerRadiusRatio: 0.6,
                fills: [COLORS.green, COLORS.purple, COLORS.blue],
                strokeWidth: 0,
                innerLabels: [
                    {
                        text: "7.6 Cr",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#282828",
                    },
                ],
            },
        ],

        legend: {
            position: "bottom",
            spacing: 20,
            item: {
                marker: { shape: "circle", size: 10 },
                label: {
                    fontSize: 12,
                    color: "#4B5563",
                },
            },
        },
    }), []);

    return (
        <div className="bg-white rounded-[20px]  flex-1">
            <h3 className="text-lg pl-9 mt-6 font-semibold  text-[#282828]">
                Fee Collection Trend
            </h3>
            <div className="">
                <AgCharts options={options} />
            </div>
        </div>
    );
};

const FeeCollectionBar = () => {
    const options = useMemo<AgCartesianChartOptions>(() => ({
        data: [
            { branch: "CSE", value: 4.5 },
            { branch: "EEE", value: 3.8 },
            { branch: "MECH", value: 4.2 },
            { branch: "ECE", value: 3.5 },
            { branch: "CIVIL", value: 4.6 },
        ],

        background: { fill: "transparent" },

        series: [
            {
                type: "bar",
                xKey: "branch",
                yKey: "value",
                fill: "#6D28D9",
                cornerRadius: 8,
                strokeWidth: 0,
                maxWidth: 45,
            },
        ],

        axes: {
            bottom: {
                type: "category",
                line: {
                    width: 1,
                    stroke: "#E5E7EB",
                },
                label: {
                    fontSize: 12,
                    color: "#6B7280",
                },
            },
            left: {
                type: "number",
                label: { enabled: false },
                line: { enabled: false },
                gridLine: { enabled: false },
            },
        },

        legend: { enabled: false },
    }), []);

    return (
        <div className="
                bg-white 
                rounded-[15px] 
                p-4 
                flex flex-col">

            <div className="flex justify-between p-2 items-center mb-0">
                <h3 className="text-lg pl-4 font-semibold text-[#282828]">
                    Fee Collection Trend
                </h3>
                <span className="text-white bg-[#3DAD6E] text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    B.Tech
                    <CaretDown size={12} weight="bold" />
                </span>

            </div>

            <div className="">
                <AgCharts options={options} />
            </div>
        </div>
    );
};

export default function FinanceCharts() {
    return (
        <div className="grid lg:grid-cols-2 gap-3 mt-6">
            <FeeCollectionDonut />
            <FeeCollectionBar />
        </div>
    );
}
