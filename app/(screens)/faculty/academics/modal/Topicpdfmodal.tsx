// "use client";

// import { useState, useRef, useCallback, useEffect } from "react";
// import { X, Trash, UploadSimple, FilePdf, ArrowSquareOut, SpinnerGap } from "@phosphor-icons/react";

// import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
// import { useUser } from "@/app/utils/context/UserContext";
// import toast from "react-hot-toast";
// import { deleteTopicResource, getTopicResources, TopicResource, uploadTopicResource } from "@/lib/helpers/faculty/Topicresources";

// // ─── Types ────────────────────────────────────────────────────────────────────

// type StagedFile = {
//     id: string;
//     file: File;
//     previewName: string;
//     sizeLabel: string;
// };

// type TopicPdfModalProps = {
//     isOpen: boolean;
//     onClose: () => void;
//     unitLabel: string;
//     unitTitle: string;
//     topicTitle: string;
//     topicId: number;
// };

// // ─── Utils ────────────────────────────────────────────────────────────────────

// function formatSize(bytes: number): string {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export function TopicPdfModal({
//     isOpen,
//     onClose,
//     unitLabel,
//     unitTitle,
//     topicTitle,
//     topicId,
// }: TopicPdfModalProps) {
//     const { facultyId, collegeId } = useFaculty();
//     const { adminId } = useUser();

//     const [savedResources, setSavedResources] = useState<TopicResource[]>([]);
//     const [loadingResources, setLoadingResources] = useState(false);
//     const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
//     const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
//     const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
//     const [dragging, setDragging] = useState(false);
//     const inputRef = useRef<HTMLInputElement>(null);

//     // Load existing resources when modal opens
//     useEffect(() => {
//         if (!isOpen || !topicId) return;
//         let cancelled = false;

//         async function load() {
//             setLoadingResources(true);
//             try {
//                 const data = await getTopicResources(topicId);
//                 if (!cancelled) setSavedResources(data);
//             } catch (err: any) {
//                 toast.error(err?.message ?? "Failed to load resources");
//             } finally {
//                 if (!cancelled) setLoadingResources(false);
//             }
//         }

//         load();
//         return () => { cancelled = true; };
//     }, [isOpen, topicId]);

//     // Reset staged files on close
//     useEffect(() => {
//         if (!isOpen) setStagedFiles([]);
//     }, [isOpen]);

//     // Stage files locally (not yet uploaded)
//     const stageFiles = (files: FileList | File[]) => {
//         const pdfs = Array.from(files).filter((f) => f.type === "application/pdf");
//         if (pdfs.length === 0) {
//             toast.error("Only PDF files are allowed.");
//             return;
//         }
//         const mapped: StagedFile[] = pdfs.map((f) => ({
//             id: `staged-${f.name}-${Date.now()}`,
//             file: f,
//             previewName: f.name,
//             sizeLabel: formatSize(f.size),
//         }));
//         setStagedFiles((prev) => [...prev, ...mapped]);
//     };

//     const handleDrop = useCallback((e: React.DragEvent) => {
//         e.preventDefault();
//         setDragging(false);
//         stageFiles(e.dataTransfer.files);
//     }, []);

//     const removeStagedFile = (id: string) =>
//         setStagedFiles((prev) => prev.filter((f) => f.id !== id));

//     // Upload all staged files to Supabase
//     const handleUpload = async () => {
//         if (stagedFiles.length === 0) return;
//         if (!facultyId || !collegeId) {
//             toast.error("Missing faculty/college context.");
//             return;
//         }

//         const ids = new Set(stagedFiles.map((f) => f.id));
//         setUploadingIds(ids);

//         const results: TopicResource[] = [];

//         for (const staged of stagedFiles) {
//             try {
//                 const resource = await uploadTopicResource({
//                     file: staged.file,
//                     collegeSubjectUnitTopicId: topicId,
//                     collegeId: Number(collegeId),
//                     facultyId: Number(facultyId),
//                     adminId: Number(adminId ?? 1),
//                 });
//                 results.push(resource);
//             } catch (err: any) {
//                 toast.error(`Failed to upload "${staged.previewName}": ${err?.message}`);
//             }
//         }

