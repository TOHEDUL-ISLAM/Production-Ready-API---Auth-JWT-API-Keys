import { strict } from 'assert';
import { defineConfig } from 'drizzle-kit';
import { env } from "./src/data/env.js";
export default defineConfig({
    out: './src/db/migrations',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    strict: true,
    verbose: true,
    dbCredentials: {
        password: env.DB_PASSWORD,
        user: env.DB_USER,
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        ssl: false
    },
});
