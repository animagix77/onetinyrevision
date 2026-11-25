import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const plates = sqliteTable("plates", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull().unique(),
  chef: text("chef").notNull(),
  drink: text("drink"),
  draft: text("draft").notNull(),
  servings: text("servings").notNull(),
  version: integer("version").notNull(),
  updated: integer("updated").notNull(),
});
export const notes = sqliteTable("plate_notes", {
  id: text("id").primaryKey(),
  plate: text("plate")
    .notNull()
    .references(() => plates.id),
  chef: text("chef").notNull(),
  message: text("message").notNull(),
  created: integer("created").notNull(),
});

export const chefs = sqliteTable("chef_profiles", {
  owner: text("owner").primaryKey(),
  name: text("name").notNull(),
});

export const gameRounds = sqliteTable("game_rounds", {
  id: text("id").primaryKey(),
});

export const pagesSessions = sqliteTable("pages_sessions", {
  hash: text("hash").primaryKey(),
  owner: text("owner").notNull(),
  challenge: text("challenge"),
  expires: integer("expires").notNull(),
});
