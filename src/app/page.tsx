"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/features/shared/components/ui/button";
import { authClient } from "@/lib/auth/client";

type SessionUser = { id: string; email: string; name?: string } | null;

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await authClient.getSession();
        setUser((data?.user as SessionUser) ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      setUser(null);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-3xl font-bold text-center max-w-md">
          Welcome! Create an account or sign in to continue.
        </h1>
        <div className="flex gap-4 mt-8">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold text-center max-w-md">
        Welcome back — you&apos;re signed in.
      </h1>
      <div className="mt-8 text-center space-y-2">
        <p className="text-lg">User ID: {user.id}</p>
        <p className="text-lg">Email: {user.email}</p>
        <Button
          variant="destructive"
          size="lg"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out…" : "Logout"}
        </Button>
      </div>
    </div>
  );
}