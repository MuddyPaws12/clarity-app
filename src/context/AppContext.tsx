import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as db from '../db/database';
import { Project, List, Task } from '../types/models';

interface AppContextType {
  projects: Project[];
  lists: Record<string, List[]>;
  tasks: Record<string, Task[]>;
  loading: boolean;
  createProject: (name: string, color?: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createList: (projectId: string, name: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  createTask: (listId: string, projectId: string, title: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (listId: string, taskIds: string[]) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonString: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [lists, setLists] = useState<Record<string, List[]>>({});
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      await db.initializeDatabase();
      await refreshAll();
      setLoading(false);
    };
    initApp();
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const loadedProjects = await db.getProjects();
      setProjects(loadedProjects);
      const newLists: Record<string, List[]> = {};
      const newTasks: Record<string, Task[]> = {};
      for (const project of loadedProjects) {
        const projectLists = await db.getListsByProject(project.id);
        newLists[project.id] = projectLists;
        for (const list of projectLists) {
          const listTasks = await db.getTasksByList(list.id);
          newTasks[list.id] = listTasks;
        }
      }
      setLists(newLists);
      setTasks(newTasks);
    } catch (error) {
      console.error('Error refreshing app state:', error);
    }
  }, []);

  const createProject = useCallback(async (name: string, color?: string) => {
    await db.createProject(name, color);
    await refreshAll();
  }, [refreshAll]);

  const deleteProject = useCallback(async (id: string) => {
    await db.deleteProject(id);
    await refreshAll();
  }, [refreshAll]);

  const createList = useCallback(async (projectId: string, name: string) => {
    await db.createList(projectId, name);
    await refreshAll();
  }, [refreshAll]);

  const deleteList = useCallback(async (id: string) => {
    await db.deleteList(id);
    await refreshAll();
  }, [refreshAll]);

  const createTask = useCallback(async (listId: string, projectId: string, title: string) => {
    await db.createTask(listId, projectId, title);
    await refreshAll();
  }, [refreshAll]);

  const toggleTask = useCallback(async (id: string) => {
    await db.toggleTask(id);
    await refreshAll();
  }, [refreshAll]);

  const deleteTask = useCallback(async (id: string) => {
    await db.deleteTask(id);
    await refreshAll();
  }, [refreshAll]);

  const reorderTasks = useCallback(async (listId: string, taskIds: string[]) => {
    for (let i = 0; i < taskIds.length; i++) {
      await db.runAsync('UPDATE tasks SET "order" = ? WHERE id = ?', [i, taskIds[i]]);
    }
    await refreshAll();
  }, [refreshAll]);

  const exportDataHandler = useCallback(async () => {
    return await db.exportData();
  }, []);

  const importDataHandler = useCallback(async (jsonString: string) => {
    await db.importData(jsonString);
    await refreshAll();
  }, [refreshAll]);

  return (
    <AppContext.Provider
      value={{
        projects,
        lists,
        tasks,
        loading,
        createProject,
        deleteProject,
        createList,
        deleteList,
        createTask,
        toggleTask,
        deleteTask,
        reorderTasks,
        exportData: exportDataHandler,
        importData: importDataHandler,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
