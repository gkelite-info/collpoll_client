"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import ActionBar from "@/app/components/SharedDrive/components/actionBar";
import FilesTable from "@/app/components/SharedDrive/components/allFilesTable";
import { FolderCard } from "@/app/components/SharedDrive/components/folderCard";
import NewFolderModal from "@/app/components/SharedDrive/components/modal/newFolderModal";
import RecentFileCard from "@/app/components/SharedDrive/components/recentFileCard";
import type { DriveFileRow } from "@/lib/helpers/drive/driveFilesAPI";
import { useMemo, useState } from "react";

type SortOption = "latest" | "name" | "size";

const folders = [
  {
    driveFolderId: 1,
    name: "Fee Receipts",
    filesCount: 23,
    sizeLabel: "137 MB",
    color: "#0BA968",
  },
  {
    driveFolderId: 2,
    name: "Invoices",
    filesCount: 26,
    sizeLabel: "94 MB",
    color: "#FF8A3C",
  },
  {
    driveFolderId: 3,
    name: "Scholarships",
    filesCount: 9,
    sizeLabel: "42 MB",
    color: "#265DAB",
  },
  {
    driveFolderId: 4,
    name: "Audit Reports",
    filesCount: 13,
    sizeLabel: "121 MB",
    color: "#9C6ADE",
  },
  {
    driveFolderId: 5,
    name: "Certificates",
    filesCount: 18,
    sizeLabel: "76 MB",
    color: "#EF5DA8",
  },
  {
    driveFolderId: 6,
    name: "Payroll",
    filesCount: 16,
    sizeLabel: "88 MB",
    color: "#0BA968",
  },
];

const recentFiles = [
  {
    driveFileId: 1,
    driveFolderId: 1,
    fileName: "Fee_Receipt_June_2026.pdf",
    fileType: "pdf",
    fileSize: 1_048_576,
    collegeId: 1,
    fileUrl: "#",
    uploadedBy: 1,
    createdAt: "2026-07-04T09:30:00.000Z",
    updatedAt: "2026-07-04T09:30:00.000Z",
    is_deleted: false,
    deletedAt: null,
  },
  {
    driveFileId: 2,
    driveFolderId: 2,
    fileName: "Vendor_Invoice_2451.pdf",
    fileType: "pdf",
    fileSize: 1_048_576,
    collegeId: 1,
    fileUrl: "#",
    uploadedBy: 1,
    createdAt: "2026-07-03T10:20:00.000Z",
    updatedAt: "2026-07-03T10:20:00.000Z",
    is_deleted: false,
    deletedAt: null,
  },
  {
    driveFileId: 3,
    driveFolderId: 4,
    fileName: "Internal_Audit_Q1.xlsx",
    fileType: "xlsx",
    fileSize: 2_097_152,
    collegeId: 1,
    fileUrl: "#",
    uploadedBy: 1,
    createdAt: "2026-07-02T11:00:00.000Z",
    updatedAt: "2026-07-02T11:00:00.000Z",
    is_deleted: false,
    deletedAt: null,
  },
  {
    driveFileId: 4,
    driveFolderId: 6,
    fileName: "Payroll_Summary_June.docx",
    fileType: "docx",
    fileSize: 734_003,
    collegeId: 1,
    fileUrl: "#",
    uploadedBy: 1,
    createdAt: "2026-07-01T12:45:00.000Z",
    updatedAt: "2026-07-01T12:45:00.000Z",
    is_deleted: false,
    deletedAt: null,
  },
] satisfies DriveFileRow[];

const allFiles = [
  ...recentFiles,
  {
    driveFileId: 5,
    driveFolderId: 5,
    fileName: "Bonafide_Register.pdf",
    fileType: "pdf",
    fileSize: 2_411_724,
    collegeId: 1,
    fileUrl: "#",
    uploadedBy: 1,
    createdAt: "2026-06-30T08:30:00.000Z",
    updatedAt: "2026-06-30T08:30:00.000Z",
    is_deleted: false,
    deletedAt: null,
  },
  {
    driveFileId: 6,
    driveFolderId: 3,
    fileName: "Scholarship_Approvals.zip",
    fileType: "zip",
    fileSize: 3_670_016,
    collegeId: 1,
    fileUrl: "#",
    uploadedBy: 1,
    createdAt: "2026-06-29T14:10:00.000Z",
    updatedAt: "2026-06-29T14:10:00.000Z",
    is_deleted: false,
    deletedAt: null,
  },
] satisfies DriveFileRow[];

