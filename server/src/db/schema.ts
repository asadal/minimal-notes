
import { pgTable, text, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  google_id: text('google_id').notNull().unique(),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const foldersTable = pgTable('folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  user_id: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  parent_folder_id: text('parent_folder_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const notesTable = pgTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  user_id: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  folder_id: text('folder_id').references(() => foldersTable.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const tagsTable = pgTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  user_id: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  color: text('color'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

export const noteTagsTable = pgTable('note_tags', {
  note_id: text('note_id').notNull().references(() => notesTable.id, { onDelete: 'cascade' }),
  tag_id: text('tag_id').notNull().references(() => tagsTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.note_id, table.tag_id] })
}));

export const attachmentsTable = pgTable('attachments', {
  id: text('id').primaryKey(),
  note_id: text('note_id').notNull().references(() => notesTable.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  original_filename: text('original_filename').notNull(),
  file_size: integer('file_size').notNull(),
  mime_type: text('mime_type').notNull(),
  file_path: text('file_path').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  folders: many(foldersTable),
  notes: many(notesTable),
  tags: many(tagsTable)
}));

export const foldersRelations = relations(foldersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [foldersTable.user_id],
    references: [usersTable.id]
  }),
  parentFolder: one(foldersTable, {
    fields: [foldersTable.parent_folder_id],
    references: [foldersTable.id],
    relationName: 'parentFolder'
  }),
  subfolders: many(foldersTable, {
    relationName: 'parentFolder'
  }),
  notes: many(notesTable)
}));

export const notesRelations = relations(notesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [notesTable.user_id],
    references: [usersTable.id]
  }),
  folder: one(foldersTable, {
    fields: [notesTable.folder_id],
    references: [foldersTable.id]
  }),
  noteTags: many(noteTagsTable),
  attachments: many(attachmentsTable)
}));

export const tagsRelations = relations(tagsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [tagsTable.user_id],
    references: [usersTable.id]
  }),
  noteTags: many(noteTagsTable)
}));

export const noteTagsRelations = relations(noteTagsTable, ({ one }) => ({
  note: one(notesTable, {
    fields: [noteTagsTable.note_id],
    references: [notesTable.id]
  }),
  tag: one(tagsTable, {
    fields: [noteTagsTable.tag_id],
    references: [tagsTable.id]
  })
}));

export const attachmentsRelations = relations(attachmentsTable, ({ one }) => ({
  note: one(notesTable, {
    fields: [attachmentsTable.note_id],
    references: [notesTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  folders: foldersTable,
  notes: notesTable,
  tags: tagsTable,
  noteTags: noteTagsTable,
  attachments: attachmentsTable
};
