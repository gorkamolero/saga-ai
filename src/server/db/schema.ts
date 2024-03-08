// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTableCreator,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `tubesleuth-ai_${name}`);

export const users = createTable("user", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 256 }).unique(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt"),
  firstName: varchar("first_name", { length: 120 }),
  lastName: varchar("last_name", { length: 120 }),
  bio: varchar("bio", { length: 180 }),
  x_handle: varchar("x_handle", { length: 120 }),
  website: varchar("website", { length: 120 }),
});

export const ideas = createTable("ideas", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  title: varchar("title", {
    length: 140,
  }),
  description: varchar("description", {
    length: 600,
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const writers = createTable("writers", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  style: varchar("style", {
    length: 480,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ideaId: uuid("idea_id").references(() => ideas.id),
});

export const artists = createTable("artists", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  style: varchar("style", {
    length: 480,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ideaId: uuid("idea_id").references(() => ideas.id),
});

export const scripts = createTable("scripts", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  ideaId: uuid("idea_id").references(() => ideas.id),
  content: text("content").notNull(),
  wordCount: integer("word_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  writerId: uuid("writer_id").references(() => writers.id),
});

export const scriptRelations = relations(scripts, ({ one, many }) => ({
  writers: one(writers),
}));

export const voiceovers = createTable("voiceovers", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  scriptId: uuid("script_id").references(() => scripts.id),
  transcript: jsonb("words").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  voicemodel: varchar("voiceover", {
    length: 16,
  }),
});

export const visualAssets = createTable("visual_assets", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  type: varchar("type", {
    length: 20,
  }),
  description: varchar("prompt", {
    length: 480,
  }),
  artistId: uuid("artist_id").references(() => artists.id),
  scriptId: uuid("script_id").references(() => scripts.id),
  url: text("url"),
  start: integer("position"),
  end: integer("position"),
  fx: varchar("fx", {
    length: 20,
  }),
  transition: varchar("transition", {
    length: 20,
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  videoId: uuid("video_id").references(() => videos.id),
});

export const videos = createTable("videos", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  description: text("description").notNull(),
  rendered: boolean("rendered").default(false),
  uploaded: boolean("uploaded").default(false),
  ideaId: uuid("idea_id").references(() => ideas.id),
  writerId: uuid("writer_id").references(() => writers.id),
  artistId: uuid("artist_id").references(() => artists.id),
  scriptId: uuid("script_id").references(() => scripts.id),
  voiceoverId: uuid("voiceover_id").references(() => voiceovers.id),
});

export const videoRelations = relations(videos, ({ one, many }) => ({
  ideas: one(ideas),
  writers: one(writers),
  artists: one(artists),
  scripts: one(scripts),
  voiceovers: one(voiceovers),
  visualAssets: many(visualAssets),
}));
