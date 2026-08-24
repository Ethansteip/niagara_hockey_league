import { config } from 'dotenv';

config({ path: '.env' });

export const connectionDetails = {
	host: process.env.DATABASE_HOST || '',
	port: Number(process.env.DATABASE_PORT) || 10399,
	user: process.env.DATABASE_USERNAME || '',
	password: process.env.DATABASE_PASSWORD || '',
	database: 'railway'
};
