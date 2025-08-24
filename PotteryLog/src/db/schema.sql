PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pieces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profileId INTEGER NOT NULL,
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
  FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pieceId INTEGER NOT NULL,
  uri TEXT NOT NULL,
  caption TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (pieceId) REFERENCES pieces(id) ON DELETE CASCADE
);

