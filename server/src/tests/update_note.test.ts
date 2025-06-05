
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, foldersTable, notesTable } from '../db/schema';
import { type UpdateNoteInput, type CreateUserInput, type CreateFolderInput, type CreateNoteInput } from '../schema';
import { updateNote } from '../handlers/update_note';
import { eq } from 'drizzle-orm';

// Test data setup
const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google123'
};

const testFolder: CreateFolderInput = {
  name: 'Test Folder',
  user_id: 'user1'
};

const testNote: CreateNoteInput = {
  title: 'Original Title',
  content: 'Original content',
  user_id: 'user1'
};

describe('updateNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update note title', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user1',
      ...testUser
    }).execute();

    const noteResult = await db.insert(notesTable).values({
      id: 'note1',
      ...testNote
    }).returning().execute();

    const updateInput: UpdateNoteInput = {
      id: 'note1',
      title: 'Updated Title'
    };

    const result = await updateNote(updateInput);

    expect(result.title).toEqual('Updated Title');
    expect(result.content).toEqual('Original content'); // Should remain unchanged
    expect(result.id).toEqual('note1');
    expect(result.user_id).toEqual('user1');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > noteResult[0].updated_at).toBe(true);
  });

  it('should update note content', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user1',
      ...testUser
    }).execute();

    await db.insert(notesTable).values({
      id: 'note1',
      ...testNote
    }).execute();

    const updateInput: UpdateNoteInput = {
      id: 'note1',
      content: 'Updated content with more details'
    };

    const result = await updateNote(updateInput);

    expect(result.content).toEqual('Updated content with more details');
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
    expect(result.id).toEqual('note1');
  });

  it('should update folder_id', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user1',
      ...testUser
    }).execute();

    await db.insert(foldersTable).values({
      id: 'folder1',
      ...testFolder
    }).execute();

    await db.insert(notesTable).values({
      id: 'note1',
      ...testNote
    }).execute();

    const updateInput: UpdateNoteInput = {
      id: 'note1',
      folder_id: 'folder1'
    };

    const result = await updateNote(updateInput);

    expect(result.folder_id).toEqual('folder1');
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
    expect(result.content).toEqual('Original content'); // Should remain unchanged
  });

  it('should set folder_id to null', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user1',
      ...testUser
    }).execute();

    await db.insert(foldersTable).values({
      id: 'folder1',
      ...testFolder
    }).execute();

    await db.insert(notesTable).values({
      id: 'note1',
      ...testNote,
      folder_id: 'folder1'
    }).execute();

    const updateInput: UpdateNoteInput = {
      id: 'note1',
      folder_id: null
    };

    const result = await updateNote(updateInput);

    expect(result.folder_id).toBeNull();
  });

  it('should update multiple fields at once', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user1',
      ...testUser
    }).execute();

    await db.insert(foldersTable).values({
      id: 'folder1',
      ...testFolder
    }).execute();

    await db.insert(notesTable).values({
      id: 'note1',
      ...testNote
    }).execute();

    const updateInput: UpdateNoteInput = {
      id: 'note1',
      title: 'New Title',
      content: 'New content',
      folder_id: 'folder1'
    };

    const result = await updateNote(updateInput);

    expect(result.title).toEqual('New Title');
    expect(result.content).toEqual('New content');
    expect(result.folder_id).toEqual('folder1');
    expect(result.id).toEqual('note1');
  });

  it('should save changes to database', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user1',
      ...testUser
    }).execute();

    await db.insert(notesTable).values({
      id: 'note1',
      ...testNote
    }).execute();

    const updateInput: UpdateNoteInput = {
      id: 'note1',
      title: 'Database Test Title'
    };

    await updateNote(updateInput);

    // Verify changes were saved to database
    const notes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, 'note1'))
      .execute();

    expect(notes).toHaveLength(1);
    expect(notes[0].title).toEqual('Database Test Title');
    expect(notes[0].content).toEqual('Original content');
  });

  it('should throw error for non-existent note', async () => {
    const updateInput: UpdateNoteInput = {
      id: 'nonexistent',
      title: 'Updated Title'
    };

    expect(updateNote(updateInput)).rejects.toThrow(/not found/i);
  });
});
