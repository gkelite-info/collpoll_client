"use client";

import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useEffect, useRef, useState } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { FaAngleLeft, FaPlus } from "react-icons/fa6";
import SelectionModal from "./modals/SelectionModal";
import { fetchFilteredFaculties } from "@/lib/helpers/admin/calender/fetchFacultyCalendar";
import { fetchStudentsWithProfile } from "@/lib/helpers/faculty/fetchStudents";
import { fetchFacultySections, fetchFacultySubjects, fetchFacultyYears } from "@/lib/helpers/faculty/facultyAPI";
import toast from "react-hot-toast";
import { FacultySectionRow } from "@/lib/helpers/faculty/facultysectionsAPI";
import { addProjectFiles, uploadProjectFile } from "@/lib/helpers/projects/projectFiles";
import { addStudentsToProject } from "@/lib/helpers/projects/projectTeamMembers";
import { addMentorsToProject } from "@/lib/helpers/projects/projectMentors";
import { saveProject } from "@/lib/helpers/projects/project";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";

export type ProjectPayload = {
    title: string;
    description: string;
    year: string;
    subject: string;
    section: string;
    domain: string[];
    marks: number | string;
    startDate: string;
    endDate: string;
    mentorIds: number[];
    studentIds: number[];
    fileUrls: string[];
    files: File[];
};

interface Props {
    onCancel: () => void;
    college_branch: string | null;
    collegeAcademicYear: string | null;
    faculty_edu_type: string | null;
}

