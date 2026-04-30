//This script Reads en.json, finds missing keys in other languages, translates them via AI in chunks, and updates target JSON files.

import fs from "fs";
import path from "path";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const MESSAGES_DIR = path.join(process.cwd(), "lib", "messages");
const EN_PATH = path.join(MESSAGES_DIR, "en.json");

const TARGET_LANGS = [
  { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" },
];

const CHUNK_SIZE = 20;

function flattenObj(
  obj: Record<string, any>,
  prefix = "",
  res: Record<string, string> = {},
) {
  for (const key in obj) {
    const prop = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenObj(obj[key], prop, res);
    } else {
      res[prop] = obj[key];
    }
  }
  return res;
}

function unflattenObj(data: Record<string, string>) {
  const result: any = {};
  for (const i in data) {
    const keys = i.split(".");
    keys.reduce((acc, curr, idx) => {
      return acc[curr] || (acc[curr] = idx === keys.length - 1 ? data[i] : {});
    }, result);
  }
  return result;
}

function chunkObject(obj: Record<string, string>, size: number) {
  const entries = Object.entries(obj);
  const chunks = [];

  for (let i = 0; i < entries.length; i += size) {
    chunks.push(Object.fromEntries(entries.slice(i, i + size)));
  }

  return chunks;
}

async function run() {
  console.log("🔍 Reading English source file...");

  const enData = JSON.parse(fs.readFileSync(EN_PATH, "utf-8"));
  const flatEn = flattenObj(enData);

  for (const target of TARGET_LANGS) {
    const targetPath = path.join(MESSAGES_DIR, `${target.code}.json`);

    let targetData: Record<string, any> = {};

    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, "utf-8");
      targetData = raw.trim() ? JSON.parse(raw) : {};
    }

    const flatTarget = flattenObj(targetData);
    const missingKeys: Record<string, string> = {};

    for (const key in flatEn) {
      if (!(key in flatTarget)) {
        missingKeys[key] = flatEn[key];
      }
    }

    const missingCount = Object.keys(missingKeys).length;

    if (missingCount === 0) {
      console.log(`✅ ${target.name} is already up to date.`);
      continue;
    }

    console.log(
      `🚀 Found ${missingCount} missing keys for ${target.name}. Translating...`,
    );

    const chunks = chunkObject(missingKeys, CHUNK_SIZE);

    let allTranslations: Record<string, string> = {};

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      console.log(`🔹 Chunk ${i + 1}/${chunks.length}`);

      try {
        const { text } = await generateText({
          model: groq("openai/gpt-oss-20b"),
          temperature: 0,
          prompt: `
You are a STRICT translation engine.

TARGET LANGUAGE: ${target.name}

RULES:
- Translate ONLY into ${target.name}
- NEVER use any other language
- DO NOT mix languages
- DO NOT change keys
- DO NOT add/remove keys
- NO explanation
- NO markdown
- RETURN ONLY valid JSON

If translation is uncertain, still return in ${target.name}, NOT English or any other language.

DATA:
${JSON.stringify(chunk, null, 2)}
`,
        });

        let parsed: Record<string, string> = {};

        try {
          const cleaned = text.replace(/```json|```/g, "").trim();
          parsed = JSON.parse(cleaned);
        } catch (err) {
          console.error("❌ Invalid JSON:\n", text);
          continue;
        }

        if (Object.keys(parsed).length !== Object.keys(chunk).length) {
          console.warn("⚠️ Partial translation detected");
        }

        allTranslations = { ...allTranslations, ...parsed };

        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        console.error("❌ Chunk failed:", err);
      }
    }

    const mergedFlat = { ...flatTarget, ...allTranslations };
    const finalJson = unflattenObj(mergedFlat);

    fs.writeFileSync(targetPath, JSON.stringify(finalJson, null, 2));

    console.log(`🎉 ${target.name} updated successfully`);
  }
}

run();
