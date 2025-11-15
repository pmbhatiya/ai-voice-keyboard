"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
      } else {
        router.push("/dictation");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md card p-6">
        <h1 className="text-xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-slate-400 mb-4">
          Continue to your AI voice keyboard workspace.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-xs text-red-400">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-1"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="mt-4 text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-sky-400 hover:text-sky-300">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}


