"use client";

import { useState, useEffect, useMemo, ReactNode, Fragment } from "react";
import Link from "next/link";
import { CaretLeft, MagnifyingGlass, CaretDown, Check } from "@phosphor-icons/react";
import { Listbox, Transition } from "@headlessui/react";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { getAllApplications } from "@/lib/api/gkeliteApi";
import { downloadCSV } from "@/app/utils/downloadCSV";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

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
  name: string;
  email: string;
  phone: string;
  course: string;
  date: string;
  rawDate: string;
  status: string;
};

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [liveData, setLiveData] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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
      case "Inter": return ["All", "MPC", "MEC", "CEC", "BiPC"];
      case "Degree": return ["All", "BSC", "B.Com", "BA", "BBA"];
      case "PG": return ["All", "MBA", "MCA", "M.Tech"];
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
    const fetchApplications = async () => {
      setLoading(true);
      const data = await getAllApplications(statusFilter);

      if (data) {
        const formatted = data.map(app => {
          const dateObj = new Date(app.createdAt);
          return {
            id: app.applicationNumber || `APP-${app.applicationId}`,
            name: `${app.firstName} ${app.lastName}`,
            email: app.emailId || '',
            phone: app.contactNo || '',
            course: app.course,
            date: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(dateObj) + ", " + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            rawDate: app.createdAt,
            status: app.computedStatus || "Pending"
          };
        });
        setLiveData(formatted);
      }
      setLoading(false);
    };

    fetchApplications();
  }, [statusFilter]);

  // Fetch Top Applications when Top tab is active
  useEffect(() => {
    if (activePrimaryTab === "Top") {
      const fetchTop = async () => {
        setLoadingTop(true);
        // We need to import getTopApplications, let's make sure it's in the import list at the top.
        const { getTopApplications } = await import("@/lib/api/gkeliteApi");
        const data = await getTopApplications(activeLevelTab, activeCourseTab);
        setTopApplications(data);
        setLoadingTop(false);
      };
      fetchTop();
    }
  }, [activePrimaryTab, activeLevelTab, activeCourseTab]);

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
    
    return data;
  }, [liveData, debouncedSearch, dateFrom, dateTo]);

  const totalItems = filteredData.length;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

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
  }, [debouncedSearch, dateFrom, dateTo]);

  const columns = [
    { title: "Application ID", key: "id" },
    { title: "Applicant Name", key: "name" },
    { title: "Course", key: "course" },
    { title: "Contact", key: "contact" },
    { title: "Date", key: "date" },
    { title: "Status", key: "status" },
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
    { title: "Rank", key: "rank" },
    { title: "Applicant Name", key: "name" },
    { title: "Course", key: "course" },
    { title: "Score/Rank", key: "score" },
    { title: "Applied On", key: "date" },
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
  }));

  const topTableData: Record<string, ReactNode>[] = topApplications.map((item, idx) => {
    const id = item.applicationNumber || `APP-${item.applicationId}`;
    const dateObj = new Date(item.createdAt);
    return {
      select: (
        <input 
          type="checkbox" 
          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          checked={selectedIds.has(id)}
          onChange={() => toggleSelection(id)}
        />
      ),
      rank: <span className="font-bold text-gray-700">#{idx + 1}</span>,
      name: <span className="font-semibold text-gray-800">{item.firstName} {item.lastName}</span>,
      course: item.course,
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
    };
  });

  return (
    <div className="flex-1 w-full min-h-[90vh] p-2 overflow-y-auto">
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
              <div className="flex bg-gray-200 p-1 rounded-xl shadow-inner gap-1 self-stretch sm:self-auto">
                <button
                  onClick={() => handlePrimaryTabChange("All")}
                  className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                    activePrimaryTab === "All"
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
                  className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                    activePrimaryTab === "Top"
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

              {activePrimaryTab === "All" ? (
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
              ) : (
                <button 
                  disabled={selectedIds.size === 0}
                  onClick={() => setIsConfirmEmailOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 cursor-pointer bg-indigo-600 border border-indigo-700 text-white rounded-lg shadow-sm hover:bg-indigo-700 font-medium text-sm transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Email Selected ({selectedIds.size})
                </button>
              )}
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

        {activePrimaryTab === "All" && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between w-full relative z-10">
          
          <div className="relative w-full lg:w-96 shrink-0 z-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto items-start sm:items-center gap-4 mb-0">
            <div className="flex flex-col min-[400px]:flex-row w-full sm:w-auto gap-4">
              <div className="flex flex-col min-[400px]:items-center min-[400px]:flex-row gap-1 sm:gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 shrink-0">From:</label>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 w-full sm:w-36 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer text-gray-700"
                />
              </div>
              
              <div className="flex flex-col min-[400px]:items-center min-[400px]:flex-row gap-1 sm:gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 shrink-0">To:</label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 w-full sm:w-36 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer text-gray-700"
                />
              </div>

              <div className="flex flex-col min-[400px]:items-center min-[400px]:flex-row gap-1 sm:gap-2 w-full sm:w-auto z-10 relative">
                <label className="text-sm font-medium text-gray-700 shrink-0">Status:</label>
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
                                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                    active ? "bg-green-50 text-green-900" : "text-gray-900"
                                  }`
                                }
                                value={status}
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium text-green-700" : "font-normal"
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
            </div>
            
            {(search || dateFrom || dateTo || statusFilter !== "All") && (
              <button 
                onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setStatusFilter("All"); }}
                className="text-sm text-red-500 hover:text-red-700 font-medium whitespace-nowrap mt-1 sm:mt-0 self-end sm:self-center cursor-pointer shrink-0"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        )}

        <div className=" flex flex-col overflow-hidden w-full -mt-3">
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
            />
          )}
        </div>

      </div>

      <ConfirmDeleteModal
        open={isConfirmEmailOpen}
        onConfirm={() => {
          toast.success(`Successfully sent emails to ${selectedIds.size} selected students!`);
          setIsConfirmEmailOpen(false);
          setSelectedIds(new Set());
        }}
        onCancel={() => setIsConfirmEmailOpen(false)}
        title="Send Emails"
        confirmText="Yes, Send Emails"
        actionType="accept"
        customDescription={<span>Are you sure you want to send emails to the <strong className="text-gray-800">{selectedIds.size}</strong> selected top students? This action cannot be undone.</span>}
      />
    </div>
  );
}
