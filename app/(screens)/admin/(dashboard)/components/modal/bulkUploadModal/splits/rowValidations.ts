import { BulkRow, ROLE_OPTIONS } from "./types";


const IDENTIFIER_REGEX = /^(?=.*\d)[A-Za-z0-9]+(?:-[A-Za-z0-9]+){0,2}$/;

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
    const passwordError = validatePassword(row.password);
    if (passwordError) return `Row ${index}: ${passwordError}`;

    const isWellbeing =
        row.role === "WellbeingExecutive" || row.role === "WellbeingManager";
    const needsIdentifier = row.role !== "Parent";

    if (!isWellbeing) {
        if (!row.mobileCode || !/^\+[0-9]+$/.test(row.mobileCode)) {
            return `Row ${index}: Invalid country code format.`;
        }
        if (!row.mobileNumber?.trim())
            return `Row ${index}: mobileNumber is required for role "${row.role}".`;
        if (!/^[0-9]{10}$/.test(row.mobileNumber))
            return `Row ${index}: mobileNumber must be exactly 10 digits.`;
        if (row.mobileCode === "+91" && !["6", "7", "8", "9"].includes(row.mobileNumber.charAt(0))) {
            return `Row ${index}: Indian mobile number must start with 6, 7, 8, or 9.`;
        }
    } else {
        if (row.mobileNumber && !/^[0-9]{10}$/.test(row.mobileNumber)) {
            return `Row ${index}: mobileNumber must be exactly 10 digits.`;
        }
        if (row.mobileNumber && row.mobileCode && !/^\+[0-9]+$/.test(row.mobileCode)) {
            return `Row ${index}: Invalid country code format.`;
        }
        if (!row.dateOfJoining) return `Row ${index}: dateOfJoining required for ${row.role}.`;
        if (!row.wellbeingType) return `Row ${index}: wellbeingType required for ${row.role}.`;

        const registrationTypes = row.wellbeingType
            .split(",")
            .map((type) => type.trim())
            .filter(Boolean);

        const hasHostel = registrationTypes.includes("Hostel");
        const hasCollege = registrationTypes.includes("College");

        if (!hasHostel && !hasCollege) {
            return `Row ${index}: wellbeingType must include Hostel or College.`;
        }
        if (hasHostel && (!row.hostelBlock || !row.buildingNumber || !row.hostelType)) {
            return `Row ${index}: hostelBlock, buildingNumber and hostelType required for Hostel wellbeing registration.`;
        }
        if (
            hasCollege &&
            (!row.wellbeingEducationType ||
                !row.wellbeingBranch ||
                !row.wellbeingYear ||
                !row.wellbeingSection)
        ) {
            return `Row ${index}: Complete all college wellbeing registration fields.`;
        }
    }

    if (row.role === "Student") {
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

    if (row.role === "Parent") {
        if (!row.studentId) return `Row ${index}: studentId required for Parent.`;
    }

    if (needsIdentifier) {
        const identifierError = validateIdentifier(row.identifierValue || "");
        if (identifierError) return `Row ${index}: identifierValue ${identifierError}`;
    }

    return null;
}
