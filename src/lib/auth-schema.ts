import type { D1Database } from "@cloudflare/workers-types";

/**
 * Better Auth's SQLite schema, kept in sync with the CLI-generated migration in
 * `better-auth_migrations`. D1 has no migration runner at runtime, so the tables
 * are created idempotently on cold start instead.
 */
const STATEMENTS = [
  `create table if not exists "user" (
    "id" text not null primary key,
    "name" text not null,
    "email" text not null unique,
    "emailVerified" integer not null,
    "image" text,
    "createdAt" date not null,
    "updatedAt" date not null
  )`,
  `create table if not exists "session" (
    "id" text not null primary key,
    "expiresAt" date not null,
    "token" text not null unique,
    "createdAt" date not null,
    "updatedAt" date not null,
    "ipAddress" text,
    "userAgent" text,
    "userId" text not null references "user" ("id") on delete cascade
  )`,
  `create table if not exists "account" (
    "id" text not null primary key,
    "accountId" text not null,
    "providerId" text not null,
    "userId" text not null references "user" ("id") on delete cascade,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" date,
    "refreshTokenExpiresAt" date,
    "scope" text,
    "password" text,
    "createdAt" date not null,
    "updatedAt" date not null
  )`,
  `create table if not exists "verification" (
    "id" text not null primary key,
    "identifier" text not null,
    "value" text not null,
    "expiresAt" date not null,
    "createdAt" date not null,
    "updatedAt" date not null
  )`,
  `create index if not exists "session_userId_idx" on "session" ("userId")`,
  `create index if not exists "account_userId_idx" on "account" ("userId")`,
  `create index if not exists "verification_identifier_idx" on "verification" ("identifier")`,
];

let schemaReady: Promise<void> | undefined;

/** Creates the auth tables once per Worker isolate. */
export function ensureAuthSchema(db: D1Database): Promise<void> {
  schemaReady ??= db
    .batch(STATEMENTS.map((sql) => db.prepare(sql)))
    .then(() => undefined)
    .catch((error) => {
      schemaReady = undefined;
      throw error;
    });

  return schemaReady;
}
