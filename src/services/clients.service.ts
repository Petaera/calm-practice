import { supabase } from "@/lib/supabase/client";
import type {
  Client,
  ClientInsert,
  ClientUpdate,
  ClientStatus,
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

export interface ClientFilters {
  status?: ClientStatus;
  search?: string;
}

export interface ClientQueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: ClientFilters;
}

/**
 * Fetch all clients for a therapist with optional filtering and pagination
 */
export async function getClients(
  therapistId: string,
  options?: ClientQueryOptions
): Promise<ApiResponse<PaginatedResponse<Client>>> {
  let query = supabase
    .from("clients")
    .select("*", { count: "exact" })
    .eq("therapist_id", therapistId);

  // Apply filters
  if (options?.filters?.status) {
    query = query.eq("status", options.filters.status);
  }
  if (options?.filters?.search) {
    query = query.or(
      `full_name.ilike.%${options.filters.search}%,email.ilike.%${options.filters.search}%,client_id.ilike.%${options.filters.search}%`
    );
  }

  // Apply sorting
  if (options?.sort) {
    query = query.order(options.sort.column, {
      ascending: options.sort.ascending ?? true,
    });
  } else {
    query = query.order("created_at", { ascending: false });
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
      data ?? [],
      count ?? 0,
      options?.pagination ?? { page: 1, pageSize: 10 }
    ),
    error: null,
  };
}

/**
 * Fetch a single client by ID
 */
export async function getClientById(
  clientId: string
): Promise<ApiResponse<Client>> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Create a new client
 */
export async function createClient(
  client: ClientInsert
): Promise<ApiResponse<Client>> {
  const { data, error } = await supabase
    .from("clients")
    .insert(client)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Update an existing client
 */
export async function updateClient(
  clientId: string,
  updates: ClientUpdate
): Promise<ApiResponse<Client>> {
  const { data, error } = await supabase
    .from("clients")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", clientId)
    .select()
    .single();

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data, error: null };
}

/**
 * Delete a client (soft delete by setting status to Closed)
 */
export async function archiveClient(
  clientId: string
): Promise<ApiResponse<Client>> {
  return updateClient(clientId, { status: "Closed" });
}

/**
 * Unarchive a client (restore by setting status back to Active)
 */
export async function unarchiveClient(
  clientId: string
): Promise<ApiResponse<Client>> {
  return updateClient(clientId, { status: "Active" });
}

/**
 * Permanently delete a client
 */
export async function deleteClient(
  clientId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  return { data: null, error: null };
}

/**
 * Get client count by status
 */
export async function getClientCountByStatus(
  therapistId: string
): Promise<ApiResponse<Record<ClientStatus, number>>> {
  const { data, error } = await supabase
    .from("clients")
    .select("status")
    .eq("therapist_id", therapistId);

  if (error) {
    return { data: null, error: toApiError(error) };
  }

  const counts: Record<ClientStatus, number> = {
    Active: 0,
    "On-hold": 0,
    Closed: 0,
    Inactive: 0,
  };

  data?.forEach((client) => {
    const status = client.status as ClientStatus;
    if (status && counts[status] !== undefined) {
      counts[status]++;
    }
  });

  return { data: counts, error: null };
}

