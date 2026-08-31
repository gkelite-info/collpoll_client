"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  CloudArrowUp,
  FilePdf,
  Trash,
  DownloadSimple,
  UserCircle,
  CalendarBlank,
  CalendarDotsIcon,
} from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const getSecureUrl = (url: string) => {
  if (!url) return url;
  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx !== -1) return `/api/files/${url.slice(idx + marker.length)}`;
  return url;
};

import { useStudent } from "@/app/utils/context/student/useStudent";
import toast from "react-hot-toast";
import {
  fetchStudentDiscussionMarks,
  saveStudentDiscussionUpload,
  uploadStudentDiscussionFiles,
} from "@/lib/helpers/student/assignments/discussionForum/student_discussion_uploadsAPI";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

const MAX_DISCUSSION_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DISCUSSION_FILES = 10;
const DISCUSSION_FILES_PER_PAGE = 4;

type ExistingDiscussionUpload = {
  studentDiscussionUploadId: number;
  fileUrl: string;
};

function useLockPageScroll() {
  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, []);
}

export function StudentDiscussionUploadModal({
  discussion,
  onUpload,
  onSuccess,
}: {
  discussion: any;
  onUpload: (files: any[]) => void;
  onSuccess?: () => void;
}) {
  useLockPageScroll();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { studentId } = useStudent();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const existingUploads: ExistingDiscussionUpload[] =
    discussion.studentUploads ?? [];

  const uploadItems = [
    ...existingUploads.map((file) => ({
      kind: "existing" as const,
      file,
    })),
    ...files.map((file, index) => ({
      kind: "new" as const,
      file,
      originalIndex: index,
    })),
  ];
  const totalFilePages = Math.max(
    1,
    Math.ceil(uploadItems.length / DISCUSSION_FILES_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalFilePages);
  const paginatedUploadItems = uploadItems.slice(
    (safeCurrentPage - 1) * DISCUSSION_FILES_PER_PAGE,
    safeCurrentPage * DISCUSSION_FILES_PER_PAGE,
  );


  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("discussionId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleUploadSubmit = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    if (!studentId) {
      toast.error("Student not found");
      return;
    }

    if (files.some((file) => file.size > MAX_DISCUSSION_FILE_SIZE)) {
      toast.error("Each file must not exceed 10 MB");
      return;
    }

    if (existingUploads.length + files.length > MAX_DISCUSSION_FILES) {
      toast.error("A discussion can have a maximum of 10 files");
      return;
    }

    try {
      setLoading(true);

      const fileUrls = await uploadStudentDiscussionFiles(
        discussion.discussionId,
        studentId,
        files,
      );

      for (const fileUrl of fileUrls) {
        const result = await saveStudentDiscussionUpload({
          studentId,
          discussionId: discussion.discussionId,
          discussionSectionId: discussion.discussionSectionId,
          fileUrl,
        });

        if (!result.success) {
          toast.error("Failed to save file record.");
          return;
        }
      }

      onUpload(
        files.map((f) => ({
          name: f.name,
          size: (f.size / 1024).toFixed(2) + " KB",
        })),
      );

      toast.success("Files uploaded successfully!");
      onSuccess?.();

      const params = new URLSearchParams(searchParams.toString());
      params.delete("modal");
      params.delete("discussionId");
      router.push(`${pathname}?${params.toString()}`);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error("handleUploadSubmit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addValidatedFiles = useCallback((selectedFiles: File[]) => {
    const sizeValidatedFiles = selectedFiles.filter(
      (file) => file.size <= MAX_DISCUSSION_FILE_SIZE,
    );

    if (sizeValidatedFiles.length !== selectedFiles.length) {
      toast.error("Each file must not exceed 10 MB");
    }

    const availableSlots = Math.max(
      0,
      MAX_DISCUSSION_FILES - existingUploads.length - files.length,
    );
    const filesToAdd = sizeValidatedFiles.slice(0, availableSlots);

    if (filesToAdd.length !== sizeValidatedFiles.length) {
      toast.error("A discussion can have a maximum of 10 files");
    }

    if (filesToAdd.length > 0) {
      setFiles((prev) => [...prev, ...filesToAdd]);
    }
  }, [existingUploads.length, files.length]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addValidatedFiles(Array.from(e.target.files));
    }
    e.target.value = "";
  };
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addValidatedFiles(Array.from(e.dataTransfer.files));
    }
  }, [addValidatedFiles]);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg h-120 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col p-6">
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-[#43C17A]">
              {discussion.title}
            </h2>
            <h3 className="text-lg font-bold text-[#282828] mt-2">Upload</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 cursor-pointer rounded-md transition-colors"
          >
            <X size={24} color="black" />
          </button>
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={onFileSelect}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shrink-0 ${files.length > 0 ? "p-6" : "p-10"} ${isDragging ? "border-[#43C17A] bg-[#e2f6ea]" : "border-gray-300 bg-gray-50/50"}`}
          >
            <CloudArrowUp size={48} className="text-gray-400" />
            <p className="text-base text-gray-600">
              Drag & Drop Your File here or
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="bg-white border cursor-pointer border-gray-200 text-[#282828] px-5 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-500">
              Maximum file size: 10 MB per file
            </p>
            <p className="text-xs text-gray-500">
              Maximum files per discussion: 10
            </p>
          </div>

          {(existingUploads.length > 0 || files.length > 0) && (
            <div className="flex flex-col gap-3">
              {paginatedUploadItems.map((item) =>
                item.kind === "existing" ? (
                  <a
                    key={`existing-${item.file.studentDiscussionUploadId}`}
                    href={item.file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-green-100 rounded-md p-3 bg-white shrink-0"
                  >
                    <FilePdf
                      size={24}
                      weight="fill"
                      className="text-red-500 flex-shrink-0"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-[#282828] truncate">
                        {item.file.fileUrl?.split("/").pop() ?? "Uploaded file"}
                      </span>
                      <span className="text-xs text-[#43C17A]">
                        Uploaded
                      </span>
                    </div>
                  </a>
                ) : (
                  <div
                    key={`new-${item.file.name}-${item.file.lastModified}-${item.originalIndex}`}
                    className="flex items-center justify-between border border-green-100 rounded-md p-3 bg-white"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FilePdf
                        size={24}
                        weight="fill"
                        className="text-red-500 flex-shrink-0"
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-[#282828] truncate">
                          {item.file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {(item.file.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setFiles((prev) =>
                          prev.filter((_, i) => i !== item.originalIndex),
                        )
                      }
                      className="p-1.5 text-red-500 bg-red-100 rounded transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ),
              )}

              <div className="overflow-hidden rounded-xl border border-gray-100">
                <Pagination
                  currentPage={safeCurrentPage}
                  totalItems={uploadItems.length}
                  itemsPerPage={DISCUSSION_FILES_PER_PAGE}
                  onPageChange={setCurrentPage}
                  alwaysShow
                  bgClassName="bg-white border-0"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 gap-4 shrink-0">
          <button
            onClick={handleClose}
            className="w-full cursor-pointer py-3 rounded-md font-bold text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadSubmit}
            className="w-full cursor-pointer py-3 rounded-md font-bold text-sm bg-[#43C17A] text-white hover:bg-[#38a366] shadow-sm transition-colors"
            disabled={loading}
          >
            {loading ? "Uploading.." : "Upload File"}
          </button>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export function StudentDiscussionDetailsModal({
  discussion,
}: {
  discussion: any;
}) {
  useLockPageScroll();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { studentId } = useStudent();

  const [marks, setMarks] = useState<{
    marksObtained: number | null;
    totalMarks: number | null;
  } | null>(null);


  useEffect(() => {
    if (!studentId || !discussion?.discussionId) return;

    fetchStudentDiscussionMarks(discussion.discussionId, studentId)
      .then(setMarks)
      .catch(() => setMarks(null));
  }, [studentId, discussion?.discussionId]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("discussionId");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start p-4 md:p-6 border-b border-gray-100 gap-4 md:gap-0 relative">
          <button
            onClick={handleClose}
            className="md:hidden absolute top-4 right-4 text-gray-500 p-1 cursor-pointer rounded-md"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col gap-3 pr-8 md:pr-0 w-full md:w-auto">
            <h2 className="text-2xl font-bold text-[#43C17A]">
              {discussion.title}
            </h2>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-[#43C07A24] p-1 rounded-full flex-shrink-0">
                  <UserCircle
                    size={18}
                    className="text-[#43C17A]"
                    weight="regular"
                  />
                </div>
                <span className="font-bold text-[#282828] flex-shrink-0">Faculty Name :</span>
                <span className="text-gray-600 truncate">{discussion.facultyName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-[#43C07A24] p-1 rounded-full flex-shrink-0">
                  <CalendarDotsIcon
                    size={18}
                    className="text-[#43C17A]"
                    weight="regular"
                  />
                </div>
                <span className="font-bold text-[#282828] flex-shrink-0">Uploaded On :</span>
                <span className="text-gray-600">
                  {discussion.createdAt
                    ? new Date(discussion.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-red-00 flex flex-col items-start md:items-end gap-4 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (discussion.attachments?.length > 0) {
                    discussion.attachments.forEach((file: any) => {
                      if (file.fileUrl) {
                        window.open(getSecureUrl(file.fileUrl), "_blank");
                      }
                    });
                  } else {
                    toast.error("No attachments available to download");
                  }
                }}
                className="flex items-center cursor-pointer gap-2 bg-[#43C17A] text-white px-4 py-2 rounded-md font-bold text-sm w-full md:w-auto justify-center"
              >
                Download{" "}
                <span className="bg-white rounded-full text-[#43C17A] p-1">
                  <DownloadSimple size={12} weight="bold" />
                </span>
              </button>
              <button
                onClick={handleClose}
                className="hidden md:block text-gray-500 p-1 cursor-pointer rounded-md"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-yellow-00 flex items-center gap-1">
              <p className="text-[#282828] text-base font-medium">Marks Scored :</p>
              <p className="text-orange-600 font-medium">
                {marks?.marksObtained !== null
                  ? `${marks?.marksObtained}` : "-"
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-pink-00 flex flex-col px-4 py-4 lg:px-5 lg:py-4 overflow-y-auto">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-[#282828]">Description</h3>
            <p className="text-sm text-[#282828] leading-relaxed whitespace-pre-line">
              {discussion.description ?? "No description provided."}
            </p>
          </div>
          <div className="flex flex-col lg:mt-2">
            <h3 className="text-base font-bold text-[#282828]">Deadline</h3>
            <p className="text-sm text-[#282828]">
              {discussion.deadline
                ? new Date(discussion.deadline).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div className="flex flex-col lg:mt-2">
            <h3 className="text-base font-bold text-[#282828]">Total Marks</h3>
            <p className="text-sm text-[#282828]">{discussion.marks ?? "—"}</p>
          </div>
          {discussion.attachments?.length > 0 && (
            <div className="flex flex-col lg:mt-2">
              <h3 className="text-base font-bold text-[#282828]">
                Attachments
              </h3>
              <div className="flex flex-wrap gap-2">
                {discussion.attachments.map(
                  (file: { fileUrl: string }, idx: number) => (
                    <a
                      key={idx}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#e2e8f0] text-[#334155] px-3 py-1.5 rounded-md text-xs font-semibold"
                    >
                      <FilePdf
                        size={16}
                        weight="fill"
                        className="text-[#1e293b]"
                      />
                      {file.fileUrl
                        ?.split("/")
                        .pop()
                        ?.split("_")
                        .slice(1)
                        .join("_") ?? "File"}
                    </a>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
