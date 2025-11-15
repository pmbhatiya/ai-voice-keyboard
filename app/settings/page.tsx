"use client";

import { useState, useEffect } from "react";

const SLICE_KEY = "voiceKeyboard.sliceMs";

export default function SettingsPage() {
  const [sliceMs, setSliceMs] = useState<number>(5000);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SLICE_KEY);
    if (stored) {
      const value = Number(stored);
      if (!Number.isNaN(value) && value >= 5000 && value <= 120000) {
        setSliceMs(value);
      }
    }
  }, []);

  function handleSliceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setSliceMs(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SLICE_KEY, String(value));
    }
  }

  const seconds = (sliceMs / 1000).toFixed(1);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tune the dictation experience to match how you speak.
        </p>
      </header>

      <section className="card p-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
            Dictation
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Control how often audio is sliced and sent to the AI for transcription.
          </p>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm text-slate-300">
            <span>Slice length</span>
            <span className="font-mono text-sky-300">{seconds}s</span>
          </label>
          <input
            type="range"
            min={5000}
            max={120000}
            step={5000}
            value={sliceMs}
            onChange={handleSliceChange}
            className="w-full"
          />
          <p className="text-xs text-slate-500">
            Shorter slices (5–15s) feel snappier but make more API calls. Longer slices
            (30–120s) are more efficient but delay seeing live text. The default is 5s.
          </p>
        </div>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
          About this workspace
        </h2>
        <p className="text-xs text-slate-500">
          Your audio and transcripts are stored securely in Postgres and are scoped to your account.
          API keys and database credentials are managed via environment variables on the server
          (e.g. Railway) – never in the browser.
        </p>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Speech-to-text powered by Whisper or a compatible model.</li>
          <li>• Slice-based streaming keeps latency low, even for long dictations.</li>
          <li>• Custom dictionary entries teach the AI your product names and jargon.</li>
        </ul>
      </section>
    </div>
  );
}
