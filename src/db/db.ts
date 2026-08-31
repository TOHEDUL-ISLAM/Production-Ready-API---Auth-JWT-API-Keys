import { env } from "../data/env.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts"
import { relations } from "./relations.ts";
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
  