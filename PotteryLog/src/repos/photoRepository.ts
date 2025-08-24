import { getDatabase } from '../db';

export interface Photo { id?: number; pieceId: number; uri: string; caption?: string | null }

export const photoRepository = {
  async listByPiece(pieceId: number): Promise<Photo[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM photos WHERE pieceId = ? ORDER BY createdAt DESC', [pieceId]);
    return rows.map((r: any) => ({ id: r.id, pieceId: r.pieceId, uri: r.uri, caption: r.caption ?? null }));
  },
  async addPhoto(photo: Photo): Promise<number> {
    const db = await getDatabase();
    const { lastInsertRowId } = await db.runAsync('INSERT INTO photos (pieceId, uri, caption) VALUES (?, ?, ?)', [photo.pieceId, photo.uri, photo.caption ?? null]);
    return Number(lastInsertRowId);
  },
  async removePhoto(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM photos WHERE id = ?', [id]);
  },
};

