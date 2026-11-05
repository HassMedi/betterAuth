import { headers } from "next/headers";
import Link from "next/link";

import { Button } from "@/features/shared/components/ui/button";
import { getAuth } from "@/lib/auth";

import { signOutAction } from "./actions/auth";

// The page reads the session, so it must render per request (and only a Worker
// request has the D1 binding available).
export const dynamic = "force-dynamic";

export default async function Home() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-3xl font-bold text-center max-w-md">
          Welcome! Create an account or sign in to continue.
        </h1>
        <div className="flex gap-4 mt-8">
          <Button asChild size="lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signin">Sign In</Link>
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
      <div className="mt-8 text-center">
        <p className="text-lg mb-4">User ID: {session.user.id}</p>
        <form action={signOutAction}>
          <Button type="submit" size="lg">
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}
