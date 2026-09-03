"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/api/auth-client";

interface LoginFormData {
  email: string;
  password: string;
}

type LoginFormErrors = Partial<Record<keyof LoginFormData, string>>;

const initialFormData: LoginFormData = { email: "", password: "" };

function validate(formData: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const email = formData.email.trim();

  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

  if (!formData.password) errors.password = "Password is required.";
  else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters.";

  return errors;
}

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  function updateField(field: keyof LoginFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(undefined);
    try {
      await signIn(formData.email.trim(), formData.password);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-card">
      <div className="mobile-auth-logo">
        <div className="brand-mark" aria-hidden="true"><span/><span/><span/></div>
        <span>IncidentFlow</span>
      </div>
      <div className="login-heading">
        <p className="auth-eyebrow">Secure workspace</p>
        <h2>Welcome back</h2>
        <p>Sign in to continue to IncidentFlow.</p>
      </div>
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <div className={`auth-input-wrap${errors.email ? " has-error" : ""}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="name@company.com" value={formData.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined}/>
          </div>
          {errors.email && <p className="field-error" id="email-error" role="alert">{errors.email}</p>}
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <div className={`auth-input-wrap${errors.password ? " has-error" : ""}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={formData.password} onChange={(event) => updateField("password", event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined}/>
            <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9 6 9 6a14 14 0 0 1-2.1 2.8M6.6 6.6C4.3 8.1 3 10 3 10s3.5 6 9 6a9.6 9.6 0 0 0 3-.5"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>}
            </button>
          </div>
          {errors.password && <p className="field-error" id="password-error" role="alert">{errors.password}</p>}
        </div>
        {submitError && <p className="login-submit-error" role="alert">{submitError}</p>}
        <button className="login-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting && <span className="submit-spinner" aria-hidden="true"/>}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
