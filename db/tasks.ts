import type { Task, TaskWithCategory } from '@/types';
import { db } from './client';

export function getAllTasks(): TaskWithCategory[] {
  return db.getAllSync<TaskWithCategory>(
    `SELECT t.id, t.title, t.categoryId, t.priority,
            CAST(t.isCompleted AS BOOLEAN) as isCompleted,
            t.createdAt, t.completedAt,
            c.name as categoryName, c.color as categoryColor
     FROM tasks t
     LEFT JOIN categories c ON t.categoryId = c.id
     ORDER BY t.isCompleted ASC, t.priority DESC, t.createdAt DESC`
  );
}

export function addTask(title: string, categoryId: number | null, priority: number): Task {
  const result = db.runSync(
    'INSERT INTO tasks (title, categoryId, priority) VALUES (?, ?, ?)',
    [title, categoryId, priority]
  );
  return db.getFirstSync<Task>('SELECT * FROM tasks WHERE id = ?', [result.lastInsertRowId])!;
}

export function toggleTask(id: number): void {
  db.runSync(
    `UPDATE tasks SET
       isCompleted = CASE WHEN isCompleted = 0 THEN 1 ELSE 0 END,
       completedAt = CASE WHEN isCompleted = 0 THEN datetime('now') ELSE NULL END
     WHERE id = ?`,
    [id]
  );
}

export function deleteTask(id: number): void {
  db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
}
