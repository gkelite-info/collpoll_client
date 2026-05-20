export interface RowResult {
    rowIndex: number;
    email: string;
    role: string;
    status: "success" | "skipped";
    reason?: string;
}

export type Step = "upload" | "preview" | "processing" | "summary";

export interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TEMPLATE_HEADERS = [
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

export type BulkRole =
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

export interface BulkRow {
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
    // student
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
    studentId?: number;
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

export const ROLE_OPTIONS: BulkRole[] = [
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