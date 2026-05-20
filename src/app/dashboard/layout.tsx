import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const role = (data?.user?.user_metadata?.role as "client" | "nutritionist" | "trainer" | "admin") || "client";

  if (!data?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto bg-background lg:pl-64">
        {children}
      </main>
    </div>
  );
}
