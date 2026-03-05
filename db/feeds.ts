import type { Feed } from '@/types';
import { db } from './client';

export function getAllFeeds(): Feed[] {
  return db.getAllSync<Feed>('SELECT * FROM feeds ORDER BY createdAt DESC');
}

export function getFeedById(id: number): Feed | null {
  return db.getFirstSync<Feed>('SELECT * FROM feeds WHERE id = ?', [id]);
}

export function addFeed(url: string, title: string, description: string | null): Feed {
  const result = db.runSync(
    'INSERT INTO feeds (url, title, description) VALUES (?, ?, ?)',
    [url, title, description]
  );
  return db.getFirstSync<Feed>('SELECT * FROM feeds WHERE id = ?', [result.lastInsertRowId])!;
}

export function deleteFeed(id: number): void {
  db.runSync('DELETE FROM feeds WHERE id = ?', [id]);
}

export function updateLastFetched(id: number): void {
  db.runSync("UPDATE feeds SET lastFetchedAt = datetime('now') WHERE id = ?", [id]);
}

export function getFeedArticleCount(feedId: number): number {
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM articles WHERE feedId = ?',
    [feedId]
  );
  return row?.count ?? 0;
}
