"use client";

import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { ProjectCard, ProjectDetailsModal } from "./projectCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useUser } from "@/app/utils/context/UserContext";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { FaPlus } from "react-icons/fa6";
import { useRouter, useSearchParams } from "next/navigation";
import AddProjectForm from "./addProjectForm";
import { fetchEnrichedProjectsByFaculty } from "@/lib/helpers/projects/project";
import { ProjectCardProps } from "@/lib/projectTypes/project";
import ProjectCardShimmer from "./shimmers/projectCardshimmer";
import { motion } from "framer-motion";
import { CaretLeft } from "@phosphor-icons/react";
import StudentSubmissions from "./submissions";
import { decodeId, encodeId } from "@/app/utils/crypto";
import toast from "react-hot-toast";

import { useQuery } from "@tanstack/react-query";
import { Pagination } from "../../admin/academic-setup/components/pagination";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { fetchFacultyBranches, fetchFacultyYears } from "@/lib/helpers/faculty/facultyAPI";

type DropdownOption = {
  value: string | number;
  label: string;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const Page = () => {
  const [selectedProject, setSelectedProject] =
    useState<ProjectCardProps | null>(null);
  const { college_branch, collegeAcademicYear, faculty_edu_type, facultyId, loading: facultyLoading } =
    useFaculty();
  const { loading: userLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const projectId = useMemo(() => {
    const encryptedId = searchParams.get("projectId");
    const decoded = encryptedId ? decodeId(encryptedId) : null;
    return decoded;
  }, [searchParams]);

  const modalId = useMemo(() => {
    const rawModalId = searchParams.get("modalId");
    return rawModalId ? decodeId(rawModalId) : null;
  }, [searchParams]);

  const encryptedId = searchParams.get("projectId");
  const rawModalId = searchParams.get("modalId");

  const [activeTab, setActiveTab] = useState<ProjectTab>("active");

  type ProjectTab = "active" | "previous";

  const tabs = [
    { id: "active", label: "Active Projects" },
    { id: "previous", label: "Previous Projects" },
  ];

  // Filters State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [branch, setBranch] = useState<string>("All");
  const [year, setYear] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    const savedBranch = sessionStorage.getItem("projects_filter_branch");
    const savedYear = sessionStorage.getItem("projects_filter_year");
    const savedFrom = sessionStorage.getItem("projects_filter_from");
    const savedTo = sessionStorage.getItem("projects_filter_to");

    if (savedBranch) setBranch(savedBranch);
    if (savedYear) setYear(savedYear);
    if (savedFrom) setFromDate(savedFrom);
    if (savedTo) setToDate(savedTo);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("projects_filter_branch", branch);
    sessionStorage.setItem("projects_filter_year", year);
    sessionStorage.setItem("projects_filter_from", fromDate);
    sessionStorage.setItem("projects_filter_to", toDate);
  }, [branch, year, fromDate, toDate]);

  // Options State
  const [branchOptions, setBranchOptions] = useState<DropdownOption[]>([]);
  const [yearOptions, setYearOptions] = useState<DropdownOption[]>([]);

  const isSchool = isSchoolEducation(faculty_edu_type);
  const isInter = faculty_edu_type === "Inter" || faculty_edu_type === "BIEAP" || faculty_edu_type === "TSBIE";

  const contextLoading = facultyLoading || userLoading;

  const { data: branchesData, isLoading: isBranchesLoading } = useQuery({
    queryKey: ["projectsBranches", facultyId, isSchool],
    queryFn: async () => {
        if (isSchool) return { formattedBranches: [] };

        const branches = await fetchFacultyBranches(facultyId!);
        const formattedBranches = branches.map(b => ({ value: String(b.id), label: b.label || "" }));
        return { formattedBranches };
    },
    enabled: !!facultyId && !contextLoading,
    staleTime: 1000 * 60 * 5,
  });

  const { data: yearsData, isLoading: isYearsLoading, isError: isYearsError } = useQuery({
    queryKey: ["projectsYears", facultyId, isSchool, branch],
    queryFn: async () => {
        let years: any[] = [];

        if (!isSchool && branch !== "All") {
             years = await fetchFacultyYears(facultyId!, parseInt(branch));
        } else {
             years = await fetchFacultyYears(facultyId!);
        }

        const formattedYears = years.map(y => ({ value: String(y.id), label: y.label || "" }));
        return { formattedYears };
    },
    enabled: !!facultyId && !contextLoading,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (branchesData && branchesData.formattedBranches) {
        setBranchOptions(branchesData.formattedBranches);
        if (branchesData.formattedBranches.length > 0) {
          setBranch((prev) => {
            if (prev === "All" || !branchesData.formattedBranches.some((b: any) => b.value === prev)) {
              return branchesData.formattedBranches[0].value as string;
            }
            return prev;
          });
        }
    }
  }, [branchesData]);

  useEffect(() => {
    if (yearsData && yearsData.formattedYears) {
        setYearOptions(yearsData.formattedYears);
        if (yearsData.formattedYears.length > 0) {
          setYear((prev) => {
            // Auto-select first year if current year is not valid for the new list, or if it's "All"
            // This ensures when a branch is selected, its first year is immediately selected.
            if (prev === "All" || !yearsData.formattedYears.some((y: any) => y.value === prev)) {
              return yearsData.formattedYears[0].value as string;
            }
            return prev;
          });
        } else {
          setYear("All");
        }
    }
  }, [yearsData]);

  useEffect(() => {
    if (isYearsError) {
        toast.error("Failed to load year filters", { id: "filters-error" });
    }
  }, [isYearsError]);

  const filtersLoading = isBranchesLoading || isYearsLoading || contextLoading;
  
  const debouncedFromDate = useDebounce(fromDate, 800);
  const debouncedToDate = useDebounce(toDate, 800);

  const { data, isLoading: isQueryLoading, isError } = useQuery({
    queryKey: ["projects", facultyId, activeTab, page, limit, branch, year, debouncedFromDate, debouncedToDate],
    queryFn: async () => {
      if (!facultyId) return { data: [], total: 0 };
      const parsedBranch = branch !== "All" ? parseInt(branch) : undefined;
      const parsedYear = year !== "All" ? parseInt(year) : undefined;
      const parsedFromDate = debouncedFromDate || undefined;
      const parsedToDate = debouncedToDate || undefined;

      const res = await fetchEnrichedProjectsByFaculty(
        facultyId,
        undefined,
        page,
        limit,
        activeTab,
        parsedBranch,
        parsedYear,
        parsedFromDate,
        parsedToDate
      );
      return res;
    },
    enabled: !!facultyId && !contextLoading,
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });

  const isLoading = contextLoading || isQueryLoading;

  const projects = data?.data || [];
  const totalItems = data?.total || 0;

  const mappedProjects: ProjectCardProps[] = useMemo(() => {
    return projects.map((p: any) => {
      const isPast = p.endDate
        ? new Date(p.endDate).getTime() < new Date().getTime()
        : false;

      return {
        projectId: p.projectId,
        title: p.title,
        description: p.description ?? "",
        duration: p.duration,
        techStack: p.domain.join(", "),
        mentors: p.mentors,
        teamMembers: p.teamMembers,
        marks: p.marks ?? 0,
        fileUrls: p.fileUrls,
        status: isPast ? "previous" : "active",
      };
    });
  }, [projects]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load projects", { id: "projects-error" });
    }
  }, [isError]);

  useEffect(() => {
    setPage(1);
  }, [branch, year, fromDate, toDate]);

  const handledModalId = useRef<string | null>(null);

  useEffect(() => {
    if (!rawModalId) {
      handledModalId.current = null;
    }
  }, [rawModalId]);

  useEffect(() => {
    if (rawModalId && mappedProjects.length > 0 && handledModalId.current !== rawModalId) {
      const decodedModalId = decodeId(rawModalId);

      if (decodedModalId) {
        const projectToOpen = mappedProjects.find(
          (p) => String(p.projectId) === String(decodedModalId),
        );
        if (projectToOpen) {
          handledModalId.current = rawModalId;
          setSelectedProject(projectToOpen);
          
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.delete("modalId");
          const newUrl = newSearchParams.toString() 
             ? `${window.location.pathname}?${newSearchParams.toString()}` 
             : window.location.pathname;
             
          router.replace(newUrl, { scroll: false });
        }
      }
    }
  }, [rawModalId, mappedProjects, router, searchParams]);

  const handleAddProject = () => {
    router.push("?tab=new_project");
  };

  const handleViewSubmissions = (project: ProjectCardProps) => {
    setSelectedProject(null);
    const encryptedId = encodeId(String(project.projectId));
    const encryptedTitle = encodeURIComponent(project.title);

    const branchLabel = branchOptions.find((o) => o.value === branch)?.label || "";
    const yearLabel = yearOptions.find((o) => o.value === year)?.label || "";

    const queryParams = new URLSearchParams();
    queryParams.set("tab", "submissions");
    queryParams.set("projectId", encryptedId);
    queryParams.set("title", encryptedTitle);
    
    if (!isSchool && branchLabel && branchLabel !== "All") {
      queryParams.set("branchName", branchLabel);
    }
    if (yearLabel && yearLabel !== "All") {
      queryParams.set("yearName", yearLabel);
    }

    router.push(`?${queryParams.toString()}`);
  };

  if (tab === "new_project") {
    return (
      <AddProjectForm
        onCancel={() => router.back()}
        collegeAcademicYear={collegeAcademicYear}
        college_branch={college_branch}
        faculty_edu_type={faculty_edu_type}
      />
    );
  }

  if (tab === "submissions") {
    return (
      <main className="p-4">
        <button
          onClick={() => {
            if (projectId) {
              const encryptedModalId = encodeId(projectId);
              router.push(`?modalId=${encryptedModalId}`);
            } else {
              router.push(window.location.pathname);
            }
          }}
          className="mb-4 text-sm font-medium flex items-center gap-2 text-[#282828]"
        >
          <CaretLeft
            size={20}
            className="cursor-pointer active:scale-90 text-[#282828]"
          />
          Back to Details
        </button>

        <StudentSubmissions />
      </main>
    );
  }

  return (
    <main className="p-4 relative overflow-hidden flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex justify-between items-start mb-6 w-full">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 text-sm">
            Create, manage, and track student projects effortlessly.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleAddProject}
            className="bg-[#43C17A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 h-10 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <FaPlus /> Add Project
          </button>
        </div>
      </div>

      {/* Filter Row */}
      {contextLoading || isBranchesLoading || isYearsLoading ? (
        <div className="flex flex-col md:flex-row gap-4 mb-6 w-full items-start md:items-end">
          {!isSchool && <div className="flex-1 w-full h-[62px] bg-gray-200 animate-pulse rounded-md"></div>}
          <div className="flex-1 w-full h-[62px] bg-gray-200 animate-pulse rounded-md"></div>
          <div className="flex-1 min-w-[140px] h-[62px] bg-gray-200 animate-pulse rounded-md"></div>
          <div className="flex-1 min-w-[140px] h-[62px] bg-gray-200 animate-pulse rounded-md"></div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 mb-6 w-full items-start md:items-end">
          {!isSchool && (
            <div className="flex-1 w-full">
              <CustomDropdown
                label={isInter ? "Group" : "Branch"}
                options={branchOptions}
                value={branch}
                onChange={(val) => { setBranch(val as string); setPage(1); }}
                placeholder={filtersLoading ? "Loading..." : `Select ${isInter ? "Group" : "Branch"}`}
                disabled={filtersLoading || branchOptions.length <= 1}
              />
            </div>
          )}
        <div className="flex-1 w-full">
          <CustomDropdown
            label="Year"
            options={yearOptions}
            value={year}
            onChange={(val) => { setYear(val as string); setPage(1); }}
            placeholder={filtersLoading ? "Loading..." : "Select Year"}
            disabled={filtersLoading || yearOptions.length <= 1}
          />
        </div>
          <div className="flex-1 min-w-[140px] flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                const newFromDate = e.target.value;
                setFromDate(newFromDate);
                if (toDate && new Date(newFromDate) > new Date(toDate)) {
                  setToDate(""); // Reset toDate if it's before the new fromDate
                }
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm sm:text-sm h-[38px] text-[#282828] bg-white cursor-pointer"
            />
          </div>

          <div className="flex-1 min-w-[140px] flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                const newToDate = e.target.value;
                if (fromDate && new Date(newToDate) < new Date(fromDate)) {
                  toast.error("To Date cannot be before From Date", { id: "date-error" });
                  return;
                }
                setToDate(newToDate);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm sm:text-sm h-[38px] text-[#282828] bg-white cursor-pointer"
            />
          </div>
        </div>
      )}

      <div className="flex justify-center mb-6 w-full">
        <div className="relative flex items-center bg-gray-50 p-1.5 rounded-full border border-gray-100 max-w-full overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as ProjectTab); setPage(1); }}
              className={`relative px-6 py-2 text-sm font-semibold z-10 transition-colors ${
                activeTab === t.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-700 cursor-pointer"
              }`}
            >
              {t.label}
              {activeTab === t.id && (
                <motion.div
                  layoutId="project-pill"
                  className="absolute inset-0 rounded-full -z-10 shadow-[0_2px_8px_rgba(16,185,129,0.4)]"
                  style={{
                    background:
                      "linear-gradient(180deg, #34D399 0%, #10B981 100%)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProjectCardShimmer key={i} />
            ))}
          </div>
        ) : mappedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-lg font-semibold">No {activeTab} projects found</p>
            <p className="text-sm mt-1">
              {activeTab === "active"
                ? "Click 'Add Project' to get started!"
                : "Projects will appear here once they are completed."}
            </p>
          </div>
        ) : (
          <ProjectCard
            data={mappedProjects}
            onViewDetails={(project) => setSelectedProject(project)}
            role="Faculty"
          />
        )}
      </div>
      
      <div className="mt-1">
        <Pagination
            currentPage={page}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChange={(p) => setPage(p)}
            alwaysShow={true}
            roundedBottom="rounded-2xl"
        />
      </div>

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => {
            setSelectedProject(null);
            if (searchParams.get("modalId"))
              router.push(window.location.pathname);
          }}
          onViewSubmissions={handleViewSubmissions}
        />
      )}
    </main>
  );
};

const PageWithSuspense = () => (
  <Suspense
    fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-[26px] shadow-sm border border-gray-100 px-5 py-6 md:px-7 md:py-7 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded-full w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded-full w-5/6" />
              </div>
              <div className="h-9 w-24 bg-gray-200 rounded-full shrink-0" />
            </div>
            <div className="space-y-4 mt-5">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex gap-4 items-center">
                  <div className="h-4 bg-gray-200 rounded-full w-24 shrink-0" />
                  <div className="h-4 bg-gray-200 rounded-full w-40" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    }
  >
    <Page />
  </Suspense>
);

export default PageWithSuspense;
