export const TOKEN_KEY = "auth_tokens";

export type AuthTokens = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
};

export function setTokens(tokens: AuthTokens) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function getTokens(): AuthTokens | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
}
