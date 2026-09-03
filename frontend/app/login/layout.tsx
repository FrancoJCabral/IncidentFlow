import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IncidentFlow | Sign in",
  description: "Sign in to the IncidentFlow incident management workspace.",
};

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
