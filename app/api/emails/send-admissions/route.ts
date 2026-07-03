import { NextResponse } from "next/server";
import { Resend } from "resend";
import { gkeliteSupabase } from "@/lib/gkeliteSupabaseClient";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { recipients, templateType } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, error: "No recipients provided." }, { status: 400 });
    }

    if (!templateType) {
      return NextResponse.json({ success: false, error: "Template type is required." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not defined in environment variables.");
      return NextResponse.json(
        { success: false, error: "Email service configuration missing." },
        { status: 500 }
      );
    }

    const formatDate = (dateStr?: string) => {
      const d = dateStr ? new Date(dateStr) : new Date();
      return `${String(d.getDate()).padStart(2, "0")}-${d.toLocaleString("en-US", { month: "short" })}-${d.getFullYear()}`;
    };

    const emailPayloads = recipients.map((recipient: any) => {
      const { emailId, firstName, lastName, applicationNumber, course, applicationFor, createdAt } = recipient;

      let subject = "";
      let emailContent = "";

      if (templateType === "congratulate") {
        subject = `Admission Selection Offer - ${applicationNumber}`;
        emailContent = `
          <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
          <p>Congratulations! We are pleased to inform you that you have been selected for admission at Badruka Group.</p>
          <p>We were highly impressed by your academic record and qualifications, and we are confident that you will thrive in our dynamic learning environment.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 40%;">Application Ref No:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${applicationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Level of Study:</td>
                <td style="padding: 6px 0; color: #334155;">${applicationFor || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Course / Branch:</td>
                <td style="padding: 6px 0; color: #334155;">${course}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Submission Date:</td>
                <td style="padding: 6px 0; color: #334155;">${formatDate(createdAt)}</td>
              </tr>
            </table>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ol style="padding-left: 20px;">
            <li>Log in to the Admissions Portal using your registered email and <strong>Application Ref No</strong> to view and accept your formal admission offer.</li>
            <li>Proceed to complete the initial admission/tuition fee payment to secure your seat.</li>
            <li>Keep your original certificates ready for the document verification round.</li>
          </ol>
        `;
      } else if (templateType === "verification") {
        subject = `Certificate Verification Schedule - ${applicationNumber}`;
        emailContent = `
          <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
          <p>We have reviewed your application and would like to invite you for the physical verification of your certificates and documents as part of the admission process.</p>
          <p>Please report to the Admissions Office with your original certificates and documents at your earliest convenience to complete your enrollment.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 40%;">Application Ref No:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${applicationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Level of Study:</td>
                <td style="padding: 6px 0; color: #334155;">${applicationFor || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Course / Branch:</td>
                <td style="padding: 6px 0; color: #334155;">${course}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Submission Date:</td>
                <td style="padding: 6px 0; color: #334155;">${formatDate(createdAt)}</td>
              </tr>
            </table>
          </div>

          <p><strong>Required Documents (Original + 2 sets of photocopies):</strong></p>
          <ol style="padding-left: 20px;">
            <li>SSC / 10th Standard Marks Memo.</li>
            <li>Intermediate / 12th Standard Marks Memo (or Degree/UG memo for PG admissions).</li>
            <li>Transfer Certificate (TC) and Conduct Certificate.</li>
            <li>Study / Bonafide Certificates for the last 7 years.</li>
            <li>Government-issued ID Proof (Aadhaar Card, Passport, etc.).</li>
          </ol>

          <p>Please visit the campus between 10:00 AM and 4:00 PM on any working day (Monday to Saturday) on or before <strong>${formatDate(
          (() => {
            const d = new Date();
            let added = 0;
            while (added < 7) {
              d.setDate(d.getDate() + 1);
              if (d.getDay() !== 0) added++;
            }
            return d.toISOString();
          })()
        )}</strong>.</p>
        `;
      } else if (templateType === "regret") {
        subject = `Admission Status Update - ${applicationNumber}`;
        emailContent = `
          <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
          <p>Thank you for your interest in Badruka Group. We have carefully reviewed your application.</p>
          <p>We regret to inform you that, due to the high volume of applications and limited seat capacity, we are unable to offer you admission at this time.</p>
          <p>We appreciate the time and effort you put into your application, and we wish you all the best in your future academic endeavors.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 40%;">Application Ref No:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${applicationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Level of Study:</td>
                <td style="padding: 6px 0; color: #334155;">${applicationFor || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Course / Branch:</td>
                <td style="padding: 6px 0; color: #334155;">${course}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Submission Date:</td>
                <td style="padding: 6px 0; color: #334155;">${formatDate(createdAt)}</td>
              </tr>
            </table>
          </div>
        `;
      }

      return {
        from: "Badruka Admissions <admissions@gkeliteinfo.com>",
        to: [emailId],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <div style="background-color: #007bff; color: white; text-align: center; padding: 15px; border-radius: 6px 6px 0 0; font-size: 20px; font-weight: bold;">
              BADRUKA ADMISSIONS
            </div>
            <div style="padding: 20px; color: #334155; line-height: 1.6;">
              ${emailContent}
              <p>If you have any questions or require support, please contact us at <a href="mailto:helpdesk@badruka.com" style="color: #007bff; text-decoration: none;">helpdesk@badruka.com</a>.</p>
              <p style="margin-top: 30px;">Best regards,<br/><strong>Admissions Office</strong><br/>GK Elite / Badruka Group</p>
            </div>
            <div style="text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
              This is an automated notification. Please do not reply directly to this email.
            </div>
          </div>
        `
      };
    });

    const BATCH_SIZE = 100;
    for (let i = 0; i < emailPayloads.length; i += BATCH_SIZE) {
      const chunk = emailPayloads.slice(i, i + BATCH_SIZE);
      const { error } = await resend.batch.send(chunk);
      if (error) {
        console.error("Resend batch send error:", error);
        return NextResponse.json(
          { success: false, error: error.message || "Error sending email via Resend" },
          { status: 500 }
        );
      }
    }

    // Update the database records' admissionStatus
    const applicationIds = recipients.map((r: any) => r.applicationId).filter(Boolean);
    let dbStatus = "Pending";
    if (templateType === "congratulate") dbStatus = "Selected";
    else if (templateType === "verification") dbStatus = "Verification";
    else if (templateType === "regret") dbStatus = "Regret";

    if (applicationIds.length > 0) {
      const { error: dbUpdateError } = await gkeliteSupabase
        .from("lead_applications")
        .update({ admissionStatus: dbStatus })
        .in("applicationId", applicationIds);

      if (dbUpdateError) {
        console.error("Failed to update database admissionStatus:", dbUpdateError);
      }
    }

    return NextResponse.json({ success: true, count: recipients.length });
  } catch (error: any) {
    console.error("Send email route exception:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
