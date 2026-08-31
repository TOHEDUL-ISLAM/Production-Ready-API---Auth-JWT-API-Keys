import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import z from "zod";
import { db } from "../db/db.js";
import { ApiKeysTable, AuthorsTable, UserTable } from "../db/schema.js";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
import { generateApiKey, hashPassword, verifyPassword } from "../lib/crypto.js";
import { jwt, sign } from "hono/jwt";
import { en, id } from "zod/locales";
import { env } from "../data/env.js";
const app = new Hono();
const createKeySchema = z.object({
    name: z.string().min(1).max(255)
});
app.use(jwt({ secret: env.JWT_SECRET, alg: "HS256" }));
app.get("/", async (c) => {
    console.log("hello", c.req);
    const { sub: userId } = c.var.jwtPayload;
    const keys = await db.query.ApiKeysTable.findMany({ where: { userId }, columns: {
            id: true,
            name: true,
            keyPrefix: true,
            createdAt: true
        } });
    return c.json(keys);
});
app.post("/", sValidator("json", createKeySchema), async (c) => {
    const { sub: userId } = c.var.jwtPayload;
    const { name } = c.req.valid("json");
    const { raw, hash, prefix } = generateApiKey();
    const [apiKey] = await db.insert(ApiKeysTable).values({ name, userId, keyHash: hash, keyPrefix: prefix }).returning({ id: ApiKeysTable.id });
    return c.json({ key: raw, id: apiKey.id }, 201);
});
app.delete("/:id", sValidator("json", createKeySchema), async (c) => {
    const { sub: userId } = c.var.jwtPayload;
    const id = c.req.param("id");
    const [apiKey] = await db.delete(ApiKeysTable).where(and(eq(ApiKeysTable.id, id), eq(ApiKeysTable.userId, userId))).returning({ id: ApiKeysTable.id });
    return c.body(null, 204);
});
export default app;
