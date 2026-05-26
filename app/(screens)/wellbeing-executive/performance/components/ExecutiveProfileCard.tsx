"use client";

import { useState } from "react";
import {
  CalendarDotsIcon,
  CaretDown,
  EnvelopeSimple,
  Phone,
} from "@phosphor-icons/react";
import { months } from "../data";
import type { Executive } from "../types";
import ExecutiveAvatar from "./ExecutiveAvatar";

function MetricCard({
  value,
  label,
  className,
  valueClassName,
}: {
  value: string | number;
  label: string;
  className: string;
  valueClassName: string;
}) {
  return (
    <div
      className={`flex h-[76px] flex-col justify-between rounded-md p-3 ${className}`}
    >
      <span
        className={`text-[20px] font-extrabold leading-none ${valueClassName}`}
      >
        {value}
      </span>
      <span className="text-[12px] font-bold text-[#16284F]">{label}</span>
    </div>
  );
}

export default function ExecutiveProfileCard({
  executive,
  month,
  onMonthChange,
}: {
  executive: Executive;
  month: string;
  onMonthChange: (month: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex items-center gap-4">
          <ExecutiveAvatar
            src={executive.image}
            alt={executive.name}
            size={78}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-[16px] font-bold text-[#282828]">
                {executive.name}
              </h2>
              <span className="text-[11px] font-bold text-[#282828]">
                {executive.staffId}
              </span>
            </div>
            <p className="mt-1 text-[12px] font-bold text-[#43C17A]">
              {executive.role}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[12px] font-bold text-[#16284F]">
              <span className="rounded-full bg-[#43C17A26] p-1 text-[#43C17A]">
                <Phone size={13} weight="fill" />
              </span>
              {executive.phone}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <p className="text-[12px] font-bold text-[#282828]">
            Performance -{" "}
            <span className="text-[#43C17A]">{executive.status}</span>
          </p>
          <p className="flex items-center gap-2 text-[12px] font-bold text-[#16284F]">
            <span className="rounded-full bg-[#43C17A26] p-1 text-[#43C17A]">
              <EnvelopeSimple size={13} weight="fill" />
            </span>
            Email - {executive.email}
          </p>
          <div className="relative">
            <button
              onClick={() => setOpen((value) => !value)}
              className="flex items-center gap-1 rounded-full bg-[#43C17A] px-3 py-1.5 text-[11px] font-bold text-white"
            >
              <span className="rounded-full bg-white p-1 text-[#43C17A]">
                <CalendarDotsIcon size={12} weight="fill" />
              </span>
              {month}
              <CaretDown size={12} weight="bold" />
            </button>
            {open ? (
              <div className="absolute right-0 top-full z-10 mt-1 max-h-[180px] w-32 overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                {months.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      onMonthChange(item);
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-[12px] font-bold ${
                      item === month
                        ? "bg-[#E8F8EF] text-[#43C17A]"
                        : "text-[#16284F] hover:bg-gray-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          value={executive.totalIssues}
          label="Total Issues Handled"
          className="bg-[#E2DAFF]"
          valueClassName="text-[#3801FF]"
        />
        <MetricCard
          value={executive.resolvedIssues}
          label="Issues Resolved"
          className="bg-[#FFEDDA]"
          valueClassName="text-[#EEB373]"
        />
        <MetricCard
          value={`${executive.contribution}%`}
          label="Contribution"
          className="bg-[#E6FFF1]"
          valueClassName="text-[#43C17A]"
        />
      </div>
    </section>
  );
}
