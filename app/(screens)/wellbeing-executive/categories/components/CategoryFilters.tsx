"use client";

import { CaretDown } from "@phosphor-icons/react";
import type { IssueScope } from "../types";

function ScopeSelect({
  value,
  onChange,
}: {
  value: IssueScope;
  onChange: (scope: IssueScope) => void;
}) {
  return (
    <label className="relative flex h-8 min-w-27.5 items-center rounded-md bg-[#16284F] px-3 text-[12px] font-bold text-white">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as IssueScope)}
        className="h-full w-full cursor-pointer appearance-none bg-transparent pr-7 font-bold text-white outline-none"
      >
        <option className="text-[#16284F]" value="college">
          College
        </option>
        <option className="text-[#16284F]" value="hostel">
          Hostel
        </option>
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute right-3"
      />
    </label>
  );
}

function MonthPill() {
  return (
    <button className="flex h-8 items-center gap-2 rounded-full bg-[#43C17A] px-3 text-[12px] font-bold text-white">
      January
      <CaretDown size={14} weight="bold" />
    </button>
  );
}

function StudentFilterPill() {
  return (
    <button className="flex h-8 min-w-22.5 items-center justify-between gap-2 rounded-md bg-[#16284F] px-3 text-[12px] font-bold text-white">
      Student
      <CaretDown size={14} weight="bold" />
    </button>
  );
}

export default function CategoryFilters({
  scope,
  onScopeChange,
}: {
  scope: IssueScope;
  onScopeChange: (scope: IssueScope) => void;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#282828]">
        <span>Category :</span>
        <label className="relative flex h-8 min-w-[150px] items-center rounded border border-[#D7D7D7] bg-white px-3 text-[12px] font-bold text-[#282828]">
          <select className="h-full w-full cursor-pointer appearance-none bg-transparent pr-7 outline-none">
            <option>Infrastructure</option>
            <option>Sports</option>
            <option>Medical</option>
          </select>
          <CaretDown
            size={14}
            className="pointer-events-none absolute right-3"
            weight="bold"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <ScopeSelect value={scope} onChange={onScopeChange} />
        <StudentFilterPill />
        <MonthPill />
      </div>
    </div>
  );
}
