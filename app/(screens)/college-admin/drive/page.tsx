'use client'
import { useState, useEffect, useRef } from "react";
import NewFolderModal from "../../finance/drive/components/modal/newFolderModal";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import ActionBar from "../../finance/drive/components/actionBar";
import Table from "@/app/utils/table";
import { ArrowDownIcon, CaretLeftIcon, CaretRight } from "@phosphor-icons/react";
import FolderFilesModal from "@/app/components/modals/FolderFilesModal";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { DriveFolderRow, fetchRootDriveFolders, saveDriveFolder, deleteDriveFolder } from "@/lib/helpers/drive/driveFolderAPI";
import { DriveFileRow, fetchFolderStats, fetchRecentDriveFiles } from "@/lib/helpers/drive/driveFilesAPI";

type SortOption = "latest" | "name" | "size";

type DriveCard = {
    driveFolderId: number;
    folderName: string;
    color?: string;
    totalFiles: number;
    totalSizeBytes: number;
};

function formatSize(bytes: number | null): string {
    if (!bytes || bytes === 0) return "0 KB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

// Shimmer keyframe injected once

// Shimmer base
function Shimmer({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-md ${className ?? ""}`} />
    );
}

// Folder card shimmer
function FolderCardShimmer() {
    return (
        <div className="rounded-xl p-4 flex flex-col gap-2 bg-gray-100 h-[140px]">
            <Shimmer className="w-12 h-12 rounded-lg mb-1" />
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
        </div>
    );
}

// Table row shimmer
function TableRowShimmer() {
    return (
        <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-6">
            <Shimmer className="h-4 flex-[3]" />
            <Shimmer className="h-4 flex-1" />
            <Shimmer className="h-4 flex-1" />
            <Shimmer className="h-4 flex-[1.5]" />
            <Shimmer className="h-8 w-8 rounded-full flex-none" />
        </div>
    );
}

export default function Drive() {
    const { collegeId, userId } = useUser();

    const [collegeName, setCollegeName] = useState<string | null>(null);
    const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<DriveCard | null>(null);
    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [folders, setFolders] = useState<DriveCard[]>([]);
    const [recentFiles, setRecentFiles] = useState<DriveFileRow[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const rowsPerPage = 10;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);
    const [sortBy, setSortBy] = useState<SortOption>("latest");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [loadingFiles, setLoadingFiles] = useState(true);

    // Rename modal state
    const [renameFolder, setRenameFolder] = useState<DriveCard | null>(null);
    const [renameName, setRenameName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    // Delete confirm state
    const [deleteFolder, setDeleteFolder] = useState<DriveCard | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch college name
    useEffect(() => {
        if (!collegeId) return;
        supabase
            .from("colleges")
            .select("collegeName")
            .eq("collegeId", collegeId)
            .maybeSingle()
            .then(({ data }) => { if (data) setCollegeName(data.collegeName); });
    }, [collegeId]);

    // Load folders + stats + recent files on mount
    useEffect(() => {
        if (!collegeId) return;
        setLoadingFolders(true);
        setLoadingFiles(true);
        Promise.all([
            fetchRootDriveFolders(collegeId),
            fetchFolderStats(collegeId),
            fetchRecentDriveFiles(collegeId, currentPage, rowsPerPage),
        ])
            .then(([folderData, stats, filesResult]) => {
                const savedColors: Record<number, string> = JSON.parse(
                    localStorage.getItem("folderColors") ?? "{}"
                );
                setFolders(
                    (folderData as DriveFolderRow[]).map((f) => ({
                        driveFolderId: f.driveFolderId,
                        folderName: f.folderName,
                        color: savedColors[f.driveFolderId] ?? undefined,
                        totalFiles: stats[f.driveFolderId]?.totalFiles ?? 0,
                        totalSizeBytes: stats[f.driveFolderId]?.totalSizeBytes ?? 0,
                    }))
                );
                const { data, totalCount } = filesResult as { data: DriveFileRow[]; totalCount: number };
                setRecentFiles(data);
                setTotalRecords(totalCount);
            })
            .catch(() => showToast("Failed to load data", "error"))
            .finally(() => {
                setLoadingFolders(false);
                setLoadingFiles(false);
            });
    }, [collegeId, currentPage]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateFolder = async (data: { name: string; color: string }) => {
        if (!collegeId || !userId) { showToast("Missing college or user info", "error"); return; }
        setIsSaving(true);
        try {
            const result = await saveDriveFolder({ collegeId, folderName: data.name, parentFolderId: null }, userId);
            if (!result.success) { showToast("Failed to create folder", "error"); return; }
            const savedColors: Record<number, string> = JSON.parse(localStorage.getItem("folderColors") ?? "{}");
            savedColors[result.driveFolderId!] = data.color;
            localStorage.setItem("folderColors", JSON.stringify(savedColors));
            setFolders((prev) => [{ driveFolderId: result.driveFolderId!, folderName: data.name, color: data.color, totalFiles: 0, totalSizeBytes: 0 }, ...prev]);
            setIsNewFolderOpen(false);
            showToast("Folder created successfully", "success");
        } catch { showToast("Something went wrong", "error"); }
        finally { setIsSaving(false); }
    };

    const handleRename = async () => {
        if (!renameFolder || !renameName.trim() || !collegeId || !userId) return;
        setIsRenaming(true);
        try {
            const result = await saveDriveFolder(
                { driveFolderId: renameFolder.driveFolderId, collegeId, folderName: renameName.trim(), parentFolderId: null },
                userId,
            );
            if (!result.success) { showToast("Failed to rename folder", "error"); return; }
            setFolders((prev) => prev.map((f) =>
                f.driveFolderId === renameFolder.driveFolderId ? { ...f, folderName: renameName.trim() } : f
            ));
            setRenameFolder(null);
            showToast("Folder renamed successfully", "success");
        } catch { showToast("Something went wrong", "error"); }
        finally { setIsRenaming(false); }
    };

    const handleDelete = async () => {
        if (!deleteFolder || !collegeId) return;
        setIsDeleting(true);
        try {
            const result = await deleteDriveFolder(deleteFolder.driveFolderId, collegeId);
            if (!result.success) { showToast("Failed to delete folder", "error"); return; }
            setFolders((prev) => prev.filter((f) => f.driveFolderId !== deleteFolder.driveFolderId));
            // Remove color from localStorage
            const savedColors: Record<number, string> = JSON.parse(localStorage.getItem("folderColors") ?? "{}");
            delete savedColors[deleteFolder.driveFolderId];
            localStorage.setItem("folderColors", JSON.stringify(savedColors));
            setDeleteFolder(null);
            showToast("Folder deleted", "success");
        } catch { showToast("Something went wrong", "error"); }
        finally { setIsDeleting(false); }
    };

    const handleFolderClick = (item: DriveCard) => {
        setSelectedFolder(item);
        setIsFilesModalOpen(true);
    };

    const handleFilesChanged = (driveFolderId: number, fileCount: number, totalSizeBytes: number) => {
        setFolders((prev) => prev.map((f) => f.driveFolderId === driveFolderId ? { ...f, totalFiles: fileCount, totalSizeBytes } : f));
        setSelectedFolder((prev) => prev?.driveFolderId === driveFolderId ? { ...prev, totalFiles: fileCount, totalSizeBytes } : prev);
        if (collegeId) {
            fetchRecentDriveFiles(collegeId, currentPage, rowsPerPage)
                .then(({ data, totalCount }) => {
                    setRecentFiles(data as DriveFileRow[]);
                    setTotalRecords(totalCount);
                })
                .catch(console.error);
        }
    };

    const handleDownload = async (fileName: string, driveFolderId: number) => {
        try {
            const storagePath = `${collegeId}/${driveFolderId}/${fileName.trim()}`;
            const { data, error } = await supabase.storage
                .from("college-drive")
                .createSignedUrl(storagePath, 120);

            if (error || !data?.signedUrl) {
                console.error("Signed URL error:", error);
                return;
            }

            const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
            const viewableInBrowser = ["pdf", "png", "jpg", "jpeg", "gif", "webp", "svg"];

            if (viewableInBrowser.includes(ext)) {
                // Open in new tab for browser-renderable files
                window.open(data.signedUrl, "_blank");
            } else {
                // Force download for all other types (csv, xlsx, docx, tsx, etc.)
                const response = await fetch(data.signedUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            }
        } catch {
            console.error("File action failed");
        }
    };

    const tableColumns = ["File Name", "Type", "Size", "Uploaded on", "Actions"];

    // Sort folders
    const sortedFolders = [...folders].sort((a, b) => {
        if (sortBy === "name") return a.folderName.localeCompare(b.folderName);
        if (sortBy === "size") return b.totalSizeBytes - a.totalSizeBytes;
        return 0; // latest — already sorted by createdAt from DB
    });

    // Sort files
    const sortedFiles = [...recentFiles].sort((a, b) => {
        if (sortBy === "name") return a.fileName.localeCompare(b.fileName);
        if (sortBy === "size") return (b.fileSize ?? 0) - (a.fileSize ?? 0);
        return 0; // latest — already sorted by createdAt from DB
    });

    const tableData = sortedFiles.map((file) => ({
        "File Name": file.fileName,
        "Type": file.fileName.split(".").pop()?.toUpperCase() ?? file.fileType,
        "Size": formatSize(file.fileSize),
        "Uploaded on": formatDate(file.createdAt),
        "Actions": (
            <div className="flex items-center justify-center">
                <button
                    onClick={() => handleDownload(file.fileName, file.driveFolderId)}
                    className="p-1 rounded-full bg-[#DCEBE3] flex items-center justify-center cursor-pointer hover:bg-[#43C17A]/30 transition-colors"
                >
                    <ArrowDownIcon size={17} color="#43C17A" />
                </button>
            </div>
        ),
    }));

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[200] px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === "success" ? "bg-[#43C17A]" : "bg-red-500"}`}>
                    {toast.message}
                </div>
            )}

            {/* Rename Modal */}
            {renameFolder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-[#111827] mb-4">Rename folder</h3>
                        <label className="text-sm text-[#6B7280] mb-1 block">Folder name</label>
                        <input
                            value={renameName}
                            onChange={(e) => setRenameName(e.target.value)}
                            className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#43C17A]"
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            autoFocus
                        />
                        <div className="flex gap-3 mt-5 justify-end">
                            <button
                                onClick={() => setRenameFolder(null)}
                                className="px-5 py-2 rounded-lg border border-[#D1D5DB] text-sm font-medium text-[#111827] cursor-pointer hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRename}
                                disabled={isRenaming || !renameName.trim()}
                                className="px-5 py-2 rounded-lg bg-[#43C17A] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                            >
                                {isRenaming ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Dialog */}
            {deleteFolder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-[#111827] mb-2">Delete folder</h3>
                        <p className="text-sm text-[#6B7280]">
                            Are you sure you want to delete <strong className="text-[#111827]">{deleteFolder.folderName}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 mt-5 justify-end">
                            <button
                                onClick={() => setDeleteFolder(null)}
                                className="px-5 py-2 rounded-lg border border-[#D1D5DB] text-sm font-medium text-[#111827] cursor-pointer hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold cursor-pointer hover:bg-red-600 disabled:opacity-60"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col h-full">
                <NewFolderModal
                    open={isNewFolderOpen}
                    onCancel={() => !isSaving && setIsNewFolderOpen(false)}
                    onSave={handleCreateFolder}
                    loading={isSaving}
                />
                <FolderFilesModal
                    open={isFilesModalOpen}
                    onClose={() => setIsFilesModalOpen(false)}
                    folderName={selectedFolder ? `${collegeName ?? "College"} ( ${selectedFolder.folderName} )` : ""}
                    driveFolderId={selectedFolder?.driveFolderId ?? null}
                    collegeId={collegeId}
                    onFilesChanged={handleFilesChanged}
                />

                {/* Fixed header — never scrolls */}
                <div className="bg-[#F5F5F5] pt-2 pb-3 px-2 z-10">
                    <div className="w-full mb-3 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-[#282828]">Drive</h1>
                            <p className="text-[#282828]">Manage, organize & monitor all academic and administrative files</p>
                        </div>
                        <div className="flex w-[32%] justify-end">
                            <CourseScheduleCard style="w-[320px]" isVisibile={false} />
                        </div>
                    </div>
                    <ActionBar
                        sortBy={sortBy}
                        onSort={(val) => setSortBy(val as SortOption)}
                        onNew={() => setIsNewFolderOpen(true)}
                        onFilters={() => console.log("Filters")}
                        isVisible={false}
                    />
                </div>

                {/* Scrollable content below header */}
                <div className="flex-1 overflow-y-auto px-2 pb-5">
                    <h3 className="text-[#282828] text-lg font-medium mt-2 mb-1">Folders</h3>

                    {loadingFolders ? (
                        <div className="grid grid-cols-5 gap-4 py-2">
                            {[...Array(5)].map((_, i) => <FolderCardShimmer key={i} />)}
                        </div>
                    ) : folders.length === 0 ? (
                        <p className="text-sm text-[#9CA3AF] mt-4">No folders yet. Click "New" to create one.</p>
                    ) : (
                        <div className="grid grid-cols-5 gap-4 py-2">
                            {sortedFolders.map((item) => {
                                const bg = item.color ? `${item.color}22` : "#F3F4F6";
                                const iconColor = item.color ?? "#6B7280";
                                return (
                                    <div
                                        key={item.driveFolderId}
                                        className="rounded-xl p-4 flex flex-col cursor-pointer hover:shadow-md transition-all relative overflow-visible"
                                        style={{ backgroundColor: bg }}
                                        onClick={() => handleFolderClick(item)}
                                    >
                                        {/* 3-dot menu button */}
                                        <div
                                            ref={openMenuId === item.driveFolderId ? menuRef : null}
                                            className="absolute top-2 right-2 z-20"
                                        >
                                            <button
                                                className="p-1 rounded-full hover:bg-black/10 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(prev => prev === item.driveFolderId ? null : item.driveFolderId);
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280">
                                                    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                                                </svg>
                                            </button>

                                            {/* Inline dropdown — inside card, below 3-dot */}
                                            {openMenuId === item.driveFolderId && (
                                                <div
                                                    className="absolute right-0 top-7 z-50 bg-white rounded-lg shadow-lg py-1 w-28 border border-gray-100"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        className="w-full text-left px-4 py-2 text-sm text-[#282828] hover:bg-gray-50 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(null);
                                                            setRenameName(item.folderName);
                                                            setRenameFolder(item);
                                                        }}
                                                    >
                                                        Rename
                                                    </button>
                                                    <button
                                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(null);
                                                            setDeleteFolder(item);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Folder icon */}
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 mt-2">
                                            <path d="M4 10C4 7.79 5.79 6 8 6H18L22 10H40C42.21 10 44 11.79 44 14V38C44 40.21 42.21 42 40 42H8C5.79 42 4 40.21 4 38V10Z" fill={iconColor} />
                                            <path d="M4 18H44V38C44 40.21 42.21 42 40 42H8C5.79 42 4 40.21 4 38V18Z" fill={iconColor} fillOpacity="0.7" />
                                        </svg>

                                        <p className="text-[#282828] font-semibold text-[15px] truncate">{item.folderName}</p>
                                        <p className="text-[#6B7280] text-[13px] mt-0.5">
                                            {item.totalFiles} {item.totalFiles === 1 ? "File" : "Files"} · {formatSize(item.totalSizeBytes)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div>
                        {loadingFiles ? (
                            <div className="mt-4 bg-white rounded-xl overflow-hidden border border-gray-100">
                                <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-b border-gray-100">
                                    <Shimmer className="h-3 flex-[3]" />
                                    <Shimmer className="h-3 flex-1" />
                                    <Shimmer className="h-3 flex-1" />
                                    <Shimmer className="h-3 flex-[1.5]" />
                                    <Shimmer className="h-3 w-8 flex-none" />
                                </div>
                                {[...Array(6)].map((_, i) => <TableRowShimmer key={i} />)}
                            </div>
                        ) : recentFiles.length > 0 ? (
                            <>
                                <Table columns={tableColumns} data={tableData} />

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
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                                        >
                                            <CaretRight size={18} weight="bold" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-[#9CA3AF] mt-4">No files uploaded yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
