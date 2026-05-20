"use client";

import React, { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
    X,
    UploadSimple,
    FileCsv,
    CheckCircle,
    XCircle,
    Warning,
    ArrowLeft,
    DownloadSimple,
    SpinnerGap,
    UserPlus,
} from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

// ─── Helpers ────────────────────────────────────────────────────────────────
import { persistFaculty } from "@/lib/helpers/admin/upsertFaculty";
import { persistUser } from "@/lib/helpers/admin/registrations/persistUser";
import { upsertParentEntry } from "@/lib/helpers/parent/createParent";
import {
    createStudent,
    createStudentFeeObligation,
} from "@/lib/helpers/admin/registrations/student/studentRegistration";
import { createStudentAcademicHistory } from "@/lib/helpers/admin/registrations/student/academicHistoryRegistration";
import { createFinanceManager } from "@/lib/helpers/admin/registrations/finance/financeManagerRegistration";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import {
    upsertAdminEntry,
    upsertCollegeHR,
    upsertUser,
} from "@/lib/helpers/upsertUser";
import { createCollegeHR } from "@/lib/helpers/admin/registrations/collegeHr/hrRegistration";
import { upsertIdentifier } from "@/lib/helpers/identifiers/upsertIdentifier";
import { upsertPlacementEmployee } from "@/lib/helpers/admin/registrations/placement/placementregistration";
import { createWellbeing, WellbeingHostelType } from "@/lib/helpers/admin/registrations/wellbeing/wellbeingRegistration";
import { fetchModalInitialData } from "@/lib/helpers/admin/upsertFaculty";
import { fetchSessionOptions } from "@/lib/helpers/collegeSessionAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";

// ─── Types ───────────────────────────────────────────────────────────────────

type BulkRole =
    | "Admin"
    | "Faculty"
    | "Student"
    | "Parent"
    | "Finance"
    | "FinanceManager"
    | "CollegeHr"
    | "PlacementOfficer"
    | "WellbeingExecutive"
    | "WellbeingManager";

interface BulkRow {
    // universal
    fullName: string;
    email: string;
    mobileCode: string;
    mobileNumber: string;
    role: BulkRole;
    gender: "Male" | "Female";
    password: string;
    identifierValue?: string;
    dateOfJoining?: string;
    professionalExperienceYears?: number;
    // student / faculty
    educationType?: string;
    branchCode?: string;
    year?: string;
    semester?: string;
    section?: string;
    entryType?: string;
    batch?: string;
    sessionLabel?: string;
    // faculty (subject can be comma-separated for multiple subjects)
    subject?: string;
    // parent
    studentId?: string;
    // wellbeing
    wellbeingType?: string; // "Hostel" | "College" | "Hostel,College"
    hostelBlock?: string;
    buildingNumber?: string;
    hostelType?: string;
    wellbeingEducationType?: string;
    wellbeingBranch?: string;
    wellbeingYear?: string;
    wellbeingSection?: string;
}

interface RowResult {
    rowIndex: number;
    email: string;
    role: string;
    status: "success" | "skipped";
    reason?: string;
}

type Step = "upload" | "preview" | "processing" | "summary";

// ─── Constants ───────────────────────────────────────────────────────────────

const REQUIRED_COLUMNS = ["fullName", "email", "role", "gender", "password"];

const ROLE_OPTIONS: BulkRole[] = [
    "Admin",
    "Faculty",
    "Student",
    "Parent",
    "Finance",
    "FinanceManager",
    "CollegeHr",
    "PlacementOfficer",
    "WellbeingExecutive",
    "WellbeingManager",
];

const TEMPLATE_HEADERS = [
    "fullName",
    "email",
    "mobileCode",
    "mobileNumber",
    "role",
    "gender",
    "password",
    "identifierValue",
    "dateOfJoining",
    "professionalExperienceYears",
    "educationType",
    "branchCode",
    "year",
    "semester",
    "section",
    "subject",
    "entryType",
    "batch",
    "sessionLabel",
    "studentId",
    "wellbeingType",
    "hostelBlock",
    "buildingNumber",
    "hostelType",
    "wellbeingEducationType",
    "wellbeingBranch",
    "wellbeingYear",
    "wellbeingSection",
];

