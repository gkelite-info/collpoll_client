import { supabase } from "@/lib/supabaseClient";

export type TransferCertificateStatus = "Generated" | "Draft" | "Saved";

export type TransferCertificateRecord = {
  collegeTcId: number;
  studentId: number;
  tcNo: string;
  rollNo: string;
  admissionNo: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  course: string;
  subCourse: string;
  courseYear: string;
  academicYear: string;
  batchCode: string;
  date: string;
  classAtLeaving: string;
  dateOfAdmission: string;
  dateOfLeaving: string;
  dateOfBirth: string;
  conductRemarks: string;
  reasonForLeaving: string;
  belongsToScStBc: string;
  receiptOfScholarship: string;
  otherRemarks?: string;
  status: TransferCertificateStatus;
};

export type TransferCertificatesPage = {
  records: TransferCertificateRecord[];
  total: number;
};

export type TransferHeaderConfig = {
  collegeTcHeaderId?: number;
  collegeName: string;
  affiliation: string;
  address: string;
  phone: string;
  logoUrl?: string;
};

export type TransferStudentDetails = {
  studentId: number;
  rollNo: string;
  admissionNo: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  course: string;
  subCourse: string;
  courseYear: string;
  academicYear: string;
  batchCode: string;
  dateOfBirth: string;
};

export type SaveTransferCertificatePayload = {
  collegeTcId?: number;
  collegeId: number;
  studentId: number;
  collegeTcNo: string;
  issuedDate: string;
  classAtTimeOfLeaving: string;
  dateOfAdmission: string;
  dateOfLeaving: string;
  conductRemarks: string;
  reasonForLeaving: string;
  candidateCategory?: string | null;
  candidateScholarship: boolean;
  otherRemarks?: string | null;
  issuedBy: number;
  saveStatus?: "Draft" | "Saved" | "Generated";
};

type Related<T> = T | T[] | null | undefined;

type TransferStudentRelation = {
  studentId: number;
  batch?: string | null;
  users?: Related<{ fullName?: string | null }>;
  college_education?: Related<{ collegeEducationType?: string | null }>;
  college_branch?: Related<{ collegeBranchCode?: string | null }>;
  student_academic_history?: Array<{
    isCurrent: boolean | null;
    updatedAt: string | null;
    college_academic_year?: Related<{ collegeAcademicYear?: string | null }>;
  }> | null;
  student_pins?: Related<{ pinNumber?: string | null }>;
  parents?: Array<{
    isActive: boolean | null;
    is_deleted: boolean | null;
    deletedAt: string | null;
    users?: Related<{ fullName?: string | null; gender?: string | null }>;
  }> | null;
};

type TransferRow = {
  collegeTcId: number;
  studentId: number;
  collegeTcNo: string | null;
  issuedDate: string | null;
  classAtTimeOfLeaving: string | null;
  dateOfAdmission: string | null;
  dateOfLeaving: string | null;
  conductRemarks: string | null;
  reasonForLeaving: string | null;
  candidateCategory: string | null;
  candidateScholarship: boolean | null;
  otherRemarks: string | null;
  students?: Related<TransferStudentRelation>;
};

type BonafideAdmissionRow = {
  studentId: number;
  admissionNo: string | null;
};

const TRANSFER_SELECT = `
  collegeTcId,
  studentId,
  collegeTcNo,
  issuedDate,
  classAtTimeOfLeaving,
  dateOfAdmission,
  dateOfLeaving,
  conductRemarks,
  reasonForLeaving,
  candidateCategory,
  candidateScholarship,
  otherRemarks
`;

const TRANSFER_STUDENT_SELECT = `
  studentId,
  batch,
  users:userId (
    fullName
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
  student_pins (
    pinNumber
  ),
  parents (
    isActive,
    is_deleted,
    deletedAt,
    users:userId (
      fullName,
      gender
    )
  )
`;

