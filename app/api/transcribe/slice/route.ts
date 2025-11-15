import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function saveFileFromFormData(formData: FormData) {
  const file = formData.get("file") as unknown as File | null;
  const transcriptId = formData.get("transcriptId") as string | null;
  const chunkIndexRaw = formData.get("chunkIndex") as string | null;

  if (!file || !transcriptId || !chunkIndexRaw) {
    throw new Error("Missing file or metadata");
  }

  const chunkIndex = Number(chunkIndexRaw);
  const arrayBuffer = await file.arrayBuffer();
  const tempDir = "/tmp/voice_chunks";
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const webmPath = path.join(tempDir, `${transcriptId}-${chunkIndex}-${randomUUID()}.webm`);
  fs.writeFileSync(webmPath, Buffer.from(arrayBuffer));
  return { filename: webmPath, transcriptId, chunkIndex };
}

async function transcribeWithWhisper(localPath: string, dictionaryWords: string[] = []) {
  // If no API key is configured, we can't call Whisper – just return empty text so we
  // don't pollute the transcript with fallback labels.
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set – skipping Whisper transcription for this slice.");
    return "";
  }

  const prompt =
    dictionaryWords.length > 0
      ? `Transcribe this audio as clear English text. Prefer these spellings exactly: ${dictionaryWords.join(
          ", "
        )}.`
      : "Transcribe this audio as clear English text suitable to paste into a chat or email.";

  const maxAttempts = 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Ensure the chunk exists and is non-empty before attempting transcription.
      const stats = await fs.promises.stat(localPath).catch(() => null);
      if (!stats || stats.size === 0) {
        throw new Error(`Audio chunk at ${localPath} is empty or missing`);
      }

      // Use the OpenAI helper to wrap the file stream. This ensures the SDK sends a
      // correctly-formed multipart request with the proper filename and content type,
      // which avoids intermittent "invalid file format" issues for webm chunks.
      const fileForUpload = await OpenAI.toFile(
        fs.createReadStream(localPath),
        path.basename(localPath)
      );

    const result = await openai.audio.transcriptions.create({
        file: fileForUpload,
      model: "whisper-1",
        prompt,
        // Force English output and deterministic behaviour to reduce random
        // substitutions into other languages.
        language: "en",
        temperature: 0
    });

    return result.text ?? "";
  } catch (e: any) {
      lastError = e;
      const status = typeof e?.status === "number" ? e.status : undefined;
      const isRetryable = status === 429 || (status != null && status >= 500);

      console.error(`Whisper error on attempt ${attempt}:`, {
        status,
        message: e?.message,
        error: e?.error
      });

      if (!isRetryable || attempt === maxAttempts) {
        break;
      }

      // simple linear backoff
      const delayMs = 300 * attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Give up – caller will log and handle empty text.
  throw lastError ?? new Error("Unknown Whisper transcription error");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const { filename, transcriptId, chunkIndex } = await saveFileFromFormData(formData);

    const transcript = await prisma.transcript.findUnique({
      where: { id: transcriptId }
    });
    if (!transcript) {
      return NextResponse.json({ error: "Transcript not found" }, { status: 404 });
    }

    const dictionary = await prisma.dictionaryEntry.findMany({
      where: { userId: transcript.userId }
    });
    const dictionaryWords = dictionary.map((d) => d.phrase);

    // Try to transcribe this slice with Whisper. If it fails, we log the error but
    // avoid inserting noisy placeholder text into the transcript – that was causing
    // "Slice N (fallback)" to appear in long recordings.
    let chunkText = "";
    try {
      chunkText = await transcribeWithWhisper(filename, dictionaryWords);
    } catch (e) {
      console.error("Whisper transcription failed for slice", chunkIndex, e);
      chunkText = "";
    }

    await prisma.transcriptSlice.upsert({
      where: { transcriptId_chunkIndex: { transcriptId, chunkIndex } },
      update: { text: chunkText, status: "done", audioUrl: filename },
      create: {
        id: `${transcriptId}-${chunkIndex}`,
        transcriptId,
        chunkIndex,
        audioUrl: filename,
        text: chunkText,
        status: "done"
      }
    });

    const slices = await prisma.transcriptSlice.findMany({
      where: { transcriptId },
      orderBy: { chunkIndex: "asc" }
    });

    const merged = slices
      .map((s) => s.text || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    await prisma.transcript.update({
      where: { id: transcriptId },
      data: { text: merged, status: "done" }
    });

    try {
      fs.unlinkSync(filename);
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true, merged });
  } catch (err) {
    console.error("slice error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}


