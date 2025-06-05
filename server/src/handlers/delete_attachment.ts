
import { db } from '../db';
import { attachmentsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  try {
    await db.delete(attachmentsTable)
      .where(eq(attachmentsTable.id, attachmentId))
      .execute();
  } catch (error) {
    console.error('Attachment deletion failed:', error);
    throw error;
  }
};
