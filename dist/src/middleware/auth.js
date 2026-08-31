import { createMiddleware } from "hono/factory";
import {} from "../db/schema.js";
import { hashApiKey } from "../lib/crypto.js";
import { db } from "../db/db.js";
export const apiKeyAuth = createMiddleware(async (c, next) => {
    const key = c.req.header("X-API-Key");
    if (key == null || key.trim() === "") {
        return c.json({ error: "Missing API Key" }, 401);
    }
    const keyHash = hashApiKey(key);
    const apiKey = await db.query.ApiKeysTable.findFirst({ where: { keyHash } });
    if (apiKey == null) {
        return c.json({ error: "Invalid API Key" }, 401);
    }
    const user = await db.query.UserTable.findFirst({
        where: { id: apiKey.userId },
        columns: { id: true, role: true, email: true },
    });
    if (user == null) {
        return c.json({ error: "Invalid API Key" }, 401);
    }
    c.set("apiKeyUser", user);
    await next();
});
