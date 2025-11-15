import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromTokenHeader } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? "10");

  const user = await getUserFromTokenHeader(req.headers);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transcripts = await prisma.transcript.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit
  });

  return NextResponse.json({ transcripts });
}


