
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, foldersTable, notesTable } from '../db/schema';
import { type CreateNoteInput } from '../schema';
import { createNote } from '../handlers/create_note';
import { eq } from 'drizzle-orm';

const testUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google-123'
};

const testFolder = {
  id: 'test-folder-1',
  name: 'Test Folder',
  user_id: 'test-user-1'
};

const testNoteInput: CreateNoteInput = {
  title: 'Test Note',
  content: 'This is a test note content',
  user_id: 'test-user-1',
  folder_id: 'test-folder-1'
};

describe('createNote', () => {
  beforeEach(async () => {
    await createDB();
    
    // Create prerequisite user
    await db.insert(usersTable).values(testUser).execute();
    
    // Create prerequisite folder
    await db.insert(foldersTable).values(testFolder).execute();
  });
  
  afterEach(resetDB);

  it('should create a note with folder', async () => {
    const result = await createNote(testNoteInput);

    expect(result.title).toEqual('Test Note');
    expect(result.content).toEqual('This is a test note content');
    expect(result.user_id).toEqual('test-user-1');
    expect(result.folder_id).toEqual('test-folder-1');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a note without folder', async () => {
    const inputWithoutFolder: CreateNoteInput = {
      title: 'Note without folder',
      content: 'Content without folder',
      user_id: 'test-user-1'
    };

    const result = await createNote(inputWithoutFolder);

    expect(result.title).toEqual('Note without folder');
    expect(result.content).toEqual('Content without folder');
    expect(result.user_id).toEqual('test-user-1');
    expect(result.folder_id).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save note to database', async () => {
    const result = await createNote(testNoteInput);

    const notes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, result.id))
      .execute();

    expect(notes).toHaveLength(1);
    expect(notes[0].title).toEqual('Test Note');
    expect(notes[0].content).toEqual('This is a test note content');
    expect(notes[0].user_id).toEqual('test-user-1');
    expect(notes[0].folder_id).toEqual('test-folder-1');
    expect(notes[0].created_at).toBeInstanceOf(Date);
    expect(notes[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when user does not exist', async () => {
    const invalidInput: CreateNoteInput = {
      title: 'Test Note',
      content: 'Test content',
      user_id: 'non-existent-user'
    };

    await expect(createNote(invalidInput)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('should throw error when folder does not exist', async () => {
    const invalidInput: CreateNoteInput = {
      title: 'Test Note',
      content: 'Test content',
      user_id: 'test-user-1',
      folder_id: 'non-existent-folder'
    };

    await expect(createNote(invalidInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
