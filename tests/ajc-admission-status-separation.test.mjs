import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const helperPath = new URL("../lib/helpers/admin/achieversAdmissionsHelper.ts", import.meta.url);
const routePath = new URL("../app/api/emails/send-admissions/route.ts", import.meta.url);

test("AJC payment and admission statuses use separate database fields", async () => {
  const [helper, route] = await Promise.all([
    readFile(helperPath, "utf8"),
    readFile(routePath, "utf8"),
  ]);

  assert.doesNotMatch(helper, /user\.admissionStatus \|\| user\.applicationStatus/);
  assert.doesNotMatch(helper, /user\.applicationStatus \|\|/);
  assert.match(helper, /const rawStatus = \(user\.admissionStatus \|\| ""\)/);
  assert.match(helper, /usersQuery\.ilike\("admissionStatus"/);
  assert.match(route, /\.update\(\s*\{ admissionStatus: status,/s);
  assert.doesNotMatch(route, /\{ applicationStatus: status,/);
});
