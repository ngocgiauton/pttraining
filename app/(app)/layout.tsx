import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, ho_ten, role, active")
    .eq("user_id", user.id)
    .single();

  if (!profile || !profile.active) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Nav hoTen={profile.ho_ten} role={profile.role} />
      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