const TRANSFER_STUDENT_LOOKUP_SELECT = `
  pinNumber,
  students:studentId (
    studentId,
    batch,
    users:userId (
      fullName
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
    student_pins (
      pinNumber
    ),
    parents (
      isActive,
      is_deleted,
      deletedAt,
      users:userId (
        fullName,
        gender
      )
    )
  )
`;

function getFirstRelated<T>(relation: Related<T>) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function getAcademicYearStart(value?: string | null) {
  if (!value) return 0;
  const match = value.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
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

function getCurrentAcademicYear(
  rows: Array<{
    isCurrent: boolean | null;
    updatedAt: string | null;
    college_academic_year?: Related<{ collegeAcademicYear?: string | null }>;
  }>,
) {
  const currentRow =
    rows.find((row) => row.isCurrent) ??
    [...rows].sort((a, b) =>
      String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")),
    )[0];

  return getFirstRelated(currentRow?.college_academic_year)?.collegeAcademicYear ?? "-";
}

function getParentNames(student?: TransferStudentRelation | null) {
  const parents = (student?.parents ?? []).filter(
    (item) => item.isActive !== false && !item.is_deleted && !item.deletedAt,
  );
  const father =
    parents.find((item) => getFirstRelated(item.users)?.gender === "Male") ?? parents[0];
  const mother =
    parents.find((item) => getFirstRelated(item.users)?.gender === "Female") ?? parents[1];

  return {
    fatherName: getFirstRelated(father?.users)?.fullName?.trim() || "-",
    motherName: getFirstRelated(mother?.users)?.fullName?.trim() || "-",
  };
}

function mapTransferRow(row: TransferRow): TransferCertificateRecord {
  return mapTransferRowWithAdmissionNo(row);
}

function mapTransferRowWithAdmissionNo(
  row: TransferRow,
  admissionNoByStudentId = new Map<number, string>(),
): TransferCertificateRecord {
  const student = getFirstRelated(row.students);
  const user = getFirstRelated(student?.users);
  const pin = getFirstRelated(student?.student_pins);
  const education = getFirstRelated(student?.college_education);
  const branch = getFirstRelated(student?.college_branch);
  const academicHistory = student?.student_academic_history ?? [];
  const parents = getParentNames(student);
  const isDraft = row.collegeTcNo?.startsWith("[DRAFT]");
  const isSaved = row.collegeTcNo?.startsWith("[SAVED]");
  const tcNo = row.collegeTcNo?.replace(/^\[(DRAFT|SAVED)\]/, "") || "";

  return {
    collegeTcId: row.collegeTcId,
    studentId: row.studentId,
    tcNo: tcNo || "-",
    rollNo: pin?.pinNumber ?? "-",
    admissionNo: admissionNoByStudentId.get(row.studentId) ?? "-",
    studentName: user?.fullName?.trim() || `Student ${row.studentId}`,
    fatherName: parents.fatherName,
    motherName: parents.motherName,
    course: education?.collegeEducationType ?? "-",
    subCourse: branch?.collegeBranchCode ?? "-",
    courseYear: getCourseYearLabel(academicHistory),
    academicYear: getCurrentAcademicYear(academicHistory),
    batchCode: student?.batch ?? "-",
    date: row.issuedDate ?? "",
    classAtLeaving: row.classAtTimeOfLeaving ?? "-",
    dateOfAdmission: row.dateOfAdmission ?? "",
    dateOfLeaving: row.dateOfLeaving ?? "",
    dateOfBirth: "",
    conductRemarks: row.conductRemarks ?? "-",
    reasonForLeaving: row.reasonForLeaving ?? "-",
    belongsToScStBc: row.candidateCategory ?? "-",
    receiptOfScholarship: row.candidateScholarship ? "Yes" : "No",
    otherRemarks: row.otherRemarks ?? undefined,
    status: isDraft ? "Draft" : isSaved ? "Saved" : "Generated",
  };
}

async function fetchBonafideAdmissionNumbersByStudentId(
  collegeId: number,
  studentIds: number[],
) {
  const uniqueStudentIds = Array.from(new Set(studentIds.filter(Boolean)));
  if (!collegeId || !uniqueStudentIds.length) return new Map<number, string>();

  const { data, error } = await supabase
    .from("college_bonafides")
    .select("studentId, admissionNo")
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .in("studentId", uniqueStudentIds)
    .not("admissionNo", "is", null)
    .order("dateIssued", { ascending: false })
    .order("collegeBonafideId", { ascending: false })
    .returns<BonafideAdmissionRow[]>();

  if (error) throw error;

  const admissionNoByStudentId = new Map<number, string>();
  for (const row of data ?? []) {
    const admissionNo = row.admissionNo?.trim();
    if (admissionNo && !admissionNoByStudentId.has(row.studentId)) {
      admissionNoByStudentId.set(row.studentId, admissionNo);
    }
  }

  return admissionNoByStudentId;
}

async function fetchBonafideAdmissionNo(collegeId: number, studentId: number) {
  const admissionNoByStudentId = await fetchBonafideAdmissionNumbersByStudentId(
    collegeId,
    [studentId],
  );

  return admissionNoByStudentId.get(studentId) ?? "";
}

export async function fetchTransferCertificates({
  collegeId,
  page = 1,
  itemsPerPage = 10,
  search = "",
}: {
  collegeId: number;
  page?: number;
  itemsPerPage?: number;
  search?: string;
}): Promise<TransferCertificatesPage> {
  if (!collegeId) return { records: [], total: 0 };

  const searchTerm = search.trim();
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  let matchingStudentIds: number[] | null = null;

  if (searchTerm) {
    const [pinsResult, studentsResult] = await Promise.all([
      supabase
        .from("student_pins")
        .select("studentId")
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .ilike("pinNumber", `%${searchTerm}%`)
        .returns<Array<{ studentId: number }>>(),
      supabase
        .from("students")
        .select("studentId, users:userId!inner(fullName)")
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .ilike("users.fullName", `%${searchTerm}%`)
        .returns<Array<{ studentId: number }>>(),
    ]);

    if (pinsResult.error) throw pinsResult.error;
    if (studentsResult.error) throw studentsResult.error;

    matchingStudentIds = Array.from(
      new Set([
        ...(pinsResult.data ?? []).map((row) => row.studentId),
        ...(studentsResult.data ?? []).map((row) => row.studentId),
      ]),
    );
  }

  let query = supabase
    .from("college_tcs")
    .select(TRANSFER_SELECT, { count: "exact" })
    .eq("collegeId", collegeId)
    .eq("is_deleted", false);

  if (searchTerm) {
    const tcSearch = `collegeTcNo.ilike.%${searchTerm}%`;
    query = matchingStudentIds?.length
      ? query.or(`${tcSearch},studentId.in.(${matchingStudentIds.join(",")})`)
      : query.or(tcSearch);
  }

  const { data, error, count } = await query
    .order("issuedDate", { ascending: false })
    .order("collegeTcId", { ascending: false })
    .range(from, to)
    .returns<TransferRow[]>();

  if (error) throw error;

  const rows = data ?? [];
  const studentIds = Array.from(
    new Set(rows.map((row) => row.studentId).filter(Boolean)),
  );

  if (!studentIds.length) {
    return { records: rows.map(mapTransferRow), total: count ?? 0 };
  }

  const [studentsResult, admissionNoByStudentId] = await Promise.all([
    supabase
      .from("students")
      .select(TRANSFER_STUDENT_SELECT)
      .in("studentId", studentIds)
      .returns<TransferStudentRelation[]>(),
    fetchBonafideAdmissionNumbersByStudentId(collegeId, studentIds),
  ]);

  if (studentsResult.error) {
    console.warn("Unable to hydrate transfer certificate student details", studentsResult.error);
    return {
      records: rows.map((row) => mapTransferRowWithAdmissionNo(row, admissionNoByStudentId)),
      total: count ?? 0,
    };
  }

  const studentById = new Map(
    (studentsResult.data ?? []).map((student) => [student.studentId, student]),
  );

  return {
    records: rows.map((row) =>
      mapTransferRowWithAdmissionNo(
        {
          ...row,
          students: studentById.get(row.studentId) ?? null,
        },
        admissionNoByStudentId,
      ),
    ),
    total: count ?? 0,
  };
}

export async function fetchTransferHeader(collegeId: number): Promise<TransferHeaderConfig | null> {
  if (!collegeId) return null;

  const [headerResult, collegeResult, mediaResult] = await Promise.all([
    supabase
      .from("college_tc_headers")
      .select("collegeTcHeaderId, institutionName, affiliation, address, contactNumber")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .maybeSingle<{
        collegeTcHeaderId: number;
        institutionName: string;
        affiliation: string;
        address: string;
        contactNumber: string;
      }>(),
    supabase
      .from("colleges")
      .select("collegeName, address, phoneNumber")
      .eq("collegeId", collegeId)
      .is("deletedAt", null)
      .maybeSingle<{
        collegeName: string | null;
        address: string | null;
        phoneNumber: string | null;
      }>(),
    supabase
      .from("college_media")
      .select("logoUrl")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false)
      .maybeSingle<{ logoUrl: string | null }>(),
  ]);

  if (headerResult.error) throw headerResult.error;
  if (collegeResult.error) throw collegeResult.error;
  if (mediaResult.error) throw mediaResult.error;

  const header = headerResult.data;
  const college = collegeResult.data;
  const media = mediaResult.data;

  if (!header && !college && !media) return null;

  return {
    collegeTcHeaderId: header?.collegeTcHeaderId,
    collegeName: college?.collegeName?.trim() || header?.institutionName || "",
    affiliation: header?.affiliation || "",
    address: header?.address || college?.address || "",
    phone: header?.contactNumber || college?.phoneNumber || "",
    logoUrl: media?.logoUrl || undefined,
  };
}

