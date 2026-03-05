import type { Article } from '@/types';
import { db } from './client';

export function getArticlesByFeed(feedId: number): Article[] {
  return db.getAllSync<Article>(
    `SELECT id, feedId, title, url, description, pubDate,
            CAST(isRead AS BOOLEAN) as isRead,
            CAST(isSaved AS BOOLEAN) as isSaved,
            createdAt
     FROM articles
     WHERE feedId = ?
     ORDER BY pubDate DESC, createdAt DESC`,
    [feedId]
  );
}

export function upsertArticles(
  feedId: number,
  articles: { title: string; url: string; description: string | null; pubDate: string | null }[]
): void {
  const stmt = db.prepareSync(
    `INSERT INTO articles (feedId, title, url, description, pubDate)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(feedId, url) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       pubDate = excluded.pubDate`
  );

  try {
    for (const article of articles) {
      stmt.executeSync([feedId, article.title, article.url, article.description, article.pubDate]);
    }
  } finally {
    stmt.finalizeSync();
  }
}

export function markAsRead(id: number): void {
  db.runSync('UPDATE articles SET isRead = 1 WHERE id = ?', [id]);
}

export function deleteArticlesByFeed(feedId: number): void {
  db.runSync('DELETE FROM articles WHERE feedId = ?', [feedId]);
}

export function toggleSaveArticle(id: number): void {
  db.runSync(
    'UPDATE articles SET isSaved = CASE WHEN isSaved = 1 THEN 0 ELSE 1 END WHERE id = ?',
    [id]
  );
}

export function getSavedArticles(): (Article & { feedTitle: string })[] {
  return db.getAllSync<Article & { feedTitle: string }>(
    `SELECT a.id, a.feedId, a.title, a.url, a.description, a.pubDate,
            CAST(a.isRead AS BOOLEAN) as isRead,
            CAST(a.isSaved AS BOOLEAN) as isSaved,
            a.createdAt, f.title as feedTitle
     FROM articles a
     JOIN feeds f ON a.feedId = f.id
     WHERE a.isSaved = 1
     ORDER BY a.createdAt DESC`
  );
}
