
import { type GetUserNotesInput, type Note } from '../schema';

export declare function getUserNotes(input: GetUserNotesInput): Promise<Note[]>;
