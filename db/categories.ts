import type { Category } from '@/types';
import { db } from './client';

export function getAllCategories(): Category[] {
  return db.getAllSync<Category>('SELECT * FROM categories ORDER BY name ASC');
}

export function addCategory(name: string, color: string): Category {
  const result = db.runSync(
    'INSERT INTO categories (name, color) VALUES (?, ?)',
    [name, color]
  );
  return db.getFirstSync<Category>('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowId])!;
}

export function updateCategory(id: number, name: string, color: string): void {
  db.runSync('UPDATE categories SET name = ?, color = ? WHERE id = ?', [name, color, id]);
}

export function deleteCategory(id: number): void {
  db.runSync('DELETE FROM categories WHERE id = ?', [id]);
}
