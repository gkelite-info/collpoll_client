"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { CaretLeftIcon, UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { getFacultySubjects } from "@/lib/helpers/faculty/getFacultySubjects";
import { CardProps } from "@/lib/types/faculty";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { FacultySectionRow, fetchFacultySections } from "@/lib/helpers/faculty/facultysectionsAPI";
import { saveLabManual, uploadLabManualFile } from "@/lib/helpers/faculty/facultyLabManualHelper";

interface FacultyLabFormProps {
    onSaved?: () => void;
    onCancel?: () => void;
    initialData?: any;
}

export default function FacultyLabForm({ onSaved, onCancel, initialData }: FacultyLabFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const faculty = useFaculty();

    const [labTitle, setLabTitle] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [academicYearId, setAcademicYearId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [description, setDescription] = useState("");
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [subjects, setSubjects] = useState<CardProps[]>([]);
    const [assignedData, setAssignedData] = useState<FacultySectionRow[]>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
    const [isLoadingSections, setIsLoadingSections] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [existingFileName, setExistingFileName] = useState<string | null>(null);

    useEffect(() => {
        async function loadInitialData() {
            if (faculty.loading || !faculty.collegeId) return;
            try {
                setIsLoadingSubjects(true);
                const data = await getFacultySubjects({
                    collegeId: faculty.collegeId,
                    collegeEducationId: faculty.collegeEducationId ?? 0,
                    collegeBranchId: faculty.collegeBranchId ?? 0,
                    academicYearIds: faculty.academicYearIds,
                    subjectIds: faculty.subjectIds,
                    sectionIds: faculty.sectionIds,
                });
                setSubjects(data);
            } catch (error) {
                toast.error("Failed to load subjects");
            } finally {
                setIsLoadingSubjects(false);
            }
        }
        loadInitialData();
    }, [faculty.loading, faculty.collegeId]);

    useEffect(() => {
        if (!initialData || !faculty.facultyId) return;

        const loadAll = async () => {
            try {
                setIsLoadingSections(true);

                setSubjectId(initialData.collegeSubjectId.toString());

                const data = await fetchFacultySections(
                    faculty.facultyId!,
                    Number(initialData.collegeSubjectId)
                );

                setAssignedData(data);

                setAcademicYearId(initialData.collegeAcademicYearId.toString());
                setSectionId(initialData.collegeSectionsId.toString());
                setExistingFileName(initialData.pdfUrl?.split("/").pop() || null);

                setLabTitle(initialData.labTitle || "");
                setDescription(initialData.description || "");
            } catch (error) {
                toast.error("Failed to load edit data");
            } finally {
                setIsLoadingSections(false);
            }
        };

        loadAll();
    }, [initialData, faculty.facultyId]);

    const handleSubjectChange = async (sId: string) => {
        setSubjectId(sId);
        setAcademicYearId("");
        setSectionId("");
        setAssignedData([]);

        if (!sId || !faculty.facultyId) return;

        try {
            setIsLoadingSections(true);
            const data = await fetchFacultySections(faculty.facultyId, Number(sId));
            setAssignedData(data);
        } catch (error) {
            toast.error("Failed to load assigned years and sections");
        } finally {
            setIsLoadingSections(false);
        }
    };

    const availableYears = Array.from(new Set(assignedData.map(item => item.collegeAcademicYearId)))
        .map(id => {
            const yearObj = faculty.collegeAcademicYears?.find(y => y.collegeAcademicYearId === id);
            return { id, label: yearObj?.collegeAcademicYear || `Year ID: ${id}` };
        });

    const availableSections = assignedData
        .filter(item => item.collegeAcademicYearId === Number(academicYearId))
        .map(item => ({
            id: item.collegeSectionsId,
            name: item.college_sections?.collegeSections || "Unknown Section"
        }));

    const handleBack = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
        } else {
            toast.error("Please upload a PDF file only.");
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
        } else {
            toast.error("Please upload a PDF file only.");
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };


    const handleSubmit = async () => {
        if (!labTitle.trim()) return toast.error("Lab Title required");
        if (!subjectId) return toast.error("Choose at least one subject");
        if (!academicYearId) return toast.error("Choose at least one year");
        if (!sectionId) return toast.error("Choose at least one section");
        if (!pdfFile && !initialData) return toast.error("PDF is required");
        if (!faculty.facultyId) return toast.error("Faculty session not found");

        try {
            setIsSaving(true);
            setUploadProgress(10);

            let filePath = initialData?.pdfUrl;

            if (pdfFile) {
                const folder = `faculty_${faculty.facultyId}`;
                filePath = await uploadLabManualFile(pdfFile, folder);
            }

            setUploadProgress(60);

            const payload = {
                labTitle,
                description,
                pdfUrl: filePath,
                collegeSubjectId: Number(subjectId),
                collegeAcademicYearId: Number(academicYearId),
                collegeSectionsId: Number(sectionId),
                facultyId: faculty.facultyId,
            };

            await saveLabManual(
                {
                    labManualId: initialData?.labId,
                    ...payload,
                },
                {
                    id: faculty.facultyId,
                    role: "faculty",
                }
            );

            setUploadProgress(100);

            toast.success(
                initialData
                    ? "Lab manual updated successfully!"
                    : "Lab manual uploaded successfully!"
            );

            onSaved?.();
            handleBack();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save lab manual.");
        } finally {
            setIsSaving(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="w-[68%] h-full p-2 flex flex-col">
            <div className="flex items-start gap-3 mb-6">
                <button onClick={handleBack} className="transition-colors cursor-pointer lg:mt-1">
                    <CaretLeftIcon size={22} weight="bold" className="text-black" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-[#282828]">{initialData ? "Edit Lab Manual" : "Upload Lab Manual"}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Upload a PDF lab manual for your assigned sections</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-5 bg-white rounded-md p-5">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#282828]">
                        Lab Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={labTitle}
                        onChange={(e) => {
                            const value = e.target.value;
                            const capitalized =
                                value.charAt(0).toUpperCase() + value.slice(1);
                            setLabTitle(capitalized);
                        }}
                        placeholder="e.g. Experiment 3"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#282828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:border-transparent transition-all"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#282828]">Subject <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                value={subjectId}
                                onChange={(e) => handleSubjectChange(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#282828] bg-white focus:outline-none focus:ring-2 focus:ring-[#43C17A] appearance-none cursor-pointer disabled:bg-gray-50"
                                disabled={isLoadingSubjects}
                            >
                                <option value="">{isLoadingSubjects ? "Loading..." : "Select subject"}</option>
                                {subjects.map((sub) => (
                                    <option key={sub.collegeSubjectId} value={sub.collegeSubjectId}>{sub.subjectTitle}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#282828]">Year <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                value={academicYearId}
                                onChange={(e) => { setAcademicYearId(e.target.value); setSectionId(""); }}
                                disabled={!subjectId || isLoadingSections}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#282828] bg-white focus:outline-none appearance-none cursor-pointer disabled:bg-gray-50"
                            >
                                <option value="">Select year</option>
                                {availableYears.map((year) => (
                                    <option key={year.id} value={year.id}>{year.label}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#282828]">Section <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                value={sectionId}
                                onChange={(e) => setSectionId(e.target.value)}
                                disabled={!academicYearId || isLoadingSections}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#282828] bg-white focus:outline-none appearance-none cursor-pointer disabled:bg-gray-50"
                            >
                                <option value="">Select section</option>
                                {availableSections.map((sec) => (
                                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#282828]">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea
                        value={description}
                        onChange={(e) => {
                            const value = e.target.value;
                            const formatted =
                                value.charAt(0).toUpperCase() + value.slice(1);
                            setDescription(formatted);
                        }}
                        placeholder="Briefly describe the objective of this lab"
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#282828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#43C17A] transition-all resize-none"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#282828]">Lab Manual PDF <span className="text-red-500">*</span></label>

                    {pdfFile ? (
                        // 🟢 NEW FILE (same as your OLD UI)
                        <div className="w-full border border-[#43C17A]/30 bg-[#F0FFF7] rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#D5FFE7] flex items-center justify-center flex-shrink-0">
                                <UploadSimpleIcon size={22} className="text-[#43C17A]" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#282828] truncate">
                                    {pdfFile.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {formatFileSize(pdfFile.size)}
                                </p>

                                {isSaving && (
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-[#43C17A] h-1.5 rounded-full transition-all duration-200"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {!isSaving && (
                                <button
                                    onClick={() => setPdfFile(null)}
                                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                                >
                                    <XIcon size={16} weight="bold" className="text-red-500 cursor-pointer" />
                                </button>
                            )}
                        </div>
                    ) : existingFileName ? (
                        <div className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <UploadSimpleIcon size={22} className="text-gray-500" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#282828] truncate">
                                    {existingFileName}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Already uploaded
                                </p>
                            </div>

                            {/* <button
                                onClick={() => setExistingFileName(null)}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                                Replace
                            </button> */}
                            <a
                                href={initialData?.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-green-600 hover:text-green-700"
                            >
                                Preview
                            </a>
                        </div>
                    ) : (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-12 px-6 cursor-pointer transition-all
      ${isDragging
                                    ? "border-[#43C17A] bg-[#F0FFF7]"
                                    : "border-gray-200 bg-[#FAFAFA] hover:border-[#43C17A] hover:bg-[#F7FFFE]"
                                }`}
                        >
                            <div
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isDragging ? "bg-[#D5FFE7]" : "bg-[#F0F4F8]"
                                    }`}
                            >
                                <UploadSimpleIcon
                                    size={28}
                                    className={isDragging ? "text-[#43C17A]" : "text-[#94A3B8]"}
                                />
                            </div>

                            <p className="text-sm font-semibold text-[#282828] mb-1">
                                Drag & drop your PDF here
                            </p>
                            <p className="text-xs text-gray-400 mb-4">
                                or click to browse from your computer
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}

                </div>

                <div className="flex justify-end gap-3 pt-2 pb-4">
                    <button onClick={handleBack} className="px-6 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#282828] hover:bg-gray-50 transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSaving} className="px-6 py-2 rounded-lg bg-[#16284F] text-sm font-medium text-white hover:bg-[#102040] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60">
                        {isSaving
                            ? initialData ? "Updating..." : "Uploading..."
                            : initialData ? "Update Lab Manual" : "Upload Lab Manual"}
                    </button>
                </div>
            </div>
        </div>
    );
}