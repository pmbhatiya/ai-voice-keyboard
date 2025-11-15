"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Signup failed");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md card p-6">
        <h1 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-50">
          Create an account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Sign up to start dictating instead of typing.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Name
            </label>
            <input
              className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-xs text-red-500 dark:text-red-400">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-1"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}


