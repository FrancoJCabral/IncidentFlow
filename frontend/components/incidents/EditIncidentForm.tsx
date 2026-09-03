"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIncident, IncidentNotFoundError, IncidentsUnauthorizedError, updateIncident } from "@/lib/api/incidents-client";
import { formatIncidentDate, incidentReference } from "@/lib/incidents/presentation";
import type { Incident, IncidentCategory, IncidentPriority } from "@/types/incident";

interface FormData { title: string; description: string; priority: string; category: string; }
type FormErrors = Partial<Record<keyof FormData, string>>;
const priorities: IncidentPriority[] = ["Low", "Medium", "High", "Critical"];
const categories: IncidentCategory[] = ["Software", "Hardware", "Network", "Access", "Security", "Other"];

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.title.trim()) errors.title = "Title is required.";
  else if (data.title.trim().length > 200) errors.title = "Title must be 200 characters or fewer.";
  if (!data.description.trim()) errors.description = "Description is required.";
  else if (data.description.trim().length > 4000) errors.description = "Description must be 4000 characters or fewer.";
  if (!priorities.includes(data.priority as IncidentPriority)) errors.priority = "Select a priority.";
  if (!categories.includes(data.category as IncidentCategory)) errors.category = "Select a category.";
  return errors;
}

export function EditIncidentForm({ id }: { id: string }) {
  const router = useRouter();
  const [incident, setIncident] = useState<Incident>();
  const [data, setData] = useState<FormData>();
  const [errors, setErrors] = useState<FormErrors>({});
  const [state, setState] = useState<"loading" | "ready" | "not-found" | "error">("loading");
  const [submitError, setSubmitError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const loaded = await getIncident(id);
      setIncident(loaded);
      setData({ title: loaded.title, description: loaded.description, priority: loaded.priority, category: loaded.category });
      setState("ready");
    } catch (error) {
      if (error instanceof IncidentsUnauthorizedError) { router.replace("/login"); router.refresh(); return; }
      setState(error instanceof IncidentNotFoundError ? "not-found" : "error");
    }
  }, [id, router]);

  useEffect(() => {
    let active = true;
    getIncident(id).then((loaded) => {
      if (!active) return;
      setIncident(loaded);
      setData({ title: loaded.title, description: loaded.description, priority: loaded.priority, category: loaded.category });
      setState("ready");
    }).catch((error: unknown) => {
      if (!active) return;
      if (error instanceof IncidentsUnauthorizedError) { router.replace("/login"); router.refresh(); return; }
      setState(error instanceof IncidentNotFoundError ? "not-found" : "error");
    });
    return () => { active = false; };
  }, [id, router]);

  function update(field: keyof FormData, value: string) {
    setData((current) => current ? { ...current, [field]: value } : current);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const nextErrors = validate(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    setSubmitError(undefined);
    try {
      await updateIncident(id, { title: data.title.trim(), description: data.description.trim(), priority: data.priority as IncidentPriority, category: data.category as IncidentCategory });
      router.replace("/"); router.refresh();
    } catch (error) {
      if (error instanceof IncidentsUnauthorizedError) { router.replace("/login"); router.refresh(); return; }
      if (error instanceof IncidentNotFoundError) { setState("not-found"); return; }
      setSubmitError(error instanceof Error ? error.message : "Unable to update incident. Please try again.");
      setSaving(false);
    }
  }

  if (state === "loading") return <div className="panel edit-form-skeleton" aria-label="Loading incident" aria-busy="true"><span/><span/><span/><span/><span/></div>;
  if (state === "not-found") return <section className="panel edit-incident-state"><div className="state-icon">?</div><h3>Incident not found</h3><p>The incident may have been removed or the link may be invalid.</p><Link className="secondary-action" href="/">Back to dashboard</Link></section>;
  if (state === "error" || !incident || !data) return <section className="panel edit-incident-state"><div className="state-icon">!</div><h3>Unable to load incident.</h3><p>Please check your connection and try again.</p><button className="secondary-action" type="button" onClick={() => void load()}>Try again</button></section>;

  return <form className="panel create-incident-form" onSubmit={handleSubmit} noValidate>
    <div className="incident-edit-context" aria-label="Incident context"><div><span>Reference</span><strong>{incidentReference(incident.id)}</strong></div><div><span>Status</span><strong>{incident.status}</strong></div><div><span>Created</span><strong>{formatIncidentDate(incident.createdAt)}</strong></div></div>
    {submitError && <p className="form-submit-error" role="alert">{submitError}</p>}
    <div className="incident-form-grid">
      <div className="incident-field full-width"><div className="field-label-row"><label htmlFor="edit-title">Title</label><span>{data.title.length} / 200</span></div><input id="edit-title" value={data.title} onChange={(event) => update("title", event.target.value)} maxLength={200} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "edit-title-error" : undefined}/>{errors.title && <p className="field-error" id="edit-title-error" role="alert">{errors.title}</p>}</div>
      <div className="incident-field full-width"><div className="field-label-row"><label htmlFor="edit-description">Description</label><span>{data.description.length} / 4000</span></div><textarea id="edit-description" value={data.description} onChange={(event) => update("description", event.target.value)} maxLength={4000} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "edit-description-error" : undefined}/>{errors.description && <p className="field-error" id="edit-description-error" role="alert">{errors.description}</p>}</div>
      <div className="incident-field"><label htmlFor="edit-priority">Priority</label><select id="edit-priority" value={data.priority} onChange={(event) => update("priority", event.target.value)} aria-invalid={Boolean(errors.priority)} aria-describedby={errors.priority ? "edit-priority-error" : undefined}>{priorities.map((priority) => <option value={priority} key={priority}>{priority}</option>)}</select>{errors.priority && <p className="field-error" id="edit-priority-error" role="alert">{errors.priority}</p>}</div>
      <div className="incident-field"><label htmlFor="edit-category">Category</label><select id="edit-category" value={data.category} onChange={(event) => update("category", event.target.value)} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? "edit-category-error" : undefined}>{categories.map((category) => <option value={category} key={category}>{category}</option>)}</select>{errors.category && <p className="field-error" id="edit-category-error" role="alert">{errors.category}</p>}</div>
    </div>
    <div className="incident-form-actions"><button className="secondary-action" type="button" onClick={() => router.push("/")} disabled={saving}>Cancel</button><button className="primary-action" type="submit" disabled={saving}>{saving && <span className="submit-spinner" aria-hidden="true"/>}{saving ? "Saving changes..." : "Save changes"}</button></div>
  </form>;
}
