import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import MobileNav from "@/components/MobileNav";
import { IconMic, IconBook, IconSettings } from "@/components/Icons";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "AI Voice Keyboard",
  description: "Dictate instead of typing, with smart AI transcription.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <aside className="w-64 border-r border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-950/80 backdrop-blur px-4 py-6 hidden md:flex md:flex-col">
            <div className="mb-8">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Blink Assignment
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                AI Voice Keyboard
              </div>
            </div>
            <nav className="space-y-1 text-sm">
              <SidebarLink href="/dictation" label="Dictation" icon={<IconMic className="h-4 w-4" />} />
              <SidebarLink href="/dictionary" label="Dictionary" icon={<IconBook className="h-4 w-4" />} />
              <SidebarLink href="/settings" label="Settings" icon={<IconSettings className="h-4 w-4" />} />
            </nav>
            <div className="mt-auto">
              <div className="flex flex-col gap-2">
                <div className="text-xs text-slate-500">
                  Built with Next.js, Prisma &amp; Postgres
                </div>
                <div className="flex items-center justify-between gap-2">
                  <ThemeToggle />
                  <LogoutButton />
                </div>
              </div>
            </div>
          </aside>
          <main className="flex-1 px-4 py-6 md:px-8">
            <MobileNav />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function SidebarLink({
  href,
  label,
  icon
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-200 transition dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center text-slate-500 dark:text-slate-400">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}


