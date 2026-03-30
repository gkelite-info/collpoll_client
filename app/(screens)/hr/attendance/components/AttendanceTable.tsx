"use client";
 
import { useMemo, useState, useEffect } from "react";
import TableComponent from "@/app/utils/table/table";
 
import { ExtendedColumn } from "./types";
import { getStatusBadge } from "./statusBadge";
import TimeInput from "./TimeInput";
import { AttendanceStaffRow, buildTimeString, formatMinutes, saveAttendance, saveStatusOnly } from "@/lib/helpers/Hr/attendance/Getattendancestaff";
 
type Props = {
  isEditMode:     boolean;
  isFetching:     boolean;
  activeRole:     string | null;
  staffList:      AttendanceStaffRow[];
  fullStaffList?: AttendanceStaffRow[];   // optional — falls back to staffList
  selectedRows:   Set<number>;
  selectAll:      boolean;
  collegeHrId:    number;
  markedUserIds:  Set<number>;
  filterDate?:    string | null;          // ADDED: "YYYY-MM-DD" for past-date edits
  onSelectAll:    (checked: boolean) => void;
  onSelectRow:    (index: number, checked: boolean, filteredLength: number) => void;
  onSave:         () => void;
  onCancel:       () => void;
  onRefresh:      () => void;
};
 
type RowEdit = {
  checkIn:  string;
  checkOut: string;
  reason:   string;
};
 
type RowValidation = {
  checkIn?:  string;
  checkOut?: string;
  reason?:   string;
  status?:   string;
};
 
