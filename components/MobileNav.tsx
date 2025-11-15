"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMic, IconBook, IconSettings } from "./Icons";

type Item = {
  href: string;
  label: string;
  icon: JSX.Element;
};

const items: Item[] = [
  { href: "/dictation", label: "Dictation", icon: <IconMic className="h-3.5 w-3.5" /> },
  { href: "/dictionary", label: "Dictionary", icon: <IconBook className="h-3.5 w-3.5" /> },
  { href: "/settings", label: "Settings", icon: <IconSettings className="h-3.5 w-3.5" /> }
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100/80 px-2 py-1 text-xs dark:border-slate-800 dark:bg-slate-900/70">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 rounded-lg px-2 py-1 transition flex items-center justify-center gap-1 ${
              active
                ? "bg-sky-500 text-slate-950 font-medium"
                : "text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <span className="inline-flex items-center justify-center text-slate-700 dark:text-slate-200">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


