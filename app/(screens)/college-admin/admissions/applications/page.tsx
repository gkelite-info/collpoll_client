"use client";

import { useState, useEffect, useMemo, ReactNode, Fragment } from "react";
import Link from "next/link";
import { CaretLeft, MagnifyingGlass, CaretDown, Check, FunnelSimple, Envelope, X, PaperPlane, Warning, Info, CheckCircle, Eye } from "@phosphor-icons/react";
import { Listbox, Transition } from "@headlessui/react";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { getAllApplications } from "@/lib/api/gkeliteApi";
import ApplicationViewModal from "./ApplicationViewModal";
import { downloadCSV } from "@/app/utils/downloadCSV";
import toast from "react-hot-toast";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type AppRecord = {
  id: string;
  applicationId: number;
  name: string;
  email: string;
  phone: string;
  course: string;
  date: string;
  rawDate: string;
  status: string;
  admissionStatus: string;
};

export default function ApplicationsPage() {
  const { collegeCode } = useUser();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [admissionStatusFilter, setAdmissionStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [liveData, setLiveData] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // --- Top Applications State ---
  const [activePrimaryTab, setActivePrimaryTab] = useState<"All" | "Top">(
    (searchParams.get("tab") as any) || "All"
  );
  const [activeLevelTab, setActiveLevelTab] = useState<"Inter" | "Degree" | "PG">(
    (searchParams.get("level") as any) || "Degree"
  );
  const [activeCourseTab, setActiveCourseTab] = useState<string>(
    searchParams.get("course") || "All"
  );

  const [topApplications, setTopApplications] = useState<any[]>([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmEmailOpen, setIsConfirmEmailOpen] = useState(false);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewApplicationId, setViewApplicationId] = useState<number | null>(null);

  const [pgRankLimit, setPgRankLimit] = useState<string>("");
  const debouncedPgRankLimit = useDebounce(pgRankLimit, 500);

  const [minGradePercent, setMinGradePercent] = useState<string>("92");
  const debouncedMinGradePercent = useDebounce(minGradePercent, 500);

  const [topCurrentPage, setTopCurrentPage] = useState(1);
  const [topItemsPerPage, setTopItemsPerPage] = useState(10);

  const hasActiveFilters = useMemo(() => {
    const isBaseFilterActive = search !== "" || dateFrom !== "" || dateTo !== "" || statusFilter !== "All" || admissionStatusFilter !== "All" || sortOrder !== "desc";
    if (activePrimaryTab === "All") {
      return isBaseFilterActive;
    } else {
      const isTopFilterActive = isBaseFilterActive;
      if (activeLevelTab === "PG") {
        return isTopFilterActive || pgRankLimit !== "";
      } else {
        return isTopFilterActive || (minGradePercent !== "92" && minGradePercent !== "");
      }
    }
  }, [search, dateFrom, dateTo, statusFilter, admissionStatusFilter, sortOrder, activePrimaryTab, activeLevelTab, pgRankLimit, minGradePercent]);

  const updateQueryParams = (params: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(params).forEach(([key, value]) => {
      if (value) current.set(key, value);
      else current.delete(key);
    });
    router.replace(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const handlePrimaryTabChange = (tab: "All" | "Top") => {
    setActivePrimaryTab(tab);
    updateQueryParams({ tab });
  };

  const handleLevelTabChange = (level: any) => {
    setActiveLevelTab(level);
    setActiveCourseTab("All");
    setSelectedIds(new Set());
    updateQueryParams({ level, course: "All" });
  };

  const handleCourseTabChange = (course: string) => {
    setActiveCourseTab(course);
    setSelectedIds(new Set());
    updateQueryParams({ course });
  };

  const getCoursesForLevel = (level: string) => {
    switch (level) {
      case "Inter": return ["All", "CEC", "MEC", "ACE"];
      case "Degree": return ["All", "B.Com", "BBA"];
      case "PG": return ["All", "MBA"];
      default: return ["All"];
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearch(searchParam);
    }
  }, []);

  useEffect(() => {
    const levelParam = searchParams.get("level");
    if (!levelParam && collegeCode) {
      const code = collegeCode.toLowerCase();
      if (code.includes("bcpgc")) {
        handleLevelTabChange("PG");
      } else if (code.includes("bcca")) {
        handleLevelTabChange("Degree");
      } else if (code.includes("bjcg")) {
        handleLevelTabChange("Inter");
      }
    }
  }, [collegeCode, searchParams]);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const data = await getAllApplications(statusFilter, collegeCode || null, sortOrder);

      if (data) {
        const formatted = data.map(app => {
          const dateObj = new Date(app.createdAt);
          return {
            id: app.applicationNumber || `APP-${app.applicationId}`,
            applicationId: app.applicationId,
            name: `${app.firstName} ${app.lastName}`,
            email: app.emailId || '',
            phone: app.contactNo || '',
            course: app.course,
            date: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(dateObj) + ", " + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            rawDate: app.createdAt,
            status: app.computedStatus || "Pending",
            admissionStatus: app.admissionStatus || "Pending"
          };
        });
        setLiveData(formatted);
      }
      setLoading(false);
    };

    fetchApplications();
  }, [statusFilter, collegeCode, sortOrder, refreshTrigger]);

  // Fetch Top Applications when Top tab is active
  useEffect(() => {
    if (activePrimaryTab === "Top") {
      const fetchTop = async () => {
        setLoadingTop(true);
        // We need to import getTopApplications, let's make sure it's in the import list at the top.
        const { getTopApplications } = await import("@/lib/api/gkeliteApi");

        // Parse debounced values, default to null if empty
        const parsedRank = debouncedPgRankLimit ? Number(debouncedPgRankLimit) : null;
        const parsedGrade = debouncedMinGradePercent ? Number(debouncedMinGradePercent) : null;

        const data = await getTopApplications(activeLevelTab, activeCourseTab, collegeCode || null, parsedRank, parsedGrade);
        setTopApplications(data);
        setLoadingTop(false);
      };
      fetchTop();
    }
  }, [activePrimaryTab, activeLevelTab, activeCourseTab, collegeCode, debouncedPgRankLimit, debouncedMinGradePercent, refreshTrigger]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === topApplications.length) {
      setSelectedIds(newSet => new Set());
    } else {
      setSelectedIds(new Set(topApplications.map(t => t.applicationNumber || `APP-${t.applicationId}`)));
    }
  };

  const filteredData = useMemo(() => {
    let data = liveData;

    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      data = data.filter(item =>
        item.name.toLowerCase().includes(lowerSearch) ||
        item.email.toLowerCase().includes(lowerSearch) ||
        item.phone.toLowerCase().includes(lowerSearch) ||
        item.id.toLowerCase().includes(lowerSearch)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      data = data.filter(item => new Date(item.rawDate).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      data = data.filter(item => new Date(item.rawDate).getTime() <= to + 86400000);
    }

    if (admissionStatusFilter !== "All") {
      data = data.filter(item => {
        const itemStatus = item.admissionStatus || "Pending";
        return itemStatus === admissionStatusFilter;
      });
    }

    return data;
  }, [liveData, debouncedSearch, dateFrom, dateTo, admissionStatusFilter]);

  const filteredTopData = useMemo(() => {
    let data = topApplications;

    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      data = data.filter(item =>
        `${item.firstName} ${item.lastName}`.toLowerCase().includes(lowerSearch) ||
        (item.emailId || '').toLowerCase().includes(lowerSearch) ||
        (item.contactNo || '').toLowerCase().includes(lowerSearch) ||
        (item.applicationNumber || `APP-${item.applicationId}`).toLowerCase().includes(lowerSearch)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      data = data.filter(item => new Date(item.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      data = data.filter(item => new Date(item.createdAt).getTime() <= to + 86400000);
    }

    if (statusFilter !== "All") {
      data = data.filter(item => item.computedStatus === statusFilter);
    }

    if (admissionStatusFilter !== "All") {
      data = data.filter(item => {
        const itemStatus = item.admissionStatus || "Pending";
        return itemStatus === admissionStatusFilter;
      });
    }

    if (sortOrder === "desc") {
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return data;
  }, [topApplications, debouncedSearch, dateFrom, dateTo, statusFilter, admissionStatusFilter, sortOrder, activeLevelTab, pgRankLimit, minGradePercent]);

  const totalItems = filteredData.length;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalTopItems = filteredTopData.length;
  const paginatedTopData = useMemo(() => {
    const startIndex = (topCurrentPage - 1) * topItemsPerPage;
    return filteredTopData.slice(startIndex, startIndex + topItemsPerPage);
  }, [filteredTopData, topCurrentPage, topItemsPerPage]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvData = paginatedData.map(item => ({
        "Application ID": item.id,
        "Applicant Name": item.name,
        "Email": item.email,
        "Phone": item.phone,
        "Course": item.course,
        "Date": item.date,
        "Status": item.status
      }));

      downloadCSV(csvData, `Applications_Page_${currentPage}`);
    } catch (err) {
      toast.error("Export failed", { id: "export-error" });
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setTopCurrentPage(1);
  }, [debouncedSearch, dateFrom, dateTo, statusFilter, pgRankLimit, minGradePercent, sortOrder]);

  const columns = [
    { title: "Application ID", key: "id" },
    { title: "Applicant Name", key: "name" },
    { title: "Course", key: "course" },
    { title: "Contact", key: "contact" },
    { title: "Date", key: "date" },
    { title: "Payment Status", key: "status" },
    { title: "Admission Status", key: "admissionStatus" },
    { title: "Action", key: "action" },
  ];

  const topColumns = [
    {
      title: (
        <input
          type="checkbox"
          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          checked={topApplications.length > 0 && selectedIds.size === topApplications.length}
          onChange={toggleAll}
        />
      ),
      key: "select",
      width: "50px"
    },
    { title: "Application ID", key: "id" },
    { title: "Rank", key: "rank" },
    { title: "Applicant Name", key: "name" },
    { title: "Course", key: "course" },
    { title: "Contact", key: "contact" },
    { title: "Score/Rank", key: "score" },
    { title: "Applied On", key: "date" },
    { title: "Payment Status", key: "paymentStatus" },
    { title: "Admission Status", key: "admissionStatus" },
    { title: "Action", key: "action" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full whitespace-nowrap">Pending</span>;
      case "Success":
        return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full whitespace-nowrap">Success</span>;
      case "Failed":
        return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full whitespace-nowrap">Failed</span>;
      case "Reviewed":
        return <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">Reviewed</span>;
      case "Approved":
        return <span className="px-2.5 py-1 text-xs font-medium bg-teal-100 text-teal-700 rounded-full whitespace-nowrap">Approved</span>;
      case "Rejected":
        return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full whitespace-nowrap">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">{status}</span>;
    }
  };

  const getAdmissionStatusBadge = (status: string) => {
    const s = status || "Pending";
    switch (s) {
      case "Selected":
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0"></span>
            <span className="text-xs font-semibold text-green-700">Selected</span>
          </div>
        );
      case "Verification":
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <span className="text-xs font-semibold text-amber-700">Verification</span>
          </div>
        );
      case "Regret":
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0"></span>
            <span className="text-xs font-semibold text-red-700">Regret</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-400 shrink-0"></span>
            <span className="text-xs font-semibold text-gray-500">{s}</span>
          </div>
        );
    }
  };

  const tableData: Record<string, ReactNode>[] = paginatedData.map(item => ({
    id: <span className="font-mono text-sm text-gray-600">{item.id}</span>,
    name: <span className="font-semibold text-gray-800">{item.name}</span>,
    course: item.course,
    contact: (
      <div className="flex flex-col">
        <span className="text-sm">{item.email}</span>
        <span className="text-xs text-gray-500">{item.phone}</span>
      </div>
    ),
    date: <span className="text-sm text-gray-600">{item.date}</span>,
    status: getStatusBadge(item.status),
    admissionStatus: getAdmissionStatusBadge(item.admissionStatus),
    action: (
      <button
        onClick={() => {
          setViewApplicationId(item.applicationId);
          setIsViewModalOpen(true);
        }}
        className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
        title="View Application"
      >
        <Eye size={18} weight="bold" />
      </button>
    ),
  }));

  const topTableData: Record<string, ReactNode>[] = paginatedTopData.map((item, idx) => {
    const id = item.applicationNumber || `APP-${item.applicationId}`;
    const dateObj = new Date(item.createdAt);
    const globalRank = (topCurrentPage - 1) * topItemsPerPage + idx + 1;

    return {
      select: (
        <input
          type="checkbox"
          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          checked={selectedIds.has(id)}
          onChange={() => toggleSelection(id)}
        />
      ),
      id: <span className="font-mono text-sm text-gray-600">{id}</span>,
      rank: <span className="font-bold text-gray-700">#{globalRank}</span>,
      name: <span className="font-semibold text-gray-800">{item.firstName} {item.lastName}</span>,
      course: item.course,
      contact: (
        <div className="flex flex-col">
          <span className="text-sm">{item.emailId || ''}</span>
          <span className="text-xs text-gray-500">{item.contactNo || ''}</span>
        </div>
      ),
      score: (
        <div className="flex flex-col">
          {activeLevelTab === "PG" && item.computedRank !== 9999999 ? (
            <span className="text-sm font-semibold text-purple-700">Rank: {item.computedRank}</span>
          ) : (
            <span className="text-sm font-semibold text-blue-700">{item.computedScore > 0 ? `${item.computedScore}%` : 'N/A'}</span>
          )}
        </div>
      ),
      date: <span className="text-sm text-gray-600">{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(dateObj)}</span>,
      paymentStatus: getStatusBadge(item.computedStatus || "Pending"),
      admissionStatus: getAdmissionStatusBadge(item.admissionStatus),
      action: (
        <button
          onClick={() => {
            setViewApplicationId(item.applicationId);
            setIsViewModalOpen(true);
          }}
          className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
          title="View Application"
        >
          <Eye size={18} weight="bold" />
        </button>
      ),
    };
  });

  return (
    <div className="flex-1 w-full min-h-[90vh] p-2 overflow-y-auto pb-7">
      <div className=" space-y-6">
        <div>
          <Link href="/college-admin/admissions" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mb-4">
            <CaretLeft size={16} weight="bold" className="mr-1" /> Back to Admissions
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Applications</h1>
              <p className="text-gray-500 mt-1">Manage and view form submissions from the website.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Primary Toggle */}
              {activePrimaryTab === "All" && (
                <button
                  onClick={handleExportCSV}
                  disabled={isExporting || paginatedData.length === 0}
                  className="w-full sm:w-auto px-4 py-2 cursor-pointer bg-blue-600 border border-gray-200 text-white rounded-lg shadow-sm hover:bg-blue-700 font-medium text-sm transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : "Export CSV"}
                </button>
              )}
              <div className="flex bg-gray-200 p-1 rounded-xl shadow-inner gap-1 self-stretch sm:self-auto">
                <button
                  onClick={() => handlePrimaryTabChange("All")}
                  className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center gap-2 flex-1 sm:flex-none ${activePrimaryTab === "All"
                    ? "text-white shadow-md transform scale-[1.02]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-300/50"
                    }`}
                >
                  {activePrimaryTab === "All" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6C20CA] to-[#8C3BEA] -z-10 rounded-lg"></div>
                  )}
                  <span className="z-10">All Applications</span>
                </button>
                <button
                  onClick={() => handlePrimaryTabChange("Top")}
                  className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center gap-2 flex-1 sm:flex-none ${activePrimaryTab === "Top"
                    ? "text-white shadow-md transform scale-[1.02]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-300/50"
                    }`}
                >
                  {activePrimaryTab === "Top" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6C20CA] to-[#8C3BEA] -z-10 rounded-lg"></div>
                  )}
                  <span className="z-10">Top Applications</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {activePrimaryTab === "Top" && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 w-full">
            <div className="flex border-b border-gray-200">
              {["Inter", "Degree", "PG"].map((level) => (
                <button
                  key={level}
                  onClick={() => handleLevelTabChange(level)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeLevelTab === level ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {getCoursesForLevel(activeLevelTab).map((course) => (
                <button
                  key={course}
                  onClick={() => handleCourseTabChange(course)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${activeCourseTab === course ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}
                >
                  {course}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:flex-wrap gap-4 items-start md:items-center justify-start w-full relative z-10">

          {/* Search */}
          <div className="relative w-full md:w-auto md:flex-1 min-w-0 md:min-w-[200px] shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 cursor-text"
            />
          </div>

          {/* Sort */}
          {activePrimaryTab === "All" && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-medium text-gray-700">Sort:</span>
              <button
                onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                className="p-2 rounded-lg border transition-colors flex items-center justify-center bg-white border-gray-300 text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                title={sortOrder === "desc" ? "Sort Oldest First" : "Sort Newest First"}
              >
                <FunnelSimple size={20} weight="bold" className={`transition-transform duration-300 ${sortOrder === "asc" ? "rotate-180 text-blue-600" : "text-gray-600"}`} />
              </button>
            </div>
          )}

          {/* From Date */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 w-32 sm:w-36 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer text-gray-700"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 w-32 sm:w-36 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer text-gray-700"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 z-10 relative justify-between sm:justify-start">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Payment Status:</label>
            <div className="relative w-full sm:w-36">
              <Listbox value={statusFilter} onChange={setStatusFilter}>
                {({ open }) => (
                  <>
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm">
                      <span className="block truncate text-gray-700">{statusFilter}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                        <CaretDown
                          size={16}
                          weight="bold"
                          className={`transition-transform duration-200 ${open ? "rotate-180 text-green-500" : ""}`}
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                        {["All", "Success", "Pending", "Failed"].map((status) => (
                          <Listbox.Option
                            key={status}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-green-50 text-green-900" : "text-gray-900"
                              }`
                            }
                            value={status}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${selected ? "font-medium text-green-700" : "font-normal"
                                    }`}
                                >
                                  {status}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                    <Check size={16} weight="bold" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </>
                )}
              </Listbox>
            </div>
          </div>

          {/* Admission Status */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 z-10 relative justify-between sm:justify-start">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Admission Status:</label>
            <div className="relative w-full sm:w-36">
              <Listbox value={admissionStatusFilter} onChange={setAdmissionStatusFilter}>
                {({ open }) => (
                  <>
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm">
                      <span className="block truncate font-semibold text-gray-900">
                        {admissionStatusFilter}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                        <CaretDown
                          size={16}
                          weight="bold"
                          className={`transition-transform duration-200 ${open ? "rotate-180 text-green-500" : ""}`}
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                        {["All", "Pending", "Selected", "Verification", "Regret"].map((status) => (
                          <Listbox.Option
                            key={status}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-green-50 text-green-900" : "text-gray-900"}`
                            }
                            value={status}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? "font-bold text-blue-600" : "font-medium text-gray-700 group-hover:text-gray-900"}`}>
                                  {status}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                    <Check size={16} weight="bold" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </>
                )}
              </Listbox>
            </div>
          </div>

          {/* Top Candidates Limits */}
          {activePrimaryTab === "Top" && (
            <div className="flex items-center gap-2 md:border-l border-gray-300 md:pl-4 shrink-0 w-full md:w-auto justify-between md:justify-start">
              {activeLevelTab === "PG" ? (
                <div className="flex items-center gap-2 w-full justify-between sm:justify-start">
                  <label className="text-sm font-medium text-gray-700">Max Rank:</label>
                  <input
                    type="text"
                    placeholder="e.g. 500"
                    value={pgRankLimit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setPgRankLimit(val);
                    }}
                    className="w-20 px-2 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-semibold placeholder-gray-400 cursor-text"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full justify-between sm:justify-start">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Min Grade (%):</label>
                  <input
                    type="text"
                    placeholder="e.g. 92"
                    value={minGradePercent}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val) {
                        const num = Number(val);
                        if (num > 100) {
                          setMinGradePercent("100");
                          return;
                        }
                      }
                      setMinGradePercent(val);
                    }}
                    className="w-20 px-2 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 font-semibold placeholder-gray-400 cursor-text"
                  />
                </div>
              )}
            </div>
          )}

          {/* Clear Filters (pushed to end) */}
          <div className="md:ml-auto w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 mt-2 md:mt-0">
            {activePrimaryTab === "Top" && (
              <button
                disabled={selectedIds.size === 0}
                onClick={() => setIsConfirmEmailOpen(true)}
                className="w-full sm:w-auto px-4 py-2 cursor-pointer bg-indigo-600 border border-indigo-700 text-white rounded-lg shadow-sm hover:bg-indigo-700 font-medium text-sm transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Send Mail ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => {
                setSearch("");
                setDateFrom("");
                setDateTo("");
                setStatusFilter("All");
                setAdmissionStatusFilter("All");
                setSortOrder("desc");
                setPgRankLimit("");
                setMinGradePercent("92");
              }}
              disabled={!hasActiveFilters}
              className={`text-sm px-4 py-2 w-full sm:w-auto font-medium whitespace-nowrap shrink-0 border transition-colors rounded-lg ${hasActiveFilters
                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 cursor-pointer"
                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                }`}
            >
              Clear Filters
            </button>
          </div>

        </div>

        <div className="rounded-md flex flex-col overflow-hidden w-full -mt-3">
          <div className="overflow-x-auto w-full custom-scrollbar min-h-[300px]">
            {activePrimaryTab === "All" ? (
              <TableComponent
                columns={columns}
                tableData={tableData}
                isLoading={loading}
              />
            ) : (
              <TableComponent
                columns={topColumns}
                tableData={topTableData}
                isLoading={loadingTop}
              />
            )}
          </div>

          {activePrimaryTab === "All" && totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              roundedBottom="rounded-b-xl"
              itemsPerPageOptions={[10, 20, 50, 100]}
              onItemsPerPageChange={(items) => {
                setItemsPerPage(items);
                setCurrentPage(1);
              }}
              disabled={loading}
            />
          )}

          {activePrimaryTab === "Top" && totalTopItems > 0 && (
            <Pagination
              currentPage={topCurrentPage}
              totalItems={totalTopItems}
              itemsPerPage={topItemsPerPage}
              onPageChange={setTopCurrentPage}
              roundedBottom="rounded-b-xl"
              itemsPerPageOptions={[10, 20, 50, 100]}
              onItemsPerPageChange={(items) => {
                setTopItemsPerPage(items);
                setTopCurrentPage(1);
              }}
              disabled={loadingTop}
            />
          )}
        </div>

      </div>

      <SendEmailTemplateModal
        isOpen={isConfirmEmailOpen}
        onClose={() => setIsConfirmEmailOpen(false)}
        selectedIds={selectedIds}
        topApplications={topApplications}
        onSuccess={() => {
          setIsConfirmEmailOpen(false);
          setSelectedIds(new Set());
          setRefreshTrigger(prev => prev + 1);
        }}
      />

      <ApplicationViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewApplicationId(null);
        }}
        applicationId={viewApplicationId}
      />
    </div>
  );
}

interface SendEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: Set<string>;
  topApplications: any[];
  onSuccess: () => void;
}

function SendEmailTemplateModal({
  isOpen,
  onClose,
  selectedIds,
  topApplications,
  onSuccess,
}: SendEmailTemplateModalProps) {
  const [templateType, setTemplateType] = useState<"congratulate" | "verification" | "regret">("verification");
  const [isSending, setIsSending] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  useEffect(() => {
    setConfirmCheckbox(false);
  }, [isOpen, templateType]);

  const selectedApplicants = useMemo(() => {
    return topApplications.filter((app) => {
      const id = app.applicationNumber || `APP-${app.applicationId}`;
      return selectedIds.has(id);
    });
  }, [topApplications, selectedIds]);

  const canSendVerification = useMemo(() => {
    return selectedApplicants.every((app) => app.computedStatus === "Success" && app.admissionStatus !== "Verification");
  }, [selectedApplicants]);

  const canSendSelection = useMemo(() => {
    return selectedApplicants.every((app) => app.admissionStatus === "Verification");
  }, [selectedApplicants]);

  const handleSend = async () => {
    if (!confirmCheckbox) {
      toast.error("Please confirm before sending emails.");
      return;
    }

    if (templateType === "verification" && !canSendVerification) {
      toast.error("Verification emails can only be sent to students with successful payment status.");
      return;
    }

    if (templateType === "congratulate" && !canSendSelection) {
      toast.error("Selection emails can only be sent to students whose certificates have been verified.");
      return;
    }

    setIsSending(true);
    const recipients = selectedApplicants.map((app) => ({
      applicationId: app.applicationId,
      emailId: app.emailId || "",
      firstName: app.firstName || "",
      lastName: app.lastName || "",
      applicationNumber: app.applicationNumber || `APP-${app.applicationId}`,
      course: app.course || "",
      applicationFor: app.applicationFor || "",
      createdAt: app.createdAt || "",
    }));

    try {
      const response = await fetch("/api/emails/send-admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, templateType }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Successfully sent emails to ${recipients.length} student(s)!`);
        onSuccess();
      } else {
        toast.error(data.error || "Failed to send emails.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("An error occurred while sending emails.");
    } finally {
      setIsSending(false);
    }
  };

  const previewData = useMemo(() => {
    switch (templateType) {
      case "congratulate":
        return {
          subject: "Admission Selection Offer - APP-XXXXXX",
          body: "Dear Student,\n\nCongratulations! We are pleased to inform you that you have been selected for admission at Badruka Group. We were highly impressed by your academic record and qualifications...\n\nBest regards,\nAdmissions Office",
        };
      case "verification":
        const nextWeek = new Date();
        let added = 0;
        while (added < 7) {
          nextWeek.setDate(nextWeek.getDate() + 1);
          if (nextWeek.getDay() !== 0) added++; // Skip Sundays
        }
        const formattedDate = `${String(nextWeek.getDate()).padStart(2, "0")}-${nextWeek.toLocaleString("en-US", { month: "short" })}-${nextWeek.getFullYear()}`;
        return {
          subject: "Certificate Verification Schedule - APP-XXXXXX",
          body: `Dear Student,\n\nWe have reviewed your application and would like to invite you for the physical verification of your certificates and documents as part of the admission process...\n\nPlease visit the campus between 10:00 AM and 4:00 PM on any working day (Monday to Saturday) on or before ${formattedDate}.\n\nBest regards,\nAdmissions Office`,
        };
      case "regret":
        return {
          subject: "Admission Application Status Update - APP-XXXXXX",
          body: "Dear Student,\n\nThank you for your interest in Badruka Group. We have carefully reviewed your application. We regret to inform you that we are unable to offer you admission at this time...\n\nBest regards,\nAdmissions Office",
        };
    }
  }, [templateType]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSending ? onClose : undefined}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-2xl w-full max-w-[650px] p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Envelope size={24} className="text-indigo-600" /> Send Admission Emails
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Select a template to send to the <span className="font-semibold text-gray-800">{selectedApplicants.length}</span> selected student(s).
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isSending}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Template Picker */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Template Option</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-0.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setTemplateType("verification")}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer h-full ${templateType === "verification"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <div className="p-1.5 bg-yellow-100 text-yellow-700 rounded-lg w-fit mb-2">
                      <Info size={18} weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Certificate Verification</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">
                        Invite students to report for document verification.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateType("congratulate")}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer h-full ${templateType === "congratulate"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <div className="p-1.5 bg-green-100 text-green-700 rounded-lg w-fit mb-2">
                      <CheckCircle size={18} weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Selection Congratulation</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">
                        Congratulate students on their selection for admissions.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateType("regret")}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer h-full ${templateType === "regret"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <div className="p-1.5 bg-red-100 text-red-700 rounded-lg w-fit mb-2">
                      <Warning size={18} weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Admission Regret</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">
                        Inform candidates that they were not placed/selected.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {templateType === "verification" && !canSendVerification && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs leading-normal">
                  <Warning size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-amber-900">Verification Restriction:</strong> Some selected students do not have a successful payment status or have already been verification called. You can only call students with successful payments (Payment Status must be "Success") and whose admission status is not "Verification".
                  </div>
                </div>
              )}

              {templateType === "congratulate" && !canSendSelection && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs leading-normal">
                  <Warning size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-amber-900">Verification Restriction:</strong> Some of the selected students have not completed certificate verification yet. You can only select students whose admission status is "Verification".
                  </div>
                </div>
              )}

              {/* Preview Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Template Preview</span>
                  <span className="text-[10px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded font-medium">Badruka Layout</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600"><strong className="text-gray-800">Subject:</strong> {previewData.subject}</p>
                  <p className="text-xs text-gray-600"><strong className="text-gray-800">From:</strong> Badruka Admissions &lt;admissions@gkeliteinfo.com&gt;</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-gray-600 h-36 overflow-y-auto font-sans leading-relaxed whitespace-pre-line">
                  {previewData.body}
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-3 p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl">
                <input
                  type="checkbox"
                  id="confirm-send-emails"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  disabled={
                    (templateType === "verification" && !canSendVerification) ||
                    (templateType === "congratulate" && !canSendSelection)
                  }
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="confirm-send-emails" className="text-xs text-gray-600 select-none cursor-pointer leading-normal">
                  I confirm that I want to send this template email to all <strong className="text-indigo-700">{selectedApplicants.length} selected candidate(s)</strong>. I understand this action cannot be undone.
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="flex-1 px-4 py-2.5 text-xs text-gray-700 font-semibold bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={
                  isSending ||
                  !confirmCheckbox ||
                  (templateType === "verification" && !canSendVerification) ||
                  (templateType === "congratulate" && !canSendSelection)
                }
                className="flex-1 flex disabled:cursor-not-allowed items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperPlane size={16} className="mr-1.5" /> Send Emails
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
