import { supabase } from "@/lib/supabaseClient";

export type CampusBuzzPostRow = {
    campusBuzzPostId: number;
    collegeId: number;
    title: string;
    category: "achievements" | "announcements" | "clubactivities";
    description: string;
    tags?: string | null;
    imageUrl?: string | null;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchCampusBuzzFeed(collegeId: number) {
    const { data, error } = await supabase
        .from("campus_buzz_post")
        .select(`
      campusBuzzPostId,
      title,
      category,
      description,
      tags,
      imageUrl,
      createdBy,
      createdAt
    `)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchCampusBuzzFeed error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchCampusBuzzByCategory(
    collegeId: number,
    category: "achievements" | "announcements" | "clubactivities"
) {
    const { data, error } = await supabase
        .from("campus_buzz_post")
        .select(`
      campusBuzzPostId,
      title,
      description,
      imageUrl,
      createdAt
    `)
        .eq("collegeId", collegeId)
        .eq("category", category)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchCampusBuzzByCategory error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchCampusBuzzPostById(postId: number) {
    const { data, error } = await supabase
        .from("campus_buzz_post")
        .select("*")
        .eq("campusBuzzPostId", postId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .single();

    if (error) {
        console.error("fetchCampusBuzzPostById error:", error);
        throw error;
    }

    return data;
}

export async function checkExistingCampusBuzzPost(
    collegeId: number,
    title: string
) {
    const { data, error } = await supabase
        .from("campus_buzz_post")
        .select("campusBuzzPostId")
        .eq("collegeId", collegeId)
        .eq("title", title.trim())
        .is("deletedAt", null)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        throw error;
    }

    return { success: true, data };
}

export async function saveCampusBuzzPost(
    payload: {
        campusBuzzPostId?: number;
        collegeId: number;
        title: string;
        category: "achievements" | "announcements" | "clubactivities";
        description: string;
        tags?: string;
        imageUrl?: string;
    },
    userId: number
) {
    const now = new Date().toISOString();

    const basePayload: any = {
        collegeId: payload.collegeId,
        title: payload.title.trim(),
        category: payload.category,
        description: payload.description.trim(),
        tags: payload.tags ?? null,
        imageUrl: payload.imageUrl ?? null,
        updatedAt: now,
    };

    if (!payload.campusBuzzPostId) {
        basePayload.createdBy = userId;
        basePayload.createdAt = now;

        const { data, error } = await supabase
            .from("campus_buzz_post")
            .insert([basePayload])
            .select("campusBuzzPostId")
            .single();

        if (error) {
            console.error("saveCampusBuzzPost error:", error);
            return { success: false, error };
        }

        return {
            success: true,
            campusBuzzPostId: data.campusBuzzPostId,
        };
    }

    const { error } = await supabase
        .from("campus_buzz_post")
        .update(basePayload)
        .eq("campusBuzzPostId", payload.campusBuzzPostId);

    if (error) {
        console.error("saveCampusBuzzPost error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        campusBuzzPostId: payload.campusBuzzPostId,
    };
}

export async function deactivateCampusBuzzPost(postId: number) {
    const { error } = await supabase
        .from("campus_buzz_post")
        .update({
            isActive: false,
            is_deleted: true,
            deletedAt: new Date().toISOString(),
        })
        .eq("campusBuzzPostId", postId);

    if (error) {
        console.error("deactivateCampusBuzzPost error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function fetchCampusBuzzByUser(userId: number) {
    const { data, error } = await supabase
        .from("campus_buzz_post")
        .select(`
      campusBuzzPostId,
      title,
      category,
      createdAt
    `)
        .eq("createdBy", userId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchCampusBuzzByUser error:", error);
        throw error;
    }

    return data ?? [];
}