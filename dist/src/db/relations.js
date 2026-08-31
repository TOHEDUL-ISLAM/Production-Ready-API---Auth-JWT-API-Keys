import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.js";
export const relations = defineRelations(schema, r => ({
    ApiKeyTable: {
        user: r.one.UserTable({
            from: r.ApiKeysTable.userId,
            to: r.UserTable.id,
        }),
    },
    AuthorsTable: {
        books: r.many.BookTable(),
    },
    BookTable: {
        author: r.one.AuthorsTable({
            from: r.BookTable.authorId,
            to: r.AuthorsTable.id,
        }),
        addedByUser: r.one.UserTable({
            from: r.BookTable.addedBy,
            to: r.UserTable.id,
        }),
    },
    UserTable: {
        apiKeys: r.many.ApiKeysTable(),
        booksAdded: r.many.BookTable(),
    },
}));