export default function AttendanceTable({
  isEditMode,
  isFetching,
  activeRole,
  staffList,
  fullStaffList: fullStaffListProp,
  selectedRows,
  selectAll,
  collegeHrId,
  markedUserIds,
  filterDate,                             // ADDED
  onSelectAll,
  onSelectRow,
  onSave,
  onCancel,
  onRefresh,
}: Props) {
  const fullStaffList = fullStaffListProp ?? staffList;
  const isFacultyFilter = activeRole === "Faculty";
 
  const [rowEdits,       setRowEdits]       = useState<Record<number, RowEdit>>({});
  const [statusChanged,  setStatusChanged]  = useState<Set<number>>(new Set()); // userIds whose status was changed via Mark
  const [savingIds,      setSavingIds]      = useState<Set<number>>(new Set());
  const [isSavingAll,    setIsSavingAll]    = useState(false);
  const [saveErrors,     setSaveErrors]     = useState<Record<number, string>>({});
  const [validationErrs, setValidationErrs] = useState<Record<number, RowValidation>>({});
  const [toast,          setToast]          = useState<{ msg: string; type: "success" | "error" } | null>(null);
 
  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);
 
  const resetAll = () => {
    setRowEdits({});
    setSaveErrors({});
    setValidationErrs({});
  };
 
  // Pre-fill existing values — only the specific field changes, others preserved
  const getEdit = (item: AttendanceStaffRow): RowEdit =>
    rowEdits[item.userId] ?? {
      checkIn:  item.checkIn  ?? "",
      checkOut: item.checkOut ?? "",
      reason:   item.reason   ?? "",
    };
 
  const setEditField = (userId: number, field: keyof RowEdit, value: string, item: AttendanceStaffRow) => {
    setRowEdits((prev) => {
      // Use existing rowEdit if present, else pre-fill from item — never reset other fields
      const base = prev[userId] ?? {
        checkIn:  item.checkIn  ?? "",
        checkOut: item.checkOut ?? "",
        reason:   item.reason   ?? "",
      };
      return { ...prev, [userId]: { ...base, [field]: value } };
    });
    // Clear that field's validation error
    setValidationErrs((prev) => {
      const e = { ...(prev[userId] ?? {}) };
      delete (e as any)[field];
      return { ...prev, [userId]: e };
    });
  };
 
  // Validate before save
  const validateRow = (item: AttendanceStaffRow, edit: RowEdit, isStatusOnly: boolean): RowValidation => {
    const errs: RowValidation = {};
    const status = (item.status ?? "").toLowerCase();
 
    if (!item.status || item.status === "-") {
      errs.status = "Select a status using Mark buttons above";
      return errs;
    }
 
    // Status-only change (no input fields edited) — no further validation needed
    if (isStatusOnly) return errs;
 
    // Absent / Leave — only reason required, no times
    if (status === "absent" || status === "leave") {
      if (!edit.reason.trim()) errs.reason = "Reason is required";
      return errs;
    }
 
    // Present / Late — checkIn required if no existing DB value
    const hasExistingCheckIn = !!item.rawCheckIn;
    if (!hasExistingCheckIn && !edit.checkIn.trim()) errs.checkIn = "Check-In time is required";
    if (!edit.reason.trim()) errs.reason = "Reason is required";
    return errs;
  };
 
  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: ExtendedColumn[] = [
    ...(isEditMode ? [{
      title: (
        <div className="flex justify-center items-center">
          <input type="checkbox" checked={selectAll}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#6C20CA] focus:ring-[#6C20CA] cursor-pointer"
          />
        </div>
      ),
      key: "select",
    }] : []),
    { title: "ID",           key: "id" },
    { title: "Name",         key: "name" },
    { title: "Role",         key: "role" },
    { title: "Check-In",    key: "checkIn" },
    { title: "Check-Out",   key: "checkOut" },
    { title: "Total Hours",  key: "totalHours" },
    { title: "Status",       key: "status" },
    ...(isFacultyFilter ? [{ title: "Classes Taken", key: "classesTaken" }] : []),
    { title: "Late By",     key: "lateBy" },
    { title: "Early Out",   key: "earlyOut" },
    { title: "Reason",      key: "reason" },   // always visible
  ];
 
  const filtered = useMemo(() =>
    activeRole ? staffList.filter((s) => s.role === activeRole) : staffList,
    [staffList, activeRole]
  );
 
  // ── Save single row ───────────────────────────────────────────────────────
  const handleSaveRow = async (item: AttendanceStaffRow, isStatusOnly = false): Promise<boolean> => {
    const edit = getEdit(item);
 
    const errs = validateRow(item, edit, isStatusOnly);
    if (Object.keys(errs).length > 0) {
      setValidationErrs((prev) => ({ ...prev, [item.userId]: errs }));
      return false;
    }
 
    setSavingIds((p) => new Set(p).add(item.userId));
    setSaveErrors((p) => { const n = { ...p }; delete n[item.userId]; return n; });
 
    try {
      // Status-only change — just update status in DB, no time logic
      if (isStatusOnly) {
        await saveStatusOnly({
          attendanceDailyId: item.attendanceDailyId!,
          userId:            item.userId,
          status:            item.status,
          collegeHrId,
          date:              filterDate ?? undefined, // ADDED: pass date for past-date edits
        });
        return true;
      }
 
      const status   = (item.status ?? "").toLowerCase();
      const isNoShow = status === "absent" || status === "leave";
 
      const newCheckIn  = (!isNoShow && edit.checkIn.trim() && edit.checkIn !== (item.checkIn ?? ""))
        ? buildTimeString(edit.checkIn.trim())
        : (!isNoShow ? (item.rawCheckIn ?? "") : "");
 
      const newCheckOut = (!isNoShow && edit.checkOut.trim() && edit.checkOut !== (item.checkOut ?? ""))
        ? buildTimeString(edit.checkOut.trim())
        : (!isNoShow ? (item.rawCheckOut ?? "") : "");
 
      await saveAttendance({
        attendanceDailyId: item.attendanceDailyId,
        userId:            item.userId,
        checkIn:           isNoShow ? "" : newCheckIn,
        checkOut:          isNoShow ? "" : newCheckOut,
        reason:            edit.reason.trim(),
        status:            item.status !== "-" ? item.status.toUpperCase() : undefined,
        collegeHrId,
        classesTaken:      item.classesTaken ?? 0,
        rawCheckIn:        item.rawCheckIn,
        rawCheckOut:       item.rawCheckOut,
        date:              filterDate ?? undefined, // ADDED: pass date for past-date edits
      });
 
      setRowEdits((p) => { const n = { ...p }; delete n[item.userId]; return n; });
      return true;
    } catch (err: any) {
      setSaveErrors((p) => ({ ...p, [item.userId]: err.message ?? "Save failed" }));
      return false;
    } finally {
      setSavingIds((p) => { const n = new Set(p); n.delete(item.userId); return n; });
    }
  };
 
  // ── Table rows ────────────────────────────────────────────────────────────
  const tableData = useMemo(() =>
    filtered.map((item, index) => {
      const edit    = getEdit(item);
      const valErrs = validationErrs[item.userId] ?? {};
      const saveErr = saveErrors[item.userId];
 
      const displayCheckIn  = item.checkIn  ?? "-";
      const displayCheckOut = item.checkOut ?? "-";
      const displayReason   = item.reason   ?? "-";
      const isNoShow = ["absent", "leave"].includes((item.status ?? "").toLowerCase());
 
      return {
        id:   item.userId,
        name: item.fullName,
        role: item.role,
 
        checkIn: isEditMode ? (
          isNoShow ? <span className="text-xs text-gray-400">-</span> : (
            <div className="flex flex-col gap-0.5">
              <TimeInput value={edit.checkIn} defaultMeridiem="AM"
                onChange={(val) => setEditField(item.userId, "checkIn", val, item)} />
              {valErrs.checkIn && <span className="text-[10px] text-red-500">{valErrs.checkIn}</span>}
            </div>
          )
        ) : displayCheckIn,
 
        checkOut: isEditMode ? (
          isNoShow ? <span className="text-xs text-gray-400">-</span> : (
            <div className="flex flex-col gap-0.5">
              <TimeInput value={edit.checkOut} defaultMeridiem="PM"
                onChange={(val) => setEditField(item.userId, "checkOut", val, item)} />
              {valErrs.checkOut && <span className="text-[10px] text-red-500">{valErrs.checkOut}</span>}
            </div>
          )
        ) : displayCheckOut,
 
        totalHours:   item.totalHours || "-",
 
        // Status: show badge if has status, else show validation error hint
        status: item.status && item.status !== "-"
          ? getStatusBadge(item.status)
          : (valErrs.status
              ? <span className="text-[10px] text-red-400">Mark status first</span>
              : "-"),
 
        classesTaken: item.classesTaken !== null
          ? String(item.classesTaken).padStart(2, "0") : "-",
        lateBy:   formatMinutes(item.lateByMinutes),
        earlyOut: formatMinutes(item.earlyOutMinutes),
 
        // Reason — input in edit mode, text in read mode
        reason: isEditMode ? (
          <div className="flex flex-col gap-0.5 min-w-[140px]">
            <input
              type="text"
              value={edit.reason}
              placeholder="Reason (required)"
              onChange={(e) => setEditField(item.userId, "reason", e.target.value, item)}
              className={`w-full text-xs border rounded px-2 py-1 focus:outline-none focus:border-[#6C20CA] placeholder:text-gray-400
                ${valErrs.reason ? "border-red-400" : "border-gray-300"}`}
            />
            {valErrs.reason && <span className="text-[10px] text-red-500">{valErrs.reason}</span>}
            {saveErr   && <span className="text-[10px] text-red-500">{saveErr}</span>}
          </div>
        ) : displayReason,
 
        ...(isEditMode && {
          select: (
            <div className="flex justify-center items-center">
              <input type="checkbox" checked={selectedRows.has(index)}
                onChange={(e) => onSelectRow(index, e.target.checked, filtered.length)}
                className="w-4 h-4 rounded border-gray-300 text-[#6C20CA] focus:ring-[#6C20CA] cursor-pointer"
              />
            </div>
          ),
        }),
      };
    }),
    [filtered, isEditMode, selectedRows, rowEdits, savingIds, saveErrors, validationErrs]
  );
 
  const saveButtons = isEditMode ? (
    <div className="flex justify-center gap-4 mt-3 pb-2">
      <button
        disabled={isSavingAll}
        onClick={async () => {
          const editedUserIds = new Set(Object.keys(rowEdits).map(Number));
          const allUserIds    = new Set([...editedUserIds, ...markedUserIds]);
 
          if (allUserIds.size === 0) { onSave(); return; }
 
          setIsSavingAll(true);
 
          const roleFiltered = activeRole
            ? fullStaffList.filter((s) => s.role === activeRole)
            : fullStaffList;
          const staffToSave = roleFiltered.filter((s) => allUserIds.has(s.userId));
 
          const results = await Promise.all(
            staffToSave.map((s) => {
              const isStatusOnly = markedUserIds.has(s.userId) && !Object.keys(rowEdits).includes(String(s.userId));
              return handleSaveRow(s, isStatusOnly);
            })
          );
          setIsSavingAll(false);
 
          if (results.every(Boolean)) {
            setToast({ msg: "Attendance saved successfully!", type: "success" });
            resetAll();
            onSave();
            onRefresh();
          } else {
            setToast({ msg: "Some rows failed. Please check errors.", type: "error" });
          }
        }}
        className="w-[200px] bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
      >
        {isSavingAll ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Saving...
          </>
        ) : "Save Attendance"}
      </button>
      <button
        disabled={isSavingAll}
        onClick={() => { resetAll(); onCancel(); }}
        className="w-[200px] bg-[#EF4444] hover:bg-[#dc2626] disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-lg cursor-pointer transition-colors"
      >
        Cancel
      </button>
    </div>
  ) : null;
 
  if (isFetching) return <div className="animate-pulse bg-gray-100 rounded-xl h-48" />;
 
  if (tableData.length === 0) return (
    <>
      <p className="text-gray-400 text-sm text-center mt-8">No staff found.</p>
      {saveButtons}
    </>
  );
 
  return (
    <>
      {/* ── Toast notification ─────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all
          ${toast.type === "success" ? "bg-[#22C55E]" : "bg-[#EF4444]"}`}>
          {toast.type === "success"
            ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {toast.msg}
        </div>
      )}
 
      <TableComponent
        columns={columns as any[]}
        tableData={tableData}
        height={isEditMode ? "38vh" : "48vh"}
      />
 
      {!isEditMode && <div className="pb-4" />}
 
      {saveButtons}
    </>
  );
}