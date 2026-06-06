import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { upsertIdentifier } from "@/lib/helpers/identifiers/upsertIdentifier";

export type WellbeingRoleType =
  | "wellbeingExecutive"
  | "wellbeingManager"
  | "WellbeingExecutive"
  | "WellbeingManager";

export type WellbeingRegistrationType =
  | "college"
  | "hostel"
  | "both"
  | "College"
  | "Hostel"
  | "Both";

export type WellbeingHostelType =
  | "boyshostel"
  | "girlshostel"
  | "both";

export type CreateWellbeingCollegeDetail = {
  collegeEducationId: number;
  collegeBranchId?: number | null;
  collegeAcademicYearId?: number | null;
  collegeSectionsId?: number | null;
};

export type CreateWellbeingPayload = {
  userId: number;
  collegeId: number;
  roleType: WellbeingRoleType;
  gender: string;
  employeeId?: string;
  dateOfJoining?: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  collegeDetails?: CreateWellbeingCollegeDetail[];
  hostelDetails?: {
    block: string;
    buildingNumber: string;
    hostelType: WellbeingHostelType;
  };
};

const toWellbeingRoleType = (roleType: WellbeingRoleType) =>
  roleType === "wellbeingManager" || roleType === "WellbeingManager"
    ? "wellbeingManager"
    : "wellbeingExecutive";

const toWellbeingRegistrationType = (
  registrationType: WellbeingRegistrationType,
) => {
  const val = registrationType.toLowerCase().trim();
  if (val === "hostel") return "hostel";
  if (val === "both") return "both";
  return "college";
};


const toEmployeeType = (roleType: WellbeingRoleType) =>
  roleType === "wellbeingManager" || roleType === "WellbeingManager"
    ? "WellbeingManager"
    : "WellbeingExecutive";

const formatSupabaseError = (action: string, error: PostgrestError) =>
  [
    `${action} failed`,
    error?.message,
    error?.details,
    error?.hint,
    error?.code ? `code: ${error.code}` : null,
  ]
    .filter(Boolean)
    .join(" - ");

const createWellbeingBase = async (payload: {
  userId: number;
  collegeId: number;
  roleType: WellbeingRoleType;
  registrationType: WellbeingRegistrationType;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}) => {
  const { data, error } = await supabase
    .from("well_beings")
    .insert({
      userId: payload.userId,
      collegeId: payload.collegeId,
      roleType: toWellbeingRoleType(payload.roleType),
      registrationType: toWellbeingRegistrationType(payload.registrationType),
      createdBy: payload.createdBy,
      isActive: true,
      is_deleted: false,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    })
    .select("wellBeingId")
    .single();

  if (error) {
    throw new Error(formatSupabaseError("createWellbeingBase", error));
  }

  return data.wellBeingId as number;
};

export const createWellbeing = async (
  payload: CreateWellbeingPayload,
) => {
  if (!payload.gender?.trim()) {
    throw new Error("Gender is required for wellbeing registration");
  }

  const hasCollege = payload.collegeDetails && payload.collegeDetails.length > 0;
  const hasHostel = !!payload.hostelDetails;

  if (!hasCollege && !hasHostel) {
    throw new Error("Select at least one wellbeing registration detail");
  }

  if (payload.dateOfJoining !== undefined) {
    const { error } = await supabase
      .from("users")
      .update({
        dateOfJoining: payload.dateOfJoining,
        updatedAt: payload.updatedAt,
      })
      .eq("userId", payload.userId)
      .in("role", ["WellbeingExecutive", "WellbeingManager"]);

    if (error) {
      throw new Error(formatSupabaseError("updateWellbeingUserJoiningDate", error));
    }
  }

  let regType: WellbeingRegistrationType = "college";
  if (hasCollege && hasHostel) {
    regType = "both";
  } else if (hasHostel) {
    regType = "hostel";
  }

  const wellBeingId = await createWellbeingBase({
    userId: payload.userId,
    collegeId: payload.collegeId,
    roleType: payload.roleType,
    registrationType: regType,
    createdBy: payload.createdBy,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  });

  if (hasCollege) {
    const uniqueRows = Array.from(
      new Map(
        payload.collegeDetails!.map((detail) => [
          [
            detail.collegeEducationId,
            detail.collegeBranchId ?? "all-branches",
            detail.collegeAcademicYearId ?? "all-years",
            detail.collegeSectionsId ?? "all-sections",
          ].join("-"),
          detail,
        ]),
      ).values(),
    );

    const { error } = await supabase
      .from("wellbeing_college_details")
      .insert(
        uniqueRows.map((detail) => ({
          wellBeingId,
          collegeEducationId: detail.collegeEducationId,
          collegeBranchId: detail.collegeBranchId ?? null,
          collegeAcademicYearId: detail.collegeAcademicYearId ?? null,
          collegeSectionsId: detail.collegeSectionsId ?? null,
          createdAt: payload.createdAt,
          updatedAt: payload.updatedAt,
        })),
      );

    if (error) {
      throw new Error(formatSupabaseError("createWellbeingCollegeDetails", error));
    }
  }

  if (hasHostel) {
    const { error } = await supabase
      .from("wellbeing_hostel_details")
      .insert({
        wellBeingId,
        block: payload.hostelDetails!.block.trim(),
        buildingNumber: payload.hostelDetails!.buildingNumber.trim(),
        hostelType: payload.hostelDetails!.hostelType,
        isActive: true,
        is_deleted: false,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
      });

    if (error) {
      throw new Error(formatSupabaseError("createWellbeingHostelDetails", error));
    }
  }

  if (payload.employeeId?.trim()) {
    await upsertIdentifier({
      userId: payload.userId,
      collegeId: payload.collegeId,
      role: toEmployeeType(payload.roleType),
      identifierValue: payload.employeeId,
    });
  }

  return [wellBeingId];
};
