import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const username = "admin";
  const password = "7093256562@Shiva";
  const url = "http://192.168.1.10:80/ISAPI/AccessControl/UserInfo/Record?format=json&devIndex=081D810D-D2F0-463E-8792-350ADD9A0FB6";

  const firstRes = await fetch(url, { method: "POST" });
  const wwwAuth = firstRes.headers.get("www-authenticate") || "";

  const realm = wwwAuth.match(/realm="([^"]+)"/)?.[1] ?? "";
  const nonce = wwwAuth.match(/nonce="([^"]+)"/)?.[1] ?? "";
  const qop   = wwwAuth.match(/qop="?([^",]+)"?/)?.[1] ?? "";

  const { createHash } = await import("crypto");
  const nc = "00000001";
  const cnonce = Math.random().toString(36).substring(2, 10);
  const method = "POST";
  const uri = new URL(url).pathname + new URL(url).search;

  const ha1 = createHash("md5").update(`${username}:${realm}:${password}`).digest("hex");
  const ha2 = createHash("md5").update(`${method}:${uri}`).digest("hex");

  const responseHash = qop
    ? createHash("md5").update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`).digest("hex")
    : createHash("md5").update(`${ha1}:${nonce}:${ha2}`).digest("hex");

  const authHeader = qop
    ? `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${responseHash}"`
    : `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${responseHash}"`;

  const finalRes = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader,
    },
    body: JSON.stringify(body),
  });

  const data = await finalRes.json();
  console.log("Hikvision final response:", data);
  return NextResponse.json(data, { status: finalRes.status });
}