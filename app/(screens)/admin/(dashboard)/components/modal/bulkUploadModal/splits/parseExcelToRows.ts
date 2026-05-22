import * as XLSX from "xlsx";
import { BulkRole, BulkRow, COLUMN_ALIAS_MAP } from "./types";

export function normalizeColumnName(raw: string): string | null {
    const key = raw.toLowerCase().replace(/[\s_\-]/g, "");
    return COLUMN_ALIAS_MAP[key] ?? null;
}

function normalizeRow(raw: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};
    for (const [rawKey, value] of Object.entries(raw)) {
        const internalKey = normalizeColumnName(rawKey);
        if (internalKey) normalized[internalKey] = value;
    }
    return normalized;
}

function normalizeRole(role: string): {
    role: BulkRole;
    financeType?: "executive" | "manager";
} | null {

    const normalized = role
        .toLowerCase()
        .replace(/[\s_\-]/g, "");

    // ── Finance Manager ──
    if (
        [
            "financemanager",
            "accountsmanager",
            "financehead",
            "headoffinance",
        ].includes(normalized)
    ) {
        return {
            role: "FinanceManager",
        };
    }

    // ── Finance Executive ──
    if (
        [
            "finance",
            "financeexecutive",
            "accountant",
            "accounts",
            "financeofficer",
        ].includes(normalized)
    ) {
        return {
            role: "Finance",
        };
    }

    const ROLE_ALIAS_MAP: Record<string, BulkRole> = {
        admin: "Admin",
        administrator: "Admin",

        faculty: "Faculty",
        teacher: "Faculty",
        lecturer: "Faculty",
        professor: "Faculty",

        student: "Student",

        parent: "Parent",
        guardian: "Parent",

        hr: "CollegeHr",
        collegehr: "CollegeHr",
        humanresource: "CollegeHr",

        placement: "PlacementOfficer",
        placementofficer: "PlacementOfficer",
        tpo: "PlacementOfficer",

        wellbeingexecutive: "WellbeingExecutive",
        wellbeingmanager: "WellbeingManager",
    };

    const mappedRole = ROLE_ALIAS_MAP[normalized];

    if (!mappedRole) return null;

    return {
        role: mappedRole,
    };
}

function detectColumnMapping(
    rawHeaders: string[],
): { raw: string; mapped: string | null }[] {
    return rawHeaders.map((h) => ({ raw: h, mapped: normalizeColumnName(h) }));
}

function normalizeGender(
    gender: string
): "Male" | "Female" | null {

    const normalized = gender
        .toLowerCase()
        .trim();

    if (
        [
            "male",
            "m",
            "boy",
            "man",
        ].includes(normalized)
    ) {
        return "Male";
    }

    if (
        [
            "female",
            "f",
            "girl",
            "woman",
        ].includes(normalized)
    ) {
        return "Female";
    }

    return null;
}

export function parseExcelToRows(file: File): Promise<{ rows: BulkRow[]; columnMapping: { raw: string; mapped: string | null }[] }> {
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

                    const normalizedRoleData = normalizeRole(
                        String(r.role || "").trim()
                    );

                    if (!normalizedRoleData) {
                        throw new Error(
                            `Invalid role "${r.role}"`
                        );
                    }

                    return {
                        fullName: String(r.fullName || "").trim(),
                        email: String(r.email || "").trim().toLowerCase(),
                        mobileCode: (() => {
                            const raw = String(r.mobileCode || "91").trim();
                            return raw.startsWith("+") ? raw : `+${raw}`;
                        })(),
                        mobileNumber: String(r.mobileNumber || "").trim(),
                        // role: String(r.role || "").trim() as BulkRole,
                        // role: normalizedRoleData?.role as BulkRole,
                        role: normalizedRoleData.role,
                        // gender: String(r.gender || "").trim() as "Male" | "Female",
                        gender: normalizeGender(
                            String(r.gender || "").trim()
                        ) as "Male" | "Female",
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