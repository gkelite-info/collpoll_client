// Run with: node --test scripts/total-user-members.test.cjs
// Uses the real Supabase query builder with an in-memory HTTP transport.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { createClient } = require('@supabase/supabase-js');
const source = ts.transpileModule(fs.readFileSync('lib/helpers/admin/totalUserMembers.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function setup(respond) {
  const requests = [];
  const client = createClient('https://test.invalid', 'test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, init) => {
      const url = new URL(input);
      const request = { table: url.pathname.split('/').pop(), params: url.searchParams, method: init.method, headers: init.headers };
      requests.push(request);
      const result = respond(request) ?? {};
      return new Response(request.method === 'HEAD' ? null : JSON.stringify(result.data ?? []), {
        status: result.status ?? 200,
        headers: { 'Content-Type': 'application/json', 'Content-Range': `0-0/${result.count ?? result.data?.length ?? 0}` },
      });
    } },
  });
  const context = { exports: {}, require: () => ({ supabase: client }) };
  vm.runInNewContext(source, context);
  return { api: context.exports, requests };
}

test('school students use education scope without a branch and preserve server count/pagination', async () => {
  const { api, requests } = setup(({ table }) => table === 'students' ? { data: [{ userId: 7 }, { userId: 8 }] } : { data: [{ userId: 8, fullName: 'Student' }], count: 2 });
  const result = await api.fetchRoleMembers('STUDENT', { collegeId: 1, educationId: 4 }, 2, 1);
  assert.equal(result.count, 2);
  assert.equal(result.members[0].userId, 8);
  const scope = requests.find(r => r.table === 'students').params;
  assert.equal(scope.get('collegeEducationId'), 'eq.4');
  assert.equal(scope.has('collegeBranchId'), false);
  const users = requests.find(r => r.table === 'users').params;
  assert.equal(users.get('userId'), 'in.(7,8)');
  assert.equal(users.get('offset'), '1');
  assert.equal(users.get('limit'), '1');
});

test('multi-assignment faculty are included and deduplicated with their primary profile', async () => {
  const { api, requests } = setup(({ table, params }) => {
    if (table === 'faculty') return { data: [{ facultyId: 10 }] };
    if (params.get('collegeEducationId') === 'eq.4' && params.get('collegeBranchId') === 'eq.6') return { data: [
      { facultySectionId: 1, facultyId: 10 }, { facultySectionId: 2, facultyId: 20 }, { facultySectionId: 3, facultyId: 20 },
    ] };
    return { data: [] };
  });
  assert.deepEqual(Array.from(await api.getFacultyIds({ collegeId: 1, educationId: 4, branchId: 6 })), [10, 20]);
  const assignments = requests.filter(r => r.table === 'faculty_sections');
  assert.ok(assignments.every(r => r.params.get('faculty.collegeId') === 'eq.1'));
  assert.ok(assignments.some(r => r.params.get('college_subjects.collegeBranchId') === 'eq.6'));
  const fallback = assignments.find(r => r.params.get('college_sections.collegeBranchId') === 'eq.6');
  assert.equal(fallback.params.get('collegeBranchId'), 'is.null');
  assert.equal(fallback.params.get('branch_subject'), 'is.null');
  assert.equal(fallback.params.get('branch_subject.collegeBranchId'), 'not.is.null');
});

test('school faculty assignments do not require a branch', async () => {
  const { api, requests } = setup(({ table, params }) => table === 'faculty_sections' && params.get('collegeEducationId') === 'eq.4' ? { data: [{ facultySectionId: 1, facultyId: 20 }] } : { data: [] });
  assert.deepEqual(Array.from(await api.getFacultyIds({ collegeId: 1, educationId: 4 })), [20]);
  assert.ok(requests.every(r => !r.params.has('collegeBranchId')));
});

