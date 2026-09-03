import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { getServerUser } from "@/lib/auth/server";

export default async function DashboardPage() {
  if (!await getServerUser()) redirect("/login");

  return <div className="app-shell"><Sidebar/><main className="main-content"><Header/><Dashboard/></main></div>;
}
