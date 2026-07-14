import { redirect } from "next/navigation";
import { getCurrentTeam } from "@/lib/auth";
import AppShell from "./AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const team = await getCurrentTeam();
  if (!team) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
