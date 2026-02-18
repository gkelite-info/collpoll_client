import { supabase } from "@/lib/supabaseClient";
import { stripe } from "../../../../lib/stripe/stripe";

export async function POST(req: Request) {
  const { studentId, feeStructureId, amount } = await req.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "inr",
    metadata: {
      studentId,
      feeStructureId,
    },
  });

  await supabase.from("student_fee_transactions").insert({
    studentId,
    feeStructureId,
    stripePaymentIntentId: paymentIntent.id,
    amount,
    status: "PENDING",
  });

  return Response.json({
    clientSecret: paymentIntent.client_secret,
  });
}
