import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromTokenHeader } from "@/lib/auth";

type Params = {
  params: {
    id: string;
  };
};

export async function DELETE(req: Request, { params }: Params) {
  try {
    const user = await getUserFromTokenHeader(req.headers);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await prisma.dictionaryEntry.delete({
      where: { id, userId: user.id }
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}


