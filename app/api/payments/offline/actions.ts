"use server";

import { createClient } from "@/app/utils/supabase/server";

interface OfflinePaymentInput {
  studentFeeObligationId: number;
  collegeSemesterId: number;
  amount: number;
  paymentMode: string;
  collectedBy: number;
  paymentDate: string;
  notes?: string;
  proof?: string;
}

export async function createOfflinePayment(data: OfflinePaymentInput) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: obligation, error: obError } = await supabase
    .from("student_fee_obligation")
    .select(
      `
    totalAmount,
    student_fee_collection (collectedAmount)
  `,
    )
    .eq("studentFeeObligationId", data.studentFeeObligationId)
    .single();

  if (obError || !obligation) {
    throw new Error("Invalid obligation");
  }

  const alreadyPaid =
    obligation.student_fee_collection?.reduce(
      (sum: number, item: any) => sum + (Number(item.collectedAmount) || 0),
      0,
    ) || 0;

  const remaining = Number(obligation.totalAmount) - alreadyPaid;

  if (data.amount > remaining) {
    throw new Error("Payment exceeds remaining balance");
  }

  const { data: receiptNumber, error: receiptError } = await supabase.rpc(
    "generate_offline_transaction_id",
  );

  if (receiptError) throw receiptError;

  const { data: transaction, error: txError } = await supabase
    .from("student_payment_transaction")
    .insert({
      studentFeeObligationId: data.studentFeeObligationId,
      gatewayTransactionId: receiptNumber,
      gatewayOrderId: receiptNumber,
      paidAmount: data.amount,
      paymentMode: data.paymentMode,
      paymentType: "offline",
      paymentStatus: "success",
      initiatedBy: "Admin",
      collectedBy: data.collectedBy,
      paymentDate: data.paymentDate,
      notes: data.notes ?? null,
      proof: data.proof ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (txError) throw txError;

  const transactionId = transaction.studentPaymentTransactionId;

  const { error: ledgerError } = await supabase
    .from("student_fee_ledger")
    .insert({
      studentFeeObligationId: data.studentFeeObligationId,
      studentPaymentTransactionId: transactionId,
      amount: data.amount,
      remarks: "Offline payment",
      createdAt: now,
      updatedAt: now,
    });

  if (ledgerError) throw ledgerError;

  const { error: collectionError } = await supabase
    .from("student_fee_collection")
    .insert({
      studentPaymentTransactionId: transactionId,
      studentFeeObligationId: data.studentFeeObligationId,
      collegeSemesterId: data.collegeSemesterId,
      collectedAmount: data.amount,
      createdAt: now,
      updatedAt: now,
    });

  if (collectionError) throw collectionError;

  return {
    success: true,
    receiptNumber,
  };
}
