"use client";

import React, { useEffect, useRef, useState } from "react";

const SLICE_KEY = "voiceKeyboard.sliceMs";

type RecorderButtonProps = {
  onRecordingChange?: (recording: boolean) => void;
};

export default function RecorderButton({ onRecordingChange }: RecorderButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const chunkIndexRef = useRef(0);
  const transcriptIdRef = useRef<string | null>(null);
  const [sliceMs, setSliceMs] = useState(5000);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sliceTimeoutRef = useRef<number | null>(null);
  const recordingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(SLICE_KEY);
      if (stored) {
        const value = Number(stored);
        if (!Number.isNaN(value) && value >= 5000 && value <= 120000) {
          setSliceMs(value);
        }
      }
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (sliceTimeoutRef.current !== null) {
        window.clearTimeout(sliceTimeoutRef.current);
        sliceTimeoutRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (timerIdRef.current !== null) {
        window.clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, []);

  async function startSession(): Promise<boolean> {
    setStatus("Starting session…");
    const res = await fetch("/api/transcribe/start", {
      method: "POST"
    });
    if (!res.ok) {
      setStatus("Failed to start session");
      return false;
    }
    const data = await res.json();
    transcriptIdRef.current = data.transcriptId;
    setStatus("Recording…");
    return true;
  }

  function stopCurrentRecorder() {
    if (sliceTimeoutRef.current !== null) {
      window.clearTimeout(sliceTimeoutRef.current);
      sliceTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      }
  }

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function startNextSlice() {
    if (!streamRef.current || !transcriptIdRef.current) return;

    const stream = streamRef.current;
    const thisChunkIndex = chunkIndexRef.current++;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (e: BlobEvent) => {
        if (!e.data || e.data.size === 0 || !transcriptIdRef.current) return;

        const fd = new FormData();
      fd.append("file", e.data, `chunk-${thisChunkIndex}.webm`);
      fd.append("chunkIndex", String(thisChunkIndex));
        fd.append("transcriptId", transcriptIdRef.current);

        try {
          await fetch("/api/transcribe/slice", {
            method: "POST",
            body: fd
          });
        } catch (err) {
          console.error("slice upload failed", err);
          setStatus("Network issue while uploading slice");
        }

      // Chain the next slice only if we are still recording.
      if (recordingRef.current) {
        startNextSlice();
      }
      };

    mediaRecorder.start();

    // Stop this recorder after sliceMs so that each slice becomes an independent,
    // self-contained WebM file. This avoids container-header issues with some browsers.
    sliceTimeoutRef.current = window.setTimeout(() => {
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    }, sliceMs);
  }

  async function handleStart() {
    try {
      setRecording(true);
      onRecordingChange?.(true);
      recordingRef.current = true;
      chunkIndexRef.current = 0;
      const ok = await startSession();
      if (!ok) {
        setRecording(false);
        onRecordingChange?.(false);
        recordingRef.current = false;
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Start the first independent 5s slice.
      startNextSlice();

      // start timer for UI
      startTimeRef.current = Date.now();
      setElapsedSeconds(0);
      if (timerIdRef.current !== null) {
        window.clearInterval(timerIdRef.current);
      }
      timerIdRef.current = window.setInterval(() => {
        if (startTimeRef.current != null) {
          const diffMs = Date.now() - startTimeRef.current;
          setElapsedSeconds(diffMs / 1000);
        }
      }, 200);
    } catch (e) {
      console.error(e);
      setStatus("Could not access microphone");
      setRecording(false);
    }
  }

  async function handleStop() {
    setRecording(false);
    onRecordingChange?.(false);
    recordingRef.current = false;
    setStatus("Finishing session…");

    // Capture the final duration before we clear the timer/start time so that
    // it can be persisted with the transcript on the server.
    let durationSeconds: number | undefined;
    if (startTimeRef.current != null) {
      const diffMs = Date.now() - startTimeRef.current;
      const wholeSeconds = Math.round(diffMs / 1000);
      if (Number.isFinite(wholeSeconds) && wholeSeconds > 0) {
        durationSeconds = wholeSeconds;
      }
    }

    if (timerIdRef.current !== null) {
      window.clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    startTimeRef.current = null;
    stopCurrentRecorder();
    stopStream();
    if (transcriptIdRef.current) {
      await fetch("/api/transcribe/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcriptId: transcriptIdRef.current,
          ...(durationSeconds != null ? { durationSeconds } : {})
        })
      });
    }
    setStatus("Done");
    setElapsedSeconds(0);
    setTimeout(() => setStatus(null), 2000);
  }

  const pulseClass = recording ? "animate-pulse shadow-[0_0_0_12px_rgba(248,113,113,0.35)]" : "";

  return (
    <div className="flex flex-col items-center space-y-3">
      <button
        onClick={() => (recording ? handleStop() : handleStart())}
        className={`btn rounded-full h-24 w-24 text-sm font-semibold border-2 border-slate-300 dark:border-slate-900 flex items-center justify-center
          ${recording ? "bg-red-500 hover:bg-red-400" : "bg-sky-500 hover:bg-sky-400"} ${pulseClass}`}
        aria-pressed={recording}
      >
        {recording ? "Stop" : "Record"}
      </button>
      <div className="text-xs text-slate-400">
        {recording && (
          <span className="mr-1 font-mono text-[11px] text-slate-300">
            {elapsedSeconds.toFixed(1)}s
          </span>
        )}
        {status ?? (recording ? "Recording… speak naturally." : "Click to start dictation")}
      </div>
    </div>
  );
}


