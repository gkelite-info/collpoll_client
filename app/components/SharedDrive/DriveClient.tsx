"use client";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useState, useEffect } from "react";
import FolderFilesModal from "@/app/components/modals/FolderFilesModal";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
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
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import ReplaceFolderModal from "./components/modal/replaceFolderModal";
import { useTranslations } from "next-intl";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useInView } from "react-intersection-observer";

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

const DriveClient = () => {
  const isSchoolStr = typeof document !== 'undefined'
    ? document.cookie.split("; ").find((row) => row.startsWith("isSchool="))?.split("=")[1]
    : null;
  const isSchool = isSchoolStr === "true";

  const { collegeId, userId } = useUser();
  const t = useTranslations("Drive.student"); // Hook

  const [collegeName, setCollegeName] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderItemProps[]>([]);
  const [recentFiles, setRecentFiles] = useState<DriveFileRow[]>([]);
  const [recentViewed, setRecentViewed] = useState<RecentFile[]>([]);
  const [recentCurrentPage, setRecentCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [fileSearch, setFileSearch] = useState("");
  const [debouncedFileSearch, setDebouncedFileSearch] = useState("");
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
  const [folderCurrentPage, setFolderCurrentPage] = useState(1);
  const [totalFolders, setTotalFolders] = useState(0);
  const [folderRefreshKey, setFolderRefreshKey] = useState(0);
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
  const foldersPerPage = 5;

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
    const debounceTimer = window.setTimeout(() => {
      if (fileSearch === debouncedFileSearch) return;
      setLoadingFiles(true);
      setCurrentPage(1);
      setDebouncedFileSearch(fileSearch);
    }, 400);

    return () => window.clearTimeout(debounceTimer);
  }, [fileSearch, debouncedFileSearch]);

  const { ref: folderLoadMoreRef, inView: folderInView } = useInView();

  useEffect(() => {
    if (folderInView && folders.length < totalFolders && !loadingFolders) {
      setFolderCurrentPage((prev) => prev + 1);
    }
  }, [folderInView, folders.length, totalFolders, loadingFolders]);

  useEffect(() => {
    if (!collegeId || !userId) return;

    setLoadingFolders(true);

    let isSubscribed = true;

    Promise.all([
      fetchRootDriveFolders(
        collegeId,
        userId,
        folderCurrentPage,
        foldersPerPage,
        sortBy,
      ),
      fetchFolderStats(collegeId, userId),
    ])
      .then(([folderResult, stats]) => {
        if (!isSubscribed) return;
        const { data: folderData, totalCount: folderCount } = folderResult;
        const mappedFolders = folderData.map((f: DriveFolderRow) => ({
          driveFolderId: f.driveFolderId,
          name: f.folderName,
          color: f.color ?? "#0096A6",
          filesCount: stats[f.driveFolderId]?.totalFiles ?? 0,
          sizeLabel: formatSize(stats[f.driveFolderId]?.totalSizeBytes ?? 0),
        }));
        
        setFolders((prev) =>
          folderCurrentPage === 1 ? mappedFolders : [...prev, ...mappedFolders]
        );
        setTotalFolders(folderCount);
      })
      .catch(() => {
        if (isSubscribed) showToast(t("Failed to load data"), "error");
      })
      .finally(() => {
        if (isSubscribed) setLoadingFolders(false);
      });
      
    return () => {
      isSubscribed = false;
    };
  }, [
    collegeId,
    userId,
    folderCurrentPage,
    folderRefreshKey,
    sortBy,
    t,
  ]);

  useEffect(() => {
    if (!collegeId || !userId) return;

    let cancelled = false;

    fetchRecentDriveFiles(
      collegeId,
      currentPage,
      rowsPerPage,
      userId,
      sortBy,
      debouncedFileSearch,
    )
      .then(({ data, totalCount }) => {
        if (cancelled) return;
        setRecentFiles(data as DriveFileRow[]);
        setTotalRecords(totalCount);
      })
      .catch(() => {
        if (!cancelled) showToast(t("Failed to load data"), "error");
      })
      .finally(() => {
        if (!cancelled) setLoadingFiles(false);
      });

    return () => {
      cancelled = true;
    };
  }, [collegeId, userId, currentPage, sortBy, debouncedFileSearch, t]);

  const sortedFolders = [...folders].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "size") return b.filesCount - a.filesCount;
    return 0;
  });

  // Action Logic functions preserved exactly as requested
  const handleCreateFolder = async (data: { name: string; color: string }) => {
    if (!collegeId || !userId) {
      showToast(t(isSchool ? "Missing school or user info" : "Missing college or user info"), "error");
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
        { collegeId, folderName: data.name, parentFolderId: null, color: data.color },
        userId,
      );

      if (!result.success) throw new Error("Failed");

      setFolderCurrentPage(1);
      setFolderRefreshKey((key) => key + 1);

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
      const remainingFolders = Math.max(0, totalFolders - 1);
      const lastFolderPage = Math.max(
        1,
        Math.ceil(remainingFolders / foldersPerPage),
      );
      setFolderCurrentPage((page) => Math.min(page, lastFolderPage));
      setFolderRefreshKey((key) => key + 1);

      setRecentFiles((prev) =>
        prev.filter((f) => f.driveFolderId !== folderToDelete.driveFolderId),
      );
      const updatedRecent = getRecentFiles(userId).filter(
        (f) => f.driveFolderId !== folderToDelete.driveFolderId,
      );
      localStorage.setItem(getRecentKey(userId), JSON.stringify(updatedRecent));
      setRecentViewed(updatedRecent);
      setRecentCurrentPage((page) =>
        Math.min(
          page,
          Math.max(1, Math.ceil(updatedRecent.length / recentItemsPerPage)),
        ),
      );

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

      fetchRecentDriveFiles(
        collegeId,
        currentPage,
        rowsPerPage,
        userId,
        sortBy,
        debouncedFileSearch,
      )
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
        .createSignedUrl(storagePath, 120, { download: file.fileName });

      if (error || !data?.signedUrl) return;

      const a = document.createElement("a");
      a.href = data.signedUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

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
    setRecentCurrentPage((page) =>
      Math.min(
        page,
        Math.max(1, Math.ceil(updatedRecent.length / recentItemsPerPage)),
      ),
    );

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
    <div className="flex flex-col h-screen overflow-hidden max-md:bg-[#F4F5F6]">
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
            ? `${collegeName ?? (isSchool ? "School" : "College")} ( ${selectedFolder.name} )`
            : ""
        }
        driveFolderId={selectedFolder?.driveFolderId ?? null}
        collegeId={collegeId}
        onFilesChanged={handleFilesChanged}
      />

      <div className="bg-[#F5F5F5] max-md:bg-[#F4F5F6] px-4 pt-4 pb-3 shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#282828] max-md:text-[22px]">
              {t("Drive")}
            </h1>
            <p className="text-[#282828] max-md:text-sm max-md:text-gray-600">
              {t(
                "Manage, organize & monitor all academic and administrative files",
              )}
            </p>
          </div>
          <article className="flex w-[32%] justify-end max-md:hidden">
            <CourseScheduleCard style="w-[320px]" isVisibile={false}/>
          </article>
        </div>

        <ActionBar
          sortBy={sortBy}
          onSort={(val) => {
            setLoadingFolders(true);
            setLoadingFiles(true);
            setSortBy(val as SortOption);
            setFolderCurrentPage(1);
            setCurrentPage(1);
          }}
          onNew={() => setIsNewFolderOpen(true)}
          onFilters={() => console.log("Filters")}
          isVisible={false}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 max-md:pb-24">
        <section className="mt-6 max-md:mt-4">
          <h2 className="text-md font-semibold text-[#282828] mb-2 max-md:text-[17px]">
            {t("Folders")}
          </h2>

          {loadingFolders && folderCurrentPage === 1 ? (
            <div className="mt-2 flex gap-4 overflow-x-auto custom-scrollbar pb-2 snap-x">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden flex min-w-[200px] shrink-0 snap-start flex-col rounded-md p-2 bg-[#EAEAEA] h-[130px] max-md:min-w-[160px] max-md:h-[110px] max-md:rounded-xl"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 flex gap-4 overflow-x-auto custom-scrollbar pb-2 snap-x">
              {sortedFolders.map((f) => (
                <div key={f.driveFolderId} className="shrink-0 snap-start">
                  <FolderCard
                    {...f}
                    onRename={() => setFolderToRename(f)}
                    onDelete={() => setFolderToDelete(f)}
                    onClick={() => {
                      setSelectedFolder(f);
                      setIsFilesModalOpen(true);
                    }}
                  />
                </div>
              ))}
              {folders.length < totalFolders && (
                <div ref={folderLoadMoreRef} className="shrink-0 flex items-center gap-4 justify-center">
                  {loadingFolders && folderCurrentPage > 1 ? (
                    <>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="relative overflow-hidden flex min-w-[200px] shrink-0 snap-start flex-col rounded-md p-2 bg-[#EAEAEA] h-[130px] max-md:min-w-[160px] max-md:h-[110px] max-md:rounded-xl">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="w-10 h-full"></div>
                  )}
                </div>
              )}
              {sortedFolders.length === 0 && (
                <p className="text-sm text-[#9CA3AF] mt-2">
                  {t("No folders yet Click New to create one")}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="mt-6 max-md:mt-5">
          <h2 className="text-md font-semibold text-[#282828] mb-2 max-md:text-[17px]">
            {t("Recent")}
          </h2>

          {loadingFiles ? (
            <div className="mt-2 flex gap-4 overflow-x-auto pb-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden flex items-center min-w-[220px] rounded-md bg-[#EAEAEA] p-3 gap-2 h-16 max-md:rounded-xl"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              ))}
            </div>
          ) : recentViewed.length > 0 ? (
            <div className="mt-2 flex gap-4 overflow-x-auto custom-scrollbar pb-2 snap-x">
              {recentViewed.map((file) => (
                <div key={file.driveFileId} className="shrink-0 snap-start">
                  <RecentFileCard
                    name={file.fileName}
                    type={file.fileName.split(".").pop()?.toUpperCase() ?? "FILE"}
                    sizeLabel={formatSize(file.fileSize)}
                    date={formatDate(file.accessedAt)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9CA3AF] mt-2">
              {t("No recently viewed files yet")}
            </p>
          )}
        </section>

        <section className="mt-6 max-md:mt-5">
          <h2 className="text-md font-semibold text-[#282828] mb-2 max-md:text-[17px]">
            {t("All Files")}
          </h2>

          <FilesTable
            files={recentFiles}
            search={fileSearch}
            onSearchChange={(value) => {
              setFileSearch(value);
            }}
            onDelete={handleDeleteFile}
            onDownload={handleDownloadFile}
            isDeleting={isDeletingFile}
            loading={loadingFiles}
          />

          {!loadingFiles && totalRecords > 0 && (
            <div className="mb-2 overflow-hidden rounded-b-2xl shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalItems={totalRecords}
                itemsPerPage={rowsPerPage}
                onPageChange={(page) => {
                  setLoadingFiles(true);
                  setCurrentPage(page);
                }}
                alwaysShow
              />
            </div>
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

      <ConfirmDeleteModal
        open={!!folderToDelete}
        name={folderToDelete?.name || t("this folder")}
        title={t("Delete folder")}
        confirmText={t("Delete")}
        loadingText={t("Deleting")}
        onCancel={() => setFolderToDelete(null)}
        onConfirm={handleConfirmDeleteFolder}
        isDeleting={isDeleting}
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

export default DriveClient;