export async function upsertTransferHeader({
  collegeId,
  userId,
  config,
}: {
  collegeId: number;
  userId: number;
  config: TransferHeaderConfig;
}) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("college_tc_headers")
    .upsert(
      {
        collegeId,
        institutionName: config.collegeName.trim(),
        affiliation: config.affiliation.trim(),
        address: config.address.trim(),
        contactNumber: config.phone.trim(),
        createdBy: userId,
        isActive: true,
        is_deleted: false,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      },
      { onConflict: "collegeId" },
    )
    .select("collegeTcHeaderId")
    .single<{ collegeTcHeaderId: number }>();

  if (error) throw error;

  return data;
}

export async function hasTransferTcNoForAnotherStudent({
  collegeId,
  studentId,
  collegeTcNo,
  collegeTcId,
}: {
  collegeId: number;
  studentId: number;
  collegeTcNo: string;
  collegeTcId?: number;
}) {
  const tcNo = collegeTcNo.trim();
  if (!collegeId || !studentId || !tcNo) return false;

  const { data, error } = await supabase
    .from("college_tcs")
    .select("collegeTcId, studentId, collegeTcNo")
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .in("collegeTcNo", [tcNo, `[DRAFT]${tcNo}`, `[SAVED]${tcNo}`])
    .limit(1)
    .returns<Array<{ collegeTcId: number; studentId: number; collegeTcNo: string | null }>>();

  if (error) throw error;

  return (data ?? []).some(
    (row) => row.collegeTcId !== collegeTcId && row.studentId !== studentId,
  );
}

