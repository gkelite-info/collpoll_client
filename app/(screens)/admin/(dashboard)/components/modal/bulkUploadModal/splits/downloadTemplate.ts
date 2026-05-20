import * as XLSX from "xlsx";
import { TEMPLATE_HEADERS } from "./types";


export default function downloadTemplate() {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Data entry ──
    const sampleRows = [
        // Student example
        {
            fullName: "Jane Student", email: "jane@college.com",
            mobileCode: "+91", mobileNumber: "9876543210",
            role: "Student", gender: "Female", password: "Pass@1234",
            identifierValue: "STU001",
            dateOfJoining: "", professionalExperienceYears: "",
            educationType: "btech",
            branchCode: "CSE", year: "1st Year", semester: "1",
            section: "A", subject: "", entryType: "Regular",
            batch: "LU", sessionLabel: "2024-25",
            studentId: "",
            wellbeingType: "", hostelBlock: "", buildingNumber: "",
            hostelType: "",
            wellbeingBranch: "", wellbeingYear: "", wellbeingSection: "",
        },
        // Faculty example
        {
            fullName: "John Faculty", email: "john@college.com",
            mobileCode: "+91", mobileNumber: "9123456780",
            role: "Faculty", gender: "Male", password: "Pass@1234",
            identifierValue: "FAC001",
            dateOfJoining: "2023-07-01", professionalExperienceYears: "5",
            educationType: "",
            branchCode: "CSE", year: "1st Year", semester: "",
            section: "A,B", subject: "Data Structures,Algorithms",
            entryType: "", batch: "", sessionLabel: "",
            studentId: "",
            wellbeingType: "", hostelBlock: "", buildingNumber: "",
            hostelType: "",
            wellbeingBranch: "", wellbeingYear: "", wellbeingSection: "",
        },
        // Admin example
        {
            fullName: "Alice Admin", email: "alice@college.com",
            mobileCode: "+91", mobileNumber: "9000000001",
            role: "Admin", gender: "Female", password: "Pass@1234",
            identifierValue: "ADM001",
            dateOfJoining: "2022-01-01", professionalExperienceYears: "8",
            educationType: "",
            branchCode: "", year: "", semester: "",
            section: "", subject: "", entryType: "", batch: "", sessionLabel: "",
            studentId: "",
            wellbeingType: "", hostelBlock: "", buildingNumber: "",
            hostelType: "",
            wellbeingBranch: "", wellbeingYear: "", wellbeingSection: "",
        },
        // Parent example
        {
            fullName: "Bob Parent", email: "bob@gmail.com",
            mobileCode: "+91", mobileNumber: "9000000002",
            role: "Parent", gender: "Male", password: "Pass@1234",
            identifierValue: "",
            dateOfJoining: "", professionalExperienceYears: "",
            educationType: "",
            branchCode: "", year: "", semester: "",
            section: "", subject: "", entryType: "", batch: "", sessionLabel: "",
            studentId: "1042",  // ← actual student's DB id
            wellbeingType: "", hostelBlock: "", buildingNumber: "",
            hostelType: "",
            wellbeingBranch: "", wellbeingYear: "", wellbeingSection: "",
        },
        // WellbeingExecutive (Hostel + College) example
        {
            fullName: "Sara Wellbeing", email: "sara@college.com",
            mobileCode: "", mobileNumber: "",   // ← not required for wellbeing
            role: "WellbeingExecutive", gender: "Female", password: "Pass@1234",
            identifierValue: "WB001",
            dateOfJoining: "2024-01-01", professionalExperienceYears: "",
            educationType: "btech",
            branchCode: "", year: "", semester: "",
            section: "", subject: "", entryType: "", batch: "", sessionLabel: "",
            studentId: "",
            wellbeingType: "both",
            hostelBlock: "A", buildingNumber: "101",
            hostelType: "girlshostel",wellbeingBranch: "CSE",
            wellbeingYear: "1st Year", wellbeingSection: "A",
        },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: TEMPLATE_HEADERS });

    ws["!cols"] = TEMPLATE_HEADERS.map((h) => ({
        wch: Math.max(h.length + 2, 18),
    }));

    XLSX.utils.book_append_sheet(wb, ws, "BulkUsers");

    const guide = [
        { column: "fullName", required_for: "All roles" },
        { column: "email", required_for: "All roles" },
        { column: "mobileCode", required_for: "All except WellbeingExecutive, WellbeingManager (default +91)" },
        { column: "mobileNumber", required_for: "All except WellbeingExecutive, WellbeingManager" },
        { column: "role", required_for: "All roles — Admin | Faculty | Student | Parent | Finance | FinanceManager | CollegeHr | PlacementOfficer | WellbeingExecutive | WellbeingManager" },
        { column: "gender", required_for: "All roles — Male | Female" },
        { column: "password", required_for: "All roles (min 8 chars)" },
        { column: "identifierValue", required_for: "Optional for Faculty/Admin/Finance/HR/Placement/Wellbeing. NOT used for Student (use identifierValue as roll no) or Parent." },
        { column: "dateOfJoining", required_for: "Faculty, Admin, Finance, FinanceManager, CollegeHr, PlacementOfficer, WellbeingExecutive, WellbeingManager" },
        { column: "professionalExperienceYears", required_for: "Faculty, Admin (optional)" },
        { column: "branchCode", required_for: "Faculty, Student — e.g. CSE, ECE" },
        { column: "year", required_for: "Faculty, Student — e.g. 1st Year" },
        { column: "semester", required_for: "Student only — e.g. 1" },
        { column: "section", required_for: "Faculty (comma-separated e.g. A,B), Student (single e.g. A)" },
        { column: "subject", required_for: "Faculty only — comma-separated e.g. Data Structures,Algorithms" },
        { column: "entryType", required_for: "Student only — Regular | Lateral | Transfer" },
        { column: "batch", required_for: "Student (optional) — e.g. LU" },
        { column: "sessionLabel", required_for: "Student (optional) — e.g. 2024-25" },
        { column: "studentId", required_for: "Parent only — the student's database userId" },
        { column: "wellbeingType", required_for: "WellbeingExecutive, WellbeingManager — hostel | college | both" },
        { column: "hostelBlock", required_for: "Wellbeing with hostelType — block name e.g. A" },
        { column: "buildingNumber", required_for: "Wellbeing with hostelType — e.g. 101" },
        { column: "hostelType", required_for: "Wellbeing with hostelType — boyshostel | girlshostel" },
        { column: "wellbeingEducationType", required_for: "Wellbeing with college assignment — e.g. UG" },
        { column: "wellbeingBranch", required_for: "Wellbeing with college assignment — e.g. CSE" },
        { column: "wellbeingYear", required_for: "Wellbeing with college assignment — e.g. 1st Year" },
        { column: "wellbeingSection", required_for: "Wellbeing with college assignment — e.g. A" },
    ];

    const wsGuide = XLSX.utils.json_to_sheet(guide, {
        header: ["column", "required_for"],
    });
    wsGuide["!cols"] = [{ wch: 30 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, "Column Guide");

    XLSX.writeFile(wb, "bulk_registration_template.xlsx");
}