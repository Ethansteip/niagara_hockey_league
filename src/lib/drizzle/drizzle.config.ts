import { defineConfig } from 'drizzle-kit';
import { connectionDetails } from './connection';

export default defineConfig({
	schema: './src/lib/drizzle/schema.ts',
	out: './src/lib/drizzle/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		...connectionDetails
	}
});
