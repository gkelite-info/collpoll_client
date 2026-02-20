"use server";

import {
  createStudentPaymentTransaction,
  updateStudentPaymentStatus,
  fetchPaymentTransactionByGatewayTxnId,
} from "@/lib/helpers/student/payments/student_payment_transactionAPI";

import {
  createStudentFeeLedger,
  fetchLedgerByTransactionId,
} from "@/lib/helpers/student/payments/student_fee_ledgerAPI";

import { createStudentFeeCollection } from "@/lib/helpers/student/payments/student_fee_collectionAPI";

type ProcessStripePaymentPayload = {
  studentFeeObligationId: number;
  collegeSemesterId: number;

  gatewayTransactionId: string; // stripe payment_intent
  gatewayOrderId: string; // stripe checkout session id

  amount: number;

  stripeSession: any;
};

export async function processStripePayment(
  payload: ProcessStripePaymentPayload,
) {
  try {
    /**
     * STEP 1: Check if transaction already exists (idempotency)
     */
    const existing = await fetchPaymentTransactionByGatewayTxnId(
      payload.gatewayTransactionId,
    );

    let transactionId: number;

    if (existing) {
      transactionId = existing.studentPaymentTransactionId;
    } else {
      /**
       * STEP 2: Create transaction
       */
      const txn = await createStudentPaymentTransaction({
        studentFeeObligationId: payload.studentFeeObligationId,

        gatewayTransactionId: payload.gatewayTransactionId,

        gatewayOrderId: payload.gatewayOrderId,

        paidAmount: payload.amount,

        paymentMode: "stripe",
      });

      if (!txn.success) throw new Error("Transaction creation failed");

      transactionId = txn.studentPaymentTransactionId;
    }

    /**
     * STEP 3: Mark transaction success
     */
    await updateStudentPaymentStatus(transactionId, {
      paymentStatus: "success",
      gatewayResponse: payload.stripeSession,
    });

    /**
     * STEP 4: Check ledger exists
     */
    const ledgerExists = await fetchLedgerByTransactionId(transactionId);

    if (!ledgerExists) {
      await createStudentFeeLedger({
        studentFeeObligationId: payload.studentFeeObligationId,

        studentPaymentTransactionId: transactionId,

        amount: payload.amount,

        remarks: "Stripe payment",
      });
    }

    /**
     * STEP 5: Create collection record
     */
    await createStudentFeeCollection({
      studentPaymentTransactionId: transactionId,

      studentFeeObligationId: payload.studentFeeObligationId,

      collegeSemesterId: payload.collegeSemesterId,

      collectedAmount: payload.amount,
    });

    return {
      success: true,
      transactionId,
    };
  } catch (err) {
    console.error("processStripePayment error:", err);

    return {
      success: false,
    };
  }
}
