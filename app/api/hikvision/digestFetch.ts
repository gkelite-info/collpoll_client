import crypto from "crypto";

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

export async function digestFetch(
    url: string,
    options: RequestInit & { body?: string }
): Promise<Response> {
    const urlObj = new URL(url);
    const uri = urlObj.pathname + urlObj.search;
    const method = (options.method ?? "GET").toUpperCase();

    const firstRes = await fetch(url, { ...options });

    if (firstRes.status !== 401) return firstRes;

    const wwwAuth = firstRes.headers.get("www-authenticate") ?? "";
    if (!wwwAuth.toLowerCase().startsWith("digest")) {
        throw new Error(`Unsupported auth scheme: ${wwwAuth}`);
    }

    const params = parseDigestHeader(wwwAuth);
    const authHeader = buildDigestAuth(method, uri, params);

    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers as Record<string, string>),
            Authorization: authHeader,
        },
    });
}