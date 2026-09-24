import { NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { achieversSupabase } from "@/lib/achieversSupabaseClient";
import { gkeliteSupabase } from "@/lib/gkeliteSupabaseClient";
import { formatCourseWithCode } from "@/lib/helpers/admin/achieversAdmissionsHelper";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function POST(req: Request) {
  try {
    const { recipients, templateType } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, error: "No recipients provided." }, { status: 400 });
    }

    if (!templateType) {
      return NextResponse.json({ success: false, error: "Template type is required." }, { status: 400 });
    }

    const formatDate = (dateStr?: string) => {
      const d = dateStr ? new Date(dateStr) : new Date();
      return `${String(d.getDate()).padStart(2, "0")}-${d.toLocaleString("en-US", { month: "short" })}-${d.getFullYear()}`;
    };

    const emailPayloads = recipients.map((recipient: any) => {
      const { emailId, firstName, lastName, applicationNumber, course, applicationFor, createdAt } = recipient;
      const formattedCourse = formatCourseWithCode(course || "Intermediate");

      let subject = "";
      let emailContent = "";

      if (templateType === "congratulate") {
        subject = `Admission Selection Offer - ${applicationNumber}`;
        emailContent = `
          <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
          <p>Congratulations! We are pleased to inform you that you have been selected for admission at <strong>Achievers Junior College</strong>.</p>
          <p>We were highly impressed by your academic record and qualifications, and we are confident that you will thrive in our dynamic learning environment.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 40%;">Application Ref No:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${applicationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Level of Study:</td>
                <td style="padding: 6px 0; color: #334155;">${applicationFor || "Intermediate First Year"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Course / Group:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0047A9;">${formattedCourse}</td>
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
          <p>We have reviewed your application and would like to invite you for the physical verification of your certificates and documents at <strong>Achievers Junior College</strong>.</p>
          <p>Please report to the Admissions Office with your original certificates and documents at your earliest convenience to complete your enrollment.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 40%;">Application Ref No:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${applicationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Level of Study:</td>
                <td style="padding: 6px 0; color: #334155;">${applicationFor || "Intermediate First Year"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Course / Group:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0047A9;">${formattedCourse}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Submission Date:</td>
                <td style="padding: 6px 0; color: #334155;">${formatDate(createdAt)}</td>
              </tr>
            </table>
          </div>

          <p><strong>Required Documents (Original + 2 sets of photocopies):</strong></p>
          <ol style="padding-left: 20px;">
            <li>SSC / Class X Marks Memo.</li>
            <li>Transfer Certificate (TC) and Conduct Certificate.</li>
            <li>Study / Bonafide Certificates.</li>
            <li>Government-issued ID Proof (Aadhaar Card).</li>
          </ol>

          <p>Please visit the campus between 10:00 AM and 4:00 PM on any working day.</p>
        `;
      } else if (templateType === "regret") {
        subject = `Admission Status Update - ${applicationNumber}`;
        emailContent = `
          <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
          <p>Thank you for your interest in <strong>Achievers Junior College</strong>. We have carefully reviewed your application for <strong>${formattedCourse}</strong>.</p>
          <p>We regret to inform you that, due to limited seat capacity, we are unable to offer you admission at this time.</p>
          <p>We appreciate the time and effort you put into your application, and we wish you all the best in your future academic endeavors.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 40%;">Application Ref No:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${applicationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748b;">Course / Group:</td>
                <td style="padding: 6px 0; color: #334155;">${formattedCourse}</td>
              </tr>
            </table>
          </div>
        `;
      }

      return {
        from: process.env.RESEND_FROM_EMAIL || "Achievers Admissions <onboarding@resend.dev>",
        to: [emailId],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #0047A9 0%, #081D36 100%); color: white; text-align: center; padding: 18px; border-radius: 6px 6px 0 0; font-size: 20px; font-weight: bold;">
              ACHIEVERS JUNIOR COLLEGE
            </div>
            <div style="padding: 24px; color: #334155; line-height: 1.6;">
              ${emailContent}
              <p style="margin-top: 30px;">Best regards,<br/><strong>Admissions Office</strong><br/>Achievers Junior College</p>
            </div>
            <div style="text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
              This is an automated notification from Achievers Junior College Admissions Portal.
            </div>
          </div>
        `,
      };
    });

    // Send emails via SMTP if configured, otherwise via Resend
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        for (const payload of emailPayloads) {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `Achievers Admissions <${smtpUser}>`,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
          });
        }
      } catch (smtpErr) {
        console.error("SMTP delivery notice:", smtpErr);
      }
    } else if (process.env.RESEND_API_KEY) {
      const BATCH_SIZE = 100;
      for (let i = 0; i < emailPayloads.length; i += BATCH_SIZE) {
        const chunk = emailPayloads.slice(i, i + BATCH_SIZE);
        try {
          await resend.batch.send(chunk);
        } catch (resendErr) {
          console.error("Resend delivery notice:", resendErr);
        }
      }
    }

    // Map template to database status
    let dbStatus = "Pending Payment";
    if (templateType === "congratulate") dbStatus = "Selected";
    else if (templateType === "verification") dbStatus = "Verification";
    else if (templateType === "regret") dbStatus = "Regret";

    // 1. Update Achievers lead_applications table
    const appNumbers = recipients.map((r: any) => r.applicationNumber).filter(Boolean);
    if (appNumbers.length > 0) {
      const { error: leadUpdateError } = await achieversSupabase
        .from("lead_applications")
        .update({ admissionStatus: dbStatus, updatedAt: new Date().toISOString() })
        .in("applicationNumber", appNumbers);

      if (leadUpdateError) {
        console.error("Failed to update Achievers lead_applications admissionStatus:", leadUpdateError);
      }

      // 2. Also update users table
      const { error: userUpdateError } = await achieversSupabase
        .from("users")
        .update({ applicationStatus: dbStatus, updatedAt: new Date().toISOString() })
        .in("applicationNumber", appNumbers);

      if (userUpdateError) {
        console.error("Failed to update Achievers users applicationStatus:", userUpdateError);
      }
    }

    // 2. Also update lead_applications table if numeric IDs exist
    const applicationIds = recipients
      .map((r: any) => r.applicationId)
      .filter((id: any) => typeof id === "number");

    if (applicationIds.length > 0) {
      await gkeliteSupabase
        .from("lead_applications")
        .update({ admissionStatus: dbStatus })
        .in("applicationId", applicationIds);
    }

    return NextResponse.json({ success: true, count: recipients.length });
  } catch (error: any) {
    console.error("Send email route exception:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
