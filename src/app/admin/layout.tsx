import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "admin") redirect("/dashboard");
  const { sub, name, email, company, role, plan } = session;
  return <DashboardShell user={{ sub, name, email, company, role, plan }}>{children}</DashboardShell>;
}
