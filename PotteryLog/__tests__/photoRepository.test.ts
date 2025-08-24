jest.mock('../src/db', () => {
  const state = { profiles: [], pieces: [], photos: [] } as any;
  let autoIds = { profiles: 1, pieces: 1, photos: 1 } as any;
  const runAsync = async (sql: string, params: any[] = []) => {
    const up = sql.trim().toUpperCase();
    if (up.startsWith('DELETE FROM PROFILES')) { state.profiles = []; return { changes: 0, lastInsertRowId: 0 }; }
    if (up.startsWith('DELETE FROM PIECES')) { state.pieces = []; return { changes: 0, lastInsertRowId: 0 }; }
    if (up.startsWith('DELETE FROM PHOTOS')) { state.photos = []; return { changes: 0, lastInsertRowId: 0 }; }
    if (up.startsWith('INSERT INTO PROFILES')) { const name = params[0]; state.profiles.push({ id: autoIds.profiles++, name }); return { changes: 1, lastInsertRowId: autoIds.profiles - 1 }; }
    if (up.startsWith('INSERT INTO PIECES')) { const [profileId, title] = params; state.pieces.push({ id: autoIds.pieces++, profileId, title }); return { changes: 1, lastInsertRowId: autoIds.pieces - 1 }; }
    if (up.startsWith('INSERT INTO PHOTOS')) { const [pieceId, uri, caption] = params; state.photos.push({ id: autoIds.photos++, pieceId, uri, caption }); return { changes: 1, lastInsertRowId: autoIds.photos - 1 }; }
    if (up.startsWith('DELETE FROM PHOTOS WHERE ID')) { const id = params[0]; state.photos = state.photos.filter(p=>p.id!==id); return { changes: 1, lastInsertRowId: 0 }; }
    return { changes: 0, lastInsertRowId: 0 };
  };
  const getAllAsync = async (sql: string, params: any[] = []) => {
    const up = sql.trim().toUpperCase();
    if (up.startsWith('SELECT * FROM PHOTOS')) { const pid = params[0]; return state.photos.filter(p=>p.pieceId===pid); }
    if (up.startsWith('SELECT * FROM PROFILES')) return state.profiles.slice();
    if (up.startsWith('SELECT * FROM PIECES')) return state.pieces.slice();
    return [];
  };
  const getFirstAsync = async (sql: string, params: any[] = []) => { const rows = await getAllAsync(sql, params); return rows[0] ?? null; };
  return { getDatabase: async () => ({ runAsync, getAllAsync, getFirstAsync, withTransactionAsync: async (fn: any)=>{ await fn(); } }) };
});

import { getDatabase } from '../src/db';
import { photoRepository } from '../src/repos/photoRepository';

describe('photoRepository', () => {
  it('adds and lists photos for piece', async () => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM profiles');
    await db.runAsync('DELETE FROM pieces');
    await db.runAsync('DELETE FROM photos');
    await db.runAsync("INSERT INTO profiles (name) VALUES ('P')");
    const profile = (await db.getFirstAsync('SELECT * FROM profiles')) as any;
    await db.runAsync("INSERT INTO pieces (profileId, title) VALUES (?, 'X')", [profile.id as number]);
    const piece = (await db.getFirstAsync('SELECT * FROM pieces')) as any;
    const pid = await photoRepository.addPhoto({ pieceId: piece.id as number, uri: 'file://1.jpg' });
    expect(pid).toBeGreaterThan(0);
    const list = await photoRepository.listByPiece(piece.id);
    expect(list.length).toBe(1);
    expect(list[0].uri).toContain('file://');
  });
});

