import {
  Calendar,
  CalendarCheck,
  CalendarIcon,
  CaretDown,
  CaretRight,
  CaretRightIcon,
  CurrencyInr,
  UsersThree,
} from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRouter, useSearchParams } from "next/navigation";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getOverallStudents } from "@/lib/helpers/finance/dashboard/getOverallStudents";
import { getFinanceFilterOptions } from "@/lib/helpers/finance/getFinanceFilterOptions";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { getFinanceYearSemesterCollectionSummary } from "@/lib/helpers/finance/dashboard/getFinanceYearSemesterCollectionSummary";
import { getOverallFinanceTotal } from "@/lib/helpers/finance/dashboard/getOverallFinanceTotal";
import { getOverallPending } from "@/lib/helpers/finance/dashboard/getOverallPending";
import { getQuickInsights } from "@/lib/helpers/finance/dashboard/getQuickInsights";
import { getCurrentSemesterPendingStudents } from "@/lib/helpers/finance/dashboard/getPendingStudentsCount";
// import { fetchSemesters } from "@/lib/helpers/admin/academics/academicDropdowns";

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-lg shadow-sm p-3 border border-gray-100 ${className}`}
  >
    {children}
  </div>
);

const Header = ({
  educationType,
  branch,
  branches,
  onBranchChange,
  year,
  onYearClick,
}: {
  educationType: string;
  branch: string;
  branches: any[];
  onBranchChange: (val: string) => void;
  year: string;
  onYearClick: () => void;
}) => {
  const branchOptions =
    branches?.map((b) => ({
      label: b.collegeBranchCode,
      value: b.collegeBranchCode,
    })) || [];

  return (
    <div className="flex justify-between items-center mb-3 px-1">
      <h1 className="text-[#1e293b] text-base font-bold">
        {educationType} - {branch} - {year}
      </h1>

      <div className="flex gap-4 text-[10px] font-semibold text-gray-500">
        {/* Education Type */}
        <Dropdown label="Education Type" value={educationType} disabled />

        {/* Branch */}
        <Dropdown
          label="Branch"
          value={branch}
          options={branchOptions}
          onChange={onBranchChange}
        />

        {/* Year */}
        <Dropdown label="Year" value={year} onClick={onYearClick} isYear />
      </div>
    </div>
  );
};

interface DropdownOption {
  label: string;
  value: string;
}

const Dropdown = ({
  label,
  value,
  options,
  onChange,
  onClick,
  disabled = false,
  isYear = false,
}: {
  label: string;
  value: string;
  options?: DropdownOption[];
  onChange?: (val: string) => void;
  onClick?: () => void;
  disabled?: boolean;
  isYear?: boolean;
}) => {
  const isSelectable = options && options.length > 0;

  return (
    <div className="flex items-center gap-1.5 relative">
      <span className="text-xs">{label}</span>

      <div className="relative">
        {isSelectable ? (
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="appearance-none bg-[#E5F6EC] text-[#43C17A] px-3 py-1 pr-8 rounded-full text-xs font-semibold outline-none cursor-pointer"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <div
            onClick={disabled ? undefined : onClick}
            className={`relative bg-[#E5F6EC] text-[#43C17A] px-3 py-1 pr-8 rounded-full text-xs font-semibold
              ${disabled
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer hover:bg-green-100"
              }
            `}
          >
            {value}
          </div>
        )}

        {!disabled &&
          (isYear ? (
            <CalendarIcon
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
            />
          ) : (
            <CaretDown
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
            />
          ))}
      </div>
    </div>
  );
};

const TopStat = ({
  icon: Icon,
  val,
  label,
  theme,
  onClick,
}: {
  icon: any;
  val: string;
  label: string;
  theme: "purple" | "blue";
  onClick?: () => void;
}) => {
  const isP = theme === "purple";

  return (
    <div
      onClick={onClick}
      className={`
        ${isP ? "bg-[#6d28d9] text-white" : "bg-[#dbeafe] text-[#1e40af]"}
        p-3 rounded-lg flex flex-col justify-between h-full min-h-[90px]
        ${onClick ? "cursor-pointer hover:opacity-90 transition" : ""}
      `}
    >
      <div
        className={`w-7 h-7 rounded ${isP ? "bg-white/20" : "bg-white"
          } flex items-center justify-center mb-2`}
      >
        <Icon
          size={16}
          weight="fill"
          className={isP ? "text-white" : "text-[#2563eb]"}
        />
      </div>

      <div>
        <div className="text-lg font-bold leading-tight">{val}</div>
        <div
          className={`text-[10px] font-medium ${isP ? "text-purple-200" : "text-blue-800/70"
            }`}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

type YearData = {
  year: string;
  total: string;
  sem1: string;
  sem2: string;
};

const YearCard = ({
  data,
  branchId,
  academicYearId,
  academicYear,
  branchName,
  year,
  educationTypeId,
  collegeId,
  collegeEducationId,
  semesterList
}: {
  data: YearData;
  branchId?: number;
  academicYearId?: number;
  academicYear?: string;
  branchName?: string;
  year?: string;
  educationTypeId?: number;
  collegeId?: number;
  collegeEducationId?: number;
  semesterList?: any[];
}) => {
  const sem1Id = semesterList?.[0]?.collegeSemesterId;
  const sem2Id = semesterList?.[1]?.collegeSemesterId;
  return (
    <Card className="h-full flex flex-col justify-center gap-2">
      <div className="flex justify-between items-center">
        <div className="font-medium text-gray-800 text-sm">{data.year}</div>

        <div className="text-right">
          <span className="text-[8px] text-[#282828] uppercase font-semibold mr-2">
            Total
          </span>

          <span className="bg-[#1e293b] text-white px-1.5 py-0.5 rounded-full text-[9px] font-medium">
            ₹{data.total}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <SemBox
          label="Sem 1"
          val={data.sem1}
          branchId={branchId}
          academicYearId={academicYearId}
          academicYear={academicYear}
          branchName={branchName}
          year={year}
          educationTypeId={educationTypeId}
          collegeId={collegeId}
          collegeEducationId={collegeEducationId}
          semesterId={sem1Id}
        />
        <SemBox
          label="Sem 2"
          val={data.sem2}
          branchId={branchId}
          academicYearId={academicYearId}
          academicYear={academicYear}
          branchName={branchName}
          year={year}
          educationTypeId={educationTypeId}
          collegeId={collegeId}
          collegeEducationId={collegeEducationId}
          semesterId={sem2Id}
        />
      </div>
    </Card>
  )
};

const SemBox = ({
  label,
  val,
  branchId,
  academicYearId,
  academicYear,
  branchName,
  year,
  educationTypeId,
  collegeId,
  collegeEducationId,
  semesterId
}: {
  label: string;
  val: string;
  branchId?: number;
  academicYearId?: number;
  academicYear?: string;
  branchName?: string;
  year?: string;
  educationTypeId?: number;
  collegeId?: number;
  collegeEducationId?: number;
  semesterId?: number;
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (!branchId || !academicYearId) {
      return;
    }

    const params = new URLSearchParams();

    params.set("view", "semwise");
    params.set("semester", label);
    params.set("branchId", String(branchId));
    params.set("academicYearId", String(academicYearId));
    params.set("academicYear", String(academicYear));
    params.set("semesterId", String(semesterId));
    params.set("branchName", branchName ?? "");
    params.set("year", year ?? "");
    params.set("educationTypeId", String(educationTypeId));

    router.push(`/finance?${params.toString()}`);
  };



  return (
    <div
      onClick={handleClick}
      className="bg-[#E5F6EC] py-1.5 px-2 rounded flex-1 cursor-pointer"
    >
      <div className="text-xs text-[#282828]">{label}</div>
      <div className="text-xs font-bold text-[#43C17A]">₹ {val}</div>
    </div>
  );
};

const defaultYearWiseData = [1, 2, 3, 4].map((year) => ({
  year:
    year === 1
      ? "1st Year"
      : year === 2
        ? "2nd Year"
        : year === 3
          ? "3rd Year"
          : "4th Year",
  sem1: 0,
  sem2: 0,
  total: 0,
}));

interface AcademicYearData {
  collegeAcademicYear: string;
  collegeAcademicYearId: number;
  collegeBranchId: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { collegeId, collegeEducationId, collegeEducationType, loading } =
    useFinanceManager();
  const [overallStudents, setOverallStudents] = useState<number>(0);
  const [branches, setBranches] = useState<any[]>([]);
  // const [years, setYears] = useState<AcademicYearData[]>([]);
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const yearRef = React.useRef<HTMLDivElement>(null);
  const [financeSummary, setFinanceSummary] = useState({
    academicYearTotal: 0,
    yearWiseData: defaultYearWiseData,
  });
  const [overallFinanceTotal, setOverallFinanceTotal] = useState<number>(0);

  const [quickInsights, setQuickInsights] = useState({
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    thisYear: 0,
  });

  const [overallPending, setOverallPending] = useState<number>(0);
  const [pendingStudentsCount, setPendingStudentsCount] = useState<number>(0);

  const selectedBranchId =
    selectedBranch === "ALL"
      ? undefined
      : branches.find((b) => b.collegeBranchCode === selectedBranch)
        ?.collegeBranchId;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) {
        setYearModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!loading && collegeId && collegeEducationId) {
        try {
          const stats = await getOverallStudents(collegeId, collegeEducationId);
          setOverallStudents(stats);
        } catch (err) {
          console.error("Dashboard stats error:", err);
        }
      }
    };

    loadDashboardStats();
  }, [loading, collegeId, collegeEducationId]);

  useEffect(() => {
    const loadFilters = async () => {
      if (!loading && collegeId && collegeEducationId) {
        const filterData = await getFinanceFilterOptions(
          collegeId,
          collegeEducationId
        );

        const branchList = filterData.branches || [];

        setBranches(branchList);

        if (branchList.length > 0) {
          setSelectedBranch(branchList[0].collegeBranchCode);
        }
      }
    };

    loadFilters();
  }, [loading, collegeId, collegeEducationId]);

  useEffect(() => {
    const loadOverallFinance = async () => {
      if (!collegeId || !collegeEducationId) return;

      try {
        const total = await getOverallFinanceTotal({
          collegeId,
          collegeEducationId,
        });

        setOverallFinanceTotal(total ?? 0);
      } catch (err) {
        console.error("Overall finance error:", err);
      }
    };

    loadOverallFinance();
  }, [collegeId, collegeEducationId]);

  useEffect(() => {
    const loadFinanceSummary = async () => {
      if (
        loading ||                      // ⬅ wait for context
        !collegeId ||
        !collegeEducationId ||
        !selectedBranchId ||            // ⬅ VERY IMPORTANT
        !selectedYear
      ) {
        return;                         // ⬅ DO NOT reset to 0
      }

      try {
        const summary = await getFinanceYearSemesterCollectionSummary({
          collegeId,
          collegeEducationId,
          collegeBranchId: selectedBranchId,
          selectedYear,
        });

        setFinanceSummary({
          academicYearTotal: summary.academicYearTotal ?? 0,
          yearWiseData:
            summary.yearWiseData?.length > 0
              ? summary.yearWiseData
              : defaultYearWiseData,
        });
      } catch (err) {
        console.error("Finance summary error:", err);
      }
    };

    loadFinanceSummary();
  }, [
    loading,
    collegeId,
    collegeEducationId,
    selectedBranchId,
    selectedYear,
  ]);

  useEffect(() => {
    const loadInsights = async () => {
      if (
        loading ||
        !collegeId ||
        !collegeEducationId ||
        !selectedBranchId ||
        !selectedYear
      ) {
        return;
      }

      try {
        const result = await getQuickInsights({
          collegeId,
          collegeEducationId,
          collegeBranchId: selectedBranchId,
          selectedYear,
        });
        setQuickInsights(result);
      } catch (err) {
      }
    };

    loadInsights();
  }, [
    loading,
    collegeId,
    collegeEducationId,
    selectedBranchId,
    selectedYear,
  ]);

  useEffect(() => {
    const loadOverallPending = async () => {
      if (
        loading ||
        !collegeId ||
        !collegeEducationId ||
        !selectedBranchId ||
        !selectedYear
      ) {
        return;
      }

      try {
        const pending = await getOverallPending({
          collegeId,
          collegeEducationId,
          collegeBranchId: selectedBranchId,
          selectedYear,
        });
        setOverallPending(pending ?? 0);
      } catch (err) {
      }
    };

    loadOverallPending();
  }, [
    loading,
    collegeId,
    collegeEducationId,
    selectedBranchId,
    selectedYear,
  ]);

  useEffect(() => {
    const loadPendingStudents = async () => {
      if (
        loading ||
        !collegeId ||
        !collegeEducationId
      ) {
        return;
      }

      try {
        const count = await getCurrentSemesterPendingStudents({
          collegeId,
          collegeEducationId,
          collegeBranchId: selectedBranchId,
        });
        setPendingStudentsCount(count ?? 0);
      } catch (err) {
      }
    };

    loadPendingStudents();
  }, [
    loading,
    collegeId,
    collegeEducationId,
    selectedBranchId,
  ]);

  const handleFeeCollection = () => {
    if (!collegeEducationId || !selectedBranchId || !selectedYear) {
      console.log("⛔ Missing required params", {
        collegeEducationId,
        selectedBranchId,
        selectedYear,
      });
      return;
    }

    console.log("🚀 Navigating to Fee Collection with:", {
      educationType: collegeEducationType,
      educationId: collegeEducationId,
      branchType: selectedBranch,
      branchId: selectedBranchId,
      selectedYear,
    });

    router.push(
      `/finance?view=feeCollection&educationType=${collegeEducationType}&educationId=${collegeEducationId}&branchType=${selectedBranch}&branchId=${selectedBranchId}&selectedYear=${selectedYear}`
    );
  };

  const handleOverallFinance = () => {
    router.push("/finance/finance-analytics/students/1");
    return;
  };

  const formatAmount = (amount: number) => {
    if (amount >= 10000000)
      return (amount / 10000000).toFixed(2) + " Cr";

    if (amount >= 100000)
      return (amount / 100000).toFixed(1) + " L";

    if (amount >= 1000)
      return (amount / 1000).toFixed(1) + " K";

    return amount.toString();
  };

  const BASE_YEAR = 2026;
  const CURRENT_YEAR = new Date().getFullYear();

  const trendData = financeSummary.yearWiseData.map((item) => ({
    name: item.year,
    value: Number((item.total / 100000).toFixed(1)),
  }));

  if (!collegeEducationId) return


  return (
    <div className="min-h-screen flex justify-center text-gray-900">
      <div className="w-full">
        <div className="relative">
          <Header
            educationType={collegeEducationType ?? "B.Tech"}
            branch={selectedBranch}
            year={selectedYear ?? "Year"}
            branches={branches}
            onBranchChange={(val: string) => {
              setSelectedBranch(val);
            }}
            onYearClick={() => {
              setYearModalOpen((prev) => !prev);
            }}
          />
          {yearModalOpen && (
            <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-xl shadow-xl p-4">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <StaticDatePicker
                  views={["year"]}
                  displayStaticWrapperAs="desktop"
                  value={
                    selectedYear !== "Year"
                      ? new Date(`${selectedYear}-01-01`)
                      : null
                  }
                  onChange={(newValue) => {
                    if (newValue) {
                      const selected = newValue.getFullYear().toString();
                      setSelectedYear(selected);
                    }
                    setYearModalOpen(false);
                  }}
                  shouldDisableYear={(date) => {
                    const year = date.getFullYear();

                    if (year < BASE_YEAR) return true;

                    if (year > CURRENT_YEAR) return true;

                    return false;
                  }}
                  slotProps={{
                    actionBar: { actions: [] },
                  }}
                  sx={{
                    width: 280,
                    "& .MuiPickersCalendarHeader-root": {
                      minHeight: 32,
                    },
                    "& .MuiPickersYear-yearButton": {
                      fontSize: "12px",
                      width: 50,
                      height: 32,
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          )}
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 flex flex-col gap-3">
            <div className="h-[95px]">
              <TopStat
                icon={UsersThree}
                val={overallStudents.toLocaleString()}
                label="Overall Students"
                theme="purple"
                onClick={() =>
                  router.push(
                    `/finance/finance-analytics/students?studentsCount=${overallStudents}`,
                  )
                }
              />
            </div>
            <div className="h-[95px]">
              <TopStat
                icon={CurrencyInr}
                val={`₹ ${overallFinanceTotal.toLocaleString()}`}
                label="Overall Finance"
                theme="blue"
                onClick={handleOverallFinance}
              />
            </div>
          </div>

          <div className="col-span-9 grid grid-cols-2 gap-3 overflow-y-auto overflow-x-hidden">
            {(() => {
              const selectedBranchData = branches.find(
                (b) => b.collegeBranchCode === selectedBranch
              );

              const branchYears = selectedBranchData?.years || [];

              // const testBranchYears = [...branchYears, ...branchYears];

              const enableScroll = branchYears.length >= 5;

              if (branchYears.length === 0) return null;

              return <div
                className={`col-span-9 grid grid-cols-2 gap-3 ${enableScroll ? "max-h-[203px] overflow-y-auto pr-2" : ""
                  }`}
              >
                {branchYears.map((yearObj: any, index: number) => {
                  const summaryYear = financeSummary.yearWiseData.find(
                    (y: any) => y.year === yearObj.collegeAcademicYear
                  )

                  return (
                    <div key={index} className="h-[95px]">
                      <YearCard
                        data={{
                          year: yearObj.collegeAcademicYear,
                          total: (summaryYear?.total ?? 0).toLocaleString(),
                          sem1: (summaryYear?.sem1 ?? 0).toLocaleString(),
                          sem2: (summaryYear?.sem2 ?? 0).toLocaleString(),
                        }}
                        branchId={selectedBranchId}
                        academicYearId={yearObj.collegeAcademicYearId}
                        academicYear={yearObj.collegeAcademicYear}
                        branchName={selectedBranch}
                        year={selectedYear}
                        educationTypeId={collegeEducationId ?? undefined}
                        collegeId={collegeId ?? undefined}
                        collegeEducationId={collegeEducationId ?? undefined}
                        semesterList={yearObj.semesters}
                      />
                    </div>
                  )
                })}
              </div>
            })()}
          </div>

          {/* <div className="col-span-9 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-3">
              <div className="h-[95px]">
                <YearCard data={data.years[0]} />
              </div>
              <div className="h-[95px]">
                <YearCard data={data.years[2]} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-[95px]">
                <YearCard data={data.years[1]} />
              </div>
              <div className="h-[95px]">
                <YearCard data={data.years[3]} />
              </div>
            </div>
          </div> */}

          <div className="col-span-3">
            <Card className="h-[220px] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3
                  style={{ fontSize: 11, fontWeight: "700", color: "#282828" }}
                >
                  Fee Collection by year
                </h3>
                <CaretRightIcon
                  size={16}
                  weight="bold"
                  className="cursor-pointer"
                  onClick={handleFeeCollection}
                />
              </div>
              <div className="flex-1 space-y-2">
                {financeSummary.yearWiseData.map((yearData: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[10px]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="font-medium text-gray-600">
                        {yearData.year}
                      </span>
                    </div>
                    <span className="font-bold text-green-600 font-mono">
                      ₹ {yearData.total.toLocaleString()}
                    </span>
                  </div>
                ))}
                {/* {data.collection.map((d, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[10px]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="font-medium text-gray-600">
                        {d.label}
                      </span>
                    </div>
                    <span className="font-bold text-green-600 font-mono">
                      ₹ {financeSummary.academicYearTotal.toLocaleString()}
                    </span>
                  </div>
                ))} */}
              </div>
              <div className="bg-[#E5F6EC] px-3 py-2 rounded-md mt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700 text-[12px]">
                  Total
                </span>

                <p className="bg-[#1e293b] text-white px-3 py-1 rounded-full text-[11px] font-bold font-mono">
                  ₹ {financeSummary.academicYearTotal?.toLocaleString() || "0"}
                </p>
              </div>
            </Card>
          </div>

          {/* Trend Chart (Span 6) */}
          <div className="col-span-5">
            <Card className="h-[220px] flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-xs font-bold text-gray-800 mb-2">
                  Collection Trend Overview
                </h3>
                <CaretRight
                  size={20}
                  className="cursor-pointer"
                  onClick={() => router.push("/finance/finance-analytics")}
                />
              </div>

              <div className="flex-1 w-full text-[9px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                    barSize={28}
                  >
                    <defs>
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#43C17A" />
                        <stop offset="100%" stopColor="#205B3A" />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                      dy={5}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 9 }}
                      tickFormatter={(v) => `${v}L`}
                      ticks={[0, 10, 20, 30]}
                      domain={[0, 35]}
                    />

                    <ReferenceLine
                      y={30}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />

                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        fontSize: "10px",
                        padding: "4px",
                        borderRadius: "4px",
                      }}
                      formatter={(val) => [`₹ ${val}L`, ""]}
                    />

                    <Bar
                      dataKey="value"
                      fill="url(#barGradient)"
                      radius={[3, 3, 0, 0]}
                    >
                      <LabelList
                        dataKey="value"
                        position="top"
                        fill="#64748b"
                        fontSize={9}
                        formatter={(v: any) => `${v}L`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="col-span-4">
            <Card className="h-[220px]">
              <h3 className="text-xs font-bold text-gray-800 mb-3">
                Quick Insights
              </h3>
              <div className="space-y-2">
                {[
                  { label: "This Week", val: quickInsights.thisWeek, icon: CalendarCheck },
                  { label: "Last Week", val: quickInsights.lastWeek, icon: Calendar },
                  { label: "This Month", val: quickInsights.thisMonth, icon: Calendar },
                  { label: "This Year", val: quickInsights.thisYear, icon: Calendar },
                ].map((d, i) => (
                  <div
                    key={i}
                    className="bg-[#E5F6EC] p-2 rounded flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#609872] flex items-center justify-center text-white">
                        <d.icon weight="fill" size={10} />
                      </div>
                      <span className="font-semibold text-gray-700 text-xs">
                        {d.label}
                      </span>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#43C17A] text-xs">
                        ₹ {d.val}
                      </span>

                      <CaretRight
                        size={16}
                        weight="bold"
                        className="cursor-pointer text-[#282828]"
                        onClick={() => {
                          const params = new URLSearchParams(
                            searchParams.toString(),
                          );

                          const range = d.label
                            .toLowerCase()
                            .replace(/\s+/g, "-");

                          params.set("range", range);

                          router.push(
                            `/finance/fee-collection/payments?range=${range}&educationId=${collegeEducationId}&educationType=${collegeEducationType}&branch=${selectedBranch}&branchId=${selectedBranchId}&selectedYear=${selectedYear}`
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="col-span-3">
            <div className="bg-[#E5F6EC] p-3 rounded-lg border border-green-50 h-[120px] flex flex-col justify-center">
              <h4 className="font-bold text-gray-800 text-xs mb-1">
                Overall Pending
              </h4>
              <p className="text-[10px] text-[#282828] mb-3 leading-3 w-3/4">
                Total unpaid fees across all students
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-[#43C17A]">₹</span>
                <span className="text-2xl font-bold text-[#43C17A]">
                  {formatAmount(overallPending)}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-[#E5F6EC] p-3 rounded-lg border border-green-50 h-[120px] flex flex-col justify-center">
              <h4 className="font-bold text-gray-800 text-xs mb-1">
                Current Semester
              </h4>
              <p className="text-[10px] text-[#282828] mb-3 leading-3 w-3/4">
                Students yet to complete payment
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#43C17A]">
                  {pendingStudentsCount}
                </span>
                <span className="text-[10px] font-bold text-[#43C17A]">
                  Students
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-6">
            <Card className="h-[120px] flex flex-col items-center justify-center text-center py-2">
              <h3 className="text-xs font-bold text-gray-800 mb-1">
                Payment Reminder
              </h3>
              <p className="text-[#43C17A] text-[10px] font-medium mb-3">
                Send automated payment alerts to pending students & parents
              </p>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("view", "PaymentReminder");
                  router.push(`?${params.toString()}`);
                }}
                className="bg-[#1e293b] cursor-pointer text-white px-5 py-2 rounded-full font-bold text-[10px] hover:bg-[#334155] transition-colors shadow-sm"
              >
                Send Reminder
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
