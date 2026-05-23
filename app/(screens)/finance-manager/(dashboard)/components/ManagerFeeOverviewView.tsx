"use client";

import TableComponent from "@/app/utils/table/table";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import {
  fetchFeeCollectionOverview,
  type FeeCollectionOverviewRow,
} from "@/lib/helpers/finance-manager/dashboard/FetchFeeCollectionOverview";
import { CaretDown, CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const rupee = "\u20B9";

const educationColumns = [
  { title: "Education Type", key: "name" },
  { title: "Students", key: "students" },
  { title: "Collected", key: "collected" },
  { title: "Pending", key: "pending" },
  { title: "Total Fees", key: "totalFees" },
];

const branchColumns = [
  { title: "Branch", key: "name" },
  { title: "Students", key: "students" },
  { title: "Collected", key: "collected" },
  { title: "Pending", key: "pending" },
  { title: "Total Fees", key: "totalFees" },
];

const formatCurrency = (value: number) =>
  `${rupee} ${Math.round(value).toLocaleString("en-IN")}`;

function buildRows(rows: FeeCollectionOverviewRow[]) {
  return rows.map((row) => ({
    name: row.name,
    students: row.students.toLocaleString("en-IN"),
    collected: formatCurrency(row.collected),
    pending: (
      <span className="font-semibold text-[#FF2525]">
        {formatCurrency(row.pending)}
      </span>
    ),
    totalFees: (
      <span className="font-semibold text-[#43C17A]">
        {formatCurrency(row.totalFees)}
      </span>
    ),
  }));
}

function SelectableEducationTable({
  rows,
  selectedEducation,
  loading,
  onSelectEducation,
}: {
  rows: FeeCollectionOverviewRow[];
  selectedEducation: string | null;
  loading: boolean;
  onSelectEducation: (education: string) => void;
}) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-md font-semibold text-[#282828]">
        Fee Collection Overview
      </h2>
      <div className="custom-scrollbar overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse overflow-hidden rounded-lg text-center text-sm">
          <thead className="bg-[#ECECEC] text-[#282828]">
            <tr>
              {educationColumns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white text-[#525252]">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="border-b border-[#DBDBDB]">
                  {educationColumns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      <div className="mx-auto h-4 w-24 animate-pulse rounded bg-[#F2F2F2]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-[#525252]"
                  colSpan={educationColumns.length}
                >
                  No fee collection data available
                </td>
              </tr>
            ) : (
              buildRows(rows).map((row) => {
                const isSelected = selectedEducation === row.name;

                return (
                  <tr
                    key={row.name as string}
                    className={`cursor-pointer border-b border-[#DBDBDB] transition-colors hover:bg-[#E8F8EF] ${
                      isSelected ? "bg-[#D9F4E4] text-[#282828]" : ""
                    }`}
                    onClick={() => onSelectEducation(row.name as string)}
                  >
                    <td className="px-4 py-3 font-semibold">{row.name}</td>
                    <td className="px-4 py-3">{row.students}</td>
                    <td className="px-4 py-3">{row.collected}</td>
                    <td className="px-4 py-3">{row.pending}</td>
                    <td className="px-4 py-3">{row.totalFees}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AcademicYearPill({
  years,
  selectedYear,
  onChange,
}: {
  years: string[];
  selectedYear: string;
  onChange: (year: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#282828]">
      <span>Academic Year :</span>
      <div className="relative">
        <select
          className="appearance-none rounded-full bg-[#43C17A] py-1 pr-8 pl-3 text-xs font-semibold text-white outline-none"
          value={selectedYear}
          onChange={(event) => onChange(event.target.value)}
        >
          {years.map((year) => (
            <option key={year} value={year} className="bg-white text-[#282828]">
              {year}
            </option>
          ))}
        </select>
        <CaretDown
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white"
          size={12}
          weight="bold"
        />
      </div>
    </div>
  );
}

function OverviewTable({
  title,
  columns,
  rows,
  loading,
}: {
  title: string;
  columns: { title: string; key: string }[];
  rows: Record<string, React.ReactNode>[];
  loading: boolean;
}) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-md font-semibold text-[#282828]">{title}</h2>
      <TableComponent
        columns={columns}
        tableData={rows}
        height="auto"
        isLoading={loading}
        stickyHeader={false}
      />
    </section>
  );
}

export default function ManagerFeeOverviewView() {
  const router = useRouter();
  const { collegeId, collegeEducationId, loading: contextLoading } =
    useFinanceManager();
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [availableYears, setAvailableYears] = useState([selectedYear]);
  const [educationRows, setEducationRows] = useState<FeeCollectionOverviewRow[]>([]);
  const [branchRows, setBranchRows] = useState<FeeCollectionOverviewRow[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      if (contextLoading || !collegeId || !collegeEducationId) return;

      setLoading(true);
      try {
        const result = await fetchFeeCollectionOverview(
          collegeId,
          collegeEducationId,
          selectedYear,
        );
        if (!isMounted) return;

        setAvailableYears(result.years);
        setEducationRows(result.educationRows);
        setBranchRows(result.branchRows);

        const nextSelectedYear = result.years.includes(selectedYear)
          ? selectedYear
          : result.years[0];
        if (nextSelectedYear && nextSelectedYear !== selectedYear) {
          setSelectedYear(nextSelectedYear);
        }

        if (
          selectedEducation &&
          !result.educationRows.some((row) => row.name === selectedEducation)
        ) {
          setSelectedEducation(null);
        }
      } catch {
        if (!isMounted) return;
        setEducationRows([]);
        setBranchRows([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, [
    collegeEducationId,
    collegeId,
    contextLoading,
    selectedEducation,
    selectedYear,
  ]);

  const branchTableRows = useMemo(() => buildRows(branchRows), [branchRows]);
  const selectedBranchTitle = selectedEducation
    ? `${selectedEducation} Fee Collection Overview`
    : "";

  return (
    <div className="w-full p-2 pb-7 lg:pb-5">
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          aria-label="Back to Finance Manager Dashboard"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0]"
          onClick={() => router.push("/finance-manager")}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <AcademicYearPill
          years={availableYears}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
        />
      </div>

      <div className="flex flex-col gap-4">
        <SelectableEducationTable
          rows={educationRows}
          selectedEducation={selectedEducation}
          loading={contextLoading || loading}
          onSelectEducation={setSelectedEducation}
        />
        {selectedEducation && (
          <OverviewTable
            title={selectedBranchTitle}
            columns={branchColumns}
            rows={branchTableRows}
            loading={contextLoading || loading}
          />
        )}
      </div>
    </div>
  );
}
