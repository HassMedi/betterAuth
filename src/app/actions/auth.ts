"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "@/lib/auth";
import { mapAuthError } from "@/lib/auth-errors";

export type AuthState = { error?: string } | null;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name) return { error: "The name field is required." };
  if (!email) return { error: "The email field is required." };
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (!password) return { error: "The password field is required." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters long." };
  if (password !== confirmPassword)
    return { error: "Password confirmation does not match." };

  const auth = await getAuth();
  try {
    await auth.api.signUpEmail({
      body: { email, password, name },
    });
  } catch (error) {
    return { error: mapAuthError(error) };
  }

  redirect("/");
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) return { error: "The email field is required." };
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (!password) return { error: "The password field is required." };

  const auth = await getAuth();
  try {
    await auth.api.signInEmail({
      body: { email, password },
    });
  } catch (error) {
    return { error: mapAuthError(error) };
  }

  redirect("/");
}

export async function signOutAction() {
  const auth = await getAuth();
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}