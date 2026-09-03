import { redirect } from "next/navigation";
import { CreateIncidentForm } from "@/components/incidents/CreateIncidentForm";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { getServerUser } from "@/lib/auth/server";

export default async function NewIncidentPage() {
  if (!await getServerUser()) redirect("/login");

  return <div className="app-shell">
    <Sidebar/>
    <main className="main-content">
      <Header title="New incident"/>
      <section className="create-incident-page" aria-labelledby="new-incident-title">
        <div className="create-incident-heading">
          <p className="eyebrow">Incidents</p>
          <h2 id="new-incident-title">New incident</h2>
          <p>Create and prioritize a new incident for your workspace.</p>
        </div>
        <CreateIncidentForm/>
      </section>
    </main>
  </div>;
}
