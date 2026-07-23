"use client";
import { FacultySectionRow, fetchFacultySections } from "@/lib/helpers/faculty/facultysectionsAPI";
import { getFacultySubjects } from "@/lib/helpers/faculty/getFacultySubjects";
import { fetchExistingFacultyWeightageConfig, fetchFacultyWeightageConfigs, saveFacultyWeightageConfig } from "@/lib/helpers/subjectWeightage/weightageConfig";
import { fetchFacultyWeightageItems, saveFacultyWeightageItem } from "@/lib/helpers/subjectWeightage/weightageItems";
import { CardProps } from "@/lib/types/faculty";
import { useState, useMemo, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { FaPlusCircle } from "react-icons/fa";
import { FaTrash, FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";
import { FaChevronDown } from "react-icons/fa6";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

function CustomSelect({ value, onChange, options, placeholder, disabled = false }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt: any) => opt.value === value);

    return (
        <div ref={containerRef} className={`relative w-full ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full p-3 bg-white text-[#282828] border transition-all flex justify-between items-center h-[52px] select-none ${
                    isOpen ? "rounded-lg ring-1 ring-[#43C17A] border-[#43C17A]" : "rounded-lg border-gray-200 hover:border-[#43C17A]"
                }`}
            >
                <span className={`truncate ${selectedOption ? "text-[#282828]" : "text-gray-400"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#43C17A]" : ""}`} />
            </div>
            
            {isOpen && !disabled && (
                <div className="absolute z-[100] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar left-0 top-full animate-in fade-in slide-in-from-top-1 duration-150">
                    {options.length === 0 ? (
                        <div className="p-3 text-gray-400 text-sm text-center italic">No options available</div>
                    ) : (
                        options.map((opt: any) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`p-3 text-sm transition-colors cursor-pointer border-b border-gray-50 last:border-b-0 ${value === opt.value ? "bg-[#e8f6ef] font-semibold text-[#43C17A]" : "text-gray-700 hover:bg-gray-50"}`}
                            >
                                {opt.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}


interface AddWeightageModalProps {
    isOpen: boolean;
    onClose: () => void;
    facultyCtx: any;
    role: string | null;
    initialSubjectId?: number;
    initialSectionId?: number;
    preselectedSubject?: any;
    cardFaculties?: any[];
}

export default function AddWeightageModal({ isOpen, onClose, facultyCtx, role, initialSubjectId, initialSectionId, preselectedSubject, cardFaculties = [], }: AddWeightageModalProps) {
    const [subjects, setSubjects] = useState<CardProps[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<CardProps | null>(null);
    const [loading, setLoading] = useState(false);
    const [facultySections, setFacultySections] = useState<FacultySectionRow[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);

    const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : null;
        setSelectedFacultyId(id);
    };

    const isSchool = isSchoolEducation(facultyCtx?.faculty_edu_type);

    const availableSections = useMemo(() => {
        if (!selectedSubject || facultySections.length === 0) {
            if (role !== "Faculty" && initialSectionId && selectedSubject) {
                return [{
                    collegeSectionsId: initialSectionId,
                    college_sections: {
                        collegeSectionsId: initialSectionId,
                        collegeSections: facultyCtx?.sectionName || (isSchool ? `Select Section` : `Section ${initialSectionId}`)
                    },
                    collegeSubjectId: selectedSubject.collegeSubjectId,
                    collegeAcademicYearId: selectedSubject.collegeAcademicYearId
                }] as unknown as FacultySectionRow[];
            }
            return [];
        }

        const filtered = facultySections.filter(
            (fs) => isSchool
                ? fs.collegeAcademicYearId === selectedSubject.collegeAcademicYearId
                : fs.collegeSubjectId === selectedSubject.collegeSubjectId
        );

        const uniqueSections = new Map<number, FacultySectionRow>();
        filtered.forEach(fs => {
            if (!uniqueSections.has(fs.collegeSectionsId)) {
                uniqueSections.set(fs.collegeSectionsId, fs);
            }
        });

        const result = Array.from(uniqueSections.values());

        if (result.length === 0 && role !== "Faculty" && initialSectionId) {
            result.push({
                collegeSectionsId: initialSectionId,
                college_sections: {
                    collegeSectionsId: initialSectionId,
                    collegeSections: facultyCtx?.sectionName || (isSchool ? `Select Section` : `Section ${initialSectionId}`)
                },
                collegeSubjectId: selectedSubject.collegeSubjectId,
                collegeAcademicYearId: selectedSubject.collegeAcademicYearId
            } as unknown as FacultySectionRow);
        }

        return result;
    }, [selectedSubject, facultySections, isSchool, role, initialSectionId]);

    useEffect(() => {
        if (!loading && subjects.length > 0) {
            const targetSub = initialSubjectId
                ? subjects.find(s => s.collegeSubjectId === initialSubjectId)
                : subjects[0];

            if (targetSub) {
                setSelectedSubject(targetSub);
            }
        }
    }, [loading, subjects, initialSubjectId]);

    useEffect(() => {
        if (availableSections.length > 0) {
            setSelectedSectionId(prev => {
                if (prev && availableSections.some(as => as.collegeSectionsId === prev)) {
                    return prev;
                }
                const targetSec = initialSectionId
                    ? availableSections.find(as => as.collegeSectionsId === initialSectionId)
                    : availableSections[0];
                return targetSec ? targetSec.collegeSectionsId : availableSections[0].collegeSectionsId;
            });
        } else {
            setSelectedSectionId(null);
        }
    }, [availableSections, initialSectionId]);

    const [activeWeights, setActiveWeights] = useState([
        { id: "attendance", label: "Attendance", value: "50%", isCustom: false },
        { id: "quiz", label: "Quiz", value: "50%", isCustom: false },
    ]);

    const [availableOptions, setAvailableOptions] = useState(["Lab", "Assignments", "Exams"]);

    useEffect(() => {
        async function loadInitialData() {
            if (!isOpen) return;

            const effectiveId = selectedFacultyId || facultyCtx?.facultyId || facultyCtx?.adminId;

            if (!effectiveId) {
                console.warn("loadInitialData aborted: No valid ID found in faculty", facultyCtx);
                return;
            }

            try {
                setLoading(true);

                const [subjectsData, sectionsData] = await Promise.all([
                    getFacultySubjects({
                        collegeId: Number(facultyCtx.collegeId),
                        collegeEducationId: Number(facultyCtx.collegeEducationId),
                        collegeBranchId: Number(facultyCtx.collegeBranchId),
                        academicYearIds: facultyCtx.academicYearIds || [],
                        subjectIds: preselectedSubject?.subjectId
                            ? [Number(preselectedSubject.subjectId)]
                            : (facultyCtx.subjectIds || []),
                        sectionIds: facultyCtx.sectionIds || [],
                    }),
                    fetchFacultySections(effectiveId)
                ]);

                setSubjects(subjectsData);
                setFacultySections(sectionsData);

                if (preselectedSubject) {
                    const matched = subjectsData.find(
                        s => s.collegeSubjectId === preselectedSubject.subjectId
                    );
                    setSelectedSubject(matched || subjectsData[0]);
                } else {
                    const preselected = initialSubjectId
                        ? subjectsData.find(s => s.collegeSubjectId === initialSubjectId)
                        : subjectsData[0];
                    setSelectedSubject(preselected || subjectsData[0]);
                }

                if (initialSectionId) {
                    setSelectedSectionId(initialSectionId);
                }
            } catch (err) {
                toast.error("Failed to load");
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, [isOpen, facultyCtx, preselectedSubject, selectedFacultyId, initialSubjectId, initialSectionId]);

    useEffect(() => {
        async function updateSections() {
            const targetFacultyId = selectedFacultyId || facultyCtx?.facultyId || facultyCtx?.adminId;
            const targetSubjectId = selectedSubject?.collegeSubjectId;

            if (targetFacultyId && targetSubjectId) {
                try {
                    const sectionsData = await fetchFacultySections(targetFacultyId, isSchool ? undefined : targetSubjectId);
                    setFacultySections(sectionsData);
                } catch (err) {
                    toast.error("Failed to refresh sections");
                }
            }
        }

        updateSections();
    }, [selectedFacultyId, selectedSubject?.collegeSubjectId, facultyCtx, isSchool]);


    useEffect(() => {
        async function loadExistingWeightages() {
            if (!isOpen || !selectedSubject || !selectedSectionId) return;

            try {
                const configs = await fetchFacultyWeightageConfigs(
                    selectedSubject.collegeSubjectId,
                    selectedSectionId,
                    selectedSubject.collegeSemesterId
                );

                if (configs && configs.length > 0) {
                    const configId = configs[0].facultyWeightageConfigId;

                    const items = await fetchFacultyWeightageItems(configId);

                    if (items.length > 0) {
                        const mappedWeights = items.map(item => ({
                            id: item.facultyWeightageItemId.toString(),
                            facultyWeightageItemId: item.facultyWeightageItemId,
                            label: item.label,
                            value: `${item.percentage}%`,
                            isCustom: item.isCustom
                        }));

                        setActiveWeights(mappedWeights);

                        const usedLabels = items.map(i => i.label);
                        const defaultOptions = ["Lab", "Assignments", "Exams"];
                        setAvailableOptions(defaultOptions.filter(opt => !usedLabels.includes(opt)));
                        return;
                    }
                }

                resetToDefaultWeights();

            } catch (err) {
                toast.error("Failed to load weightages");
            }
        }

        loadExistingWeightages();
    }, [selectedSubject, selectedSectionId, isOpen]);


    const resetToDefaultWeights = () => {
        setActiveWeights([
            { id: "attendance", label: "Attendance", value: "50%", isCustom: false },
            { id: "quiz", label: "Quiz", value: "50%", isCustom: false },
        ]);
        setAvailableOptions(["Lab", "Assignments", "Exams"]);
    };

    const totalPercentage = useMemo(() => {
        return activeWeights.reduce((sum, item) => {
            const num = parseFloat(item.value.replace("%", "")) || 0;
            return sum + num;
        }, 0);
    }, [activeWeights]);

    const isTotalValid = totalPercentage === 100;

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sub = subjects.find(s => s.collegeSubjectId === Number(e.target.value));
        if (sub) setSelectedSubject(sub);
    };

    const handleAddItem = (item: string) => {
        setActiveWeights([...activeWeights, { id: item.toLowerCase(), label: item, value: "", isCustom: false }]);
        setAvailableOptions(availableOptions.filter(opt => opt !== item));
    };

    const handleAddOther = () => {
        setActiveWeights([...activeWeights, { id: "other-" + Math.random(), label: "", value: "", isCustom: true }]);
    };

    const handleRemoveItem = (id: string, label: string, isCustom: boolean) => {
        setActiveWeights(activeWeights.filter(item => item.id !== id));
        if (!isCustom) setAvailableOptions((prev) => [...prev, label].sort());
    };

    const handleValueChange = (id: string, newValue: string) => {
        setActiveWeights(prev => prev.map(item => {
            if (item.id === id) {
                const numericValue = newValue.replace(/[^0-9.]/g, "");
                return { ...item, value: numericValue ? `${numericValue}%` : "" };
            }
            return item;
        }));
    };

    useEffect(() => {
        if (!isOpen) {
            setFacultySections([]);
            setSelectedSectionId(null);
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!isTotalValid || !selectedSubject || !selectedSectionId) return;

        setLoading(true);
        try {

            const targetFacultyId = selectedFacultyId || facultyCtx?.facultyId || facultyCtx?.adminId;

            if (!targetFacultyId) {
                toast.error("No Faculty ID found. Cannot save.");
                return;
            }

            const existingConfig = await fetchExistingFacultyWeightageConfig(
                selectedSubject.collegeSubjectId,
                selectedSectionId,
                selectedSubject.collegeSemesterId
            );

            const configId = existingConfig?.data?.facultyWeightageConfigId;

            const configResponse = await saveFacultyWeightageConfig({
                facultyWeightageConfigId: configId,
                collegeId: facultyCtx.collegeId,
                collegeEducationId: facultyCtx.collegeEducationId,
                collegeBranchId: selectedSubject?.collegeBranchId ?? facultyCtx?.collegeBranchId ?? null,
                collegeSubjectId: selectedSubject.collegeSubjectId,
                collegeSectionsId: selectedSectionId,
                collegeSemesterId: selectedSubject.collegeSemesterId ?? null,
                totalPercentage: totalPercentage,
            }, {
                facultyId: selectedFacultyId || facultyCtx?.facultyId,
                adminId: facultyCtx?.adminId
            });

            if (!configResponse.success) {
                console.error("Config save error:", configResponse.error);
                throw new Error("Config Save Failed");
            }
            const targetConfigId = configResponse.facultyWeightageConfigId;

            const itemPromises = activeWeights.map((item: any) => {
                return saveFacultyWeightageItem({
                    facultyWeightageItemId: item.facultyWeightageItemId,
                    facultyWeightageConfigId: targetConfigId!,
                    label: item.label,
                    percentage: parseFloat(item.value.replace("%", "")),
                    isCustom: item.isCustom
                });
            });

            const results = await Promise.all(itemPromises);
            const errorResult = results.find(res => !res.success);

            if (errorResult) {
                console.error("Item save error:", errorResult.error);
                throw new Error("Failed to save some weightage items");
            }

            toast.success("Saved successfully!");
            onClose();
        } catch (error: any) {
            console.error("handleSave Error:", error);
            toast.error("Failed to update weightage.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-lg w-full max-w-2xl h-[90%] p-10 shadow-2xl mx-6 flex flex-col">
                <header className="flex justify-between items-center mb-8 shrink-0">
                    <h2 className="text-lg lg:text-2xl font-bold text-[#282828]">Add Weightage</h2>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${isTotalValid ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {isTotalValid ? <FaCircleCheck /> : <FaCircleExclamation />}
                        Total: {totalPercentage}%
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">


                        {/* <div className="col-span-2">
                            <label className="block text-base font-semibold text-[#282828] mb-2.5">Subject Name</label>
                            <div className="relative">
                                <select
                                    onChange={handleSubjectChange}
                                    value={selectedSubject?.collegeSubjectId || ""}
                                    className="w-full p-3 bg-white text-[#282828] border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#43C17A] lg:ml-[2px] cursor-pointer"
                                >
                                    {loading ? <option>Loading subjects...</option> :
                                        subjects.map(s => (
                                            <option key={s.collegeSubjectId} value={s.collegeSubjectId}>{s.subjectTitle}</option>
                                        ))}
                                </select>
                                <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div> */}

                        <div className={role === "Faculty" ? "col-span-2" : "col-span-1"}>
                            <label className="block text-base font-semibold text-[#282828] mb-2.5">Subject</label>
                            <CustomSelect
                                value={selectedSubject?.collegeSubjectId || ""}
                                onChange={(val: number) => {
                                    const sub = subjects.find(s => s.collegeSubjectId === val);
                                    if (sub) setSelectedSubject(sub);
                                }}
                                options={loading ? [] : subjects.map(s => ({ value: s.collegeSubjectId, label: s.subjectTitle }))}
                                placeholder={loading ? "Loading subjects..." : "Select Subject"}
                            />
                        </div>

                        {role !== "Faculty" && (
                            <div className="col-span-1">
                                <label className="block text-base font-semibold text-[#282828] mb-2.5">
                                    Select Faculty
                                </label>
                                <CustomSelect
                                    value={selectedFacultyId || ""}
                                    onChange={(val: number) => setSelectedFacultyId(val)}
                                    options={Array.from(new Map(cardFaculties.map(f => [f.facultyId, f])).values()).map(f => ({
                                        value: f.facultyId,
                                        label: f.fullName
                                    }))}
                                    placeholder="Select Faculty"
                                />
                            </div>
                        )}

                        {!isSchool && (
                            <div>
                                <label className="block text-base font-semibold text-[#282828] mb-2.5">
                                    {facultyCtx?.faculty_edu_type === "Inter" ? "Group" : "Branch"}
                                </label>
                                <div className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium">
                                    {selectedSubject?.branchCode || "---"}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-base font-semibold text-[#282828] mb-2.5">Year</label>
                            <div className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium">
                                {selectedSubject?.year || "---"}
                            </div>
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-[#282828] mb-2.5">Section <span className="text-red-500">*</span></label>
                            <CustomSelect
                                value={selectedSectionId || ""}
                                onChange={(val: number) => setSelectedSectionId(val)}
                                options={availableSections.map(fs => ({
                                    value: fs.collegeSectionsId,
                                    label: fs.college_sections?.collegeSections 
                                        ? (fs.college_sections.collegeSections.match(/^\d+$/) && !isSchool ? `Section ${fs.college_sections.collegeSections}` : fs.college_sections.collegeSections)
                                        : (isSchool ? 'Select Section' : `Section ${fs.collegeSectionsId}`)
                                }))}
                                placeholder="Select Section"
                                disabled={availableSections.length === 0}
                            />
                        </div>

                        {!isSchool && (
                            <div>
                                <label className="block text-base font-semibold text-[#282828] mb-2.5">Semester</label>
                                <div className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium">
                                    {selectedSubject?.semester || "---"}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-[#282828] mb-4">Weightage Distribution</label>
                        <div className="bg-[#E9F5EF] rounded-lg p-8 flex flex-col md:flex-row gap-8 items-start">
                            <div className="bg-white p-6 rounded-xl flex-1 shadow-sm border border-[#DCEAE2] w-full min-h-[250px]">
                                <h4 className="font-bold text-[#282828] text-sm mb-5">Add Weightage</h4>
                                <div className="space-y-4">
                                    {activeWeights.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            {item.isCustom ? (
                                                <input
                                                    type="text"
                                                    placeholder="Label..."
                                                    value={item.label}
                                                    className="flex-1 border-b border-gray-200 p-1 text-sm focus:border-[#43C17A] outline-none text-[#282828]"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setActiveWeights(prev => prev.map(aw =>
                                                            aw.id === item.id ? { ...aw, label: val } : aw
                                                        ));
                                                    }}
                                                />
                                            ) : (
                                                <span className="flex-1 text-[#525252] font-medium text-sm">{item.label} :</span>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text" value={item.value}
                                                    onChange={(e) => handleValueChange(item.id, e.target.value)}
                                                    placeholder="0%" className={`w-20 border rounded-lg p-2 text-center text-sm outline-none font-semibold ${isTotalValid ? 'border-green-200 text-[#43C17A]' : 'border-gray-200 text-red-400'}`}
                                                />
                                                <button onClick={() => handleRemoveItem(item.id, item.label, item.isCustom)} className="p-1.5 hover:bg-red-50 rounded-lg  cursor-pointer">
                                                    <FaTrash className="text-red-400 text-xs" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                                {availableOptions.map((opt) => (
                                    <button key={opt} onClick={() => handleAddItem(opt)} className="bg-white px-4 py-3 rounded-lg flex items-center cursor-pointer gap-3 border border-transparent hover:border-[#43C17A] hover:shadow-md transition-all">
                                        <FaPlusCircle className="text-[#43C17A] text-lg" />
                                        <span className="text-sm font-semibold text-[#525252]">{opt}</span>
                                    </button>
                                ))}
                                <button onClick={handleAddOther} className="bg-white px-4 py-3 rounded-xl cursor-pointer flex items-center gap-3 border border-dashed border-gray-300 hover:border-[#43C17A]">
                                    <FaPlusCircle className="text-[#43C17A] text-lg" />
                                    <span className="text-sm font-semibold text-[#525252]">Others</span>
                                </button>
                            </div>
                        </div>
                        {!isTotalValid && (
                            <p className="text-xs text-red-500 mt-3 font-medium flex items-center gap-1">
                                <FaCircleExclamation /> Weightage must equal exactly 100% to save. (Currently {totalPercentage}%)
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-5 mt-8 shrink-0">
                    <button onClick={onClose} className="flex-1 py-4 border border-gray-200 rounded-lg font-bold text-[#525252] hover:bg-gray-50 cursor-pointer">
                        Cancel
                    </button>
                    <button
                        className={`flex-1 py-4 text-white rounded-lg font-bold transition-all ${isTotalValid ? 'bg-[#43C17A] shadow-lg shadow-green-100' : 'bg-gray-300 cursor-not-allowed'} cursor-pointer`}
                        onClick={handleSave}
                        disabled={!isTotalValid}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}