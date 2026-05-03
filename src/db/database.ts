import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Project, List, Task } from '../types/models';

const db = SQLite.openDatabaseSync('clarity.db');

export async function initializeDatabase() {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#E5E7EB',
        createdAt INTEGER NOT NULL,
        "order" INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lists (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        name TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        FOREIGN KEY (projectId) REFERENCES projects(id)
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        listId TEXT NOT NULL,
        projectId TEXT NOT NULL,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        createdAt INTEGER NOT NULL,
        completedAt INTEGER,
        "order" INTEGER NOT NULL,
        FOREIGN KEY (listId) REFERENCES lists(id),
        FOREIGN KEY (projectId) REFERENCES projects(id)
      );
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// PROJECTS
export async function createProject(name: string, color: string = '#E5E7EB'): Promise<Project> {
  const id = uuidv4();
  const createdAt = Date.now();
  const order = await getMaxProjectOrder() + 1;
  const project: Project = { id, name, color, createdAt, order };
  await db.runAsync(
    'INSERT INTO projects (id, name, color, createdAt, "order") VALUES (?, ?, ?, ?, ?)',
    [id, name, color, createdAt, order]
  );
  return project;
}

export async function getProjects(): Promise<Project[]> {
  const result = await db.getAllAsync('SELECT * FROM projects ORDER BY "order" ASC');
  return result as Project[];
}

export async function deleteProject(id: string): Promise<void> {
  await db.runAsync('DELETE FROM tasks WHERE projectId = ?', [id]);
  await db.runAsync('DELETE FROM lists WHERE projectId = ?', [id]);
  await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
}

async function getMaxProjectOrder(): Promise<number> {
  const result = await db.getFirstAsync('SELECT MAX("order") as maxOrder FROM projects');
  return ((result as any)?.maxOrder || 0);
}

// LISTS
export async function createList(projectId: string, name: string): Promise<List> {
  const id = uuidv4();
  const order = await getMaxListOrder(projectId) + 1;
  const list: List = { id, projectId, name, order };
  await db.runAsync(
    'INSERT INTO lists (id, projectId, name, "order") VALUES (?, ?, ?, ?)',
    [id, projectId, name, order]
  );
  return list;
}

export async function getListsByProject(projectId: string): Promise<List[]> {
  const result = await db.getAllAsync(
    'SELECT * FROM lists WHERE projectId = ? ORDER BY "order" ASC',
    [projectId]
  );
  return result as List[];
}

export async function deleteList(id: string): Promise<void> {
  await db.runAsync('DELETE FROM tasks WHERE listId = ?', [id]);
  await db.runAsync('DELETE FROM lists WHERE id = ?', [id]);
}

async function getMaxListOrder(projectId: string): Promise<number> {
  const result = await db.getFirstAsync(
    'SELECT MAX("order") as maxOrder FROM lists WHERE projectId = ?',
    [projectId]
  );
  return ((result as any)?.maxOrder || 0);
}

// TASKS
export async function createTask(listId: string, projectId: string, title: string): Promise<Task> {
  const id = uuidv4();
  const createdAt = Date.now();
  const order = await getMaxTaskOrder(listId) + 1;
  const task: Task = { id, listId, projectId, title, completed: false, createdAt, completedAt: null, order };
  await db.runAsync(
    'INSERT INTO tasks (id, listId, projectId, title, completed, createdAt, completedAt, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, listId, projectId, title, 0, createdAt, null, order]
  );
  return task;
}

export async function getTasksByList(listId: string): Promise<Task[]> {
  const result = await db.getAllAsync(
    'SELECT * FROM tasks WHERE listId = ? ORDER BY completed ASC, "order" ASC',
    [listId]
  );
  return (result as any[]).map(task => ({
    ...task,
    completed: task.completed === 1,
  }));
}

export async function toggleTask(id: string): Promise<void> {
  const task = await db.getFirstAsync('SELECT completed FROM tasks WHERE id = ?', [id]);
  const completed = (task as any).completed === 0;
  const completedAt = completed ? Date.now() : null;
  await db.runAsync(
    'UPDATE tasks SET completed = ?, completedAt = ? WHERE id = ?',
    [completed ? 1 : 0, completedAt, id]
  );
}

export async function deleteTask(id: string): Promise<void> {
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

async function getMaxTaskOrder(listId: string): Promise<number> {
  const result = await db.getFirstAsync(
    'SELECT MAX("order") as maxOrder FROM tasks WHERE listId = ?',
    [listId]
  );
  return ((result as any)?.maxOrder || 0);
}

// EXPORT/IMPORT
export async function exportData(): Promise<string> {
  const projects = await getProjects();
  const lists: Record<string, List[]> = {};
  const tasks: Record<string, Task[]> = {};
  for (const project of projects) {
    lists[project.id] = await getListsByProject(project.id);
    for (const list of lists[project.id]) {
      tasks[list.id] = await getTasksByList(list.id);
    }
  }
  return JSON.stringify({ projects, lists, tasks }, null, 2);
}

export async function importData(jsonString: string): Promise<void> {
  try {
    const data = JSON.parse(jsonString);
    const { projects, lists, tasks } = data;
    await db.execAsync('DELETE FROM tasks; DELETE FROM lists; DELETE FROM projects;');
    for (const project of projects) {
      await db.runAsync(
        'INSERT INTO projects (id, name, color, createdAt, "order") VALUES (?, ?, ?, ?, ?)',
        [project.id, project.name, project.color, project.createdAt, project.order]
      );
    }
    for (const projectId in lists) {
      for (const list of lists[projectId]) {
        await db.runAsync(
          'INSERT INTO lists (id, projectId, name, "order") VALUES (?, ?, ?, ?)',
          [list.id, list.projectId, list.name, list.order]
        );
      }
    }
    for (const listId in tasks) {
      for (const task of tasks[listId]) {
        await db.runAsync(
          'INSERT INTO tasks (id, listId, projectId, title, completed, createdAt, completedAt, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [task.id, task.listId, task.projectId, task.title, task.completed ? 1 : 0, task.createdAt, task.completedAt, task.order]
        );
      }
    }
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
}
