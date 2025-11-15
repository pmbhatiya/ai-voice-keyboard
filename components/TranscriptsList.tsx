"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Transcript = {
  id: string;
  text: string;
  status: string;
  createdAt: string;
  durationSeconds?: number | null;
};

const MAX_PREVIEW_WORDS = 80;

function formatStatus(status: string): string {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return null;
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")} min`;
}

export default function TranscriptsList(props: { userId: string; isRecording?: boolean }) {
  const { userId, isRecording } = props;
  const [list, setList] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const pollIdRef = useRef<number | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/transcripts?limit=10");
    if (res.ok) {
      const data = await res.json();
      setList(data.transcripts || []);
    }
    setLoading(false);
  }

  // Initial load on mount.
  useEffect(() => {
    setIsMounted(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // While recording, poll every 3s to keep the list fresh.
  useEffect(() => {
    // Clear any existing poller when the recording state changes.
    if (pollIdRef.current !== null) {
      clearInterval(pollIdRef.current);
      pollIdRef.current = null;
    }

    if (isRecording) {
      // While recording, poll every 3s.
      pollIdRef.current = window.setInterval(load, 3000);
    } else {
      // When recording stops, do an immediate refresh and then keep polling
      // briefly (e.g. 10s) so the final slices & /finish merge are reflected
      // without requiring a manual page refresh.
      load();
      const startedAt = Date.now();
      pollIdRef.current = window.setInterval(() => {
        load();
        if (Date.now() - startedAt > 10_000 && pollIdRef.current !== null) {
          clearInterval(pollIdRef.current);
          pollIdRef.current = null;
        }
      }, 2000);
    }

    return () => {
      if (pollIdRef.current !== null) {
        clearInterval(pollIdRef.current);
        pollIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  async function copyText(id: string, t: string) {
    if (!t) return;
    await navigator.clipboard.writeText(t);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1500);
  }

  function getPreview(text: string | undefined | null) {
    if (!text) {
      return { preview: "", truncated: false };
    }
    const words = text.trim().split(/\s+/);
    if (words.length <= MAX_PREVIEW_WORDS) {
      return { preview: text, truncated: false };
    }
    return {
      preview: words.slice(0, MAX_PREVIEW_WORDS).join(" ") + "…",
      truncated: true
    };
  }

  function getWordCount(text: string | undefined | null) {
    if (!text) return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  function openModal(t: Transcript) {
    setSelectedTranscript(t);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedTranscript(null);
  }

  if (loading && list.length === 0) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="flex justify-between mb-2">
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-2 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && list.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        No transcripts yet. Start a dictation above.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {list.map((t) => {
          const { preview, truncated } = getPreview(t.text);
          return (
            <div
              key={t.id}
              className="group relative p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs text-slate-500">
                    {new Date(t.createdAt).toLocaleString()}
                  </div>
                  {formatDuration(t.durationSeconds) && (
                    <div className="text-[11px] text-slate-400">
                      Recording time: {formatDuration(t.durationSeconds)}
                    </div>
                  )}
                </div>
                <div className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {formatStatus(t.status)}
                </div>
              </div>
              <div className="mt-2 text-sm leading-relaxed text-slate-900 dark:text-slate-50">
                {preview || (
                  <em className="text-slate-500 dark:text-slate-400">(processing…)</em>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                {t.text && (
                  <button
                    className="opacity-0 group-hover:opacity-100 transition text-xs bg-slate-200 px-2 py-1 rounded text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    onClick={() => copyText(t.id, t.text)}
                  >
                    Copy
                  </button>
                )}
                {truncated && (
                  <button
                    className="ml-auto text-xs font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
                    onClick={() => openModal(t)}
                  >
                    More
                  </button>
                )}
              </div>
              {copiedId === t.id && (
                <div className="absolute bottom-2 right-3 text-[10px] px-2 py-1 rounded-full bg-emerald-500/90 text-slate-950 shadow-sm">
                  Copied!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isMounted &&
        showModal &&
        selectedTranscript &&
        createPortal(
          <div
            className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-black/40 px-4"
            onClick={closeModal}
          >
            <div
              className="relative max-w-2xl w-full max-h-[80vh] rounded-xl bg-white dark:bg-slate-950 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs text-slate-500">
                    {new Date(selectedTranscript.createdAt).toLocaleString()}
                  </div>
                  {formatDuration(selectedTranscript.durationSeconds) && (
                    <div className="text-[11px] text-slate-400">
                      Recording time: {formatDuration(selectedTranscript.durationSeconds)}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400">
                    Words: {getWordCount(selectedTranscript.text)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {formatStatus(selectedTranscript.status)}
                  </div>
                  <button
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="px-4 py-3 overflow-auto text-sm leading-relaxed text-slate-900 dark:text-slate-50 whitespace-pre-wrap">
                {selectedTranscript.text || (
                  <em className="text-slate-500 dark:text-slate-400">(No text)</em>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}


