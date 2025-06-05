
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, notesTable, tagsTable, noteTagsTable } from '../db/schema';
import { type AddTagToNoteInput } from '../schema';
import { addTagToNote } from '../handlers/add_tag_to_note';
import { eq, and } from 'drizzle-orm';

describe('addTagToNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let userId: string;
  let noteId: string;
  let tagId: string;

  beforeEach(async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google-123'
      })
      .returning()
      .execute();
    userId = userResult[0].id;

    // Create note
    const noteResult = await db.insert(notesTable)
      .values({
        id: 'note-1',
        title: 'Test Note',
        content: 'Test content',
        user_id: userId
      })
      .returning()
      .execute();
    noteId = noteResult[0].id;

    // Create tag
    const tagResult = await db.insert(tagsTable)
      .values({
        id: 'tag-1',
        name: 'Test Tag',
        user_id: userId
      })
      .returning()
      .execute();
    tagId = tagResult[0].id;
  });

  it('should add tag to note successfully', async () => {
    const input: AddTagToNoteInput = {
      note_id: noteId,
      tag_id: tagId
    };

    const result = await addTagToNote(input);

    expect(result.note_id).toEqual(noteId);
    expect(result.tag_id).toEqual(tagId);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save note-tag association to database', async () => {
    const input: AddTagToNoteInput = {
      note_id: noteId,
      tag_id: tagId
    };

    await addTagToNote(input);

    const associations = await db.select()
      .from(noteTagsTable)
      .where(and(
        eq(noteTagsTable.note_id, noteId),
        eq(noteTagsTable.tag_id, tagId)
      ))
      .execute();

    expect(associations).toHaveLength(1);
    expect(associations[0].note_id).toEqual(noteId);
    expect(associations[0].tag_id).toEqual(tagId);
    expect(associations[0].created_at).toBeInstanceOf(Date);
  });

  it('should return existing association if tag already added to note', async () => {
    const input: AddTagToNoteInput = {
      note_id: noteId,
      tag_id: tagId
    };

    // Add tag first time
    const firstResult = await addTagToNote(input);

    // Add same tag again
    const secondResult = await addTagToNote(input);

    expect(secondResult.note_id).toEqual(firstResult.note_id);
    expect(secondResult.tag_id).toEqual(firstResult.tag_id);
    expect(secondResult.created_at).toEqual(firstResult.created_at);

    // Verify only one association exists in database
    const associations = await db.select()
      .from(noteTagsTable)
      .where(and(
        eq(noteTagsTable.note_id, noteId),
        eq(noteTagsTable.tag_id, tagId)
      ))
      .execute();

    expect(associations).toHaveLength(1);
  });

  it('should throw error when note does not exist', async () => {
    const input: AddTagToNoteInput = {
      note_id: 'non-existent-note',
      tag_id: tagId
    };

    expect(addTagToNote(input)).rejects.toThrow(/note not found/i);
  });

  it('should throw error when tag does not exist', async () => {
    const input: AddTagToNoteInput = {
      note_id: noteId,
      tag_id: 'non-existent-tag'
    };

    expect(addTagToNote(input)).rejects.toThrow(/tag not found/i);
  });
});
