import { NextResponse } from "next/server";
import { calculatePayrollEngine } from "@/lib/helpers/Hr/payroll/payrollCalculationEngine";
import { createClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collegeId, month, year, processedBy } = body;

    if (!collegeId || !month || !year || !processedBy) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Since DB tables aren't physically created yet, we just run the engine and mock the DB insert
    const result = await calculatePayrollEngine(collegeId, month, year, processedBy);

    // Use authenticated client so RLS allows inserts by this HR user
    const supabase = await createClient();

    const now = new Date().toISOString();

    const runPayload = {
      ...result.run,
      createdAt: now,
      updatedAt: now
    };

    // Soft-delete any existing draft runs for this month/year to prevent duplicates
    await supabase
      .from("payroll_runs")
      .update({ is_deleted: true, isActive: false, deletedAt: now })
      .eq("collegeId", collegeId)
      .eq("payrollMonth", month)
      .eq("payrollYear", year)
      .is("deletedAt", null);

    const { data: run, error: runError } = await supabase
      .from("payroll_runs")
      .insert(runPayload)
      .select("payrollRunId")
      .single();

    if (runError) throw runError;

    const entriesToInsert = result.entries.map((e: any) => ({
      payrollRunId: run.payrollRunId,
      userId: e.userId,
      monthlySalary: e.monthlySalary,
      perDayRate: e.perDayRate,
      totalPayableDays: e.totalPayableDays,
      fullDaysWorked: e.fullDaysWorked,
      halfDays: e.halfDays,
      absentDays: e.absentDays,
      lopDays: e.lopDays,
      grossEarnings: e.grossEarnings,
      totalDeductions: e.totalDeductions,
      netPay: e.netPay,
      status: e.status,
      createdAt: now,
      updatedAt: now
    }));

    const { error: entryError } = await supabase.from("payroll_entries").insert(entriesToInsert);
    if (entryError) throw entryError;

    return NextResponse.json({
      success: true,
      message: "Payroll calculated successfully",
      data: result.run, // Return summary data to frontend
    });

  } catch (error: any) {
    console.error("Payroll run error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payroll" },
      { status: 500 }
    );
  }
}
