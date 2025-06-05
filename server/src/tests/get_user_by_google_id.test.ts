
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { getUserByGoogleId } from '../handlers/get_user_by_google_id';

// Test user data
const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google123456789',
  avatar_url: 'https://example.com/avatar.jpg'
};

describe('getUserByGoogleId', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user when found by Google ID', async () => {
    // Create test user
    await db.insert(usersTable)
      .values({
        id: 'user-1',
        email: testUser.email,
        name: testUser.name,
        google_id: testUser.google_id,
        avatar_url: testUser.avatar_url
      })
      .execute();

    const result = await getUserByGoogleId('google123456789');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('user-1');
    expect(result!.email).toBe('test@example.com');
    expect(result!.name).toBe('Test User');
    expect(result!.google_id).toBe('google123456789');
    expect(result!.avatar_url).toBe('https://example.com/avatar.jpg');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when user not found', async () => {
    const result = await getUserByGoogleId('nonexistent-google-id');

    expect(result).toBeNull();
  });

  it('should return null when Google ID is empty', async () => {
    const result = await getUserByGoogleId('');

    expect(result).toBeNull();
  });

  it('should find correct user when multiple users exist', async () => {
    // Create multiple test users
    await db.insert(usersTable)
      .values([
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
          google_id: 'google111',
          avatar_url: null
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User Two',
          google_id: 'google222',
          avatar_url: 'https://example.com/avatar2.jpg'
        }
      ])
      .execute();

    const result = await getUserByGoogleId('google222');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('user-2');
    expect(result!.email).toBe('user2@example.com');
    expect(result!.name).toBe('User Two');
    expect(result!.google_id).toBe('google222');
    expect(result!.avatar_url).toBe('https://example.com/avatar2.jpg');
  });
});
