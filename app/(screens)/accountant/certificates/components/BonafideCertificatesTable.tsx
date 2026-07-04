import {
  CalendarBlank,
  CaretDown,
  DownloadSimple,
  Eye,
  MagnifyingGlass,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";

export type BonafideCertificate = {
  bonafideNo: string;
  studentName: string;
  educationType: string;
  branch: string;
  purpose: string;
  dateIssued: string;
  status: "Issued" | "Draft";
};

const statusClasses: Record<BonafideCertificate["status"], string> = {
  Issued: "bg-[#EAF8EF] text-[#16803A]",
  Draft: "bg-[#FFF4DB] text-[#D97706]",
};

const branchClasses: Record<string, string> = {
  CSE: "bg-[#EAF1FF] text-[#2D6BFF]",
  IT: "bg-[#EEF4FF] text-[#4F6BFF]",
  ME: "bg-[#F0F6FF] text-[#3375E8]",
  ECE: "bg-[#EAF1FF] text-[#2D6BFF]",
};

export function BonafideCertificatesTable({
  certificates,
  onViewCertificate,
  onEditCertificate,
}: {
  certificates: BonafideCertificate[];
  onViewCertificate: () => void;
  onEditCertificate: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E7ECF3] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <div className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(260px,1fr)_160px_150px_170px]">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#303642]">Search</span>
          <span className="flex h-10 items-center gap-2 rounded-md border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-[#637089]">
            <MagnifyingGlass size={17} weight="bold" />
            <input
              type="search"
              placeholder="Search by Bonafide No., Student Name..."
              className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#8A96A8]"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#303642]">Academic Year</span>
          <button
            type="button"
            className="flex h-10 cursor-pointer items-center justify-between rounded-md border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-left text-[12px] font-semibold text-[#303642]"
          >
            2024 - 2025
            <CaretDown size={14} weight="bold" className="text-[#7B8AA3]" />
          </button>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#303642]">Status</span>
          <button
            type="button"
            className="flex h-10 cursor-pointer items-center justify-between rounded-md border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-left text-[12px] font-semibold text-[#303642]"
          >
            All Statuses
            <CaretDown size={14} weight="bold" className="text-[#7B8AA3]" />
          </button>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-[#303642]">Date Range</span>
          <button
            type="button"
            className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-[#C9D0D9] bg-[#F7F8F7] px-3 text-left text-[12px] font-medium text-[#303642]"
          >
            <CalendarBlank size={15} weight="regular" className="text-[#303642]" />
            <span className="whitespace-nowrap">01 May - 20 May 2025</span>
          </button>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left">
          <thead className="bg-[#F5F6F8] text-[10px] font-bold uppercase tracking-[0.08em] text-[#596579]">
            <tr>
              <th className="px-5 py-4">Bonafide No.</th>
              <th className="px-5 py-4">Student Name</th>
              <th className="px-5 py-4">Education Type</th>
              <th className="px-5 py-4">Branch</th>
              <th className="px-5 py-4">Purpose</th>
              <th className="px-5 py-4">Date Issued</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF1F6] text-[12px] text-[#242A35]">
            {certificates.map((certificate) => (
              <tr key={`${certificate.bonafideNo}-${certificate.studentName}`}>
                <td className="px-5 py-5 font-bold text-[#16803A]">
                  {certificate.bonafideNo}
                </td>
                <td className="px-5 py-5 font-bold text-[#17213D]">
                  {certificate.studentName}
                </td>
                <td className="px-5 py-5 font-medium">{certificate.educationType}</td>
                <td className="px-5 py-5">
                  <span
                    className={`rounded px-2 py-1 text-[10px] font-bold ${
                      branchClasses[certificate.branch] ?? "bg-[#F0F3F8] text-[#596579]"
                    }`}
                  >
                    {certificate.branch}
                  </span>
                </td>
                <td className="px-5 py-5 font-medium">{certificate.purpose}</td>
                <td className="px-5 py-5 font-medium">{certificate.dateIssued}</td>
                <td className="px-5 py-5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                      statusClasses[certificate.status]
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {certificate.status}
                  </span>
                </td>
                <td className="px-5 py-5">
                  <div className="flex justify-end gap-3 text-[#263241]">
                    {certificate.status === "Issued" ? (
                      <>
                        <button
                          type="button"
                          aria-label={`View ${certificate.bonafideNo}`}
                          onClick={onViewCertificate}
                          className="cursor-pointer"
                        >
                          <Eye size={17} weight="bold" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Edit ${certificate.bonafideNo}`}
                          onClick={onEditCertificate}
                          className="cursor-pointer"
                        >
                          <PencilSimple size={17} weight="bold" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Download ${certificate.bonafideNo}`}
                          className="cursor-pointer"
                        >
                          <DownloadSimple size={17} weight="bold" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          aria-label={`Edit ${certificate.bonafideNo}`}
                          onClick={onEditCertificate}
                          className="cursor-pointer"
                        >
                          <PencilSimple size={17} weight="bold" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${certificate.bonafideNo}`}
                          className="cursor-pointer"
                        >
                          <Trash size={17} weight="bold" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
