import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import z from "zod";
import { db } from "../db/db.ts";
import { AuthorsTable } from "../db/schema.ts";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { apiKeyAuth, type ApiKeyEnv } from "../middleware/auth.ts";

const app = new Hono();



const createAuthorSchema = z.object({
    name: z.string().min(1),
    birthday: z.coerce.date().optional()
});
const updateAuthorSchema = z.object({
    name: z.string().min(1).optional(),
    birthday: z.coerce.date().nullable().optional()
});

app.get('/', async (c) => {

    const authors = await db.query.AuthorsTable.findMany();
  return c.json(authors);
})

app.get("/:id", async c => {
  const id = c.req.param("id")
  const author = await db.query.AuthorsTable.findFirst({ where: { id } })

  if (author == null) {
    return c.json({ error: "Author not found" }, 404)
  }

  return c.json(author)
})

const protectedApp = new Hono<ApiKeyEnv>();

protectedApp.use(apiKeyAuth)

protectedApp.post('/',sValidator("json", createAuthorSchema),async (c) => {
    

    const data = c.req.valid("json");
   
    const [author] = await db.insert(AuthorsTable).values(data).returning();
    return c.json({ message: "Author created successfully", data: author }, 201);

})
protectedApp.put('/:id',sValidator("json", updateAuthorSchema),async (c) => {
    
    const id = c.req.param('id');
    const data = c.req.valid("json");
    const [author] = await db.update(AuthorsTable).set(data).where( eq(AuthorsTable.id, id)).returning();
     if (! author) {
        return c.json({ error: "Author not found" }, 404);
    } 
    if(data.name !== undefined) {
        author.name = data.name;
    }
    if(data.birthday !== undefined) {
        author.birthday = data.birthday;
    }
    return c.json({ message: "Author updated successfully", data: author }, 200);

})
protectedApp.delete('/:id', async (c) => {
    const id = c.req.param('id');
    
    await db.delete(AuthorsTable).where( eq(AuthorsTable.id, id));

    return c.body(null, 204);

})
app.route("/", protectedApp);

export default app;
