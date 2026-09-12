import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "./auth";

/* ------------------------------------------------------------------ */
/* Types shared across the app (mirror the SQLite schema below)        */
/* ------------------------------------------------------------------ */

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export type ServiceStatus =
  | "operational"
  | "degraded"
  | "down"
  | "untracked";

export interface ServiceRow {
  id: number;
  name: string;
  url: string;
  status: ServiceStatus;
  latency_ms: number | null;
  last_checked_at: string | null;
  note: string;
  created_at: string;
}

export type ProposalStatus = "open" | "closed";

export interface ProposalRow {
  id: number;
  title: string;
  description: string;
  status: ProposalStatus;
  proposer: string;
  created_at: string;
  closed_at: string | null;
}

export interface ProposalCounts {
  yes: number;
  no: number;
  abstain: number;
  total: number;
}

export type VoteChoice = "yes" | "no" | "abstain";

export interface AuditRow {
  id: number;
  actor: string;
  action: string;
  detail: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Database bootstrap (SQLite file at ./data/bridge.db, WAL mode)      */
/* ------------------------------------------------------------------ */

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "bridge.db");

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  fs.mkdirSync(DB_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  migrate(db);
  seed(db);
  return db;
}

export function closeDb(): void {
  try {
    db?.close();
  } catch {
    /* ignore */
  }
  db = null;
}

/* ------------------------------------------------------------------ */
/* Typed query helpers (node:sqlite returns Record<string, ...> rows)  */
/* ------------------------------------------------------------------ */

/** Values bindable to a prepared statement (node:sqlite's SQLInputValue). */
type SqlBound = null | number | bigint | string | Uint8Array;

export function all<T>(sql: string, ...args: (SqlBound | unknown)[]): T[] {
  return getDb().prepare(sql).all(...(args as SqlBound[])) as unknown as T[];
}

export function one<T>(sql: string, ...args: (SqlBound | unknown)[]): T | undefined {
  return getDb().prepare(sql).get(...(args as SqlBound[])) as unknown as T | undefined;
}

export function first<T>(sql: string, ...args: unknown[]): T {
  const row = one<T>(sql, ...args);
  if (row === undefined) throw new Error("Expected a row but none was found.");
  return row;
}

function migrate(d: DatabaseSync): void {
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT NOT NULL,
      url             TEXT NOT NULL DEFAULT '',
      status          TEXT NOT NULL DEFAULT 'untracked',
      latency_ms      INTEGER,
      last_checked_at TEXT,
      note            TEXT NOT NULL DEFAULT '',
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status      TEXT NOT NULL DEFAULT 'open',
      proposer    TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      closed_at   TEXT
    );

    CREATE TABLE IF NOT EXISTS votes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
      username    TEXT NOT NULL,
      choice      TEXT NOT NULL CHECK (choice IN ('yes','no','abstain')),
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (proposal_id, username)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      actor      TEXT NOT NULL,
      action     TEXT NOT NULL,
      detail     TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_votes_proposal ON votes(proposal_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
  `);
}

/** Seed demo data on first boot (idempotent). */
function seed(d: DatabaseSync): void {
  const { username, password } = adminCredentials();

  const userCount = (d.prepare("SELECT COUNT(*) AS n FROM users").get() as {
    n: number;
  }).n;
  if (userCount === 0) {
    d.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(
      username,
      hashPassword(password)
    );
    audit(d, "system", "user.seeded", `bootstrap admin '${username}'`);
  }

  const serviceCount = (d.prepare("SELECT COUNT(*) AS n FROM services").get() as {
    n: number;
  }).n;
  if (serviceCount === 0) {
    const insert = d.prepare(
      "INSERT INTO services (name, url, status, note) VALUES (?, ?, ?, ?)"
    );
    // Demo endpoints. Self-origin and the npm registry are reachable from most
    // networks; edit them in the Services panel to point at real infrastructure.
    insert.run(
      "The Bridge Console (self)",
      "http://localhost:3000/",
      "untracked",
      "Self-health check against this console"
    );
    insert.run(
      "CNOTA Ledger — npm registry mirror",
      "https://registry.npmjs.org/",
      "untracked",
      "Draft schema: CNOTA compliance vault"
    );
    insert.run(
      "Virtue Passport (Moltbook)",
      "https://example.org/",
      "untracked",
      "Identity & passport layer (example endpoint)"
    );
    insert.run("Meta-Jury Relay", "", "untracked", "Awaiting endpoint configuration");
  }

  const proposalCount = (d
    .prepare("SELECT COUNT(*) AS n FROM proposals")
    .get() as { n: number }).n;
  if (proposalCount === 0) {
    const insert = d.prepare(
      "INSERT INTO proposals (title, description, status, proposer) VALUES (?, ?, 'open', ?)"
    );
    insert.run(
      "Ratify L5 Virtue Passport schema v0.9",
      "Adopt the Moltbook-backed Virtue Passport schema as the canonical L5 identity artefact for the federation. Effects: CNOTA attestation format, Meta-Jury review scope.",
      "system"
    );
    insert.run(
      "Standing order: weekly fleet pulse",
      "Automate the Praefectus Navis Praeco Tabularius pulse each Monday 06:00 CET and mirror a human-readable digest to the Bridge console.",
      "system"
    );
  }
}

function adminCredentials(): { username: string; password: string } {
  const username = process.env.BRIDGE_ADMIN_USERNAME || "admin";
  const password = process.env.BRIDGE_ADMIN_PASSWORD || "admin123";
  return { username, password };
}

/* ------------------------------------------------------------------ */
/* Audit helper                                                        */
/* ------------------------------------------------------------------ */

export function audit(
  d: DatabaseSync,
  actor: string,
  action: string,
  detail = ""
): void {
  d.prepare(
    "INSERT INTO audit_log (actor, action, detail) VALUES (?, ?, ?)"
  ).run(actor, action, detail);
}