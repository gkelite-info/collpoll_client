import { supabase } from "@/lib/supabaseClient";

export type FinanceCalendarRow = {
  financeCalendarId: number;
  eventTitle: string;
  eventTopic: string;
  date: string;
  fromTime: string;
  toTime: string;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export async function fetchFinanceCalendarEvents(createdBy: number) {
  const { data, error } = await supabase
    .from("finance_calendar")
    .select(
      `
      financeCalendarId,
      eventTitle,
      eventTopic,
      date,
      fromTime,
      toTime,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `,
    )
    .eq("createdBy", createdBy)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("date", { ascending: true })
    .order("fromTime", { ascending: true });

  if (error) {
    console.error("fetchFinanceCalendarEvents error:", error);
    throw error;
  }

  return data ?? [];
}

export async function fetchFinanceCalendarEventById(financeCalendarId: number) {
  const { data, error } = await supabase
    .from("finance_calendar")
    .select(
      `
      financeCalendarId,
      eventTitle,
      eventTopic,
      date,
      fromTime,
      toTime,
      createdBy
    `,
    )
    .eq("financeCalendarId", financeCalendarId)
    .is("deletedAt", null)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchExistingFinanceCalendarEvent(payload: {
  date: string;
  fromTime: string;
  toTime: string;
  createdBy: number;
}) {
  const { data, error } = await supabase
    .from("finance_calendar")
    .select("financeCalendarId")
    .eq("date", payload.date)
    .eq("fromTime", payload.fromTime)
    .eq("toTime", payload.toTime)
    .eq("createdBy", payload.createdBy)
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

// export async function saveFinanceCalendarEvent(
//   payload: {
//     financeCalendarId?: number;
//     eventTitle: string;
//     eventTopic: string;
//     date: string;
//     fromTime: string;
//     toTime: string;
//   },
//   createdBy: number,
// ) {
//   const now = new Date().toISOString();

//   const insertData: any = {
//     eventTitle: payload.eventTitle.trim(),
//     eventTopic: payload.eventTopic.trim(),
//     date: payload.date,
//     fromTime: payload.fromTime,
//     toTime: payload.toTime,
//     createdBy,
//     updatedAt: now,
//   };

//   if (payload.financeCalendarId) {
//     insertData.financeCalendarId = payload.financeCalendarId;
//   } else {
//     insertData.createdAt = now;
//   }

//   const { data, error } = await supabase
//     .from("finance_calendar")
//     .upsert(insertData, {
//       onConflict: "date, fromTime, toTime, createdBy",
//     })
//     .select("financeCalendarId")
//     .single();

//   if (error) {
//     console.error("saveFinanceCalendarEvent error:", error);
//     return { success: false, error };
//   }

//   return {
//     success: true,
//     financeCalendarId: data.financeCalendarId,
//   };
// }

export async function saveFinanceCalendarEvent(
  payload: {
    financeCalendarId?: number;
    eventTitle: string;
    eventTopic: string;
    date: string;
    fromTime: string;
    toTime: string;
  },
  createdBy: number,
) {
  const now = new Date().toISOString();

  if (payload.financeCalendarId) {
    // 1. UPDATE EXISTING (Leave out createdAt so Postgres doesn't complain)
    const { data, error } = await supabase
      .from("finance_calendar")
      .update({
        eventTitle: payload.eventTitle.trim(),
        eventTopic: payload.eventTopic.trim(),
        date: payload.date,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        createdBy,
        updatedAt: now,
      })
      .eq("financeCalendarId", payload.financeCalendarId)
      .select("financeCalendarId")
      .single();

    if (error) {
      console.error("saveFinanceCalendarEvent update error:", error);
      return { success: false, error };
    }

    return {
      success: true,
      financeCalendarId: data.financeCalendarId,
    };
  } else {
    // 2. INSERT NEW (Explicitly pass createdAt for new records)
    const { data, error } = await supabase
      .from("finance_calendar")
      .insert({
        eventTitle: payload.eventTitle.trim(),
        eventTopic: payload.eventTopic.trim(),
        date: payload.date,
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        createdBy,
        createdAt: now,
        updatedAt: now,
      })
      .select("financeCalendarId")
      .single();

    if (error) {
      console.error("saveFinanceCalendarEvent insert error:", error);
      return { success: false, error };
    }

    return {
      success: true,
      financeCalendarId: data.financeCalendarId,
    };
  }
}

export async function saveFinanceCalendarSection(
  payload: {
    financeCalendarSectionId?: number;
    financeCalendarId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeSemesterId: number;
    collegeSectionsId: number;
  },
  createdBy: number,
) {
  const now = new Date().toISOString();

  // Dynamically build the payload
  const insertData: any = {
    financeCalendarId: payload.financeCalendarId,
    collegeEducationId: payload.collegeEducationId,
    collegeBranchId: payload.collegeBranchId,
    collegeAcademicYearId: payload.collegeAcademicYearId,
    collegeSemesterId: payload.collegeSemesterId,
    collegeSectionsId: payload.collegeSectionsId,
    createdBy,
    updatedAt: now,
  };

  // If we have an ID, we are updating. If not, we are inserting, so add createdAt.
  if (payload.financeCalendarSectionId) {
    insertData.financeCalendarSectionId = payload.financeCalendarSectionId;
  } else {
    insertData.createdAt = now; // <-- Crucial for new inserts!
  }

  const { data, error } = await supabase
    .from("finance_calendar_sections")
    .upsert(insertData, {
      onConflict:
        "financeCalendarId, collegeEducationId, collegeBranchId, collegeAcademicYearId, collegeSemesterId, collegeSectionsId",
    })
    .select("financeCalendarSectionId")
    .single();

  if (error) {
    console.error("saveFinanceCalendarSection error:", error);
    return { success: false, error };
  }

  return {
    success: true,
    financeCalendarSectionId: data.financeCalendarSectionId,
  };
}

export async function deactivateFinanceCalendarEvent(
  financeCalendarId: number,
) {
  const { error } = await supabase
    .from("finance_calendar")
    .update({
      isActive: false,
      deletedAt: new Date().toISOString(),
    })
    .eq("financeCalendarId", financeCalendarId);

  if (error) {
    console.error("deactivateFinanceCalendarEvent error:", error);
    return { success: false };
  }

  return { success: true };
}