// ─── Validation ───────────────────────────────────────────────────────────────

const IDENTIFIER_REGEX = /^(?=.*\d)[A-Za-z0-9]+(?:-[A-Za-z0-9]+){0,2}$/;

function validateRow(row: BulkRow, index: number): string | null {
    if (!row.fullName?.trim()) return `Row ${index}: fullName is required.`;
    if (!row.email?.trim()) return `Row ${index}: email is required.`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
        return `Row ${index}: Invalid email format.`;
    if (!row.role || !ROLE_OPTIONS.includes(row.role))
        return `Row ${index}: Invalid role "${row.role}". Must be one of: ${ROLE_OPTIONS.join(", ")}.`;
    if (!row.gender || !["Male", "Female"].includes(row.gender))
        return `Row ${index}: gender must be "Male" or "Female".`;
    if (!row.password?.trim()) return `Row ${index}: password is required.`;
    if (row.password.length < 8)
        return `Row ${index}: password must be at least 8 characters.`;

    const isWellbeing =
        row.role === "WellbeingExecutive" || row.role === "WellbeingManager";

    if (!isWellbeing) {
        if (!row.mobileNumber?.trim())
            return `Row ${index}: mobileNumber is required for role "${row.role}".`;
        if (!/^[0-9]{10}$/.test(row.mobileNumber))
            return `Row ${index}: mobileNumber must be exactly 10 digits.`;
    }

    if ((row.role || "").trim() === "Student") {
        if (!row.branchCode) return `Row ${index}: branchCode required for Student.`;
        if (!row.year) return `Row ${index}: year required for Student.`;
        if (!row.section) return `Row ${index}: section required for Student.`;
        if (!row.entryType) return `Row ${index}: entryType required for Student.`;
    }

    if (row.role === "Faculty") {
        if (!row.branchCode) return `Row ${index}: branchCode required for Faculty.`;
        if (!row.year) return `Row ${index}: year required for Faculty.`;
        if (!row.subject) return `Row ${index}: subject required for Faculty.`;
        if (!row.section) return `Row ${index}: section required for Faculty.`;
    }

    if ((row.role || "").trim() === "Parent") {
        if (!row.studentId) return `Row ${index}: studentId required for Parent.`;
    }

    if (
        row.role !== "Student" &&
        row.role !== "Parent" &&
        row.identifierValue
    ) {
        if (
            row.identifierValue.length < 6 ||
            row.identifierValue.length > 15 ||
            !IDENTIFIER_REGEX.test(row.identifierValue)
        ) {
            return `Row ${index}: identifierValue must be 6–15 chars, include at least one number, letters/numbers/hyphens only.`;
        }
    }

    return null;
}

// ─── Excel Parser ─────────────────────────────────────────────────────────────

// ─── Column Normalization Engine ──────────────────────────────────────────────
//
// Maps ANY column name variant (case-insensitive, spaces/underscores/hyphens
// stripped) to the internal BulkRow key.
//
// How to add more aliases: just append to the array for that key.
// ─────────────────────────────────────────────────────────────────────────────

