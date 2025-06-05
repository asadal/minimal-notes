
import { type User } from '../schema';

export declare function getUserByGoogleId(googleId: string): Promise<User | null>;
