import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
    const { email, otp } = await req.json();

    await resend.emails.send({
        from: "Auth <onboarding@resend.dev>",
        to: [email],
        subject: "Click link to verify",
        html: `<p>Your OTP is <strong>${otp}</strong></p>`,
    });

    return Response.json({ success: true });
}
