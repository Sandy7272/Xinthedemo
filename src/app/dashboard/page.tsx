import { redirect } from "next/navigation";

/** The studio now lives at the root — keep old /dashboard links working. */
export default function DashboardPage() {
  redirect("/");
}
