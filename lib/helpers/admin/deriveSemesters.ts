export function deriveSemesters(
    educationType: string,
    academicYear: string
): number[] {
    let semestersPerYear = 2;

    switch (educationType.toLowerCase()) {
        case "mbbs":
            semestersPerYear = 1;
            break;

        case "b.tech":
        case "b.pharm":
        case "degree":
        case "diploma":
        case "b.arch":
        default:
            semestersPerYear = 2;
    }

    return Array.from(
        { length: semestersPerYear },
        (_, i) => i + 1
    );
}
