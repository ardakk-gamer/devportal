import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, KeyRound, Pencil, Shield, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { username: "", name: "", password: "", role: "user" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(null);
  const [openReset, setOpenReset] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [pw, setPw] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      await api.post("/users", form);
      toast.success(`User "${form.username}" created`);
      setOpenCreate(false);
      setForm(emptyForm);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const update = async () => {
    try {
      await api.patch(`/users/${openEdit.id}`, {
        username: form.username,
        name: form.name,
        role: form.role,
      });
      toast.success("User updated");
      setOpenEdit(null);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const resetPassword = async () => {
    try {
      await api.post(`/users/${openReset.id}/reset-password`, { password: pw });
      toast.success(`Password reset for ${openReset.username}`);
      setOpenReset(null);
      setPw("");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const remove = async () => {
    try {
      await api.delete(`/users/${confirmDelete.id}`);
      toast.success(`Deleted ${confirmDelete.username}`);
      setConfirmDelete(null);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="p-8 lg:p-12" data-testid="users-page">
      <header className="flex items-end justify-between border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-yellow-500">// admin / users</div>
          <h1 className="font-mono text-4xl tracking-tight text-white mt-2">Users</h1>
          <p className="text-sm text-zinc-500 mt-2">Create, edit, and manage access for your team.</p>
        </div>
        <Button
          onClick={() => { setForm(emptyForm); setOpenCreate(true); }}
          data-testid="create-user-btn"
          className="rounded-none bg-white text-zinc-950 hover:bg-yellow-500 font-mono text-xs uppercase tracking-widest h-10"
        >
          <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} /> New User
        </Button>
      </header>

      <div className="border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-zinc-950">
              <th className="text-left font-mono text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-3">Username</th>
              <th className="text-left font-mono text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-3">Name</th>
              <th className="text-left font-mono text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-3">Role</th>
              <th className="text-left font-mono text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-3">Created</th>
              <th className="text-right font-mono text-[10px] uppercase tracking-widest text-zinc-500 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center font-mono text-xs text-zinc-500">loading...</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center font-mono text-xs text-zinc-500">// no users</td></tr>
            )}
            {users.map((u, i) => (
              <tr
                key={u.id}
                data-testid={`user-row-${u.username}`}
                className="border-b border-white/5 hover:bg-zinc-900/60 fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <td className="px-4 py-3 font-mono text-sm text-white">{u.username}</td>
                <td className="px-4 py-3 text-sm text-zinc-300">{u.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 border font-mono text-[10px] uppercase tracking-widest ${
                    u.role === "admin"
                      ? "border-yellow-500/40 text-yellow-500 bg-yellow-500/5"
                      : "border-white/10 text-zinc-400"
                  }`}>
                    {u.role === "admin" ? <Shield className="h-3 w-3" strokeWidth={1.5} /> : <UserIcon className="h-3 w-3" strokeWidth={1.5} />}
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => { setForm({ username: u.username, name: u.name, role: u.role, password: "" }); setOpenEdit(u); }}
                      data-testid={`edit-user-${u.username}`}
                      className="rounded-none h-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => { setPw(""); setOpenReset(u); }}
                      data-testid={`reset-pw-${u.username}`}
                      className="rounded-none h-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <KeyRound className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setConfirmDelete(u)}
                      data-testid={`delete-user-${u.username}`}
                      className="rounded-none h-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="rounded-none border-white/10 bg-zinc-950" data-testid="create-user-dialog">
          <DialogHeader>
            <DialogTitle className="font-mono tracking-tight">New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Username">
              <Input data-testid="new-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="rounded-none bg-zinc-900 border-white/10 font-mono" />
            </Field>
            <Field label="Name">
              <Input data-testid="new-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none bg-zinc-900 border-white/10" />
            </Field>
            <Field label="Password">
              <Input data-testid="new-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-none bg-zinc-900 border-white/10 font-mono" />
            </Field>
            <Field label="Role">
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger data-testid="new-role" className="rounded-none bg-zinc-900 border-white/10 font-mono"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-none border-white/10 bg-zinc-950 font-mono">
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenCreate(false)} className="rounded-none font-mono text-xs uppercase tracking-widest">Cancel</Button>
            <Button onClick={create} data-testid="submit-create-user" className="rounded-none bg-white text-zinc-950 hover:bg-yellow-500 font-mono text-xs uppercase tracking-widest">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!openEdit} onOpenChange={(v) => !v && setOpenEdit(null)}>
        <DialogContent className="rounded-none border-white/10 bg-zinc-950" data-testid="edit-user-dialog">
          <DialogHeader><DialogTitle className="font-mono tracking-tight">Edit User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Field label="Username">
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="rounded-none bg-zinc-900 border-white/10 font-mono" />
            </Field>
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none bg-zinc-900 border-white/10" />
            </Field>
            <Field label="Role">
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="rounded-none bg-zinc-900 border-white/10 font-mono"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-none border-white/10 bg-zinc-950 font-mono">
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenEdit(null)} className="rounded-none font-mono text-xs uppercase tracking-widest">Cancel</Button>
            <Button onClick={update} data-testid="submit-edit-user" className="rounded-none bg-white text-zinc-950 hover:bg-yellow-500 font-mono text-xs uppercase tracking-widest">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password dialog */}
      <Dialog open={!!openReset} onOpenChange={(v) => !v && setOpenReset(null)}>
        <DialogContent className="rounded-none border-white/10 bg-zinc-950" data-testid="reset-password-dialog">
          <DialogHeader><DialogTitle className="font-mono tracking-tight">Reset Password</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Set a new password for <span className="font-mono text-white">{openReset?.username}</span>.</p>
            <Input data-testid="reset-password-input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="new password" className="rounded-none bg-zinc-900 border-white/10 font-mono" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenReset(null)} className="rounded-none font-mono text-xs uppercase tracking-widest">Cancel</Button>
            <Button onClick={resetPassword} data-testid="submit-reset-password" className="rounded-none bg-white text-zinc-950 hover:bg-yellow-500 font-mono text-xs uppercase tracking-widest">Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <DialogContent className="rounded-none border-white/10 bg-zinc-950" data-testid="delete-user-dialog">
          <DialogHeader><DialogTitle className="font-mono tracking-tight">Delete User</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-400">
            This will permanently delete <span className="font-mono text-white">{confirmDelete?.username}</span> and their messages.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)} className="rounded-none font-mono text-xs uppercase tracking-widest">Cancel</Button>
            <Button onClick={remove} data-testid="confirm-delete-user" className="rounded-none bg-red-500 text-white hover:bg-red-600 font-mono text-xs uppercase tracking-widest">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">{label}</label>
      {children}
    </div>
  );
}
