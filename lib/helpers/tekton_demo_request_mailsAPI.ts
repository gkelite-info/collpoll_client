import { supabase } from "@/lib/supabaseClient";

export type TektonDemoRequestRow = {
    tektonDemoMailId: number;
    firstName: string;
    lastName: string;
    institutionName: string;
    workEmail: string;
    createdAt: string;
    updatedAt: string;
};



export async function fetchTektonDemoRequests() {

    const { data, error } = await supabase
        .from("tekton_demo_request_mails")
        .select(`
      tektonDemoMailId,
      firstName,
      lastName,
      institutionName,
      workEmail,
      createdAt,
      updatedAt
    `)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchTektonDemoRequests error:", error);
        throw error;
    }

    return data ?? [];
}



export async function fetchExistingTektonDemoRequest(
    workEmail: string
) {

    const { data, error } = await supabase
        .from("tekton_demo_request_mails")
        .select("tektonDemoMailId")
        .eq("workEmail", workEmail.trim().toLowerCase())
        .single();

    if (error) {

        if (error.code === "PGRST116") {
            return {
                success: true,
                data: null,
            };
        }

        console.error("fetchExistingTektonDemoRequest error:", error);
        return {
            success: false,
            error,
        };
    }

    return {
        success: true,
        data,
    };
}



export async function saveTektonDemoRequest(payload: {
    tektonDemoMailId?: number;
    firstName: string;
    lastName: string;
    institutionName: string;
    workEmail: string;
}) {

    const now = new Date().toISOString();

    const upsertPayload = {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        institutionName: payload.institutionName.trim(),
        workEmail: payload.workEmail.trim().toLowerCase(),
        updatedAt: now,
    };

    if (!payload.tektonDemoMailId) {

        const { data, error } = await supabase
            .from("tekton_demo_request_mails")
            .insert([
                {
                    ...upsertPayload,
                    createdAt: now,
                },
            ])
            .select("tektonDemoMailId")
            .single();

        if (error) {
            console.error("saveTektonDemoRequest insert error:", error);

            return {
                success: false,
                error,
            };
        }

        return {
            success: true,
            tektonDemoMailId: data.tektonDemoMailId,
        };
    }

    const { error } = await supabase
        .from("tekton_demo_request_mails")
        .update(upsertPayload)
        .eq("tektonDemoMailId", payload.tektonDemoMailId);

    if (error) {
        console.error("saveTektonDemoRequest update error:", error);

        return {
            success: false,
            error,
        };
    }

    return {
        success: true,
        tektonDemoMailId: payload.tektonDemoMailId,
    };
}



export async function deleteTektonDemoRequest(
    tektonDemoMailId: number
) {

    const { error } = await supabase
        .from("tekton_demo_request_mails")
        .delete()
        .eq("tektonDemoMailId", tektonDemoMailId);

    if (error) {
        console.error("deleteTektonDemoRequest error:", error);

        return {
            success: false,
            error,
        };
    }

    return {
        success: true,
    };
}



export async function countTektonDemoRequests() {

    const { count, error } = await supabase
        .from("tekton_demo_request_mails")
        .select("*", {
            count: "exact",
            head: true,
        });

    if (error) {
        console.error("countTektonDemoRequests error:", error);
        return 0;
    }

    return count ?? 0;
}