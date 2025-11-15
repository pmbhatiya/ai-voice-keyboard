"use client";

import RecorderButton from "@/components/RecorderButton";
import TranscriptsList from "@/components/TranscriptsList";
import React, { useState } from "react";

export default function DictationClient({ userId }: { userId: string }) {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dictation</h1>
        <p className="mt-1 text-sm text-slate-400">
          Click the record button, speak naturally and get clean, formatted text almost
          instantly.
        </p>
      </header>

      <section className="card p-6 flex flex-col items-center gap-4">
        <RecorderButton onRecordingChange={setIsRecording} />
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Recent transcripts</h2>
        </div>
        <TranscriptsList userId={userId} isRecording={isRecording} />
      </section>
    </div>
  );
}


