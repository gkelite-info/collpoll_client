const fs = require('fs');
const files = [
  'd:/collpoll_client/app/(screens)/admin/(dashboard)/components/modal/registration/AddUserBasicFields.tsx',
  'd:/collpoll_client/app/(screens)/admin/(dashboard)/components/modal/addUserModal.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/className="(w-full|flex-1|w-20)([^"]*)border-gray-200([^"]*)py-1([^"]*)focus:ring-\[#48C78E\]([^"]*)"/g, (match, p1, p2, p3, p4, p5) => {
    return `className="${p1}${p2}border-gray-200${p3}py-2${p4}focus:border-[#48C78E] focus:ring-1 focus:ring-[#48C78E]${p5}"`;
  });
  fs.writeFileSync(f, content);
});

console.log('Done');
