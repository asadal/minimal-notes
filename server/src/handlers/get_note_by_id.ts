
import { type Note } from '../schema';

export declare function getNoteById(noteId: string): Promise<Note | null>;
