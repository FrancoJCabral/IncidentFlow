"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createIncident, IncidentsUnauthorizedError } from "@/lib/api/incidents-client";
import type { IncidentCategory, IncidentPriority } from "@/types/incident";

interface FormData { title: string; description: string; priority: string; category: string; }
type FormErrors = Partial<Record<keyof FormData, string>>;
const priorities: IncidentPriority[] = ["Low", "Medium", "High", "Critical"];
const categories: IncidentCategory[] = ["Software", "Hardware", "Network", "Access", "Security", "Other"];
const priorityHelp: Record<IncidentPriority, string> = {
  Low: "Minor impact", Medium: "Normal operational impact", High: "Significant impact", Critical: "Severe or business-critical impact",
};
const initialData: FormData = { title: "", description: "", priority: "", category: "" };

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

export function CreateIncidentForm() {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof FormData, value: string) {
    setData((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      await createIncident({
        title: data.title.trim(), description: data.description.trim(),
        priority: data.priority as IncidentPriority, category: data.category as IncidentCategory,
      });
      router.replace("/");
      router.refresh();
    } catch (error) {
      if (error instanceof IncidentsUnauthorizedError) {
        router.replace("/login");
        router.refresh();
        return;
      }
      setSubmitError(error instanceof Error ? error.message : "Unable to create incident. Please try again.");
      setSubmitting(false);
    }
  }

  return <form className="panel create-incident-form" onSubmit={handleSubmit} noValidate>
    <div className="form-section-heading"><h3>Incident details</h3><p>Provide enough context for your team to understand and prioritize the issue.</p></div>
    {submitError && <p className="form-submit-error" role="alert">{submitError}</p>}
    <div className="incident-form-grid">
      <div className="incident-field full-width">
        <div className="field-label-row"><label htmlFor="incident-title">Title</label><span>{data.title.length} / 200</span></div>
        <input id="incident-title" value={data.title} onChange={(event) => update("title", event.target.value)} placeholder="Briefly describe the incident" maxLength={200} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "incident-title-error" : undefined}/>
        {errors.title && <p className="field-error" id="incident-title-error" role="alert">{errors.title}</p>}
      </div>
      <div className="incident-field full-width">
        <div className="field-label-row"><label htmlFor="incident-description">Description</label><span>{data.description.length} / 4000</span></div>
        <textarea id="incident-description" value={data.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe what happened, its impact, and any relevant context." maxLength={4000} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "incident-description-error" : undefined}/>
        {errors.description && <p className="field-error" id="incident-description-error" role="alert">{errors.description}</p>}
      </div>
      <div className="incident-field">
        <label htmlFor="incident-priority">Priority</label>
        <select id="incident-priority" value={data.priority} onChange={(event) => update("priority", event.target.value)} aria-invalid={Boolean(errors.priority)} aria-describedby={errors.priority ? "incident-priority-error" : data.priority ? "priority-help" : undefined}>
          <option value="">Select priority</option>{priorities.map((priority) => <option value={priority} key={priority}>{priority}</option>)}
        </select>
        {data.priority && <p className="field-help" id="priority-help">{priorityHelp[data.priority as IncidentPriority]}</p>}
        {errors.priority && <p className="field-error" id="incident-priority-error" role="alert">{errors.priority}</p>}
      </div>
      <div className="incident-field">
        <label htmlFor="incident-category">Category</label>
        <select id="incident-category" value={data.category} onChange={(event) => update("category", event.target.value)} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? "incident-category-error" : undefined}>
          <option value="">Select category</option>{categories.map((category) => <option value={category} key={category}>{category}</option>)}
        </select>
        {errors.category && <p className="field-error" id="incident-category-error" role="alert">{errors.category}</p>}
      </div>
    </div>
    <div className="incident-form-actions">
      <button className="secondary-action" type="button" onClick={() => router.push("/")} disabled={submitting}>Cancel</button>
      <button className="primary-action" type="submit" disabled={submitting}>{submitting && <span className="submit-spinner" aria-hidden="true"/>}{submitting ? "Creating incident..." : "Create incident"}</button>
    </div>
  </form>;
}
