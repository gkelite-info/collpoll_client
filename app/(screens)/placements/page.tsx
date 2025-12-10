"use client";

import { useMemo, useState } from "react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { JobInfoCard, JobInfoCardProps } from "./jobInfoCard";
import { PlacementFilterBar, PlacementFilterBarProps } from "./filterBar";
import AssignmentsRight from "./aside";

export const jobInfoCardData: JobInfoCardProps[] = [
  {
    companyName: "Infosys",
    role: "Software Engineer",
    appliedOn: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    statusLabel: "Applied",
    skills: ["Java", "Python", "Data Structures", "SQL"],
    description:
      "Work on designing, coding, and deploying enterprise-grade applications using modern frameworks.",
    jobType: "Full Time",
    location: "Hyderabad",
    ctc: "12 Lpa",
    interviewStatus: "Interview Scheduled",
    logoUrl: "https://logo.clearbit.com/infosys.com",
  },
  {
    companyName: "Google",
    role: "Software Engineer Intern",
    appliedOn: "12 Sep 2025",
    statusLabel: "Shortlisted",
    skills: ["Go", "Distributed Systems", "Algorithms", "Machine Learning"],
    description: "Build high-performance distributed systems at scale.",
    jobType: "Internship",
    location: "Bangalore",
    ctc: "80k / Month",
    interviewStatus: "Technical Round Scheduled",
    logoUrl: "https://logo.clearbit.com/google.com",
  },
  {
    companyName: "TCS",
    role: "Assistant System Engineer",
    appliedOn: "02 Nov 2025",
    statusLabel: "Applied",
    skills: ["Java", "OOP", "Spring Boot", "SQL"],
    description:
      "Work on enterprise application development for global clients.",
    jobType: "Full Time",
    location: "Pune",
    ctc: "7 Lpa",
    interviewStatus: "Pending Review",
    logoUrl: "https://logo.clearbit.com/tcs.com",
  },
  {
    companyName: "Deloitte",
    role: "Business Technology Analyst",
    appliedOn: "27 Oct 2025",
    statusLabel: "Applied",
    skills: ["Analytics", "SQL", "Cloud Basics", "Testing"],
    description:
      "Analyze business requirements and optimize digital workflows.",
    jobType: "Full Time",
    location: "Gurgaon",
    ctc: "10.5 Lpa",
    interviewStatus: "Aptitude Test Completed",
    logoUrl: "https://logo.clearbit.com/deloitte.com",
  },
  {
    companyName: "Accenture",
    role: "Application Development Associate",
    appliedOn: "14 Oct 2025",
    statusLabel: "Shortlisted",
    skills: ["Cloud", "Java", "React", "REST APIs"],
    description: "Develop scalable cloud-native applications.",
    jobType: "Full Time",
    location: "Chennai",
    ctc: "8.5 Lpa",
    interviewStatus: "HR Round Scheduled",
    logoUrl: "https://logo.clearbit.com/accenture.com",
  },
  {
    companyName: "Amazon",
    role: "SDE 1",
    appliedOn: "20 Oct 2025",
    statusLabel: "Applied",
    skills: ["Java", "AWS", "System Design", "DSA"],
    description:
      "Work on high-scale backend systems powering Amazon ecommerce.",
    jobType: "Full Time",
    location: "Bangalore",
    ctc: "22 Lpa",
    interviewStatus: "Online Assessment Sent",
    logoUrl: "https://logo.clearbit.com/amazon.com",
  },
];

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
    <main className="p-4">
      <section className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-black text-2xl font-semibold">Placements</h1>
          <p className="text-black">
            Track, Manage, and Maintain Student Placement Status
          </p>
        </div>

        <article className="flex justify-end w-[32%]">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <section className="flex">
        <section>
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

          <section className="mt-4 grid gap-4">
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
