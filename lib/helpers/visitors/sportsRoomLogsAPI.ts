import { supabase } from "@/lib/supabaseClient";
import { getInventoryImageUrl } from "@/lib/helpers/inventory/inventoryAssetAPI";

export type SportsRoomLogEquipmentRow = {
  sportsRoomLogEquipmentId: number;
  sportsRoomLogId: number;
  inventoryAssetId: number;
  quantity: number;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  inventory_assets?: {
    inventoryAssetId: number;
    assetName: string;
    availableQty: number;
    totalQty: number;
    referenceImage: string | null;
  }[] | {
    inventoryAssetId: number;
    assetName: string;
    availableQty: number;
    totalQty: number;
    referenceImage: string | null;
  } | null;
};

export type SportsRoomLogRow = {
  sportsRoomLogId: number;
  collegeId: number;
  fullName: string;
  studentId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSectionsId: number;
  purposeOfVisit: string;
  entryDate: string;
  entryTime: string;
  exitTime: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  college_education?: { collegeEducationType: string | null }[] | { collegeEducationType: string | null } | null;
  college_branch?: { collegeBranchCode: string | null; collegeBranchType: string | null }[] | { collegeBranchCode: string | null; collegeBranchType: string | null } | null;
  college_academic_year?: { collegeAcademicYear: string | null }[] | { collegeAcademicYear: string | null } | null;
  college_sections?: { collegeSections: string | null }[] | { collegeSections: string | null } | null;
  students?: {
    studentId: number;
    student_pins?: { pinNumber: string | null }[] | { pinNumber: string | null } | null;
  }[] | {
    studentId: number;
    student_pins?: { pinNumber: string | null }[] | { pinNumber: string | null } | null;
  } | null;
  sports_room_log_equipments?: SportsRoomLogEquipmentRow[] | SportsRoomLogEquipmentRow | null;
};

export type SportsRoomStudentContext = {
  studentId: number;
  fullName: string;
  rollNo: string;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSectionsId: number;
  collegeEducationType: string | null;
  collegeBranchCode: string | null;
  collegeAcademicYear: string | null;
  collegeSections: string | null;
};

export type FetchSportsRoomLogsParams = {
  collegeId: number;
  entryDate?: string;
  studentId?: number;
  returnStatus?: "all" | "returned" | "pending";
  search?: string;
};

export type FetchSportsRoomLogsPageParams = FetchSportsRoomLogsParams & {
  page: number;
  limit: number;
};

export type SportsRoomLogEquipmentPayload = {
  inventoryAssetId: number;
  quantity: number;
  remarks?: string | null;
};

export type CreateSportsRoomLogPayload = {
  collegeId: number;
  fullName: string;
  studentId: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSectionsId: number;
  purposeOfVisit: string;
  entryDate: string;
  entryTime: string;
  exitTime?: string | null;
  equipments?: SportsRoomLogEquipmentPayload[];
};

