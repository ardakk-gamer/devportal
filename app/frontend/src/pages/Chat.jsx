import { useEffect, useMemo, useRef, useState } from "react";
import { api, formatApiError, API_BASE } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Circle, Shield } from "lucide-react";
import { toast } from "sonner";

export default function Chat() {
  const { user, token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const scrollRef = useRef(null);

  // fetch contacts
  useEffect(() => {
    api.get("/chat/contacts").then(({ data }) => {
      setContacts(data);
      if (data.length && !active) setActive(data[0]);
    }).catch((e) => toast.error(formatApiError(e)));
  }, []);

  // websocket
  useEffect(() => {
    if (!token) return;
    const wsUrl = API_BASE.replace(/^http/, "ws") + `/ws/chat?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "message") {
          const m = data.message;
          const me = user?.id;
          const otherId = m.sender_id === me ? m.receiver_id : m.sender_id;

          setMessages((prev) => {
            if (!active) return prev;
            const isForActive = (m.sender_id === active.id && m.receiver_id === me) ||
                                (m.sender_id === me && m.receiver_id === active.id);
            return isForActive ? [...prev, m] : prev;
          });

          setContacts((prev) =>
            prev.map((c) =>
              c.id === otherId ? { ...c, last_message: m.content, last_at: m.created_at } : c
            )
          );
        }
      } catch { /* ignore */ }
    };
    return () => ws.close();
  }, [token, user?.id, active?.id]);

  // load conversation
  useEffect(() => {
    if (!active) { setMessages([]); return; }
    api.get(`/chat/messages/${active.id}`).then(({ data }) => setMessages(data)).catch((e) => toast.error(formatApiError(e)));
  }, [active?.id]);

  // scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !active) return;
    try {
      await api.post("/chat/messages", { to_user_id: active.id, content: input.trim() });
      setInput("");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const myId = user?.id;

  return (
    <div className="h-screen flex" data-testid="chat-page">
      {/* Contact list */}
      <aside className="w-72 shrink-0 border-r border-white/10 bg-zinc-950 flex flex-col">
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-yellow-500">// inbox</div>
            <div className="font-mono text-lg text-white mt-1">Conversations</div>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500" data-testid="ws-status">
            <Circle className={`h-2 w-2 ${connected ? "fill-emerald-500 text-emerald-500" : "fill-red-500 text-red-500"}`} />
            {connected ? "live" : "offline"}
          </span>
        </div>
        <div className="overflow-y-auto flex-1">
          {contacts.length === 0 && (
            <div className="p-6 font-mono text-xs text-zinc-500">// no other users</div>
          )}
          {contacts.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              data-testid={`contact-${c.username}`}
              className={`w-full text-left px-5 py-4 border-l-2 border-b border-white/5 transition-colors ${
                active?.id === c.id
                  ? "border-l-yellow-500 bg-zinc-900"
                  : "border-l-transparent hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="font-mono text-sm text-white truncate flex-1">{c.name || c.username}</div>
                {c.role === "admin" && <Shield className="h-3 w-3 text-yellow-500" strokeWidth={1.5} />}
              </div>
              <div className="font-mono text-[10px] text-zinc-500 mt-0.5">@{c.username}</div>
              {c.last_message && (
                <div className="mt-1.5 text-xs text-zinc-500 truncate">{c.last_message}</div>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Conversation */}
      <section className="flex-1 flex flex-col">
        {!active ? (
          <div className="flex-1 flex items-center justify-center font-mono text-sm text-zinc-500">
            // select a conversation
          </div>
        ) : (
          <>
            <header className="px-8 py-5 border-b border-white/10 bg-zinc-950 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-yellow-500">// chat</div>
                <div className="font-mono text-xl text-white mt-1" data-testid="active-contact-name">{active.name || active.username}</div>
                <div className="font-mono text-[10px] text-zinc-500 mt-0.5">@{active.username} · {active.role}</div>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              {messages.length === 0 && (
                <div className="font-mono text-xs text-zinc-500">// no messages yet — say hi</div>
              )}
              {messages.map((m, i) => {
                const mine = m.sender_id === myId;
                return (
                  <div
                    key={m.id || i}
                    className={`flex flex-col ${mine ? "items-end" : "items-start"} fade-up`}
                    style={{ animationDelay: `${i * 15}ms` }}
                    data-testid={`msg-${i}`}
                  >
                    <div className={`max-w-[70%] px-4 py-2.5 border ${
                      mine ? "bg-yellow-500 border-yellow-500 text-zinc-950" : "bg-zinc-900 border-white/10 text-zinc-100"
                    }`}>
                      <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                    </div>
                    <div className="font-mono text-[10px] text-zinc-600 mt-1 px-1">
                      {mine ? "you" : (active.name || active.username)} · {formatTime(m.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={send} className="px-8 py-5 border-t border-white/10 bg-zinc-950 flex items-center gap-3" data-testid="chat-form">
              <Input
                data-testid="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="type a message..."
                className="flex-1 h-11 rounded-none bg-zinc-900 border-white/10 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-mono text-sm"
              />
              <Button
                type="submit"
                data-testid="chat-send"
                className="h-11 rounded-none bg-white text-zinc-950 hover:bg-yellow-500 font-mono text-xs uppercase tracking-widest px-6"
              >
                <Send className="h-4 w-4 mr-2" strokeWidth={1.5} /> Send
              </Button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return "";
  try {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}
