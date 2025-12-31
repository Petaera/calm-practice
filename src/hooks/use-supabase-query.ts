import { useState, useEffect, useCallback } from "react";
import type { ApiError } from "@/lib/supabase/api-types";

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export interface UseQueryOptions {
  enabled?: boolean;
}

/**
 * Generic hook for data fetching with Supabase
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: ApiError | null }>,
  deps: React.DependencyList = [],
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result.data);
      }
    } catch (e) {
      setError({
        message: e instanceof Error ? e.message : "An unknown error occurred",
      });
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, enabled]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return { data, isLoading, error, refetch: fetchData };
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  data: TData | null;
  isLoading: boolean;
  error: ApiError | null;
  reset: () => void;
}

/**
 * Generic hook for mutations with Supabase
 */
export function useSupabaseMutation<TData, TVariables>(
  mutationFn: (
    variables: TVariables
  ) => Promise<{ data: TData | null; error: ApiError | null }>
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        if (result.error) {
          setError(result.error);
          setData(null);
          return null;
        } else {
          setData(result.data);
          return result.data;
        }
      } catch (e) {
        const apiError: ApiError = {
          message: e instanceof Error ? e.message : "An unknown error occurred",
        };
        setError(apiError);
        setData(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, data, isLoading, error, reset };
}

