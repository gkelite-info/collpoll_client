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
  | "Hostel";

export type WellbeingHostelType =
  | "boyshostel"
  | "girlshostel";

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
) => (registrationType.toLowerCase().trim() === "hostel" ? "hostel" : "college");

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

  if (!payload.collegeDetails?.length && !payload.hostelDetails) {
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

    const { error } = await supabase
      .from("wellbeing_college_details")
      .insert(
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

    const { error } = await supabase
      .from("wellbeing_hostel_details")
      .insert({
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
