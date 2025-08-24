jest.mock('../src/db', () => {
  const state = { profiles: [], pieces: [], photos: [] } as any;
  let autoIds = { profiles: 1, pieces: 1, photos: 1 } as any;
  const runAsync = async (sql: string, params: any[] = []) => {
    sql = sql.trim().toUpperCase();
    if (sql.startsWith('DELETE FROM PROFILES')) { state.profiles = []; return { changes: 0, lastInsertRowId: 0 }; }
    if (sql.startsWith('DELETE FROM PIECES')) { state.pieces = []; return { changes: 0, lastInsertRowId: 0 }; }
    if (sql.startsWith("INSERT INTO PROFILES")) { const name = params[0]; state.profiles.push({ id: autoIds.profiles++, name }); return { changes: 1, lastInsertRowId: autoIds.profiles - 1 }; }
    if (sql.startsWith("INSERT INTO PIECES")) {
      const [profileId, title] = params; state.pieces.push({ id: autoIds.pieces++, profileId, title }); return { changes: 1, lastInsertRowId: autoIds.pieces - 1 };
    }
    if (sql.startsWith('UPDATE PIECES')) { const id = params[10]; const row = state.pieces.find(r=>r.id===id); if (row) Object.assign(row, { title: params[0] }); return { changes: row?1:0, lastInsertRowId: 0 }; }
    return { changes: 0, lastInsertRowId: 0 };
  };
  const getAllAsync = async (sql: string, params: any[] = []) => {
    const up = sql.trim().toUpperCase();
    if (up.startsWith('SELECT * FROM PIECES')) {
      if (up.includes('WHERE')) { const pid = params[0]; return state.pieces.filter(p=>pid==null||p.profileId===pid); }
      return state.pieces.slice();
    }
    if (up.startsWith('SELECT * FROM PROFILES')) return state.profiles.slice();
    return [];
  };
  const getFirstAsync = async (sql: string, params: any[] = []) => { const rows = await getAllAsync(sql, params); return rows[0] ?? null; };
  return { getDatabase: async () => ({ runAsync, getAllAsync, getFirstAsync, withTransactionAsync: async (fn: any)=>{ await fn(); } }) };
});

import { pieceRepository } from '../src/repos/pieceRepository';
import { getDatabase } from '../src/db';

describe('pieceRepository', () => {
  it('creates and lists pieces', async () => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM profiles');
    await db.runAsync('DELETE FROM pieces');
    await db.runAsync("INSERT INTO profiles (name) VALUES ('Test')");
    const profile = (await db.getFirstAsync('SELECT * FROM profiles')) as any;
    const id = await pieceRepository.createPiece({ profileId: profile.id as number, title: 'Cup' });
    expect(id).toBeGreaterThan(0);
    const list = await pieceRepository.listPiecesByProfile(profile.id);
    expect(list.length).toBe(1);
    expect(list[0].title).toBe('Cup');
  });
});

