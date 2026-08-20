const http = require('http');

http.get('http://localhost:3000/admin/assignments/EEE/subject/5?facultyId=gbHJdmfrXB', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`LOCATION: ${res.headers.location}`);
  res.on('data', (chunk) => {
    // console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
