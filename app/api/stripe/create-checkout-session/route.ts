import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe/stripe";

export async function POST(req: Request) {
  const { amount, studentId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "College Fee Payment",
            description: `Student ID: ${studentId}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],

    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/successful`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
