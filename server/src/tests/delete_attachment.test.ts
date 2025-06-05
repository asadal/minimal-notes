
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, notesTable, attachmentsTable } from '../db/schema';
import { deleteAttachment } from '../handlers/delete_attachment';
import { eq } from 'drizzle-orm';

describe('deleteAttachment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an attachment', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google-123'
      })
      .returning()
      .execute();

    // Create test note
    const note = await db.insert(notesTable)
      .values({
        id: 'note-1',
        title: 'Test Note',
        content: 'Test content',
        user_id: user[0].id
      })
      .returning()
      .execute();

    // Create test attachment
    const attachment = await db.insert(attachmentsTable)
      .values({
        id: 'attachment-1',
        note_id: note[0].id,
        filename: 'test-file.pdf',
        original_filename: 'Original Test File.pdf',
        file_size: 1024,
        mime_type: 'application/pdf',
        file_path: '/uploads/test-file.pdf'
      })
      .returning()
      .execute();

    // Delete the attachment
    await deleteAttachment(attachment[0].id);

    // Verify attachment was deleted
    const attachments = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.id, attachment[0].id))
      .execute();

    expect(attachments).toHaveLength(0);
  });

  it('should not fail when deleting non-existent attachment', async () => {
    // Should not throw an error even if attachment doesn't exist
    await expect(deleteAttachment('non-existent-id')).resolves.toBeUndefined();

    // Verify no attachments exist
    const attachments = await db.select()
      .from(attachmentsTable)
      .execute();

    expect(attachments).toHaveLength(0);
  });

  it('should only delete the specified attachment', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google-123'
      })
      .returning()
      .execute();

    // Create test note
    const note = await db.insert(notesTable)
      .values({
        id: 'note-1',
        title: 'Test Note',
        content: 'Test content',
        user_id: user[0].id
      })
      .returning()
      .execute();

    // Create multiple test attachments
    const attachment1 = await db.insert(attachmentsTable)
      .values({
        id: 'attachment-1',
        note_id: note[0].id,
        filename: 'test-file-1.pdf',
        original_filename: 'Original Test File 1.pdf',
        file_size: 1024,
        mime_type: 'application/pdf',
        file_path: '/uploads/test-file-1.pdf'
      })
      .returning()
      .execute();

    const attachment2 = await db.insert(attachmentsTable)
      .values({
        id: 'attachment-2',
        note_id: note[0].id,
        filename: 'test-file-2.pdf',
        original_filename: 'Original Test File 2.pdf',
        file_size: 2048,
        mime_type: 'application/pdf',
        file_path: '/uploads/test-file-2.pdf'
      })
      .returning()
      .execute();

    // Delete only the first attachment
    await deleteAttachment(attachment1[0].id);

    // Verify only the first attachment was deleted
    const remainingAttachments = await db.select()
      .from(attachmentsTable)
      .execute();

    expect(remainingAttachments).toHaveLength(1);
    expect(remainingAttachments[0].id).toEqual(attachment2[0].id);
    expect(remainingAttachments[0].filename).toEqual('test-file-2.pdf');
  });
});
