import { NextResponse } from "next/server";
import crypto from "crypto";

const HOST = process.env.HIKVISION_HOST ?? "http://192.168.31.170";
const USERNAME = process.env.HIKVISION_USERNAME ?? "admin";
const PASSWORD = process.env.HIKVISION_PASSWORD ?? "7093256562shiva";

function parseDigestHeader(header: string): Record<string, string> {
    const params: Record<string, string> = {};
    const regex = /(\w+)="([^"]+)"/g;
    let match;
    while ((match = regex.exec(header)) !== null) {
        params[match[1]] = match[2];
    }
    return params;
}

function buildDigestAuth(
    method: string,
    uri: string,
    params: Record<string, string>
): string {
    const { realm, nonce, qop, opaque } = params;

    const ha1 = crypto
        .createHash("md5")
        .update(`${USERNAME}:${realm}:${PASSWORD}`)
        .digest("hex");

    const ha2 = crypto
        .createHash("md5")
        .update(`${method}:${uri}`)
        .digest("hex");

    const nc = "00000001";
    const cnonce = crypto.randomBytes(8).toString("hex");

    let response: string;
    let authHeader: string;

    if (qop === "auth") {
        response = crypto
            .createHash("md5")
            .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
            .digest("hex");

        authHeader =
            `Digest username="${USERNAME}", realm="${realm}", nonce="${nonce}", ` +
            `uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"` +
            (opaque ? `, opaque="${opaque}"` : "");
    } else {
        response = crypto
            .createHash("md5")
            .update(`${ha1}:${nonce}:${ha2}`)
            .digest("hex");

        authHeader =
            `Digest username="${USERNAME}", realm="${realm}", nonce="${nonce}", ` +
            `uri="${uri}", response="${response}"` +
            (opaque ? `, opaque="${opaque}"` : "");
    }

    return authHeader;
}

async function digestFetch(
    url: string,
    options: RequestInit & { body?: string }
): Promise<Response> {
    const urlObj = new URL(url);
    const uri = urlObj.pathname + urlObj.search; // e.g. /ISAPI/AccessControl/AcsEvent?format=json
    const method = (options.method ?? "GET").toUpperCase();

    // Step 1: Initial request — expect 401
    const firstRes = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers as Record<string, string>),
        },
    });

    if (firstRes.status !== 401) {
        // Already authenticated or no auth needed
        return firstRes;
    }

    const wwwAuth = firstRes.headers.get("www-authenticate") ?? "";
    if (!wwwAuth.toLowerCase().startsWith("digest")) {
        throw new Error(`Unsupported auth scheme: ${wwwAuth}`);
    }

    // Step 2: Compute digest and retry
    const params = parseDigestHeader(wwwAuth);
    const authHeader = buildDigestAuth(method, uri, params);

    const secondRes = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers as Record<string, string>),
            Authorization: authHeader,
        },
    });

    return secondRes;
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));

        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const startTime = body.startTime ?? startOfDay.toISOString().slice(0, 19);
        const endTime = body.endTime ?? now.toISOString().slice(0, 19);
        const maxResults = body.maxResults ?? 50;
        const searchResultPosition = body.searchResultPosition ?? 0;

        const deviceUrl = `${HOST}/ISAPI/AccessControl/AcsEvent?format=json`;
        const requestBody = JSON.stringify({
            AcsEventCond: {
                searchID: Date.now().toString(),
                searchResultPosition,
                maxResults,
                major: 0,
                minor: 0,
                startTime,
                endTime,
            },
        });

        const res = await digestFetch(deviceUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: requestBody,
        });

        if (!res.ok) {
            const errText = await res.text();
            return NextResponse.json(
                { error: `Device returned ${res.status}`, detail: errText },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json(
            { error: "Internal server error", detail: err.message },
            { status: 500 }
        );
    }
}