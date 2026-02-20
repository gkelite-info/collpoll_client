"use client";
import { CustomMultiSelect } from "@/app/(screens)/admin/(dashboard)/components/modal/userModalComponents";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { fetchCollegeAcademicYears } from "@/lib/helpers/admin/collegeAcademicYearAPI";
import { fetchCollegeBranches } from "@/lib/helpers/admin/collegeBranchAPI";
import { fetchCollegeSections } from "@/lib/helpers/admin/collegeSectionsAPI";
import { fetchCollegeSemesters } from "@/lib/helpers/admin/collegeSemesterAPI";
import { X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Branch = {
  collegeBranchId: number;
  collegeBranchType: string;
  collegeBranchCode: string;
};

type AcademicYear = {
  collegeAcademicYearId: number;
  collegeAcademicYear: string;
};

type Semester = {
  collegeSemesterId: number;
  collegeSemester: number;
};

type Section = {
  collegeSectionsId: number;
  collegeSections: string;
};

const INPUT =
  "w-full py-2 border border-[#C9C9C9] rounded-lg px-3 text-sm bg-white text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all";

export default function AddEventModal({ isOpen, onClose, }: AddEventModalProps) {
  if (!isOpen) return null;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);

  const TextOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^A-Za-z\s]/g, "");
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    e.target.value = value;
  };

  const { collegeId, collegeEducationId } = useFinanceManager();

  useEffect(() => {
    if (!isOpen) return;
    if (!collegeId || !collegeEducationId) return;

    const loadBranches = async () => {
      try {
        setLoadingBranches(true);
        const data = await fetchCollegeBranches(collegeId, collegeEducationId);
        setBranches(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load branches");
      } finally {
        setLoadingBranches(false);
      }
    };

    loadBranches();
  }, [isOpen, collegeId, collegeEducationId]);

  useEffect(() => {
    if (!collegeId || !selectedBranchId) return;

    const loadAcademicYears = async () => {
      try {
        setLoadingYears(true);
        const data = await fetchCollegeAcademicYears(
          collegeId,
          selectedBranchId
        );
        setAcademicYears(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load academic years");
      } finally {
        setLoadingYears(false);
      }
    };

    loadAcademicYears();
  }, [collegeId, selectedBranchId]);

  useEffect(() => {
    if (!collegeId || !collegeEducationId || !selectedAcademicYearId) return;

    const loadSemesters = async () => {
      try {
        setLoadingSemesters(true);
        const data = await fetchCollegeSemesters(
          collegeId,
          collegeEducationId,
          selectedAcademicYearId
        );
        setSemesters(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load semesters");
      } finally {
        setLoadingSemesters(false);
      }
    };

    loadSemesters();
  }, [collegeId, collegeEducationId, selectedAcademicYearId]);

  useEffect(() => {
    if (
      !collegeId ||
      !collegeEducationId ||
      !selectedBranchId ||
      !selectedAcademicYearId
    )
      return;

    const loadSections = async () => {
      try {
        setLoadingSections(true);
        const data = await fetchCollegeSections(
          collegeId,
          collegeEducationId,
          selectedBranchId,
          selectedAcademicYearId
        );
        setSections(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load sections");
      } finally {
        setLoadingSections(false);
      }
    };

    loadSections();
  }, [
    collegeId,
    collegeEducationId,
    selectedBranchId,
    selectedAcademicYearId,
  ]);

  const toggleSectionId = (id: number) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const sectionIdToLabelMap = new Map(
    sections.map((s) => [s.collegeSectionsId, s.collegeSections])
  );

  const handleSave = () => {
    console.log("Clicked save");
    toast.success("Clicked save");


  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-[480px] max-h-[90vh] rounded-xl flex flex-col">

        <div className="flex justify-between items-center p-5 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Add Event
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <div className="p-5 pt-0 space-y-2 overflow-y-auto">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Event Title
            </label>
            <input
              type="text"
              placeholder="Enter title"
              className={INPUT}
              onChange={TextOnly}
            />
          </div>

          <div className="felx flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Event Topic
            </label>
            <input
              type="text"
              placeholder="Enter topic"
              className={INPUT}
              onChange={TextOnly}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              className={INPUT}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Time
            </label>

            <div className="flex gap-4 mt-2">

              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">
                  From
                </span>
                <div className="flex gap-2">
                  <select className={`${INPUT} w-16 px-2`}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");
                      return <option key={h}>{h}</option>;
                    })}
                  </select>

                  <select className={`${INPUT} w-16 px-2`}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i * 5).padStart(2, "0");
                      return <option key={m}>{m}</option>;
                    })}
                  </select>

                  <select className={`${INPUT} w-16 px-2`}>
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">
                  To
                </span>
                <div className="flex gap-2">
                  <select className={`${INPUT} w-16 px-2`}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");
                      return <option key={h}>{h}</option>;
                    })}
                  </select>

                  <select className={`${INPUT} w-16 px-2`}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i * 5).padStart(2, "0");
                      return <option key={m}>{m}</option>;
                    })}
                  </select>

                  <select className={`${INPUT} w-16 px-2`}>
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Branch
              </label>
              <select
                className={INPUT}
                value={selectedBranchId ?? ""}
                onChange={(e) => {
                  setSelectedBranchId(Number(e.target.value));
                  setAcademicYears([]);
                }}
              >
                <option value="">Select Branch</option>

                {branches.map((b) => (
                  <option key={b.collegeBranchId} value={b.collegeBranchId}>
                    {b.collegeBranchCode}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Year
              </label>
              <select
                className={INPUT}
                value={selectedAcademicYearId ?? ""}
                onChange={(e) => {
                  setSelectedAcademicYearId(Number(e.target.value));
                  setSemesters([]);
                }}
                disabled={!selectedBranchId}
              >
                <option value="">
                  {loadingYears ? "loading..." : "Select Academic Year"}
                </option>

                {academicYears.map((y) => (
                  <option key={y.collegeAcademicYearId} value={y.collegeAcademicYearId}>
                    {y.collegeAcademicYear}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Semester
              </label>
              <select
                className={INPUT}
                disabled={!selectedAcademicYearId}
              >
                <option value="">
                  {loadingSemesters
                    ? "Loading..."
                    : selectedAcademicYearId
                      ? "Select Semester"
                      : "Select Academic Year first"}
                </option>
                {semesters.map((s) => (
                  <option
                    key={s.collegeSemesterId}
                    value={s.collegeSemesterId}
                  >
                    Semester {s.collegeSemester}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Section
              </label>
              <CustomMultiSelect
                placeholder={
                  loadingSections ? "Loading..." : "Select Sections"
                }
                options={sections.map((s) => s.collegeSections)}
                selectedValues={selectedSectionIds
                  .map((id) => sectionIdToLabelMap.get(id))
                  .filter(Boolean) as string[]}
                disabled={!selectedAcademicYearId || !selectedBranchId}
                onChange={(value) => {
                  const section = sections.find(
                    (s) => s.collegeSections === value
                  );
                  if (section) toggleSectionId(section.collegeSectionsId);
                }}

                onRemove={(value) => {
                  const section = sections.find(
                    (s) => s.collegeSections === value
                  );
                  if (section) toggleSectionId(section.collegeSectionsId);
                }}
                paddingY="p-2"
                closedBorder="border-[#C9C9C9]"
                placeholderColorActive="text-gray-900"
              />
            </div>
          </div>

          <button
            onClick={() => {
              handleSave(),
                onClose()
            }}
            className="w-full mt-4 bg-[#43C17A] cursor-pointer text-white py-3 rounded-lg font-semibold transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
