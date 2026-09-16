const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadHelper(error = null) {
  const filters = [];
  const query = new Proxy({}, {
    get: (_, method) => method === 'then'
      ? (resolve) => resolve({ data: [], count: 0, error })
      : (...args) => { filters.push([method, ...args]); return query; },
  });
  const exports = {};
  const source = fs.readFileSync('lib/helpers/faculty/facultyLabManualHelper.ts', 'utf8');
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, {
    exports, console: { error() {} },
    require: () => ({ supabase: { from: () => query } }),
  });
  return { fetch: exports.fetchLabManualsForStudent, filters };
}

for (const branchId of [null, 7]) {
  test(`lab manuals retain academic scope with branch ${branchId}`, async () => {
    const { fetch, filters } = loadHelper();
    await fetch({ collegeId: 1, collegeEducationId: 2, collegeBranchId: branchId,
      collegeAcademicYearId: 6, collegeSectionsId: 3 });
    assert.ok(filters.some(([method, field, value]) =>
      method === (branchId === null ? 'is' : 'eq') &&
      field === 'college_subjects.collegeBranchId' && value === branchId));
    for (const [field, value] of [['collegeSectionsId', 3], ['collegeAcademicYearId', 6],
      ['college_subjects.collegeId', 1], ['college_subjects.collegeEducationId', 2]]) {
      assert.ok(filters.some(([method, key, actual]) => method === 'eq' && key === field && actual === value));
    }
  });
}

test('query failures are surfaced instead of reported as an empty list', async () => {
  const { fetch } = loadHelper(new Error('Database unavailable'));
  await assert.rejects(fetch({ collegeId: 1, collegeEducationId: 2,
    collegeBranchId: null, collegeAcademicYearId: 6, collegeSectionsId: 3 }), /Database unavailable/);
});
