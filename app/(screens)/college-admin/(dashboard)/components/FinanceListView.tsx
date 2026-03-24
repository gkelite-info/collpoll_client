"use client";

import { useEffect, useMemo, useState } from "react";
import { CaretLeft, CaretDown, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import TableComponent from "@/app/utils/table/table";
import { AgCharts } from "ag-charts-react";
import { ModuleRegistry, AllCommunityModule } from "ag-charts-community";
import type { AgPolarChartOptions } from "ag-charts-community";
import { EduTypeDistribution, FinanceListData, getFinanceListData } from "@/lib/helpers/collegeAdmin/Getfinancelistdata";

ModuleRegistry.registerModules([AllCommunityModule]);

const ROLE_COLORS: Record<string, string> = {
    admins: "#7C3AED", students: "#FBA945", parents: "#10B981",
    faculty: "#3B82F6", finance: "#F97316", placement: "#EC4899",
};

function EduDonutCard({ dist }: { dist: EduTypeDistribution }) {
    const roles = ["admins", "students", "parents", "faculty", "finance", "placement"] as const;
    const chartData = roles.filter((r) => dist[r] > 0).map((r) => ({ role: r.charAt(0).toUpperCase() + r.slice(1), value: dist[r] }));
    const fills = roles.filter((r) => dist[r] > 0).map((r) => ROLE_COLORS[r]);
    const options: AgPolarChartOptions = useMemo(() => ({
        data: chartData.length > 0 ? chartData : [{ role: "Empty", value: 1 }],
        background: { fill: "transparent" },
        padding: { top: 10, bottom: 0, left: 10, right: 10 },
        series: [{
            type: "donut", angleKey: "value", legendItemKey: "role",
            innerRadiusRatio: 0.55, outerRadiusRatio: 0.85, strokeWidth: 0,
            fills: chartData.length > 0 ? fills : ["#F3F4F6"],
            highlightStyle: { series: { dimOpacity: 0.8 } },
        }],
        legend: { position: "bottom", spacing: 4, item: { label: { fontSize: 10, color: "#6B7280" }, marker: { size: 8, shape: "circle", padding: 4 } } },
    }), [dist]);

    return (
        <div className="min-w-[280px] max-w-[300px] flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <span className="font-bold text-[#1F2937] text-[15px]">{dist.eduType}</span>
                <span className="text-gray-400 text-xs font-medium ml-1">Total Users : {dist.totalUsers.toLocaleString("en-IN")} Users</span>
            </div>
            <div style={{ height: "220px" }}><AgCharts options={options} style={{ height: "100%" }} /></div>
        </div>
    );
}

function FilterPill({ label, value, showCaret = false, onClick }: {
    label: string; value: string; showCaret?: boolean;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-[#374151] font-medium">{label} :</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#43C17A26] text-[#43C17A] font-semibold text-xs cursor-pointer" onClick={onClick}>
                {value}{showCaret && <CaretDown size={12} weight="bold" />}
            </div>
        </div>
    );
}

const TABLE_COLUMNS = [
    { title: "Finance Manager", key: "fullName" },
    { title: "Finance ID",      key: "financeManagerId" },
    { title: "Education Type",  key: "eduType" },
    { title: "Support Admin",   key: "supportAdmin" },
];

const ROWS_PER_PAGE = 10;

type Props = { onBack: () => void };

export default function FinanceListView({ onBack }: Props) {
    const { collegeId, loading: contextLoading } = useCollegeAdmin();

    const [data, setData]             = useState<(FinanceListData & { totalCount: number }) | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [search, setSearch]         = useState("");
    const [selectedEduId, setSelectedEduId]   = useState<number | null>(null);
    const [selectedAdmin, setSelectedAdmin]   = useState("All");
    const [adminOpen, setAdminOpen]           = useState(false);
    const [currentPage, setCurrentPage]       = useState(1);
    const [totalRecords, setTotalRecords]     = useState(0);

    const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);

    const load = async (page: number, eduId: number | null, admin: string) => {
        if (contextLoading || !collegeId) return;
        setIsFetching(true);
        try {
            const adminId = admin !== "All"
                ? data?.finance.find((f) => f.supportAdmin === admin) ? undefined : undefined
                : undefined;

            const d = await getFinanceListData(collegeId, page, ROWS_PER_PAGE, {
                collegeEducationId: eduId ?? undefined,
            });
            setData(d);
            setTotalRecords(d.totalCount);
            if (!selectedEduId && d.distributions.length > 0) {
                setSelectedEduId(d.distributions[0].collegeEducationId);
            }
        } catch (err) {
            console.error("FinanceListView error:", err);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (contextLoading || !collegeId) return;
        load(1, null, "All");
    }, [collegeId, contextLoading]);

    useEffect(() => {
        if (!collegeId || contextLoading) return;
        load(currentPage, selectedEduId, selectedAdmin);
    }, [currentPage, selectedEduId]);

    const availableAdmins = useMemo(() => {
        if (!data || !selectedEduId) return [];
        return [...new Set(
            data.finance
                .filter((f) => f.collegeEducationId === selectedEduId && f.supportAdmin !== "—")
                .map((f) => f.supportAdmin)
        )];
    }, [data, selectedEduId]);

    const tableData = useMemo(() => {
        if (!data) return [];
        return data.finance.filter((f) => {
            const matchEdu    = !selectedEduId || f.collegeEducationId === selectedEduId;
            const matchAdmin  = selectedAdmin === "All" || f.supportAdmin === selectedAdmin;
            const matchSearch = !search ||
                f.fullName.toLowerCase().includes(search.toLowerCase()) ||
                String(f.financeManagerId).includes(search);
            return matchEdu && matchAdmin && matchSearch;
        });
    }, [data, selectedEduId, selectedAdmin, search]);

    const selectedEduType = data?.distributions.find((d) => d.collegeEducationId === selectedEduId)?.eduType ?? "";

    const closeAll = () => { setAdminOpen(false); };

    return (
        <div className="flex w-full min-h-screen pb-4">
            <div className="flex-1 p-2 flex flex-col overflow-hidden" onClick={closeAll}>

                <div className="flex items-center gap-2 mb-4">
                    <CaretLeft size={20} weight="bold" className="cursor-pointer text-[#282828] active:scale-90" onClick={onBack} />
                    <h1 className="text-xl font-semibold text-[#282828]">Finance</h1>
                </div>

                <p className="text-[#1E40AF] font-bold text-[15px] mb-3">User Distribution by Education Type</p>

                {isFetching && !data ? (
                    <div className="flex gap-4 mb-5">
                        {[...Array(3)].map((_, i) => <div key={i} className="min-w-[280px] h-[260px] flex-shrink-0 animate-pulse bg-gray-200 rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-y-hidden overflow-x-auto p-2 mb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                        {(data?.distributions ?? []).map((dist) => (
                            <div key={dist.collegeEducationId}
                                onClick={() => { setSelectedEduId(dist.collegeEducationId); setSelectedAdmin("All"); setCurrentPage(1); }}
                                className={`flex-shrink-0 cursor-pointer transition-all ${selectedEduId === dist.collegeEducationId ? "ring-2 ring-[#43C17A] rounded-2xl" : ""}`}
                            >
                                <EduDonutCard dist={dist} />
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-[#1E40AF] font-bold text-[15px] mb-3">
                    Total Finance Managers : {isFetching ? "…" : totalRecords}
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <FilterPill label="Education Type" value={selectedEduType || "All"} />
                    <div className="relative">
                        <FilterPill label="Support Admin" value={selectedAdmin} showCaret
                            onClick={(e) => { e.stopPropagation(); setAdminOpen((o) => !o); }}
                        />
                        {adminOpen && (
                            <div className="absolute top-8 left-0 bg-white shadow-lg rounded-xl text-sm w-40 z-50 border border-gray-100">
                                {["All", ...availableAdmins].map((a) => (
                                    <div key={a}
                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedAdmin === a ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                                        onClick={(e) => { e.stopPropagation(); setSelectedAdmin(a); setAdminOpen(false); }}
                                    >{a}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-[40%] bg-[#EAEAEA] px-3 rounded-full flex items-center mb-4">
                    <input type="text" placeholder="Search by Finance Manager Name or ID"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full p-2 outline-none text-sm bg-transparent text-[#282828] placeholder:text-[#6B7280]"
                    />
                    <MagnifyingGlass size={18} className="text-[#43C17A]" />
                </div>

                {isFetching ? (
                    <div className="animate-pulse bg-gray-200 rounded-2xl h-64" />
                ) : tableData.length === 0 ? (
                    <p className="text-gray-400 text-sm mt-8 text-center">No finance managers found.</p>
                ) : (
                    <TableComponent columns={TABLE_COLUMNS} tableData={tableData} height="55vh" />
                )}

                {totalPages > 1 && (
                    <div className="flex justify-end items-center gap-3 mt-4 mb-2">
                        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
                            <CaretLeft size={18} weight="bold" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-lg font-semibold ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
                            <CaretRight size={18} weight="bold" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
