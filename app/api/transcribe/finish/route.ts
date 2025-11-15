import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { transcriptId, durationSeconds } = await req.json();
    if (!transcriptId) {
      return NextResponse.json({ error: "Missing transcriptId" }, { status: 400 });
    }

    const slices = await prisma.transcriptSlice.findMany({
      where: { transcriptId },
      orderBy: { chunkIndex: "asc" }
    });

    const full = slices
      .map((s) => s.text || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    const safeDuration =
      typeof durationSeconds === "number" && Number.isFinite(durationSeconds) && durationSeconds > 0
        ? Math.round(durationSeconds)
        : null;

    await prisma.transcript.update({
      where: { id: transcriptId },
      data: {
        text: full,
        status: "done",
        ...(safeDuration != null ? { durationSeconds: safeDuration } : {})
      }
    });

    return NextResponse.json({ ok: true, text: full });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}


