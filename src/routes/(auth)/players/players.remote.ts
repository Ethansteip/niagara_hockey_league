import { query, form } from '$app/server';
import { db } from '$lib/drizzle';
import { alias } from 'drizzle-orm/pg-core';
import { players, type Player, type NewPlayer } from '$lib/drizzle/schema';
import { eq, and, getTableColumns, desc } from 'drizzle-orm';
import * as z from 'zod';
import { redirect } from '@sveltejs/kit';

export const getPlayers = query(async (): Promise<Player[]> => {
	return await db.select().from(players).orderBy(desc(players.lastName));
});
