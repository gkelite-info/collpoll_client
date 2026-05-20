import * as XLSX from "xlsx";
import { BulkRole, BulkRow } from "./types";


export default function parseExcelToRows(file: File): Promise<BulkRow[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target!.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json: any[] = XLSX.utils.sheet_to_json(sheet, {
                    defval: "",
                    raw: false,
                });

                const rows: BulkRow[] = json.map((r) => ({
                    fullName: String(r.fullName || "").trim(),
                    email: String(r.email || "").trim().toLowerCase(),
                    mobileCode: String(r.mobileCode || "+91").trim(),
                    mobileNumber: String(r.mobileNumber || "").trim(),
                    role: String(r.role || "").trim() as BulkRole,
                    gender: String(r.gender || "").trim() as "Male" | "Female",
                    password: String(r.password || "").trim(),
                    identifierValue: String(r.identifierValue || "").trim().toUpperCase() || undefined,
                    dateOfJoining: String(r.dateOfJoining || "").trim() || undefined,
                    professionalExperienceYears: r.professionalExperienceYears
                        ? Number(r.professionalExperienceYears)
                        : undefined,
                    educationType: String(r.educationType || "").trim() || undefined,
                    branchCode: String(r.branchCode || "").trim() || undefined,
                    year: String(r.year || "").trim() || undefined,
                    semester: String(r.semester || "").trim() || undefined,
                    section: String(r.section || "").trim() || undefined,
                    subject: String(r.subject || "").trim() || undefined,
                    entryType: String(r.entryType || "").trim() || undefined,
                    batch: String(r.batch || "").trim() || undefined,
                    sessionLabel: String(r.sessionLabel || "").trim() || undefined,
                    studentId: r.studentId ? Number(r.studentId) : undefined,
                    wellbeingType: String(r.wellbeingType || "").trim() || undefined,
                    hostelBlock: String(r.hostelBlock || "").trim() || undefined,
                    buildingNumber: String(r.buildingNumber || "").trim() || undefined,
                    hostelType: String(r.hostelType || "").trim() || undefined,
                    wellbeingEducationType: String(r.wellbeingEducationType || "").trim() || undefined,
                    wellbeingBranch: String(r.wellbeingBranch || "").trim() || undefined,
                    wellbeingYear: String(r.wellbeingYear || "").trim() || undefined,
                    wellbeingSection: String(r.wellbeingSection || "").trim() || undefined,
                }));

                resolve(rows);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}