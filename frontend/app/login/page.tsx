import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await getServerUser()) redirect("/");

  return (
    <main className="login-page">
      <AuthBrandPanel />
      <section className="login-form-panel" aria-label="Sign in">
        <LoginForm />
      </section>
    </main>
  );
}
