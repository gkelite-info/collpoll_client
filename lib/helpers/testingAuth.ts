"use server";
import { cookies } from "next/headers";

export async function setTestingSession(email: string) {
    const cookieStore = await cookies();
    cookieStore.set("testing_session_email", email, { path: "/", maxAge: 60 * 60 * 24 });
}

export async function getTestingSession() {
    const cookieStore = await cookies();
    return cookieStore.get("testing_session_email")?.value || null;
}
