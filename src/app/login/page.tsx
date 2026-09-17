"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("The email or password is incorrect.");
      setIsLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand"><span>MOTION</span><strong>MIRAGE</strong><small>STUDIOS</small></div>
        <p className="eyebrow">Private workspace</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to create and manage your studio invoices.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign in securely"}</button>
        </form>
        <p className="security-note">Private access only. New accounts are created by the studio owner.</p>
      </div>
    </main>
  );
}
