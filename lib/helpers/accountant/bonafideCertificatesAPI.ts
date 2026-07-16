import { supabase } from "@/lib/supabaseClient";

export type BonafideCertificateStatus = "Issued" | "Draft";

export type BonafideCertificateRecord = {
  collegeBonafideId: number;
  collegeEducationId: number;
  studentId: number;
  bonafideNo: string;
  admissionNo: string;
  studentName: string;
  fatherName: string;
  rollNo: string;
  educationType: string;
  branch: string;
  courseYear: string;
  purpose: string;
  dateIssued: string;
  dateIssuedIso: string;
  academicYear: string;
  studentType: string;
  conduct: string;
  status: BonafideCertificateStatus;
};

type Related<T> = T | T[] | null | undefined;

type BonafideStudentRelation = {
  studentId: number;
  users?: Related<{ fullName?: string | null }>;
  college_branch?: Related<{ collegeBranchCode?: string | null }>;
  student_pins?: Related<{ pinNumber?: string | null }>;
  student_academic_history?: Array<{
    isCurrent: boolean | null;
    updatedAt: string | null;
    college_academic_year?: Related<{ collegeAcademicYear?: string | null }>;
  }> | null;
  parents?: Array<{
    isActive: boolean | null;
    is_deleted: boolean | null;
    deletedAt: string | null;
    users?: Related<{ fullName?: string | null }>;
  }> | null;
};

type BonafideRow = {
  collegeBonafideId: number;
  collegeEducationId: number;
  studentId: number;
  bonafideNo: string | null;
  dateIssued: string | null;
  academicYear: string | null;
  purpose: string | null;
  studentType: string | null;
  conduct: string | null;
  admissionNo: string | null;
  college_education?: Related<{ collegeEducationType?: string | null }>;
  students?: Related<BonafideStudentRelation>;
};

export type FetchBonafideCertificatesParams = {
  collegeId: number;
  academicYear?: string;
  search?: string;
  status?: "All" | "Issued" | "Draft";
  dateIssued?: string;
};

export type BonafideSummary = {
  total: number;
  issuedThisMonth: number;
  issuedToday: number;
  pendingDraft: number;
};

export type BonafideCertificatesResult = {
  certificates: BonafideCertificateRecord[];
  academicYears: string[];
  summary: BonafideSummary;
};

export type AccountantEducationTypeOption = {
  collegeEducationId: number;
  collegeEducationType: string;
};

export type BonafideStudentDetails = {
  studentId: number;
  rollNo: string;
  studentName: string;
  fatherName: string;
  course: string;
  subCourse: string;
  courseYear: string;
  batchCode: string;
};

export type CreateBonafideCertificatePayload = {
  collegeId: number;
  collegeEducationId: number;
  academicYear: string;
  studentId: number;
  bonafideNo: string;
  admissionNo?: string | null;
  dateIssued: string;
  purpose: string;
  studentType: string;
  conduct: string;
  issuedBy: number;
  isDraft?: boolean;
};

export type UpdateBonafideCertificatePayload =
  Omit<CreateBonafideCertificatePayload, "studentId"> & {
    collegeBonafideId: number;
    studentId?: number;
  };

const BONAFIDE_SELECT = `
  collegeBonafideId,
  collegeEducationId,
  studentId,
  bonafideNo,
  admissionNo,
  dateIssued,
  academicYear,
  purpose,
  studentType,
  conduct,
  college_education:collegeEducationId (
    collegeEducationType
  ),
  students:studentId (
    studentId,
    users:userId (
      fullName
    ),
    college_branch:collegeBranchId (
      collegeBranchCode
    ),
    student_academic_history (
      isCurrent,
      updatedAt,
      college_academic_year:collegeAcademicYearId (
        collegeAcademicYear
      )
    ),
    parents (
      isActive,
      is_deleted,
      deletedAt,
      users:userId (
        fullName
      )
    ),
    student_pins (
      pinNumber
    )
  )
`;

