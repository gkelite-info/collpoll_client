import { createFinanceManager } from "@/lib/helpers/admin/registrations/finance/financeManagerRegistration";
import { upsertAdminEntry, upsertCollegeHR } from "@/lib/helpers/upsertUser";
import { upsertPlacementEmployee } from "@/lib/helpers/admin/registrations/placement/placementregistration";
import { upsertParentEntry } from "@/lib/helpers/parent/createParent";
import { persistFaculty } from "@/lib/helpers/admin/upsertFaculty";
import { createStudent, createStudentFeeObligation } from "@/lib/helpers/admin/registrations/student/studentRegistration";
import { createStudentAcademicHistory } from "@/lib/helpers/admin/registrations/student/academicHistoryRegistration";
import { createWellbeing, WellbeingHostelType } from "@/lib/helpers/admin/registrations/wellbeing/wellbeingRegistration";
import { BulkRow } from "./types";

export default async function dispatchRoleHandler(
    row: BulkRow,
    targetUserId: number,
    adminContext: any,
    dbData: any,
    sessionOptions: any[],
    timestamp: string,
) {
    const isWellbeing =
        row.role === "WellbeingExecutive" || row.role === "WellbeingManager";

    if (row.role === "Finance" || row.role === "FinanceManager") {
        await createFinanceManager({
            userId: targetUserId,
            collegeId: adminContext.collegeId,
            collegeEducationId: adminContext.collegeEducationId,
            createdBy: adminContext.adminId,
            type: row.role === "FinanceManager" ? "manager" : "executive",
            isActive: true,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        return;
    }

    if (row.role === "CollegeHr") {
        const hrRes = await upsertCollegeHR({
            userId: targetUserId,
            collegeId: adminContext.collegeId,
            createdBy: adminContext.adminId,
            isActive: true,
        });
        if (!hrRes.success) {
            throw new Error(hrRes.error?.message || "College HR creation failed");
        }
        return;
    }

    if (row.role === "PlacementOfficer") {
        const placementRes = await upsertPlacementEmployee({
            userId: targetUserId,
            collegeId: adminContext.collegeId,
            createdBy: adminContext.adminId,
        });
        if (!placementRes.success) {
            throw new Error(placementRes.error?.message || "Placement officer creation failed");
        }
        return;
    }

    if (row.role === "Admin") {
        const adminRes = await upsertAdminEntry({
            userId: targetUserId,
            fullName: row.fullName,
            email: row.email,
            collegeEducationId: adminContext.collegeEducationId,
            mobile: `${row.mobileCode}${row.mobileNumber}`,
            gender: row.gender,
            collegeId: adminContext.collegeId,
            collegePublicId: adminContext.collegePublicId,
            collegeCode: adminContext.collegeCode,
        });
        if (!adminRes.success) {
            throw new Error(adminRes.error || "Admin creation failed");
        }
        return;
    }

    if (row.role === "Parent") {
        const parentRes = await upsertParentEntry({
            userId: targetUserId,
            studentId: row.studentId!,
            collegeId: adminContext.collegeId,
            createdBy: adminContext.adminId,
        });
        if (!parentRes.success) {
            throw new Error(parentRes.error || "Parent creation failed");
        }
        return;
    }

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

        const subjectNames = row.subject
            ? row.subject.split(",").map((s) => s.trim())
            : [];

        for (const subjectName of subjectNames) {
            const subject = dbData.subjects.find(
                (s: any) =>
                    s.subjectName.toLowerCase() === subjectName.toLowerCase() &&
                    s.collegeAcademicYearId === year?.collegeAcademicYearId,
            );

            const sectionNames = row.section
                ? row.section.split(",").map((s) => s.trim())
                : [];
            const sectionIds = dbData.sections
                .filter(
                    (s: any) =>
                        s.collegeAcademicYearId === year?.collegeAcademicYearId &&
                        sectionNames.includes(s.collegeSections),
                )
                .map((s: any) => s.collegeSectionsId);

            if (!education || !branch || !year || !subject || sectionIds.length === 0) {
                throw new Error(
                    `Faculty academic data not found (branch: ${row.branchCode}, year: ${row.year}, subject: ${subjectName})`,
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
                    dateOfJoining: row.dateOfJoining ?? null,
                    professionalExperienceYears: row.professionalExperienceYears ?? null,
                    role: "Faculty"
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

        if (
            !education ||
            !branch ||
            !year ||
            !section ||
            (adminContext.collegeEducationType !== "Inter" && !semester)
        ) {
            throw new Error(
                `Student academic data not found (branch: ${row.branchCode}, year: ${row.year}, section: ${row.section})`,
            );
        }

        const studentId = await createStudent({
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
            collegeSemesterId: semester?.collegeSemesterId as number,
            collegeSectionsId: section.collegeSectionsId,
            promotedBy: adminContext.adminId,
            createdAt: timestamp,
            updatedAt: timestamp,
            isCurrent: true,
        });

        if (session?.id) {
            await createStudentFeeObligation({
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

        (row as any).__studentId = studentId;
        return;
    }

    if (isWellbeing) {
        const registrationTypes = (row.wellbeingType || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const isHostel = registrationTypes.includes("Hostel");
        const isCollege = registrationTypes.includes("College");

        let collegeDetails: any[] = [];

        if (isCollege && row.wellbeingEducationType && row.wellbeingBranch && row.wellbeingYear && row.wellbeingSection) {
            const eduTypes = row.wellbeingEducationType.split(",").map((t) => t.trim());
            const branchCodes = row.wellbeingBranch.split(",").map((t) => t.trim());
            const years = row.wellbeingYear.split(",").map((t) => t.trim());
            const sections = row.wellbeingSection.split(",").map((t) => t.trim());

            for (const eduType of eduTypes) {
                const edu = dbData.educations.find(
                    (e: any) => e.collegeEducationType === eduType,
                );
                if (!edu) continue;
                for (const branchCode of branchCodes) {
                    const branch = dbData.branches.find(
                        (b: any) =>
                            b.collegeBranchCode === branchCode &&
                            b.collegeEducationId === edu.collegeEducationId,
                    );
                    if (!branch) continue;
                    for (const year of years) {
                        const yearRow = dbData.years.find(
                            (y: any) =>
                                y.collegeAcademicYear === year &&
                                y.collegeBranchId === branch.collegeBranchId,
                        );
                        if (!yearRow) continue;
                        for (const sectionName of sections) {
                            const sectionRow = dbData.sections.find(
                                (s: any) =>
                                    s.collegeSections === sectionName &&
                                    s.collegeAcademicYearId === yearRow.collegeAcademicYearId,
                            );
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

        if (isCollege && !collegeDetails.length) {
            throw new Error("Invalid wellbeing college selection data");
        }

        await createWellbeing({
            userId: targetUserId,
            collegeId: adminContext.collegeId,
            roleType:
                row.role === "WellbeingManager"
                    ? "wellbeingManager"
                    : "wellbeingExecutive",
            gender: row.gender,
            employeeId: row.identifierValue ?? "",
            dateOfJoining: row.dateOfJoining ?? null,
            createdBy: adminContext.adminId,
            createdAt: timestamp,
            updatedAt: timestamp,
            collegeDetails,
            hostelDetails: isHostel
                ? {
                    block: row.hostelBlock ?? "",
                    buildingNumber: row.buildingNumber ?? "",
                    hostelType: row.hostelType as WellbeingHostelType,
                }
                : undefined,
        });
    }
}
