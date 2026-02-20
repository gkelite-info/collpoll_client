import { stripe } from "@/lib/stripe/stripe";

export async function POST(req: Request) {
  try {
    const { amount, studentFeeObligationId, collegeSemesterId } =
      await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

      metadata: {
        studentFeeObligationId: studentFeeObligationId.toString(),

        collegeSemesterId: collegeSemesterId.toString(),
      },

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "College Fee Payment",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/successful`,

      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/cancelled`,
    });

    return Response.json({
      url: session.url,
    });
  } catch (err: any) {
    console.error(err);

    return Response.json({ error: err.message }, { status: 500 });
  }
}
