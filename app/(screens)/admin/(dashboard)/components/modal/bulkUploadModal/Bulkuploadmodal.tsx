"use client";

import React, { useCallback, useRef, useState } from "react";
import {
    X,
    UploadSimple,
    FileCsv,
    CheckCircle,
    XCircle,
    Warning,
    ArrowLeft,
    DownloadSimple,
    UserPlus,
} from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { upsertUser } from "@/lib/helpers/upsertUser";
import { upsertIdentifier } from "@/lib/helpers/identifiers/upsertIdentifier";
import { fetchModalInitialData } from "@/lib/helpers/admin/upsertFaculty";
import { fetchSessionOptions } from "@/lib/helpers/collegeSessionAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { BulkRow, BulkUploadModalProps, formatDateOnly, ROLE_OPTIONS, RowResult, Step } from "./splits/types";
import validateRow from "./splits/rowValidations";
import { parseExcelToRows } from "./splits/parseExcelToRows";
import downloadTemplate from "./splits/downloadTemplate";
import dispatchRoleHandler from "./splits/dispatchRoleHandler";
import { processWithConcurrency } from "./splits/processWithConcurrency";


const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { collegeEducationId, collegeEducationType } = useAdmin();

    const [step, setStep] = useState<Step>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<BulkRow[]>([]);
    const [validRows, setValidRows] = useState<BulkRow[]>([]);
    const [preValidationErrors, setPreValidationErrors] = useState<
        { row: number; email: string; role: string; reason: string }[]
    >([]);
    const [columnMapping, setColumnMapping] = useState<{ raw: string; mapped: string | null }[]>([]);
    const [results, setResults] = useState<RowResult[]>([]);
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setStep("upload");
        setFile(null);
        setParsedRows([]);
        setValidRows([]);
        setPreValidationErrors([]);
        setColumnMapping([]);
        setResults([]);
        setProgress(0);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFileAccepted = async (f: File) => {
        if (
            !f.name.endsWith(".xlsx") &&
            !f.name.endsWith(".xls") &&
            !f.name.endsWith(".csv")
        ) {
            toast.error("Only .xlsx, .xls, or .csv files are supported.");
            return;
        }
        setFile(f);
        try {
            const { rows, columnMapping: mapping } = await parseExcelToRows(f);
            if (rows.length === 0) {
                toast.error("The file is empty or has no data rows.");
                return;
            }

            const unmapped = mapping.filter((m) => m.mapped === null);
            if (unmapped.length > 0) {
                toast(`⚠️ ${unmapped.length} column(s) not recognized and ignored: ${unmapped.map((u) => `"${u.raw}"`).join(", ")}`, { duration: 5000 });
            }

            const errors: typeof preValidationErrors = [];
            const valid: BulkRow[] = [];

            rows.forEach((row, i) => {
                const err = validateRow(row, i + 2);
                if (err) {
                    errors.push({
                        row: i + 2,
                        email: row.email || "—",
                        role: row.role || "—",
                        reason: err,
                    });
                } else {
                    valid.push(row);
                }
            });

            setParsedRows(rows);
            setValidRows(valid);
            setPreValidationErrors(errors);
            setColumnMapping(mapping);
            setStep("preview");
        } catch {
            toast.error("Failed to parse the file. Please check the format.");
        }
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFileAccepted(f);
        },
        [],
    );

    const handleStartImport = async () => {
        setStep("processing");
        setProgress(0);

        let adminContext: any = null;
        let dbData: any = null;
        let sessionOptions: any[] = [];

        try {
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            if (!authUser) throw new Error("Not authenticated");

            const { data: userData } = await supabase
                .from("users")
                .select("userId")
                .eq("auth_id", authUser.id)
                .single();
            if (!userData) throw new Error("User record not found");

            adminContext = await fetchAdminContext(userData.userId);
            dbData = await fetchModalInitialData(adminContext.collegeId);
            sessionOptions = await fetchSessionOptions(adminContext.collegeId);

            const { data: semesterData } = await supabase
                .from("college_semester")
                .select("*")
                .eq("collegeId", adminContext.collegeId)
                .eq("isActive", true);

            dbData.semesters = semesterData || [];
        } catch (e: any) {
            toast.error("Failed to load college context: " + e.message);
            setStep("preview");
            return;
        }

        const rowResults: RowResult[] = [];

        await processWithConcurrency(
            validRows,
            3,
            async (row, index) => {
                const timestamp = new Date().toISOString();
                let createdAuthId: string | null = null;
                let createdUserId: number | null = null;

                try {
                    // ── Fix mobileCode: ensure it always starts with "+"
                    const mobileCode = row.mobileCode?.trim().startsWith("+")
                        ? row.mobileCode.trim()
                        : `+${row.mobileCode?.trim() || "91"}`;

                    const normalizedDateOfJoining = row.dateOfJoining
                        ? formatDateOnly(row.dateOfJoining)
                        : null;

                    const { data: { session } } = await supabase.auth.getSession();
                    const accessToken = session?.access_token;
                    if (!accessToken) throw new Error("No active session");

                    const cCode = adminContext.collegeCode || "";
                    const redirectUrl = cCode.toUpperCase() === "GKELITE" || !cCode
                        ? "https://tektoncampus.com/login"
                        : `https://${cCode.toLowerCase()}.tektoncampus.com/login`;

                    const createRes = await fetch("/api/admin/create-auth-user", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({
                            action: "create",
                            email: row.email,
                            password: row.password,
                            fullName: row.fullName,
                            role: row.role,
                            emailRedirectTo: redirectUrl,
                        }),
                    });

                    let createJson: any = {};

                    try {
                        const text = await createRes.text();
                        createJson = text ? JSON.parse(text) : {};
                    } catch {
                        createJson = {};
                    }

                    if (!createRes.ok) {
                        throw new Error(
                            createJson?.error ||
                            `Auth user creation failed (${createRes.status})`
                        );
                    }

                    if (!createJson?.authId) {
                        throw new Error("Auth user creation failed: Missing authId");
                    }

                    createdAuthId = createJson.authId;

                    const userRes = await upsertUser({
                        auth_id: createdAuthId,
                        fullName: row.fullName,
                        email: row.email,
                        // mobile: `${mobileCode}${row.mobileNumber}`,
                        mobile:
                            row.mobileNumber?.trim()
                                ? `${mobileCode}${row.mobileNumber}`
                                : null,
                        role: row.role,
                        collegeId: adminContext.collegeId,
                        collegePublicId: adminContext.collegePublicId,
                        gender: row.gender,
                        dateOfJoining: normalizedDateOfJoining,
                        professionalExperienceYears: row.professionalExperienceYears ?? null,
                    });

                    if (!userRes.success || !userRes.data)
                        throw new Error(userRes.error || "User DB insert failed");

                    createdUserId = userRes.data.userId;

                    await dispatchRoleHandler(
                        row,
                        createdUserId!,
                        { ...adminContext, collegeEducationId, collegeEducationType },
                        dbData,
                        sessionOptions,
                        timestamp,
                    );

                    const normalizedRole = String(row.role)
                        .replace(/[\s_\-]/g, "")
                        .toLowerCase();

                    const isWellbeing =
                        normalizedRole === "wellbeingmanager";

                    
                    if (row.identifierValue && !isWellbeing) {
                        await upsertIdentifier({
                            userId: createdUserId,
                            studentId: row.role === "Student" ? (row as any).__studentId : undefined,
                            collegeId: adminContext.collegeId,
                            role: row.role,
                            identifierValue: row.identifierValue,
                        });
                    }

                    rowResults.push({
                        rowIndex: index + 2,
                        email: row.email,
                        role: row.role,
                        status: "success",
                    });
                } catch (e: any) {
                    if (createdUserId) {
                        await supabase.from("users").delete().eq("userId", createdUserId);
                    }
                    if (createdAuthId) {
                        const { data: { session } } = await supabase.auth.getSession();
                        await fetch("/api/admin/create-auth-user", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${session?.access_token}`,
                            },
                            body: JSON.stringify({ action: "delete", authId: createdAuthId }),
                        });
                    }

                    let reason = "Unknown error";
                    if (e?.message) {
                        const msg = e.message.toLowerCase();
                        if (msg.includes("email")) reason = "Email already registered";
                        else if (msg.includes("mobile")) reason = "Mobile already in use";
                        else if (msg.includes("duplicate")) reason = "Duplicate entry";
                        else reason = e.message;
                    }

                    rowResults.push({
                        rowIndex: index + 2,
                        email: row.email,
                        role: row.role,
                        status: "skipped",
                        reason,
                    });
                }
            },
            (completed) => {
                setProgress(Math.round((completed / validRows.length) * 100));
            },
        );

        setResults(rowResults);
        setStep("summary");
    };

    if (!isOpen) return null;

    const successCount = results.filter((r) => r.status === "success").length;
    const skippedCount =
        results.filter((r) => r.status === "skipped").length +
        preValidationErrors.length;

    return (
        <>
            <Toaster position="top-right" />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
                <div className="bg-white text-black w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-2">
                            {step !== "upload" && step !== "processing" && (
                                <button
                                    onClick={() =>
                                        setStep(step === "summary" ? "preview" : "upload")
                                    }
                                    className="text-gray-400 hover:text-gray-600 transition-colors mr-1"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                            <h2 className="text-lg font-medium text-[#282828]">
                                {step === "upload" && "Bulk Registration"}
                                {step === "preview" && `Preview — ${parsedRows.length} rows`}
                                {step === "processing" && "Registering Users…"}
                                {step === "summary" && "Import Complete"}
                            </h2>
                        </div>
                        <X
                            size={20}
                            weight="bold"
                            className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                            onClick={handleClose}
                        />
                    </div>

                    <div className="flex gap-0 px-6 py-3 border-b border-gray-50 shrink-0">
                        {(["upload", "preview", "processing", "summary"] as Step[]).map(
                            (s, i) => {
                                const stepIndex = [
                                    "upload",
                                    "preview",
                                    "processing",
                                    "summary",
                                ].indexOf(step);
                                const isActive = s === step;
                                const isPast = i < stepIndex;
                                return (
                                    <React.Fragment key={s}>
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${isActive
                                                    ? "bg-[#43C17A] text-white"
                                                    : isPast
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-gray-100 text-gray-400"
                                                    }`}
                                            >
                                                {isPast ? "✓" : i + 1}
                                            </div>
                                            <span
                                                className={`text-[11px] font-medium capitalize ${isActive
                                                    ? "text-[#43C17A]"
                                                    : isPast
                                                        ? "text-green-500"
                                                        : "text-gray-400"
                                                    }`}
                                            >
                                                {s}
                                            </span>
                                        </div>
                                        {i < 3 && (
                                            <div
                                                className={`flex-1 h-px my-auto mx-2 ${isPast ? "bg-green-200" : "bg-gray-100"}`}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            },
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {step === "upload" && (
                            <div className="flex flex-col gap-5">
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${isDragging
                                        ? "border-[#43C17A] bg-green-50"
                                        : "border-gray-200 hover:border-[#43C17A] hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                                        <UploadSimple size={26} className="text-[#43C17A]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-[#282828]">
                                            Drop your Excel file here
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            .xlsx, .xls, or .csv supported
                                        </p>
                                    </div>
                                    <span className="text-xs text-[#43C17A] font-medium border border-[#43C17A] rounded-md px-3 py-1 hover:bg-green-50 transition-all">
                                        Browse File
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleFileAccepted(f);
                                        }}
                                    />
                                </div>

                                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <FileCsv size={22} className="text-green-500" />
                                        <div>
                                            <p className="text-xs font-semibold text-[#282828]">
                                                Download Template
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                Pre-formatted Excel with all columns + sample row
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={downloadTemplate}
                                        className="flex items-center gap-1.5 text-xs text-[#43C17A] border border-[#43C17A] rounded-md px-3 py-1.5 hover:bg-green-50 transition-all font-medium"
                                    >
                                        <DownloadSimple size={14} />
                                        Download
                                    </button>
                                </div>

                                <div className="rounded-lg border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Column Reference
                                        </p>
                                    </div>
                                    <div className="p-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                                        {[
                                            ["fullName", "All roles"],
                                            ["email", "All roles"],
                                            ["mobileCode", "All (default +91)"],
                                            ["mobileNumber", "All except Wellbeing"],
                                            ["role", "All — see valid values →"],
                                            ["gender", "Male / Female"],
                                            ["password", "Min 8 chars e.g. Pass@123"],
                                            ["identifierValue", "Employee ID / Roll No"],
                                            ["dateOfJoining", "Non-student/parent"],
                                            ["professionalExperienceYears", "Non-student/parent"],
                                            ["educationType", "Faculty, Student, Finance, Admin"],
                                            ["branchCode", "Faculty, Student"],
                                            ["year", "Faculty, Student"],
                                            ["semester", "Student"],
                                            ["section", "Faculty (comma sep), Student"],
                                            ["subject", "Faculty (comma sep)"],
                                            ["entryType", "Student"],
                                            ["batch", "Student (optional)"],
                                            ["sessionLabel", "Student"],
                                            ["studentId", "Parent"],
                                            ["wellbeingType", "Hostel / College / both"],
                                        ].map(([col, desc]) => (
                                            <div key={col} className="flex gap-2">
                                                <code className="text-[#43C17A] font-mono shrink-0">
                                                    {col}
                                                </code>
                                                <span className="text-gray-400">{desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
                                        <p className="text-[11px] text-blue-600 font-medium">
                                            Valid roles:{" "}
                                            {ROLE_OPTIONS.join(" · ")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === "preview" && (
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-4 py-2">
                                        <CheckCircle
                                            size={18}
                                            weight="fill"
                                            className="text-green-500"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-green-700">
                                                {validRows.length}
                                            </p>
                                            <p className="text-[11px] text-green-500">Valid rows</p>
                                        </div>
                                    </div>
                                    {preValidationErrors.length > 0 && (
                                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                                            <XCircle
                                                size={18}
                                                weight="fill"
                                                className="text-red-400"
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-red-600">
                                                    {preValidationErrors.length}
                                                </p>
                                                <p className="text-[11px] text-red-400">
                                                    Will be skipped
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 ml-auto">
                                        <FileCsv size={18} className="text-gray-400" />
                                        <p className="text-xs text-gray-500 font-medium truncate max-w-[160px]">
                                            {file?.name}
                                        </p>
                                    </div>
                                </div>

                                {columnMapping.length > 0 && (
                                    <div className="rounded-lg border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Column Mapping
                                            </p>
                                            <div className="flex items-center gap-3 text-[10px]">
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                                                    {columnMapping.filter((m) => m.mapped).length} recognized
                                                </span>
                                                {columnMapping.filter((m) => !m.mapped).length > 0 && (
                                                    <span className="flex items-center gap-1 text-red-400">
                                                        <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                                                        {columnMapping.filter((m) => !m.mapped).length} ignored
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto max-h-36">
                                            <table className="w-full text-xs">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="text-left px-3 py-2 text-gray-400 font-semibold">Your Column</th>
                                                        <th className="text-left px-3 py-2 text-gray-400 font-semibold">Mapped To</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {columnMapping.map((m, i) => (
                                                        <tr key={i} className="border-b border-gray-50">
                                                            <td className="px-3 py-1.5 font-mono text-[11px] text-gray-600">{m.raw}</td>
                                                            <td className="px-3 py-1.5">
                                                                {m.mapped ? (
                                                                    <span className="flex items-center gap-1.5">
                                                                        <span className="text-green-500 text-[10px]">✓</span>
                                                                        <code className="text-[#43C17A] font-mono text-[11px]">{m.mapped}</code>
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1.5">
                                                                        <span className="text-red-400 text-[10px]">✗</span>
                                                                        <span className="text-red-400 text-[11px]">Not recognized — ignored</span>
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {validRows.length > 0 && (
                                    <div className="rounded-lg border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Valid Rows — will be registered
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto max-h-48">
                                            <table className="w-full text-xs">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        {["#", "Name", "Email", "Role", "Gender"].map(
                                                            (h) => (
                                                                <th
                                                                    key={h}
                                                                    className="text-left px-3 py-2 text-gray-400 font-semibold"
                                                                >
                                                                    {h}
                                                                </th>
                                                            ),
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {validRows.map((row, i) => (
                                                        <tr
                                                            key={i}
                                                            className="border-b border-gray-50 hover:bg-gray-50/50"
                                                        >
                                                            <td className="px-3 py-2 text-gray-400">
                                                                {i + 2}
                                                            </td>
                                                            <td className="px-3 py-2 font-medium text-[#282828]">
                                                                {row.fullName}
                                                            </td>
                                                            <td className="px-3 py-2 text-gray-500">
                                                                {row.email}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                                                    {row.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-gray-500">
                                                                {row.gender}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {preValidationErrors.length > 0 && (
                                    <div className="rounded-lg border border-red-100 overflow-hidden">
                                        <div className="bg-red-50 px-4 py-2 border-b border-red-100">
                                            <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                                                Skipped Rows — validation failed
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto max-h-40">
                                            <table className="w-full text-xs">
                                                <thead className="bg-red-50 border-b border-red-100">
                                                    <tr>
                                                        {["Row", "Email", "Role", "Reason"].map((h) => (
                                                            <th
                                                                key={h}
                                                                className="text-left px-3 py-2 text-red-300 font-semibold"
                                                            >
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preValidationErrors.map((err, i) => (
                                                        <tr
                                                            key={i}
                                                            className="border-b border-red-50 hover:bg-red-50/30"
                                                        >
                                                            <td className="px-3 py-2 text-red-400 font-bold">
                                                                {err.row}
                                                            </td>
                                                            <td className="px-3 py-2 text-gray-500">
                                                                {err.email}
                                                            </td>
                                                            <td className="px-3 py-2 text-gray-500">
                                                                {err.role}
                                                            </td>
                                                            <td className="px-3 py-2 text-red-500">
                                                                {err.reason}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {validRows.length === 0 && (
                                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                                        <Warning size={32} className="text-amber-400" />
                                        <p className="text-sm font-medium text-gray-600">
                                            No valid rows to import
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Fix the errors above and re-upload
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === "processing" && (
                            <div className="flex flex-col items-center justify-center gap-6 py-10">
                                <div className="relative w-20 h-20">
                                    <div className="w-20 h-20 rounded-full border-4 border-green-100 absolute" />
                                    <div
                                        className="w-20 h-20 rounded-full border-4 border-t-[#43C17A] border-r-transparent border-b-transparent border-l-transparent absolute animate-spin"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <UserPlus size={24} className="text-[#43C17A]" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-base font-semibold text-[#282828]">
                                        Registering users…
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Processing {validRows.length} rows · 3 at a time
                                    </p>
                                </div>
                                <div className="w-full max-w-sm">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#43C17A] rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 text-center mt-2">
                                        {Math.round((progress / 100) * validRows.length)} /{" "}
                                        {validRows.length} completed
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === "summary" && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex flex-col items-center gap-1 text-center">
                                        <CheckCircle
                                            size={32}
                                            weight="fill"
                                            className="text-green-500"
                                        />
                                        <p className="text-2xl font-bold text-green-700">
                                            {successCount}
                                        </p>
                                        <p className="text-xs text-green-500 font-medium">
                                            Registered Successfully
                                        </p>
                                    </div>
                                    <div
                                        className={`border rounded-xl p-5 flex flex-col items-center gap-1 text-center ${skippedCount > 0
                                            ? "bg-red-50 border-red-100"
                                            : "bg-gray-50 border-gray-100"
                                            }`}
                                    >
                                        <XCircle
                                            size={32}
                                            weight="fill"
                                            className={
                                                skippedCount > 0 ? "text-red-400" : "text-gray-300"
                                            }
                                        />
                                        <p
                                            className={`text-2xl font-bold ${skippedCount > 0 ? "text-red-600" : "text-gray-400"}`}
                                        >
                                            {skippedCount}
                                        </p>
                                        <p
                                            className={`text-xs font-medium ${skippedCount > 0 ? "text-red-400" : "text-gray-400"}`}
                                        >
                                            Skipped
                                        </p>
                                    </div>
                                </div>

                                {successCount > 0 && (
                                    <div className="rounded-lg border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Registered
                                            </p>
                                        </div>
                                        <div className="overflow-y-auto max-h-52">
                                            <table className="w-full text-xs">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        {["Row", "Email", "Role", "Status"].map((h) => (
                                                            <th
                                                                key={h}
                                                                className="text-left px-3 py-2 text-gray-400 font-semibold"
                                                            >
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {results
                                                        .filter((r) => r.status === "success")
                                                        .map((r, i) => (
                                                            <tr
                                                                key={i}
                                                                className="border-b border-gray-50 hover:bg-gray-50/50"
                                                            >
                                                                <td className="px-3 py-2 text-gray-400">
                                                                    {r.rowIndex}
                                                                </td>
                                                                <td className="px-3 py-2 text-gray-600">
                                                                    {r.email}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                                                        {r.role}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <span className="text-green-500 font-medium">
                                                                        ✓ Done
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {(results.filter((r) => r.status === "skipped").length > 0 ||
                                    preValidationErrors.length > 0) && (
                                        <div className="rounded-lg border border-red-100 overflow-hidden">
                                            <div className="bg-red-50 px-4 py-2 border-b border-red-100">
                                                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                                                    Skipped
                                                </p>
                                            </div>
                                            <div className="overflow-y-auto max-h-40">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-red-50 border-b border-red-100">
                                                        <tr>
                                                            {["Row", "Email", "Reason"].map((h) => (
                                                                <th
                                                                    key={h}
                                                                    className="text-left px-3 py-2 text-red-300 font-semibold"
                                                                >
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {preValidationErrors.map((err, i) => (
                                                            <tr key={`pre-${i}`} className="border-b border-red-50">
                                                                <td className="px-3 py-2 text-red-400 font-bold">
                                                                    {err.row}
                                                                </td>
                                                                <td className="px-3 py-2 text-gray-500">
                                                                    {err.email}
                                                                </td>
                                                                <td className="px-3 py-2 text-red-500">
                                                                    {err.reason}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {results
                                                            .filter((r) => r.status === "skipped")
                                                            .map((r, i) => (
                                                                <tr key={`run-${i}`} className="border-b border-red-50">
                                                                    <td className="px-3 py-2 text-red-400 font-bold">
                                                                        {r.rowIndex}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-gray-500">
                                                                        {r.email}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-red-500">
                                                                        {r.reason}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-50 flex gap-3 shrink-0 bg-white">
                        {step === "upload" && (
                            <button
                                onClick={handleClose}
                                className="flex-1 border border-gray-300 text-[#282828] text-sm font-medium py-1.5 rounded-md hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                        )}

                        {step === "preview" && (
                            <>
                                <button
                                    onClick={() => setStep("upload")}
                                    className="flex-1 border border-gray-300 text-[#282828] text-sm font-medium py-1.5 rounded-md hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    Re-upload
                                </button>
                                <button
                                    onClick={handleStartImport}
                                    disabled={validRows.length === 0}
                                    className="flex-1 bg-[#43C17A] hover:bg-[#3ea876] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-1.5 rounded-md transition-all cursor-pointer"
                                >
                                    Import {validRows.length} Users
                                </button>
                            </>
                        )}

                        {step === "processing" && (
                            <div className="flex-1 text-center text-xs text-gray-400 py-1">
                                Please don't close this window…
                            </div>
                        )}

                        {step === "summary" && (
                            <>
                                <button
                                    onClick={reset}
                                    className="flex-1 border border-gray-300 text-[#282828] text-sm font-medium py-1.5 rounded-md hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    Import Another File
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 bg-[#43C17A] hover:bg-[#3ea876] text-white text-sm font-medium py-1.5 rounded-md transition-all cursor-pointer"
                                >
                                    Done
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BulkUploadModal;
