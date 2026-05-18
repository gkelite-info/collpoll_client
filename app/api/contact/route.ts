import { fetchExistingTektonDemoRequest, saveTektonDemoRequest } from "@/lib/helpers/tekton_demo_request_mailsAPI";
import { NextResponse } from "next/server";
import { Resend } from "resend";


const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    const { firstName, lastName, institution, email } = await req.json();

    if (!firstName || !lastName || !institution || !email) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await fetchExistingTektonDemoRequest(email);

    if (!existing.success) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (existing.data) {
        return NextResponse.json(
            { error: "A demo request with this email already exists." },
            { status: 409 }
        );
    }

    const saved = await saveTektonDemoRequest({
        firstName,
        lastName,
        institutionName: institution,
        workEmail: email,
    });

    if (!saved.success) {
        return NextResponse.json({ error: "Failed to save request" }, { status: 500 });
    }

    try {
        await resend.emails.send({
            from: "TEKTON CAMPUS <noreply@gkeliteinfo.com>",
            to: ["business@tektoncampus.com"],
            subject: `New Demo Request — ${firstName} ${lastName}`,
            html: `
        <h2>New Demo Request</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Institution:</strong> ${institution}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      `,
            replyTo: email,
        });
    } catch (emailError) {
        console.error("Resend error:", emailError);
        return NextResponse.json({ error: "Email failed", details: String(emailError) }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}