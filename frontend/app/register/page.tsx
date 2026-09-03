import { redirect } from "next/navigation";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getServerUser } from "@/lib/auth/server";

export default async function RegisterPage() {
  if (await getServerUser()) redirect("/");

  return (
    <main className="login-page">
      <AuthBrandPanel />
      <section className="login-form-panel" aria-label="Create account">
        <RegisterForm />
      </section>
    </main>
  );
}
