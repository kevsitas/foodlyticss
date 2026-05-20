import { Sidebar } from "@/components/sidebar";
import { requireVerified } from "@/lib/roles";

export default async function NutritionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await requireVerified(["nutritionist", "admin"]);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto bg-background lg:pl-64">
        {children}
      </main>
    </div>
  );
}