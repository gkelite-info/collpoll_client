import type { PlacementCompany } from "@/app/(screens)/placement/placements/components/mockData";
import { supabase } from "@/lib/supabaseClient";

type PlacementCompanyRow = {
  placementCompanyId: number;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyJobDescription: string;
  companyWebsite: string;
  jobRoleOffered: string;
  requiredSkills: string[];
  jobType: string;
  workMode: string;
  location: string;
  annualPackage: string | number;
  driveType: string;
  companyLogo: string;
  companyCertificate: string;
  startDate: string;
  endDate: string;
  eligibilityCriteria: string;
  collegeId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  createdBy: number;
  is_deleted: boolean | null;
  createdAt: string;
};

type BranchRow = {
  collegeBranchId: number;
  collegeEducationId: number | null;
  collegeBranchCode: string | null;
  collegeBranchType: string | null;
};

type BranchInfo = {
  name: string;
  collegeEducationId?: number;
};

type EducationRow = {
  collegeEducationId: number;
  collegeEducationType: string | null;
};

type AcademicYearRow = {
  collegeAcademicYearId: number;
  collegeAcademicYear: string | null;
};

function formatEnumLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatJobType(value: string) {
  const labels: Record<string, string> = {
    fulltime: "Full Time",
    internship: "Internship",
    contract: "Contract",
  };

  return labels[value] ?? formatEnumLabel(value);
}

function formatDriveType(value: string) {
  const labels: Record<string, string> = {
    virtual: "Virtual",
    inperson: "In Person",
  };

  return labels[value] ?? formatEnumLabel(value);
}

function formatWorkMode(value: string) {
  const labels: Record<string, string> = {
    onsite: "Onsite",
    hybrid: "Hybrid",
    remote: "Remote",
  };

  return labels[value] ?? formatEnumLabel(value);
}

function formatPackage(value: string | number) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  return `${amount.toLocaleString("en-IN")} Lpa`;
}

