const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

async function fetchAcademics(branchId, semesterId) {
  const filters = [];
  const subject = {
    collegeId: 1, collegeEducationId: 2, collegeBranchId: branchId,
    collegeAcademicYearId: 6, collegeSemesterId: semesterId, isActive: true, deletedAt: null,
    subjectName: 'Biology', college_academic_year: { collegeAcademicYear: '6th Class' },
    college_subject_units: [3, 4].map(section => ({
      collegeSubjectUnitId: section, unitNumber: 1, unitTitle: 'Animals', collegeSectionsId: section,
      college_subject_unit_topics: [{ collegeSubjectUnitTopicId: section,
        topicTitle: 'Movement', collegeSectionsId: section, isCompleted: true }],
    })),
  };
  const rows = {
    students: { studentId: 9, collegeId: 1, collegeEducationId: 2, collegeBranchId: branchId,
      college_education: { collegeEducationType: branchId === null ? 'SSC' : 'Inter' } },
    student_academic_history: { collegeAcademicYearId: 6, collegeSemesterId: semesterId,
      collegeSectionsId: 3, college_academic_year: { collegeAcademicYear: '6th Class' } },
  };
  const supabase = { from(table) {
    const conditions = [];
    const query = new Proxy({}, { get(_, method) {
      if (method === 'then') return resolve => {
        const matches = conditions.every(([op, key, value]) => {
          if (op === 'eq') return value != null && subject[key] === value;
          if (op === 'is') return subject[key] === value;
          return true;
        });
        resolve({ data: table === 'college_subjects' ? (matches ? [subject] : []) : rows[table], error: null });
      };
      return (...args) => { if (table === 'college_subjects') {
        conditions.push([method, ...args]); filters.push([method, ...args]);
      } return query; };
    }});
    return query;
  }};
  const exports = {};
  const source = fs.readFileSync('lib/helpers/student/academics/studentFetchAcademics.tsx', 'utf8');
  vm.runInNewContext(ts.transpileModule(source + '\nexport { fetchStudentAcademicData };', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, console, require(name) {
    if (name === 'react') return { createContext: () => ({}) };
    if (name.includes('supabaseClient')) return { supabase };
    return {};
  }});
  return { result: await exports.fetchStudentAcademicData(8), filters };
}

for (const [label, branch, semester] of [['SSC', null, null], ['Inter', 7, null], ['College', 7, 10]]) {
  test(`${label} student receives current class subjects and only their section's units`, async () => {
    const { result, filters } = await fetchAcademics(branch, semester);
    assert.equal(result.subjects.length, 1);
    assert.equal(result.profile.year, '6th Class');
    assert.equal(result.subjects[0].academicYear, '6th Class');
    assert.equal(result.subjects[0].units, 1);
    assert.equal(result.subjects[0].unitsData[0].id, 3);
    assert.equal(result.subjects[0].topicsCovered, 1);
    assert.ok(filters.some(([op, key, value]) => op === 'eq' && key === 'collegeId' && value === 1));
    if (semester !== null) assert.ok(filters.some(([op, value]) => op === 'or' && value.includes('collegeSemesterId.eq.10')));
  });
}
