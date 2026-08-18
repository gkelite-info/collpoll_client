import fs from 'fs';

const files = [
  'd:/collpoll_client/lib/helpers/student/studentProgress/getStudentProgressData.ts',
  'd:/collpoll_client/app/(screens)/(student)/stu_dashboard/midExams.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replaceAll('.eq("collegeBranchId", studentContext.collegeBranchId)', '.filter("collegeBranchId", studentContext.collegeBranchId === null ? "is" : "eq", studentContext.collegeBranchId)');
  content = content.replaceAll('.eq("collegeBranchId", collegeBranchId)', '.filter("collegeBranchId", collegeBranchId === null ? "is" : "eq", collegeBranchId)');
  fs.writeFileSync(file, content);
}
console.log("Replaced successfully!");
