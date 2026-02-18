import { supabase } from "@/lib/supabaseClient";
import { stripe } from "../../../../lib/stripe/stripe";

export async function POST(req: Request) {
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body,
    req.headers.get("stripe-signature")!,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const studentId = paymentIntent.metadata.studentId;
    const feeStructureId = paymentIntent.metadata.feeStructureId;

    await supabase
      .from("student_fee_transactions")
      .update({ status: "SUCCESS" })
      .eq("stripePaymentIntentId", paymentIntent.id);

    await supabase.from("student_fee_payment").insert({
      studentId,
      feeStructureId,
      paidAmount: paymentIntent.amount / 100,
      paymentMode: "STRIPE",
      stripePaymentIntentId: paymentIntent.id,
    });
  }

  return new Response("OK");
}
