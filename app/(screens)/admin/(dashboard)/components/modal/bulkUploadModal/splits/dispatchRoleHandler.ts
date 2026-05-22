import { createFinanceManager } from "@/lib/helpers/admin/registrations/finance/financeManagerRegistration";
import { upsertAdminEntry, upsertCollegeHR } from "@/lib/helpers/upsertUser";
import { upsertPlacementEmployee } from "@/lib/helpers/admin/registrations/placement/placementregistration";
import { upsertParentEntry } from "@/lib/helpers/parent/createParent";
import { persistFaculty } from "@/lib/helpers/admin/upsertFaculty";
import { createStudent, createStudentFeeObligation } from "@/lib/helpers/admin/registrations/student/studentRegistration";
import { createStudentAcademicHistory } from "@/lib/helpers/admin/registrations/student/academicHistoryRegistration";
import { createWellbeing, WellbeingHostelType } from "@/lib/helpers/admin/registrations/wellbeing/wellbeingRegistration";
import normalizeHostelType, { BulkRow, normalizeLookupValue, sameAcademicYear, sameLookupValue, splitExcelValues } from "./types";
import { supabase } from "@/lib/supabaseClient";

export default async function dispatchRoleHandler(
    row: BulkRow,
    targetUserId: number,
    adminContext: any,
    dbData: any,
    sessionOptions: any[],
    timestamp: string,
) {
    const normalizedRole = row.role?.toLowerCase().replace(/[\s_\-]/g, "");
    const isWellbeing = normalizedRole === "wellbeingexecutive" || normalizedRole === "wellbeingmanager";

    // ── Finance ──
    if (row.role === "Finance" || row.role === "FinanceManager") {
        await createFinanceManager({
            userId: targetUserId,
            collegeId: adminContext.collegeId,
            collegeEducationId: adminContext.collegeEducationId,
            createdBy: adminContext.adminId,
            type: row.role === "FinanceManager"
                ? "manager"
                : "executive",
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

    if (isWellbeing) {

        const registrationTypes = splitExcelValues(row.wellbeingType)
            .map((t) => normalizeLookupValue(t))
            .filter(Boolean);

        const compactRegistrationType = normalizeLookupValue(row.wellbeingType);
        const isBoth =
            registrationTypes.includes("both") ||
            ["collegehostel", "hostelcollege"].includes(compactRegistrationType);
        const isHostel = isBoth || registrationTypes.includes("hostel");
        const isCollege = isBoth || registrationTypes.includes("college");

        const collegeDetails: any[] = [];

        const wellbeingEducationValue =
            row.wellbeingEducationType ||
            row.educationType ||
            adminContext.collegeEducationType;

        if (isCollege && wellbeingEducationValue && row.wellbeingBranch && row.wellbeingYear && row.wellbeingSection) {
            const eduTypes = splitExcelValues(wellbeingEducationValue);
            const branchCodes = splitExcelValues(row.wellbeingBranch);
            const years = splitExcelValues(row.wellbeingYear);
            const sections = splitExcelValues(row.wellbeingSection);

            for (const eduType of eduTypes) {
                const edu = dbData.educations.find(
                    (e: any) => sameLookupValue(e.collegeEducationType, eduType),
                );
                if (!edu) continue;
                for (const branchCode of branchCodes) {
                    const branch = dbData.branches.find(
                        (b: any) =>
                            sameLookupValue(b.collegeBranchCode, branchCode) &&
                            b.collegeEducationId === edu.collegeEducationId,
                    );
                    if (!branch) continue;
                    for (const year of years) {
                        const yearRow = dbData.years.find(
                            (y: any) =>
                                sameAcademicYear(y.collegeAcademicYear, year) &&
                                y.collegeBranchId === branch.collegeBranchId,
                        );
                        if (!yearRow) continue;
                        for (const sectionName of sections) {
                            // const sectionRow = dbData.sections.find(
                            //     (s: any) =>
                            //         s.collegeSections === sectionName &&
                            //         s.collegeAcademicYearId === yearRow.collegeAcademicYearId,
                            // );

                            const sectionRow = dbData.sections.find((s: any) => {

                                if (
                                    !sameLookupValue(s.collegeSections, sectionName) ||
                                    s.collegeAcademicYearId !== yearRow.collegeAcademicYearId
                                ) {
                                    return false;
                                }

                                const matchedYear = dbData.years.find(
                                    (y: any) =>
                                        y.collegeAcademicYearId === s.collegeAcademicYearId
                                );

                                if (
                                    !matchedYear ||
                                    matchedYear.collegeBranchId !== branch.collegeBranchId
                                ) {
                                    return false;
                                }

                                return true;
                            });

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

        const normalizedHostelType = isHostel ? normalizeHostelType(row.hostelType ?? "") : null;

        if (isHostel && !normalizedHostelType) {
            throw new Error(`Invalid hostelType "${row.hostelType}". Use: boys/girls/boyshostel/girlshostel`);
        }

        if (isCollege && collegeDetails.length === 0) {
            throw new Error(
                `No matching college details found for wellbeing registration. ` +
                `Check wellbeingEducationType="${wellbeingEducationValue}", ` +
                `wellbeingBranch="${row.wellbeingBranch}", wellbeingYear="${row.wellbeingYear}", ` +
                `wellbeingSection="${row.wellbeingSection}"`
            );
        }

        try {
            await createWellbeing({
                userId: targetUserId,
                collegeId: adminContext.collegeId,
                roleType: row.role === "WellbeingManager" ? "wellbeingManager" : "wellbeingExecutive",
                gender: row.gender,
                employeeId: row.identifierValue ?? "",
                dateOfJoining: row.dateOfJoining ?? null,
                createdBy: adminContext.adminId,
                createdAt: timestamp,
                updatedAt: timestamp,
                collegeDetails,
                hostelDetails: isHostel
                    ? { block: row.hostelBlock ?? "", buildingNumber: row.buildingNumber ?? "", hostelType: normalizedHostelType as WellbeingHostelType }
                    : undefined,
            });
        } catch (wellbeingError: any) {
            console.error("CREATE WELLBEING FAILED", { error: wellbeingError?.message, stack: wellbeingError?.stack });
            throw wellbeingError;
        }
        return;
    }

    console.error("NO ROLE HANDLER MATCHED", row.role, normalizedRole);
    throw new Error(`No handler for role "${row.role}"`);
}
