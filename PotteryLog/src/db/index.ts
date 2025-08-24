import * as SQLite from 'expo-sqlite';

export type Database = SQLite.SQLiteDatabase;

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;
  const db = await SQLite.openDatabaseAsync('pottery.db');
  await migrate(db);
  dbInstance = db;
  return db;
}

async function migrate(db: Database): Promise<void> {
  const statements: string[] = [
    "PRAGMA foreign_keys = ON",
    `CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS pieces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profileId INTEGER,
      title TEXT,
      featureImageUri TEXT,
      clayType TEXT,
      clayGrams INTEGER,
      thrownOn TEXT,
      trimmedOn TEXT,
      bisqueFiredOn TEXT,
      glazedOn TEXT,
      glazeFiredOn TEXT,
      glaze TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pieceId INTEGER NOT NULL,
      uri TEXT NOT NULL,
      caption TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (pieceId) REFERENCES pieces(id) ON DELETE CASCADE
    )`,
  ];
  await db.withTransactionAsync(async () => {
    for (const stmt of statements) {
      await db.runAsync(stmt);
    }
  });
}

