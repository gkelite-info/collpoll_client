"use client";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useState, useEffect } from "react";
import FolderFilesModal from "@/app/components/modals/FolderFilesModal";
import { useUser } from "@/app/utils/context/UserContext";

import {
  DriveFolderRow,
  fetchRootDriveFolders,
  saveDriveFolder,
  deleteDriveFolder,
  fetchCollegeName,
} from "@/lib/helpers/drive/driveFolderAPI";
import {
  DriveFileRow,
  fetchFolderStats,
  fetchRecentDriveFiles,
  deleteDriveFile,
  getDriveFileDownloadUrl,
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
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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
  const queryClient = useQueryClient();

  const [collegeName, setCollegeName] = useState<string | null>(null);
  const [recentViewed, setRecentViewed] = useState<RecentFile[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [fileSearch, setFileSearch] = useState("");
  const [debouncedFileSearch, setDebouncedFileSearch] = useState("");
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderItemProps | null>(null);
  const [folderToRename, setFolderToRename] = useState<FolderItemProps | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderItemProps | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [duplicateFolderData, setDuplicateFolderData] = useState<{
    name: string;
    color: string;
  } | null>(null);

  const rowsPerPage = 10;
  const foldersPerPage = 5;

  const showToast = (message: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(message, { id: "drive-toast-success" });
    } else {
      toast.error(message, { id: "drive-toast-error" });
    }
  };

  useEffect(() => {
    if (userId) setRecentViewed(getRecentFiles(userId));
  }, [userId]);

  useEffect(() => {
    if (!collegeId) return;
    fetchCollegeName(collegeId).then((name) => {
      if (name) setCollegeName(name);
    });
  }, [collegeId]);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      if (fileSearch === debouncedFileSearch) return;
      setCurrentPage(1);
      setDebouncedFileSearch(fileSearch);
    }, 400);

    return () => window.clearTimeout(debounceTimer);
  }, [fileSearch, debouncedFileSearch]);

  const { ref: folderLoadMoreRef, inView: folderInView } = useInView();

  // --- React Query Fetching ---

  const { data: folderStats = {} } = useQuery({
    queryKey: ["driveFolderStats", collegeId, userId],
    queryFn: () => fetchFolderStats(collegeId!, userId!),
    enabled: !!collegeId && !!userId,
  });

  const {
    data: foldersData,
    fetchNextPage: fetchNextFolderPage,
    hasNextPage: hasNextFolderPage,
    isFetchingNextPage: isFetchingNextFolders,
    isLoading: loadingFolders,
  } = useInfiniteQuery({
    queryKey: ["driveFolders", collegeId, userId, sortBy],
    queryFn: ({ pageParam = 1 }) => fetchRootDriveFolders(collegeId!, userId!, pageParam as number, foldersPerPage, sortBy),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce((sum, page) => sum + page.data.length, 0);
      return currentCount < lastPage.totalCount ? allPages.length + 1 : undefined;
    },
    enabled: !!collegeId && !!userId,
  });

  const {
    data: filesData,
    isLoading: loadingFiles,
  } = useQuery({
    queryKey: ["driveRecentFiles", collegeId, userId, currentPage, sortBy, debouncedFileSearch],
    queryFn: () => fetchRecentDriveFiles(collegeId!, currentPage, rowsPerPage, userId!, sortBy, debouncedFileSearch),
    enabled: !!collegeId && !!userId,
  });

  const rawFolders = foldersData?.pages.flatMap(page => page.data) ?? [];
  const folders = rawFolders.map((f: DriveFolderRow) => ({
    driveFolderId: f.driveFolderId,
    name: f.folderName,
    color: f.color ?? "#0096A6",
    filesCount: folderStats[f.driveFolderId]?.totalFiles ?? 0,
    sizeLabel: formatSize(folderStats[f.driveFolderId]?.totalSizeBytes ?? 0),
  }));
  const totalFolders = foldersData?.pages[0]?.totalCount ?? 0;
  
  const recentFiles = filesData?.data as DriveFileRow[] ?? [];
  const totalRecords = filesData?.totalCount ?? 0;

  useEffect(() => {
    if (folderInView && hasNextFolderPage && !isFetchingNextFolders) {
      fetchNextFolderPage();
    }
  }, [folderInView, hasNextFolderPage, isFetchingNextFolders, fetchNextFolderPage]);

  const sortedFolders = [...folders].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "size") return b.filesCount - a.filesCount;
    return 0;
  });

  // --- Mutations ---

  const createFolderMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      saveDriveFolder({ collegeId: collegeId!, folderName: data.name, parentFolderId: null, color: data.color }, userId!),
    onSuccess: (res) => {
      if (!res.success) throw new Error("Failed");
      queryClient.invalidateQueries({ queryKey: ["driveFolders"] });
      setIsNewFolderOpen(false);
      showToast(t("Folder created successfully"), "success");
    },
    onError: () => showToast(t("Something went wrong"), "error"),
  });

  const handleCreateFolder = async (data: { name: string; color: string }) => {
    if (!collegeId || !userId) {
      showToast(t(isSchool ? "Missing school or user info" : "Missing college or user info"), "error");
      return;
    }
    const existingFolder = folders.find((f) => f.name.toLowerCase().trim() === data.name.toLowerCase().trim());
    if (existingFolder) {
      setDuplicateFolderData(data);
      setIsReplaceModalOpen(true);
      return;
    }
    createFolderMutation.mutate(data);
  };

  const renameFolderMutation = useMutation({
    mutationFn: (newName: string) =>
      saveDriveFolder({
        driveFolderId: folderToRename!.driveFolderId,
        collegeId: collegeId!,
        folderName: newName,
        parentFolderId: null,
      }, userId!),
    onSuccess: (res) => {
      if (!res.success) throw new Error("Failed");
      queryClient.invalidateQueries({ queryKey: ["driveFolders"] });
      setFolderToRename(null);
      showToast(t("Folder renamed"), "success");
    },
    onError: () => showToast(t("Something went wrong"), "error"),
  });

  const handleSaveFolderName = async (newName: string) => {
    if (!folderToRename || !collegeId || !userId) return;
    renameFolderMutation.mutate(newName);
  };

  const replaceFolderMutation = useMutation({
    mutationFn: async () => {
      const existing = folders.find((f) => f.name.toLowerCase().trim() === duplicateFolderData!.name.toLowerCase().trim());
      if (existing) {
        const deleteResult = await deleteDriveFolder(existing.driveFolderId, collegeId!);
        if (!deleteResult.success) throw new Error("Failed to delete existing");
      }
      const result = await saveDriveFolder({
        collegeId: collegeId!,
        folderName: duplicateFolderData!.name,
        parentFolderId: null,
      }, userId!);
      if (!result.success) throw new Error("Failed to replace");
      
      const savedColors: Record<number, string> = JSON.parse(localStorage.getItem("folderColors") ?? "{}");
      savedColors[result.driveFolderId!] = duplicateFolderData!.color;
      if (existing) delete savedColors[existing.driveFolderId];
      localStorage.setItem("folderColors", JSON.stringify(savedColors));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driveFolders"] });
      setIsNewFolderOpen(false);
      showToast(t("Folder replaced successfully"), "success");
      setDuplicateFolderData(null);
    },
    onError: () => {
      showToast(t("Something went wrong"), "error");
      setDuplicateFolderData(null);
      setIsReplaceModalOpen(false);
    }
  });

  const handleConfirmReplace = async () => {
    if (!duplicateFolderData || !collegeId || !userId) return;
    setIsReplaceModalOpen(false);
    replaceFolderMutation.mutate();
  };

  const deleteFolderMutation = useMutation({
    mutationFn: async () => {
      const result = await deleteDriveFolder(folderToDelete!.driveFolderId, collegeId!);
      if (!result.success) throw new Error("Failed");
      
      // Update local storage for recent files too
      const updatedRecent = getRecentFiles(userId).filter((f) => f.driveFolderId !== folderToDelete!.driveFolderId);
      localStorage.setItem(getRecentKey(userId), JSON.stringify(updatedRecent));
      setRecentViewed(updatedRecent);
      
      const savedColors: Record<number, string> = JSON.parse(localStorage.getItem("folderColors") ?? "{}");
      delete savedColors[folderToDelete!.driveFolderId];
      localStorage.setItem("folderColors", JSON.stringify(savedColors));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driveFolders"] });
      queryClient.invalidateQueries({ queryKey: ["driveRecentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["driveFolderStats"] });
      setFolderToDelete(null);
      showToast(t("Folder and all its files deleted"), "success");
    },
    onError: () => showToast(t("Something went wrong"), "error"),
  });

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete || !collegeId) return;
    deleteFolderMutation.mutate();
  };

  const deleteFileMutation = useMutation({
    mutationFn: async (file: DriveFileRow) => {
      const result = await deleteDriveFile(file.driveFileId, collegeId!, file.driveFolderId, file.fileName);
      if (!result.success) throw new Error("Failed to delete file");
      
      const updatedRecent = getRecentFiles(userId).filter((f) => f.driveFileId !== file.driveFileId);
      localStorage.setItem(getRecentKey(userId), JSON.stringify(updatedRecent));
      setRecentViewed(updatedRecent);
      
      return file;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driveRecentFiles"] });
      queryClient.invalidateQueries({ queryKey: ["driveFolderStats"] });
      showToast("File deleted successfully", "success");
    },
    onError: () => showToast("Failed to delete file", "error"),
  });

  const handleDeleteFile = async (file: DriveFileRow) => {
    await deleteFileMutation.mutateAsync(file);
  };

  const handleFilesChanged = () => {
    queryClient.invalidateQueries({ queryKey: ["driveFolderStats"] });
    queryClient.invalidateQueries({ queryKey: ["driveRecentFiles"] });
  };

  const handleDownloadFile = async (file: DriveFileRow) => {
    try {
      const url = await getDriveFileDownloadUrl(collegeId!, file.driveFolderId, file.fileName);

      const a = document.createElement("a");
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      const updated = addToRecent(file, userId);
      setRecentViewed(updated);
    } catch (error) {
      console.error("Download failed:", error);
      showToast("Failed to download file", "error");
    }
  };

  const isSaving = createFolderMutation.isPending || replaceFolderMutation.isPending;
  const isRenaming = renameFolderMutation.isPending;
  const isDeleting = deleteFolderMutation.isPending;
  const isDeletingFile = deleteFileMutation.isPending;

  return (
    <div className="flex flex-col h-screen overflow-hidden max-md:bg-[#F4F5F6]">
      <style>{`
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
      `}</style>

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
            setSortBy(val as SortOption);
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

          {loadingFolders && folders.length === 0 ? (
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
                  {isFetchingNextFolders ? (
                    <>
                      {[...Array(2)].map((_, i) => (
                        <div key={`loading-${i}`} className="relative overflow-hidden flex min-w-[200px] shrink-0 snap-start flex-col rounded-md p-2 bg-[#EAEAEA] h-[130px] max-md:min-w-[160px] max-md:h-[110px] max-md:rounded-xl">
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

          {loadingFiles && recentViewed.length === 0 ? (
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
            containerClassName={totalRecords > 0 && !loadingFiles ? "rounded-t-2xl" : "rounded-2xl"}
          />

          {!loadingFiles && totalRecords > 0 && (
            <div className="mb-2 overflow-hidden ">
              <Pagination
                currentPage={currentPage}
                totalItems={totalRecords}
                itemsPerPage={rowsPerPage}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
                alwaysShow
                roundedBottom="rounded-b-2xl"
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