const COLUMN_ALIAS_MAP: Record<string, string> = (() => {
    // Each entry: [internalKey, ...aliases]
    // All values are lowercased + stripped of spaces/underscores/hyphens at match time.
    const definitions: [string, ...string[]][] = [
        // ── Universal ──
        ["fullName", "full name", "fullname", "name", "student name", "faculty name", "employee name", "staff name", "candidate name"],
        ["email", "email", "email id", "email address", "mail", "mail id", "emailid"],
        ["mobileCode", "mobile code", "mobilecode", "country code", "countrycode", "isd code", "isdcode", "phone code", "phonecode", "dial code", "dialcode"],
        ["mobileNumber", "mobile number", "mobilenumber", "mobile", "phone", "phone number", "phonenumber", "contact", "contact number", "contactnumber", "cell", "cell number", "cellnumber", "mob", "mob no", "mobno"],
        ["role", "role", "user role", "userrole", "designation", "type", "user type", "usertype", "account type", "accounttype"],
        ["gender", "gender", "sex", "gender identity"],
        ["password", "password", "pass", "passwd", "pwd", "login password", "loginpassword"],
        // ── Identity / Employment ──
        ["identifierValue", "identifier value", "identifiervalue", "identifier", "roll no", "rollno", "roll number", "rollnumber", "employee id", "employeeid", "emp id", "empid", "employee number", "employeenumber", "emp no", "empno", "staff id", "staffid", "id", "reg no", "regno", "registration number", "registrationnumber"],
        ["dateOfJoining", "date of joining", "dateofjoining", "joining date", "joiningdate", "doj", "start date", "startdate", "date joined", "datejoined"],
        ["professionalExperienceYears", "professional experience years", "professionalexperienceyears", "experience", "experience years", "experienceyears", "exp", "exp years", "expyears", "years of experience", "yearsofexperience", "work experience", "workexperience"],
        // ── Student / Faculty Academic ──
        ["educationType", "education type", "educationtype", "edu type", "edutype", "education", "degree", "degree type", "degreetype", "program type", "programtype", "course type", "coursetype", "level", "level type", "leveltype"],
        ["branchCode", "branch code", "branchcode", "branch", "department", "dept", "department code", "deptcode", "course", "course code", "coursecode", "program", "programme", "stream", "group", "group type", "grouptype", "group code", "groupcode"],
        ["year", "year", "academic year", "academicyear", "class", "class year", "classyear", "study year", "studyyear", "year of study", "yeaeofstudy"],
        ["semester", "semester", "sem", "sem no", "semno", "semester number", "semesternumber", "term"],
        ["section", "section", "sec", "class section", "classsection", "division", "div", "batch section", "batchsection"],
        ["subject", "subject", "sub", "subject name", "subjectname", "course name", "coursename", "paper", "paper name", "papername"],
        ["entryType", "entry type", "entrytype", "admission type", "admissiontype", "joining type", "joiningtype", "category", "intake type", "intaketype"],
        ["batch", "batch", "batch code", "batchcode", "batch name", "batchname", "set"],
        ["sessionLabel", "session label", "sessionlabel", "session", "academic session", "academicsession", "session period", "sessionperiod", "academic year session", "year session", "yearsession"],
        // ── Parent ──
        ["studentId", "student id", "studentid", "student number", "studentnumber", "ward id", "wardid", "child id", "childid", "ward student id"],
        // ── Wellbeing ──
        ["wellbeingType", "wellbeing type", "wellbeingtype", "registration type", "registrationtype", "wb type", "wbtype"],
        ["hostelBlock", "hostel block", "hostelblock", "block", "block name", "blockname", "hostel block name"],
        ["buildingNumber", "building number", "buildingnumber", "building no", "buildingno", "building", "building name", "buildingname", "floor", "room block"],
        ["hostelType", "hostel type", "hosteltype", "hostel category", "hostelcategory", "boys hostel", "girls hostel"],
        ["wellbeingEducationType", "wellbeing education type", "wellbeingeducationtype", "wb education type", "wb edu type", "wb education", "wb edu"],
        ["wellbeingBranch", "wellbeing branch", "wellbeingbranch", "wb branch", "wbbranch"],
        ["wellbeingYear", "wellbeing year", "wellbeingyear", "wb year", "wbyear"],
        ["wellbeingSection", "wellbeing section", "wellbeingsection", "wb section", "wbsection"],
    ];

    const map: Record<string, string> = {};
    for (const [internalKey, ...aliases] of definitions) {
        for (const alias of aliases) {
            // Normalize alias: lowercase, strip all spaces / underscores / hyphens
            const normalized = alias.toLowerCase().replace(/[\s_\-]/g, "");
            map[normalized] = internalKey;
        }
    }
    return map;
})();

