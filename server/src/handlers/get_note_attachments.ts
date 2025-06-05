
import { db } from '../db';
import { attachmentsTable } from '../db/schema';
import { type Attachment } from '../schema';
import { eq } from 'drizzle-orm';

export const getNoteAttachments = async (noteId: string): Promise<Attachment[]> => {
  try {
    const results = await db.select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.note_id, noteId))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get note attachments:', error);
    throw error;
  }
};
