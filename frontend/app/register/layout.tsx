import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IncidentFlow | Create account",
  description: "Create an IncidentFlow account.",
};

export default function RegisterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
