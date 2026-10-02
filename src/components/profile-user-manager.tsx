"use client";

import { FormEvent, useEffect, useState } from "react";
import { roleLabel, userRoles, type UserRole } from "@/lib/user-roles";

type UserRecord = { id: string; name: string; email: string; role: UserRole; createdAt: string };
type UserManagerProps = { isOwner: boolean; currentUser: Pick<UserRecord, "id" | "name" | "email" | "role"> };

export function UserManager({ isOwner, currentUser }: UserManagerProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" as UserRole });
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", role: "employee" as UserRole });
  const [resettingUserId, setResettingUserId] = useState("");

  async function loadUsers() {
    const response = await fetch("/api/users");
    if (response.ok) setUsers(await response.json());
  }

  useEffect(() => {
    if (!isOwner) return;
    const timer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(timer);
  }, [isOwner]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Unable to create user."); return; }
    setUsers((current) => [...current, result]);
    setForm({ name: "", email: "", password: "", role: "employee" });
    setIsAdding(false);
    setMessage(`${roleLabel(result.role)} account created. Send them a reset link so they can choose their own password.`);
  }

  function startEditing(user: UserRecord) {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, password: "", role: user.role });
    setMessage("");
  }

  async function updateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) return;
    setMessage("");
    const response = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingUser.id, ...editForm }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Unable to update user."); return; }
    setUsers((current) => current.map((user) => user.id === result.id ? result : user));
    setEditingUser(null);
    setEditForm({ name: "", email: "", password: "", role: "employee" });
    setMessage("User account updated.");
  }

  async function sendResetLink(user: UserRecord) {
    setResettingUserId(user.id);
    setMessage("");
    const response = await fetch(`/api/users/${user.id}/reset-link`, { method: "POST" });
    const result = await response.json();
    setResettingUserId("");
    setMessage(response.ok ? `Password setup link sent to ${user.email}.` : result.error ?? "Unable to send password reset link.");
  }

  async function deleteUser(user: UserRecord) {
    if (!window.confirm(`Delete ${user.name} (${user.email})?`)) return;
    setMessage("");
    const response = await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Unable to delete user."); return; }
    setUsers((current) => current.filter((currentUser) => currentUser.id !== user.id));
    setMessage("User deleted.");
  }

  if (!isOwner) {
    return <section className="settings-panel"><p className="eyebrow">Account access</p><h2>{currentUser.name}</h2><p className="muted">{currentUser.email}</p><span className={`role-badge role-badge--${currentUser.role}`}>{roleLabel(currentUser.role)}</span><p className="muted">Your role controls which workspace actions are available. Ask the owner to change your access or send a password setup link.</p></section>;
  }

  return <section className="settings-panel user-manager">
    <div className="panel-heading"><div><p className="eyebrow">Access control</p><h2>Workspace users</h2><p className="muted">Choose each person’s role to control their workspace powers.</p></div><button className="secondary-button" type="button" onClick={() => setIsAdding((current) => !current)}>{isAdding ? "Cancel" : "Add user"}</button></div>
    {isAdding && <form className="user-form" onSubmit={createUser}><div className="form-grid two-columns"><label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Sign-in email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Temporary password<input required minLength={12} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>{userRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></label></div><button className="primary-button" type="submit">Create account</button></form>}
    {message && <p className="save-message" role="status">{message}</p>}
    <div className="role-guide"><p><strong>Employee</strong><span>Create and view invoices.</span></p><p><strong>Co-founder</strong><span>Manage invoices, quotations, clients, payments, expenses, and vendors.</span></p><p><strong>Owner</strong><span>Full access, including company settings and user roles.</span></p></div>
    <div className="user-list">{users.length ? users.map((user) => <div className="user-row" key={user.id}>
      {editingUser?.id === user.id ? <form className="user-edit-form" onSubmit={updateUser}><div className="form-grid two-columns"><label>Full name<input required value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} /></label><label>Sign-in email<input required type="email" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} /></label><label>New password <span className="field-hint">Optional direct reset</span><input minLength={12} type="password" autoComplete="new-password" value={editForm.password} onChange={(event) => setEditForm({ ...editForm, password: event.target.value })} /></label><label>Role<select value={editForm.role} onChange={(event) => setEditForm({ ...editForm, role: event.target.value as UserRole })}>{userRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></label></div><div className="record-actions"><button className="primary-button" type="submit">Save account</button><button className="secondary-button" type="button" onClick={() => setEditingUser(null)}>Cancel</button></div></form> : <><div className="record-avatar">{user.name.slice(0, 1).toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.email}</span></div><span className={`role-badge role-badge--${user.role}`}>{roleLabel(user.role)}</span><div className="record-actions"><button className="text-button" type="button" disabled={resettingUserId === user.id} onClick={() => void sendResetLink(user)}>{resettingUserId === user.id ? "Sending..." : "Send setup link"}</button><button className="text-button" type="button" onClick={() => startEditing(user)}>Edit</button>{user.id !== currentUser.id && <button className="remove-button" type="button" onClick={() => void deleteUser(user)} aria-label={`Delete ${user.email}`}>Delete</button>}</div></>}
    </div>) : <p className="muted">No users loaded yet.</p>}</div>
  </section>;
}