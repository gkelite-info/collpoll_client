import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || to.length === 0) {
      return NextResponse.json({ success: true, message: "No recipients" });
    }

    const BATCH_SIZE = 50;
    const chunks = [];

    for (let i = 0; i < to.length; i += BATCH_SIZE) {
      chunks.push(to.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
      await resend.emails.send({
        from: "Tekton Campus <vamshivadla@gkeliteinfo.com>",
        to: chunk,
        subject,
        html,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Meeting Email API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
