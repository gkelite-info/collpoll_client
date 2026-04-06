'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, FilePdf, FileXls, FileDoc, FileText, UploadSimple, Trash, PencilSimple } from "@phosphor-icons/react";
import { ArrowLeft } from 'lucide-react';
import { fetchDriveFilesByFolder, saveDriveFile, deleteDriveFile, DriveFileRow } from '@/lib/helpers/drive/driveFilesAPI';
import { useUser } from '@/app/utils/context/UserContext';
import { supabase } from '@/lib/supabaseClient';

type FolderFilesModalProps = {
    open: boolean;
    onClose: () => void;
    folderName: string;
    driveFolderId: number | null;
    collegeId: number | null;
    onFilesChanged?: (driveFolderId: number, fileCount: number, totalSizeBytes: number) => void;
};

type UploadItem = {
    file: File;
    progress: number;
    status: 'uploading' | 'done' | 'error';
};

function formatSize(bytes: number | null): string {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function getFileIcon(fileName: string) {
    const name = fileName.toLowerCase();
    if (name.endsWith('.pdf')) return <FilePdf size={22} color="#E44D26" weight="fill" />;
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) return <FileXls size={22} color="#1D6F42" weight="fill" />;
    if (name.endsWith('.doc') || name.endsWith('.docx')) return <FileDoc size={22} color="#2B579A" weight="fill" />;
    return <FileText size={22} color="#6B7280" weight="fill" />;
}

function ShimmerRow() {
    return (
        <div className="relative overflow-hidden bg-white border border-gray-200 rounded-xl py-2 px-4 flex items-center justify-between h-[56px]">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-gray-200" />
                <div className="h-3 w-52 rounded bg-gray-200" />
            </div>
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-5">
                    <div className="h-3 w-12 rounded bg-gray-200" />
                    <div className="h-3 w-10 rounded bg-gray-200" />
                    <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
                <div className="flex gap-3">
                    <div className="h-4 w-4 rounded bg-gray-200" />
                    <div className="h-4 w-4 rounded bg-gray-200" />
                    <div className="h-4 w-4 rounded bg-gray-200" />
                </div>
            </div>
        </div>
    );
}

interface ConfirmDeleteModalProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
    name?: string;
}

