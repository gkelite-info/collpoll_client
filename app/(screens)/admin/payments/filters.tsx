'use client'
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { fetchAcademicYears, fetchBranches, fetchSections } from "@/lib/helpers/admin/academics/academicDropdowns";
import { useEffect, useState } from "react";

export default function Filters() {
    const { loading, collegeId, collegeEducationId } = useAdmin();

    const [branches, setBranches] = useState<any[]>([]);
    const [branchLoading, setBranchLoading] = useState(true);
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [yearLoading, setYearLoading] = useState(false);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [sectionLoading, setSectionLoading] = useState(false);


    useEffect(() => {
        if (loading) return;

        if (!collegeId || !collegeEducationId) {
            setBranchLoading(false);
            return;
        }

        const loadBranches = async () => {
            try {
                const data = await fetchBranches(collegeId, collegeEducationId);
                setBranches(data);
            } catch (err) {
                console.error("Failed to fetch branches", err);
            } finally {
                setBranchLoading(false);
            }
        };
        loadBranches();
    }, [loading, collegeId, collegeEducationId]);

    useEffect(() => {
        if (!collegeId || !collegeEducationId || !selectedBranchId) {
            setAcademicYears([]);
            return;
        }

        const loadAcademicYears = async () => {
            setYearLoading(true);
            try {
                const data = await fetchAcademicYears(
                    collegeId,
                    collegeEducationId,
                    selectedBranchId
                );
                setAcademicYears(data);
            } catch (err) {
                console.error("Failed to fetch academic years", err);
            } finally {
                setYearLoading(false);
            }
        };

        loadAcademicYears();
    }, [collegeId, collegeEducationId, selectedBranchId]);

    useEffect(() => {
        if (
            !collegeId ||
            !collegeEducationId ||
            !selectedBranchId ||
            !selectedAcademicYearId
        ) {
            setSections([]);
            return;
        }

        const loadSections = async () => {
            setSectionLoading(true);
            try {
                const data = await fetchSections(
                    collegeId,
                    collegeEducationId,
                    selectedBranchId,
                    selectedAcademicYearId
                );
                setSections(data);
            } catch (err) {
                console.error("Failed to fetch sections", err);
            } finally {
                setSectionLoading(false);
            }
        };

        loadSections();
    }, [
        collegeId,
        collegeEducationId,
        selectedBranchId,
        selectedAcademicYearId,
    ]);

    return (
        <>
            <div className="bg-pink-00 flex items-center justify-start gap-10">
                <div className="flex items-center gap-2">
                    <label htmlFor=""
                        className="text-[#525252]"
                    >Branch :</label>
                    {branchLoading ? (
                        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
                    ) : (
                        <select
                            className="border px-1 rounded-md text-[#282828] border-[#D7D7D7] focus:outline-none"
                            value={selectedBranchId ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedBranchId(value ? Number(value) : null);
                            }}
                        >
                            <option value="">Select</option>
                            {branches.map((branch) => (
                                <option
                                    key={branch.collegeBranchId}
                                    value={branch.collegeBranchId}
                                >
                                    {branch.collegeBranchCode}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor=""
                        className="text-[#525252]"
                    >Year :</label>
                    {yearLoading ? (
                        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
                    ) : (
                        <select
                            className="focus:outline-none border border-[#D7D7D7] px-1 text-[#282828] rounded-md"
                            disabled={!selectedBranchId}
                            value={selectedAcademicYearId ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedAcademicYearId(value ? Number(value) : null);
                            }}
                        >
                            <option value="">Select</option>
                            {academicYears.map((year) => (
                                <option
                                    key={year.collegeAcademicYearId}
                                    value={year.collegeAcademicYearId}
                                >
                                    {year.collegeAcademicYear}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor=""
                        className="text-[#525252]"
                    >Section :</label>
                    {sectionLoading ? (
                        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
                    ) : (
                        <select
                            className="focus:outline-none border border-[#D7D7D7] px-1 text-[#282828] rounded-md"
                            disabled={!selectedAcademicYearId}
                        >
                            <option value="">Select</option>
                            {sections.map((section) => (
                                <option
                                    key={section.collegeSectionsId}
                                    value={section.collegeSectionsId}
                                >
                                    {section.collegeSections}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
        </>
    )
}