export async function fetchTransferStudentByRollNo({
  collegeId,
  rollNo,
}: {
  collegeId: number;
  rollNo: string;
}): Promise<TransferStudentDetails | null> {
  if (!collegeId || !rollNo.trim()) return null;

  const { data, error } = await supabase
    .from("student_pins")
    .select(TRANSFER_STUDENT_LOOKUP_SELECT)
    .eq("collegeId", collegeId)
    .eq("pinNumber", rollNo.trim())
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("students.collegeId", collegeId)
    .eq("students.isActive", true)
    .is("students.deletedAt", null)
    .maybeSingle<{
      pinNumber: string | null;
      students: Related<TransferStudentRelation>;
    }>();

  if (error) throw error;

  const student = getFirstRelated(data?.students);
  if (!student) return null;

  const user = getFirstRelated(student.users);
  const education = getFirstRelated(student.college_education);
  const branch = getFirstRelated(student.college_branch);
  const academicHistory = student.student_academic_history ?? [];
  const parents = getParentNames(student);
  const admissionNo = await fetchBonafideAdmissionNo(collegeId, student.studentId);

  return {
    studentId: student.studentId,
    rollNo: data?.pinNumber ?? rollNo.trim(),
    admissionNo,
    studentName: user?.fullName?.trim() || `Student ${student.studentId}`,
    fatherName: parents.fatherName,
    motherName: parents.motherName,
    course: education?.collegeEducationType ?? "",
    subCourse: branch?.collegeBranchCode ?? "",
    courseYear: getCourseYearLabel(academicHistory),
    academicYear: getCurrentAcademicYear(academicHistory),
    batchCode: student.batch ?? "",
    dateOfBirth: "",
  };
}