export type UpdateSportsRoomLogPayload = CreateSportsRoomLogPayload & {
  sportsRoomLogId: number;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

const SPORTS_ROOM_LOG_COLUMNS = `
  sportsRoomLogId,
  collegeId,
  fullName,
  studentId,
  collegeEducationId,
  collegeBranchId,
  collegeAcademicYearId,
  collegeSectionsId,
  purposeOfVisit,
  entryDate,
  entryTime,
  exitTime,
  createdAt,
  updatedAt,
  deletedAt,
  college_education:collegeEducationId (
    collegeEducationType
  ),
  college_branch:collegeBranchId (
    collegeBranchCode,
    collegeBranchType
  ),
  college_academic_year:collegeAcademicYearId (
    collegeAcademicYear
  ),
  college_sections:collegeSectionsId (
    collegeSections
  ),
  students:studentId (
    studentId,
    student_pins (
      pinNumber
    )
  ),
  sports_room_log_equipments (
    sportsRoomLogEquipmentId,
    sportsRoomLogId,
    inventoryAssetId,
    quantity,
    remarks,
    createdAt,
    updatedAt,
    deletedAt,
    inventory_assets:inventoryAssetId (
      inventoryAssetId,
      assetName,
      availableQty,
      totalQty,
      referenceImage
    )
  )
`;

function createSportsRoomLogError(context: string, error: SupabaseErrorLike) {
  const code = error.code ? ` [${error.code}]` : "";
  const message = error.message || "Unknown Supabase error";
  const normalizedError = new Error(`${context}${code}: ${message}`);
  console.error(normalizedError.message, {
    details: error.details ?? null,
    hint: error.hint ?? null,
  });
  return normalizedError;
}

function normalizeSportsRoomLogPayload(
  payload: CreateSportsRoomLogPayload | UpdateSportsRoomLogPayload,
) {
  return {
    collegeId: payload.collegeId,
    fullName: payload.fullName.trim(),
    studentId: payload.studentId,
    collegeEducationId: payload.collegeEducationId,
    collegeBranchId: payload.collegeBranchId,
    collegeAcademicYearId: payload.collegeAcademicYearId,
    collegeSectionsId: payload.collegeSectionsId,
    purposeOfVisit: payload.purposeOfVisit.trim(),
    entryDate: payload.entryDate,
    entryTime: payload.entryTime,
    exitTime: payload.exitTime || null,
  };
}

function normalizeEquipmentPayload(
  sportsRoomLogId: number,
  equipments: SportsRoomLogEquipmentPayload[] = [],
  now = new Date().toISOString(),
) {
  return equipments
    .filter((equipment) => equipment.inventoryAssetId && equipment.quantity > 0)
    .map((equipment) => ({
      sportsRoomLogId,
      inventoryAssetId: equipment.inventoryAssetId,
      quantity: equipment.quantity,
      remarks: equipment.remarks?.trim() || null,
      createdAt: now,
      updatedAt: now,
    }));
}

function getEquipmentRows(row: SportsRoomLogRow) {
  const rows = row.sports_room_log_equipments;
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  return list.filter((equipment) => !equipment.deletedAt);
}

function getFirstRelated<T>(value: T[] | T | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function getLogRollNo(row: SportsRoomLogRow) {
  const student = getFirstRelated(row.students);
  const pin = getFirstRelated(student?.student_pins);
  return pin?.pinNumber ?? String(row.studentId);
}

function formatTimeWithoutSeconds(value: string | null) {
  return value ? value.slice(0, 5) : null;
}

async function getSearchStudentIds(collegeId: number, search: string) {
  const trimmedSearch = search.trim();
  if (!trimmedSearch) return [];

  const { data, error } = await supabase
    .from("student_pins")
    .select("studentId")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .ilike("pinNumber", `%${trimmedSearch}%`);

  if (error) {
    throw createSportsRoomLogError("getSearchStudentIds", error);
  }

  const ids = new Set((data ?? []).map((row) => row.studentId).filter(Boolean));
  const numericStudentId = Number(trimmedSearch);
  if (Number.isFinite(numericStudentId) && numericStudentId > 0) {
    ids.add(numericStudentId);
  }

  return Array.from(ids);
}

async function getSearchSportsRoomLogIdsByEquipment(collegeId: number, search: string) {
  const trimmedSearch = search.trim();
  if (!trimmedSearch) return [];

  const { data: assets, error: assetError } = await supabase
    .from("inventory_assets")
    .select("inventoryAssetId")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .ilike("assetName", `%${trimmedSearch}%`);

  if (assetError) {
    throw createSportsRoomLogError("getSearchSportsRoomLogIdsByEquipment", assetError);
  }

  const assetIds = (assets ?? [])
    .map((asset) => asset.inventoryAssetId)
    .filter(Boolean);

  if (!assetIds.length) return [];

  const { data: equipmentLogs, error: equipmentError } = await supabase
    .from("sports_room_log_equipments")
    .select("sportsRoomLogId")
    .in("inventoryAssetId", assetIds)
    .is("deletedAt", null);

  if (equipmentError) {
    throw createSportsRoomLogError("getSearchSportsRoomLogIdsByEquipment", equipmentError);
  }

  return Array.from(new Set((equipmentLogs ?? []).map((row) => row.sportsRoomLogId).filter(Boolean)));
}

function buildSportsRoomLogSearchFilterWithLogs(search: string, studentIds: number[], sportsRoomLogIds: number[]) {
  const trimmedSearch = search.trim();
  if (!trimmedSearch) return "";

  const filters = [
    `fullName.ilike.%${trimmedSearch}%`,
    `purposeOfVisit.ilike.%${trimmedSearch}%`,
  ];

  if (studentIds.length) {
    filters.push(`studentId.in.(${studentIds.join(",")})`);
  }

  if (sportsRoomLogIds.length) {
    filters.push(`sportsRoomLogId.in.(${sportsRoomLogIds.join(",")})`);
  }

  return filters.join(",");
}

async function replaceSportsRoomLogEquipments(
  sportsRoomLogId: number,
  equipments: SportsRoomLogEquipmentPayload[] = [],
) {
  const now = new Date().toISOString();
  const { error: deleteError } = await supabase
    .from("sports_room_log_equipments")
    .update({ deletedAt: now, updatedAt: now })
    .eq("sportsRoomLogId", sportsRoomLogId)
    .is("deletedAt", null);

  if (deleteError) {
    throw createSportsRoomLogError("replaceSportsRoomLogEquipments", deleteError);
  }

  const equipmentRows = normalizeEquipmentPayload(sportsRoomLogId, equipments, now);
  if (!equipmentRows.length) return;

  const { error: insertError } = await supabase
    .from("sports_room_log_equipments")
    .insert(equipmentRows);

  if (insertError) {
    throw createSportsRoomLogError("replaceSportsRoomLogEquipments", insertError);
  }
}

export async function fetchSportsRoomLogs(params: FetchSportsRoomLogsParams) {
  const trimmedSearch = params.search?.trim() ?? "";
  const searchStudentIds = trimmedSearch
    ? await getSearchStudentIds(params.collegeId, trimmedSearch)
    : [];
  const searchSportsRoomLogIds = trimmedSearch
    ? await getSearchSportsRoomLogIdsByEquipment(params.collegeId, trimmedSearch)
    : [];
  let query = supabase
    .from("sports_room_logs")
    .select(SPORTS_ROOM_LOG_COLUMNS)
    .eq("collegeId", params.collegeId)
    .is("deletedAt", null);

  if (params.entryDate) {
    query = query.eq("entryDate", params.entryDate);
  }

  if (params.studentId) {
    query = query.eq("studentId", params.studentId);
  }

  if (params.returnStatus === "returned") {
    query = query.not("exitTime", "is", null);
  } else if (params.returnStatus === "pending") {
    query = query.is("exitTime", null);
  }

  if (trimmedSearch) {
    query = query.or(buildSportsRoomLogSearchFilterWithLogs(trimmedSearch, searchStudentIds, searchSportsRoomLogIds));
  }

  const { data, error } = await query
    .order("entryDate", { ascending: false })
    .order("entryTime", { ascending: false });

  if (error) {
    throw createSportsRoomLogError("fetchSportsRoomLogs", error);
  }

  return ((data ?? []) as unknown as SportsRoomLogRow[]).map((row) => ({
    ...row,
    sports_room_log_equipments: getEquipmentRows(row),
  }));
}

export async function fetchSportsRoomLogsPage({
  page,
  limit,
  ...params
}: FetchSportsRoomLogsPageParams) {
  const from = Math.max(page - 1, 0) * limit;
  const to = from + limit - 1;
  const trimmedSearch = params.search?.trim() ?? "";
  const searchStudentIds = trimmedSearch
    ? await getSearchStudentIds(params.collegeId, trimmedSearch)
    : [];
  const searchSportsRoomLogIds = trimmedSearch
    ? await getSearchSportsRoomLogIdsByEquipment(params.collegeId, trimmedSearch)
    : [];
  let query = supabase
    .from("sports_room_logs")
    .select(SPORTS_ROOM_LOG_COLUMNS, { count: "exact" })
    .eq("collegeId", params.collegeId)
    .is("deletedAt", null);

  if (params.entryDate) {
    query = query.eq("entryDate", params.entryDate);
  }

  if (params.studentId) {
    query = query.eq("studentId", params.studentId);
  }

  if (params.returnStatus === "returned") {
    query = query.not("exitTime", "is", null);
  } else if (params.returnStatus === "pending") {
    query = query.is("exitTime", null);
  }

  if (trimmedSearch) {
    query = query.or(buildSportsRoomLogSearchFilterWithLogs(trimmedSearch, searchStudentIds, searchSportsRoomLogIds));
  }

  const { data, error, count } = await query
    .order("entryDate", { ascending: false })
    .order("entryTime", { ascending: false })
    .range(from, to);

  if (error) {
    throw createSportsRoomLogError("fetchSportsRoomLogsPage", error);
  }

  return {
    data: ((data ?? []) as unknown as SportsRoomLogRow[]).map((row) => ({
      ...row,
      sports_room_log_equipments: getEquipmentRows(row),
    })),
    count: count ?? 0,
  };
}

export async function fetchSportsRoomLogById({
  sportsRoomLogId,
  collegeId,
}: {
  sportsRoomLogId: number;
  collegeId: number;
}) {
  const { data, error } = await supabase
    .from("sports_room_logs")
    .select(SPORTS_ROOM_LOG_COLUMNS)
    .eq("sportsRoomLogId", sportsRoomLogId)
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .single();

  if (error) {
    throw createSportsRoomLogError("fetchSportsRoomLogById", error);
  }

  const row = data as unknown as SportsRoomLogRow;
  return {
    ...row,
    sports_room_log_equipments: getEquipmentRows(row),
  };
}

export async function createSportsRoomLog(payload: CreateSportsRoomLogPayload) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("sports_room_logs")
    .insert({
      ...normalizeSportsRoomLogPayload(payload),
      createdAt: now,
      updatedAt: now,
    })
    .select("sportsRoomLogId, collegeId")
    .single();

  if (error) {
    throw createSportsRoomLogError("createSportsRoomLog", error);
  }

  try {
    await replaceSportsRoomLogEquipments(
      data.sportsRoomLogId,
      payload.equipments ?? [],
    );
  } catch (equipmentError) {
    await supabase
      .from("sports_room_logs")
      .update({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .eq("sportsRoomLogId", data.sportsRoomLogId);
    throw equipmentError;
  }

  return fetchSportsRoomLogById({
    sportsRoomLogId: data.sportsRoomLogId,
    collegeId: data.collegeId,
  });
}

export async function updateSportsRoomLog(payload: UpdateSportsRoomLogPayload) {
  const { data, error } = await supabase
    .from("sports_room_logs")
    .update({
      ...normalizeSportsRoomLogPayload(payload),
      updatedAt: new Date().toISOString(),
    })
    .eq("sportsRoomLogId", payload.sportsRoomLogId)
    .eq("collegeId", payload.collegeId)
    .is("deletedAt", null)
    .select("sportsRoomLogId, collegeId")
    .single();

  if (error) {
    throw createSportsRoomLogError("updateSportsRoomLog", error);
  }

  await replaceSportsRoomLogEquipments(payload.sportsRoomLogId, payload.equipments ?? []);

  return fetchSportsRoomLogById({
    sportsRoomLogId: data.sportsRoomLogId,
    collegeId: data.collegeId,
  });
}

export async function markSportsRoomLogExit({
  sportsRoomLogId,
  collegeId,
  exitTime,
}: {
  sportsRoomLogId: number;
  collegeId: number;
  exitTime: string;
}) {
  const { data, error } = await supabase
    .from("sports_room_logs")
    .update({ exitTime, updatedAt: new Date().toISOString() })
    .eq("sportsRoomLogId", sportsRoomLogId)
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .select("sportsRoomLogId, collegeId")
    .single();

  if (error) {
    throw createSportsRoomLogError("markSportsRoomLogExit", error);
  }

  return fetchSportsRoomLogById({
    sportsRoomLogId: data.sportsRoomLogId,
    collegeId: data.collegeId,
  });
}

export async function deleteSportsRoomLog({
  sportsRoomLogId,
  collegeId,
}: {
  sportsRoomLogId: number;
  collegeId: number;
}) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("sports_room_logs")
    .update({ deletedAt: now, updatedAt: now })
    .eq("sportsRoomLogId", sportsRoomLogId)
    .eq("collegeId", collegeId)
    .is("deletedAt", null);

  if (error) {
    throw createSportsRoomLogError("deleteSportsRoomLog", error);
  }

  const { error: equipmentError } = await supabase
    .from("sports_room_log_equipments")
    .update({ deletedAt: now, updatedAt: now })
    .eq("sportsRoomLogId", sportsRoomLogId)
    .is("deletedAt", null);

  if (equipmentError) {
    throw createSportsRoomLogError("deleteSportsRoomLogEquipments", equipmentError);
  }

  return { success: true };
}

export async function fetchSportsRoomUsageHistory({
  collegeId,
  studentId,
  search,
  returnStatus = "all",
}: {
  collegeId: number;
  studentId: number;
  search?: string;
  returnStatus?: "all" | "returned" | "pending";
}) {
  return fetchSportsRoomLogs({
    collegeId,
    studentId,
    search,
    returnStatus,
  });
}

export async function fetchSportsRoomLogSummary(collegeId: number) {
  const { data, error } = await supabase
    .from("sports_room_logs")
    .select("sportsRoomLogId, exitTime, sports_room_log_equipments(quantity, deletedAt)")
    .eq("collegeId", collegeId)
    .is("deletedAt", null);

  if (error) {
    throw createSportsRoomLogError("fetchSportsRoomLogSummary", error);
  }

  const logs = (data ?? []) as Pick<
    SportsRoomLogRow,
    "sportsRoomLogId" | "exitTime" | "sports_room_log_equipments"
  >[];

  return logs.reduce(
    (summary, log) => {
      const equipmentQuantity = getEquipmentRows(log as SportsRoomLogRow).reduce(
        (total, equipment) => total + equipment.quantity,
        0,
      );

      summary.visitorsLog += 1;
      summary.equipmentIssued += equipmentQuantity;
      if (log.exitTime) {
        summary.returnedEquipment += equipmentQuantity;
      } else {
        summary.pendingReturns += equipmentQuantity;
      }

      return summary;
    },
    {
      visitorsLog: 0,
      equipmentIssued: 0,
      returnedEquipment: 0,
      pendingReturns: 0,
    },
  );
}

export function mapSportsRoomLogToVisitorEntry(row: SportsRoomLogRow) {
  const equipmentRows = getEquipmentRows(row);
  const education = getFirstRelated(row.college_education);
  const branch = getFirstRelated(row.college_branch);
  const academicYear = getFirstRelated(row.college_academic_year);
  const section = getFirstRelated(row.college_sections);
  const equipmentNames = equipmentRows
    .map((equipment) => getFirstRelated(equipment.inventory_assets)?.assetName)
    .filter(Boolean);
  const primaryAsset = getFirstRelated(equipmentRows[0]?.inventory_assets);
  const quantity = equipmentRows.reduce((total, equipment) => total + equipment.quantity, 0);
  const initials = row.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";

  return {
    id: row.sportsRoomLogId,
    sportsRoomLogId: row.sportsRoomLogId,
    studentId: row.studentId,
    collegeId: row.collegeId,
    collegeEducationId: row.collegeEducationId,
    collegeBranchId: row.collegeBranchId,
    collegeAcademicYearId: row.collegeAcademicYearId,
    collegeSectionsId: row.collegeSectionsId,
    purposeOfVisit: row.purposeOfVisit,
    entryDate: row.entryDate,
    entryTime: row.entryTime,
    exitTime: row.exitTime,
    equipments: equipmentRows.map((equipment) => ({
      sportsRoomLogEquipmentId: equipment.sportsRoomLogEquipmentId,
      inventoryAssetId: equipment.inventoryAssetId,
      quantity: equipment.quantity,
      remarks: equipment.remarks,
      assetName: getFirstRelated(equipment.inventory_assets)?.assetName ?? "Equipment",
      imageUrl: getInventoryImageUrl(getFirstRelated(equipment.inventory_assets)?.referenceImage ?? null),
    })),
    initials,
    avatarTone: "bg-[#DDFBE7] text-[#16A85B]",
    student: row.fullName,
    course: [
      education?.collegeEducationType,
      branch?.collegeBranchCode,
      academicYear?.collegeAcademicYear,
      section?.collegeSections ? `Sec ${section.collegeSections}` : null,
    ]
      .filter(Boolean)
      .join(" - ") || "N/A",
    rollNo: getLogRollNo(row),
    takenAt: formatTimeWithoutSeconds(row.entryTime) ?? "-",
    equipment: equipmentNames.length ? equipmentNames.join(", ") : "No equipment",
    equipmentImageUrl: getInventoryImageUrl(primaryAsset?.referenceImage ?? null),
    quantity,
    returnStatus: (row.exitTime ? "Returned" : "Pending") as "Returned" | "Pending",
    returnedAt: formatTimeWithoutSeconds(row.exitTime) ?? "-",
  };
}

export async function fetchSportsRoomStudentContext({
  collegeId,
  identifier,
}: {
  collegeId: number;
  identifier: string;
}) {
  const normalizedIdentifier = identifier.trim();
  if (!normalizedIdentifier) {
    throw new Error("Enter a student ID or roll number.");
  }

  let studentId = Number(normalizedIdentifier);
  if (!Number.isFinite(studentId) || studentId <= 0) {
    const { data: pinData, error: pinError } = await supabase
      .from("student_pins")
      .select("studentId, collegeId, pinNumber")
      .eq("pinNumber", normalizedIdentifier)
      .eq("isActive", true)
      .is("deletedAt", null)
      .maybeSingle<{ studentId: number; collegeId: number; pinNumber: string }>();

    if (pinError) {
      throw createSportsRoomLogError("fetchSportsRoomStudentContext", pinError);
    }

    if (!pinData?.studentId) {
      throw new Error("No student found for the entered ID.");
    }

    if (pinData.collegeId !== collegeId) {
      throw new Error("This student ID belongs to another college.");
    }

    studentId = pinData.studentId;
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(
      `
      studentId,
      userId,
      collegeEducationId,
      collegeBranchId,
      users:userId (
        fullName
      ),
      college_education:collegeEducationId (
        collegeEducationType
      ),
      college_branch:collegeBranchId (
        collegeBranchCode
      ),
      student_pins (
        pinNumber
      )
    `,
    )
    .eq("studentId", studentId)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("status", "Active")
    .is("deletedAt", null)
    .maybeSingle<{
      studentId: number;
      userId: number;
      collegeEducationId: number;
      collegeBranchId: number;
      users: { fullName: string | null } | { fullName: string | null }[] | null;
      college_education: { collegeEducationType: string | null } | { collegeEducationType: string | null }[] | null;
      college_branch: { collegeBranchCode: string | null } | { collegeBranchCode: string | null }[] | null;
      student_pins: { pinNumber: string | null } | { pinNumber: string | null }[] | null;
    }>();

  if (studentError) {
    throw createSportsRoomLogError("fetchSportsRoomStudentContext", studentError);
  }

  if (!student) {
    throw new Error("No active student found for the entered ID.");
  }

  const { data: currentAcademic, error: academicError } = await supabase
    .from("student_academic_history")
    .select(
      `
      collegeAcademicYearId,
      collegeSectionsId,
      college_academic_year:collegeAcademicYearId (
        collegeAcademicYear
      ),
      college_sections:collegeSectionsId (
        collegeSections
      )
    `,
    )
    .eq("studentId", student.studentId)
    .eq("isCurrent", true)
    .is("deletedAt", null)
    .order("updatedAt", { ascending: false })
    .limit(1)
    .maybeSingle<{
      collegeAcademicYearId: number;
      collegeSectionsId: number;
      college_academic_year: { collegeAcademicYear: string | null } | { collegeAcademicYear: string | null }[] | null;
      college_sections: { collegeSections: string | null } | { collegeSections: string | null }[] | null;
    }>();

  if (academicError) {
    throw createSportsRoomLogError("fetchSportsRoomStudentContext", academicError);
  }

  const { data: latestAcademic, error: latestAcademicError } = currentAcademic
    ? { data: null, error: null }
    : await supabase
      .from("student_academic_history")
      .select(
        `
        collegeAcademicYearId,
        collegeSectionsId,
        college_academic_year:collegeAcademicYearId (
          collegeAcademicYear
        ),
        college_sections:collegeSectionsId (
          collegeSections
        )
      `,
      )
      .eq("studentId", student.studentId)
      .is("deletedAt", null)
      .order("updatedAt", { ascending: false })
      .limit(1)
      .maybeSingle<{
        collegeAcademicYearId: number;
        collegeSectionsId: number;
        college_academic_year: { collegeAcademicYear: string | null } | { collegeAcademicYear: string | null }[] | null;
        college_sections: { collegeSections: string | null } | { collegeSections: string | null }[] | null;
      }>();

  if (latestAcademicError) {
    throw createSportsRoomLogError("fetchSportsRoomStudentContext", latestAcademicError);
  }

  const academic = currentAcademic ?? latestAcademic;

  if (!academic) {
    throw new Error("Academic year and section are not assigned for this student.");
  }

  const user = getFirstRelated(student.users);
  const pin = getFirstRelated(student.student_pins);
  const education = getFirstRelated(student.college_education);
  const branch = getFirstRelated(student.college_branch);
  const year = getFirstRelated(academic.college_academic_year);
  const section = getFirstRelated(academic.college_sections);

  return {
    studentId: student.studentId,
    fullName: user?.fullName ?? `Student ${student.studentId}`,
    rollNo: pin?.pinNumber ?? String(student.studentId),
    collegeEducationId: student.collegeEducationId,
    collegeBranchId: student.collegeBranchId,
    collegeAcademicYearId: academic.collegeAcademicYearId,
    collegeSectionsId: academic.collegeSectionsId,
    collegeEducationType: education?.collegeEducationType ?? null,
    collegeBranchCode: branch?.collegeBranchCode ?? null,
    collegeAcademicYear: year?.collegeAcademicYear ?? null,
    collegeSections: section?.collegeSections ?? null,
  } satisfies SportsRoomStudentContext;
}