const AddProjectForm = ({ onCancel, college_branch, collegeAcademicYear, faculty_edu_type }: Props) => {

    const { collegeId: facultyCollegeId, facultyId: contextFacultyId, role } = useFaculty();
    const { collegeId: adminCollegeId, adminId } = useAdmin();
    const { role: userRole } = useUser();

    const router = useRouter();
    const searchParams = useSearchParams();

    const facultyIdFromParams = searchParams.get("facultyId");
    const selectedYearId = searchParams.get("yearId");
    const selectedSubjectId = searchParams.get("subjectId");

    // ✅ Bug 1 & 2 fixed: resolve once, use everywhere, no fId state needed
    const resolvedFacultyId = contextFacultyId ??
        (facultyIdFromParams ? Number(facultyIdFromParams) : null);
    const resolvedCollegeId = facultyCollegeId ?? adminCollegeId;

    // ✅ Bug 4 fixed: detect admin correctly
    const isAdmin = userRole === "Admin";

    const [availableYears, setAvailableYears] = useState<{ id: number; label: string }[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<{ id: number; label: string }[]>([]);
    const [availableSections, setAvailableSections] = useState<FacultySectionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [domainInput, setDomainInput] = useState("");
    const [allFaculties, setAllFaculties] = useState<{ id: string; name: string; image?: string }[]>([]);
    const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [allStudents, setAllStudents] = useState<{ id: number; name: string; image?: string }[]>([]);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isStudentLoading, setIsStudentLoading] = useState(true);

    const [formData, setFormData] = useState<ProjectPayload>({
        title: "",
        description: "",
        domain: [],
        marks: "" as unknown as number,
        startDate: "",
        endDate: "",
        mentorIds: [],
        studentIds: [],
        fileUrls: [],
        files: [],
        year: "",
        subject: "",
        section: "",
    });

    const handleChange = (field: keyof ProjectPayload, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // ✅ Bug 2 fixed: depend on resolvedFacultyId directly, no userId guard
    useEffect(() => {
        const loadYears = async () => {
            if (!resolvedFacultyId) return;

            const years = await fetchFacultyYears(resolvedFacultyId);
            setAvailableYears(years);

            if (!isInitialized && years.length > 0) {
                const selected = selectedYearId
                    ? years.find(y => y.id === Number(selectedYearId))
                    : years[0];

                if (selected) {
                    setFormData(prev => ({ ...prev, year: selected.id.toString() }));
                }
            }
        };
        loadYears();
    }, [resolvedFacultyId]); // ✅ no longer blocked by null userId

    // ✅ Subjects load correctly using resolvedFacultyId
    useEffect(() => {
        const loadSubjects = async () => {
            if (!resolvedFacultyId || !formData.year) return;

            const subs = await fetchFacultySubjects(resolvedFacultyId, parseInt(formData.year));
            setAvailableSubjects(subs);

            if (!isInitialized && subs.length > 0) {
                const selected = selectedSubjectId
                    ? subs.find(s => s.id === Number(selectedSubjectId))
                    : subs[0];

                if (selected) {
                    setFormData(prev => ({ ...prev, subject: selected.id.toString() }));
                }
            }
        };
        loadSubjects();
    }, [formData.year, resolvedFacultyId]); // ✅ was depending on fId (null on admin)

    // ✅ Sections load correctly using resolvedFacultyId
    useEffect(() => {
        const loadSections = async () => {
            const yearId = parseInt(formData.year);
            const subjectId = parseInt(formData.subject);

            if (!resolvedFacultyId || isNaN(yearId) || isNaN(subjectId)) {
                setAvailableSections([]);
                return;
            }

            try {
                const sections = await fetchFacultySections(resolvedFacultyId, yearId, subjectId);
                setAvailableSections(sections);

                if (!isInitialized && sections.length > 0) {
                    const firstSectionId =
                        sections[0].college_sections?.collegeSectionsId.toString() ?? "";

                    setFormData(prev => ({ ...prev, section: firstSectionId }));
                    setIsInitialized(true); // ✅ lock auto-select after first full load
                }
            } catch (err) {
                console.error("Failed to load sections", err);
            }
        };
        loadSections();
    }, [formData.year, formData.subject, resolvedFacultyId]); // ✅ was depending on fId

    // ✅ Bug 1 fixed: use resolvedCollegeId
    useEffect(() => {
        const getFaculties = async () => {
            if (!resolvedCollegeId) return;
            setIsLoading(true);
            try {
                const { data } = await fetchFilteredFaculties({ collegeId: resolvedCollegeId });
                setAllFaculties(data.map((f: any) => ({ ...f, id: Number(f.id) })));
            } catch (error) {
                console.error("Failed to load mentors", error);
            } finally {
                setTimeout(() => setIsLoading(false), 100);
            }
        };
        getFaculties();
    }, [resolvedCollegeId]); // ✅ was depending on null collegeId

    // ✅ Bug 1 fixed: use resolvedCollegeId
    useEffect(() => {
        const getStudents = async () => {
            const yearId = parseInt(formData.year);
            const sectionId = parseInt(formData.section);

            if (!resolvedCollegeId || isNaN(yearId) || isNaN(sectionId)) {
                setAllStudents([]);
                return;
            }

            setIsStudentLoading(true);
            try {
                const data = await fetchStudentsWithProfile(Number(resolvedCollegeId), {
                    yearId,
                    sectionId,
                });
                setAllStudents(data);
            } catch (error) {
                console.error("Failed to load students:", error);
            } finally {
                setTimeout(() => setIsStudentLoading(false), 150);
            }
        };
        getStudents();
    }, [resolvedCollegeId, formData.year, formData.section]); // ✅ was depending on null collegeId

    const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles?.length > 0) {
            const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'zip'];
            const validFiles = Array.from(droppedFiles).filter(file =>
                allowedExtensions.includes(file.name.split('.').pop()?.toLowerCase() || '')
            );
            if (validFiles.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    files: [...prev.files, ...validFiles],
                    fileUrls: [...prev.fileUrls, ...validFiles.map(f => f.name)],
                }));
            } else {
                alert("Invalid file type. Please upload PDF, JPG, PNG, or ZIP.");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files?.length) {
            const newFiles = Array.from(files);
            setFormData(prev => ({
                ...prev,
                files: [...prev.files, ...newFiles],
                fileUrls: [...prev.fileUrls, ...newFiles.map(f => f.name)],
            }));
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== indexToRemove),
            fileUrls: prev.fileUrls.filter((_, i) => i !== indexToRemove),
        }));
    };

    const handleAddDomain = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && domainInput.trim()) {
            e.preventDefault();
            if (!formData.domain.includes(domainInput.trim())) {
                handleChange("domain", [...formData.domain, domainInput.trim()]);
            }
            setDomainInput("");
        }
    };

    const removeDomain = (domainToRemove: string) => {
        handleChange("domain", formData.domain.filter(d => d !== domainToRemove));
    };

    const handleSaveProject = async () => {
        if (!formData.title.trim()) { toast.error("Project title is required."); return; }
        if (formData.domain.length === 0) { toast.error("Please add at least one domain."); return; }
        if (!formData.description.trim()) { toast.error("Project description is required."); return; }
        if (formData.studentIds.length === 0) { toast.error("Please assign at least one team member."); return; }
        if (formData.mentorIds.length === 0) { toast.error("Please assign at least one mentor."); return; }
        if (formData.marks === "" || Number(formData.marks) <= 0) { toast.error("Please enter valid marks."); return; }
        if (!formData.startDate) { toast.error("Please select a start date."); return; }
        if (!formData.endDate) { toast.error("Please select an end date."); return; }
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            toast.error("End date must be after start date."); return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Creating project...");

        try {
            const projectResult = await saveProject({
                title: formData.title,
                description: formData.description,
                domain: formData.domain,
                marks: formData.marks === "" ? 0 : Number(formData.marks),
                startDate: formData.startDate,
                endDate: formData.endDate,
                collegeId: resolvedCollegeId!,       // ✅ Bug 1 fixed
                facultyId: resolvedFacultyId!,        // ✅ Bug 1 fixed
                adminId: isAdmin ? adminId : null,
            });

            if (!projectResult.success || !projectResult.projectId) {
                throw new Error("Failed to create project");
            }

            const newId = projectResult.projectId;
            const uploadedUrls: string[] = [];

            for (const file of formData.files) {
                const result = await uploadProjectFile(newId, file);
                if (result.success) uploadedUrls.push(result.publicUrl);
                else console.warn("File upload failed for:", file.name);
            }

            const [teamRes, mentorRes, fileRes] = await Promise.all([
                addStudentsToProject(newId, formData.studentIds),
                addMentorsToProject(newId, formData.mentorIds),
                addProjectFiles(newId, uploadedUrls),
            ]);

            if (teamRes.success && mentorRes.success && fileRes.success) {
                toast.success("Project and all details saved!", { id: loadingToast });
                
                if (isAdmin) {
                    onCancel(); // closes form, returns to AdminProjectsList
                } else {
                    router.push("/faculty/projects");
                }
            } else {
                toast.error("Project saved, but some team/mentor data failed.", { id: loadingToast });
            }
        } catch (error) {
            console.error("Master Save Error:", error);
            toast.error("Something went wrong during save.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-4 min-h-screen">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-1">
                        <FaAngleLeft className="text-black active:scale-90 cursor-pointer" size={22} onClick={onCancel} />
                        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
                    </div>
                    <p className="text-[#282828] text-sm lg:ml-1.5">
                        Create, manage, and track student projects effortlessly.
                    </p>
                </div>

                {/* ✅ Bug 4 fixed: show badge for both admin and faculty */}
                {(role === "Faculty" || isAdmin) && (
                    <div className="bg-[#43C17A] text-white px-2 py-1 w-fit rounded text-sm font-medium">
                        {faculty_edu_type} {college_branch} - {collegeAcademicYear}
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto mb-4 flex justify-start items-center gap-6">
                <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-[#282828]">Year:</label>
                    <select
                        value={formData.year}
                        onChange={(e) => handleChange("year", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white focus:outline-green-600 text-[#282828] cursor-pointer"
                    >
                        {availableYears.map((y) => (
                            <option key={y.id} value={y.id}>{y.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-[#282828]">Subject:</label>
                    <select
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white focus:outline-green-600 text-[#282828] cursor-pointer min-w-[150px]"
                        disabled={availableSubjects.length === 0}
                    >
                        {availableSubjects.length === 0 ? (
                            <option value="">No subjects found</option>
                        ) : (
                            <>
                                <option value="">Select a Subject</option>
                                {Array.from(new Map(availableSubjects.map(sub => [sub.id, sub])).values()).map((sub) => (
                                    <option key={sub.id} value={sub.id.toString()}>{sub.label}</option>
                                ))}
                            </>
                        )}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-[#282828]">Section:</label>
                    <select
                        value={formData.section}
                        onChange={(e) => handleChange("section", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white focus:outline-green-600 text-[#282828] cursor-pointer min-w-[120px]"
                        disabled={availableSections.length === 0}
                    >
                        {availableSections.length === 0 ? (
                            <option value="">No sections</option>
                        ) : (
                            <>
                                <option value="">Select Section</option>
                                {availableSections.map((sec) => (
                                    <option
                                        key={sec.facultySectionId}
                                        value={sec.college_sections?.collegeSectionsId.toString()}
                                    >
                                        {sec.college_sections?.collegeSections}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 max-w-5xl mx-auto">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold mb-2 text-[#282828]">Project Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleChange("title", val.charAt(0).toUpperCase() + val.slice(1));
                            }}
                            placeholder="Smart Attendance System using Face Recog.."
                            className="w-full border rounded-md px-2 py-1.5 focus:outline-green-600 text-base text-[#282828]"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-semibold mb-2 text-[#282828]">Domain(s) <span className="text-red-500">*</span></label>
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                value={domainInput}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setDomainInput(val.charAt(0).toUpperCase() + val.slice(1));
                                }}
                                onKeyDown={handleAddDomain}
                                placeholder="Type domain and press Enter (e.g. AI, Fintech)"
                                className="w-full border rounded-md px-2 py-1.5 focus:outline-green-600 bg-white text-[#282828]"
                            />
                            <div className="flex flex-wrap gap-2 min-h-[32px]">
                                {formData.domain.map((dom) => (
                                    <span key={dom} className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium border border-green-200">
                                        {dom}
                                        <button type="button" onClick={() => removeDomain(dom)} className="hover:text-red-500 font-bold ml-1 cursor-pointer">×</button>
                                    </span>
                                ))}
                                {formData.domain.length === 0 && (
                                    <span className="text-gray-400 text-xs italic">No domains added yet...</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold mb-2 text-[#282828]">Description <span className="text-red-500">*</span></label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleChange("description", val.charAt(0).toUpperCase() + val.slice(1));
                            }}
                            placeholder="Develop a system that automates student attendance using facial recognition."
                            className="w-full border rounded-md px-2 py-2 focus:outline-green-600 resize-none text-[#282828]"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-semibold mb-2 text-[#282828]">Team Members <span className="text-red-500">*</span></label>
                        <div className="border rounded-md p-2 flex items-center justify-between border-[#282828] min-h-[46px]">
                            <div className="flex items-center gap-2 overflow-x-auto">
                                {formData.studentIds.length > 0 ? (
                                    <div className="flex -space-x-2">
                                        {formData.studentIds.map((id) => (
                                            <div key={id} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                S{id}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-xs ml-1">No members added</span>
                                )}
                            </div>
                            <button
                                type="button"
                                className="w-8 h-8 rounded-full border border-dashed border-green-500 flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors ml-2 flex-shrink-0 cursor-pointer"
                                onClick={() => setIsStudentModalOpen(true)}
                            >
                                <FaPlus size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-semibold mb-2 text-[#282828]">Mentor / Guide <span className="text-red-500">*</span></label>
                        <div className="flex flex-col gap-2">
                            <div className="border rounded-md p-2 flex items-center justify-between border-[#282828] min-h-[46px] bg-white">
                                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                                    {formData.mentorIds.length > 0 ? (
                                        formData.mentorIds.map((mId) => {
                                            const mentor = allFaculties.find(f => Number(f.id) === mId);
                                            return (
                                                <div key={mId} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 whitespace-nowrap">
                                                    <span className="text-xs font-semibold">{mentor?.name || `ID: ${mId}`}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleChange("mentorIds", formData.mentorIds.filter((id) => id !== mId))}
                                                        className="hover:text-red-500 font-bold leading-none cursor-pointer"
                                                    >×</button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <span className="text-gray-400 text-xs ml-1">No mentors selected</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMentorModalOpen(true)}
                                    className="w-8 h-8 rounded-full border border-dashed border-green-500 flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors flex-shrink-0 ml-2 cursor-pointer"
                                >
                                    <FaPlus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-semibold mb-2 text-[#282828]">Marks <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            value={formData.marks}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleChange("marks", val === "" ? "" : Number(val));
                            }}
                            onWheel={(e) => e.currentTarget.blur()}
                            placeholder="Enter marks"
                            className="w-full border rounded-md px-2 py-1.5 text-[#282828] focus:outline-green-600"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-semibold mb-2 text-[#282828]">Duration (From) <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange("startDate", e.target.value)}
                            className="w-full border rounded-md px-2 py-1.5 text-[#282828] focus:outline-green-600"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-semibold mb-2 text-[#282828]">To <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange("endDate", e.target.value)}
                            className="w-full border rounded-md px-2 py-1.5 text-[#282828] focus:outline-green-600"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold mb-2 text-[#282828]">Upload Your File</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            accept=".pdf, .jpg, .jpeg, .png, .zip"
                            className="hidden"
                        />
                        <div
                            className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"}`}
                            onDragEnter={(e) => { handleDrag(e); setIsDragging(true); }}
                            onDragOver={(e) => { handleDrag(e); setIsDragging(true); }}
                            onDragLeave={(e) => { handleDrop(e); setIsDragging(false); }}
                            onDrop={(e) => { handleDrop(e); setIsDragging(false); }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FaCloudUploadAlt className={`text-4xl mb-2 ${isDragging ? "text-green-500" : "text-gray-300"}`} />
                            <p className="text-gray-500 mb-4 text-center">
                                {isDragging ? "Drop to upload!" : formData.fileUrls.length > 0
                                    ? `You've selected ${formData.fileUrls.length} file(s)`
                                    : "Drag & Drop Your File here or"}
                            </p>
                            <button type="button" className="border px-6 py-2 rounded bg-white font-medium hover:bg-gray-50 cursor-pointer text-[#282828]">
                                Browse Files
                            </button>
                        </div>

                        {formData.fileUrls.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {formData.fileUrls.map((name, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 text-gray-500 text-xs font-bold uppercase">
                                                {name.split('.').pop()?.substring(0, 3) || "FILE"}
                                            </div>
                                            <span className="text-sm text-[#282828] truncate font-medium">{name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer lg:ml-1"
                                        >
                                            <FaTimes size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={handleSaveProject}
                        className="flex-1 bg-[#43C17A] text-white py-3 rounded-md font-semibold transition-colors cursor-pointer"
                        disabled={loading}
                    >
                        {loading ? "Saving.." : "Save"}
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-md font-semibold hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* ✅ Bug 1 fixed: use resolvedCollegeId in isLoading checks */}
            <SelectionModal
                isOpen={isMentorModalOpen}
                onClose={() => setIsMentorModalOpen(false)}
                isLoading={isLoading || !resolvedCollegeId}
                title="Assign Mentors"
                items={allFaculties.map(f => ({ id: Number(f.id), name: f.name, image: f.image }))}
                selectedIds={formData.mentorIds}
                onSelectionChange={(ids) => handleChange("mentorIds", ids)}
            />
            <SelectionModal
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                isLoading={isStudentLoading || !resolvedCollegeId}
                title="Assign Team Members"
                items={allStudents}
                selectedIds={formData.studentIds}
                onSelectionChange={(ids) => handleChange("studentIds", ids)}
            />
        </main>
    );
};

export default AddProjectForm;