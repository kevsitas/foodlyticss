import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { es } from "@/lib/i18n";
import { MessagesView } from "@/app/client/messages/messages-view";

export default async function NutritionistMessagesPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const t = es.nutritionistMessages;

  // Get conversations for SSR
  const { data: sent } = await supabase
    .from("messages")
    .select("receiver_id, content, created_at, read")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false });

  const { data: received } = await supabase
    .from("messages")
    .select("sender_id, content, created_at, read")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  // Build partner map
  const partnerMap = new Map<string, { lastMessage: string; lastMessageAt: string; unread: number }>();

  for (const msg of received ?? []) {
    const existing = partnerMap.get(msg.sender_id);
    if (!existing) {
      partnerMap.set(msg.sender_id, {
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
        unread: msg.read ? 0 : 1,
      });
    } else if (msg.created_at > existing.lastMessageAt) {
      existing.lastMessage = msg.content;
      existing.lastMessageAt = msg.created_at;
      if (!msg.read) existing.unread += 1;
    } else if (!msg.read) {
      existing.unread += 1;
    }
  }

  for (const msg of sent ?? []) {
    const existing = partnerMap.get(msg.receiver_id);
    if (!existing) {
      partnerMap.set(msg.receiver_id, {
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
        unread: 0,
      });
    } else if (!existing.lastMessageAt || msg.created_at > existing.lastMessageAt) {
      existing.lastMessage = msg.content;
      existing.lastMessageAt = msg.created_at;
    }
  }

  // Get profile info for partners
  let conversations: any[] = [];
  if (partnerMap.size > 0) {
    const partnerIds = Array.from(partnerMap.keys());
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .in("id", partnerIds);

    conversations = (profiles ?? []).map((p) => ({
      ...p,
      ...partnerMap.get(p.id)!,
    })).sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.localeCompare(a.lastMessageAt);
    });
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.noConversations}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">{t.noConversationsDesc}</p>
        </div>
      ) : (
        <MessagesView userId={user.id} initialConversations={conversations} />
      )}
    </div>
  );
}