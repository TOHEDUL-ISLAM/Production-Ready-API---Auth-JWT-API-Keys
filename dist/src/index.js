import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import authorRoutes from "./routes/author.js";
import authRoutes from "./routes/auth.js";
import apiKeyRoutes from "./routes/apikey.js";
import bookRoutes from "./routes/book.js";
import { env } from "./data/env.js";
const app = new Hono();
app.route('/authors', authorRoutes);
app.route('/auth', authRoutes);
app.route('/api-keys', apiKeyRoutes);
app.route('/books', bookRoutes);
serve({
    fetch: app.fetch,
    port: env.PORT
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
