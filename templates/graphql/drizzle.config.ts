import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './node_modules/@mdi/entities/src/models',
    out: './migrations',
    dialect: 'postgresql',
    breakpoints: false,
    verbose: true,
    dbCredentials: {
        host: process.env.DATABASE_HOST!,
        database: process.env.DATABASE_NAME!,
        user: process.env.DATABASE_USER!,
        password: process.env.DATABASE_PASSWORD!,
        ssl: {
            rejectUnauthorized: false,
        },
    },
});