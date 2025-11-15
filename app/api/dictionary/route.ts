import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromTokenHeader } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getUserFromTokenHeader(req.headers);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.dictionaryEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromTokenHeader(req.headers);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phrase, replacement } = await req.json();
    if (!phrase) {
      return NextResponse.json({ error: "Missing phrase" }, { status: 400 });
    }

    const entry = await prisma.dictionaryEntry.create({
      data: {
        phrase,
        replacement: replacement || null,
        userId: user.id
      }
    });
    return NextResponse.json({ entry });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}


