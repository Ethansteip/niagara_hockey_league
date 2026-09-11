import { query, form, command } from '$app/server';
import { db } from '$lib/drizzle';
import { players, type Player, type NewPlayer } from '$lib/drizzle/schema';
import { asc, eq } from 'drizzle-orm';
import * as z from 'zod';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const getPlayers = query(async (): Promise<Player[]> => {
	return await db.select().from(players).orderBy(asc(players.lastName));
});

const RolesSchema = z.enum(['player', 'goalie']);

const PlayerSchema = z.object({
	id: z.int().nonnegative().optional(),
	firstName: z.string().min(1, 'Please enter a first name').trim(),
	lastName: z.string().min(1, 'Please enter a last name').trim(),
	active: z.boolean().optional().default(true),
	role: RolesSchema
});

const PlayerIdSchema = z.object({
	id: z.int().nonnegative().nonoptional()
});

export const createPlayer = form(PlayerSchema, async ({ firstName, lastName, role, active }) => {
	await db.insert(players).values({
		firstName,
		lastName,
		active,
		role
	});

	return redirect(301, '/players?created=true');
});

export const updatePlayer = form(
	PlayerSchema,
	async ({ id, firstName, lastName, active, role }) => {
		if (!id) {
			return error(400, { message: 'missing player id in update request.' });
		}

		await db
			.update(players)
			.set({
				firstName,
				lastName,
				active,
				role
			})
			.where(eq(players.id, id));

		return redirect(301, '/players?updated=true');
	}
);

export const getPlayer = query(PlayerIdSchema, async ({ id }) => {
	const [player] = await db.select().from(players).where(eq(players.id, id));
	return player;
});

export const deletePlayer = command(PlayerIdSchema, async ({ id }) => {
	return await db.delete(players).where(eq(players.id, id));
});