function getFirstRelated<T>(relation: Related<T>) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfMonthIso(date = new Date()) {
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

function getOrdinalYearLabel(yearNumber: number) {
  if (yearNumber <= 0) return "-";

  const suffix =
    yearNumber % 100 >= 11 && yearNumber % 100 <= 13
      ? "th"
      : yearNumber % 10 === 1
        ? "st"
        : yearNumber % 10 === 2
          ? "nd"
          : yearNumber % 10 === 3
            ? "rd"
            : "th";

  return `${yearNumber}${suffix} Year`;
}

function getAcademicYearStart(value?: string | null) {
  if (!value) return 0;

  const match = value.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function getCourseYearLabel(
  rows: Array<{
    isCurrent: boolean | null;
    updatedAt: string | null;
    college_academic_year?: Related<{ collegeAcademicYear?: string | null }>;
  }>,
) {
  const normalizedRows = rows
    .map((row) => ({
      ...row,
      academicYear: getFirstRelated(row.college_academic_year)?.collegeAcademicYear ?? null,
    }))
    .filter((row) => Boolean(row.academicYear));

  const currentRow =
    normalizedRows.find((row) => row.isCurrent) ??
    [...normalizedRows].sort((a, b) =>
      String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")),
    )[0];

  if (!currentRow?.academicYear) return "-";

  const sortedAcademicYears = Array.from(
    new Set(normalizedRows.map((row) => row.academicYear)),
  ).sort((a, b) => getAcademicYearStart(a) - getAcademicYearStart(b));

  return getOrdinalYearLabel(sortedAcademicYears.indexOf(currentRow.academicYear) + 1);
}

function getBonafideRowStudentId(row: BonafideRow) {
  return getFirstRelated(row.students)?.studentId ?? null;
}

function getEmbeddedParentName(student: BonafideStudentRelation | null | undefined) {
  const parent = (student?.parents ?? []).find(
    (item) => item.isActive !== false && !item.is_deleted && !item.deletedAt,
  );
  const parentUser = getFirstRelated(parent?.users);

  return parentUser?.fullName?.trim() || null;
}

type ParentNameRow = {
  studentId: number;
  users?: Related<{ fullName?: string | null }>;
};

async function fetchParentNamesByStudentId(
  collegeId: number,
  studentIds: number[],
) {
  if (!studentIds.length) return new Map<number, string>();

  const { data, error } = await supabase
    .from("parents")
    .select(
      `
      studentId,
      users:userId (
        fullName
      )
    `,
    )
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .in("studentId", studentIds)
    .returns<ParentNameRow[]>();

  if (error) throw error;

  return new Map(
    (data ?? [])
      .map((row) => {
        const user = getFirstRelated(row.users);
        return [row.studentId, user?.fullName?.trim() || ""] as const;
      })
      .filter(([, name]) => Boolean(name)),
  );
}

function mapBonafideRow(
  row: BonafideRow,
  parentNameByStudentId = new Map<number, string>(),
): BonafideCertificateRecord {
  const student = getFirstRelated(row.students);
  const user = getFirstRelated(student?.users);
  const branch = getFirstRelated(student?.college_branch);
  const pin = getFirstRelated(student?.student_pins);
  const education = getFirstRelated(row.college_education);
  const embeddedParentName = getEmbeddedParentName(student);
  const fallbackParentName = student?.studentId
    ? parentNameByStudentId.get(student.studentId)
    : null;

  const isExplicitDraft = row.bonafideNo?.startsWith('[DRAFT]');
  const actualBonafideNo = isExplicitDraft
    ? row.bonafideNo!.replace('[DRAFT]', '')
    : (row.bonafideNo ?? "-");

  return {
    collegeBonafideId: row.collegeBonafideId,
    collegeEducationId: row.collegeEducationId,
    studentId: row.studentId,
    bonafideNo: actualBonafideNo || "-",
    admissionNo: row.admissionNo ?? "-",
    studentName: user?.fullName?.trim() || `Student ${student?.studentId ?? ""}`.trim(),
    fatherName: embeddedParentName ?? fallbackParentName ?? "-",
    rollNo: pin?.pinNumber ?? "-",
    educationType: education?.collegeEducationType ?? "-",
    branch: branch?.collegeBranchCode ?? "-",
    courseYear: getCourseYearLabel(student?.student_academic_history ?? []),
    purpose: row.purpose ?? "-",
    dateIssued: formatDate(row.dateIssued),
    dateIssuedIso: row.dateIssued ?? "",
    academicYear: row.academicYear ?? "-",
    studentType: row.studentType ?? "-",
    conduct: row.conduct ?? "-",
    status: isExplicitDraft || (!actualBonafideNo && !row.dateIssued) ? "Draft" : "Issued",
  };
}

type CountDateFilter = {
  operator: "eq" | "gte";
  value: string;
};

async function getCount(collegeId: number, dateFilter?: CountDateFilter, status?: "Draft") {
  let query = supabase
    .from("college_bonafides")
    .select("collegeBonafideId", { count: "exact", head: true })
    .eq("collegeId", collegeId)
    .eq("is_deleted", false);

  if (dateFilter?.operator === "eq") {
    query = query.eq("dateIssued", dateFilter.value);
  }

  if (dateFilter?.operator === "gte") {
    query = query.gte("dateIssued", dateFilter.value);
  }

  if (status === "Draft") {
    query = query.or("bonafideNo.like.[DRAFT]*,bonafideNo.eq.\"\".trim(),bonafideNo.is.null,dateIssued.eq.\"\".trim(),dateIssued.is.null");
  }

  const { count, error } = await query;
  if (error) throw error;

  return count ?? 0;
}

export async function fetchBonafideCertificates({
  collegeId,
  academicYear,
  search,
  status,
  dateIssued,
}: FetchBonafideCertificatesParams): Promise<BonafideCertificatesResult> {
  if (!collegeId) {
    return {
      certificates: [],
      academicYears: [],
      summary: {
        total: 0,
        issuedThisMonth: 0,
        issuedToday: 0,
        pendingDraft: 0,
      },
    };
  }

  let query = supabase
    .from("college_bonafides")
    .select(BONAFIDE_SELECT)
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .order("dateIssued", { ascending: false })
    .order("collegeBonafideId", { ascending: false })
    .limit(200);

  if (academicYear && academicYear !== "All") {
    query = query.eq("academicYear", academicYear);
  }

  // Handle status filter
  if (status === "Draft") {
    query = query.or("bonafideNo.like.[DRAFT]*,bonafideNo.eq.\"\".trim(),bonafideNo.is.null,dateIssued.eq.\"\".trim(),dateIssued.is.null");
  } else if (status === "Issued") {
    query = query.not("bonafideNo", "like", "[DRAFT]*").not("bonafideNo", "in", "(\"\")").not("bonafideNo", "is", null).not("dateIssued", "in", "(\"\")").not("dateIssued", "is", null);
  }

  // Handle dateIssued filter
  if (dateIssued) {
    query = query.eq("dateIssued", dateIssued);
  }

  const [rowsResult, yearsResult, total, issuedThisMonth, issuedToday, pendingDraft] =
    await Promise.all([
      query.returns<BonafideRow[]>(),
      supabase
        .from("college_bonafides")
        .select("academicYear")
        .eq("collegeId", collegeId)
        .eq("is_deleted", false)
        .order("academicYear", { ascending: false })
        .returns<Array<{ academicYear: string | null }>>(),
      getCount(collegeId),
      getCount(collegeId, { operator: "gte", value: startOfMonthIso() }),
      getCount(collegeId, { operator: "eq", value: toIsoDate(new Date()) }),
      getCount(collegeId, undefined, "Draft"),
    ]);

  if (rowsResult.error) throw rowsResult.error;
  if (yearsResult.error) throw yearsResult.error;

  const academicYears = Array.from(
    new Set(
      (yearsResult.data ?? [])
        .map((row) => row.academicYear)
        .filter((year): year is string => Boolean(year)),
    ),
  );
  const rows = rowsResult.data ?? [];
  const parentNameByStudentId = await fetchParentNamesByStudentId(
    collegeId,
    Array.from(
      new Set(
        rows
          .map(getBonafideRowStudentId)
          .filter((studentId): studentId is number => Boolean(studentId)),
      ),
    ),
  );

  let certificates = rows.map((row) => mapBonafideRow(row, parentNameByStudentId));

  // Apply search filter in-memory for embedded properties like studentName since it's computed
  if (search && search.trim()) {
    const queryStr = search.trim().toLowerCase();
    certificates = certificates.filter((cert) =>
      cert.studentName.toLowerCase().includes(queryStr)
    );
  }

  return {
    certificates,
    academicYears,
    summary: {
      total,
      issuedThisMonth,
      issuedToday,
      pendingDraft,
    },
  };
}

export async function fetchAccountantEducationTypes(
  collegeId: number,
): Promise<AccountantEducationTypeOption[]> {
  if (!collegeId) return [];

  const { data, error } = await supabase
    .from("college_education")
    .select("collegeEducationId, collegeEducationType")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("collegeEducationType", { ascending: true })
    .returns<AccountantEducationTypeOption[]>();

  if (error) throw error;

  return data ?? [];
}

export async function fetchBonafideStudentByRollNo({
  collegeId,
  collegeEducationId,
  rollNo,
  studentName,
  courseYear,
}: {
  collegeId: number;
  collegeEducationId: number;
  rollNo?: string;
  studentName?: string;
  courseYear?: string;
}): Promise<BonafideStudentDetails | null> {
  if (!collegeId || !collegeEducationId || (!rollNo?.trim() && !studentName?.trim())) return null;

  let query = supabase
    .from("students")
    .select(
      `
      studentId,
      batch,
      collegeEducationId,
      users!inner (
        fullName
      ),
      student_pins!inner (
        pinNumber
      ),
      college_education:collegeEducationId (
        collegeEducationType
      ),
      college_branch:collegeBranchId (
        collegeBranchCode
      ),
      student_academic_history (
        isCurrent,
        updatedAt,
        college_academic_year:collegeAcademicYearId (
          collegeAcademicYear
        )
      ),
      parents (
        isActive,
        is_deleted,
        deletedAt,
        users:userId (
          fullName
        )
      )
    `,
    )
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .eq("status", "Active")
    .is("deletedAt", null);

  if (rollNo?.trim()) {
    query = query.eq("student_pins.pinNumber", rollNo.trim());
  }

  if (studentName?.trim()) {
    query = query.ilike("users.fullName", `%${studentName.trim()}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  if (!data || data.length === 0) return null;

  for (const rawStudent of data) {
    const studentUser = getFirstRelated(rawStudent.users);
    const pin = getFirstRelated(rawStudent.student_pins);
    const education = getFirstRelated(rawStudent.college_education);
    const branch = getFirstRelated(rawStudent.college_branch);
    const academicHistoryRows = rawStudent.student_academic_history ?? [];
    const parent = (rawStudent.parents ?? []).find(
      (item) => item.isActive !== false && !item.is_deleted && !item.deletedAt,
    );
    const parentUser = getFirstRelated(parent?.users);
    
    const computedCourseYear = getCourseYearLabel(academicHistoryRows);

    if (courseYear?.trim() && computedCourseYear !== courseYear.trim()) {
      continue;
    }

    return {
      studentId: rawStudent.studentId,
      rollNo: pin?.pinNumber ?? rollNo?.trim() ?? "-",
      studentName: studentUser?.fullName?.trim() || `Student ${rawStudent.studentId}`,
      fatherName: parentUser?.fullName?.trim() ?? "-",
      course: education?.collegeEducationType ?? "-",
      subCourse: branch?.collegeBranchCode ?? "-",
      courseYear: computedCourseYear,
      batchCode: rawStudent.batch ?? "-",
    };
  }

  return null;
}

export async function createBonafideCertificate(
  payload: CreateBonafideCertificatePayload,
) {
  const now = new Date().toISOString();

  const finalBonafideNo = payload.isDraft
    ? `[DRAFT]${payload.bonafideNo.trim()}`
    : payload.bonafideNo.trim();

  const { data, error } = await supabase
    .from("college_bonafides")
    .insert({
      collegeId: payload.collegeId,
      collegeEducationId: payload.collegeEducationId,
      academicYear: payload.academicYear,
      studentId: payload.studentId,
      bonafideNo: finalBonafideNo,
      admissionNo: payload.admissionNo?.trim() || null,
      dateIssued: payload.dateIssued,
      purpose: payload.purpose.trim(),
      studentType: payload.studentType.trim(),
      conduct: payload.conduct.trim(),
      issuedBy: payload.issuedBy,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .select("collegeBonafideId")
    .single<{ collegeBonafideId: number }>();

  if (error) throw error;

  return data;
}

export async function updateBonafideCertificate(
  payload: UpdateBonafideCertificatePayload,
) {
  const finalBonafideNo = payload.isDraft
    ? `[DRAFT]${payload.bonafideNo.trim()}`
    : payload.bonafideNo.trim();

  const values: {
    collegeId: number;
    collegeEducationId: number;
    academicYear: string;
    studentId?: number;
    bonafideNo: string;
    admissionNo: string | null;
    dateIssued: string;
    purpose: string;
    studentType: string;
    conduct: string;
    issuedBy: number;
    updatedAt: string;
  } = {
    collegeId: payload.collegeId,
    collegeEducationId: payload.collegeEducationId,
    academicYear: payload.academicYear,
    bonafideNo: finalBonafideNo,
    admissionNo: payload.admissionNo?.trim() || null,
    dateIssued: payload.dateIssued,
    purpose: payload.purpose.trim(),
    studentType: payload.studentType.trim(),
    conduct: payload.conduct.trim(),
    issuedBy: payload.issuedBy,
    updatedAt: new Date().toISOString(),
  };

  if (payload.studentId) {
    values.studentId = payload.studentId;
  }

  const { data, error } = await supabase
    .from("college_bonafides")
    .update(values)
    .eq("collegeBonafideId", payload.collegeBonafideId)
    .eq("collegeId", payload.collegeId)
    .eq("is_deleted", false)
    .select("collegeBonafideId")
    .single<{ collegeBonafideId: number }>();

  if (error) throw error;

  return data;
}

export async function deleteBonafideCertificate(collegeBonafideId: number) {
  const { error } = await supabase
    .from("college_bonafides")
    .update({ is_deleted: true })
    .eq("collegeBonafideId", collegeBonafideId);

  if (error) {
    throw error;
  }
}
