import { drizzle } from 'drizzle-orm/postgres-js';
import { connectionDetails } from './connection';

export const db = drizzle({
	connection: {
		...connectionDetails
	}
});
