import { supabase } from "@/lib/supabase/client";
import type { ApiResponse } from "@/lib/supabase/api-types";
import { toApiError } from "@/lib/supabase/api-types";
import type { FileObject } from "@supabase/storage-js";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  path: string;
  fullUrl: string;
  metadata: {
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
}

const BUCKET_NAME = import.meta.env.VITE_RESOURCE_FILE_BUCKET;
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

/**
 * Upload a file to Supabase Storage
 * Returns the file path and metadata
 */
export async function uploadFile(
  file: File,
  therapistId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<ApiResponse<UploadResult>> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      data: null,
      error: {
        message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      },
    };
  }

  // Generate unique file path
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${therapistId}/${timestamp}_${sanitizedFileName}`;

  try {
    // Upload file with progress tracking
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return { data: null, error: toApiError(error as unknown) };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    // Supabase Storage upload API doesn't currently provide upload progress events.
    // Keep this callback for API compatibility; we can only report completion.
    onProgress?.({ loaded: file.size, total: file.size, percentage: 100 });

    return {
      data: {
        path: data.path,
        fullUrl: publicUrl,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Upload failed",
      },
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  filePath: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    return { data: null, error: toApiError(error as unknown) };
  }

  return { data: null, error: null };
}

/**
 * Get a public URL for a file
 */
export function getFileUrl(filePath: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return publicUrl;
}

/**
 * Get file metadata from storage
 */
export async function getFileMetadata(
  filePath: string
): Promise<ApiResponse<FileObject | null>> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(filePath.substring(0, filePath.lastIndexOf("/")), {
      search: filePath.substring(filePath.lastIndexOf("/") + 1),
    });

  if (error) {
    return { data: null, error: toApiError(error as unknown) };
  }

  return { data: data?.[0] ?? null, error: null };
}

/**
 * Calculate total storage used by a therapist
 */
export async function getStorageUsage(
  therapistId: string
): Promise<ApiResponse<{ totalBytes: number; fileCount: number }>> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(therapistId, {
      limit: 1000,
      offset: 0,
    });

  if (error) {
    return { data: null, error: toApiError(error as unknown) };
  }

  const totalBytes = data?.reduce((sum, file) => sum + (file.metadata?.size ?? 0), 0) ?? 0;
  const fileCount = data?.length ?? 0;

  return {
    data: { totalBytes, fileCount },
    error: null,
  };
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.replace("/*", ""));
    }
    return file.type === type;
  });
}

/**
 * Get file icon based on mime type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎥";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📽️";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "📦";
  return "📎";
}

