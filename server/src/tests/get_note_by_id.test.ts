
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, notesTable, foldersTable } from '../db/schema';
import { getNoteById } from '../handlers/get_note_by_id';

describe('getNoteById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a note by ID', async () => {
    // Create test user first
    const user = await db.insert(usersTable)
      .values({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google123'
      })
      .returning()
      .execute();

    // Create test note
    const note = await db.insert(notesTable)
      .values({
        id: 'note1',
        title: 'Test Note',
        content: 'This is a test note content',
        user_id: user[0].id,
        folder_id: null
      })
      .returning()
      .execute();

    const result = await getNoteById('note1');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('note1');
    expect(result!.title).toEqual('Test Note');
    expect(result!.content).toEqual('This is a test note content');
    expect(result!.user_id).toEqual(user[0].id);
    expect(result!.folder_id).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return note with folder reference', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        id: '2',
        email: 'test2@example.com',
        name: 'Test User 2',
        google_id: 'google456'
      })
      .returning()
      .execute();

    // Create test folder
    const folder = await db.insert(foldersTable)
      .values({
        id: 'folder1',
        name: 'Test Folder',
        user_id: user[0].id,
        parent_folder_id: null
      })
      .returning()
      .execute();

    // Create test note with folder reference
    const note = await db.insert(notesTable)
      .values({
        id: 'note2',
        title: 'Folder Note',
        content: 'Note in a folder',
        user_id: user[0].id,
        folder_id: folder[0].id
      })
      .returning()
      .execute();

    const result = await getNoteById('note2');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('note2');
    expect(result!.title).toEqual('Folder Note');
    expect(result!.folder_id).toEqual(folder[0].id);
    expect(result!.user_id).toEqual(user[0].id);
  });

  it('should return null for non-existent note', async () => {
    const result = await getNoteById('nonexistent');

    expect(result).toBeNull();
  });

  it('should return null for empty string ID', async () => {
    const result = await getNoteById('');

    expect(result).toBeNull();
  });
});
