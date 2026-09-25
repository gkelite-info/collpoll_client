import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { completeAdmissionsEmailSend } from "../app/api/emails/send-admissions/service.mjs";

test("Admissions email service enforces exact TitleCase admissionStatus values", async () => {
  const allowedStatuses = new Set(["Pending", "Verification", "Selected", "Regret"]);

  for (const template of ["congratulate", "verification", "regret", "pending"]) {
    const recordedUpdates = [];
    const result = await completeAdmissionsEmailSend({
      recipients: [{ applicationId: 1, applicationNumber: "AJC-2026-00001", emailId: "test@example.com" }],
      templateType: template,
      deliver: async () => {},
      updateAjcStatus: async (apps, status) => {
        recordedUpdates.push({ apps, status });
      },
      updateCollegeStatus: async (ids, status) => {
        recordedUpdates.push({ ids, status });
      },
    });

    assert.ok(allowedStatuses.has(result.status), `Status ${result.status} must be in allowed set`);
    assert.ok(recordedUpdates.every((u) => allowedStatuses.has(u.status)));
  }
});

test("Website processStripePayment inserts payment transaction with status 'Success'", () => {
  const stripePaymentPath = "D:/achievers-junior-college-website/lib/helpers/processStripePayment.ts";
  if (fs.existsSync(stripePaymentPath)) {
    const content = fs.readFileSync(stripePaymentPath, "utf8");
    // Verify that application_transactions insert uses exact "Success"
    assert.match(content, /INSERT INTO public\.application_transactions/);
    assert.match(content, /"Success"/);
    assert.doesNotMatch(content, /"status"[^)]*\)\s*VALUES\s*\([^)]*"success"/i, "Must not insert lowercase 'success'");
  }
});

test("Website send-admissions route updates admissionStatus with exact TitleCase statuses", () => {
  const websiteRoutePath = "D:/achievers-junior-college-website/src/app/api/emails/send-admissions/route.ts";
  if (fs.existsSync(websiteRoutePath)) {
    const content = fs.readFileSync(websiteRoutePath, "utf8");
    assert.match(content, /SET "admissionStatus" = \$1/);
    assert.match(content, /admissionStatus:\s*"Pending" \| "Verification" \| "Selected" \| "Regret"/);
  }
});
