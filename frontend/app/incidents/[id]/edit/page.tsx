import { redirect } from "next/navigation";
import { EditIncidentForm } from "@/components/incidents/EditIncidentForm";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { getServerUser } from "@/lib/auth/server";

export default async function EditIncidentPage({ params }: { params: Promise<{ id: string }> }) {
  if (!await getServerUser()) redirect("/login");
  const { id } = await params;
  return <div className="app-shell">
    <Sidebar/>
    <main className="main-content">
      <Header title="Edit incident"/>
      <section className="create-incident-page" aria-labelledby="edit-incident-title">
        <div className="create-incident-heading"><p className="eyebrow">Incidents</p><h2 id="edit-incident-title">Edit incident</h2><p>Update the incident details and priority.</p></div>
        <EditIncidentForm id={id}/>
      </section>
    </main>
  </div>;
}