/**
 * Normalize a raw column header from Excel to its internal BulkRow key.
 * Returns null if no match found.
 */
function normalizeColumnName(raw: string): string | null {
    const key = raw.toLowerCase().replace(/[\s_\-]/g, "");
    return COLUMN_ALIAS_MAP[key] ?? null;
}

/**
 * Takes a raw JSON row from XLSX (with whatever column names the user used)
 * and returns a new object keyed by internal BulkRow keys.
 * Unknown columns are silently dropped.
 */
function normalizeRow(raw: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};
    for (const [rawKey, value] of Object.entries(raw)) {
        const internalKey = normalizeColumnName(rawKey);
        if (internalKey) normalized[internalKey] = value;
    }
    return normalized;
}

/**
 * Returns a human-readable preview of how columns were mapped.
 * Used in the Preview step so admins can verify the mapping.
 */
function detectColumnMapping(
    rawHeaders: string[],
): { raw: string; mapped: string | null }[] {
    return rawHeaders.map((h) => ({ raw: h, mapped: normalizeColumnName(h) }));
}

// ─── Excel Parser (uses normalization engine) ─────────────────────────────────

function parseExcelToRows(file: File): Promise<{ rows: BulkRow[]; columnMapping: { raw: string; mapped: string | null }[] }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target!.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];

                // Get raw headers from first row for column mapping preview
                const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
                const rawHeaders = rawJson.length ? Object.keys(rawJson[0]) : [];
                const columnMapping = detectColumnMapping(rawHeaders);

                const rows: BulkRow[] = rawJson.map((rawRow) => {
                    const r = normalizeRow(rawRow); // ← all keys are now internal names

                    return {
                        fullName: String(r.fullName || "").trim(),
                        email: String(r.email || "").trim().toLowerCase(),
                        mobileCode: (() => {
                            const raw = String(r.mobileCode || "91").trim();
                            return raw.startsWith("+") ? raw : `+${raw}`;
                        })(),
                        mobileNumber: String(r.mobileNumber || "").trim(),
                        // role: String(r.role || "").trim() as BulkRole,
                        role: String(r.role || "")
                            .replace(/\s+/g, " ")
                            .trim() as BulkRole,
                        gender: String(r.gender || "").trim() as "Male" | "Female",
                        password: String(r.password || "").trim(),
                        identifierValue: String(r.identifierValue || "").trim().toUpperCase() || undefined,
                        dateOfJoining: String(r.dateOfJoining || "").trim() || undefined,
                        professionalExperienceYears: r.professionalExperienceYears ? Number(r.professionalExperienceYears) : undefined,
                        educationType: String(r.educationType || "").trim() || undefined,
                        branchCode: String(r.branchCode || "").trim() || undefined,
                        year: String(r.year || "").trim() || undefined,
                        semester: String(r.semester || "").trim() || undefined,
                        section: String(r.section || "").trim() || undefined,
                        subject: String(r.subject || "").trim() || undefined,
                        entryType: String(r.entryType || "").trim() || undefined,
                        batch: String(r.batch || "").trim() || undefined,
                        sessionLabel: String(r.sessionLabel || "").trim() || undefined,
                        // studentId: r.studentId ? Number(r.studentId) : undefined,
                        studentId: r.studentId
                            ? String(r.studentId).trim()
                            : undefined,
                        wellbeingType: String(r.wellbeingType || "").trim() || undefined,
                        hostelBlock: String(r.hostelBlock || "").trim() || undefined,
                        buildingNumber: String(r.buildingNumber || "").trim() || undefined,
                        hostelType: String(r.hostelType || "").trim() || undefined,
                        wellbeingEducationType: String(r.wellbeingEducationType || "").trim() || undefined,
                        wellbeingBranch: String(r.wellbeingBranch || "").trim() || undefined,
                        wellbeingYear: String(r.wellbeingYear || "").trim() || undefined,
                        wellbeingSection: String(r.wellbeingSection || "").trim() || undefined,
                    };
                });

                resolve({ rows, columnMapping });
            } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// ─── Template Download ────────────────────────────────────────────────────────

