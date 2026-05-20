"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Loader2, ArrowLeft } from "lucide-react";
import { getMessages, sendMessage, markMessagesAsRead } from "@/app/actions/messages";
import { es } from "@/lib/i18n";
import type { Message } from "@/types/database";

interface Conversation {
  id: string;
  full_name: string | null;
  role: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: number;
}

interface MessagesViewProps {
  userId: string;
  initialConversations: Conversation[];
}

export function MessagesView({ userId, initialConversations }: MessagesViewProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activePartner, setActivePartner] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [mobileChat, setMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = es.clientMessages;

  const partnerName = conversations.find((c) => c.id === activePartner)?.full_name || "Profesional";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function openConversation(partnerId: string) {
    setActivePartner(partnerId);
    setMobileChat(true);
    setLoading(true);

    const result = await getMessages(partnerId);
    if (result.success) {
      setMessages(result.data);
      // Mark as read
      await markMessagesAsRead(partnerId);
      setConversations((prev) =>
        prev.map((c) => (c.id === partnerId ? { ...c, unread: 0 } : c)),
      );
    }
    setLoading(false);
  }

  async function handleSend(formData: FormData) {
    const content = formData.get("content") as string;
    if (!content?.trim() || !activePartner) return;

    setSending(true);
    setText("");

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      receiver_id: activePartner,
      content: content.trim(),
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    const result = await sendMessage(activePartner, content.trim());
    if (!result.success) {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    }
    setSending(false);
  }

  function backToList() {
    setActivePartner(null);
    setMobileChat(false);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border bg-card">
      {/* Conversation list */}
      <div className={`w-full flex-shrink-0 border-r border-border lg:w-72 ${mobileChat ? "hidden lg:block" : "block"}`}>
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold">{t.title}</h2>
          <p className="text-xs text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="overflow-y-auto" style={{ height: "calc(100% - 60px)" }}>
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t.noConversations}</p>
              <p className="text-xs text-muted-foreground/60">{t.noConversationsDesc}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${
                    activePartner === conv.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {conv.full_name?.[0] || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium">{conv.full_name || "Profesional"}</p>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.lastMessageAt).toLocaleDateString("es-MX", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs text-muted-foreground">{conv.lastMessage || "..."}</p>
                      {conv.unread > 0 && (
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] capitalize text-muted-foreground">{conv.role === "nutritionist" ? "Nutriólogo" : conv.role === "trainer" ? "Entrenador" : conv.role}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex flex-1 flex-col ${!mobileChat ? "hidden lg:flex" : "flex"}`}>
        {activePartner ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button onClick={backToList} className="lg:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {partnerName[0] || "?"}
              </div>
              <div>
                <p className="text-sm font-medium">{partnerName}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4" style={{ height: "calc(100% - 120px)" }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">{t.noMessagesYet}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isMine = msg.sender_id === userId;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                            isMine
                              ? "bg-primary text-primary-foreground"
                              : "bg-accent text-accent-foreground"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`mt-1 text-right text-[10px] ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {new Date(msg.created_at).toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <form action={handleSend} className="flex gap-2">
                <input
                  name="content"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.sendPlaceholder}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-3 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <MessageCircle className="mb-3 h-12 w-12 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Selecciona una conversación</p>
            <p className="text-xs text-muted-foreground/60">Elige un contacto del listado para ver tus mensajes.</p>
          </div>
        )}
      </div>
    </div>
  );
}