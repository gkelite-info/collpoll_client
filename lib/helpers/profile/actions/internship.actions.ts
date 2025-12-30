"use server";

import {
  InternshipInsert,
  InternshipUpdate,
} from "@/lib/helpers/profile/types";
import { revalidatePath } from "next/cache";
import {
  createInternship,
  deleteInternship,
  getInternshipsByStudent,
  updateInternship,
} from "../internshipAPI";

export async function createInternshipAction(payload: InternshipInsert) {
  try {
    const data = await createInternship(payload);
    revalidatePath("/profile");
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getInternshipsAction(studentId: number) {
  try {
    return await getInternshipsByStudent(studentId);
  } catch (error) {
    throw error;
  }
}

export async function updateInternshipAction(
  id: number,
  payload: InternshipUpdate
) {
  try {
    const data = await updateInternship(id, payload);
    revalidatePath("/profile");
    return data;
  } catch (error) {
    throw error;
  }
}

export async function deleteInternshipAction(id: number) {
  try {
    await deleteInternship(id);
    revalidatePath("/profile");
  } catch (error) {
    throw error;
  }
}
