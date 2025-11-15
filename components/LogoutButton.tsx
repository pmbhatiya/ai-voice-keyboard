"use client";

import { useRouter } from "next/navigation";
import { IconLogout } from "./Icons";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
    >
      <IconLogout className="h-3.5 w-3.5" />
      <span>Log out</span>
    </button>
  );
}


