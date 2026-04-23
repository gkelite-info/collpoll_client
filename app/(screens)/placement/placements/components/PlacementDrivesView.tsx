"use client";

import { useMemo } from "react";
import {
  Briefcase,
  Buildings,
  CaretDown,
  CheckCircle,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { PlacementDrive, PlacementDriveStat } from "./mockData";

type PlacementDrivesViewProps = {
  stats: PlacementDriveStat[];
  drives: PlacementDrive[];
  // onCreateDrive is kept for easy restore when Create New Drive is enabled again.
  onCreateDrive?: () => void;
  onDriveClick: (driveId: number) => void;
};

export default function PlacementDrivesView({
  stats,
  drives,
  onDriveClick,
}: PlacementDrivesViewProps) {
  const columns = [
    { title: "Company Name", key: "companyName" },
    { title: "Drive Date", key: "date" },
    { title: "Branch", key: "branch" },
    { title: "All Students", key: "allStudents" },
    { title: "Action", key: "actions" },
  ];

  const tableData = useMemo(() => {
    return drives.map((drive) => ({
      companyName: drive.companyName,
      date: drive.date,
      branch: drive.branch,
      allStudents: drive.students.length,
      actions: (
        <button
          type="button"
          onClick={() => onDriveClick(drive.id)}
          className="cursor-pointer border-b border-[#00A94A] font-medium text-[#00A94A]"
        >
          View
        </button>
      ),
    }));
  }, [drives, onDriveClick]);

  const statIconStyles = [
    {
      icon: <Briefcase size={18} weight="fill" />,
      iconBg: "#FED7AA",
      iconColor: "#F97316",
    },
    {
      icon: <Buildings size={18} weight="fill" />,
      iconBg: "#A7F3D0",
      iconColor: "#059669",
    },
    {
      icon: <CheckCircle size={18} weight="fill" />,
      iconBg: "#BFDBFE",
      iconColor: "#2563EB",
    },
  ];

  return (
    <div className="space-y-4 mb-5">
      {/* Create New Drive button and query-routing functionality are commented out for now. */}
      {/* <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCreateDrive}
          disabled={isCreatingDrive}
          className="h-8 min-w-[132px] cursor-pointer rounded-lg bg-[#16284F] px-3 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isCreatingDrive ? "Loading..." : "Create New Drive"}
        </button>
      </div> */}

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <CardComponent
            key={stat.note}
            style={`w-full ${stat.cardClass}`}
            icon={statIconStyles[index]?.icon}
            value={
              <span className="text-[28px] font-semibold leading-none text-[#282828]">
                {stat.value}
              </span>
            }
            label={stat.note}
            iconBgColor={statIconStyles[index]?.iconBg ?? "#A7F3D0"}
            iconColor={statIconStyles[index]?.iconColor ?? "#059669"}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[14px] text-[#5C5C5C]">
        <div className="flex items-center gap-2">
          <span>Drive Status :</span>
          <button className="flex items-center gap-1 rounded-full bg-[#E8F8EF] px-3 py-1 text-[#43C17A]">
            Upcoming <CaretDown size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Education Type :</span>
          <button className="rounded-full bg-[#E8F8EF] px-3 py-1 text-[#43C17A]">
            B.Tech
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Branch :</span>
          <button className="rounded-full bg-[#E8F8EF] px-3 py-1 text-[#43C17A]">
            CSE
          </button>
        </div>
      </div>

      <TableComponent columns={columns} tableData={tableData} height="43vh" />
    </div>
  );
}
