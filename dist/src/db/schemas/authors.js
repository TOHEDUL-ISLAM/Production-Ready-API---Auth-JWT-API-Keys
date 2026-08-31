import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
export const AuthorsTable = pgTable("authors", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    birthday: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
