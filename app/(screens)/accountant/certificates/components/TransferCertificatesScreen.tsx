"use client";

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
import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import { TransferCreateForm, type TransferCertificateData } from "./TransferCreateForm";
import { TransferPreviewScreen, TransferCertificateLayout } from "./TransferPreviewScreen";
import { TransferUploadHeaderScreen, type HeaderConfig } from "./TransferUploadHeaderScreen";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

// Add status to the certificate data
type TCCertificate = TransferCertificateData & {
  status: "Generated" | "Draft";
};

const INITIAL_CERTIFICATES: TCCertificate[] = [
  {
    tcNo: "TC/24-25/0001",
    studentName: "Arun Kumar",
    rollNo: "23CS1056",
    admissionNo: "23CS2023",
    fatherName: "Suresh Kumar",
    motherName: "Meena Kumar",
    course: "B.Tech",
    subCourse: "CSE",
    courseYear: "III Year",
    academicYear: "2024 - 2025",
    batchCode: "CS23A",
    date: "2025-05-20",
    classAtLeaving: "III Year B.Tech CSE",
    dateOfAdmission: "2023-07-15",
    dateOfLeaving: "2025-05-20",
    dateOfBirth: "2005-06-15",
    conductRemarks: "Satisfactory",
    reasonForLeaving: "Higher Studies",
    belongsToScStBc: "BC-B",
    receiptOfScholarship: "Yes",
    status: "Generated"
  },
  {
    tcNo: "TC/24-25/0002",
    studentName: "Sneha Reddy",
    rollNo: "23EC1123",
    admissionNo: "23EC2045",
    fatherName: "Mallesham Reddy",
    motherName: "Latha Reddy",
    course: "B.Tech",
    subCourse: "ECE",
    courseYear: "III Year",
    academicYear: "2024 - 2025",
    batchCode: "EC23B",
    date: "2025-05-19",
    classAtLeaving: "III Year B.Tech ECE",
    dateOfAdmission: "2023-07-16",
    dateOfLeaving: "2025-05-19",
    dateOfBirth: "2005-08-20",
    conductRemarks: "Good",
    reasonForLeaving: "Higher Studies",
    belongsToScStBc: "OC",
    receiptOfScholarship: "No",
    status: "Generated"
  },
  {
    tcNo: "TC/24-25/0005",
    studentName: "Karthik V",
    rollNo: "23IT1205",
    admissionNo: "23IT2098",
    fatherName: "Venkatesh V",
    motherName: "Padma V",
    course: "B.Tech",
    subCourse: "IT",
    courseYear: "III Year",
    academicYear: "2024 - 2025",
    batchCode: "IT23A",
    date: "2025-05-16",
    classAtLeaving: "III Year B.Tech IT",
    dateOfAdmission: "2023-07-18",
    dateOfLeaving: "2025-05-16",
    dateOfBirth: "2005-12-10",
    conductRemarks: "Satisfactory",
    reasonForLeaving: "Personal Reasons",
    belongsToScStBc: "BC-D",
    receiptOfScholarship: "Yes",
    status: "Draft"
  }
];

const statusClasses: Record<TCCertificate["status"], string> = {
  Generated: "bg-[#CFF7CB] text-[#16803A]",
  Draft: "bg-[#FFF4DB] text-[#D97706]",
};

