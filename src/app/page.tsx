import { redirect } from "next/navigation";
import { getCurrentTeam } from "@/lib/auth";

export default async function RootPage() {
  const team = await getCurrentTeam();
  redirect(team ? "/home" : "/login");
}
