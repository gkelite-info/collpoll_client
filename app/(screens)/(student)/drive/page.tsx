"use client";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useState, useEffect } from "react";
import FolderFilesModal from "@/app/components/modals/FolderFilesModal";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { CaretLeftIcon, CaretRight } from "@phosphor-icons/react";
import {
  DriveFolderRow,
  fetchRootDriveFolders,
  saveDriveFolder,
  deleteDriveFolder,
} from "@/lib/helpers/drive/driveFolderAPI";
import {
  DriveFileRow,
  fetchFolderStats,
  fetchRecentDriveFiles,
} from "@/lib/helpers/drive/driveFilesAPI";
import NewFolderModal from "./components/modal/newFolderModal";
import ActionBar from "./components/actionBar";
import { FolderCard } from "./components/folderCard";
import RecentFileCard from "./components/recentFileCard";
import FilesTable from "./components/allFilesTable";
import RenameFolderModal from "./components/modal/renameFolderModal";
import DeleteFolderModal from "./components/modal/deleteFolderModal";
import ReplaceFolderModal from "./components/modal/replaceFolderModal";
import { useTranslations } from "next-intl";

type SortOption = "latest" | "name" | "size";

export type FolderItemProps = {
  driveFolderId: number;
  name: string;
  filesCount: number;
  sizeLabel: string;
  color: string;
};

type RecentFile = {
  driveFileId: number;
  driveFolderId: number;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  createdAt: string;
  accessedAt: string;
};

const MAX_RECENT = 10;
const getRecentKey = (uid: number | null) =>
  `recentlyViewedFiles_${uid ?? "guest"}`;

function formatSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRecentFiles(userId: number | null): RecentFile[] {
  try {
    return JSON.parse(localStorage.getItem(getRecentKey(userId)) ?? "[]");
  } catch {
    return [];
  }
}

function addToRecent(file: DriveFileRow, userId: number | null) {
  const existing = getRecentFiles(userId).filter(
    (f) => f.driveFileId !== file.driveFileId,
  );
  const updated: RecentFile[] = [
    {
      driveFileId: file.driveFileId,
      driveFolderId: file.driveFolderId,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      createdAt: file.createdAt,
      accessedAt: new Date().toISOString(),
    },
    ...existing,
  ].slice(0, MAX_RECENT);
  localStorage.setItem(getRecentKey(userId), JSON.stringify(updated));
  return updated;
}

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 rounded ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

