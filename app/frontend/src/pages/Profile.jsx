import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) { toast.error("New passwords do not match"); return; }
    setLoading(true);
    try {
      await api.post("/auth/change-password", { current_password: current, new_password: next });
      toast.success("Password updated");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-8 lg:p-12" data-testid="profile-page">
      <header className="border-b border-white/10 pb-6 mb-8">
        <div className="font-mono text-[10px] uppercase tracking-widest text-yellow-500">// account</div>
        <h1 className="font-mono text-4xl tracking-tight text-white mt-2">Profile</h1>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        <div className="border border-white/10 bg-zinc-950 p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-4">// identity</div>
          <dl className="space-y-3 text-sm">
            <Row label="Username" value={user?.username} />
            <Row label="Name" value={user?.name} />
            <Row label="Role" value={user?.role} />
            <Row label="ID" value={user?.id} mono />
          </dl>
        </div>

        <form onSubmit={submit} className="border border-white/10 bg-zinc-950 p-6 space-y-4" data-testid="change-password-form">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">// change password</div>
          <FieldPw label="Current password" value={current} onChange={setCurrent} testid="current-password" />
          <FieldPw label="New password" value={next} onChange={setNext} testid="new-password" />
          <FieldPw label="Confirm new password" value={confirm} onChange={setConfirm} testid="confirm-password" />
          <Button
            type="submit"
            disabled={loading}
            data-testid="submit-change-password"
            className="w-full h-10 rounded-none bg-white text-zinc-950 hover:bg-yellow-500 font-mono text-xs uppercase tracking-widest"
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-2 last:border-b-0">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</dt>
      <dd className={`text-right text-white ${mono ? "font-mono text-xs" : "text-sm"}`}>{value || "—"}</dd>
    </div>
  );
}

function FieldPw({ label, value, onChange, testid }) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">{label}</label>
      <Input
        data-testid={testid}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-none bg-zinc-900 border-white/10 font-mono focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
        required
      />
    </div>
  );
}
