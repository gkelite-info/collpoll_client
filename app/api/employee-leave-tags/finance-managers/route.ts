import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

type FinanceManagerUser = {
  userId: number;
  fullName: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = Number(searchParams.get("collegeId"));
    const excludeUserId = Number(searchParams.get("excludeUserId"));

    if (!collegeId) {
      return NextResponse.json(
        { error: "collegeId is required" },
        { status: 400 },
      );
    }

    const { data: educationTypes, error: educationTypesError } =
      await supabaseAdmin
        .from("finance_manager_education_types")
        .select("financeManagerId")
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null);

    if (educationTypesError) throw educationTypesError;

    const mappedFinanceManagerIds = Array.from(
      new Set(
        (educationTypes ?? [])
          .map((row) => row.financeManagerId as number)
          .filter(Boolean),
      ),
    );

    if (!mappedFinanceManagerIds.length) {
      return NextResponse.json({ options: [] });
    }

    let financeManagerQuery = supabaseAdmin
      .from("finance_manager")
      .select("financeManagerId, userId")
      .eq("collegeId", collegeId)
      .in("financeManagerId", mappedFinanceManagerIds)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null);

    if (excludeUserId) {
      financeManagerQuery = financeManagerQuery.neq("userId", excludeUserId);
    }

    const { data: registrations, error: registrationsError } =
      await financeManagerQuery;

    if (registrationsError) throw registrationsError;

    const userIds = Array.from(
      new Set(
        (registrations ?? [])
          .map((registration) => registration.userId as number)
          .filter(Boolean),
      ),
    );

    if (!userIds.length) {
      return NextResponse.json({ options: [] });
    }

    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("userId, fullName")
      .in("userId", userIds)
      .eq("collegeId", collegeId)
      .eq("role", "FinanceManager")
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .order("fullName", { ascending: true });

    if (usersError) throw usersError;

    const options = ((users ?? []) as FinanceManagerUser[]).map((user) => ({
      taggedUserId: user.userId,
      taggedRole: "FinanceManager",
      label: user.fullName?.trim() || `User ${user.userId}`,
    }));

    return NextResponse.json({ options });
  } catch (error) {
    console.error("[employee-leave-tags/finance-managers]", error);
    return NextResponse.json(
      { error: "Unable to fetch finance managers" },
      { status: 500 },
    );
  }
}