//         setSavedResources((prev) => [...prev, ...results]);
//         setStagedFiles([]);
//         setUploadingIds(new Set());

//         if (results.length > 0) {
//             toast.success(
//                 results.length === 1
//                     ? "File uploaded successfully"
//                     : `${results.length} files uploaded`
//             );
//         }
//     };

//     // Delete a saved resource
//     const handleDeleteSaved = async (resource: TopicResource) => {
//         setDeletingIds((prev) => new Set(prev).add(resource.collegeSubjectUnitTopicResourceId));
//         try {
//             await deleteTopicResource({
//                 resourceId: resource.collegeSubjectUnitTopicResourceId,
//                 resourceUrl: resource.resourceUrl,
//             });
//             setSavedResources((prev) =>
//                 prev.filter(
//                     (r) => r.collegeSubjectUnitTopicResourceId !== resource.collegeSubjectUnitTopicResourceId
//                 )
//             );
//             toast.success("Resource deleted");
//         } catch (err: any) {
//             toast.error(err?.message ?? "Failed to delete resource");
//         } finally {
//             setDeletingIds((prev) => {
//                 const next = new Set(prev);
//                 next.delete(resource.collegeSubjectUnitTopicResourceId);
//                 return next;
//             });
//         }
//     };

//     if (!isOpen) return null;

//     const isUploading = uploadingIds.size > 0;

//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
//             onClick={(e) => e.target === e.currentTarget && onClose()}
//         >
//             {/* ── Modal shell: fixed height, never grows ── */}
//             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]">

//                 {/* Close button */}
//                 <button
//                     onClick={onClose}
//                     className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
//                 >
//                     <X size={20} weight="bold" />
//                 </button>

//                 {/* ── Scrollable body ── */}
//                 <div className="flex flex-col gap-5 p-6 overflow-y-auto flex-1 min-h-0">

//                     {/* Breadcrumb */}
//                     <h2 className="text-base font-semibold text-gray-800 flex flex-wrap items-center gap-1 pr-6">
//                         <span className="text-[#7E5DFF]">{unitLabel}</span>
//                         <span className="text-gray-400">→</span>
//                         <span className="text-gray-700">{unitTitle}</span>
//                         <span className="text-gray-400">→</span>
//                         <span className="text-gray-700">{topicTitle}</span>
//                     </h2>

//                     {/* Upload label */}
//                     <p className="text-sm font-semibold text-gray-700 -mb-2">Upload</p>

//                     {/* Drop zone */}
//                     <div
//                         onDrop={handleDrop}
//                         onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
//                         onDragLeave={() => setDragging(false)}
//                         onClick={() => inputRef.current?.click()}
//                         className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition
//                             ${dragging
//                                 ? "border-[#43C17A] bg-[#F0FBF5]"
//                                 : "border-gray-300 bg-gray-50 hover:border-[#43C17A] hover:bg-[#F0FBF5]"
//                             }`}
//                     >
//                         <div className="bg-white rounded-full p-3 shadow-sm">
//                             <UploadSimple size={28} className="text-gray-400" weight="bold" />
//                         </div>
//                         <p className="text-sm text-gray-500">Drag &amp; Drop your PDF here or</p>
//                         <button
//                             type="button"
//                             onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
//                             className="px-5 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-100 transition cursor-pointer"
//                         >
//                             Browse Files
//                         </button>
//                         <input
//                             ref={inputRef}
//                             type="file"
//                             accept="application/pdf"
//                             multiple
//                             className="hidden"
//                             onChange={(e) => {
//                                 if (e.target.files) stageFiles(e.target.files);
//                                 e.target.value = "";
//                             }}
//                         />
//                     </div>

