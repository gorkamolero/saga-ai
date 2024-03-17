// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTableCreator,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `saga-ai_${name}`);

export const users = createTable('user', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 256 }).unique(),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt'),
  firstName: varchar('first_name', { length: 120 }),
  lastName: varchar('last_name', { length: 120 }),
  bio: varchar('bio', { length: 180 }),
  x_handle: varchar('x_handle', { length: 120 }),
  website: varchar('website', { length: 120 }),
  currentConversationId: uuid('current_conversation_id'),
});

export const conversations = createTable('conversations', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  aiState: text('aiState'),
  uiState: text('uiState'),
  ideaId: uuid('idea_id').references(() => ideas.id),
  writerId: uuid('writer_id').references(() => writers.id),
  artistId: uuid('artist_id').references(() => artists.id),
  scriptId: uuid('script_id').references(() => scripts.id),
  voiceoverId: uuid('voiceover_id').references(() => voiceovers.id),
  videoId: uuid('video_id').references(() => videos.id),
  channelId: uuid('channel_id').references(() => channels.id),
});

export const userRelations = relations(users, ({ one, many }) => ({
  conversations: many(conversations),
  currentConversation: one(conversations, {
    fields: [users.currentConversationId],
    references: [conversations.id],
  }),
}));

export const conversationRelations = relations(conversations, ({ one }) => ({
  user: one(users),
  idea: one(ideas),
  writer: one(writers),
  artist: one(artists),
  script: one(scripts),
  voiceover: one(voiceovers),
  video: one(videos),
  channel: one(channels),
}));

export const ideas = createTable('ideas', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  title: varchar('title', {
    length: 140,
  }),
  description: varchar('description', {
    length: 600,
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ideaRelations = relations(ideas, ({ one, many }) => ({
  video: one(videos),
  scripts: many(scripts),
}));

export const writers = createTable('writers', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  style: varchar('style', {
    length: 480,
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const artists = createTable('artists', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  style: varchar('style', {
    length: 480,
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ideaId: uuid('idea_id').references(() => ideas.id),
});

export const scripts = createTable('scripts', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  ideaId: uuid('idea_id').references(() => ideas.id),
  content: text('content').notNull(),
  wordCount: integer('word_count').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  writerId: uuid('writer_id').references(() => writers.id),
  videoId: uuid('video_id'),
  voicemodel: varchar('voicemodel', {
    length: 16,
  }),
});

export const scriptsRelations = relations(scripts, ({ one }) => ({
  writer: one(writers),
  video: one(videos),
  idea: one(ideas, {
    fields: [scripts.ideaId],
    references: [ideas.id],
  }),
}));

export const voiceovers = createTable('voiceovers', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  scriptId: uuid('script_id').references(() => scripts.id),
  transcript: jsonb('transcript'),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  voicemodel: varchar('voicemodel', {
    length: 16,
  }),
  duration: integer('duration').default(0),
  videoId: uuid('video_id'),
});

export const visualAssets = createTable('visual_assets', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  type: varchar('type', {
    length: 20,
  }),
  description: varchar('description', {
    length: 480,
  }),
  artistId: uuid('artist_id').references(() => artists.id),
  scriptId: uuid('script_id').references(() => scripts.id),
  url: text('url'),
  start: doublePrecision('start'),
  end: doublePrecision('end'),
  fx: varchar('fx', {
    length: 20,
  }),
  transition: varchar('transition', {
    length: 20,
  }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  videoId: uuid('video_id').references(() => videos.id),
  generated: boolean('generated').default(false),
  generatedAt: timestamp('generated_at'),
  disparityUrl: text('disparity_url'),
  animation: text('animation'),
  animatedAt: timestamp('animated_at'),
  index: integer('index'),
  startWordIndex: integer('start_word_index'),
  endWordIndex: integer('end_word_index'),
});

export const videos = createTable('videos', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  url: text('url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  description: text('description').notNull(),
  rendered: boolean('rendered').default(false),
  uploaded: boolean('uploaded').default(false),
  ideaId: uuid('idea_id').references(() => ideas.id),
  writerId: uuid('writer_id').references(() => writers.id),
  artistId: uuid('artist_id').references(() => artists.id),
  scriptId: uuid('script_id').references(() => scripts.id),
  voiceoverId: uuid('voiceover_id').references(() => voiceovers.id),
  duration: integer('duration').default(0),
  type: varchar('type', {
    length: 10,
  }),
  channelId: uuid('channel_id').references(() => channels.id),
});

export const videoRelations = relations(videos, ({ one, many }) => ({
  ideas: one(ideas),
  writer: one(writers),
  artist: one(artists),
  script: one(scripts, {
    fields: [videos.scriptId],
    references: [scripts.id],
  }),
  voiceover: one(voiceovers, {
    fields: [videos.voiceoverId],
    references: [voiceovers.id],
  }),
  visualAssets: many(visualAssets),
}));

export const voiceoverRelations = relations(voiceovers, ({ one }) => ({
  video: one(videos),
}));

export const visualAssetRelations = relations(visualAssets, ({ one }) => ({
  videos: one(videos, {
    fields: [visualAssets.videoId],
    references: [videos.id],
  }),
}));

export const channels = createTable('channel', {
  id: uuid('id').primaryKey(),
  name: varchar('name', {
    length: 120,
  }).unique(),
  description: varchar('description', {
    length: 480,
  }),
  conversationId: uuid('conversation_id'),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  writerId: uuid('writer_id').references(() => writers.id),
  artistId: uuid('artist_id').references(() => artists.id),
  voicemodel: varchar('voicemodel', {
    length: 16,
  }),
});

export const channelsRelations = relations(channels, ({ one, many }) => ({
  user: one(users),
  writer: one(writers),
  artist: one(artists),
  videos: many(videos),
  ideas: many(ideas),
  scripts: many(scripts),
}));
