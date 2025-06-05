
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type User } from '../schema';

export const getUserByGoogleId = async (googleId: string): Promise<User | null> => {
  try {
    const result = await db.select()
      .from(usersTable)
      .where(eq(usersTable.google_id, googleId))
      .limit(1)
      .execute();

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Failed to get user by Google ID:', error);
    throw error;
  }
};