export async function saveTransferCertificate(payload: SaveTransferCertificatePayload) {
  const now = new Date().toISOString();
  const duplicateExists = await hasTransferTcNoForAnotherStudent({
    collegeId: payload.collegeId,
    studentId: payload.studentId,
    collegeTcNo: payload.collegeTcNo,
    collegeTcId: payload.collegeTcId,
  });

  if (duplicateExists) {
    throw new Error("This TC number is already assigned to another student.");
  }

  let prefix = "";
  if (payload.saveStatus === "Draft") prefix = "[DRAFT]";
  else if (payload.saveStatus === "Saved") prefix = "[SAVED]";

  const cleanTcNo = payload.collegeTcNo.trim().replace(/^\[(DRAFT|SAVED)\]/, "");
  const collegeTcNo = `${prefix}${cleanTcNo}`;

  const values = {
    collegeId: payload.collegeId,
    studentId: payload.studentId,
    collegeTcNo,
    issuedDate: payload.issuedDate,
    classAtTimeOfLeaving: payload.classAtTimeOfLeaving.trim(),
    dateOfAdmission: payload.dateOfAdmission,
    dateOfLeaving: payload.dateOfLeaving,
    conductRemarks: payload.conductRemarks.trim(),
    reasonForLeaving: payload.reasonForLeaving.trim(),
    candidateCategory: payload.candidateCategory?.trim() || null,
    candidateScholarship: payload.candidateScholarship,
    otherRemarks: payload.otherRemarks?.trim() || null,
    issuedBy: payload.issuedBy,
    is_deleted: false,
    updatedAt: now,
  };

  if (payload.collegeTcId) {
    const { data, error } = await supabase
      .from("college_tcs")
      .update(values)
      .eq("collegeTcId", payload.collegeTcId)
      .eq("collegeId", payload.collegeId)
      .select("collegeTcId")
      .single<{ collegeTcId: number }>();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("college_tcs")
    .insert({
      ...values,
      createdAt: now,
    })
    .select("collegeTcId")
    .single<{ collegeTcId: number }>();

  if (error) throw error;
  return data;
}

export async function deleteTransferCertificate(collegeTcId: number) {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("college_tcs")
    .update({ is_deleted: true, deletedAt: now, updatedAt: now })
    .eq("collegeTcId", collegeTcId);

  if (error) throw error;
}
