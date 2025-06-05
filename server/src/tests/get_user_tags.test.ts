
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, tagsTable } from '../db/schema';
import { type CreateUserInput, type CreateTagInput } from '../schema';
import { getUserTags } from '../handlers/get_user_tags';

// Test user data
const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google123',
  avatar_url: null
};

const testUser2: CreateUserInput = {
  email: 'test2@example.com',
  name: 'Test User 2',
  google_id: 'google456',
  avatar_url: 'https://example.com/avatar.jpg'
};

describe('getUserTags', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let userId: string;
  let userId2: string;

  beforeEach(async () => {
    // Create test users
    const userResult = await db.insert(usersTable)
      .values({
        id: 'user-1',
        ...testUser
      })
      .returning()
      .execute();

    const userResult2 = await db.insert(usersTable)
      .values({
        id: 'user-2',
        ...testUser2
      })
      .returning()
      .execute();

    userId = userResult[0].id;
    userId2 = userResult2[0].id;
  });

  it('should return all tags for a user', async () => {
    // Create tags for the user
    const tagInputs: CreateTagInput[] = [
      {
        name: 'Important',
        user_id: userId,
        color: '#ff0000'
      },
      {
        name: 'Work',
        user_id: userId,
        color: '#00ff00'
      },
      {
        name: 'Personal',
        user_id: userId,
        color: null
      }
    ];

    await db.insert(tagsTable)
      .values([
        {
          id: 'tag-1',
          ...tagInputs[0]
        },
        {
          id: 'tag-2',
          ...tagInputs[1]
        },
        {
          id: 'tag-3',
          ...tagInputs[2]
        }
      ])
      .execute();

    const result = await getUserTags(userId);

    expect(result).toHaveLength(3);
    
    // Sort by name for predictable testing
    const sortedResult = result.sort((a, b) => a.name.localeCompare(b.name));
    
    expect(sortedResult[0].name).toEqual('Important');
    expect(sortedResult[0].color).toEqual('#ff0000');
    expect(sortedResult[0].user_id).toEqual(userId);
    expect(sortedResult[0].id).toBeDefined();
    expect(sortedResult[0].created_at).toBeInstanceOf(Date);

    expect(sortedResult[1].name).toEqual('Personal');
    expect(sortedResult[1].color).toBeNull();
    expect(sortedResult[1].user_id).toEqual(userId);

    expect(sortedResult[2].name).toEqual('Work');
    expect(sortedResult[2].color).toEqual('#00ff00');
    expect(sortedResult[2].user_id).toEqual(userId);
  });

  it('should return empty array when user has no tags', async () => {
    const result = await getUserTags(userId);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should only return tags for the specified user', async () => {
    // Create tags for both users
    await db.insert(tagsTable)
      .values([
        {
          id: 'tag-1',
          name: 'User 1 Tag',
          user_id: userId,
          color: '#ff0000'
        },
        {
          id: 'tag-2',
          name: 'User 2 Tag',
          user_id: userId2,
          color: '#00ff00'
        },
        {
          id: 'tag-3',
          name: 'Another User 1 Tag',
          user_id: userId,
          color: null
        }
      ])
      .execute();

    const result = await getUserTags(userId);

    expect(result).toHaveLength(2);
    result.forEach(tag => {
      expect(tag.user_id).toEqual(userId);
    });

    const tagNames = result.map(tag => tag.name).sort();
    expect(tagNames).toEqual(['Another User 1 Tag', 'User 1 Tag']);
  });

  it('should return empty array for non-existent user', async () => {
    // Create some tags for existing user
    await db.insert(tagsTable)
      .values({
        id: 'tag-1',
        name: 'Existing Tag',
        user_id: userId,
        color: '#ff0000'
      })
      .execute();

    const result = await getUserTags('non-existent-user-id');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle tags with null color properly', async () => {
    await db.insert(tagsTable)
      .values({
        id: 'tag-1',
        name: 'No Color Tag',
        user_id: userId,
        color: null
      })
      .execute();

    const result = await getUserTags(userId);

    expect(result).toHaveLength(1);
    expect(result[0].color).toBeNull();
    expect(result[0].name).toEqual('No Color Tag');
  });
});
