"use client";

import { useState } from "react";
import Link from "next/link";

import { authClient } from "@/lib/auth/client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await authClient.signUp.email({ email, password, name });
      if (error) {
        setError(error.message ?? "Sign up failed");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 w-64">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={8}
          className="border rounded px-3 py-2"
        />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-white text-black disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign Up"}
        </button>
      </form>
      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}