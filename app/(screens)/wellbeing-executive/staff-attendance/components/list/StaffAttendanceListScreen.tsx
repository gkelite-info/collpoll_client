"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import AttendanceToolbar from "../AttendanceToolbar";
import { AttendanceStats, AttendanceSummary } from "../AttendanceStats";
import StaffAttendanceTable from "../StaffAttendanceTable";
import {
  type StaffAttendanceRecord,
  type StaffAttendanceStatus,
} from "../../data";

const ITEMS_PER_PAGE = 6;

type StaffAttendanceListScreenProps = {
  records: StaffAttendanceRecord[];
  setRecords: Dispatch<SetStateAction<StaffAttendanceRecord[]>>;
  onViewProfile: (record: StaffAttendanceRecord) => void;
  onViewAllStaff: () => void;
  onViewStaffByStatus: (status: StaffAttendanceStatus) => void;
};

export default function StaffAttendanceListScreen({
  records,
  setRecords,
  onViewProfile,
  onViewAllStaff,
  onViewStaffByStatus,
}: StaffAttendanceListScreenProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const summaryRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) =>
      [record.name, record.staffId, record.role].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [records, search]);

  const total = summaryRecords.length;
  const present = summaryRecords.filter((record) => record.status === "present").length;
  const absent = summaryRecords.filter((record) => record.status === "absent").length;
  const totalPages = Math.max(1, Math.ceil(summaryRecords.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const handleStatusChange = (id: number, status: StaffAttendanceStatus) => {
    setRecords((current) =>
      current.map((record) => (record.id === id ? { ...record, status } : record)),
    );
  };

  const handleMarkAllPresent = () => {
    setRecords((current) =>
      current.map((record) => ({ ...record, status: "present" })),
    );
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen w-full overflow-y-auto p-2 pb-6">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col rounded-2xl bg-white px-4 py-5 shadow-sm sm:px-6">
        <div>
          <h1 className="text-[18px] font-extrabold text-[#16284F]">Mark Attendance</h1>
          <p className="mt-1 text-[12px] font-medium text-[#8A9AB5]">
            Select attendance status for each staff member
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-5">
            <AttendanceToolbar
              search={search}
              onSearchChange={handleSearchChange}
              onMarkAllPresent={handleMarkAllPresent}
            />
            <AttendanceStats
              total={total}
              present={present}
              absent={absent}
              onTotalClick={onViewAllStaff}
              onPresentClick={() => onViewStaffByStatus("present")}
              onAbsentClick={() => onViewStaffByStatus("absent")}
            />
          </div>
          <AttendanceSummary total={total} present={present} absent={absent} />
        </div>

        <StaffAttendanceTable
          records={summaryRecords}
          currentPage={safeCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          onStatusChange={handleStatusChange}
          onViewProfile={onViewProfile}
        />
      </section>
    </main>
  );
}