//                     {/* Staged files — pending upload */}
//                     {stagedFiles.length > 0 && (
//                         <div className="flex flex-col gap-2">
//                             <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
//                                 Ready to upload ({stagedFiles.length})
//                             </p>
//                             <ul className="flex flex-col gap-2">
//                                 {stagedFiles.map((f) => (
//                                     <li
//                                         key={f.id}
//                                         className="flex items-center justify-between gap-3 bg-orange-50 rounded-xl px-4 py-2.5 border border-orange-100"
//                                     >
//                                         <div className="flex items-center gap-3 min-w-0">
//                                             <div className="bg-red-100 rounded-lg p-1.5 flex-shrink-0">
//                                                 <FilePdf size={20} weight="duotone" className="text-red-500" />
//                                             </div>
//                                             <div className="min-w-0">
//                                                 <p className="text-sm font-medium text-gray-700 truncate">{f.previewName}</p>
//                                                 <p className="text-xs text-gray-400">{f.sizeLabel}</p>
//                                             </div>
//                                         </div>
//                                         <button
//                                             onClick={() => removeStagedFile(f.id)}
//                                             disabled={isUploading}
//                                             className="text-gray-400 hover:text-red-500 transition flex-shrink-0 disabled:opacity-40 cursor-pointer"
//                                         >
//                                             <Trash size={18} />
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}

//                     {/* Saved resources — already in DB */}
//                     {loadingResources ? (
//                         <div className="flex items-center justify-center py-4 gap-2 text-gray-400 text-sm">
//                             <SpinnerGap size={18} className="animate-spin" />
//                             Loading resources...
//                         </div>
//                     ) : savedResources.length > 0 ? (
//                         <div className="flex flex-col gap-2">
//                             <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
//                                 Uploaded ({savedResources.length})
//                             </p>
//                             <ul className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
//                                 {savedResources.map((r) => {
//                                     const isDeleting = deletingIds.has(r.collegeSubjectUnitTopicResourceId);
//                                     return (
//                                         <li
//                                             key={r.collegeSubjectUnitTopicResourceId}
//                                             className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100"
//                                         >
//                                             <div className="flex items-center gap-3 min-w-0">
//                                                 <div className="bg-red-100 rounded-lg p-1.5 flex-shrink-0">
//                                                     <FilePdf size={20} weight="duotone" className="text-red-500" />
//                                                 </div>
//                                                 <div className="min-w-0">
//                                                     <p className="text-sm font-medium text-gray-700 truncate">
//                                                         {r.resourceName}
//                                                     </p>
//                                                     <p className="text-xs text-gray-400 capitalize">{r.resourceType}</p>
//                                                 </div>
//                                             </div>
//                                             <div className="flex items-center gap-2 flex-shrink-0">
//                                                 <a
//                                                     href={r.resourceUrl}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="text-gray-400 hover:text-[#7E5DFF] transition"
//                                                     title="Open PDF"
//                                                 >
//                                                     <ArrowSquareOut size={18} />
//                                                 </a>
//                                                 <button
//                                                     onClick={() => handleDeleteSaved(r)}
//                                                     disabled={isDeleting}
//                                                     className="text-gray-400 hover:text-red-500 transition disabled:opacity-40"
//                                                     title="Delete"
//                                                 >
//                                                     {isDeleting
//                                                         ? <SpinnerGap size={18} className="animate-spin" />
//                                                         : <Trash size={18} />
//                                                     }
//                                                 </button>
//                                             </div>
//                                         </li>
//                                     );
//                                 })}
//                             </ul>
//                         </div>
//                     ) : null}

//                 </div>
//                 {/* ── End scrollable body ── */}

//                 {/* ── Pinned footer — always visible ── */}
//                 <div className="flex gap-3 px-6 pb-6 pt-3 border-t border-gray-100 flex-shrink-0">
//                     <button
//                         onClick={onClose}
//                         className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleUpload}
//                         disabled={isUploading || stagedFiles.length === 0}
//                         className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer
//                             ${isUploading || stagedFiles.length === 0
//                                 ? "bg-[#43C17A]/50 cursor-not-allowed"
//                                 : "bg-[#43C17A] hover:bg-[#3aad6c]"
//                             }`}
//                     >
//                         {isUploading && <SpinnerGap size={16} className="animate-spin" />}
//                         {isUploading
//                             ? "Uploading..."
//                             : `Upload File${stagedFiles.length > 1 ? "s" : ""}`
//                         }
//                     </button>
//                 </div>

//             </div>
//         </div>
//     );
// }