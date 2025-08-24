import { getDatabase } from '../db';

export interface Piece {
  id?: number;
  profileId: number | null;
  title?: string | null;
  featureImageUri?: string | null;
  clayType?: string | null;
  clayGrams?: number | null;
  thrownOn?: string | null;
  trimmedOn?: string | null;
  bisqueFiredOn?: string | null;
  glazedOn?: string | null;
  glazeFiredOn?: string | null;
  glaze?: string | null;
}

function mapRow(row: any): Piece {
  return {
    id: row.id,
    profileId: row.profileId,
    title: row.title,
    featureImageUri: row.featureImageUri,
    clayType: row.clayType,
    clayGrams: row.clayGrams,
    thrownOn: row.thrownOn,
    trimmedOn: row.trimmedOn,
    bisqueFiredOn: row.bisqueFiredOn,
    glazedOn: row.glazedOn,
    glazeFiredOn: row.glazeFiredOn,
    glaze: row.glaze,
  };
}

export const pieceRepository = {
  async listPiecesByProfile(profileId: number | null): Promise<Piece[]> {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      'SELECT * FROM pieces WHERE (? IS NULL OR profileId = ?) ORDER BY updatedAt DESC',
      [profileId, profileId]
    );
    return result.map(mapRow);
  },

  async getPieceById(id: number): Promise<Piece | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync('SELECT * FROM pieces WHERE id = ?', [id]);
    return row ? mapRow(row) : null;
  },

  async createPiece(piece: Piece): Promise<number> {
    const db = await getDatabase();
    const { lastInsertRowId } = await db.runAsync(
      `INSERT INTO pieces (profileId, title, featureImageUri, clayType, clayGrams, thrownOn, trimmedOn, bisqueFiredOn, glazedOn, glazeFiredOn, glaze)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        piece.profileId,
        piece.title ?? null,
        piece.featureImageUri ?? null,
        piece.clayType ?? null,
        piece.clayGrams ?? null,
        piece.thrownOn ?? null,
        piece.trimmedOn ?? null,
        piece.bisqueFiredOn ?? null,
        piece.glazedOn ?? null,
        piece.glazeFiredOn ?? null,
        piece.glaze ?? null,
      ]
    );
    return Number(lastInsertRowId);
  },

  async updatePiece(piece: Piece & { id: number }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE pieces SET title=?, featureImageUri=?, clayType=?, clayGrams=?, thrownOn=?, trimmedOn=?, bisqueFiredOn=?, glazedOn=?, glazeFiredOn=?, glaze=?, updatedAt=datetime('now') WHERE id=?`,
      [
        piece.title ?? null,
        piece.featureImageUri ?? null,
        piece.clayType ?? null,
        piece.clayGrams ?? null,
        piece.thrownOn ?? null,
        piece.trimmedOn ?? null,
        piece.bisqueFiredOn ?? null,
        piece.glazedOn ?? null,
        piece.glazeFiredOn ?? null,
        piece.glaze ?? null,
        piece.id,
      ]
    );
  },
};

