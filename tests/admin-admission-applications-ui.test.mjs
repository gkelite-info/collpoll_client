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
const admissionsPagePath = new URL("../app/(screens)/admin/admissions/page.tsx", import.meta.url);
const courseAdmissionsPath = new URL("../app/(screens)/admin/admissions/components/CourseAdmissions.tsx", import.meta.url);
const admissionFeePath = new URL("../app/(screens)/admin/admissions/components/AdmissionFee.tsx", import.meta.url);

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

test("AJC admission email modal reports progress and enforces workflow eligibility", async () => {
  const source = await readFile(screenPath, "utf8");

  assert.match(source, /toast\.loading\("Sending emails\.\.\."/);
  assert.match(source, /toast\.success\([^;]+\{ id: sendingToastId \}/s);
  assert.match(source, /canSendVerification/);
  assert.match(source, /canSendSelection/);
  assert.match(source, /cursor-pointer/);
  assert.match(source, /disabled:cursor-not-allowed/);
  assert.doesNotMatch(source, /AbortSignal\.timeout/);
  assert.doesNotMatch(source, /console\.error\("Error sending admissions email:"/);
});

test("admin admissions uses dynamic groups, per-screen shimmers, pagination, and pointer states", async () => {
  const [applications, admissionsPage, courses, fees] = await Promise.all([
    readFile(screenPath, "utf8"),
    readFile(admissionsPagePath, "utf8"),
    readFile(courseAdmissionsPath, "utf8"),
    readFile(admissionFeePath, "utf8"),
  ]);

  assert.match(applications, /fetchAdmissionsCourses/);
  assert.match(applications, /databaseGroups/);
  assert.match(applications, /ApplicationsTableShimmer/);
  assert.match(applications, /ApplicationsOverviewShimmer/);
  assert.match(applications, /<Pagination/);
  assert.match(applications, /paginatedApplications/);
  assert.match(applications, /paginatedRecentApplications/);
  assert.match(admissionsPage, /AdmissionsScreenShimmer/);

  for (const source of [applications, admissionsPage, courses, fees]) {
    assert.match(source, /cursor-pointer/);
    assert.match(source, /disabled:cursor-not-allowed/);
  }
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

test("recent application opens a single-row table before details and both views have shimmers", async () => {
  const [screenSource, modalSource] = await Promise.all([
    readFile(screenPath, "utf8"),
    readFile(applicationViewModalPath, "utf8"),
  ]);

  assert.match(screenSource, /handleRecentApplicationClick/);
  assert.match(screenSource, /setSearch\(application\.id\)/);
  assert.match(screenSource, /setScreen\("applications"\)/);
  assert.doesNotMatch(screenSource, /onClick=\{\(\) => setSelectedApplication\(item\)\}[\s\S]{0,150}Latest website submissions/);
  assert.match(screenSource, /ApplicationsTableShimmer/);
  assert.match(modalSource, /ApplicationDetailsShimmer/);
  assert.match(modalSource, /detailsLoading/);
});