function downloadTemplate() {
    const sampleRows = [
        {
            fullName: "John Doe",
            email: "john@example.com",
            mobileCode: "+91",
            mobileNumber: "9876543210",
            role: "Student",
            gender: "Male",
            password: "Pass@123",
            identifierValue: "STU001",
            dateOfJoining: "",
            professionalExperienceYears: "",
            educationType: "B.Tech", branchCode: "CSE",
            year: "1st Year",
            semester: "1",
            section: "A",
            subject: "",
            entryType: "Regular",
            batch: "LU",
            sessionLabel: "2024-25",
            studentId: "",
            wellbeingType: "",
            hostelBlock: "",
            buildingNumber: "",
            hostelType: "",
            wellbeingEducationType: "",
            wellbeingBranch: "",
            wellbeingYear: "",
            wellbeingSection: "",
        },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: TEMPLATE_HEADERS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BulkUsers");
    XLSX.writeFile(wb, "bulk_registration_template.xlsx");
}

// ─── Role Dispatcher ──────────────────────────────────────────────────────────

async function dispatchRoleHandler(
    row: BulkRow,
    targetUserId: number,
    adminContext: any,
    dbData: any,
    sessionOptions: any[],
    timestamp: string,
) {
    const isWellbeing =
        row.role === "WellbeingExecutive" || row.role === "WellbeingManager";

    // ── Finance ──
    if (row.role === "Finance" || row.role === "FinanceManager") {
        await createFinanceManager({
            userId: targetUserId,
            collegeId: adminContext.collegeId,
            collegeEducationId: adminContext.collegeEducationId,
            createdBy: adminContext.adminId,
            type: row.role === "FinanceManager" ? "manager" : "executive",
            isActive: true,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        return;
    }

    // ── College HR ──
    if (row.role === "CollegeHr") {
        await upsertCollegeHR({
            userId: targetUserId,
            collegeId: adminContext.collegeId,
            createdBy: adminContext.adminId,
            isActive: true,
        });
        return;
    }

    // ── Placement Officer ──
    if (row.role === "PlacementOfficer") {
        await upsertPlacementEmployee({
            userId: targetUserId,
            collegeId: adminContext.collegeId,
            createdBy: adminContext.adminId,
        });
        return;
    }

    // ── Admin ──
    if (row.role === "Admin") {
        await upsertAdminEntry({
            userId: targetUserId,
            fullName: row.fullName,
            email: row.email,
            collegeEducationId: adminContext.collegeEducationId,
            mobile: `${row.mobileCode}${row.mobileNumber}`,
            gender: row.gender,
            collegeId: adminContext.collegePublicId,
            collegePublicId: adminContext.collegePublicId,
            collegeCode: adminContext.collegeCode,
        });
        return;
    }

    // ── Parent ──
    if (row.role === "Parent") {

        const pinNumber = String(row.studentId).trim();

        const { data: studentPinData, error: studentPinError } = await supabase
            .from("student_pins")
            .select("studentId")
            .eq("pinNumber", pinNumber)
            .eq("collegeId", adminContext.collegeId)
            .single();

        if (studentPinError || !studentPinData) {
            throw new Error(
                `Student not found for pinNumber "${pinNumber}"`
            );
        }

        await upsertParentEntry({
            userId: targetUserId,
            studentId: studentPinData.studentId,
            collegeId: adminContext.collegeId,
            createdBy: adminContext.adminId,
        });
        return;
    }

    // ── Faculty ──
    if (row.role === "Faculty") {
        const education = dbData.educations.find(
            (e: any) => e.collegeEducationType === adminContext.collegeEducationType,
        );
        const branch = dbData.branches.find(
            (b: any) =>
                b.collegeBranchCode === row.branchCode &&
                b.collegeEducationId === education?.collegeEducationId,
        );
        const year = dbData.years.find(
            (y: any) =>
                y.collegeAcademicYear === row.year &&
                y.collegeBranchId === branch?.collegeBranchId,
        );

        const subjectCodes = row.subject
            ? row.subject.split(",").map((s) => s.trim())
            : [];

        for (const subjectCode of subjectCodes) {

            const subject = dbData.subjects.find(
                (s: any) =>
                    s.subjectCode.toLowerCase() === subjectCode.toLowerCase() &&
                    s.collegeAcademicYearId === year?.collegeAcademicYearId,
            );

            // const sectionNames = row.section
            //     ? row.section.split(",").map((s) => s.trim())
            //     : [];

            // const sectionIds = dbData.sections
            //     .filter(
            //         (s: any) =>
            //             s.collegeAcademicYearId === year?.collegeAcademicYearId &&
            //             sectionNames.includes(s.collegeSections),
            //     )
            //     .map((s: any) => s.collegeSectionsId);

            const sectionNames = row.section
                ? row.section.split(",").map((s) => s.trim())
                : [];

            const sectionIds = dbData.sections
                .filter((s: any) => {

                    // Section must belong to same academic year
                    if (s.collegeAcademicYearId !== year?.collegeAcademicYearId) {
                        return false;
                    }

                    // Match section name
                    if (!sectionNames.includes(s.collegeSections)) {
                        return false;
                    }

                    // Extra safety:
                    // Verify academic year belongs to same branch
                    const matchedYear = dbData.years.find(
                        (y: any) =>
                            y.collegeAcademicYearId === s.collegeAcademicYearId
                    );

                    if (
                        !matchedYear ||
                        matchedYear.collegeBranchId !== branch?.collegeBranchId
                    ) {
                        return false;
                    }

                    // Extra safety:
                    // Verify branch belongs to same education
                    const matchedBranch = dbData.branches.find(
                        (b: any) =>
                            b.collegeBranchId === matchedYear.collegeBranchId
                    );

                    if (
                        !matchedBranch ||
                        matchedBranch.collegeEducationId !== education?.collegeEducationId
                    ) {
                        return false;
                    }

                    return true;
                })
                .map((s: any) => s.collegeSectionsId);

            if (!education || !branch || !year || !subject) {
                throw new Error(
                    `Faculty academic data not found (branch: ${row.branchCode}, year: ${row.year}, subjectCode: ${subjectCode})`,
                );
            }

            await persistFaculty(
                targetUserId,
                {
                    collegePublicId: adminContext.collegePublicId,
                    collegeIntId: adminContext.collegeId,
                    collegeCode: adminContext.collegeCode,
                    adminId: adminContext.adminId,
                    fullName: row.fullName,
                    email: row.email,
                    mobileCode: row.mobileCode,
                    mobileNumber: row.mobileNumber,
                    gender: row.gender,
                    role: "Faculty",
                    identifierValue: row.identifierValue ?? "",
                },
                {
                    educationId: education.collegeEducationId,
                    branchId: branch.collegeBranchId,
                    yearId: year.collegeAcademicYearId,
                    subjectId: subject.collegeSubjectId,
                    sectionIds,
                },
                timestamp,
                false,
            );
        }
        return;
    }

    // ── Student ──
    if (row.role === "Student") {
        const education = dbData.educations.find(
            (e: any) => e.collegeEducationId === adminContext.collegeEducationId,
        );
        const branch = dbData.branches.find(
            (b: any) =>
                b.collegeBranchCode === row.branchCode &&
                b.collegeEducationId === education?.collegeEducationId,
        );
        const year = dbData.years.find(
            (y: any) =>
                y.collegeAcademicYear === row.year &&
                y.collegeBranchId === branch?.collegeBranchId,
        );
        const semester = row.semester
            ? dbData.semesters.find(
                (s: any) =>
                    s.collegeSemester.toString() === row.semester &&
                    s.collegeAcademicYearId === year?.collegeAcademicYearId,
            )
            : null;
        const section = dbData.sections.find(
            (s: any) =>
                s.collegeSections === row.section &&
                s.collegeAcademicYearId === year?.collegeAcademicYearId,
        );
        const session = sessionOptions.find((s) => s.label === row.sessionLabel);

        if (!education || !branch || !year || !section) {
            throw new Error(
                `Student academic data not found (branch: ${row.branchCode}, year: ${row.year}, section: ${row.section})`,
            );
        }

        const studentId = await createStudent(
            {
                userId: targetUserId,
                collegeEducationId: education.collegeEducationId,
                collegeBranchId: branch.collegeBranchId,
                collegeId: adminContext.collegeId,
                collegeSessionId: session?.id ?? null,
                createdBy: adminContext.adminId,
                entryType: row.entryType as any,
                status: "Active",
                batch: row.batch || null,
            },
            timestamp,
        );

        await createStudentAcademicHistory({
            studentId,
            collegeAcademicYearId: year.collegeAcademicYearId,
            collegeSemesterId: semester?.collegeSemesterId ?? null,
            collegeSectionsId: section.collegeSectionsId,
            promotedBy: adminContext.adminId,
            createdAt: timestamp,
            updatedAt: timestamp,
            isCurrent: true,
        });

        if (session?.id) {
            await createStudentFeeObligation(
                {
                    studentId,
                    collegeSessionId: session.id,
                    collegeAcademicYearId: year.collegeAcademicYearId,
                    collegeEducationId: education.collegeEducationId,
                    collegeBranchId: branch.collegeBranchId,
                    createdBy: adminContext.adminId,
                },
                timestamp,
            );
        }

        // Store studentId on row for identifier upsert later
        (row as any).__studentId = studentId;
        return;
    }

    // ── Wellbeing ──
    if (isWellbeing) {
        const registrationTypes = (row.wellbeingType || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const isHostel = registrationTypes.includes("Hostel");
        const isCollege = registrationTypes.includes("College");

        let collegeDetails: any[] = [];

        if (isCollege && row.wellbeingEducationType && row.wellbeingBranch && row.wellbeingYear && row.wellbeingSection) {
            const eduTypes = row.wellbeingEducationType.split(",").map((t) => t.trim());
            const branchCodes = row.wellbeingBranch.split(",").map((t) => t.trim());
            const years = row.wellbeingYear.split(",").map((t) => t.trim());
            const sections = row.wellbeingSection.split(",").map((t) => t.trim());

            for (const eduType of eduTypes) {
                const edu = dbData.educations.find(
                    (e: any) => e.collegeEducationType === eduType,
                );
                if (!edu) continue;
                for (const branchCode of branchCodes) {
                    const branch = dbData.branches.find(
                        (b: any) =>
                            b.collegeBranchCode === branchCode &&
                            b.collegeEducationId === edu.collegeEducationId,
                    );
                    if (!branch) continue;
                    for (const year of years) {
                        const yearRow = dbData.years.find(
                            (y: any) =>
                                y.collegeAcademicYear === year &&
                                y.collegeBranchId === branch.collegeBranchId,
                        );
                        if (!yearRow) continue;
                        for (const sectionName of sections) {
                            const sectionRow = dbData.sections.find(
                                (s: any) =>
                                    s.collegeSections === sectionName &&
                                    s.collegeAcademicYearId === yearRow.collegeAcademicYearId,
                            );
                            if (!sectionRow) continue;
                            collegeDetails.push({
                                collegeEducationId: edu.collegeEducationId,
                                collegeBranchId: branch.collegeBranchId,
                                collegeAcademicYearId: yearRow.collegeAcademicYearId,
                                collegeSectionsId: sectionRow.collegeSectionsId,
                            });
                        }
                    }
                }
            }
        }

        await createWellbeing({
            userId: targetUserId,
            collegeId: adminContext.collegeId,
            roleType:
                row.role === "WellbeingManager"
                    ? "wellbeingManager"
                    : "wellbeingExecutive",
            gender: row.gender,
            employeeId: row.identifierValue ?? "",
            dateOfJoining: row.dateOfJoining ?? null,
            createdBy: adminContext.adminId,
            createdAt: timestamp,
            updatedAt: timestamp,
            collegeDetails,
            hostelDetails: isHostel
                ? {
                    block: row.hostelBlock ?? "",
                    buildingNumber: row.buildingNumber ?? "",
                    hostelType: (row.hostelType ?? "") as WellbeingHostelType,
                }
                : undefined,
        });
    }
}

// ─── Concurrency Queue ────────────────────────────────────────────────────────

async function processWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    handler: (item: T, index: number) => Promise<R>,
    onProgress: (completed: number) => void,
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let currentIndex = 0;
    let completed = 0;

    async function worker() {
        while (currentIndex < items.length) {
            const i = currentIndex++;
            results[i] = await handler(items[i], i);
            completed++;
            onProgress(completed);
        }
    }

    const workers = Array.from(
        { length: Math.min(concurrency, items.length) },
        () => worker(),
    );
    await Promise.all(workers);
    return results;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

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

    // ── File handling ──
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

            // Warn if any columns couldn't be mapped
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

    // ── Processing ──
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
                        ? new Date(row.dateOfJoining).toISOString().split("T")[0]
                        : null;

                    // ── Step 1: Invite auth user via secure API route
                    // The API route uses the service role key server-side.
                    // Supabase Admin createUser does not send email; inviteUserByEmail does.
                    const { data: { session } } = await supabase.auth.getSession();
                    const accessToken = session?.access_token;
                    if (!accessToken) throw new Error("No active session");

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
                            emailRedirectTo: `https://${adminContext.collegeCode?.toLowerCase()}.tektoncampus.com/`,
                        }),
                    });

                    // const createJson = await createRes.json();
                    // if (!createRes.ok)
                    //     throw new Error(createJson.error || "Auth user creation failed");

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

                    // ── Step 2: Insert into users table
                    const userRes = await upsertUser({
                        auth_id: createdAuthId,
                        fullName: row.fullName,
                        email: row.email,
                        mobile: `${mobileCode}${row.mobileNumber}`,
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

                    // ── Step 3: Role-specific handler
                    await dispatchRoleHandler(
                        row,
                        createdUserId!,
                        { ...adminContext, collegeEducationId, collegeEducationType },
                        dbData,
                        sessionOptions,
                        timestamp,
                    );

                    // ── Step 4: Identifier
                    const isWellbeing =
                        row.role === "WellbeingExecutive" ||
                        row.role === "WellbeingManager";
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
                    // Rollback: delete DB row first, then auth user via API route
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

    // ─────────────────────────────────────────────────────────────────────────────
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

                    {/* Step indicator */}
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

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {/* ── STEP 1: Upload ── */}
                        {step === "upload" && (
                            <div className="flex flex-col gap-5">
                                {/* Drop zone */}
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

                                {/* Template download */}
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

                                {/* Column guide */}
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

                        {/* ── STEP 2: Preview ── */}
                        {step === "preview" && (
                            <div className="flex flex-col gap-4">
                                {/* Summary chips */}
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

                                {/* Column mapping preview */}
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

                                {/* Valid rows table */}
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

                                {/* Invalid rows */}
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

                        {/* ── STEP 3: Processing ── */}
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

                        {/* ── STEP 4: Summary ── */}
                        {step === "summary" && (
                            <div className="flex flex-col gap-4">
                                {/* Big stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex flex-col items-center gap-1">
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
                                        className={`border rounded-xl p-5 flex flex-col items-center gap-1 ${skippedCount > 0
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

                                {/* Per-role breakdown */}
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

                                {/* Skipped rows */}
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

                    {/* Footer */}
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
