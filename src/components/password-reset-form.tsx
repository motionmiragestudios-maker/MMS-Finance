"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import Link from "next/link";

export function PasswordResetForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("hashchange", onChange);
      return () => window.removeEventListener("hashchange", onChange);
    },
    () => window.location.hash.slice(1),
    () => "",
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password !== confirmation) {
      setMessage("The passwords do not match.");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(result.error ?? "Unable to reset password.");
      return;
    }
    window.history.replaceState(null, "", "/reset-password");
    setComplete(true);
  }

  return <section className="login-page"><div className="login-card"><p className="eyebrow">Account security</p><h1>Set your password</h1>{complete ? <><p className="muted">Your password has been updated. You can now sign in.</p><Link className="primary-button" href="/login">Go to sign in</Link></> : token ? <form className="login-form" onSubmit={submit}><label>New password<input required minLength={12} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label>Confirm password<input required minLength={12} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>{message && <p className="login-error" role="alert">{message}</p>}<button className="primary-button" type="submit" disabled={loading}>{loading ? "Saving..." : "Set password"}</button></form> : <p className="login-error" role="alert">This password setup link is missing or expired. Ask the workspace owner to send a new one.</p>}</div></section>;
}