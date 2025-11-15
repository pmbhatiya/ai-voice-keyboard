import DictationClient from "@/components/DictationClient";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DictationPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  return <DictationClient userId={user.id} />;
}


