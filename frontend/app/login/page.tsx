import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="login-page">
      <AuthBrandPanel />
      <section className="login-form-panel" aria-label="Sign in">
        <LoginForm />
      </section>
    </main>
  );
}
