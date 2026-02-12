"use client";

import React from "react";
import { CurrencyDollar, CurrencyInrIcon } from "@phosphor-icons/react";

const FeeStats = () => {
  const stats = [
    {
      label: "Total Fee",
      value: "₹5,24,000",
      bg: "bg-[#E2DAFF]", // Light Purple
      iconColor: "text-[#6C20CA]",
    },
    {
      label: "Paid Till Now",
      value: "₹24,000",
      bg: "bg-[#E6FBEA]", // Light Green
      iconColor: "text-[#43C17A]",
    },
    {
      label: "Pending Amount",
      value: "₹4,95,630",
      bg: "bg-[#FFEDDA]", // Light Orange
      iconColor: "text-[#FFBB70]",
    },
    {
      label: "Due Date",
      value: "15 Feb 2026",
      bg: "bg-[#CEE6FF]", // Light Blue
      iconColor: "text-[#60AEFF]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bg} rounded-xl p-5 flex flex-col justify-between min-h-[120px]`}
        >
          {/* Icon */}
          <div className="mb-4">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <CurrencyInrIcon
                weight="fill"
                size={24}
                className={stat.iconColor}
              />
            </div>
          </div>

          {/* Text */}
          <div>
            <h4 className="text-[#282828] font-bold text-xl mb-1">
              {stat.value}
            </h4>
            <p className="text-gray-600 text-xs font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeeStats;
