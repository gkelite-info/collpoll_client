import assert from "node:assert/strict";
import test from "node:test";

import {
  completeAdmissionsEmailSend,
  resolveAdmissionsSender,
  resolveAchieversServiceKey,
} from "../app/api/emails/send-admissions/service.mjs";

const recipients = [
  {
    applicationId: 3,
    applicationNumber: "AJC-2026-0003",
    emailId: "student@example.com",
  },
];

test("uses the college-admin verified address with the Achievers sender name", () => {
  assert.equal(
    resolveAdmissionsSender(undefined),
    "Achievers Admissions <admissions@gkeliteinfo.com>",
  );
  assert.equal(
    resolveAdmissionsSender("AJC Admissions <admissions@verified.example>"),
    "AJC Admissions <admissions@verified.example>",
  );
});

test("accepts the dedicated AJC service key or the AJC backend service-key name", () => {
  assert.equal(resolveAchieversServiceKey("dedicated-key", "generic-key"), "dedicated-key");
  assert.equal(resolveAchieversServiceKey(undefined, "generic-key"), "generic-key");
  assert.equal(resolveAchieversServiceKey(undefined, undefined), undefined);
});

test("does not update AJC status when email delivery fails", async () => {
  let statusUpdates = 0;

  await assert.rejects(
    completeAdmissionsEmailSend({
      recipients,
      templateType: "verification",
      deliver: async () => {
        throw new Error("SMTP authentication failed");
      },
      updateAjcStatus: async () => {
        statusUpdates += 1;
      },
      updateCollegeStatus: async () => {
        statusUpdates += 1;
      },
    }),
    /SMTP authentication failed/,
  );

  assert.equal(statusUpdates, 0);
});

test("updates only AJC users after successful delivery to AJC applications", async () => {
  const updates = [];

  const result = await completeAdmissionsEmailSend({
    recipients,
    templateType: "verification",
    deliver: async () => undefined,
    updateAjcStatus: async (applicationNumbers, status) => {
      updates.push({ database: "ajc", applicationNumbers, status });
    },
    updateCollegeStatus: async () => {
      updates.push({ database: "college" });
    },
  });

  assert.deepEqual(updates, [
    {
      database: "ajc",
      applicationNumbers: ["AJC-2026-0003"],
      status: "Verification",
    },
  ]);
  assert.deepEqual(result, { count: 1, status: "Verification" });
});

test("updates only college lead applications after successful delivery to numeric application IDs", async () => {
  const updates = [];

  await completeAdmissionsEmailSend({
    recipients: [{ applicationId: 42, applicationNumber: "APP-42", emailId: "student@example.com" }],
    templateType: "regret",
    deliver: async () => undefined,
    updateAjcStatus: async () => {
      updates.push({ database: "ajc" });
    },
    updateCollegeStatus: async (applicationIds, status) => {
      updates.push({ database: "college", applicationIds, status });
    },
  });

  assert.deepEqual(updates, [
    { database: "college", applicationIds: [42], status: "Regret" },
  ]);
});
