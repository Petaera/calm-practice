import type { ApiResponse } from "@/lib/supabase/api-types";

export interface LinkPreview {
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  url: string;
}

/**
 * Fetch metadata for a URL using Open Graph and meta tags
 * This is a client-side implementation - for production, consider using a backend service
 */
export async function fetchLinkPreview(
  url: string
): Promise<ApiResponse<LinkPreview>> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    
    // For YouTube, extract video info
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      return fetchYouTubePreview(url);
    }

    // For Vimeo
    if (urlObj.hostname.includes("vimeo.com")) {
      return fetchVimeoPreview(url);
    }

    // Generic fallback - return basic info
    return {
      data: {
        url,
        title: urlObj.hostname,
        description: "External link",
        siteName: urlObj.hostname,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : "Invalid URL",
      },
    };
  }
}

/**
 * Fetch YouTube video metadata
 */
async function fetchYouTubePreview(
  url: string
): Promise<ApiResponse<LinkPreview>> {
  try {
    const urlObj = new URL(url);
    let videoId: string | null = null;

    // Extract video ID from different YouTube URL formats
    if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes("youtube.com")) {
      videoId = urlObj.searchParams.get("v");
    }

    if (!videoId) {
      return {
        data: null,
        error: { message: "Invalid YouTube URL" },
      };
    }

    // Use oEmbed API (no key required)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      url
    )}&format=json`;

    const response = await fetch(oembedUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch YouTube metadata");
    }

    const data = await response.json();

    return {
      data: {
        url,
        title: data.title || "YouTube Video",
        description: `By ${data.author_name}`,
        image: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        siteName: "YouTube",
        favicon: "https://www.youtube.com/favicon.ico",
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : "Failed to fetch YouTube preview",
      },
    };
  }
}

/**
 * Fetch Vimeo video metadata
 */
async function fetchVimeoPreview(
  url: string
): Promise<ApiResponse<LinkPreview>> {
  try {
    // Use Vimeo oEmbed API
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
      url
    )}`;

    const response = await fetch(oembedUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch Vimeo metadata");
    }

    const data = await response.json();

    return {
      data: {
        url,
        title: data.title || "Vimeo Video",
        description: `By ${data.author_name}`,
        image: data.thumbnail_url,
        siteName: "Vimeo",
        favicon: "https://vimeo.com/favicon.ico",
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : "Failed to fetch Vimeo preview",
      },
    };
  }
}

/**
 * Validate if a URL is accessible
 */
export async function validateUrl(url: string): Promise<boolean> {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return "";
  }
}

/**
 * Get favicon URL for a domain
 */
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return "";
  }
}

/**
 * Detect if URL is a video platform
 */
export function isVideoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return (
      hostname.includes("youtube.com") ||
      hostname.includes("youtu.be") ||
      hostname.includes("vimeo.com") ||
      hostname.includes("dailymotion.com") ||
      hostname.includes("wistia.com")
    );
  } catch {
    return false;
  }
}

