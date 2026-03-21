'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, FilePdf, FileXls, FileDoc, FileText, UploadSimple, Trash, PencilSimple } from "@phosphor-icons/react";
import { ArrowLeft } from 'lucide-react';
import { fetchDriveFilesByFolder, saveDriveFile, deleteDriveFile, DriveFileRow } from '@/lib/helpers/drive/driveFilesAPI';
import { useUser } from '@/app/utils/context/UserContext';

type FolderFilesModalProps = {
    open: boolean;
    onClose: () => void;
    folderName: string;
    driveFolderId: number | null;
    collegeId: number | null;
    onFilesChanged?: (driveFolderId: number, fileCount: number, totalSizeBytes: number) => void;
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

export default function FolderFilesModal({
    open,
    onClose,
    folderName,
    driveFolderId,
    collegeId,
    onFilesChanged,
}: FolderFilesModalProps) {
    const { userId } = useUser();

    // One hidden input for header Upload, one per-row for replace
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);

    const [files, setFiles] = useState<DriveFileRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [replacingFileId, setReplacingFileId] = useState<number | null>(null); // which row is replacing
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const totalSizeBytes = files.reduce((acc, f) => acc + (f.fileSize ?? 0), 0);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Load files when modal opens
    useEffect(() => {
        if (!open || !driveFolderId) return;
        setLoading(true);
        fetchDriveFilesByFolder(driveFolderId)
            .then((data) => setFiles(data as DriveFileRow[]))
            .catch(() => showToast('Failed to load files', 'error'))
            .finally(() => setLoading(false));
    }, [open, driveFolderId]);

    // Notify parent on file list change
    useEffect(() => {
        if (!driveFolderId) return;
        onFilesChanged?.(driveFolderId, files.length, totalSizeBytes);
    }, [files]);

    // ── Header Upload: new file ──────────────────────────────
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !driveFolderId || !collegeId || !userId) return;

        setUploading(true);
        try {
            const result = await saveDriveFile(
                { driveFolderId, collegeId, fileName: file.name, fileType: file.type || file.name.split('.').pop() || 'unknown', fileSize: file.size, file },
                userId,
            );
            if (!result.success) { showToast('Upload failed', 'error'); return; }
            const updated = await fetchDriveFilesByFolder(driveFolderId);
            setFiles(updated as DriveFileRow[]);
            showToast('File uploaded successfully', 'success');
        } catch { showToast('Something went wrong', 'error'); }
        finally {
            setUploading(false);
            if (uploadInputRef.current) uploadInputRef.current.value = '';
        }
    };

    // ── Pencil: replace file in same row ────────────────────
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
            // 1. Remove old file from bucket
            const { supabase } = await import('@/lib/supabaseClient');
            const oldPath = `${collegeId}/${driveFolderId}/${existingFile.fileName.trim()}`;
            await supabase.storage.from('college-drive').remove([oldPath]);

            // 2. Upload new file to bucket
            const newPath = `${collegeId}/${driveFolderId}/${newFile.name.trim()}`;
            const { error: uploadError } = await supabase.storage
                .from('college-drive')
                .upload(newPath, newFile, { upsert: true, contentType: newFile.type });

            if (uploadError) { showToast('Replace failed', 'error'); return; }

            const { data: urlData } = supabase.storage.from('college-drive').getPublicUrl(newPath);

            // 3. Update existing DB row in place (same driveFileId)
            const result = await saveDriveFile(
                {
                    driveFileId: existingFile.driveFileId, // ← update, not insert
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

            // 4. Refresh list
            const updated = await fetchDriveFilesByFolder(driveFolderId);
            setFiles(updated as DriveFileRow[]);
            showToast('File replaced successfully', 'success');
        } catch { showToast('Something went wrong', 'error'); }
        finally {
            setUploading(false);
            setReplacingFileId(null);
            if (replaceInputRef.current) replaceInputRef.current.value = '';
        }
    };

    // ── Trash: soft delete ───────────────────────────────────
    const handleDelete = async (file: DriveFileRow) => {
        if (!collegeId) return;
        try {
            const result = await deleteDriveFile(file.driveFileId, collegeId, file.driveFolderId, file.fileName);
            if (!result.success) { showToast('Failed to delete file', 'error'); return; }
            setFiles((prev) => prev.filter((f) => f.driveFileId !== file.driveFileId));
            showToast('File deleted', 'success');
        } catch { showToast('Something went wrong', 'error'); }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            {toast && (
                <div className={`fixed top-5 right-5 z-[300] px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-[#43C17A]' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}

            <div className="bg-white w-full max-w-[800px] rounded-2xl overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="bg-[#43C17A] py-3 px-5 flex items-center justify-between text-white">
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

                        {/* Hidden inputs */}
                        <input ref={uploadInputRef} type="file" className="hidden" onChange={handleUpload} />
                        <input ref={replaceInputRef} type="file" className="hidden" onChange={handleReplaceFile} />

                        <button onClick={onClose} className="hover:opacity-80 transition-opacity cursor-pointer">
                            <X size={18} weight="bold" />
                        </button>
                    </div>
                </div>

                {/* Files List */}
                <div className="p-4 max-h-[60vh] overflow-y-auto bg-white flex flex-col gap-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-[#9CA3AF] text-sm">Loading files...</div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
                            <UploadSimple size={36} className="mb-2 opacity-40" />
                            <p className="text-sm">No files yet. Click Upload to add files.</p>
                        </div>
                    ) : (
                        files.map((file) => (
                            <div
                                key={file.driveFileId}
                                className={`bg-white border rounded-xl py-2 px-4 flex items-center justify-between transition-all ${replacingFileId === file.driveFileId ? 'border-[#43C17A] opacity-60' : 'border-gray-200 hover:border-[#43C17A]/30'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-1.5 bg-red-50 rounded-lg flex items-center justify-center">
                                        {getFileIcon(file.fileName)}
                                    </div>
                                    <span className="text-[#282828] font-normal text-[14px] truncate max-w-[320px]">
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
                                        {/* Pencil — triggers replace file picker */}
                                        <button
                                            className="text-[#43C17A] hover:text-[#2ea863] transition-colors cursor-pointer"
                                            onClick={() => handleReplaceClick(file)}
                                            title="Replace file"
                                            disabled={uploading}
                                        >
                                            <PencilSimple size={17} weight="bold" />
                                        </button>
                                        {/* Trash — soft delete */}
                                        <button
                                            className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                            onClick={() => handleDelete(file)}
                                            title="Delete file"
                                            disabled={uploading}
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

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #43C17A; }
            `}</style>
        </div>
    );
}
