import DictionaryClient from "@/components/DictionaryClient";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DictionaryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dictionary</h1>
        <p className="mt-1 text-sm text-slate-400">
          Teach the AI how to spell product names, jargon, or proper nouns the way you prefer.
        </p>
      </header>
      <section className="card p-6">
        <DictionaryClient />
      </section>
    </div>
  );
}


