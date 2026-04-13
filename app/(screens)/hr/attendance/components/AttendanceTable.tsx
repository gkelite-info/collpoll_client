"use client";

import { useMemo, useState } from "react";
import TableComponent from "@/app/utils/table/table";
import toast from "react-hot-toast";

import { ExtendedColumn } from "./types";
import { getStatusBadge } from "./statusBadge";
import TimeInput from "./TimeInput";
import {
  AttendanceStaffRow,
  buildTimeString,
  formatMinutes,
  saveAttendance,
  saveStatusOnly,
} from "@/lib/helpers/Hr/attendance/Getattendancestaff";

type Props = {
  isEditMode: boolean;
  isFetching: boolean;
  activeRole: string | null;
  staffList: AttendanceStaffRow[];
  fullStaffList?: AttendanceStaffRow[];
  selectedRows: Set<number>;
  selectAll: boolean;
  collegeHrId: number;
  markedUserIds: Set<number>;
  filterDate?: string | null;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (
    index: number,
    checked: boolean,
    filteredLength: number,
  ) => void;
  onSave: () => void;
  onCancel: () => void;
  onRefresh: () => void;
};

type RowEdit = {
  checkIn: string;
  checkOut: string;
  reason: string;
};

type RowValidation = {
  checkIn?: string;
  checkOut?: string;
  reason?: string;
  status?: string;
};

