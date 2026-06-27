"use client";

import { useEffect, useMemo, useState } from "react";
import { Buildings, Clock, FloppyDisk, Plus, User, Wrench, X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { fetchInventoryAssets, type InventoryAssetRow } from "@/lib/helpers/inventory/inventoryAssetAPI";
import {
  createSportsRoomLog,
  fetchSportsRoomStudentContext,
  mapSportsRoomLogToVisitorEntry,
  updateSportsRoomLog,
} from "@/lib/helpers/visitors/sportsRoomLogsAPI";
import type { VisitorEntry } from "../types";

type EquipmentRow = {
  id: number;
  inventoryAssetId: string;
  quantity: string;
  remarks: string;
};

type SportsStudentForm = {
  identifier: string;
  fullName: string;
  studentId: string;
  collegeEducationId: string;
  collegeBranchId: string;
  collegeAcademicYearId: string;
  collegeSectionsId: string;
  educationLabel: string;
  branchLabel: string;
  yearLabel: string;
  sectionLabel: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const currentTime = () => new Date().toTimeString().slice(0, 5);

const emptyStudentForm: SportsStudentForm = {
  identifier: "",
  fullName: "",
  studentId: "",
  collegeEducationId: "",
  collegeBranchId: "",
  collegeAcademicYearId: "",
  collegeSectionsId: "",
  educationLabel: "",
  branchLabel: "",
  yearLabel: "",
  sectionLabel: "",
};

function parseCourseLabels(course: string | undefined) {
  const parts = (course ?? "")
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    branchLabel: parts[1] ?? "",
    yearLabel: parts[2] ?? "",
    sectionLabel: parts[3]?.replace(/^Sec\s+/i, "") ?? "",
  };
}

export function NewVisitorEntryModal({
  inventoryContext,
  initialEntry,
  onClose,
  onSave,
}: {
  inventoryContext?: { collegeId: number; categoryId: number };
  initialEntry?: VisitorEntry | null;
  onClose: () => void;
  onSave: (entry: VisitorEntry) => void;
}) {
  const inputClass = "mt-1 h-8 w-full rounded border border-[#DCE5EF] bg-white px-2.5 text-xs text-[#334155] outline-none focus:border-[#43C17A]";
  const labelClass = "text-xs font-bold text-[#334155]";
  const [studentForm, setStudentForm] = useState<SportsStudentForm>(emptyStudentForm);
  const [purposeOfVisit, setPurposeOfVisit] = useState("");
  const [entryDate, setEntryDate] = useState(today());
  const [entryTime, setEntryTime] = useState(currentTime());
  const [exitTime, setExitTime] = useState("");
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRow[]>([{ id: 0, inventoryAssetId: "", quantity: "1", remarks: "" }]);
  const [inventoryAssets, setInventoryAssets] = useState<InventoryAssetRow[] | null>(null);
  const [isLookingUpStudent, setIsLookingUpStudent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isEquipmentLoading = Boolean(inventoryContext && inventoryAssets === null);
  const isEditing = Boolean(initialEntry?.sportsRoomLogId);

  useEffect(() => {
    if (!initialEntry) return;
    const courseLabels = parseCourseLabels(initialEntry.course);

    setStudentForm({
      identifier: initialEntry.rollNo,
      fullName: initialEntry.student,
      studentId: initialEntry.studentId ? String(initialEntry.studentId) : "",
      collegeEducationId: initialEntry.collegeEducationId ? String(initialEntry.collegeEducationId) : "",
      collegeBranchId: initialEntry.collegeBranchId ? String(initialEntry.collegeBranchId) : "",
      collegeAcademicYearId: initialEntry.collegeAcademicYearId ? String(initialEntry.collegeAcademicYearId) : "",
      collegeSectionsId: initialEntry.collegeSectionsId ? String(initialEntry.collegeSectionsId) : "",
      educationLabel: "",
      branchLabel: courseLabels.branchLabel,
      yearLabel: courseLabels.yearLabel,
      sectionLabel: courseLabels.sectionLabel,
    });
    setPurposeOfVisit(initialEntry.purposeOfVisit ?? "");
    setEntryDate(initialEntry.entryDate ?? today());
    setEntryTime((initialEntry.entryTime ?? currentTime()).slice(0, 5));
    setExitTime(initialEntry.exitTime?.slice(0, 5) ?? "");
    setEquipmentRows(
      initialEntry.equipments?.length
        ? initialEntry.equipments.map((equipment, index) => ({
            id: equipment.sportsRoomLogEquipmentId ?? index,
            inventoryAssetId: String(equipment.inventoryAssetId),
            quantity: String(equipment.quantity),
            remarks: equipment.remarks ?? "",
          }))
        : [{ id: 0, inventoryAssetId: "", quantity: "1", remarks: "" }],
    );
  }, [initialEntry]);

  useEffect(() => {
    if (!inventoryContext) {
      return;
    }

    let active = true;
    fetchInventoryAssets(inventoryContext.collegeId, inventoryContext.categoryId)
      .then((assets) => {
        if (active) setInventoryAssets(assets);
      })
      .catch((error) => {
        if (!active) return;
        setInventoryAssets([]);
        toast.error(error instanceof Error ? error.message : "Failed to load equipment.");
      });

    return () => { active = false; };
  }, [inventoryContext]);

  const selectedEquipmentIds = useMemo(
    () => new Set(equipmentRows.map((row) => row.inventoryAssetId).filter(Boolean)),
    [equipmentRows],
  );

  const updateStudentForm = (updates: Partial<SportsStudentForm>) => {
    setStudentForm((current) => ({ ...current, ...updates }));
  };

  const clearLoadedStudentDetails = (identifier = "") => {
    setStudentForm({
      ...emptyStudentForm,
      identifier,
    });
  };

  const handleIdentifierChange = (value: string) => {
    if (!value.trim()) {
      clearLoadedStudentDetails("");
      return;
    }

    setStudentForm(() => ({
      ...emptyStudentForm,
      identifier: value,
    }));
  };

  const updateEquipmentRow = (id: number, updates: Partial<EquipmentRow>) => {
    setEquipmentRows((rows) => rows.map((row) => row.id === id ? { ...row, ...updates } : row));
  };

  const hasRequiredStudentIds = (form: SportsStudentForm) =>
    [
      form.studentId,
      form.collegeEducationId,
      form.collegeBranchId,
      form.collegeAcademicYearId,
      form.collegeSectionsId,
    ].every((value) => Number(value));

  const applyLoadedStudent = (student: Awaited<ReturnType<typeof fetchSportsRoomStudentContext>>) => {
    const nextForm = {
      identifier: student.rollNo,
      fullName: studentForm.fullName.trim() || student.fullName,
      studentId: String(student.studentId),
      collegeEducationId: String(student.collegeEducationId),
      collegeBranchId: String(student.collegeBranchId),
      collegeAcademicYearId: String(student.collegeAcademicYearId),
      collegeSectionsId: String(student.collegeSectionsId),
      educationLabel: student.collegeEducationType ?? "",
      branchLabel: studentForm.branchLabel.trim() || student.collegeBranchCode || "",
      yearLabel: studentForm.yearLabel.trim() || student.collegeAcademicYear || "",
      sectionLabel: studentForm.sectionLabel.trim() || student.collegeSections || "",
    };
    setStudentForm(nextForm);
    return nextForm;
  };

  const lookupStudent = async () => {
    if (!inventoryContext?.collegeId) {
      toast.error("College context is missing.");
      return;
    }

    try {
      setIsLookingUpStudent(true);
      const student = await fetchSportsRoomStudentContext({
        collegeId: inventoryContext.collegeId,
        identifier: studentForm.identifier,
      });
      applyLoadedStudent(student);
      toast.success("Student details loaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load student.");
    } finally {
      setIsLookingUpStudent(false);
    }
  };

  const resolveStudentFormForSave = async () => {
    if (hasRequiredStudentIds(studentForm)) {
      return studentForm;
    }

    if (!inventoryContext?.collegeId) {
      throw new Error("College context is missing.");
    }

    const identifier = studentForm.identifier.trim();
    if (!identifier) {
      throw new Error("Enter Student ID / Roll No. before saving.");
    }

    const student = await fetchSportsRoomStudentContext({
      collegeId: inventoryContext.collegeId,
      identifier,
    });

    return applyLoadedStudent(student);
  };

  const buildPayload = (form: SportsStudentForm) => {
    if (!inventoryContext?.collegeId) {
      throw new Error("College context is missing.");
    }

    const requiredIds = [
      form.studentId,
      form.collegeEducationId,
      form.collegeBranchId,
      form.collegeAcademicYearId,
      form.collegeSectionsId,
    ];

    if (!form.fullName.trim()) {
      throw new Error("Please enter full name.");
    }

    if (!form.branchLabel.trim()) {
      throw new Error("Please enter branch.");
    }

    if (!form.yearLabel.trim()) {
      throw new Error("Please enter year.");
    }

    if (!form.sectionLabel.trim()) {
      throw new Error("Please enter section.");
    }

    if (requiredIds.some((value) => !Number(value))) {
      throw new Error("Load a valid student before saving.");
    }

    if (!purposeOfVisit.trim()) {
      throw new Error("Please enter purpose of visit.");
    }

    if (!entryDate) {
      throw new Error("Please select entry date.");
    }

    if (!entryTime) {
      throw new Error("Please select entry time.");
    }

    return {
      collegeId: inventoryContext.collegeId,
      fullName: form.fullName,
      studentId: Number(form.studentId),
      collegeEducationId: Number(form.collegeEducationId),
      collegeBranchId: Number(form.collegeBranchId),
      collegeAcademicYearId: Number(form.collegeAcademicYearId),
      collegeSectionsId: Number(form.collegeSectionsId),
      purposeOfVisit,
      entryDate,
      entryTime,
      exitTime: exitTime || null,
      equipments: equipmentRows
        .filter((row) => row.inventoryAssetId && Number(row.quantity) > 0)
        .map((row) => ({
          inventoryAssetId: Number(row.inventoryAssetId),
          quantity: Number(row.quantity),
          remarks: row.remarks,
        })),
    };
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const resolvedForm = await resolveStudentFormForSave();
      const payload = buildPayload(resolvedForm);
      const savedLog = isEditing && initialEntry?.sportsRoomLogId
        ? await updateSportsRoomLog({ ...payload, sportsRoomLogId: initialEntry.sportsRoomLogId })
        : await createSportsRoomLog(payload);

      onSave(mapSportsRoomLogToVisitorEntry(savedLog));
      toast.success(isEditing ? "Entry updated." : "Entry saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save entry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/55 p-3">
      <div className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-[720px] overflow-y-auto rounded-lg bg-white shadow-2xl">
        <button type="button" onClick={onClose} title="Close" className="absolute right-4 top-4 cursor-pointer text-[#94A3B8] hover:text-[#EF4444]"><X size={15} weight="bold" /></button>
        <header className="border-b border-[#E8EEF5] px-5 py-4"><h2 className="text-base font-extrabold text-[#1F2937]">{isEditing ? "Edit Entry" : "New Entry"} - Sports Room Register</h2><p className="mt-0.5 text-xs text-[#94A3B8]">Record a visitor entry and equipment issue.</p></header>

        <div className="space-y-4 px-5 py-4">
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#334155]"><User size={16} className="text-[#16A85B]" />1. Student Information</h3>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className={labelClass}>Student ID / Roll No. <span className="text-red-500">*</span><input className={inputClass} value={studentForm.identifier} onChange={(event) => handleIdentifierChange(event.target.value)} placeholder="Enter student ID or roll no." /></label>
              <button type="button" onClick={lookupStudent} disabled={isLookingUpStudent || !inventoryContext} className="mt-5 h-8 cursor-pointer rounded bg-[#149447] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-[#94A3B8]">{isLookingUpStudent ? "Loading..." : "Load"}</button>
            </div>
            <p className="mt-2 text-xs font-semibold text-[#64748B]">Click Load to load the student details.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className={labelClass}>Full Name <span className="text-red-500">*</span><input className={inputClass} value={studentForm.fullName} onChange={(event) => updateStudentForm({ fullName: event.target.value })} placeholder="Student name" required /></label>
              <label className={labelClass}>Branch <span className="text-red-500">*</span><input className={inputClass} value={studentForm.branchLabel} onChange={(event) => updateStudentForm({ branchLabel: event.target.value })} placeholder="Enter branch" required /></label>
              <label className={labelClass}>Year <span className="text-red-500">*</span><input className={inputClass} value={studentForm.yearLabel} onChange={(event) => updateStudentForm({ yearLabel: event.target.value })} placeholder="Enter year" required /></label>
              <label className={labelClass}>Section <span className="text-red-500">*</span><input className={inputClass} value={studentForm.sectionLabel} onChange={(event) => updateStudentForm({ sectionLabel: event.target.value })} placeholder="Enter section" required /></label>
            </div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#334155]"><Buildings size={16} className="text-[#16A85B]" />2. Purpose of Visit</h3>
            <label className={labelClass}>Purpose of Visit <span className="text-red-500">*</span><textarea rows={2} value={purposeOfVisit} onChange={(event) => setPurposeOfVisit(event.target.value.slice(0, 500))} className="mt-1 w-full resize-none rounded border border-[#DCE5EF] p-2.5 text-xs outline-none focus:border-[#43C17A]" placeholder="Enter purpose of visit in detail..." /></label>
            <div className="mt-1 flex justify-between text-xs text-[#94A3B8]"><span>Provide complete details about why the student is visiting the sports room.</span><span>{purposeOfVisit.length} / 500 characters</span></div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#334155]"><Clock size={16} className="text-[#16A85B]" />3. Visit Details</h3>
            <div className="grid gap-3 md:grid-cols-3"><label className={labelClass}>Entry Date <span className="text-red-500">*</span><input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} className={inputClass} /></label><label className={labelClass}>Entry Time <span className="text-red-500">*</span><input type="time" value={entryTime} onChange={(event) => setEntryTime(event.target.value)} className={inputClass} /></label><label className={labelClass}>Exit Time <span className="font-normal text-[#94A3B8]">(Optional)</span><input type="time" value={exitTime} onChange={(event) => setExitTime(event.target.value)} className={inputClass} /></label></div>
            <div className="mt-2 rounded border border-[#B9DDFB] bg-[#EDF7FF] px-3 py-2 text-xs font-semibold text-[#2583D8]">Entry time is filled automatically. You can adjust it if needed.</div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#334155]"><Wrench size={16} className="text-[#16A85B]" />4. Equipment Details <span className="text-xs font-semibold text-[#94A3B8]">(Optional)</span></h3>
            <div className="space-y-3">
              {equipmentRows.map((row) => (
                <div key={row.id} className="grid gap-3 md:grid-cols-[1.3fr_.7fr_1.3fr_auto]">
                  <label className={labelClass}>Equipment <span className="font-normal text-[#94A3B8]">(Optional)</span><select className={inputClass} value={row.inventoryAssetId} disabled={isEquipmentLoading} onChange={(event) => updateEquipmentRow(row.id, { inventoryAssetId: event.target.value })}><option value="">{isEquipmentLoading ? "Loading equipment..." : "Select equipment"}</option>{(inventoryAssets ?? []).map((asset) => <option key={asset.inventoryAssetId} value={asset.inventoryAssetId} disabled={selectedEquipmentIds.has(String(asset.inventoryAssetId)) && row.inventoryAssetId !== String(asset.inventoryAssetId)}>{asset.assetName}</option>)}</select>{row.inventoryAssetId ? <span className="mt-1 block text-[11px] font-semibold text-[#64748B]">({(inventoryAssets ?? []).find((asset) => String(asset.inventoryAssetId) === row.inventoryAssetId)?.availableQty ?? 0} available)</span> : null}</label>
                  <label className={labelClass}>Quantity <span className="font-normal text-[#94A3B8]">(Optional)</span><input type="number" min="1" className={inputClass} value={row.quantity} onChange={(event) => updateEquipmentRow(row.id, { quantity: event.target.value })} /></label>
                  <label className={labelClass}>Remarks <span className="font-normal text-[#94A3B8]">(Optional)</span><input className={inputClass} value={row.remarks} onChange={(event) => updateEquipmentRow(row.id, { remarks: event.target.value })} placeholder="Enter remarks" /></label>
                  <button type="button" onClick={() => setEquipmentRows((rows) => rows.filter((equipmentRow) => equipmentRow.id !== row.id))} disabled={equipmentRows.length === 1} className="mt-5 h-8 cursor-pointer rounded border border-[#DCE5EF] px-3 text-xs font-bold text-[#EF4444] disabled:cursor-not-allowed disabled:text-[#CBD5E1]">Remove</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setEquipmentRows((rows) => [...rows, { id: Date.now(), inventoryAssetId: "", quantity: "1", remarks: "" }])} className="mt-3 inline-flex h-8 cursor-pointer items-center gap-2 rounded border border-[#16A85B] px-3 text-xs font-bold text-[#149447]"><Plus size={13} weight="bold" />Add Another Equipment</button>
          </section>
        </div>

        <footer className="flex justify-end gap-3 border-t border-[#E8EEF5] px-5 py-3"><button type="button" onClick={onClose} className="h-8 cursor-pointer rounded border border-[#DCE5EF] px-5 text-xs font-bold text-[#334155]">Cancel</button><button type="button" onClick={handleSave} disabled={isSaving} className="inline-flex h-8 cursor-pointer items-center gap-2 rounded bg-[#149447] px-5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-[#94A3B8]"><FloppyDisk size={13} weight="bold" />{isSaving ? "Saving..." : "Save Entry"}</button></footer>
      </div>
    </div>
  );
}
