/*
 * Shared helpers + static data used by every seed script.
 *
 * All seed scripts are meant to be run from the project root with bun, e.g.
 *   bun run seed            (everything, in dependency order)
 *   bun run seed:players    (a single entity)
 */
import { sql, type SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { db } from '../index';

export { db };

/* ---------- Static data ---------- */

export const TEAMS = [
	{ name: 'Bruins', code: 'BRU' },
	{ name: 'Leafs', code: 'LEA' },
	{ name: 'Wings', code: 'WNG' },
	{ name: 'Habs', code: 'HAB' }
] as const;

export const SEASONS = [
	{ name: '2025-2026', startDate: '2025-10-05', endDate: '2026-03-31', active: true },
	{ name: '2026-2027', startDate: '2026-10-04', endDate: '2027-03-31', active: false }
] as const;

/** The season rosters get attached to. Exactly one season in SEASONS should be active. */
export const ACTIVE_SEASON = SEASONS.find((s) => s.active)!;

/* ---------- Deterministic randomness ---------- */

/**
 * Small seeded PRNG (mulberry32) so re-running the seeds produces the same
 * scores, stats, and jersey numbers every time.
 */
export function createRng(seed: number) {
	let a = seed >>> 0;
	const next = () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	return {
		/** float in [0, 1) */
		next,
		/** integer in [min, max] inclusive */
		int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
		/** true with the given probability */
		chance: (p: number) => next() < p,
		pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
		/** pick an index using relative weights */
		weighted: (weights: readonly number[]) => {
			const total = weights.reduce((a, b) => a + b, 0);
			let r = next() * total;
			for (let i = 0; i < weights.length; i++) {
				r -= weights[i];
				if (r < 0) return i;
			}
			return weights.length - 1;
		},
		shuffle: <T>(arr: readonly T[]): T[] => {
			const out = [...arr];
			for (let i = out.length - 1; i > 0; i--) {
				const j = Math.floor(next() * (i + 1));
				[out[i], out[j]] = [out[j], out[i]];
			}
			return out;
		}
	};
}

export type Rng = ReturnType<typeof createRng>;

/* ---------- DB helpers ---------- */

/**
 * Empties the given tables and every table that references them (CASCADE),
 * and resets their serial ids so seeded ids are predictable (teams 1-4, etc).
 */
export async function truncate(...tables: PgTable[]) {
	const names: SQL[] = tables.map((t) => sql`${t}`);
	await db.transaction(async (tx) => {
		// Postgres emits a NOTICE for every cascaded table; keep the seed output readable.
		await tx.execute(sql`SET LOCAL client_min_messages = WARNING`);
		await tx.execute(sql`TRUNCATE TABLE ${sql.join(names, sql`, `)} RESTART IDENTITY CASCADE`);
	});
}

export function chunk<T>(arr: T[], size = 500): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
	return out;
}

export async function closeDb() {
	await db.$client.end();
}

export function log(message: string) {
	console.log(`  ${message}`);
}

/**
 * Wraps a seed function for standalone execution: runs it, reports timing,
 * and always closes the DB connection so the process exits cleanly.
 */
export async function runStandalone(name: string, fn: () => Promise<unknown>) {
	const started = Date.now();
	console.log(`▶ ${name}`);
	try {
		await fn();
		console.log(`✔ ${name} finished in ${Date.now() - started}ms`);
	} catch (err) {
		console.error(`✖ ${name} failed`);
		console.error(err);
		process.exitCode = 1;
	} finally {
		await closeDb();
	}
}