const Page = () => {
  const { collegeId, userId } = useUser();
  const t = useTranslations("Drive.student"); // Hook

  const [collegeName, setCollegeName] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderItemProps[]>([]);
  const [recentFiles, setRecentFiles] = useState<DriveFileRow[]>([]);
  const [recentViewed, setRecentViewed] = useState<RecentFile[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderItemProps | null>(
    null,
  );
  const [folderToRename, setFolderToRename] = useState<FolderItemProps | null>(
    null,
  );
  const [folderToDelete, setFolderToDelete] = useState<FolderItemProps | null>(
    null,
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [toastState, setToastState] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [duplicateFolderData, setDuplicateFolderData] = useState<{
    name: string;
    color: string;
  } | null>(null);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const showToast = (message: string, type: "success" | "error") => {
    setToastState({ message, type });
    setTimeout(() => setToastState(null), 3000);
  };

  useEffect(() => {
    if (userId) setRecentViewed(getRecentFiles(userId));
  }, [userId]);

  useEffect(() => {
    if (!collegeId) return;
    supabase
      .from("colleges")
      .select("collegeName")
      .eq("collegeId", collegeId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCollegeName(data.collegeName);
      });
  }, [collegeId]);

  useEffect(() => {
    if (!collegeId || !userId) return;

    setLoadingFolders(true);
    setLoadingFiles(true);

    Promise.all([
      fetchRootDriveFolders(collegeId, userId),
      fetchFolderStats(collegeId, userId),
      fetchRecentDriveFiles(collegeId, currentPage, rowsPerPage, userId),
    ])
      .then(([folderData, stats, filesResult]) => {
        const savedColors: Record<number, string> = JSON.parse(
          localStorage.getItem("folderColors") ?? "{}",
        );

        setFolders(
          (folderData as DriveFolderRow[]).map((f) => ({
            driveFolderId: f.driveFolderId,
            name: f.folderName,
            color: savedColors[f.driveFolderId] ?? "#0096A6",
            filesCount: stats[f.driveFolderId]?.totalFiles ?? 0,
            sizeLabel: formatSize(stats[f.driveFolderId]?.totalSizeBytes ?? 0),
          })),
        );

        const { data, totalCount } = filesResult as {
          data: DriveFileRow[];
          totalCount: number;
        };
        setRecentFiles(data);
        setTotalRecords(totalCount);
      })
      .catch(() => showToast(t("Failed to load data"), "error"))
      .finally(() => {
        setLoadingFolders(false);
        setLoadingFiles(false);
      });
  }, [collegeId, userId, currentPage]);

  const sortedFolders = [...folders].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "size") return b.filesCount - a.filesCount;
    return 0;
  });

  const sortedFiles = [...recentFiles].sort((a, b) => {
    if (sortBy === "name") return a.fileName.localeCompare(b.fileName);
    if (sortBy === "size") return (b.fileSize ?? 0) - (a.fileSize ?? 0);
    return 0;
  });

  const handleCreateFolder = async (data: { name: string; color: string }) => {
    if (!collegeId || !userId) {
      showToast(t("Missing college or user info"), "error");
      return;
    }

    const existingFolder = folders.find(
      (f) => f.name.toLowerCase().trim() === data.name.toLowerCase().trim(),
    );

    if (existingFolder) {
      setDuplicateFolderData(data);
      setIsReplaceModalOpen(true);
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveDriveFolder(
        { collegeId, folderName: data.name, parentFolderId: null },
        userId,
      );

      if (!result.success) {
        showToast(t("Failed to create folder"), "error");
        return;
      }

      const savedColors: Record<number, string> = JSON.parse(
        localStorage.getItem("folderColors") ?? "{}",
      );
      savedColors[result.driveFolderId!] = data.color;
      localStorage.setItem("folderColors", JSON.stringify(savedColors));

      setFolders((prev) => [
        {
          driveFolderId: result.driveFolderId!,
          name: data.name,
          color: data.color,
          filesCount: 0,
          sizeLabel: "0 KB",
        },
        ...prev,
      ]);

      setIsNewFolderOpen(false);
      showToast(t("Folder created successfully"), "success");
    } catch {
      showToast(t("Something went wrong"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFolderName = async (newName: string) => {
    if (!folderToRename || !collegeId || !userId) return;

    setIsRenaming(true);

    try {
      const result = await saveDriveFolder(
        {
          driveFolderId: folderToRename.driveFolderId,
          collegeId,
          folderName: newName,
          parentFolderId: null,
        },
        userId,
      );

      if (!result.success) {
        showToast(t("Failed to rename folder"), "error");
        return;
      }

      setFolders((prev) =>
        prev.map((f) =>
          f.driveFolderId === folderToRename.driveFolderId
            ? { ...f, name: newName }
            : f,
        ),
      );

      setFolderToRename(null);
      showToast(t("Folder renamed"), "success");
    } catch {
      showToast(t("Something went wrong"), "error");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleConfirmReplace = async () => {
    if (!duplicateFolderData || !collegeId || !userId) return;

    setIsReplaceModalOpen(false);
    setIsSaving(true);

    try {
      const existing = folders.find(
        (f) =>
          f.name.toLowerCase().trim() ===
          duplicateFolderData.name.toLowerCase().trim(),
      );

      if (existing) {
        const deleteResult = await deleteDriveFolder(
          existing.driveFolderId,
          collegeId,
        );
        if (!deleteResult.success) {
          showToast(t("Failed to replace folder"), "error");
          return;
        }
      }

      const result = await saveDriveFolder(
        {
          collegeId,
          folderName: duplicateFolderData.name,
          parentFolderId: null,
        },
        userId,
      );

      if (!result.success) {
        showToast(t("Failed to replace folder"), "error");
        return;
      }

      const savedColors: Record<number, string> = JSON.parse(
        localStorage.getItem("folderColors") ?? "{}",
      );
      savedColors[result.driveFolderId!] = duplicateFolderData.color;
      localStorage.setItem("folderColors", JSON.stringify(savedColors));

      if (existing) {
        delete savedColors[existing.driveFolderId];
        localStorage.setItem("folderColors", JSON.stringify(savedColors));
      }

      setFolders((prev) => [
        {
          driveFolderId: result.driveFolderId!,
          name: duplicateFolderData.name,
          color: duplicateFolderData.color,
          filesCount: 0,
          sizeLabel: "0 KB",
        },
        ...prev.filter(
          (f) =>
            f.name.toLowerCase().trim() !==
            duplicateFolderData.name.toLowerCase().trim(),
        ),
      ]);

      setIsNewFolderOpen(false);
      showToast(t("Folder replaced successfully"), "success");
    } catch {
      showToast(t("Something went wrong"), "error");
    } finally {
      setIsSaving(false);
      setDuplicateFolderData(null);
    }
  };

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete || !collegeId) return;

    setIsDeleting(true);

    try {
      const { data: folderFiles } = await supabase
        .from("drive_files")
        .select("driveFileId, fileName")
        .eq("driveFolderId", folderToDelete.driveFolderId)
        .eq("is_deleted", false);

      if (folderFiles && folderFiles.length > 0) {
        const storagePaths = folderFiles.map(
          (f) =>
            `${collegeId}/${folderToDelete.driveFolderId}/${f.fileName.trim()}`,
        );
        await supabase.storage.from("college-drive").remove(storagePaths);

        await supabase
          .from("drive_files")
          .update({ is_deleted: true, deletedAt: new Date().toISOString() })
          .eq("driveFolderId", folderToDelete.driveFolderId);
      }

      const result = await deleteDriveFolder(
        folderToDelete.driveFolderId,
        collegeId,
      );

      if (!result.success) {
        showToast(t("Failed to delete folder"), "error");
        return;
      }

      setFolders((prev) =>
        prev.filter((f) => f.driveFolderId !== folderToDelete.driveFolderId),
      );

      setRecentFiles((prev) =>
        prev.filter((f) => f.driveFolderId !== folderToDelete.driveFolderId),
      );
      const updatedRecent = getRecentFiles(userId).filter(
        (f) => f.driveFolderId !== folderToDelete.driveFolderId,
      );
      localStorage.setItem(getRecentKey(userId), JSON.stringify(updatedRecent));
      setRecentViewed(updatedRecent);

      const savedColors: Record<number, string> = JSON.parse(
        localStorage.getItem("folderColors") ?? "{}",
      );
      delete savedColors[folderToDelete.driveFolderId];
      localStorage.setItem("folderColors", JSON.stringify(savedColors));

      setFolderToDelete(null);
      showToast(t("Folder and all its files deleted"), "success");
    } catch {
      showToast(t("Something went wrong"), "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilesChanged = (
    driveFolderId: number,
    fileCount: number,
    totalSizeBytes: number,
  ) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.driveFolderId === driveFolderId
          ? {
              ...f,
              filesCount: fileCount,
              sizeLabel: formatSize(totalSizeBytes),
            }
          : f,
      ),
    );

    if (collegeId && userId) {
      fetchFolderStats(collegeId, userId)
        .then((stats) => {
          setFolders((prev) =>
            prev.map((f) => ({
              ...f,
              filesCount: stats[f.driveFolderId]?.totalFiles ?? f.filesCount,
              sizeLabel: formatSize(
                stats[f.driveFolderId]?.totalSizeBytes ?? 0,
              ),
            })),
          );
        })
        .catch(console.error);

      fetchRecentDriveFiles(collegeId, currentPage, rowsPerPage, userId)
        .then(({ data, totalCount }) => {
          setRecentFiles(data as DriveFileRow[]);
          setTotalRecords(totalCount);
        })
        .catch(console.error);
    }
  };

  const handleDownloadFile = async (file: DriveFileRow) => {
    try {
      const storagePath = `${collegeId}/${file.driveFolderId}/${file.fileName.trim()}`;
      const { data, error } = await supabase.storage
        .from("college-drive")
        .createSignedUrl(storagePath, 120);

      if (error || !data?.signedUrl) return;

      const response = await fetch(data.signedUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      const updated = addToRecent(file, userId);
      setRecentViewed(updated);
    } catch {
      console.error("Download failed");
    }
  };

  const handleDeleteFile = async (file: DriveFileRow) => {
    setIsDeletingFile(true);
    setRecentFiles((prev) =>
      prev.filter((f) => f.driveFileId !== file.driveFileId),
    );
    const updatedRecent = getRecentFiles(userId).filter(
      (f) => f.driveFileId !== file.driveFileId,
    );
    localStorage.setItem(getRecentKey(userId), JSON.stringify(updatedRecent));
    setRecentViewed(updatedRecent);

    try {
      const { error } = await supabase
        .from("drive_files")
        .update({ is_deleted: true, deletedAt: new Date().toISOString() })
        .eq("driveFileId", file.driveFileId);

      if (error) {
        setRecentFiles((prev) => [file, ...prev]);
        showToast(t("Failed to delete file"), "error");
      } else {
        showToast(t("File deleted"), "success");
      }
    } catch {
      setRecentFiles((prev) => [file, ...prev]);
      showToast(t("Something went wrong"), "error");
    } finally {
      setIsDeletingFile(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>

      {toastState && (
        <div
          className={`fixed top-5 right-5 z-[200] px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toastState.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
        >
          {toastState.message}
        </div>
      )}

      <NewFolderModal
        open={isNewFolderOpen}
        onCancel={() => !isSaving && setIsNewFolderOpen(false)}
        onSave={handleCreateFolder}
        loading={isSaving}
      />

      <FolderFilesModal
        open={isFilesModalOpen}
        onClose={() => setIsFilesModalOpen(false)}
        folderName={
          selectedFolder
            ? `${collegeName ?? "College"} ( ${selectedFolder.name} )`
            : ""
        }
        driveFolderId={selectedFolder?.driveFolderId ?? null}
        collegeId={collegeId}
        onFilesChanged={handleFilesChanged}
      />

      <div className="bg-[#F5F5F5] px-4 pt-4 pb-3 shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#282828]">
              {t("Drive")}
            </h1>
            <p className="text-[#282828]">
              {t(
                "Manage, organize & monitor all academic and administrative files",
              )}
            </p>
          </div>
          <article className="flex w-[32%] justify-end">
            <CourseScheduleCard style="w-[320px]" />
          </article>
        </div>

        <ActionBar
          sortBy={sortBy}
          onSort={(val) => setSortBy(val as SortOption)}
          onNew={() => setIsNewFolderOpen(true)}
          onFilters={() => console.log("Filters")}
          isVisible={false}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <section className="mt-6">
          <h2 className="text-md font-semibold text-[#282828]">
            {t("Folders")}
          </h2>

          {loadingFolders ? (
            <div className="mt-2 flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden flex min-w-[200px] flex-col rounded-md p-2 bg-gray-100 h-[130px]"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-lg bg-gray-200" />
                    <div className="w-3 h-6 rounded bg-gray-200" />
                  </div>
                  <div className="mt-auto px-1 flex flex-col gap-1">
                    <div className="h-3 w-3/4 rounded bg-gray-200" />
                    <div className="h-2.5 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 flex gap-4 overflow-x-auto pb-2">
              {sortedFolders.map((f) => (
                <FolderCard
                  key={f.driveFolderId}
                  {...f}
                  onRename={() => setFolderToRename(f)}
                  onDelete={() => setFolderToDelete(f)}
                  onClick={() => {
                    setSelectedFolder(f);
                    setIsFilesModalOpen(true);
                  }}
                />
              ))}
              {sortedFolders.length === 0 && (
                <p className="text-sm text-[#9CA3AF] mt-2">
                  {t("No folders yet Click New to create one")}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-md font-semibold text-[#282828]">
            {t("Recent")}
          </h2>

          {loadingFiles ? (
            <div className="mt-2 flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden flex items-center min-w-[220px] rounded-md bg-gray-100 p-3 gap-2"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-3 w-3/4 rounded bg-gray-200" />
                    <div className="h-2.5 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentViewed.length > 0 ? (
            <div className="mt-2 flex gap-4 overflow-x-scroll pb-1">
              {recentViewed.slice(0, 10).map((file) => (
                <RecentFileCard
                  key={file.driveFileId}
                  name={file.fileName}
                  type={file.fileName.split(".").pop()?.toUpperCase() ?? "FILE"}
                  sizeLabel={formatSize(file.fileSize)}
                  date={formatDate(file.accessedAt)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9CA3AF] mt-2">
              {t("No recently viewed files yet")}
            </p>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-md font-semibold text-[#282828]">
            {t("All Files")}
          </h2>

          {loadingFiles ? (
            <div className="mt-2 rounded-2xl bg-white overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden flex gap-4 px-4 py-3 border-b border-gray-100"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  <div className="h-4 flex-[3] rounded bg-gray-200" />
                  <div className="h-4 flex-1 rounded bg-gray-200" />
                  <div className="h-4 flex-1 rounded bg-gray-200" />
                  <div className="h-4 flex-[1.5] rounded bg-gray-200" />
                  <div className="h-8 w-16 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <FilesTable
                files={sortedFiles}
                onDelete={handleDeleteFile}
                onDownload={handleDownloadFile}
                isDeleting={isDeletingFile}
              />

              {totalPages > 1 && (
                <div className="flex justify-end items-center gap-3 mt-4 mb-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                  >
                    <CaretLeftIcon size={18} weight="bold" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-semibold ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                  >
                    <CaretRight size={18} weight="bold" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <RenameFolderModal
        open={!!folderToRename}
        currentName={folderToRename?.name || ""}
        onCancel={() => setFolderToRename(null)}
        onSave={handleSaveFolderName}
        loading={isRenaming}
      />

      <DeleteFolderModal
        open={!!folderToDelete}
        folderName={folderToDelete?.name || ""}
        onCancel={() => setFolderToDelete(null)}
        onConfirm={handleConfirmDeleteFolder}
        loading={isDeleting}
      />

      <ReplaceFolderModal
        open={isReplaceModalOpen}
        folderName={duplicateFolderData?.name || ""}
        onCancel={() => {
          setIsReplaceModalOpen(false);
          setDuplicateFolderData(null);
        }}
        onConfirm={handleConfirmReplace}
        loading={isSaving}
      />
    </div>
  );
};

export default Page;
