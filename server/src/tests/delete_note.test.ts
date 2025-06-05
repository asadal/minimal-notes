
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, notesTable, tagsTable, noteTagsTable, attachmentsTable } from '../db/schema';
import { deleteNote } from '../handlers/delete_note';
import { eq } from 'drizzle-orm';

describe('deleteNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a note', async () => {
    // Create test user
    const userId = 'user_123';
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google_123'
    });

    // Create test note
    const noteId = 'note_123';
    await db.insert(notesTable).values({
      id: noteId,
      title: 'Test Note',
      content: 'Test content',
      user_id: userId
    });

    // Verify note exists
    const notesBefore = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, noteId))
      .execute();
    expect(notesBefore).toHaveLength(1);

    // Delete the note
    await deleteNote(noteId);

    // Verify note is deleted
    const notesAfter = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, noteId))
      .execute();
    expect(notesAfter).toHaveLength(0);
  });

  it('should cascade delete related note tags', async () => {
    // Create test user
    const userId = 'user_123';
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google_123'
    });

    // Create test note
    const noteId = 'note_123';
    await db.insert(notesTable).values({
      id: noteId,
      title: 'Test Note',
      content: 'Test content',
      user_id: userId
    });

    // Create test tag
    const tagId = 'tag_123';
    await db.insert(tagsTable).values({
      id: tagId,
      name: 'Test Tag',
      user_id: userId
    });

    // Create note-tag relationship
    await db.insert(noteTagsTable).values({
      note_id: noteId,
      tag_id: tagId
    });

    // Verify note-tag relationship exists
    const noteTagsBefore = await db.select()
      .from(noteTagsTable)
      .where(eq(noteTagsTable.note_id, noteId))
      .execute();
    expect(noteTagsBefore).toHaveLength(1);

    // Delete the note
    await deleteNote(noteId);

    // Verify note-tag relationship is cascaded deleted
    const noteTagsAfter = await db.select()
      .from(noteTagsTable)
      .where(eq(noteTagsTable.note_id, noteId))
      .execute();
    expect(noteTagsAfter).toHaveLength(0);

    // Verify tag still exists (should not be deleted)
    const tags = await db.select()
      .from(tagsTable)
      .where(eq(tagsTable.id, tagId))
      .execute();
    expect(tags).toHaveLength(1);
  });

  it('should cascade delete related attachments', async () => {
    // Create test user
    const userId = 'user_123';
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google_123'
    });

    // Create test note
    const noteId = 'note_123';
    await db.insert(notesTable).values({
      id: noteId,
      title: 'Test Note',
      content: 'Test content',
      user_id: userId
    });

    // Create test attachment
    const attachmentId = 'attachment_123';
    await db.insert(attachmentsTable).values({
      id: attachmentId,
      note_id: noteId,
      filename: 'test.pdf',
      original_filename: 'test.pdf',
      file_size: 1024,
      mime_type: 'application/pdf',
      file_path: '/uploads/test.pdf'
    });

    // Verify attachment exists
    const attachmentsBefore = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.note_id, noteId))
      .execute();
    expect(attachmentsBefore).toHaveLength(1);

    // Delete the note
    await deleteNote(noteId);

    // Verify attachment is cascaded deleted
    const attachmentsAfter = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.note_id, noteId))
      .execute();
    expect(attachmentsAfter).toHaveLength(0);
  });

  it('should handle deletion of non-existent note gracefully', async () => {
    // Try to delete a note that doesn't exist - should not throw
    await deleteNote('non_existent_note');
    
    // Verify operation completes without error
    expect(true).toBe(true);
  });
});
