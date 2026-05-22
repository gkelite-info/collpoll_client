import { BulkRow, ROLE_OPTIONS } from "./types";


const IDENTIFIER_REGEX = /^(?=.*\d)[A-Za-z0-9]+(?:-[A-Za-z0-9]+){0,2}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,}$/;


const validatePassword = (password: string) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
        return "password must contain one uppercase, one lowercase, one number and one special character.";
    }
    return null;
};

const validateIdentifier = (value: string) => {
    if (!value?.trim()) {
        return "is required.";
    }
    if (value.length < 6 || value.length > 15 || !IDENTIFIER_REGEX.test(value)) {
        return "must be 6-15 chars, include at least one number, letters/numbers/hyphens only.";
    }
    return null;
};


export default function validateRow(row: BulkRow, index: number): string | null {
    if (!row.fullName?.trim()) return `Row ${index}: fullName is required.`;
    if (!row.email?.trim()) return `Row ${index}: email is required.`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
        return `Row ${index}: Invalid email format.`;
    if (!row.role || !ROLE_OPTIONS.includes(row.role))
        return `Row ${index}: Invalid role "${row.role}". Must be one of: ${ROLE_OPTIONS.join(", ")}.`;
    if (!row.gender || !["Male", "Female"].includes(row.gender))
        return `Row ${index}: gender must be "Male" or "Female".`;
    if (!row.password?.trim()) return `Row ${index}: password is required.`;
    if (!PASSWORD_REGEX.test(row.password)) {
        return `Row ${index}: password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.`;
    }

    const normalizedRole = String(row.role)
        .replace(/[\s_\-]/g, "")
        .toLowerCase();

    const isWellbeing =
        normalizedRole === "wellbeingexecutive" ||
        normalizedRole === "wellbeingmanager";

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
