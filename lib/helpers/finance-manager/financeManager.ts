import { supabase } from "@/lib/supabaseClient";

export type FinanceManagerType = "executive" | "manager";

export interface FinanceManagerInsert {
    userId: number;
    collegeId: number;
    collegeEducationId: number;
    createdBy: number;
    isActive?: boolean;
    type?: FinanceManagerType;
}

export interface FinanceManagerUpdate {
    collegeEducationId?: number;
    isActive?: boolean;
    type?: FinanceManagerType;
}


export const getFinanceManagersByCollege = async (collegeId: number) => {
    try {
        const { data, error } = await supabase
            .from("finance_manager")
            .select(`
        financeManagerId,
        userId,
        collegeId,
        collegeEducationId,
        createdBy,
        isActive,
        type,
        createdAt,
        updatedAt,
        users!finance_manager_userId_fkey (
          fullName,
          email,
          mobile,
          profileUrl
        ),
        college_education!finance_manager_collegeEducationId_fkey (
          collegeEducationType
        )
      `)
            .eq("collegeId", collegeId)
            .eq("is_deleted", false)
            .is("deletedAt", null)
            .order("createdAt", { ascending: false });

        if (error) {
            console.error("Error fetching finance managers:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error in getFinanceManagersByCollege:", error);
        return [];
    }
};


export const getFinanceManagerById = async (financeManagerId: number) => {
    try {
        const { data, error } = await supabase
            .from("finance_manager")
            .select(`
        *,
        users!finance_manager_userId_fkey (
          fullName,
          email,
          mobile,
          profileUrl
        ),
        college_education!finance_manager_collegeEducationId_fkey (
          collegeEducationType
        )
      `)
            .eq("financeManagerId", financeManagerId)
            .eq("is_deleted", false)
            .is("deletedAt", null)
            .single();

        if (error) {
            console.error("Error fetching finance manager:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error in getFinanceManagerById:", error);
        return null;
    }
};


export const createFinanceManager = async (managerData: FinanceManagerInsert) => {
    try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from("finance_manager")
            .insert({
                ...managerData,
                createdAt: now,
                updatedAt: now,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating finance manager:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error in createFinanceManager:", error);
        return { success: false, error };
    }
};


export const updateFinanceManager = async (financeManagerId: number, updateData: FinanceManagerUpdate) => {
    try {
        const { data, error } = await supabase
            .from("finance_manager")
            .update({
                ...updateData,
                updatedAt: new Date().toISOString(),
            })
            .eq("financeManagerId", financeManagerId)
            .select()
            .single();

        if (error) {
            console.error("Error updating finance manager:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error in updateFinanceManager:", error);
        return { success: false, error };
    }
};

export const deleteFinanceManager = async (financeManagerId: number) => {
    try {
        const { data, error } = await supabase
            .from("finance_manager")
            .update({
                is_deleted: true,
                deletedAt: new Date().toISOString(),
                isActive: false,
            })
            .eq("financeManagerId", financeManagerId)
            .select()
            .single();

        if (error) {
            console.error("Error deleting finance manager:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error in deleteFinanceManager:", error);
        return { success: false, error };
    }
};


export const getFinanceManagerEducationTypes = async (financeManagerId: number) => {
    try {
        const { data, error } = await supabase
            .from("finance_manager_education_types")
            .select(`
        FinanceManagerEducationId,
        financeManagerId,
        collegeEducationId,
        isActive,
        college_education!finance_manager_education_types_collegeEducationId_fkey (
          collegeEducationType
        )
      `)
            .eq("financeManagerId", financeManagerId)
            .eq("is_deleted", false)
            .is("deletedAt", null);

        if (error) {
            console.error("Error fetching finance manager education types:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error in getFinanceManagerEducationTypes:", error);
        return [];
    }
};


export const addFinanceManagerEducationType = async (financeManagerId: number, collegeEducationId: number) => {
    try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from("finance_manager_education_types")
            .insert({
                financeManagerId,
                collegeEducationId,
                createdAt: now,
                updatedAt: now,
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding finance manager education type:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error in addFinanceManagerEducationType:", error);
        return { success: false, error };
    }
};


export const removeFinanceManagerEducationType = async (financeManagerEducationId: number) => {
    try {
        const { data, error } = await supabase
            .from("finance_manager_education_types")
            .update({
                is_deleted: true,
                deletedAt: new Date().toISOString(),
                isActive: false,
            })
            .eq("FinanceManagerEducationId", financeManagerEducationId)
            .select()
            .single();

        if (error) {
            console.error("Error removing finance manager education type:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error in removeFinanceManagerEducationType:", error);
        return { success: false, error };
    }
};
