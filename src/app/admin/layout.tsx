import { Sidebar } from "@/components/sidebar";
import { requireRole } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await requireRole(["admin"]);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto bg-background lg:pl-64">
        {children}
      </main>
    </div>
  );
}