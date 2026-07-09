import toast from "react-hot-toast";
import {
  CalendarBlank,
  CaretDown,
  DownloadSimple,
  Eye,
  MagnifyingGlass,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import { downloadBonafidePdf } from "./BonafidePreviewScreen";
import TableComponent from "@/app/utils/table/table";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { useState } from "react";
import { deleteBonafideCertificate } from "@/lib/helpers/accountant/bonafideCertificatesAPI";

export type BonafideCertificate = {
  collegeBonafideId?: number;
  collegeEducationId?: number;
  studentId?: number;
  bonafideNo: string;
  admissionNo?: string;
  studentName: string;
  fatherName?: string;
  rollNo?: string;
  educationType: string;
  branch: string;
  courseYear?: string;
  purpose: string;
  dateIssued: string;
  dateIssuedIso?: string;
  academicYear?: string;
  studentType?: string;
  conduct?: string;
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
  academicYears,
  certificates,
  error,
  isLoading,
  search,
  selectedAcademicYear,
  status,
  dateIssued,
  onAcademicYearChange,
  onSearchChange,
  onStatusChange,
  onDateChange,
  onViewCertificate,
  onEditCertificate,
  onDeleteSuccess,
}: {
  academicYears: string[];
  certificates: BonafideCertificate[];
  error: string | null;
  isLoading: boolean;
  search: string;
  selectedAcademicYear: string;
  status: "All" | "Issued" | "Draft";
  dateIssued: string;
  onAcademicYearChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "All" | "Issued" | "Draft") => void;
  onDateChange: (value: string) => void;
  onViewCertificate: (certificate: BonafideCertificate) => void;
  onEditCertificate: (certificate: BonafideCertificate) => void;
  onDeleteSuccess: () => void;
}) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<BonafideCertificate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!certificateToDelete?.collegeBonafideId) return;
    setIsDeleting(true);
    try {
      await deleteBonafideCertificate(certificateToDelete.collegeBonafideId);
      toast.success("Bonafide certificate deleted successfully");
      setDeleteModalOpen(false);
      onDeleteSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete certificate");
    } finally {
      setIsDeleting(false);
      setCertificateToDelete(null);
    }
  };
  return (
    <section className="overflow-hidden rounded-lg border border-[#E7ECF3] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <div className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(260px,1fr)_180px_150px_170px]">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#303642]">Search</span>
          <span className="flex h-10 items-center gap-2 rounded-md border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-[#637089]">
            <MagnifyingGlass size={17} weight="bold" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by Student Name..."
              className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#8A96A8]"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#303642]">Academic Year</span>
          <span
            className="relative flex h-10 items-center rounded-md border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-left text-[12px] font-semibold text-[#303642]"
          >
            <select
              value={selectedAcademicYear}
              onChange={(event) => onAcademicYearChange(event.target.value)}
              className="h-full w-full cursor-pointer appearance-none bg-transparent pr-6 text-[12px] font-semibold text-[#303642] outline-none"
            >
              <option value="All">All Academic Years</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <CaretDown
              size={14}
              weight="bold"
              className="pointer-events-none absolute right-3 text-[#7B8AA3]"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#303642]">Status</span>
          <span
            className="relative flex h-10 items-center rounded-md border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-left text-[12px] font-semibold text-[#303642]"
          >
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value as "All" | "Issued" | "Draft")}
              className="h-full w-full cursor-pointer appearance-none bg-transparent pr-6 text-[12px] font-semibold text-[#303642] outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Issued">Issued</option>
              <option value="Draft">Draft</option>
            </select>
            <CaretDown
              size={14}
              weight="bold"
              className="pointer-events-none absolute right-3 text-[#7B8AA3]"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-[#303642]">Date Issued</span>
          <input
            type="date"
            value={dateIssued}
            onChange={(e) => onDateChange(e.target.value)}
            className="flex h-10 items-center rounded-md border border-[#D7DEE8] bg-[#F8FAFC] px-3 text-left text-[12px] font-medium text-[#303642] outline-none cursor-pointer"
          />
        </label>
      </div>

      <TableComponent
        columns={[
          { title: "Bonafide No.", key: "bonafideNo" },
          { title: "Student Name", key: "studentName" },
          { title: "Education Type", key: "educationType" },
          { title: "Branch", key: "branch" },
          { title: "Purpose", key: "purpose" },
          { title: "Date Issued", key: "dateIssued" },
          { title: "Status", key: "status" },
          { title: <div className="text-right">Actions</div>, key: "actions" },
        ]}
        tableData={certificates.map((cert) => ({
          bonafideNo: <span className="font-bold text-[#16803A]">{cert.bonafideNo}</span>,
          studentName: <span className="font-bold text-[#17213D]">{cert.studentName}</span>,
          educationType: <span className="font-medium">{cert.educationType}</span>,
          branch: (
            <span
              className={`rounded px-2 py-1 text-[10px] font-bold ${
                branchClasses[cert.branch] ?? "bg-[#F0F3F8] text-[#596579]"
              }`}
            >
              {cert.branch}
            </span>
          ),
          purpose: <span className="font-medium">{cert.purpose}</span>,
          dateIssued: <span className="font-medium">{cert.dateIssued}</span>,
          status: (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                statusClasses[cert.status]
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {cert.status}
            </span>
          ),
          actions: (
            <div className="flex justify-end gap-3 text-[#263241]">
              {cert.status === "Issued" ? (
                <>
                  <button
                    type="button"
                    aria-label={`View ${cert.bonafideNo}`}
                    onClick={() => onViewCertificate(cert)}
                    className="cursor-pointer text-[#7B8AA3] hover:text-[#17213D] transition-colors h-7 w-7 flex justify-center items-center rounded hover:bg-[#F3F5F7]"
                    title="View"
                  >
                    <Eye size={17} weight="bold" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Edit ${cert.bonafideNo}`}
                    onClick={() => onEditCertificate(cert)}
                    className="cursor-pointer text-[#7B8AA3] hover:text-[#17213D] transition-colors h-7 w-7 flex justify-center items-center rounded hover:bg-[#F3F5F7]"
                    title="Edit"
                  >
                    <PencilSimple size={17} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.promise(downloadBonafidePdf(cert), {
                        loading: "Downloading PDF...",
                        success: "PDF downloaded successfully!",
                        error: "Failed to download PDF.",
                      });
                    }}
                    className="cursor-pointer text-[#7B8AA3] hover:text-[#17213D] transition-colors h-7 w-7 flex justify-center items-center rounded hover:bg-[#F3F5F7]"
                    title="Download"
                  >
                    <DownloadSimple size={17} weight="bold" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    aria-label={`Edit ${cert.bonafideNo}`}
                    onClick={() => onEditCertificate(cert)}
                    className="cursor-pointer text-[#7B8AA3] hover:text-[#17213D] transition-colors h-7 w-7 flex justify-center items-center rounded hover:bg-[#F3F5F7]"
                    title="Edit"
                  >
                    <PencilSimple size={17} weight="bold" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${cert.bonafideNo}`}
                    onClick={() => {
                      setCertificateToDelete(cert);
                      setDeleteModalOpen(true);
                    }}
                    className="cursor-pointer text-[#7B8AA3] hover:text-[#17213D] transition-colors h-7 w-7 flex justify-center items-center rounded hover:bg-[#F3F5F7]"
                    title="Delete"
                  >
                    <Trash size={17} weight="bold" />
                  </button>
                </>
              )}
            </div>
          ),
        }))}
        isLoading={isLoading}
        emptyStateMessage={error ? error : "No bonafide certificates found."}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Delete"
        name="bonafide certificate"
        isDeleting={isDeleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCertificateToDelete(null);
        }}
        onConfirm={handleDelete}
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        actionType="remove"
      />
    </section>
  );
}
