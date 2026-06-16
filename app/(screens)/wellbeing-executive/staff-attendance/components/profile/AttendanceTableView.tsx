import TableComponent from "@/app/utils/table/table";
import type { AttendanceMonthData } from "./attendance-profile-data";

type AttendanceTableViewProps = {
  month: AttendanceMonthData;
};

export default function AttendanceTableView({ month }: AttendanceTableViewProps) {
  const columns = [
    { title: "DATE", key: "date" },
    { title: "DAY", key: "day" },
    { title: "ATTENDANCE STATUS", key: "status" },
    { title: "REMARKS", key: "remarks" },
  ];
  const tableData = month.rows.map((row) => ({
    date: (
      <span className="text-[13px] font-extrabold text-[#2D3748]">
        {row.date}
      </span>
    ),
    day: (
      <span className="text-[12px] font-medium text-[#64748B]">
        {row.day}
      </span>
    ),
    status: (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold ${
          row.status === "Present"
            ? "bg-[#E8FAF2] text-[#10A66A]"
            : "bg-[#FFF0F0] text-[#EF4444]"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            row.status === "Present" ? "bg-[#10A66A]" : "bg-[#EF4444]"
          }`}
        />
        {row.status}
      </span>
    ),
    remarks: (
      <span
        className={`text-[12px] font-medium ${
          row.remarks === "Uninformed" ? "italic text-[#EF4444]" : "text-[#64748B]"
        }`}
      >
        {row.remarks}
      </span>
    ),
  }));

  return (
    <div className="overflow-hidden rounded-b-md border-x border-b border-[#D7DFEC] bg-white">
      <div className="[&>div]:mt-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&_th]:py-3 [&_th]:text-[12px] [&_th]:font-extrabold [&_th]:text-[#7D8DA7] [&_td]:py-3">
        <TableComponent
          columns={columns}
          tableData={tableData}
          tableClassName="min-w-[620px]"
          height="none"
          stickyHeader={false}
        />
      </div>
      <div className="border-t border-[#D7DFEC] px-5 py-3 text-[11px] font-medium text-[#64748B]">
        Showing {month.rows.length} records from {month.title}
      </div>
    </div>
  );
}
