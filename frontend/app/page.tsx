import { StatCard } from "@/components/dashboard/StatCard";
import { IncidentDetails } from "@/components/incidents/IncidentDetails";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { incidents, stats } from "@/data/dashboard";
import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  if (!await getServerUser()) redirect("/login");

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="dashboard-content">
          <section className="welcome-row" aria-labelledby="dashboard-overview">
            <div>
              <p className="eyebrow">Overview</p>
              <h2 id="dashboard-overview">Incident operations at a glance</h2>
              <p>Monitor priorities, track progress, and keep your team aligned.</p>
            </div>
            <button className="primary-action" type="button"><span aria-hidden="true">＋</span> New incident</button>
          </section>
          <section className="stats-grid" aria-label="Incident statistics">
            {stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
          </section>
          <section className="workspace-grid">
            <IncidentTable incidents={incidents} selectedId="INC-1005" />
            <IncidentDetails incident={incidents[0]} />
          </section>
        </div>
      </main>
    </div>
  );
}
