import { kyselyAdapter } from "@better-auth/kysely-adapter";
import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

import { ensureAuthSchema } from "./auth-schema";

const DEV_SECRET = "dev-secret-change-me-in-production-minimum-32-chars";

type AuthEnv = {
  DB?: D1Database;
  APP_ORIGIN?: string;
  BETTER_AUTH_SECRET?: string;
};

function getAuthEnv(): AuthEnv {
  try {
    return (getCloudflareContext().env ?? {}) as AuthEnv;
  } catch {
    // Outside a Worker/request context (e.g. during a build), fall back to
    // whatever plain process env provides.
    return {};
  }
}

async function createAuth() {
  const env = getAuthEnv();
  const db = env.DB;

  if (!db) {
    throw new Error(
      "The D1 binding `DB` is not available. Add D1 storage named DB to the site, " +
        "or run the dev server with the local Wrangler config so bindings are exposed.",
    );
  }

  await ensureAuthSchema(db);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kysely = new Kysely<any>({ dialect: new D1Dialect({ database: db }) });

  return betterAuth({
    secret:
      env.BETTER_AUTH_SECRET ??
      process.env.BETTER_AUTH_SECRET ??
      DEV_SECRET,
    // Sites injects APP_ORIGIN on deploy; locally BETTER_AUTH_URL points at :3000.
    baseURL:
      env.APP_ORIGIN ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:3000",
    database: kyselyAdapter(kysely, { type: "sqlite" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 900, max: 5 },
        "/sign-up/email": { window: 900, max: 5 },
      },
    },
    plugins: [nextCookies()],
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;

let authPromise: Promise<Auth> | undefined;

/**
 * Better Auth is built lazily on the first request so the D1 binding is read
 * from the request's Cloudflare context and the schema exists before use.
 */
export function getAuth(): Promise<Auth> {
  authPromise ??= createAuth().catch((error) => {
    authPromise = undefined;
    throw error;
  });

  return authPromise;
}
