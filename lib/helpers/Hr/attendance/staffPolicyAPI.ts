import { adminSupabase } from "@/lib/helpers/devices/scanIngestionHelper";

// In-memory cache to prevent DB overload during biometric bursts
const policyCache = new Map<number, { data: any | null; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const getStaffPolicy = async (collegeId: number, bypassCache = false) => {
    try {
        const now = Date.now();
        if (!bypassCache) {
            const cached = policyCache.get(collegeId);
            if (cached && cached.expiresAt > now) {
                return { success: true, data: cached.data };
            }
        }

        const { data: policy, error } = await adminSupabase
            .from("staff_attendance_policies")
            .select("*")
            .eq("collegeId", collegeId)
            .eq("isActive", true)
            .eq("is_deleted", false)
            .maybeSingle();

        if (error) throw error;

        policyCache.set(collegeId, {
            data: policy,
            expiresAt: now + CACHE_TTL_MS,
        });

        return { success: true, data: policy };
    } catch (error: any) {
        console.error("Error fetching staff policy:", error);
        return { success: false, error: error.message };
    }
};

export const upsertStaffPolicy = async (collegeId: number, userId: number, payload: any) => {
    try {
        const now = new Date().toISOString();
        const { error } = await adminSupabase
            .from("staff_attendance_policies")
            .upsert({
                collegeId,
                createdBy: userId,
                ...payload,
                isActive: true,
                is_deleted: false,
                updatedAt: now,
                createdAt: payload.createdAt || now
            }, { onConflict: "collegeId", ignoreDuplicates: false });

        if (error) throw error;

        // Invalidate cache
        policyCache.delete(collegeId);

        return { success: true, message: "Policy updated successfully" };
    } catch (error: any) {
        console.error("Error upserting staff policy:", error);
        return { success: false, error: error.message };
    }
};
