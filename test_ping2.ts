import * as dotenv from "dotenv";
dotenv.config();

async function testPing() {
  const url = `http://192.168.1.6:80/doc/page/login.asp`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), method: "GET" });
    console.log("Ping success:", res.status);
  } catch (err: any) {
    console.error("Ping error:", err.message);
  }
}

testPing();
