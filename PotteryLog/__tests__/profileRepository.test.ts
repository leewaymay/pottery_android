jest.mock('../src/db', () => {
  type Row = any;
  const state = { profiles: [] as Row[] };
  let autoId = 1;
  const runAsync = async (sql: string, params: any[] = []) => {
    const up = sql.trim().toUpperCase();
    if (up.startsWith('DELETE FROM PROFILES')) { state.profiles = []; return { changes: 0, lastInsertRowId: 0 }; }
    if (up.startsWith('INSERT INTO PROFILES')) { const name = params[0]; state.profiles.push({ id: autoId++, name }); return { changes: 1, lastInsertRowId: autoId - 1 }; }
    return { changes: 0, lastInsertRowId: 0 };
  };
  const getAllAsync = async (sql: string) => { if (sql.toUpperCase().startsWith('SELECT * FROM PROFILES')) return state.profiles.slice(); return []; };
  const getFirstAsync = async (sql: string) => { const rows = await getAllAsync(sql); return rows[0] ?? null; };
  return { getDatabase: async () => ({ runAsync, getAllAsync, getFirstAsync, withTransactionAsync: async (fn: any)=>{ await fn(); } }) };
});

import { profileRepository } from '../src/repos/profileRepository';
import { getDatabase } from '../src/db';

describe('profileRepository', () => {
  it('creates and lists profiles', async () => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM profiles');
    const id = await profileRepository.createProfile({ name: 'Alice' });
    expect(id).toBeGreaterThan(0);
    const profiles = await profileRepository.listProfiles();
    expect(profiles.find(p => p.id === id)?.name).toBe('Alice');
  });
});

