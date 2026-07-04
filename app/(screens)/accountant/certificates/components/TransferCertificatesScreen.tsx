import {
  CalendarBlank,
  CaretDown,
  DownloadSimple,
  Eye,
  FunnelSimple,
  MagnifyingGlass,
  Plus,
  Trash,
} from "@phosphor-icons/react";

type TransferCertificate = {
  tcNo: string;
  studentName: string;
  rollNo: string;
  course: string;
  dateOfLeaving: string;
  reasonForLeaving: string;
  status: "Generated" | "Draft";
};

const transferCertificates: TransferCertificate[] = [
  {
    tcNo: "TC/24-25/0001",
    studentName: "Arun Kumar",
    rollNo: "23CS1056",
    course: "B.Tech CSE",
    dateOfLeaving: "20 May 2025",
    reasonForLeaving: "Higher Studies",
    status: "Generated",
  },
  {
    tcNo: "TC/24-25/0002",
    studentName: "Sneha Reddy",
    rollNo: "23EC1123",
    course: "B.Tech ECE",
    dateOfLeaving: "19 May 2025",
    reasonForLeaving: "Higher Studies",
    status: "Generated",
  },
  {
    tcNo: "TC/24-25/0005",
    studentName: "Karthik V",
    rollNo: "23IT1205",
    course: "B.Tech IT",
    dateOfLeaving: "16 May 2025",
    reasonForLeaving: "Personal",
    status: "Draft",
  },
  {
    tcNo: "TC/24-25/0001",
    studentName: "Arun Kumar",
    rollNo: "23CS1056",
    course: "B.Tech CSE",
    dateOfLeaving: "20 May 2025",
    reasonForLeaving: "Higher Studies",
    status: "Generated",
  },
  {
    tcNo: "TC/24-25/0002",
    studentName: "Sneha Reddy",
    rollNo: "23EC1123",
    course: "B.Tech ECE",
    dateOfLeaving: "19 May 2025",
    reasonForLeaving: "Higher Studies",
    status: "Generated",
  },
  {
    tcNo: "TC/24-25/0005",
    studentName: "Karthik V",
    rollNo: "23IT1205",
    course: "B.Tech IT",
    dateOfLeaving: "16 May 2025",
    reasonForLeaving: "Personal",
    status: "Draft",
  },
  {
    tcNo: "TC/24-25/0001",
    studentName: "Arun Kumar",
    rollNo: "23CS1056",
    course: "B.Tech CSE",
    dateOfLeaving: "20 May 2025",
    reasonForLeaving: "Higher Studies",
    status: "Generated",
  },
  {
    tcNo: "TC/24-25/0002",
    studentName: "Sneha Reddy",
    rollNo: "23EC1123",
    course: "B.Tech ECE",
    dateOfLeaving: "19 May 2025",
    reasonForLeaving: "Higher Studies",
    status: "Generated",
  },
  {
    tcNo: "TC/24-25/0005",
    studentName: "Karthik V",
    rollNo: "23IT1205",
    course: "B.Tech IT",
    dateOfLeaving: "16 May 2025",
    reasonForLeaving: "Personal",
    status: "Draft",
  },
];

const statusClasses: Record<TransferCertificate["status"], string> = {
  Generated: "bg-[#CFF7CB] text-[#16803A]",
  Draft: "bg-[#FFF4DB] text-[#D97706]",
};

export function TransferCertificatesScreen({
  onSelectBonafides,
}: {
  onSelectBonafides: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="flex flex-wrap items-center gap-4 text-[24px] font-bold leading-tight md:text-[28px]">
          <button
            type="button"
            onClick={onSelectBonafides}
            className="cursor-pointer text-[#17213D] transition-colors hover:text-[#43C17A]"
          >
            Bonafides
          </button>
          <span className="text-[#17213D]">/</span>
          <span className="text-[#43C17A]">Transfer Certificate</span>
        </h1>
        <p className="mt-1 text-[13px] font-medium text-[#7B8AA3]">
          Create, review, and issue student certificate requests.
        </p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[26px] font-bold text-[#17213D]">
          Transfer Certificates (TC)
        </h2>

        <button
          type="button"
          className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(67,193,122,0.18)]"
        >
          <Plus size={15} weight="bold" />
          Create TC
        </button>
      </section>

      <section className="rounded-lg border border-[#E7ECF3] bg-white px-5 py-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_170px_170px_220px_42px]">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#303642]">
              Search Students
            </span>
            <span className="flex h-10 items-center gap-2 rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-[#637089]">
              <MagnifyingGlass size={16} weight="bold" />
              <input
                type="search"
                placeholder="Search by TC No., Roll No., Student Name..."
                className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#8A96A8]"
              />
            </span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#303642]">Course</span>
            <button
              type="button"
              className="flex h-10 cursor-pointer items-center justify-between rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-left text-[12px] font-medium text-[#303642]"
            >
              All Courses
              <CaretDown size={14} weight="bold" className="text-[#7B8AA3]" />
            </button>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#303642]">Status</span>
            <button
              type="button"
              className="flex h-10 cursor-pointer items-center justify-between rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-left text-[12px] font-medium text-[#303642]"
            >
              All Status
              <CaretDown size={14} weight="bold" className="text-[#7B8AA3]" />
            </button>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#303642]">
              Date Range
            </span>
            <button
              type="button"
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-left text-[12px] font-medium text-[#303642]"
            >
              <CalendarBlank size={15} weight="regular" />
              <span className="whitespace-nowrap">01 Apr 2024 - 20 May 2025</span>
            </button>
          </label>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              aria-label="Filter transfer certificates"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-[#C9D0D9] bg-[#F8FAFC] text-[#303642]"
            >
              <FunnelSimple size={17} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-[#E7ECF3] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-[#F5F5F5] text-[10px] font-bold uppercase tracking-[0.08em] text-[#596579]">
              <tr>
                <th className="px-5 py-4">TC No.</th>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Roll No.</th>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Date of Leaving</th>
                <th className="px-5 py-4">Reason for Leaving</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6] text-[12px] text-[#303642]">
              {transferCertificates.map((certificate, index) => (
                <tr key={`${certificate.tcNo}-${index}`}>
                  <td className="px-5 py-5 font-bold text-[#16803A]">
                    {certificate.tcNo}
                  </td>
                  <td className="px-5 py-5 font-bold text-[#17213D]">
                    {certificate.studentName}
                  </td>
                  <td className="px-5 py-5 font-medium">{certificate.rollNo}</td>
                  <td className="px-5 py-5 font-medium">{certificate.course}</td>
                  <td className="px-5 py-5 font-medium">
                    {certificate.dateOfLeaving}
                  </td>
                  <td className="px-5 py-5 font-medium">
                    {certificate.reasonForLeaving}
                  </td>
                  <td className="px-5 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
                        statusClasses[certificate.status]
                      }`}
                    >
                      {certificate.status}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex justify-end gap-5 text-[#16803A]">
                      <button
                        type="button"
                        aria-label={`View ${certificate.tcNo}`}
                        className="cursor-pointer"
                      >
                        <Eye size={17} weight="bold" />
                      </button>
                      {certificate.status === "Generated" ? (
                        <button
                          type="button"
                          aria-label={`Download ${certificate.tcNo}`}
                          className="cursor-pointer"
                        >
                          <DownloadSimple size={17} weight="bold" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Delete ${certificate.tcNo}`}
                          className="cursor-pointer text-[#263241]"
                        >
                          <Trash size={17} weight="bold" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
