// app/api/ai/ats-score/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, summary } = body as { studentId: number; summary: string };

    if (!studentId || !summary) {
      return NextResponse.json({ error: "Missing studentId or summary" }, { status: 400 });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) resume evaluator.
...`; // keep your existing prompt

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 64,
      messages: [{ role: "user", content: prompt }],
    });

    // ✅ Fix: use Anthropic's SDK type for content blocks
    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    if (typeof parsed.score !== "number" || parsed.score < 0 || parsed.score > 100) {
      throw new Error("Invalid score returned from AI");
    }

    return NextResponse.json({ score: Math.round(parsed.score) });
  } catch (err) {
    console.error("[ATS Score API]", err);
    return NextResponse.json({ error: "Failed to compute ATS score" }, { status: 500 });
  }
}