import { useCallback, useMemo } from "react";
import {
  useSupabaseQuery,
  useSupabaseMutation,
} from "./use-supabase-query";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  archiveClient,
  unarchiveClient,
  deleteClient,
  getClientCountByStatus,
} from "@/services/clients.service";
import type { ClientQueryOptions } from "@/services/clients.service";
import type {
  Client,
  ClientInsert,
  ClientUpdate,
  ClientStatus,
  PaginatedResponse,
} from "@/lib/supabase";

/**
 * Hook to fetch paginated clients with filtering
 */
export function useClients(
  therapistId: string | undefined,
  options?: ClientQueryOptions
) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getClients(therapistId, options);
  }, [therapistId, options]);

  return useSupabaseQuery<PaginatedResponse<Client>>(
    queryFn,
    [therapistId, JSON.stringify(options)],
    { enabled: !!therapistId }
  );
}

/**
 * Hook to fetch a single client by ID
 */
export function useClient(clientId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!clientId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getClientById(clientId);
  }, [clientId]);

  return useSupabaseQuery<Client>(queryFn, [clientId], {
    enabled: !!clientId,
  });
}

/**
 * Hook for creating a new client
 */
export function useCreateClient() {
  const mutationFn = useCallback((client: ClientInsert) => {
    return createClient(client);
  }, []);

  return useSupabaseMutation<Client, ClientInsert>(mutationFn);
}

/**
 * Hook for updating a client
 */
export function useUpdateClient() {
  const mutationFn = useCallback(
    ({ clientId, updates }: { clientId: string; updates: ClientUpdate }) => {
      return updateClient(clientId, updates);
    },
    []
  );

  return useSupabaseMutation<
    Client,
    { clientId: string; updates: ClientUpdate }
  >(mutationFn);
}

/**
 * Hook for archiving a client
 */
export function useArchiveClient() {
  const mutationFn = useCallback((clientId: string) => {
    return archiveClient(clientId);
  }, []);

  return useSupabaseMutation<Client, string>(mutationFn);
}

/**
 * Hook for unarchiving a client
 */
export function useUnarchiveClient() {
  const mutationFn = useCallback((clientId: string) => {
    return unarchiveClient(clientId);
  }, []);

  return useSupabaseMutation<Client, string>(mutationFn);
}

/**
 * Hook for deleting a client
 */
export function useDeleteClient() {
  const mutationFn = useCallback((clientId: string) => {
    return deleteClient(clientId);
  }, []);

  return useSupabaseMutation<boolean, string>(mutationFn);
}

/**
 * Hook to fetch client counts by status
 */
export function useClientCountByStatus(therapistId: string | undefined) {
  const queryFn = useCallback(() => {
    if (!therapistId) {
      return Promise.resolve({ data: null, error: null });
    }
    return getClientCountByStatus(therapistId);
  }, [therapistId]);

  return useSupabaseQuery<Record<ClientStatus, number>>(
    queryFn,
    [therapistId],
    { enabled: !!therapistId }
  );
}

