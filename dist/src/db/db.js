import { env } from "../data/env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import { relations } from "./relations.js";
export const db = drizzle({
    relations,
    connection: {
        password: env.DB_PASSWORD,
        user: env.DB_USER,
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        ssl: false,
    },
});
