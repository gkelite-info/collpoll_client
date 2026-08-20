const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function getSwagger() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/openapi+json' } });
  const json = await res.json();
  const schemas = json.definitions || (json.components && json.components.schemas);
  if (!schemas) {
    console.log("No schemas found, keys:", Object.keys(json));
  } else {
    console.log(Object.keys(schemas).find(k => k.includes('college_exam_schedules')));
    console.log(schemas['college_exam_schedules']);
  }
}

getSwagger();
