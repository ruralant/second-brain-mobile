import { db } from './client';

export function initializeDatabase() {
  db.execSync(`PRAGMA journal_mode = WAL;`);
  db.execSync(`PRAGMA foreign_keys = ON;`);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      description TEXT,
      lastFetchedAt TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feedId INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      pubDate TEXT,
      isRead INTEGER NOT NULL DEFAULT 0,
      isSaved INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (feedId) REFERENCES feeds(id) ON DELETE CASCADE,
      UNIQUE(feedId, url)
    );
  `);

  // Migration: add isSaved column for reading list (no-op if column already exists)
  try {
    db.execSync(`ALTER TABLE articles ADD COLUMN isSaved INTEGER NOT NULL DEFAULT 0;`);
  } catch {
    // Column already exists
  }

  db.execSync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#6B7280',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      categoryId INTEGER,
      priority INTEGER NOT NULL DEFAULT 2,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      completedAt TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}
