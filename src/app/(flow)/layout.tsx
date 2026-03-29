import { AppShell } from "@/components/layout/app-shell";

export default function FlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