function ConfirmDeleteModal({ open, onConfirm, onCancel, isDeleting = false, name = 'file' }: ConfirmDeleteModalProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-xl w-[380px] p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete {name}?</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete this {name}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 text-[#282828] cursor-pointer rounded-lg text-sm border disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 cursor-pointer rounded-lg text-sm bg-red-600 text-white disabled:opacity-60 flex items-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Deleting...
                            </>
                        ) : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FolderFilesModal({
    open,
    onClose,
    folderName,
    driveFolderId,
    collegeId,
    onFilesChanged,
}: FolderFilesModalProps) {
    const { userId } = useUser();

    const uploadInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);

    const [files, setFiles] = useState<DriveFileRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [replacingFileId, setReplacingFileId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [fileToDelete, setFileToDelete] = useState<DriveFileRow | null>(null);
    const [isDeletingFile, setIsDeletingFile] = useState(false);
    const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);

    // ── drag & drop + multi-select state ──
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);

    const totalSizeBytes = files.reduce((acc, f) => acc + (f.fileSize ?? 0), 0);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (!open || !driveFolderId) {
            setFiles([]);
            setLoading(false);
            setSelectedFileIds([]);
            return;
        }
        setLoading(true);
        fetchDriveFilesByFolder(driveFolderId)
            .then((data) => {
                const fetched = data as DriveFileRow[];
                setFiles(fetched);
                // ── notify parent immediately after fetch ──
                const totalBytes = fetched.reduce((acc, f) => acc + (f.fileSize ?? 0), 0);
                onFilesChanged?.(driveFolderId, fetched.length, totalBytes);
            })
            .catch(() => showToast('Failed to load files', 'error'))
            .finally(() => setLoading(false));
    }, [open, driveFolderId]);

    useEffect(() => {
        if (!driveFolderId) return;
        onFilesChanged?.(driveFolderId, files.length, totalSizeBytes);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files]);
    
    // ── Multi-file upload — accepts both input event and dropped files ──
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement> | null, droppedFiles?: File[]) => {
        const selected = droppedFiles ?? Array.from(e?.target.files ?? []);
        if (!selected.length || !driveFolderId || !collegeId || !userId) return;
        if (uploadInputRef.current) uploadInputRef.current.value = '';

        const items: UploadItem[] = selected.map((f) => ({ file: f, progress: 0, status: 'uploading' }));
        setUploadItems(items);
        setUploading(true);

        for (let i = 0; i < selected.length; i++) {
            const file = selected[i];
            try {
                await new Promise<void>((resolve, reject) => {
                    // upsert: true so storage accepts re-upload of previously deleted file
                    supabase.storage
                        .from('college-drive')
                        .createSignedUploadUrl(
                            `${collegeId}/${driveFolderId}/${file.name.trim()}`,
                            { upsert: true }
                        )
                        .then(({ data: signedData, error }) => {
                            if (error || !signedData?.signedUrl) { reject(error); return; }

                            const xhr = new XMLHttpRequest();

                            xhr.upload.onprogress = (event) => {
                                if (event.lengthComputable) {
                                    const pct = Math.round((event.loaded / event.total) * 100);
                                    setUploadItems((prev) =>
                                        prev.map((item, idx) => idx === i ? { ...item, progress: pct } : item)
                                    );
                                }
                            };

                            xhr.onload = async () => {
                                if (xhr.status >= 200 && xhr.status < 300) {

                                    // Check if a soft-deleted record exists for this filename
                                    const { data: existingDeleted } = await supabase
                                        .from('drive_files')
                                        .select('driveFileId')
                                        .eq('driveFolderId', driveFolderId)
                                        .eq('fileName', file.name)
                                        .eq('is_deleted', true)
                                        .maybeSingle();

                                    if (existingDeleted) {
                                        // Reactivate the soft-deleted record instead of inserting new
                                        await supabase
                                            .from('drive_files')
                                            .update({
                                                is_deleted: false,
                                                deletedAt: null,
                                                fileSize: file.size,
                                                fileType: file.type || file.name.split('.').pop() || 'unknown',
                                                createdAt: new Date().toISOString(),
                                            })
                                            .eq('driveFileId', existingDeleted.driveFileId);
                                    } else {
                                        // Fresh file — save new DB record
                                        await saveDriveFile(
                                            {
                                                driveFolderId,
                                                collegeId,
                                                fileName: file.name,
                                                fileType: file.type || file.name.split('.').pop() || 'unknown',
                                                fileSize: file.size,
                                                file,
                                            },
                                            userId,
                                        );
                                    }

                                    // Refresh file list either way
                                    const updated = await fetchDriveFilesByFolder(driveFolderId);
                                    setFiles(updated as DriveFileRow[]);

                                    setUploadItems((prev) =>
                                        prev.map((item, idx) => idx === i ? { ...item, progress: 100, status: 'done' } : item)
                                    );
                                    resolve();
                                } else {
                                    reject(new Error('Upload failed'));
                                }
                            };

                            xhr.onerror = () => reject(new Error('Network error'));
                            xhr.open('PUT', signedData.signedUrl);
                            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
                            xhr.send(file);
                        });
                });
            } catch {
                setUploadItems((prev) =>
                    prev.map((item, idx) => idx === i ? { ...item, status: 'error' } : item)
                );
            }
        }

        showToast(
            selected.length > 1
                ? `${selected.length} files uploaded successfully`
                : 'File uploaded successfully',
            'success'
        );
        setUploading(false);
        setTimeout(() => setUploadItems([]), 2000);
    };

    // ── Drag & drop handlers ──
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!e.dataTransfer.files.length) return;
        await handleUpload(null, Array.from(e.dataTransfer.files));
    };

    // ── Multi-select handlers ──
    const toggleSelectFile = (id: number) => {
        setSelectedFileIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        setSelectedFileIds((prev) =>
            prev.length === files.length ? [] : files.map((f) => f.driveFileId)
        );
    };

    // ── Pencil: replace existing file in same row ──
    const handleReplaceClick = (file: DriveFileRow) => {
        setReplacingFileId(file.driveFileId);
        replaceInputRef.current?.click();
    };

    const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFile = e.target.files?.[0];
        if (!newFile || !replacingFileId || !driveFolderId || !collegeId || !userId) return;

        const existingFile = files.find(f => f.driveFileId === replacingFileId);
        if (!existingFile) return;

        setUploading(true);
        try {
            const oldPath = `${collegeId}/${driveFolderId}/${existingFile.fileName.trim()}`;
            await supabase.storage.from('college-drive').remove([oldPath]);

            const newPath = `${collegeId}/${driveFolderId}/${newFile.name.trim()}`;
            const { error: uploadError } = await supabase.storage
                .from('college-drive')
                .upload(newPath, newFile, { upsert: true, contentType: newFile.type });

            if (uploadError) { showToast('Replace failed', 'error'); return; }

            const { data: urlData } = supabase.storage.from('college-drive').getPublicUrl(newPath);

            const result = await saveDriveFile(
                {
                    driveFileId: existingFile.driveFileId,
                    driveFolderId,
                    collegeId,
                    fileName: newFile.name,
                    fileType: newFile.type || newFile.name.split('.').pop() || 'unknown',
                    fileSize: newFile.size,
                    fileUrl: urlData.publicUrl,
                },
                userId,
            );
            if (!result.success) { showToast('Replace failed', 'error'); return; }

            const updated = await fetchDriveFilesByFolder(driveFolderId);
            setFiles(updated as DriveFileRow[]);
            showToast('File replaced successfully', 'success');
        } catch {
            showToast('Something went wrong', 'error');
        } finally {
            setUploading(false);
            setReplacingFileId(null);
            if (replaceInputRef.current) replaceInputRef.current.value = '';
        }
    };

    // ── Optimistic delete — handles both single and multi-select ──
    const handleDeleteConfirm = async () => {
        if (!fileToDelete || !collegeId) return;
        setIsDeletingFile(true);

        const idsToDelete = selectedFileIds.length > 0 ? selectedFileIds : [fileToDelete.driveFileId];
        const filesToDelete = files.filter((f) => idsToDelete.includes(f.driveFileId));

        // Optimistically remove all
        setFiles((prev) => prev.filter((f) => !idsToDelete.includes(f.driveFileId)));

        try {
            const results = await Promise.all(
                filesToDelete.map((f) =>
                    deleteDriveFile(f.driveFileId, collegeId, f.driveFolderId, f.fileName)
                )
            );
            const anyFailed = results.some((r) => !r.success);
            if (anyFailed) {
                setFiles((prev) => [...filesToDelete, ...prev]);
                showToast('Failed to delete some files', 'error');
            } else {
                showToast(
                    filesToDelete.length > 1
                        ? `${filesToDelete.length} files deleted`
                        : 'File deleted',
                    'success'
                );
                setSelectedFileIds([]);
            }
        } catch {
            setFiles((prev) => [...filesToDelete, ...prev]);
            showToast('Something went wrong', 'error');
        } finally {
            setIsDeletingFile(false);
            setFileToDelete(null);
        }
    };

    // ── Force download for all file types including images ──
    const handleDownload = async (file: DriveFileRow) => {
        if (!collegeId) return;
        try {
            const storagePath = `${collegeId}/${file.driveFolderId}/${file.fileName.trim()}`;
            const { data, error } = await supabase.storage
                .from('college-drive')
                .createSignedUrl(storagePath, 120);
            if (error || !data?.signedUrl) return;

            const response = await fetch(data.signedUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = file.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch {
            showToast('Download failed', 'error');
        }
    };

    if (!open) return null;

    return (
        <>
            <style jsx global>{`
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #43C17A; }
            `}</style>

            <ConfirmDeleteModal
                open={fileToDelete !== null}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setFileToDelete(null);
                    setSelectedFileIds([]);
                }}
                isDeleting={isDeletingFile}
                name={
                    selectedFileIds.length > 1
                        ? `${selectedFileIds.length} files`
                        : fileToDelete?.fileName ?? 'file'
                }
            />

            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                {toast && (
                    <div className={`fixed top-5 right-5 z-[300] px-4 py-3 rounded-lg shadow-lg text-black text-sm font-medium ${toast.type === 'success' ? 'bg-white' : 'bg-red-500'}`}>
                        {toast.message}
                    </div>
                )}

                <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[60vh]">

                    {/* Header */}
                    <div className="bg-[#43C17A] py-3 px-5 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors cursor-pointer">
                                <ArrowLeft size={20} strokeWidth={2.5} />
                            </button>
                            <div>
                                <h2 className="text-[18px] font-medium tracking-wide">{folderName}</h2>
                                <p className="text-white/80 text-xs">
                                    {files.length} {files.length === 1 ? 'File' : 'Files'} · {formatSize(totalSizeBytes)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => uploadInputRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            >
                                {uploading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <><UploadSimple size={16} weight="bold" /> Upload</>
                                )}
                            </button>

                            {/* Upload input: multi-file, all types, no size limit */}
                            <input
                                ref={uploadInputRef}
                                type="file"
                                multiple
                                accept="*/*"
                                className="hidden"
                                onChange={(e) => handleUpload(e)}
                            />

                            {/* Replace input: single file only */}
                            <input
                                ref={replaceInputRef}
                                type="file"
                                accept="*/*"
                                className="hidden"
                                onChange={handleReplaceFile}
                            />

                            <button onClick={onClose} className="hover:opacity-80 transition-opacity cursor-pointer">
                                <X size={18} weight="bold" />
                            </button>
                        </div>
                    </div>

                    {/* Per-file upload progress bars */}
                    {uploadItems.length > 0 && (
                        <div className="px-5 py-3 border-b border-gray-100 flex flex-col gap-2 shrink-0 bg-[#F8FAFC]">
                            {uploadItems.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-xs text-[#64748B] mb-1">
                                        <span className="truncate max-w-[70%]">{item.file.name}</span>
                                        <span className={
                                            item.status === 'error'
                                                ? 'text-red-500'
                                                : item.status === 'done'
                                                    ? 'text-[#43C17A]'
                                                    : ''
                                        }>
                                            {item.status === 'error'
                                                ? 'Failed'
                                                : item.status === 'done'
                                                    ? 'Done ✓'
                                                    : `${item.progress}%`}
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-200 ${item.status === 'error' ? 'bg-red-500' : 'bg-[#43C17A]'}`}
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Files list — with drag & drop */}
                    <div
                        className={`p-4 flex-1 overflow-y-auto bg-white flex flex-col gap-2 custom-scrollbar relative transition-all ${isDragging ? 'ring-2 ring-inset ring-[#43C17A] bg-green-50' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {/* Drag overlay */}
                        {isDragging && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-green-50/90 pointer-events-none rounded-b-2xl">
                                <UploadSimple size={40} className="text-[#43C17A] mb-2" weight="bold" />
                                <p className="text-[#43C17A] font-semibold text-sm">Drop files here to upload</p>
                            </div>
                        )}

                        {/* Select all bar */}
                        {!loading && files.length > 0 && (
                            <div className="flex items-center justify-between mb-1 px-1">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 select-none">
                                    <input
                                        type="checkbox"
                                        checked={selectedFileIds.length === files.length && files.length > 0}
                                        onChange={toggleSelectAll}
                                        className="accent-[#43C17A] w-4 h-4 cursor-pointer"
                                    />
                                    {selectedFileIds.length > 0 ? `${selectedFileIds.length} selected` : 'Select all'}
                                </label>
                                {selectedFileIds.length > 0 && (
                                    <button
                                        onClick={() => {
                                            const firstSelected = files.find((f) => selectedFileIds.includes(f.driveFileId));
                                            if (firstSelected) setFileToDelete(firstSelected);
                                        }}
                                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
                                    >
                                        <Trash size={14} weight="bold" />
                                        Delete selected ({selectedFileIds.length})
                                    </button>
                                )}
                            </div>
                        )}

                        {loading ? (
                            <>
                                {[...Array(5)].map((_, i) => <ShimmerRow key={i} />)}
                            </>
                        ) : files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
                                <UploadSimple size={36} className="mb-2 opacity-40" />
                                <p className="text-sm">No files yet. Click Upload or drag & drop files here.</p>
                            </div>
                        ) : (
                            files.map((file) => (
                                <div
                                    key={file.driveFileId}
                                    className={`bg-white border rounded-xl py-2 px-4 flex items-center justify-between transition-all ${selectedFileIds.includes(file.driveFileId)
                                        ? 'border-[#43C17A] bg-green-50/40'
                                        : replacingFileId === file.driveFileId
                                            ? 'border-[#43C17A] opacity-60'
                                            : 'border-gray-200 hover:border-[#43C17A]/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={selectedFileIds.includes(file.driveFileId)}
                                            onChange={() => toggleSelectFile(file.driveFileId)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="accent-[#43C17A] w-4 h-4 cursor-pointer shrink-0"
                                        />
                                        <div className="p-1.5 bg-red-50 rounded-lg flex items-center justify-center">
                                            {getFileIcon(file.fileName)}
                                        </div>
                                        <span className="text-[#282828] font-normal text-[14px] truncate max-w-[280px]">
                                            {file.fileName}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="flex items-center gap-5 text-[#5D5D5D] text-[13px] font-medium">
                                            <span>{formatSize(file.fileSize)}</span>
                                            <span className="uppercase text-gray-400 w-10 text-center">
                                                {file.fileName.split('.').pop()?.toUpperCase()}
                                            </span>
                                            <span className="text-gray-400 text-xs w-24 text-right">
                                                {formatDate(file.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Pencil — replace file */}
                                            <button
                                                className="text-[#43C17A] hover:text-[#2ea863] transition-colors cursor-pointer disabled:opacity-40"
                                                onClick={() => handleReplaceClick(file)}
                                                title="Replace file"
                                                disabled={uploading}
                                            >
                                                <PencilSimple size={17} weight="bold" />
                                            </button>

                                            {/* Download — force download all types */}
                                            <button
                                                className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer disabled:opacity-40"
                                                onClick={() => handleDownload(file)}
                                                title="Download file"
                                                disabled={uploading}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 256 256">
                                                    <path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,132.69V40a8,8,0,0,0-16,0v92.69L93.66,106.34a8,8,0,0,0-11.32,11.32Z" />
                                                </svg>
                                            </button>

                                            {/* Trash — opens confirm modal */}
                                            <button
                                                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-40"
                                                onClick={() => setFileToDelete(file)}
                                                title="Delete file"
                                                disabled={uploading || isDeletingFile}
                                            >
                                                <Trash size={17} weight="bold" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}