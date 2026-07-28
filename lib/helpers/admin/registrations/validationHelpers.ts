import { supabase } from "@/lib/supabaseClient";

export const resolveStudentIdFromPin = async (
  pinNumber: string,
  collegeIntId: number
): Promise<number> => {
  const normalizedPin = pinNumber.trim();

  const { data, error } = await supabase
    .from("student_pins")
    .select("studentId")
    .eq("pinNumber", normalizedPin)
    .eq("collegeId", collegeIntId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .maybeSingle();

  if (error || !data?.studentId) {
    throw new Error(`Student not found for pin number "${normalizedPin}"`);
  }

  return data.studentId as number;
};

export const assertParentStudentAvailable = async (
  studentId: number,
  collegeIntId: number
): Promise<void> => {
  const { data, error } = await supabase
    .from("parents")
    .select("parentId")
    .eq("studentId", studentId)
    .eq("collegeId", collegeIntId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) {
    throw new Error("Parent already registered for this student.");
  }
};

export const assertIdentifierAvailable = async (
  role: string,
  identifierValue: string,
  collegeIntId: number,
  currentUserId?: number | null
): Promise<void> => {
  const normalizedIdentifier = identifierValue.trim().toUpperCase();

  if (!normalizedIdentifier) return;

  if (role === "Student") {
    const { data, error } = await supabase
      .from("student_pins")
      .select("studentPinId, studentId")
      .ilike("pinNumber", normalizedIdentifier)
      .eq("collegeId", collegeIntId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      throw new Error(`Student with roll no "${normalizedIdentifier}" already exists.`);
    }

    return;
  }

  if (role !== "Parent") {
    const { data, error } = await supabase
      .from("employee_ids")
      .select("employeeIdPk, userId")
      .ilike("employeeId", normalizedIdentifier)
      .eq("collegeId", collegeIntId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data && data.userId !== currentUserId) {
      throw new Error(`Employee with employee id "${normalizedIdentifier}" already exists.`);
    }
  }
};
