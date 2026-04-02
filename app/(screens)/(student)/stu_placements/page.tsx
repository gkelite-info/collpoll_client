"use client";

import { useMemo, useState } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { JobInfoCard, JobInfoCardProps } from "./jobInfoCard";
import { PlacementFilterBar, PlacementFilterBarProps } from "./filterBar";
import AssignmentsRight from "./aside";
import { jobInfoCardData } from "./jobData";
import WipOverlay from "@/app/utils/WipOverlay";

type JobWithState = JobInfoCardProps & {
  id: number;
  isApplied: boolean;
  isEligible: boolean;
};

type TabType = "opportunities" | "applications";

const parseDate = (s: string) => new Date(s);

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>("opportunities");

  const [jobs, setJobs] = useState<JobWithState[]>(() =>
    jobInfoCardData.map((job, index) => ({
      ...job,
      id: index,
      isApplied: false,
      isEligible: index % 2 === 0,
    }))
  );

  const [cycle, setCycle] = useState<string>("2025");
  const [eligibility, setEligibility] =
    useState<PlacementFilterBarProps["eligibility"]>("All");
  const [sortBy, setSortBy] =
    useState<PlacementFilterBarProps["sortBy"]>("Recently Uploaded");

  const handleApply = (id: number) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === id
          ? { ...job, isApplied: true, statusLabel: "Applied" }
          : job
      )
    );
  };

  const visibleJobs = useMemo(() => {
    let list = [...jobs];

    if (activeTab === "applications") {
      list = list.filter((job) => job.isApplied);
    }

    if (cycle) {
      list = list.filter((job) => job.appliedOn.includes(cycle));
    }

    if (eligibility === "Eligible") {
      list = list.filter((job) => job.isEligible);
    } else if (eligibility === "Not Eligible") {
      list = list.filter((job) => !job.isEligible);
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case "Recently Uploaded":
          return (
            parseDate(b.appliedOn).getTime() - parseDate(a.appliedOn).getTime()
          );
        case "Oldest First":
          return (
            parseDate(a.appliedOn).getTime() - parseDate(b.appliedOn).getTime()
          );
        case "Company Name":
          return a.companyName.localeCompare(b.companyName);
        default:
          return 0;
      }
    });

    return list;
  }, [jobs, activeTab, cycle, eligibility, sortBy]);

  return (
    <main className="p-2 bg-red-00">
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-2xl font-semibold">Placements</h1>
          <p className="text-black text-sm">
            Track, Manage, and Maintain Student Placement Status
          </p>
        </div>

        <article className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <section className="bg-blue-00 flex justify-between">
        <section className="bg-yellow-00 relative overflow-hidden w-[68%]">
          <WipOverlay fullHeight={true}/>
          <PlacementFilterBar
            cycle={cycle}
            eligibility={eligibility}
            sortBy={sortBy}
            onCycleChange={setCycle}
            onEligibilityChange={setEligibility}
            onSortChange={setSortBy}
          />

          <div className="mt-2 flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("opportunities")}
              className={
                activeTab === "opportunities"
                  ? "text-[#43C17A] font-medium"
                  : "text-black"
              }
            >
              Opportunities /
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("applications")}
              className={
                activeTab === "applications"
                  ? "text-[#43C17A] font-medium"
                  : "text-black"
              }
            >
              My Applications
            </button>
          </div>

          <section className="mt-4 grid gap-4 bg-blue-00">
            {visibleJobs.length === 0 && activeTab === "applications" ? (
              <p className="text-sm text-gray-500">
                You have not applied to any opportunities yet.
              </p>
            ) : (
              visibleJobs.map((card) => (
                <JobInfoCard
                  key={card.id}
                  {...card}
                  showApplyButton={activeTab === "opportunities"}
                  isApplied={card.isApplied}
                  onApply={() => handleApply(card.id)}
                />
              ))
            )}
          </section>
        </section>

        <AssignmentsRight />
      </section>
    </main>
  );
}