test('finance and accountant memberships include both legacy and mapped education', async () => {
  for (const role of ['FINANCE', 'FINANCE_MANAGER', 'ACCOUNTANT']) {
    const { api, requests } = setup(({ params }) => ({ data: [{ userId: params.has('collegeEducationId') ? 10 : 20 }] }));
    assert.deepEqual(Array.from(await api.getRoleMemberIds(role, { collegeId: 1, educationId: 4 })).sort(), [10, 20]);
    assert.ok(requests.every(r => r.params.get('collegeId') === 'eq.1'));
    if (role !== 'ACCOUNTANT') assert.ok(requests.every(r => r.params.get('type') === (role === 'FINANCE' ? 'eq.executive' : 'eq.manager')));
  }
});

test('admin legacy fallback excludes profiles with active education mappings', async () => {
  const { api, requests } = setup(() => ({ data: [] }));
  await api.getRoleMemberIds('ADMIN', { collegeId: 1, educationId: 4 });
  const legacy = requests.find(r => r.params.has('collegeEducationId')).params;
  assert.equal(legacy.get('admin_education_types'), 'is.null');
  assert.equal(legacy.get('admin_education_types.isActive'), 'eq.true');
});

test('parents are scoped through their children on the backend', async () => {
  const { api, requests } = setup(() => ({ data: [] }));
  await api.getRoleMemberIds('PARENT', { collegeId: 1, educationId: 4, branchId: 6 });
  assert.equal(requests[0].params.get('students.collegeEducationId'), 'eq.4');
  assert.equal(requests[0].params.get('students.collegeBranchId'), 'eq.6');
});

test('wellbeing executives retain inherited manager assignments', async () => {
  const { api, requests } = setup(({ params }) => {
    if (params.get('roleType') === 'eq.wellbeingManager') return { data: [{ userId: 30 }] };
    if (params.has('byManager')) return { data: [{ userId: 40 }] };
    return { data: [{ userId: 20 }] };
  });
  assert.deepEqual(Array.from(await api.getRoleMemberIds('WELLBEING_EXECUTIVE', { collegeId: 1, educationId: 4, branchId: 6 })), [20, 40]);
  assert.ok(requests.some(r => r.params.get('byManager') === 'in.(30)'));
  assert.ok(requests.some(r => r.params.get('wellbeing_college_details.collegeBranchId') === 'eq.6'));
});

test('identifier lookup continues past the backend row limit', async () => {
  const { api, requests } = setup(({ params }) => ({ data: params.get('offset') === '0' ? Array.from({ length: 500 }, (_, i) => ({ userId: i + 1 })) : [{ userId: 501 }] }));
  assert.equal((await api.getRoleMemberIds('STUDENT', { collegeId: 1 })).length, 501);
  assert.equal(requests.length, 2);
});

test('count requests use the same scope and an exact backend count', async () => {
  const { api, requests } = setup(({ table }) => table === 'students' ? { data: [{ userId: 7 }] } : { count: 1 });
  assert.equal((await api.fetchRoleMembers('STUDENT', { collegeId: 1, educationId: 4 }, 1, 10, true)).count, 1);
  assert.equal(requests.at(-1).method, 'HEAD');
  assert.equal(requests.at(-1).params.get('userId'), 'in.(7)');
});

test('invalid branch/education combinations cannot broaden the result', async () => {
  const { api, requests } = setup(() => ({ data: [] }));
  assert.equal((await api.fetchRoleMembers('FINANCE', { collegeId: 1, educationId: 4, branchId: 6 })).count, 0);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].params.get('collegeEducationId'), 'eq.4');
});

test('institution-wide roles remain queryable under education and branch filters', async () => {
  for (const role of ['COLLEGE_HR', 'PLACEMENT_OFFICER']) {
    const { api, requests } = setup(({ table }) => table === 'college_branch' ? { data: { collegeEducationId: 4 } } : { data: [{ userId: 1 }], count: 1 });
    assert.equal((await api.fetchRoleMembers(role, { collegeId: 1, educationId: 4, branchId: 6 })).count, 1);
    assert.ok(requests.at(-1).params.has('role'));
  }
});

test('backend failures are propagated instead of appearing as empty lists', async () => {
  const { api } = setup(() => ({ status: 400, data: { message: 'Query failed', code: 'TEST' } }));
  await assert.rejects(api.fetchRoleMembers('STUDENT', { collegeId: 1 }), err => err.message === 'Query failed');
});
