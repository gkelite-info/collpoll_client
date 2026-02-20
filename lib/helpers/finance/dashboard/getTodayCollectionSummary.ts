import { supabase } from "@/lib/supabaseClient";

type TodayCollectionFilters = {
  collegeId: number;
  collegeEducationId: number;
};

export async function getTodayCollectionSummary(
  filters: TodayCollectionFilters
) {
  const { collegeId, collegeEducationId } = filters;

  console.log("🚀 getTodayCollectionSummary called with:", filters);

  /* 1️⃣ Get Active Students */

  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("studentId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("status", "Active")
    .eq("isActive", true)
    .is("deletedAt", null);

  if (studentError) {
    console.error("❌ Students Query Error:", studentError);
    return { todayTotal: 0 };
  }

  console.log("📊 Active Students Count:", students?.length);

  if (!students?.length) {
    console.log("⚠️ No active students found");
    return { todayTotal: 0 };
  }

  const studentIds = students.map((s) => s.studentId);

  /* 2️⃣ Get Obligations */

  const { data: obligations, error: obligationError } = await supabase
    .from("student_fee_obligation")
    .select("studentFeeObligationId")
    .in("studentId", studentIds)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (obligationError) {
    console.error("❌ Obligations Query Error:", obligationError);
    return { todayTotal: 0 };
  }

  console.log("📊 Obligations Count:", obligations?.length);

  if (!obligations?.length) {
    console.log("⚠️ No obligations found");
    return { todayTotal: 0 };
  }

  const obligationIds = obligations.map(
    (o) => o.studentFeeObligationId
  );

  /* 3️⃣ Get SUCCESS Transactions */

  const { data: transactions, error: transactionError } = await supabase
    .from("student_payment_transaction")
    .select("studentPaymentTransactionId")
    .in("studentFeeObligationId", obligationIds)
    .eq("paymentStatus", "success");

  if (transactionError) {
    console.error("❌ Transactions Query Error:", transactionError);
    return { todayTotal: 0 };
  }

  console.log("📊 Success Transactions Count:", transactions?.length);

  if (!transactions?.length) {
    console.log("⚠️ No successful transactions found");
    return { todayTotal: 0 };
  }

  const transactionIds = transactions.map(
    (t) => t.studentPaymentTransactionId
  );

  /* 4️⃣ Filter Today Ledgers */

  const today = new Date();

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0, 0, 0
  ).toISOString();

  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23, 59, 59
  ).toISOString();

  console.log("📅 Today Start:", todayStart);
  console.log("📅 Today End:", todayEnd);

  const { data: ledgers, error: ledgerError } = await supabase
    .from("student_fee_ledger")
    .select("amount, createdAt")
    .in("studentPaymentTransactionId", transactionIds)
    .gte("createdAt", todayStart)
    .lte("createdAt", todayEnd);

  if (ledgerError) {
    console.error("❌ Ledger Query Error:", ledgerError);
    return { todayTotal: 0 };
  }

  console.log("📊 Today Ledgers Count:", ledgers?.length);

  if (!ledgers?.length) {
    console.log("⚠️ No ledger entries found for today");
    return { todayTotal: 0 };
  }

  /* 5️⃣ Sum Amount */

  const todayTotal = ledgers.reduce(
    (sum, l) => sum + (Number(l.amount) || 0),
    0
  );

  console.log("💰 Final Today Total:", todayTotal);

  return { todayTotal };
}