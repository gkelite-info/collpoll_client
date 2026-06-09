import { supabase } from "@/lib/supabaseClient";

const err = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CredentialType = "Fingerprint" | "FaceTemplate" | "Card" | "QRCode";

export interface UserCredentialPayload {
  userDeviceCredentialId?: number;
  userId: number;
  collegeId: number;
  credentialType: CredentialType;
  credentialIdentifier: string;
  fingerIndex?: number | null;
  isActive?: boolean;
  enrolledBy: number;
}

export interface UserCredentialRow {
  userDeviceCredentialId: number;
  userId: number;
  collegeId: number;
  credentialType: CredentialType;
  credentialIdentifier: string;
  fingerIndex: number | null;
  isActive: boolean;
  enrolledBy: number;
  enrolledAt: string;
  createdAt: string;
  // Joined
  user?: { fullName: string; email: string; role: string } | null;
}

/* ------------------------------------------------------------------ */
/*  GET — list by college, with user info                              */
/* ------------------------------------------------------------------ */

export const getUserDeviceCredentials = async (
  collegeId: number,
  page = 1,
  limit = 10,
  filters?: { credentialType?: CredentialType; search?: string; userId?: number },
) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let selectStr = "userDeviceCredentialId, userId, collegeId, credentialType, credentialIdentifier, fingerIndex, isActive, enrolledBy, enrolledAt, createdAt";
    if (filters?.search?.trim()) {
      selectStr += ",user:users!inner(fullName, email, role)";
    } else {
      selectStr += ",user:users(fullName, email, role)";
    }

    let query = supabase
      .from("user_device_credentials")
      .select(selectStr, { count: "exact" })
      .eq("collegeId", collegeId)
      .is("deletedAt", null);

    if (filters?.credentialType) query = query.eq("credentialType", filters.credentialType.toLowerCase());
    if (filters?.userId) query = query.eq("userId", filters.userId);

    if (filters?.search?.trim()) {
      const s = filters.search.trim();
      query = query.or(
        `credentialIdentifier.ilike.%${s}%,user.fullName.ilike.%${s}%,user.email.ilike.%${s}%`,
      );
    }

    const { data, error, count } = await query
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const mapFromDB = (t: string): CredentialType => {
      if (t === "card") return "Card";
      if (t === "fingerprint") return "Fingerprint";
      if (t === "facetemplate") return "FaceTemplate";
      return t as CredentialType;
    };

    const mappedData = (data as any[] ?? []).map((row: any) => ({
      ...row,
      credentialType: mapFromDB(row.credentialType),
    }));

    return { success: true as const, data: mappedData as UserCredentialRow[], total: count ?? 0 };
  } catch (e) {
    return { success: false as const, data: [] as UserCredentialRow[], total: 0, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  GET — single user credentials                                      */
/* ------------------------------------------------------------------ */

export const getCredentialsForUser = async (userId: number, collegeId: number) => {
  try {
    const { data, error } = await supabase
      .from("user_device_credentials")
      .select("*")
      .eq("userId", userId)
      .eq("collegeId", collegeId)
      .is("deletedAt", null)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    const mapFromDB = (t: string): CredentialType => {
      if (t === "card") return "Card";
      if (t === "fingerprint") return "Fingerprint";
      if (t === "facetemplate") return "FaceTemplate";
      return t as CredentialType;
    };

    const mappedData = (data as any[] ?? []).map((row: any) => ({
      ...row,
      credentialType: mapFromDB(row.credentialType),
    }));

    return { success: true as const, data: mappedData as UserCredentialRow[] };
  } catch (e) {
    return { success: false as const, data: [], error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  UPSERT                                                             */
/* ------------------------------------------------------------------ */

export const upsertUserCredential = async (payload: UserCredentialPayload) => {
  try {
    const now = new Date().toISOString();
    const { userDeviceCredentialId, ...rest } = payload;

    const base = {
      ...rest,
      credentialType: rest.credentialType.toLowerCase(),
      credentialIdentifier: rest.credentialIdentifier.trim(),
      fingerIndex: rest.credentialType === "Fingerprint" ? rest.fingerIndex ?? null : null,
      isActive: rest.isActive ?? true,
      updatedAt: now,
    };

    // Uniqueness: userId + credentialType + credentialIdentifier
    let uq = supabase
      .from("user_device_credentials")
      .select("userDeviceCredentialId")
      .eq("userId", base.userId)
      .eq("credentialType", base.credentialType)
      .eq("credentialIdentifier", base.credentialIdentifier)
      .is("deletedAt", null);
    if (userDeviceCredentialId) uq = uq.neq("userDeviceCredentialId", userDeviceCredentialId);
    const { data: dup } = await uq;
    if (dup && dup.length > 0)
      return { success: false as const, error: "This credential already exists for the user." };

    if (userDeviceCredentialId) {
      const { data, error } = await supabase
        .from("user_device_credentials")
        .update(base)
        .eq("userDeviceCredentialId", userDeviceCredentialId)
        .select()
        .single();
      if (error) throw error;
      return { success: true as const, data };
    }

    const { data, error } = await supabase
      .from("user_device_credentials")
      .insert({ ...base, enrolledAt: now, createdAt: now })
      .select()
      .single();
    if (error) throw error;
    return { success: true as const, data };
  } catch (e) {
    return { success: false as const, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  DELETE (soft)                                                       */
/* ------------------------------------------------------------------ */

export const deleteUserCredential = async (credentialId: number) => {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("user_device_credentials")
      .update({ isActive: false, deletedAt: now, updatedAt: now })
      .eq("userDeviceCredentialId", credentialId);
    if (error) throw error;
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: err(e) };
  }
};

/* ------------------------------------------------------------------ */
/*  SEARCH users for enrollment (students + staff)                     */
/* ------------------------------------------------------------------ */

export const searchUsersForEnrollment = async (collegeId: number, search: string) => {
  try {
    if (!search || search.trim().length < 2) return { success: true as const, data: [] };

    const { data, error } = await supabase
      .from("users")
      .select("userId, fullName, email, mobile, role")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .or(`fullName.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,mobile.ilike.%${search.trim()}%`)
      .limit(20);

    if (error) throw error;
    return { success: true as const, data: data ?? [] };
  } catch (e) {
    return { success: false as const, data: [], error: err(e) };
  }
};
