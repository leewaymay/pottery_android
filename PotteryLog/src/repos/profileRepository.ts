import { getDatabase } from '../db';

export interface Profile { id?: number; name: string }

export const profileRepository = {
  async listProfiles(): Promise<Profile[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM profiles ORDER BY createdAt DESC');
    return rows.map((r: any) => ({ id: r.id, name: r.name }));
  },
  async createProfile(profile: { name: string }): Promise<number> {
    const db = await getDatabase();
    const { lastInsertRowId } = await db.runAsync('INSERT INTO profiles (name) VALUES (?)', [profile.name]);
    return Number(lastInsertRowId);
  },
};