function splitLocations(location: string) {
  return location
    .split(/[, ]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getStorageUrl(bucket: "placement-logos" | "placement-certificates", path: string) {
  if (path.startsWith("http")) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function getCompanyGroupKey(row: PlacementCompanyRow) {
  return [
    row.companyName,
    row.companyEmail,
    row.jobRoleOffered,
    row.collegeId,
    row.collegeBranchId,
    row.collegeAcademicYearId,
    row.createdBy,
    row.createdAt,
  ].join("|");
}

async function getBranchInfoMap(branchIds: number[]) {
  if (branchIds.length === 0) return new Map<number, BranchInfo>();

  const { data, error } = await supabase
    .from("college_branch")
    .select("collegeBranchId,collegeEducationId,collegeBranchCode,collegeBranchType")
    .in("collegeBranchId", branchIds);

  if (error) {
    console.error("Failed to fetch placement company branch names:", error);
    return new Map<number, BranchInfo>();
  }

  return new Map(
    ((data ?? []) as BranchRow[]).map((branch) => [
      branch.collegeBranchId,
      {
        name: branch.collegeBranchCode || branch.collegeBranchType || "",
        collegeEducationId: branch.collegeEducationId || undefined,
      },
    ]),
  );
}

async function getEducationMap(educationIds: number[]) {
  if (educationIds.length === 0) return new Map<number, string>();

  const { data, error } = await supabase
    .from("college_education")
    .select("collegeEducationId,collegeEducationType")
    .in("collegeEducationId", educationIds);

  if (error) {
    console.error("Failed to fetch placement company education names:", error);
    return new Map<number, string>();
  }

  return new Map(
    ((data ?? []) as EducationRow[]).map((education) => [
      education.collegeEducationId,
      education.collegeEducationType || "",
    ]),
  );
}

async function getAcademicYearMap(academicYearIds: number[]) {
  if (academicYearIds.length === 0) return new Map<number, string>();

  const { data, error } = await supabase
    .from("college_academic_year")
    .select("collegeAcademicYearId,collegeAcademicYear")
    .in("collegeAcademicYearId", academicYearIds);

  if (error) {
    console.error("Failed to fetch placement company academic years:", error);
    return new Map<number, string>();
  }

  return new Map(
    ((data ?? []) as AcademicYearRow[]).map((academicYear) => [
      academicYear.collegeAcademicYearId,
      academicYear.collegeAcademicYear || "",
    ]),
  );
}

function mapRowsToCompanies(
  rows: PlacementCompanyRow[],
  branchInfoMap: Map<number, BranchInfo>,
  educationMap: Map<number, string>,
  academicYearMap: Map<number, string>,
): PlacementCompany[] {
  const groupedCompanies = new Map<string, PlacementCompany>();

  rows.forEach((row) => {
    const groupKey = getCompanyGroupKey(row);
    const existingCompany = groupedCompanies.get(groupKey);

    if (existingCompany) {
      const certificateUrl = getStorageUrl(
        "placement-certificates",
        row.companyCertificate,
      );

      if (!existingCompany.attachments.includes(certificateUrl)) {
        existingCompany.attachments.push(certificateUrl);
      }
      if (!existingCompany.placementCompanyIds?.includes(row.placementCompanyId)) {
        existingCompany.placementCompanyIds?.push(row.placementCompanyId);
      }
      return;
    }

    const jobType = formatJobType(row.jobType);
    const packageDetails = formatPackage(row.annualPackage);
    const locations = splitLocations(row.location);
    const locationTag = locations.join(", ");
    const companyLogoUrl = getStorageUrl("placement-logos", row.companyLogo);
    const certificateUrl = getStorageUrl(
      "placement-certificates",
      row.companyCertificate,
    );
    const branchInfo = branchInfoMap.get(row.collegeBranchId);
    const collegeEducationId = branchInfo?.collegeEducationId;

    groupedCompanies.set(groupKey, {
      id: row.placementCompanyId,
      name: row.companyName,
      role: row.jobRoleOffered,
      description: row.companyJobDescription,
      longDescription: row.companyJobDescription,
      skills: row.requiredSkills ?? [],
      tags: [jobType, locationTag, packageDetails].filter(Boolean),
      email: row.companyEmail,
      phone: row.companyPhone || "Not provided",
      website: row.companyWebsite,
      packageDetails,
      driveType: formatDriveType(row.driveType),
      driveTypeValue: row.driveType,
      jobTypeValue: row.jobType,
      workMode: formatWorkMode(row.workMode),
      workModeValue: row.workMode,
      eligibilityCriteria: row.eligibilityCriteria,
      collegeEducationId,
      educationTypeName: collegeEducationId
        ? educationMap.get(collegeEducationId)
        : undefined,
      collegeId: row.collegeId,
      collegeBranchId: row.collegeBranchId,
      branchName: branchInfo?.name || undefined,
      collegeAcademicYearId: row.collegeAcademicYearId,
      academicYear: academicYearMap.get(row.collegeAcademicYearId) || undefined,
      createdBy: row.createdBy,
      placementCompanyIds: [row.placementCompanyId],
      studentsPlaced: 0,
      locations,
      attachments: [certificateUrl],
      logo: companyLogoUrl,
      startDate: row.startDate,
      endDate: row.endDate,
    });
  });

  return Array.from(groupedCompanies.values());
}

export async function getPlacementCompanies({
  collegeId,
  placementOfficerId,
}: {
  collegeId: number;
  placementOfficerId?: number | null;
}) {
  let query = supabase
    .from("placement_companies")
    .select(
      "placementCompanyId,companyName,companyEmail,companyPhone,companyJobDescription,companyWebsite,jobRoleOffered,requiredSkills,jobType,workMode,location,annualPackage,driveType,companyLogo,companyCertificate,startDate,endDate,eligibilityCriteria,collegeId,collegeBranchId,collegeAcademicYearId,createdBy,is_deleted,createdAt",
    )
    .eq("collegeId", collegeId)
    .eq("is_deleted", false)
    .order("createdAt", { ascending: false });

  if (placementOfficerId) {
    query = query.eq("createdBy", placementOfficerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch placement companies:", error);
    throw error;
  }

  const rows = (data ?? []) as PlacementCompanyRow[];
  const branchIds = Array.from(
    new Set(rows.map((row) => row.collegeBranchId).filter(Boolean)),
  );
  const academicYearIds = Array.from(
    new Set(rows.map((row) => row.collegeAcademicYearId).filter(Boolean)),
  );

  const branchInfoMap = await getBranchInfoMap(branchIds);
  const educationIds = Array.from(
    new Set(
      Array.from(branchInfoMap.values())
        .map((branchInfo) => branchInfo.collegeEducationId)
        .filter(Boolean),
    ),
  ) as number[];

  const [educationMap, academicYearMap] = await Promise.all([
    getEducationMap(educationIds),
    getAcademicYearMap(academicYearIds),
  ]);

  return mapRowsToCompanies(rows, branchInfoMap, educationMap, academicYearMap);
}
