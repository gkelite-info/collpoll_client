import Stripe from "stripe";
import { headers } from "next/headers";
import { processStripePayment } from "@/lib/helpers/student/payments/services/processStripePayment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await processStripePayment({
      studentFeeObligationId: Number(session.metadata?.studentFeeObligationId),

      collegeSemesterId: Number(session.metadata?.collegeSemesterId),

      gatewayTransactionId: session.payment_intent as string,

      gatewayOrderId: session.id,

      amount: (session.amount_total ?? 0) / 100,

      stripeSession: session,
    });
  }

  return new Response("OK", {
    status: 200,
  });
}

// export async function POST(req: Request) {
//   console.log("Webhook received");

//   const body = await req.text();

//   console.log("Body:", body);

//   return new Response("OK", { status: 200 });
// }