export function TransferCertificatesScreen({
  onSelectBonafides,
}: {
  onSelectBonafides: () => void;
}) {
  const [view, setView] = useState<"list" | "create" | "preview" | "upload-header">("list");
  const [certificates, setCertificates] = useState<TCCertificate[]>(INITIAL_CERTIFICATES);
  const [currentCertData, setCurrentCertData] = useState<TransferCertificateData | null>(null);
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    collegeName: "RATNAPURI INSTITUTE OF TECHNOLOGY COLLEGE OF POLYTECHNIC",
    affiliation: "(Affiliated to State Board of Technical Education)",
    address: "RATNAPURI, Turkala Khanapur (V), Hathnoora Mandal, Sangareddy District, Telangana State.",
    phone: "08458-288974, 9505504219"
  });

  // Filters State
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filter dropdown state
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Deletion State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<TCCertificate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Trigger TC Generation
  const handlePreviewTC = (data: TransferCertificateData) => {
    setCurrentCertData(data);
    setView("preview");
  };

  const handleSaveOrGenerate = (isDraft: boolean) => {
    if (!currentCertData) return;

    const newTC: TCCertificate = {
      ...currentCertData,
      status: isDraft ? "Draft" : "Generated"
    };

    setCertificates((prev) => {
      // Check if editing an existing TC (by matching rollNo/tcNo)
      const existsIdx = prev.findIndex((item) => item.tcNo === newTC.tcNo);
      if (existsIdx > -1) {
        const updated = [...prev];
        updated[existsIdx] = newTC;
        return updated;
      }
      return [newTC, ...prev];
    });

    toast.success(isDraft ? "TC saved as draft!" : "TC generated successfully!");
    setView("list");
    setCurrentCertData(null);
  };

  const handleDeleteTrigger = (cert: TCCertificate) => {
    setCertToDelete(cert);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!certToDelete) return;
    setIsDeleting(true);
    // Simulate API deletion
    await new Promise((resolve) => setTimeout(resolve, 800));
    setCertificates((prev) => prev.filter((item) => item.tcNo !== certToDelete.tcNo));
    toast.success("Transfer Certificate deleted successfully");
    setDeleteModalOpen(false);
    setCertToDelete(null);
    setIsDeleting(false);
  };

  // Filtered certificates computed property
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.studentName.toLowerCase().includes(search.toLowerCase()) ||
        cert.rollNo.toLowerCase().includes(search.toLowerCase()) ||
        cert.tcNo.toLowerCase().includes(search.toLowerCase());

      const matchesCourse =
        courseFilter === "All" ||
        `${cert.course} ${cert.subCourse}`.toLowerCase().includes(courseFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || cert.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [certificates, search, courseFilter, statusFilter]);

  // List of distinct courses for dropdown filter
  const distinctCourses = ["All", "B.Tech CSE", "B.Tech ECE", "B.Tech IT"];

  if (view === "create") {
    return (
      <TransferCreateForm
        initialCertificate={currentCertData}
        onCancel={() => {
          setView("list");
          setCurrentCertData(null);
        }}
        onPreview={handlePreviewTC}
        onUploadHeader={(data) => {
          setCurrentCertData(data);
          setView("upload-header");
        }}
      />
    );
  }

  if (view === "upload-header") {
    return (
      <TransferUploadHeaderScreen
        config={headerConfig}
        onCancel={() => setView("create")}
        onSave={(updatedConfig) => {
          setHeaderConfig(updatedConfig);
          setView("preview");
        }}
        onDraft={() => {
          handleSaveOrGenerate(true);
        }}
      />
    );
  }

  if (view === "preview" && currentCertData) {
    return (
      <TransferPreviewScreen
        data={currentCertData}
        headerConfig={headerConfig}
        onBack={() => setView("create")}
        onCancel={() => {
          setView("list");
          setCurrentCertData(null);
        }}
        onGenerate={handleSaveOrGenerate}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
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

      {/* Action panel */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[26px] font-bold text-[#17213D]">
          Transfer Certificates (TC)
        </h2>

        <button
          type="button"
          onClick={() => setView("create")}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(67,193,122,0.18)] hover:bg-[#349c61] transition-all"
        >
          <Plus size={15} weight="bold" />
          Create TC
        </button>
      </section>

      {/* Filter panel */}
      <section className="rounded-lg border border-[#E7ECF3] bg-white px-5 py-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_170px_170px_220px_42px]">
          {/* Search box */}
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#303642]">
              Search Students
            </span>
            <span className="flex h-10 items-center gap-2 rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-[#637089] focus-within:border-[#43C17A] focus-within:bg-white transition-all">
              <MagnifyingGlass size={16} weight="bold" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by TC No., Roll No., Student Name..."
                className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#17213D] outline-none placeholder:text-[#8A96A8]"
              />
            </span>
          </label>

          {/* Course filter */}
          <label className="flex flex-col gap-2 relative">
            <span className="text-[11px] font-semibold text-[#303642]">Course</span>
            <button
              type="button"
              onClick={() => {
                setCourseDropdownOpen(!courseDropdownOpen);
                setStatusDropdownOpen(false);
              }}
              className="flex h-10 cursor-pointer items-center justify-between rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-left text-[12px] font-medium text-[#303642] hover:bg-slate-50 transition-colors"
            >
              {courseFilter === "All" ? "All Courses" : courseFilter}
              <CaretDown size={14} weight="bold" className="text-[#7B8AA3]" />
            </button>

            {courseDropdownOpen && (
              <div className="absolute top-16 left-0 w-full bg-white border border-[#E7ECF3] rounded-md shadow-lg z-20 overflow-hidden">
                {distinctCourses.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCourseFilter(c);
                      setCourseDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-slate-50 transition-colors cursor-pointer text-[#303642]"
                  >
                    {c === "All" ? "All Courses" : c}
                  </button>
                ))}
              </div>
            )}
          </label>

          {/* Status filter */}
          <label className="flex flex-col gap-2 relative">
            <span className="text-[11px] font-semibold text-[#303642]">Status</span>
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setCourseDropdownOpen(false);
              }}
              className="flex h-10 cursor-pointer items-center justify-between rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-left text-[12px] font-medium text-[#303642] hover:bg-slate-50 transition-colors"
            >
              {statusFilter === "All" ? "All Status" : statusFilter}
              <CaretDown size={14} weight="bold" className="text-[#7B8AA3]" />
            </button>

            {statusDropdownOpen && (
              <div className="absolute top-16 left-0 w-full bg-white border border-[#E7ECF3] rounded-md shadow-lg z-20 overflow-hidden">
                {["All", "Generated", "Draft"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStatusFilter(s);
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-slate-50 transition-colors cursor-pointer text-[#303642]"
                  >
                    {s === "All" ? "All Status" : s}
                  </button>
                ))}
              </div>
            )}
          </label>

          {/* Date range (decorative) */}
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#303642]">
              Date Range
            </span>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-md border border-[#C9D0D9] bg-[#F8FAFC] px-3 text-left text-[12px] font-medium text-[#303642] opacity-80 cursor-default"
            >
              <CalendarBlank size={15} weight="regular" />
              <span className="whitespace-nowrap">01 Apr 2024 - 20 May 2025</span>
            </button>
          </label>

          {/* Filter button */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              aria-label="Filter transfer certificates"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-[#C9D0D9] bg-[#F8FAFC] text-[#303642] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <FunnelSimple size={17} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      {/* Table section */}
      <section className="overflow-hidden rounded-lg border border-[#E7ECF3] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-[#F5F5F5] text-[10px] font-bold uppercase tracking-[0.08em] text-[#596579] border-b border-[#EDF1F6]">
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
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((certificate, index) => (
                  <tr key={`${certificate.tcNo}-${index}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-5 font-bold text-[#16803A]">
                      {certificate.tcNo}
                    </td>
                    <td className="px-5 py-5 font-bold text-[#17213D]">
                      {certificate.studentName}
                    </td>
                    <td className="px-5 py-5 font-semibold text-[#17213D]">{certificate.rollNo}</td>
                    <td className="px-5 py-5 font-medium">{`${certificate.course} ${certificate.subCourse}`}</td>
                    <td className="px-5 py-5 font-medium">
                      {new Date(certificate.dateOfLeaving).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                      <div className="flex justify-end gap-5 text-[#263241]">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentCertData(certificate);
                            setView("preview");
                          }}
                          aria-label={`View ${certificate.tcNo}`}
                          className="cursor-pointer text-[#7B8AA3] hover:text-[#17213D] transition-colors p-1 rounded hover:bg-slate-100"
                        >
                          <Eye size={17} weight="bold" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleDeleteTrigger(certificate)}
                          aria-label={`Delete ${certificate.tcNo}`}
                          className="cursor-pointer text-[#7B8AA3] hover:text-[#E11D48] transition-colors p-1 rounded hover:bg-slate-100"
                        >
                          <Trash size={17} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400 font-medium">
                    No transfer certificates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Deletion confirmation modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Delete"
        name="transfer certificate"
        isDeleting={isDeleting}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCertToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        actionType="remove"
      />
    </div>
  );
}
