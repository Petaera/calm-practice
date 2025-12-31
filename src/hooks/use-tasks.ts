import { useCallback } from "react";
import {
  useSupabaseQuery,
  useSupabaseMutation,
} from "./use-supabase-query";
import {
  getTasks,
  getPendingTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  startTask,
  cancelTask,
  deleteTask,
  getTaskCountByStatus,
} from "@/services/tasks.service";
import type { TaskQueryOptions, TaskWithClient } from "@/services/tasks.service";
import type {
  Task,
  TaskInsert,
  TaskUpdate,
  TaskStatus,
  PaginatedResponse,
} from "@/lib/supabase";

/**
 * Hook to fetch paginated tasks with filtering
 */
export function useTasks(
  therapistId: string | undefined,
  options?: TaskQueryOptions
) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getTasks(therapistId, options);
  }, [therapistId, options]);

  return useSupabaseQuery<PaginatedResponse<TaskWithClient>>(
    queryFn,
    [therapistId, JSON.stringify(options)],
    { enabled: !!therapistId }
  );
}

/**
 * Hook to fetch pending and overdue tasks
 */
export function usePendingTasks(therapistId: string | undefined, limit = 10) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getPendingTasks(therapistId, limit);
  }, [therapistId, limit]);

  return useSupabaseQuery<TaskWithClient[]>(queryFn, [therapistId, limit], {
    enabled: !!therapistId,
  });
}

/**
 * Hook to fetch a single task by ID
 */
export function useTask(taskId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!taskId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getTaskById(taskId);
  }, [taskId]);

  return useSupabaseQuery<TaskWithClient>(queryFn, [taskId], {
    enabled: !!taskId,
  });
}

/**
 * Hook for creating a new task
 */
export function useCreateTask() {
  const mutationFn = useCallback((task: TaskInsert) => {
    return createTask(task);
  }, []);

  return useSupabaseMutation<Task, TaskInsert>(mutationFn);
}

/**
 * Hook for updating a task
 */
export function useUpdateTask() {
  const mutationFn = useCallback(
    ({ taskId, updates }: { taskId: string; updates: TaskUpdate }) => {
      return updateTask(taskId, updates);
    },
    []
  );

  return useSupabaseMutation<Task, { taskId: string; updates: TaskUpdate }>(
    mutationFn
  );
}

/**
 * Hook for completing a task
 */
export function useCompleteTask() {
  const mutationFn = useCallback((taskId: string) => {
    return completeTask(taskId);
  }, []);

  return useSupabaseMutation<Task, string>(mutationFn);
}

/**
 * Hook for starting a task
 */
export function useStartTask() {
  const mutationFn = useCallback((taskId: string) => {
    return startTask(taskId);
  }, []);

  return useSupabaseMutation<Task, string>(mutationFn);
}

/**
 * Hook for canceling a task
 */
export function useCancelTask() {
  const mutationFn = useCallback((taskId: string) => {
    return cancelTask(taskId);
  }, []);

  return useSupabaseMutation<Task, string>(mutationFn);
}

/**
 * Hook for deleting a task
 */
export function useDeleteTask() {
  const mutationFn = useCallback((taskId: string) => {
    return deleteTask(taskId);
  }, []);

  return useSupabaseMutation<null, string>(mutationFn);
}

/**
 * Hook to fetch task counts by status
 */
export function useTaskCountByStatus(therapistId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getTaskCountByStatus(therapistId);
  }, [therapistId]);

  return useSupabaseQuery<Record<TaskStatus, number>>(queryFn, [therapistId], {
    enabled: !!therapistId,
  });
}

