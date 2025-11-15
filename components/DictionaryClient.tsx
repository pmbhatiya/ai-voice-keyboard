"use client";

import React, { useEffect, useState } from "react";

type DictionaryEntry = {
  id: string;
  phrase: string;
  replacement?: string | null;
};

export default function DictionaryClient() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [phrase, setPhrase] = useState("");
  const [replacement, setReplacement] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/dictionary");
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!phrase.trim()) return;
    setSaving(true);
    const res = await fetch("/api/dictionary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phrase, replacement: replacement || null })
    });
    setSaving(false);
    if (res.ok) {
      setPhrase("");
      setReplacement("");
      await load();
    }
  }

  async function deleteEntry(id: string) {
    const res = await fetch(`/api/dictionary/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setConfirmId((current) => (current === id ? null : current));
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addEntry} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[2fr,2fr,auto]">
          <input
            className="rounded-md bg-white border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:border-slate-700"
            placeholder="Special word or phrase (e.g. Wispr, Typeless)"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
          />
          <input
            className="rounded-md bg-white border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:border-slate-700"
            placeholder="Optional replacement (e.g. capitalisation or full form)"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
          />
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm"
          >
            {saving ? "Saving…" : "Add"}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          These entries are passed to the transcription model as spelling hints so your product names and jargon are spelled correctly.
        </p>
      </form>

      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Your dictionary
          </span>
          {entries.length > 0 && (
            <span className="text-[11px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>
        {entries.length === 0 && (
          <div className="text-sm text-slate-400">
            No entries yet. Add your first custom word above.
          </div>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-50">{e.phrase}</div>
              {e.replacement && (
                <div className="text-xs text-slate-400">→ {e.replacement}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {confirmId === e.id ? (
                <>
                  <span className="text-[11px] text-slate-400">Delete?</span>
            <button
              onClick={() => deleteEntry(e.id)}
                    className="text-[11px] px-2 py-1 rounded bg-red-500 text-white hover:bg-red-400"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-[11px] px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmId(e.id)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


