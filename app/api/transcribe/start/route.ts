import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromTokenHeader } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getUserFromTokenHeader(req.headers);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transcript = await prisma.transcript.create({
      data: { userId: user.id, status: "processing", text: "" }
    });

    return NextResponse.json({ transcriptId: transcript.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


