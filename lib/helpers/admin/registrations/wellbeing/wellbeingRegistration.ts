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
  | "College"
  | "Hostel"
  | "both";
export type WellbeingHostelType = "boyshostel" | "girlshostel";

export type CreateWellbeingCollegeDetail = {
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSectionsId: number;
};

export type CreateWellbeingPayload = {
  userId: number;
  collegeId: number;
  roleType: WellbeingRoleType;
  gender: string;
  employeeId?: string;
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

const createWellbeingBase = async (payload: {
  userId: number;
  collegeId: number;
  roleType: WellbeingRoleType;
  registrationType: WellbeingRegistrationType;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}) => {
  const row = {
    userId: payload.userId,
    collegeId: payload.collegeId,
    roleType: payload.roleType,
    registrationType: payload.registrationType,
    createdBy: payload.createdBy,
    isActive: true,
    is_deleted: false,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  };

  const { data, error } = await supabase
    .from("well_beings")
    .insert(row)
    .select("wellBeingId")
    .single();

  if (error) {
    const shouldRetryWithDisplayValues =
      error.code === "23514" ||
      error.code === "22P02" ||
      error.message?.toLowerCase().includes("invalid input value");

    if (shouldRetryWithDisplayValues) {
      const retryRow = {
        ...row,
        roleType:
          payload.roleType === "wellbeingManager"
            ? "WellbeingManager"
            : "WellbeingExecutive",
        registrationType:
          payload.registrationType === "hostel" ? "Hostel" : "College",
      };

      const { data: retryData, error: retryError } = await supabase
        .from("well_beings")
        .insert(retryRow)
        .select("wellBeingId")
        .single();

      if (retryError) {
        throw new Error(formatSupabaseError("createWellbeingBase", retryError));
      }

      return retryData.wellBeingId as number;
    }

    throw new Error(formatSupabaseError("createWellbeingBase", error));
  }

  return data.wellBeingId as number;
};

const toEmployeeType = (roleType: WellbeingRoleType) =>
  roleType === "wellbeingManager" || roleType === "WellbeingManager"
    ? "WellbeingManager"
    : "WellbeingExecutive";

const formatSupabaseError = (action: string, error: PostgrestError) => {
  return [
    `${action} failed`,
    error?.message,
    error?.details,
    error?.hint,
    error?.code ? `code: ${error.code}` : null,
  ]
    .filter(Boolean)
    .join(" - ");
};

export const createWellbeing = async (payload: CreateWellbeingPayload) => {
  if (!payload.gender?.trim()) {
    throw new Error("Gender is required for wellbeing registration");
  }

  const createdWellBeingIds: number[] = [];
  if (payload.collegeDetails?.length) {
    const wellBeingId = await createWellbeingBase({
      userId: payload.userId,
      collegeId: payload.collegeId,
      roleType: payload.roleType,
      registrationType: "college",
      createdBy: payload.createdBy,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    });

    const uniqueRows = Array.from(
      new Map(
        payload.collegeDetails.map((detail) => [
          [
            detail.collegeEducationId,
            detail.collegeBranchId,
            detail.collegeAcademicYearId,
            detail.collegeSectionsId,
          ].join("-"),
          detail,
        ]),
      ).values(),
    );

    const { error } = await supabase.from("wellbeing_college_details").insert(
      uniqueRows.map((detail) => ({
        wellBeingId,
        collegeEducationId: detail.collegeEducationId,
        collegeBranchId: detail.collegeBranchId,
        collegeAcademicYearId: detail.collegeAcademicYearId,
        collegeSectionsId: detail.collegeSectionsId,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
      })),
    );

    if (error) {
      throw new Error(formatSupabaseError("createWellbeingCollegeDetails", error));
    }

    createdWellBeingIds.push(wellBeingId);
  }
  if (payload.hostelDetails) {
    const wellBeingId = await createWellbeingBase({
      userId: payload.userId,
      collegeId: payload.collegeId,
      roleType: payload.roleType,
      registrationType: "hostel",
      createdBy: payload.createdBy,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    });

    const { error } = await supabase.from("wellbeing_hostel_details").insert({
      wellBeingId,
      block: payload.hostelDetails.block.trim(),
      buildingNumber: payload.hostelDetails.buildingNumber.trim(),
      hostelType: payload.hostelDetails.hostelType,
      isActive: true,
      is_deleted: false,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    });

    if (error) {
      throw new Error(formatSupabaseError("createWellbeingHostelDetails", error));
    }

    createdWellBeingIds.push(wellBeingId);
  }

  if (payload.employeeId?.trim()) {
    await upsertIdentifier({
      userId: payload.userId,
      collegeId: payload.collegeId,
      role: toEmployeeType(payload.roleType),
      identifierValue: payload.employeeId,
    });
  }

  return createdWellBeingIds;
};
