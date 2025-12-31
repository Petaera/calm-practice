import { supabase } from "@/lib/supabase/client";
import type {
  Task,
  TaskInsert,
  TaskUpdate,
  TaskStatus,
  TaskPriority,
  Client,
} from "@/lib/supabase/types";
import type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  SortParams,
} from "@/lib/supabase/api-types";
import {
  toApiError,
  getPaginationRange,
  createPaginatedResponse,
} from "@/lib/supabase/api-types";

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  clientId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  category?: string;
}

export interface TaskQueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: TaskFilters;
}

export interface TaskWithClient extends Task {
  clients: Pick<Client, "id" | "full_name"> | null;
}

/**
 * Fetch all tasks for a therapist with optional filtering and pagination
 */
export async function getTasks(
  therapistId: string,
  options?: TaskQueryOptions
): Promise<ApiResponse<PaginatedResponse<TaskWithClient>>> {
  let query = supabase
    .from("tasks")
    .select("*, clients(id, full_name)", { count: "exact" })
    .eq("therapist_id", therapistId);

  // Apply filters
  if (options?.filters?.status) {
    query = query.eq("status", options.filters.status);
  }
  if (options?.filters?.priority) {
    query = query.eq("priority", options.filters.priority);
  }
  if (options?.filters?.clientId) {
    query = query.eq("client_id", options.filters.clientId);
  }
  if (options?.filters?.category) {
    query = query.eq("category", options.filters.category);
  }
  if (options?.filters?.dueDateFrom) {
    query = query.gte("due_date", options.filters.dueDateFrom);
  }
  if (options?.filters?.dueDateTo) {
    query = query.lte("due_date", options.filters.dueDateTo);
  }

  // Apply sorting
  if (options?.sort) {
    query = query.order(options.sort.column, {
      ascending: options.sort.ascending ?? true,
    });
  } else {
    query = query.order("due_date", { ascending: true });
  }

  // Apply pagination
  if (options?.pagination) {
    const { from, to } = getPaginationRange(options.pagination);
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return {
    data: createPaginatedResponse(
      (data as TaskWithClient[]) ?? [],
      count ?? 0,
      options?.pagination ?? { page: 1, pageSize: 10 }
    ),
    error: null,
  };
}

/**
 * Fetch pending and overdue tasks
 */
export async function getPendingTasks(
  therapistId: string,
  limit = 10
): Promise<ApiResponse<TaskWithClient[]>> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("tasks")
    .select("*, clients(id, full_name)")
    .eq("therapist_id", therapistId)
    .in("status", ["pending", "in_progress"])
    .or(`due_date.is.null,due_date.lte.${today}`)
    .order("priority", { ascending: false })
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as TaskWithClient[], error: null };
}

/**
 * Fetch a single task by ID
 */
export async function getTaskById(
  taskId: string
): Promise<ApiResponse<TaskWithClient>> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, clients(id, full_name)")
    .eq("id", taskId)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: data as TaskWithClient, error: null };
}

/**
 * Create a new task
 */
export async function createTask(
  task: TaskInsert
): Promise<ApiResponse<Task>> {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Update an existing task
 */
export async function updateTask(
  taskId: string,
  updates: TaskUpdate
): Promise<ApiResponse<Task>> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Mark task as completed
 */
export async function completeTask(
  taskId: string
): Promise<ApiResponse<Task>> {
  return updateTask(taskId, {
    status: "completed",
    completed_at: new Date().toISOString(),
  });
}

/**
 * Mark task as in progress
 */
export async function startTask(taskId: string): Promise<ApiResponse<Task>> {
  return updateTask(taskId, { status: "in_progress" });
}

/**
 * Cancel a task
 */
export async function cancelTask(taskId: string): Promise<ApiResponse<Task>> {
  return updateTask(taskId, { status: "cancelled" });
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<ApiResponse<null>> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Get task counts by status
 */
export async function getTaskCountByStatus(
  therapistId: string
): Promise<ApiResponse<Record<TaskStatus, number>>> {
  const { data, error } = await supabase
    .from("tasks")
    .select("status")
    .eq("therapist_id", therapistId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  const counts: Record<TaskStatus, number> = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };

  data?.forEach((task) => {
    const status = task.status as TaskStatus;
    if (status && counts[status] !== undefined) {
      counts[status]++;
    }
  });

  return { data: counts, error: null };
}

