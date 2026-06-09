import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Dynamic Hikvision device proxy.
 *
 * Accepts a deviceId, looks up the device's connection details from
 * `biometric_devices`, then proxies the request to the device using
 * HTTP Digest authentication.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

/* ---- AES-GCM decrypt (mirrors client encryptionUtils) ------------ */

const ENV_KEY = process.env.NEXT_PUBLIC_DEVICE_ENCRYPTION_KEY;
const DEFAULT_KEY = "collpoll-biometric-enc-key-0032!";

async function decryptPassword(encryptedBase64: string): Promise<string> {
  const raw = ENV_KEY || DEFAULT_KEY;
  const keyBytes = new TextEncoder().encode(raw.padEnd(32, "0").slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
  const combined = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertext);
  return new TextDecoder().decode(plainBuf);
}

/* ---- Digest auth helper ------------------------------------------ */

async function digestFetch(
  url: string,
  method: string,
  username: string,
  password: string,
  body?: string,
  contentType = "application/json",
) {
  const { createHash } = await import("crypto");

  // Step 1: challenge
  const challengeRes = await fetch(url, { method });
  const wwwAuth = challengeRes.headers.get("www-authenticate") || "";

  const realm = wwwAuth.match(/realm="([^"]+)"/)?.[1] ?? "";
  const nonce = wwwAuth.match(/nonce="([^"]+)"/)?.[1] ?? "";
  const qop = wwwAuth.match(/qop="?([^",]+)"?/)?.[1] ?? "";

  const nc = "00000001";
  const cnonce = Math.random().toString(36).substring(2, 10);
  const uri = new URL(url).pathname + new URL(url).search;

  const ha1 = createHash("md5").update(`${username}:${realm}:${password}`).digest("hex");
  const ha2 = createHash("md5").update(`${method}:${uri}`).digest("hex");

  const response = qop
    ? createHash("md5").update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`).digest("hex")
    : createHash("md5").update(`${ha1}:${nonce}:${ha2}`).digest("hex");

  const authHeader = qop
    ? `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`
    : `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"`;

  const headers: Record<string, string> = { Authorization: authHeader };
  if (body) headers["Content-Type"] = contentType;

  const finalRes = await fetch(url, { method, headers, body: body || undefined });
  return finalRes;
}

/* ---- Route handler ----------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { deviceId, endpoint, method = "POST", payload } = json;

    if (!deviceId || !endpoint) {
      return NextResponse.json({ error: "deviceId and endpoint are required" }, { status: 400 });
    }

    // Look up device
    const { data: device, error: devErr } = await supabaseServer
      .from("biometric_devices")
      .select("deviceIp, devicePort, deviceUsername, devicePasswordEncrypted")
      .eq("deviceId", deviceId)
      .eq("is_deleted", false)
      .single();

    if (devErr || !device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const password = await decryptPassword(device.devicePasswordEncrypted);
    const baseUrl = `http://${device.deviceIp}:${device.devicePort}`;
    
    const isXml = typeof payload === "string" && payload.trim().startsWith("<");
    const fullUrl = isXml
      ? `${baseUrl}/ISAPI/${endpoint}`
      : `${baseUrl}/ISAPI/${endpoint}${endpoint.includes("?") ? "&" : "?"}format=json`;

    const bodyString = isXml ? payload : (payload ? JSON.stringify(payload) : undefined);
    const contentType = isXml ? "application/xml" : "application/json";

    let res: Response;
    try {
      res = await digestFetch(
        fullUrl,
        method,
        device.deviceUsername,
        password,
        bodyString,
        contentType
      );
    } catch (fetchError) {
      // Network error, device unreachable
      await supabaseServer
        .from("biometric_devices")
        .update({
          lastHeartbeat: new Date().toISOString(),
          isOnline: false,
          updatedAt: new Date().toISOString(),
        })
        .eq("deviceId", deviceId);
      
      throw fetchError;
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawXml: text };
    }

    // Device responded, so it's online regardless of HTTP status
    await supabaseServer
      .from("biometric_devices")
      .update({
        lastHeartbeat: new Date().toISOString(),
        isOnline: true,
        updatedAt: new Date().toISOString(),
      })
      .eq("deviceId", deviceId);

    return NextResponse.json(data, { status: res.status });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    console.error("Device proxy error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
