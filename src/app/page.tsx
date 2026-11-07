import { auth } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-3xl font-bold text-center max-w-md">
          Welcome! Create an account or sign in to continue.
        </h1>
        <div className="flex gap-4 mt-8">
          <Link
            href="/auth/sign-up"
            className="px-4 py-2 rounded bg-white text-black"
          >
            Sign Up
          </Link>
          <Link
            href="/auth/sign-in"
            className="px-4 py-2 rounded border"
          >
            Sign In
          </Link>
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
        <p className="text-lg mb-4">Email: {session.user.email}</p>
      </div>
    </div>
  );
}