
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, notesTable, attachmentsTable } from '../db/schema';
import { type CreateAttachmentInput } from '../schema';
import { createAttachment } from '../handlers/create_attachment';
import { eq } from 'drizzle-orm';

describe('createAttachment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testNoteId: string;

  beforeEach(async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values({
        id: crypto.randomUUID(),
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google123'
      })
      .returning()
      .execute();

    // Create test note
    const noteResult = await db.insert(notesTable)
      .values({
        id: crypto.randomUUID(),
        title: 'Test Note',
        content: 'Test content',
        user_id: userResult[0].id
      })
      .returning()
      .execute();

    testNoteId = noteResult[0].id;
  });

  const testInput: CreateAttachmentInput = {
    note_id: '', // Will be set in test
    filename: 'test-file-123.pdf',
    original_filename: 'My Document.pdf',
    file_size: 1024000,
    mime_type: 'application/pdf',
    file_path: '/uploads/2024/01/test-file-123.pdf'
  };

  it('should create an attachment', async () => {
    const input = { ...testInput, note_id: testNoteId };
    const result = await createAttachment(input);

    expect(result.note_id).toEqual(testNoteId);
    expect(result.filename).toEqual('test-file-123.pdf');
    expect(result.original_filename).toEqual('My Document.pdf');
    expect(result.file_size).toEqual(1024000);
    expect(result.mime_type).toEqual('application/pdf');
    expect(result.file_path).toEqual('/uploads/2024/01/test-file-123.pdf');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save attachment to database', async () => {
    const input = { ...testInput, note_id: testNoteId };
    const result = await createAttachment(input);

    const attachments = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.id, result.id))
      .execute();

    expect(attachments).toHaveLength(1);
    expect(attachments[0].note_id).toEqual(testNoteId);
    expect(attachments[0].filename).toEqual('test-file-123.pdf');
    expect(attachments[0].original_filename).toEqual('My Document.pdf');
    expect(attachments[0].file_size).toEqual(1024000);
    expect(attachments[0].mime_type).toEqual('application/pdf');
    expect(attachments[0].file_path).toEqual('/uploads/2024/01/test-file-123.pdf');
    expect(attachments[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different file types', async () => {
    const imageInput: CreateAttachmentInput = {
      note_id: testNoteId,
      filename: 'image-456.jpg',
      original_filename: 'Photo.jpg',
      file_size: 512000,
      mime_type: 'image/jpeg',
      file_path: '/uploads/2024/01/image-456.jpg'
    };

    const result = await createAttachment(imageInput);

    expect(result.filename).toEqual('image-456.jpg');
    expect(result.mime_type).toEqual('image/jpeg');
    expect(result.file_size).toEqual(512000);

    // Verify in database
    const attachments = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.id, result.id))
      .execute();

    expect(attachments).toHaveLength(1);
    expect(attachments[0].mime_type).toEqual('image/jpeg');
  });

  it('should throw error for non-existent note', async () => {
    const input = { ...testInput, note_id: crypto.randomUUID() };

    await expect(createAttachment(input)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
