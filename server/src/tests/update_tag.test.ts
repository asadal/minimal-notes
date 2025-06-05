
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, tagsTable } from '../db/schema';
import { type CreateUserInput, type CreateTagInput, type UpdateTagInput } from '../schema';
import { updateTag } from '../handlers/update_tag';
import { eq } from 'drizzle-orm';

// Test data
const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google123'
};

const testTag: CreateTagInput = {
  name: 'Important',
  user_id: 'user-1',
  color: '#ff0000'
};

describe('updateTag', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update tag name', async () => {
    // Create prerequisite user
    await db.insert(usersTable)
      .values({
        id: 'user-1',
        ...testUser
      })
      .execute();

    // Create tag
    await db.insert(tagsTable)
      .values({
        id: 'tag-1',
        ...testTag
      })
      .execute();

    const updateInput: UpdateTagInput = {
      id: 'tag-1',
      name: 'Urgent'
    };

    const result = await updateTag(updateInput);

    expect(result.id).toEqual('tag-1');
    expect(result.name).toEqual('Urgent');
    expect(result.color).toEqual('#ff0000'); // Should remain unchanged
    expect(result.user_id).toEqual('user-1');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update tag color', async () => {
    // Create prerequisite user
    await db.insert(usersTable)
      .values({
        id: 'user-1',
        ...testUser
      })
      .execute();

    // Create tag
    await db.insert(tagsTable)
      .values({
        id: 'tag-1',
        ...testTag
      })
      .execute();

    const updateInput: UpdateTagInput = {
      id: 'tag-1',
      color: '#00ff00'
    };

    const result = await updateTag(updateInput);

    expect(result.id).toEqual('tag-1');
    expect(result.name).toEqual('Important'); // Should remain unchanged
    expect(result.color).toEqual('#00ff00');
    expect(result.user_id).toEqual('user-1');
  });

  it('should update multiple fields', async () => {
    // Create prerequisite user
    await db.insert(usersTable)
      .values({
        id: 'user-1',
        ...testUser
      })
      .execute();

    // Create tag
    await db.insert(tagsTable)
      .values({
        id: 'tag-1',
        ...testTag
      })
      .execute();

    const updateInput: UpdateTagInput = {
      id: 'tag-1',
      name: 'Critical',
      color: '#0000ff'
    };

    const result = await updateTag(updateInput);

    expect(result.id).toEqual('tag-1');
    expect(result.name).toEqual('Critical');
    expect(result.color).toEqual('#0000ff');
    expect(result.user_id).toEqual('user-1');
  });

  it('should set color to null', async () => {
    // Create prerequisite user
    await db.insert(usersTable)
      .values({
        id: 'user-1',
        ...testUser
      })
      .execute();

    // Create tag
    await db.insert(tagsTable)
      .values({
        id: 'tag-1',
        ...testTag
      })
      .execute();

    const updateInput: UpdateTagInput = {
      id: 'tag-1',
      color: null
    };

    const result = await updateTag(updateInput);

    expect(result.id).toEqual('tag-1');
    expect(result.name).toEqual('Important'); // Should remain unchanged
    expect(result.color).toBeNull();
    expect(result.user_id).toEqual('user-1');
  });

  it('should save changes to database', async () => {
    // Create prerequisite user
    await db.insert(usersTable)
      .values({
        id: 'user-1',
        ...testUser
      })
      .execute();

    // Create tag
    await db.insert(tagsTable)
      .values({
        id: 'tag-1',
        ...testTag
      })
      .execute();

    const updateInput: UpdateTagInput = {
      id: 'tag-1',
      name: 'Updated Tag',
      color: '#purple'
    };

    await updateTag(updateInput);

    // Verify changes in database
    const tags = await db.select()
      .from(tagsTable)
      .where(eq(tagsTable.id, 'tag-1'))
      .execute();

    expect(tags).toHaveLength(1);
    expect(tags[0].name).toEqual('Updated Tag');
    expect(tags[0].color).toEqual('#purple');
    expect(tags[0].user_id).toEqual('user-1');
  });

  it('should throw error for non-existent tag', async () => {
    const updateInput: UpdateTagInput = {
      id: 'non-existent',
      name: 'Updated Name'
    };

    expect(updateTag(updateInput)).rejects.toThrow(/not found/i);
  });
});
