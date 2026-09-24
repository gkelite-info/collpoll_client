import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagePath = new URL("../app/(screens)/admin/admissions/page.tsx", import.meta.url);
const screenPath = new URL(
  "../app/(screens)/admin/admissions/components/AdmissionApplications.tsx",
  import.meta.url,
);
const applicationViewModalPath = new URL(
  "../app/(screens)/admin/admissions/applications/ApplicationViewModal.tsx",
  import.meta.url,
);
const sharedApplicationViewModalPath = new URL(
  "../app/(screens)/college-admin/admissions/applications/ApplicationViewModal.tsx",
  import.meta.url,
);

test("admin admissions exposes an admission applications pill", async () => {
  const source = await readFile(pagePath, "utf8");

  assert.match(source, /Admission Applications/);
  assert.match(source, /<AdmissionApplications\s*\/>/);
});

test("admission applications UI is dynamic for AJC and includes overview and list screens", async () => {
  const source = await readFile(screenPath, "utf8");

  assert.match(source, /Admissions Overview/);
  assert.match(source, /Recent Applications/);
  assert.match(source, /All Applications/);
  assert.match(source, /ApplicationViewModal/);
  assert.match(source, /Export CSV/);
  assert.match(source, /Payment Status/);
  assert.match(source, /Admission Status/);
  assert.match(source, /Top Applications/);
  assert.match(source, /Min Grade/);
  assert.match(source, /Send Mail/);
  assert.match(source, /Send Admission Emails/);
  assert.match(source, /Certificate Verification/);
  assert.match(source, /Selection Congratulation/);
  assert.match(source, /Admission Regret/);
  assert.match(source, /max-w-\[650px\]/);
  assert.match(source, /Achievers Layout/);
  assert.match(source, /From:/);
  assert.match(source, /I confirm that I want to send this template email/);
  assert.match(source, /gkeliteApi/i);
});

test("admin applications pass selected row data to the full details modal without a database lookup", async () => {
  const [screenSource, modalSource, sharedModalSource] = await Promise.all([
    readFile(screenPath, "utf8"),
    readFile(applicationViewModalPath, "utf8"),
    readFile(sharedApplicationViewModalPath, "utf8"),
  ]);

  assert.match(screenSource, /import ApplicationViewModal from "\.\.\/applications\/ApplicationViewModal"/);
  assert.match(screenSource, /<ApplicationViewModal/);
  assert.doesNotMatch(screenSource, /function ApplicationDetails\(/);

  assert.match(modalSource, /CollegeApplicationViewModal/);
  assert.match(modalSource, /college-admin\/admissions\/applications\/ApplicationViewModal/);
  assert.match(modalSource, /initialData=\{applicationData\}/);
  assert.match(screenSource, /application=\{selectedApplication\}/);
  assert.match(screenSource, /isOpen=\{selectedApplication !== null\}/);
  assert.doesNotMatch(screenSource, /applicationId:\s*14[0-9]/);
  assert.match(sharedModalSource, /useUser/);
  assert.doesNotMatch(sharedModalSource, /useCollegeAdmin/);
});
