import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Terminal, Zap, Code2 } from "lucide-react";

/**
 * NOVA CHATBOT PLACEHOLDER
 *
 * Drop your AI code here. Suggested integration points:
 *
 *   1. Frontend: replace the <NovaPlaceholder /> render block below with your
 *      own chat UI component. You can import a module like:
 *         import MyBot from "@/nova/MyBot";
 *
 *   2. Backend: expose an endpoint (e.g. POST /api/nova/chat) in server.py
 *      that your UI calls. Route wiring is already scaffolded.
 *
 * The current user is available via useAuth(). The auth token is stored in
 * localStorage under "nova_token" for any additional API auth you need.
 */
export default function Nova() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background grid-bg" data-testid="nova-page">
      <header className="px-8 py-5 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          data-testid="nova-back"
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back
        </button>
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
          <Terminal className="h-4 w-4 text-yellow-500" strokeWidth={1.5} />
          nova / bot
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-3xl w-full space-y-10 fade-up">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-12 h-12 border border-yellow-500 bg-yellow-500/10">
              <Sparkles className="h-6 w-6 text-yellow-500" strokeWidth={1.5} />
            </span>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-yellow-500">// integration point</div>
              <div className="font-mono text-3xl tracking-tight text-white mt-1">Nova Chatbot</div>
            </div>
          </div>

          <p className="text-lg text-zinc-300 leading-relaxed max-w-2xl">
            This is where <span className="text-yellow-500">your AI code</span> lives.
            Replace the block below with your model or agent, wire in an endpoint,
            and you're shipping.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <IntegrationCard
              icon={<Code2 className="h-5 w-5" strokeWidth={1.5} />}
              title="Frontend"
              path="/app/frontend/src/pages/Nova.jsx"
              body="Import your chat component and render it below."
            />
            <IntegrationCard
              icon={<Zap className="h-5 w-5" strokeWidth={1.5} />}
              title="Backend"
              path="/app/backend/server.py"
              body="Add POST /api/nova/chat. Auth cookie is already scoped."
            />
          </div>

          {/* PLACEHOLDER: swap this out with your AI UI */}
          <div className="border border-dashed border-yellow-500/40 bg-yellow-500/5 p-8 lg:p-10 relative overflow-hidden">
            <div className="font-mono text-[10px] uppercase tracking-widest text-yellow-500 mb-3">// drop your code here</div>
            <div className="font-mono text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
{`// Nova.jsx — line ~74
// Replace this block with your chatbot component:
//
//   <MyChatbot user={user} apiBase={API_BASE} />
//
// Ready to receive props: user, token, API_BASE.
// The current auth session is live — you can call
// any /api/nova/* endpoint you add on the backend.`}
            </div>
            <div className="mt-6">
              <Button
                data-testid="nova-open-code"
                onClick={() => window.open("https://docs.emergent.sh", "_blank")}
                className="rounded-none bg-yellow-500 text-zinc-950 hover:bg-yellow-400 font-mono text-xs uppercase tracking-widest h-10"
              >
                <Sparkles className="h-4 w-4 mr-2" strokeWidth={1.5} /> Read docs
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function IntegrationCard({ icon, title, path, body }) {
  return (
    <div className="border border-white/10 bg-zinc-950 p-5 hover:border-yellow-500/40 transition-colors">
      <div className="flex items-center gap-2 text-yellow-500">
        {icon}
        <div className="font-mono text-xs uppercase tracking-widest">{title}</div>
      </div>
      <div className="font-mono text-[11px] text-zinc-500 mt-3 break-all">{path}</div>
      <p className="text-sm text-zinc-300 mt-3">{body}</p>
    </div>
  );
}
