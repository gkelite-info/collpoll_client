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

        // Strip out fields that should NOT be sent to the DB (they come from the frontend request body)
        const { collegeId: _cid, userId: _uid, createdAt: _ca, ...cleanPayload } = payload;

        const dbPayload = {
            graceMinutes: Number(cleanPayload.graceMinutes) || 0,
            halfDayMinPercent: Number(cleanPayload.halfDayMinPercent) || 0,
            halfDayMaxPercent: Number(cleanPayload.halfDayMaxPercent) || 0,
            fullDayMinPercent: Number(cleanPayload.fullDayMinPercent) || 0,
            earlyOutThresholdMin: Number(cleanPayload.earlyOutThresholdMin) || 0,
            lopPerAbsentDay: !!cleanPayload.lopPerAbsentDay,
        };

        // 1. Check if policy already exists (use .limit(1) to avoid crash if duplicates exist)
        const { data: existingRows, error: fetchErr } = await adminSupabase
            .from("staff_attendance_policies")
            .select("policyId")
            .eq("collegeId", collegeId)
            .eq("is_deleted", false)
            .limit(1);

        if (fetchErr) throw fetchErr;

        const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;

        if (existing) {
            // 2. Update existing policy — never touch createdBy or createdAt
            const { error: updateErr } = await adminSupabase
                .from("staff_attendance_policies")
                .update({
                    ...dbPayload,
                    isActive: true,
                    updatedAt: now,
                })
                .eq("policyId", existing.policyId);

            if (updateErr) throw updateErr;
        } else {
            // 3. Insert new policy
            const { error: insertErr } = await adminSupabase
                .from("staff_attendance_policies")
                .insert({
                    collegeId,
                    createdBy: userId,
                    ...dbPayload,
                    isActive: true,
                    is_deleted: false,
                    updatedAt: now,
                    createdAt: now,
                });

            if (insertErr) throw insertErr;
        }

        // Invalidate cache
        policyCache.delete(collegeId);

        return { success: true, message: "Policy updated successfully" };
    } catch (error: any) {
        console.error("Error upserting staff policy:", error);

        // Return user-friendly messages based on error type
        const msg = error?.message || "";
        if (msg.includes("foreign key constraint")) {
            return { success: false, error: "Invalid college or user reference. Please re-login and try again." };
        }
        return { success: false, error: "Unable to save attendance policy. Please try again." };
    }
};
