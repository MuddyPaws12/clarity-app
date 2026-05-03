export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  order: number;
}

export interface List {
  id: string;
  projectId: string;
  name: string;
  order: number;
}

export interface Task {
  id: string;
  listId: string;
  projectId: string;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
  order: number;
}
