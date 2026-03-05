export type Feed = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  lastFetchedAt: string | null;
  createdAt: string;
};

export type Article = {
  id: number;
  feedId: number;
  title: string;
  url: string;
  description: string | null;
  pubDate: string | null;
  isRead: boolean;
  isSaved: boolean;
  createdAt: string;
};

export type Category = {
  id: number;
  name: string;
  color: string;
  createdAt: string;
};

export type Priority = 1 | 2 | 3; // 1 = low, 2 = medium, 3 = high

export type Task = {
  id: number;
  title: string;
  categoryId: number | null;
  priority: Priority;
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type TaskWithCategory = Task & {
  categoryName: string | null;
  categoryColor: string | null;
};
