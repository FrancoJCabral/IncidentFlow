"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/auth-client";

interface RegisterFormData { email: string; password: string; confirmPassword: string; }
type RegisterFormErrors = Partial<Record<keyof RegisterFormData, string>>;
const initialFormData: RegisterFormData = { email: "", password: "", confirmPassword: "" };

function validate(data: RegisterFormData): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  const email = data.email.trim();
  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (!data.password) errors.password = "Password is required.";
  else if (data.password.length < 8) errors.password = "Password must be at least 8 characters.";
  else if (data.password.length > 128) errors.password = "Password must be no more than 128 characters.";
  if (!data.confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (data.confirmPassword !== data.password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

function PasswordIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
}

function VisibilityIcon({ visible }: { visible: boolean }) {
  return visible
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9 6 9 6a14 14 0 0 1-2.1 2.8M6.6 6.6C4.3 8.1 3 10 3 10s3.5 6 9 6a9.6 9.6 0 0 0 3-.5"/></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>;
}

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  function updateField(field: keyof RegisterFormData, value: string) {
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
      await register(formData.email.trim(), formData.password);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create your account. Please try again.");
      setIsSubmitting(false);
    }
  }

  return <div className="login-card register-card">
    <div className="mobile-auth-logo"><div className="brand-mark" aria-hidden="true"><span/><span/><span/></div><span>IncidentFlow</span></div>
    <div className="login-heading"><p className="auth-eyebrow">Join your workspace</p><h2>Create your account</h2><p>Get started with IncidentFlow.</p></div>
    <form className="login-form register-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-field"><label htmlFor="register-email">Email</label><div className={`auth-input-wrap${errors.email ? " has-error" : ""}`}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg><input id="register-email" name="email" type="email" autoComplete="email" placeholder="name@company.com" value={formData.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "register-email-error" : undefined}/></div>{errors.email && <p className="field-error" id="register-email-error" role="alert">{errors.email}</p>}</div>
      <div className="auth-field"><label htmlFor="register-password">Password</label><div className={`auth-input-wrap${errors.password ? " has-error" : ""}`}><PasswordIcon/><input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" value={formData.password} onChange={(event) => updateField("password", event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "register-password-error" : undefined}/><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}><VisibilityIcon visible={showPassword}/></button></div>{errors.password && <p className="field-error" id="register-password-error" role="alert">{errors.password}</p>}</div>
      <div className="auth-field"><label htmlFor="confirm-password">Confirm password</label><div className={`auth-input-wrap${errors.confirmPassword ? " has-error" : ""}`}><PasswordIcon/><input id="confirm-password" name="confirmPassword" type={showConfirmation ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}/><button className="password-toggle" type="button" onClick={() => setShowConfirmation((visible) => !visible)} aria-label={showConfirmation ? "Hide password confirmation" : "Show password confirmation"}><VisibilityIcon visible={showConfirmation}/></button></div>{errors.confirmPassword && <p className="field-error" id="confirm-password-error" role="alert">{errors.confirmPassword}</p>}</div>
      {submitError && <p className="login-submit-error" role="alert">{submitError}</p>}
      <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="submit-spinner" aria-hidden="true"/>}{isSubmitting ? "Creating account..." : "Create account"}</button>
    </form>
    <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
  </div>;
}
