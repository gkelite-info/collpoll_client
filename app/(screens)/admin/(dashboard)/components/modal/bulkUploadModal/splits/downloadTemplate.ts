import * as XLSX from "xlsx";
import { TEMPLATE_HEADERS } from "./types";

export default function downloadTemplate() {
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