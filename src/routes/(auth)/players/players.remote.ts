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

const RolesSchema = z.enum(['player', 'goalie']);

const PlayerSchema = z.object({
	firstName: z.string().min(1, 'Please enter a first name').trim(),
	lastName: z.string().min(1, 'Please enter a last name').trim(),
	role: RolesSchema
});

export const createPlayer = form(PlayerSchema, async ({ firstName, lastName, role }) => {
	await db.insert(players).values({
		firstName,
		lastName,
		role
	});

	return redirect(301, '/players?created=true');
});