// Time parser helper for strict validations
const parseToMinutes = (timeStr: string) => {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const mer = match[3].toUpperCase();
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return h * 60 + m;
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
  filterDate,
  onSelectAll,
  onSelectRow,
  onSave,
  onCancel,
  onRefresh,
}: Props) {
  const fullStaffList = fullStaffListProp ?? staffList;
  const isFacultyFilter = activeRole === "Faculty";

  const [rowEdits, setRowEdits] = useState<Record<number, RowEdit>>({});
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [saveErrors, setSaveErrors] = useState<Record<number, string>>({});
  const [validationErrs, setValidationErrs] = useState<
    Record<number, RowValidation>
  >({});

  const resetAll = () => {
    setRowEdits({});
    setSaveErrors({});
    setValidationErrs({});
  };

  const getEdit = (item: AttendanceStaffRow): RowEdit =>
    rowEdits[item.userId] ?? {
      checkIn: item.checkIn ?? "",
      checkOut: item.checkOut ?? "",
      reason: item.reason ?? "",
    };

  const setEditField = (
    userId: number,
    field: keyof RowEdit,
    value: string,
    item: AttendanceStaffRow,
  ) => {
    setRowEdits((prev) => {
      const base = prev[userId] ?? {
        checkIn: item.checkIn ?? "",
        checkOut: item.checkOut ?? "",
        reason: item.reason ?? "",
      };
      return { ...prev, [userId]: { ...base, [field]: value } };
    });
    setValidationErrs((prev) => {
      const e = { ...(prev[userId] ?? {}) };
      delete (e as any)[field];
      return { ...prev, [userId]: e };
    });
  };

  const validateRow = (
    item: AttendanceStaffRow,
    edit: RowEdit,
    isStatusOnly: boolean,
  ): RowValidation => {
    const errs: RowValidation = {};
    const status = (item.status ?? "").toLowerCase();

    if (!item.status || item.status === "-") {
      errs.status = "Select a status using Mark buttons above";
      return errs;
    }

    if (isStatusOnly) return errs;

    if (status === "absent" || status === "leave") {
      if (!edit.reason.trim()) errs.reason = "Reason is required";
      return errs;
    }

    const hasExistingCheckIn = !!item.rawCheckIn;
    const checkInMins = parseToMinutes(edit.checkIn);
    const checkOutMins = parseToMinutes(edit.checkOut);

    // Strict Validations
    if (!hasExistingCheckIn && !edit.checkIn.trim()) {
      errs.checkIn = "Check-In is required";
    } else if (edit.checkIn.trim() && checkInMins === null) {
      errs.checkIn = "Incomplete format";
    } else if (checkInMins !== null) {
      // 8 AM (480) to 3 PM (900) check
      if (checkInMins < 480 || checkInMins > 900) {
        errs.checkIn = "Must be 08:00 AM - 03:00 PM";
      }
    }

    if (edit.checkOut.trim()) {
      if (checkOutMins === null) {
        errs.checkOut = "Incomplete format";
      } else if (checkInMins !== null && checkOutMins <= checkInMins) {
        errs.checkOut = "Must be > Check-In";
      }
    }

    if (!edit.reason.trim()) errs.reason = "Reason is required";
    return errs;
  };

  const columns: ExtendedColumn[] = [
    ...(isEditMode
      ? [
          {
            title: (
              <div className="flex justify-center items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#6C20CA] focus:ring-[#6C20CA] cursor-pointer"
                />
              </div>
            ),
            key: "select",
          },
        ]
      : []),
    { title: "ID", key: "id" },
    { title: "Name", key: "name" },
    { title: "Role", key: "role" },
    { title: "Check-In", key: "checkIn" },
    { title: "Check-Out", key: "checkOut" },
    { title: "Total Hours", key: "totalHours" },
    { title: "Status", key: "status" },
    ...(isFacultyFilter
      ? [{ title: "Classes Taken", key: "classesTaken" }]
      : []),
    { title: "Late By", key: "lateBy" },
    { title: "Early Out", key: "earlyOut" },
    { title: "Reason", key: "reason" },
  ];

  const filtered = useMemo(
    () =>
      activeRole ? staffList.filter((s) => s.role === activeRole) : staffList,
    [staffList, activeRole],
  );

  const handleSaveRow = async (
    item: AttendanceStaffRow,
    isStatusOnly = false,
  ): Promise<boolean> => {
    const edit = getEdit(item);

    const errs = validateRow(item, edit, isStatusOnly);
    if (Object.keys(errs).length > 0) {
      setValidationErrs((prev) => ({ ...prev, [item.userId]: errs }));
      return false; // Blocks invalid saves immediately
    }

    setSavingIds((p) => new Set(p).add(item.userId));
    setSaveErrors((p) => {
      const n = { ...p };
      delete n[item.userId];
      return n;
    });

    try {
      if (isStatusOnly) {
        await saveStatusOnly({
          attendanceDailyId: item.attendanceDailyId!,
          userId: item.userId,
          status: item.status,
          collegeHrId,
          date: filterDate ?? undefined,
        });
        return true;
      }

      const status = (item.status ?? "").toLowerCase();
      const isNoShow = status === "absent" || status === "leave";

      const newCheckIn =
        !isNoShow &&
        edit.checkIn.trim() &&
        edit.checkIn !== (item.checkIn ?? "")
          ? buildTimeString(edit.checkIn.trim())
          : !isNoShow
            ? (item.rawCheckIn ?? "")
            : "";

      const newCheckOut =
        !isNoShow &&
        edit.checkOut.trim() &&
        edit.checkOut !== (item.checkOut ?? "")
          ? buildTimeString(edit.checkOut.trim())
          : !isNoShow
            ? (item.rawCheckOut ?? "")
            : "";

      await saveAttendance({
        attendanceDailyId: item.attendanceDailyId,
        userId: item.userId,
        checkIn: isNoShow ? "" : newCheckIn,
        checkOut: isNoShow ? "" : newCheckOut,
        reason: edit.reason.trim(),
        status: item.status !== "-" ? item.status.toUpperCase() : undefined,
        collegeHrId,
        classesTaken: item.classesTaken ?? 0,
        rawCheckIn: item.rawCheckIn,
        rawCheckOut: item.rawCheckOut,
        date: filterDate ?? undefined,
      });

      setRowEdits((p) => {
        const n = { ...p };
        delete n[item.userId];
        return n;
      });
      return true;
    } catch (err: any) {
      setSaveErrors((p) => ({
        ...p,
        [item.userId]: err.message ?? "Save failed",
      }));
      return false;
    } finally {
      setSavingIds((p) => {
        const n = new Set(p);
        n.delete(item.userId);
        return n;
      });
    }
  };

  const tableData = useMemo(
    () =>
      filtered.map((item, index) => {
        const edit = getEdit(item);
        const valErrs = validationErrs[item.userId] ?? {};
        const saveErr = saveErrors[item.userId];

        const displayCheckIn = item.checkIn ?? "-";
        const displayCheckOut = item.checkOut ?? "-";
        const displayReason = item.reason ?? "-";
        const isNoShow = ["absent", "leave"].includes(
          (item.status ?? "").toLowerCase(),
        );

        return {
          id: item.userId,
          name: item.fullName,
          role: item.role,

          checkIn: isEditMode ? (
            isNoShow ? (
              <span className="text-xs text-gray-400">-</span>
            ) : (
              <div className="flex flex-col gap-0.5">
                <TimeInput
                  value={edit.checkIn}
                  defaultMeridiem="AM"
                  onChange={(val) =>
                    setEditField(item.userId, "checkIn", val, item)
                  }
                />
                {valErrs.checkIn && (
                  <span className="text-[10px] text-red-500 whitespace-nowrap">
                    {valErrs.checkIn}
                  </span>
                )}
              </div>
            )
          ) : (
            displayCheckIn
          ),

          checkOut: isEditMode ? (
            isNoShow ? (
              <span className="text-xs text-gray-400">-</span>
            ) : (
              <div className="flex flex-col gap-0.5">
                <TimeInput
                  value={edit.checkOut}
                  defaultMeridiem="PM"
                  onChange={(val) =>
                    setEditField(item.userId, "checkOut", val, item)
                  }
                />
                {valErrs.checkOut && (
                  <span className="text-[10px] text-red-500 whitespace-nowrap">
                    {valErrs.checkOut}
                  </span>
                )}
              </div>
            )
          ) : (
            displayCheckOut
          ),

          totalHours: item.totalHours || "-",

          status:
            item.status && item.status !== "-" ? (
              getStatusBadge(item.status)
            ) : valErrs.status ? (
              <span className="text-[10px] text-red-400">
                Mark status first
              </span>
            ) : (
              "-"
            ),

          classesTaken:
            item.classesTaken !== null
              ? String(item.classesTaken).padStart(2, "0")
              : "-",
          lateBy: formatMinutes(item.lateByMinutes),
          earlyOut: formatMinutes(item.earlyOutMinutes),

          reason: isEditMode ? (
            <div className="flex flex-col gap-0.5 min-w-[140px]">
              <input
                type="text"
                value={edit.reason}
                placeholder="Reason (required)"
                onChange={(e) =>
                  setEditField(item.userId, "reason", e.target.value, item)
                }
                className={`w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:border-[#6C20CA] placeholder:text-gray-400
                ${valErrs.reason ? "border-red-400" : "border-gray-300"}`}
              />
              {valErrs.reason && (
                <span className="text-[10px] text-red-500">
                  {valErrs.reason}
                </span>
              )}
              {saveErr && (
                <span className="text-[10px] text-red-500">{saveErr}</span>
              )}
            </div>
          ) : (
            displayReason
          ),

          ...(isEditMode && {
            select: (
              <div className="flex justify-center items-center">
                <input
                  type="checkbox"
                  checked={selectedRows.has(index)}
                  onChange={(e) =>
                    onSelectRow(index, e.target.checked, filtered.length)
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[#6C20CA] focus:ring-[#6C20CA] cursor-pointer"
                />
              </div>
            ),
          }),
        };
      }),
    [
      filtered,
      isEditMode,
      selectedRows,
      rowEdits,
      savingIds,
      saveErrors,
      validationErrs,
    ],
  );

  const saveButtons = isEditMode ? (
    <div className="flex justify-center gap-4 mt-3 pb-2">
      <button
        disabled={isSavingAll}
        onClick={async () => {
          const editedUserIds = new Set(Object.keys(rowEdits).map(Number));
          // FIX: Add explicitly selected rows to force validation before saving
          const selectedUserIds = new Set(
            Array.from(selectedRows).map((idx) => filtered[idx].userId),
          );
          const allUserIds = new Set([
            ...editedUserIds,
            ...markedUserIds,
            ...selectedUserIds,
          ]);

          if (allUserIds.size === 0) {
            onSave();
            return;
          }

          setIsSavingAll(true);

          const roleFiltered = activeRole
            ? fullStaffList.filter((s) => s.role === activeRole)
            : fullStaffList;
          const staffToSave = roleFiltered.filter((s) =>
            allUserIds.has(s.userId),
          );

          const results = await Promise.all(
            staffToSave.map((s) => {
              const isStatusOnly =
                markedUserIds.has(s.userId) &&
                !Object.keys(rowEdits).includes(String(s.userId));
              return handleSaveRow(s, isStatusOnly);
            }),
          );
          setIsSavingAll(false);

          if (results.every(Boolean)) {
            toast.success("Attendance saved successfully!");
            resetAll();
            onSave();
            onRefresh();
          } else {
            toast.error("Some rows failed. Please check errors.");
          }
        }}
        className="w-[200px] bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
      >
        {isSavingAll ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Saving...
          </>
        ) : (
          "Save Attendance"
        )}
      </button>
      <button
        disabled={isSavingAll}
        onClick={() => {
          resetAll();
          onCancel();
        }}
        className="w-[200px] bg-[#EF4444] hover:bg-[#dc2626] disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-lg cursor-pointer transition-colors"
      >
        Cancel
      </button>
    </div>
  ) : null;

  if (isFetching)
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden w-full mt-2 min-h-[48vh] flex flex-col relative">
        <div className="flex gap-4 p-4 border-b border-gray-100 bg-gray-50/50">
          {[...Array(8)].map((_, i) => (
            <div
              key={`th-${i}`}
              className="h-4 bg-gray-200 rounded w-full animate-pulse"
            ></div>
          ))}
        </div>
        {[...Array(6)].map((_, r) => (
          <div
            key={`tr-${r}`}
            className="flex gap-4 p-4 border-b border-gray-50 last:border-0"
          >
            {[...Array(8)].map((_, c) => (
              <div
                key={`td-${c}`}
                className="h-4 bg-gray-100 rounded w-full animate-pulse relative overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );

  if (tableData.length === 0)
    return (
      <>
        <p className="text-gray-400 text-sm text-center mt-8">
          No staff found.
        </p>
        {saveButtons}
      </>
    );

  return (
    <>
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
