"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Message, Profile } from "@/types/database";

export async function getConversations(): Promise<ActionResult<(Pick<Profile, "id" | "full_name" | "avatar_url"> & { lastMessage: string | null; lastMessageAt: string | null; unread: number })[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  // Get all unique conversation partners and last messages
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

  const partnerMap = new Map<string, { lastMessage: string; lastMessageAt: string; unread: number }>();

  for (const msg of received ?? []) {
    const existing = partnerMap.get(msg.sender_id);
    if (!existing) {
      partnerMap.set(msg.sender_id, {
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
        unread: msg.read ? 0 : 1,
      });
    } else if (!existing.lastMessageAt || msg.created_at > existing.lastMessageAt) {
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

  if (partnerMap.size === 0) return { success: true, data: [] };

  const partnerIds = Array.from(partnerMap.keys());

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", partnerIds);

  const conversations = (profiles ?? []).map((p) => {
    const meta = partnerMap.get(p.id)!;
    return { ...p, ...meta };
  }).sort((a, b) => {
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return b.lastMessageAt.localeCompare(a.lastMessageAt);
  });

  return { success: true, data: conversations };
}

export async function getMessages(partnerId: string): Promise<ActionResult<Message[]>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function sendMessage(receiverId: string, content: string): Promise<ActionResult<Message>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  if (!content.trim()) return { success: false, error: "Message cannot be empty" };

  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: user.id, receiver_id: receiverId, content })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function markMessagesAsRead(senderId: string): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("sender_id", senderId)
    .eq("receiver_id", user.id)
    .eq("read", false);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function getUnreadCount(): Promise<ActionResult<number>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("read", false);

  if (error) return { success: false, error: error.message };
  return { success: true, data: count ?? 0 };
}