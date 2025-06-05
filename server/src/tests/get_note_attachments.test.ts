
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, notesTable, attachmentsTable } from '../db/schema';
import { getNoteAttachments } from '../handlers/get_note_attachments';

describe('getNoteAttachments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return attachments for a note', async () => {
    // Create test user
    await db.insert(usersTable).values({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google-123'
    });

    // Create test note
    await db.insert(notesTable).values({
      id: 'note-1',
      title: 'Test Note',
      content: 'Test content',
      user_id: 'user-1'
    });

    // Create test attachments
    await db.insert(attachmentsTable).values([
      {
        id: 'attachment-1',
        note_id: 'note-1',
        filename: 'test1.jpg',
        original_filename: 'original1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        file_path: '/uploads/test1.jpg'
      },
      {
        id: 'attachment-2',
        note_id: 'note-1',
        filename: 'test2.pdf',
        original_filename: 'original2.pdf',
        file_size: 2048,
        mime_type: 'application/pdf',
        file_path: '/uploads/test2.pdf'
      }
    ]);

    const result = await getNoteAttachments('note-1');

    expect(result).toHaveLength(2);
    
    // Sort by id for consistent testing
    result.sort((a, b) => a.id.localeCompare(b.id));

    expect(result[0].id).toBe('attachment-1');
    expect(result[0].note_id).toBe('note-1');
    expect(result[0].filename).toBe('test1.jpg');
    expect(result[0].original_filename).toBe('original1.jpg');
    expect(result[0].file_size).toBe(1024);
    expect(result[0].mime_type).toBe('image/jpeg');
    expect(result[0].file_path).toBe('/uploads/test1.jpg');
    expect(result[0].created_at).toBeInstanceOf(Date);

    expect(result[1].id).toBe('attachment-2');
    expect(result[1].note_id).toBe('note-1');
    expect(result[1].filename).toBe('test2.pdf');
    expect(result[1].original_filename).toBe('original2.pdf');
    expect(result[1].file_size).toBe(2048);
    expect(result[1].mime_type).toBe('application/pdf');
    expect(result[1].file_path).toBe('/uploads/test2.pdf');
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should return empty array when note has no attachments', async () => {
    // Create test user
    await db.insert(usersTable).values({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google-123'
    });

    // Create test note without attachments
    await db.insert(notesTable).values({
      id: 'note-1',
      title: 'Test Note',
      content: 'Test content',
      user_id: 'user-1'
    });

    const result = await getNoteAttachments('note-1');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for non-existent note', async () => {
    const result = await getNoteAttachments('non-existent-note');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should only return attachments for the specified note', async () => {
    // Create test user
    await db.insert(usersTable).values({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google-123'
    });

    // Create test notes
    await db.insert(notesTable).values([
      {
        id: 'note-1',
        title: 'Test Note 1',
        content: 'Test content 1',
        user_id: 'user-1'
      },
      {
        id: 'note-2',
        title: 'Test Note 2',
        content: 'Test content 2',
        user_id: 'user-1'
      }
    ]);

    // Create attachments for both notes
    await db.insert(attachmentsTable).values([
      {
        id: 'attachment-1',
        note_id: 'note-1',
        filename: 'test1.jpg',
        original_filename: 'original1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        file_path: '/uploads/test1.jpg'
      },
      {
        id: 'attachment-2',
        note_id: 'note-2',
        filename: 'test2.pdf',
        original_filename: 'original2.pdf',
        file_size: 2048,
        mime_type: 'application/pdf',
        file_path: '/uploads/test2.pdf'
      }
    ]);

    const result = await getNoteAttachments('note-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('attachment-1');
    expect(result[0].note_id).toBe('note-1');
    expect(result[0].filename).toBe('test1.jpg');
  });
});
