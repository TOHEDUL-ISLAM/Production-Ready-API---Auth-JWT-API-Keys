import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { AuthorsTable } from "./authors.js";
import { UserTable } from "./users.js";
export const BookTable = pgTable("books", {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    description: text(),
    publishDate: timestamp({
        withTimezone: true,
    }),
    pageCount: integer(),
    authorId: uuid()
        .notNull()
        .references(() => AuthorsTable.id, {
        onDelete: "restrict",
    }),
    addedBy: uuid()
        .notNull()
        .references(() => UserTable.id, {
        onDelete: "restrict",
    }),
    createdAt: timestamp({
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
});