const formatSize = (bytes: number | null) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function AccountantDrivePage() {
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [folderItems, setFolderItems] = useState(folders);

  const sortedFolders = useMemo(() => {
    const nextFolders = [...folderItems];
    if (sortBy === "name") {
      return nextFolders.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "size") {
      return nextFolders.sort((a, b) => b.filesCount - a.filesCount);
    }
    return nextFolders;
  }, [folderItems, sortBy]);

  const sortedFiles = useMemo(() => {
    const nextFiles = [...allFiles];
    if (sortBy === "name") {
      return nextFiles.sort((a, b) => a.fileName.localeCompare(b.fileName));
    }
    if (sortBy === "size") {
      return nextFiles.sort((a, b) => (b.fileSize ?? 0) - (a.fileSize ?? 0));
    }
    return nextFiles.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [sortBy]);

  return (
    <div className="flex h-screen flex-col overflow-hidden max-md:bg-[#F4F5F6]">
      <div className="sticky top-0 z-10 shrink-0 bg-[#F5F5F5] px-4 pb-3 pt-4 max-md:bg-[#F4F5F6]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#282828] max-md:text-[22px]">
              Drive
            </h1>
            <p className="text-[#282828] max-md:text-sm max-md:text-gray-600">
              Manage, organize & monitor all accountant files
            </p>
          </div>
          <article className="flex w-[32%] justify-end max-md:hidden">
            <CourseScheduleCard style="w-[320px]" isVisibile={false} />
          </article>
        </div>

        <ActionBar
          sortBy={sortBy}
          onSort={(value) => setSortBy(value as SortOption)}
          onNew={() => setIsNewFolderOpen(true)}
          onFilters={() => undefined}
          isVisible={false}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 max-md:pb-24">
        <section className="mt-6 max-md:mt-4">
          <h2 className="mb-2 text-md font-semibold text-[#282828] max-md:text-[17px]">
            Folders
          </h2>

          <div className="mt-2 flex gap-4 overflow-x-auto pb-2 max-md:grid max-md:grid-cols-2 max-md:gap-3 max-md:overflow-visible">
            {sortedFolders.map((folder) => (
              <FolderCard
                key={folder.driveFolderId}
                {...folder}
                onRename={() => undefined}
                onDelete={() => undefined}
                onClick={() => undefined}
              />
            ))}
          </div>
        </section>

        <section className="mt-6 max-md:mt-5">
          <h2 className="mb-2 text-md font-semibold text-[#282828] max-md:text-[17px]">
            Recent
          </h2>

          <div className="scrollbar-hide mt-2 flex gap-4 overflow-x-auto pb-1">
            {recentFiles.map((file) => (
              <RecentFileCard
                key={file.driveFileId}
                name={file.fileName}
                type={file.fileName.split(".").pop()?.toUpperCase() ?? "FILE"}
                sizeLabel={formatSize(file.fileSize)}
                date={formatDate(file.createdAt)}
              />
            ))}
          </div>
        </section>

        <section className="mt-6 max-md:mt-5">
          <h2 className="mb-2 text-md font-semibold text-[#282828] max-md:text-[17px]">
            All Files
          </h2>

          <FilesTable
            files={sortedFiles}
            onDelete={() => undefined}
            onDownload={() => undefined}
          />
        </section>
      </div>

      <NewFolderModal
        open={isNewFolderOpen}
        onCancel={() => setIsNewFolderOpen(false)}
        onSave={(folder) => {
          setFolderItems((currentFolders) => [
            {
              driveFolderId:
                Math.max(...currentFolders.map((item) => item.driveFolderId)) +
                1,
              name: folder.name,
              filesCount: 0,
              sizeLabel: "0 KB",
              color: folder.color,
            },
            ...currentFolders,
          ]);
          setIsNewFolderOpen(false);
        }}
      />
    </div>
  );
}
