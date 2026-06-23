import { supabase } from "@/lib/supabaseClient";

const err = (e: unknown) => {
  if (e instanceof Error) {
    const msg = e.message;
    if (msg.includes("duplicate key value violates unique constraint")) {
      return "This credential already exists for the user.";
    }
    if (msg.includes("violates foreign key constraint")) {
      return "Invalid reference provided.";
    }
    return msg;
  }
  return "Something went wrong. Please try again.";
};

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
  imageUrl?: string | null;
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
  updatedAt?: string;
  imageUrl: string | null;
  user?: { fullName: string; email: string; role: string } | null;
}


export const getUserDeviceCredentials = async (
  collegeId: number,
  page = 1,
  limit = 10,
  filters?: { credentialType?: CredentialType; search?: string; userId?: number },
) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let selectStr = "userDeviceCredentialId, userId, collegeId, credentialType, credentialIdentifier, fingerIndex, isActive, enrolledBy, enrolledAt, createdAt, updatedAt, imageUrl";
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
      
      const { data: matchedUsers } = await supabase
        .from("users")
        .select("userId")
        .eq("collegeId", collegeId)
        .or(`fullName.ilike.%${s}%,email.ilike.%${s}%`)
        .limit(200);

      const userIds = matchedUsers?.map((u) => u.userId) || [];

      if (userIds.length > 0) {
        query = query.or(`credentialIdentifier.ilike.%${s}%,userId.in.(${userIds.join(",")})`);
      } else {
        query = query.or(`credentialIdentifier.ilike.%${s}%`);
      }
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


export const getCredentialsForUser = async (userId: number, collegeId: number) => {
  try {
    const { data, error } = await supabase
      .from("user_device_credentials")
      .select("*, updatedAt")
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
      imageUrl: rest.imageUrl ?? null,
      updatedAt: now,
    };

    let uq = supabase
      .from("user_device_credentials")
      .select("userDeviceCredentialId, deletedAt")
      .eq("userId", base.userId)
      .eq("credentialType", base.credentialType)
      .eq("credentialIdentifier", base.credentialIdentifier);
      
    if (userDeviceCredentialId) {
      uq = uq.neq("userDeviceCredentialId", userDeviceCredentialId);
    }
    
    const { data: existingRecords } = await uq;
    const existing = existingRecords?.[0];

    if (existing) {
      if (!existing.deletedAt) {
        return { success: false as const, error: "This credential already exists for the user." };
      } else {
        const { data, error } = await supabase
          .from("user_device_credentials")
          .update({ ...base, deletedAt: null })
          .eq("userDeviceCredentialId", existing.userDeviceCredentialId)
          .select()
          .single();
        if (error) throw error;
        return { success: true as const, data };
      }
    }

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
    
    let results: any[] = data ?? [];
    
    const studentUserIds = results.filter((u: any) => u.role === "Student").map((u: any) => u.userId);
    if (studentUserIds.length > 0) {
      const { data: studentData } = await supabase
        .from("students")
        .select(`
          userId,
          college_education:collegeEducationId ( collegeEducationType )
        `)
        .in("userId", studentUserIds);
        
      if (studentData) {
        results = results.map((u: any) => {
          if (u.role !== "Student") return u;
          const stu = studentData.find((s: any) => s.userId === u.userId);
          const eduRelation = stu?.college_education;
          const eduType = Array.isArray(eduRelation) ? eduRelation[0]?.collegeEducationType : (eduRelation as any)?.collegeEducationType;
          return { ...u, educationType: eduType };
        });
      }
    }

    const financeUserIds = results.filter((u: any) => u.role === "Finance").map((u: any) => u.userId);
    if (financeUserIds.length > 0) {
      const { data: financeData } = await supabase
        .from("finance_manager")
        .select("userId, type")
        .in("userId", financeUserIds);
        
      if (financeData) {
        results = results.map((u: any) => {
          if (u.role !== "Finance") return u;
          const fin = financeData.find((f: any) => f.userId === u.userId);
          return { ...u, financeManagerType: fin?.type };
        });
      }
    }

    return { success: true as const, data: results };
  } catch (e) {
    return { success: false as const, data: [], error: err(e) };
  }
};


export const uploadFaceCredentialImage = async (userId: number, file: File): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  try {
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || (file.type === "image/png" ? "png" : "jpg");
    const fileName = `FACE_${userId}_${Date.now()}.${fileExtension}`;
    const { data, error } = await supabase.storage
      .from("user_biometric_face_credentials")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      return { success: false, error: "Failed to save image to cloud storage." };
    }

    if (data) {
      const { data: publicUrlData } = supabase.storage
        .from("user_biometric_face_credentials")
        .getPublicUrl(data.path);
      return { success: true, imageUrl: publicUrlData.publicUrl };
    }
    
    return { success: false, error: "Unknown error during upload" };
  } catch (e) {
    return { success: false, error: err(e) };
  }
};
