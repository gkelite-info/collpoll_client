import { WellbeingHostelType } from "@/lib/helpers/admin/registrations/wellbeing/wellbeingRegistration";

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

export interface BulkRow {
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

export const ROLE_OPTIONS: BulkRole[] = [
    "Admin",
    "Faculty",
    "Student",
    "Parent",
    "Finance",
    "FinanceManager",
    "CollegeHr",
    "PlacementOfficer",
    "WellbeingManager",
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
    | "WellbeingManager";

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


export default function normalizeHostelType(
    hostelType: string
): WellbeingHostelType | null {

    const normalized = hostelType
        .toLowerCase()
        .replace(/[\s_\-.]/g, "")
        .trim();

    if (
        [
            "boy",
            "boys",
            "boyhostel",
            "boyshostel",
            "male",
            "men",
            "mens",
            "menhostel",
            "menshostel",
        ].includes(normalized)
    ) {
        return "boyshostel";
    }

    if (
        [
            "girl",
            "girls",
            "girlhostel",
            "girlshostel",
            "female",
            "women",
            "womens",
            "womenhostel",
            "womenshostel",
        ].includes(normalized)
    ) {
        return "girlshostel";
    }

    return null;
}

export interface RowResult {
    rowIndex: number;
    email: string;
    role: string;
    status: "success" | "skipped";
    reason?: string;
}


export const COLUMN_ALIAS_MAP: Record<string, string> = (() => {
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
            const normalized = alias.toLowerCase().replace(/[\s_\-]/g, "");
            map[normalized] = internalKey;
        }
    }
    return map;
})();

export function formatDateOnly(dateValue: string) {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export const splitExcelValues = (value: unknown) =>
    String(value ?? "")
        .replace(/\band\b/gi, ",")
        .split(/[,+/&|]+/)
        .map((item) => item.trim())
        .filter(Boolean);

export const normalizeLookupValue = (value: unknown) =>
    String(value ?? "")
        .toLowerCase()
        .replace(/[\s_\-.]/g, "")
        .trim();

export const sameLookupValue = (left: unknown, right: unknown) =>
    normalizeLookupValue(left) === normalizeLookupValue(right);

export const sameAcademicYear = (left: unknown, right: unknown) => {
    if (sameLookupValue(left, right)) return true;

    const leftNumber = parseInt(String(left ?? ""), 10);
    const rightNumber = parseInt(String(right ?? ""), 10);

    return (
        Number.isFinite(leftNumber) &&
        Number.isFinite(rightNumber) &&
        leftNumber === rightNumber
    );
};