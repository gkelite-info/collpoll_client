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
import { saveFinanceCalendarEvent } from "@/lib/helpers/finance/calendar/financeCalendarAPI";
import {
  saveFinanceCalendarSection,
  fetchFinanceCalendarSections,
} from "@/lib/helpers/finance/calendar/financeCalendarSectionsAPI";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
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
type Semester = { collegeSemesterId: number; collegeSemester: number };
type Section = { collegeSectionsId: number; collegeSections: string };

const INPUT =
  "w-full py-2 border border-[#C9C9C9] rounded-lg px-3 text-sm bg-white text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all";

export default function AddEventModal({
  isOpen,
  onClose,
  editData,
}: AddEventModalProps) {
  const [eventTitle, setEventTitle] = useState("");
  const [eventTopic, setEventTopic] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [fromHour, setFromHour] = useState("08");
  const [fromMinute, setFromMinute] = useState("00");
  const [fromAmPm, setFromAmPm] = useState("AM");
  const [toHour, setToHour] = useState("09");
  const [toMinute, setToMinute] = useState("00");
  const [toAmPm, setToAmPm] = useState("AM");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<
    number | null
  >(null);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(
    null,
  );

  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);

  const [existingSectionsMap, setExistingSectionsMap] = useState<
    Record<number, number>
  >({});

  const { financeManagerId, collegeId, collegeEducationId } =
    useFinanceManager();

  const TextOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^A-Za-z\s]/g, "");
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    e.target.value = value;
    return value;
  };

  useEffect(() => {
    if (isOpen && editData) {
      setEventTitle(editData.title || "");
      setEventTopic(editData.rawTopic || "");
      setEventDate(editData.date || "");

      const parseTime = (timeStr: string) => {
        if (!timeStr) return { h: "08", m: "00", a: "AM" };
        let [hours, mins] = timeStr.split(":");
        let h = parseInt(hours, 10);
        let a = h >= 12 ? "PM" : "AM";
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return { h: h.toString().padStart(2, "0"), m: mins, a };
      };

      const fromP = parseTime(editData.fromTime);
      setFromHour(fromP.h);
      setFromMinute(fromP.m);
      setFromAmPm(fromP.a);

      const toP = parseTime(editData.toTime);
      setToHour(toP.h);
      setToMinute(toP.m);
      setToAmPm(toP.a);

      const fetchIds = async () => {
        try {
          const sectionsData = await fetchFinanceCalendarSections(
            editData.calendarEventId,
          );
          if (sectionsData.length > 0) {
            const first = sectionsData[0];
            setSelectedBranchId(first.collegeBranchId);
            setSelectedAcademicYearId(first.collegeAcademicYearId);
            setSelectedSemesterId(first.collegeSemesterId);
            setSelectedSectionIds(sectionsData.map((s) => s.collegeSectionsId));

            const map: Record<number, number> = {};
            sectionsData.forEach(
              (s) => (map[s.collegeSectionsId] = s.financeCalendarSectionId),
            );
            setExistingSectionsMap(map);
          }
        } catch (e) {
          console.error("Failed to load section IDs for edit", e);
        }
      };
      fetchIds();
    } else if (isOpen && !editData) {
      setEventTitle("");
      setEventTopic("");
      setEventDate("");
      setFromHour("08");
      setFromMinute("00");
      setFromAmPm("AM");
      setToHour("09");
      setToMinute("00");
      setToAmPm("AM");
      setSelectedBranchId(null);
      setSelectedAcademicYearId(null);
      setSelectedSemesterId(null);
      setSelectedSectionIds([]);
      setExistingSectionsMap({});
    }
  }, [isOpen, editData]);

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
          selectedBranchId,
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
          selectedAcademicYearId,
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
          selectedAcademicYearId,
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
  }, [collegeId, collegeEducationId, selectedBranchId, selectedAcademicYearId]);

  const toggleSectionId = (id: number) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const sectionIdToLabelMap = new Map(
    sections.map((s) => [s.collegeSectionsId, s.collegeSections]),
  );

  const selectedSectionLabels = selectedSectionIds
    .map((id) => sectionIdToLabelMap.get(id))
    .filter(Boolean) as string[];

  const handleSave = async () => {
    if (!financeManagerId || !collegeEducationId) {
      toast.error("Missing user context");
      return;
    }
    if (
      !eventTitle ||
      !eventTopic ||
      !eventDate ||
      !selectedBranchId ||
      !selectedAcademicYearId ||
      !selectedSemesterId ||
      selectedSectionIds.length === 0
    ) {
      toast.error(
        "Please fill out all fields and select at least one section.",
      );
      return;
    }

    const formatTime = (hour: string, min: string, ampm: string) => {
      let h = parseInt(hour, 10);
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:${min}:00`;
    };

    const formattedFromTime = formatTime(fromHour, fromMinute, fromAmPm);
    const formattedToTime = formatTime(toHour, toMinute, toAmPm);

    const now = new Date();
    const startDateTime = new Date(`${eventDate}T${formattedFromTime}`);
    const endDateTime = new Date(`${eventDate}T${formattedToTime}`);

    if (startDateTime < now) {
      toast.error("Cannot schedule events in the past.");
      return;
    }

    if (startDateTime >= endDateTime) {
      toast.error("End time must be after the start time.");
      return;
    }

    try {
      const eventRes = await saveFinanceCalendarEvent(
        {
          financeCalendarId: editData?.calendarEventId,
          eventTitle,
          eventTopic,
          date: eventDate,
          fromTime: formattedFromTime,
          toTime: formattedToTime,
        },
        financeManagerId,
      );

      if (!eventRes.success || !eventRes.financeCalendarId)
        throw new Error("Failed to save the core event data.");

      const sectionPromises = selectedSectionIds.map((secId) =>
        saveFinanceCalendarSection(
          {
            financeCalendarSectionId: existingSectionsMap[secId] || undefined,
            financeCalendarId: eventRes.financeCalendarId as number,
            collegeEducationId,
            collegeBranchId: selectedBranchId,
            collegeAcademicYearId: selectedAcademicYearId,
            collegeSemesterId: selectedSemesterId,
            collegeSectionsId: secId,
          },
          financeManagerId,
        ),
      );

      const sectionResults = await Promise.all(sectionPromises);
      const failedSections = sectionResults.filter((res) => !res.success);
      if (failedSections.length > 0)
        throw new Error(
          "Event saved, but failed to link one or more sections.",
        );

      toast.success(
        editData
          ? "Event updated successfully!"
          : "Event created successfully!",
      );
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save event. Please try again.",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-[480px] max-h-[90vh] rounded-xl flex flex-col">
        <div className="flex justify-between items-center p-5 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            {editData ? "Edit Event" : "Add Event"}
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
              value={eventTitle}
              onChange={(e) => setEventTitle(TextOnly(e))}
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
              value={eventTopic}
              onChange={(e) => setEventTopic(TextOnly(e))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              className={INPUT}
              value={eventDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Time</label>

            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">From</span>
                <div className="flex gap-2">
                  <select
                    className={`${INPUT} w-16 px-2`}
                    value={fromHour}
                    onChange={(e) => setFromHour(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");
                      return (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className={`${INPUT} w-16 px-2`}
                    value={fromMinute}
                    onChange={(e) => setFromMinute(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i * 5).padStart(2, "0");
                      return (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className={`${INPUT} w-16 px-2`}
                    value={fromAmPm}
                    onChange={(e) => setFromAmPm(e.target.value)}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="flex-1">
                <span className="block text-gray-500 text-xs mb-1">To</span>
                <div className="flex gap-2">
                  <select
                    className={`${INPUT} w-16 px-2`}
                    value={toHour}
                    onChange={(e) => setToHour(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");
                      return (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className={`${INPUT} w-16 px-2`}
                    value={toMinute}
                    onChange={(e) => setToMinute(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i * 5).padStart(2, "0");
                      return (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className={`${INPUT} w-16 px-2`}
                    value={toAmPm}
                    onChange={(e) => setToAmPm(e.target.value)}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
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
                  setSelectedSemesterId(null);
                  setSelectedSectionIds([]);
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
              <label className="text-sm font-medium text-gray-700">Year</label>
              <select
                className={INPUT}
                value={selectedAcademicYearId ?? ""}
                onChange={(e) => {
                  setSelectedAcademicYearId(Number(e.target.value));
                  setSemesters([]);
                  setSelectedSemesterId(null);
                  setSelectedSectionIds([]);
                }}
                disabled={!selectedBranchId}
              >
                <option value="">
                  {loadingYears ? "loading..." : "Select Academic Year"}
                </option>

                {academicYears.map((y) => (
                  <option
                    key={y.collegeAcademicYearId}
                    value={y.collegeAcademicYearId}
                  >
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
                value={selectedSemesterId ?? ""}
                onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
              >
                <option value="">
                  {loadingSemesters
                    ? "Loading..."
                    : selectedAcademicYearId
                      ? "Select Semester"
                      : "Select Academic Year first"}
                </option>
                {semesters.map((s) => (
                  <option key={s.collegeSemesterId} value={s.collegeSemesterId}>
                    Semester {s.collegeSemester}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <CustomMultiSelect
                label="Section"
                entityName="Section"
                placeholder={loadingSections ? "Loading..." : "Select Sections"}
                options={sections.map((s) => s.collegeSections)}
                selectedValues={selectedSectionLabels}
                disabled={!selectedAcademicYearId || !selectedBranchId}
                onChange={(value) => {
                  const section = sections.find(
                    (s) => s.collegeSections === value,
                  );
                  if (section) toggleSectionId(section.collegeSectionsId);
                }}
                onRemove={(value) => {
                  const section = sections.find(
                    (s) => s.collegeSections === value,
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
              handleSave();
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
