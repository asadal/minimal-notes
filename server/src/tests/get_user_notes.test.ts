
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, foldersTable, notesTable, tagsTable, noteTagsTable } from '../db/schema';
import { type GetUserNotesInput } from '../schema';
import { getUserNotes } from '../handlers/get_user_notes';

// Test data
const testUser = {
  id: 'user1',
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google123'
};

const testFolder = {
  id: 'folder1',
  name: 'Test Folder',
  user_id: 'user1'
};

const testTag = {
  id: 'tag1',
  name: 'Important',
  user_id: 'user1',
  color: '#ff0000'
};

const testNote1 = {
  id: 'note1',
  title: 'Note 1',
  content: 'Content 1',
  user_id: 'user1',
  folder_id: 'folder1'
};

const testNote2 = {
  id: 'note2',
  title: 'Note 2',
  content: 'Content 2',
  user_id: 'user1',
  folder_id: null
};

const testNote3 = {
  id: 'note3',
  title: 'Note 3',
  content: 'Content 3',
  user_id: 'user1',
  folder_id: 'folder1'
};

describe('getUserNotes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get all notes for a user', async () => {
    // Create test data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(foldersTable).values(testFolder).execute();
    await db.insert(notesTable).values([testNote1, testNote2, testNote3]).execute();

    const input: GetUserNotesInput = {
      user_id: 'user1'
    };

    const result = await getUserNotes(input);

    expect(result).toHaveLength(3);
    expect(result.map(n => n.id).sort()).toEqual(['note1', 'note2', 'note3']);
    expect(result[0].title).toBeDefined();
    expect(result[0].content).toBeDefined();
    expect(result[0].user_id).toEqual('user1');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should filter notes by folder_id', async () => {
    // Create test data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(foldersTable).values(testFolder).execute();
    await db.insert(notesTable).values([testNote1, testNote2, testNote3]).execute();

    const input: GetUserNotesInput = {
      user_id: 'user1',
      folder_id: 'folder1'
    };

    const result = await getUserNotes(input);

    expect(result).toHaveLength(2);
    expect(result.map(n => n.id).sort()).toEqual(['note1', 'note3']);
    result.forEach(note => {
      expect(note.folder_id).toEqual('folder1');
    });
  });

  it('should filter notes by null folder_id', async () => {
    // Create test data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(foldersTable).values(testFolder).execute();
    await db.insert(notesTable).values([testNote1, testNote2, testNote3]).execute();

    const input: GetUserNotesInput = {
      user_id: 'user1',
      folder_id: null
    };

    const result = await getUserNotes(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual('note2');
    expect(result[0].folder_id).toBeNull();
  });

  it('should filter notes by tag_id', async () => {
    // Create test data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(foldersTable).values(testFolder).execute();
    await db.insert(notesTable).values([testNote1, testNote2, testNote3]).execute();
    await db.insert(tagsTable).values(testTag).execute();
    
    // Add tag to note1 and note3
    await db.insert(noteTagsTable).values([
      { note_id: 'note1', tag_id: 'tag1' },
      { note_id: 'note3', tag_id: 'tag1' }
    ]).execute();

    const input: GetUserNotesInput = {
      user_id: 'user1',
      tag_id: 'tag1'
    };

    const result = await getUserNotes(input);

    expect(result).toHaveLength(2);
    expect(result.map(n => n.id).sort()).toEqual(['note1', 'note3']);
  });

  it('should combine folder and tag filters', async () => {
    // Create test data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(foldersTable).values(testFolder).execute();
    await db.insert(notesTable).values([testNote1, testNote2, testNote3]).execute();
    await db.insert(tagsTable).values(testTag).execute();
    
    // Add tag only to note1 (which is in folder1)
    await db.insert(noteTagsTable).values([
      { note_id: 'note1', tag_id: 'tag1' }
    ]).execute();

    const input: GetUserNotesInput = {
      user_id: 'user1',
      folder_id: 'folder1',
      tag_id: 'tag1'
    };

    const result = await getUserNotes(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual('note1');
    expect(result[0].folder_id).toEqual('folder1');
  });

  it('should return empty array when no notes match filters', async () => {
    // Create test data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(foldersTable).values(testFolder).execute();
    await db.insert(notesTable).values([testNote1, testNote2, testNote3]).execute();

    const input: GetUserNotesInput = {
      user_id: 'user1',
      folder_id: 'nonexistent-folder'
    };

    const result = await getUserNotes(input);

    expect(result).toHaveLength(0);
  });

  it('should return empty array for non-existent user', async () => {
    // Create test data
    await db.insert(usersTable).values(testUser).execute();
    await db.insert(foldersTable).values(testFolder).execute();
    await db.insert(notesTable).values([testNote1, testNote2, testNote3]).execute();

    const input: GetUserNotesInput = {
      user_id: 'nonexistent-user'
    };

    const result = await getUserNotes(input);

    expect(result).toHaveLength(0);
  });
});
