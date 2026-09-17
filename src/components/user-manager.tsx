"use client";

import { FormEvent, useEffect, useState } from "react";

type UserRecord = { id: string; name: string; email: string; role: string; createdAt: string };

export function UserManager() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function loadUsers() {
    const response = await fetch("/api/users");
    if (response.ok) setUsers(await response.json());
  }

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Unable to create user."); return; }
    setUsers((current) => [...current, result]);
    setForm({ name: "", email: "", password: "" });
    setIsAdding(false);
    setMessage("User created. They can now sign in with their email and password.");
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

  return <section className="settings-panel user-manager"><div className="panel-heading"><div><p className="eyebrow">Access control</p><h2>Workspace users</h2><p className="muted">Only owners can create accounts. Passwords are hashed before storage.</p></div><button className="secondary-button" type="button" onClick={() => setIsAdding((current) => !current)}>{isAdding ? "Cancel" : "Add user"}</button></div>{isAdding && <form className="user-form" onSubmit={createUser}><div className="form-grid three-columns"><label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Password<input required minLength={12} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label></div><button className="primary-button" type="submit">Create user</button></form>}{message && <p className="save-message" role="status">{message}</p>}<div className="user-list">{users.length ? users.map((user) => <div className="user-row" key={user.id}><div className="record-avatar">{user.name.slice(0, 1).toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.email}</span></div><small>{user.role}</small><button className="remove-button" type="button" onClick={() => deleteUser(user)} aria-label={`Delete ${user.email}`}>Delete</button></div>) : <p className="muted">No users loaded yet. Connect the database and sign in as the owner.</p>}</div></section>;
}
